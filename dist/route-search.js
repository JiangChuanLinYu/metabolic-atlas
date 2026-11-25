
function normalizeQuery(value){return value.toLowerCase().replace(/α/g,'alpha').replace(/β/g,'beta').replace(/[⁺]/g,'+').replace(/[\s_–−-]/g,'');}
function queryEntries(){
 const names=new Set([...Object.keys(courseMetabolites),...courseReactions.flatMap(r=>r.metabolites),...routeEdges.flatMap(e=>[e.from,e.to])]);
 return [...[...names].map(name=>({kind:'metabolite',name,id:name,aliases:compoundAliases[name]||[]})),...courseReactions.map(r=>({kind:'enzyme',name:r.name,id:r.id,aliases:enzymeAliases[r.id]||[]}))];
}
function resolveQuery(value){const key=normalizeQuery(value);return queryEntries().filter(e=>[e.name,...e.aliases].some(n=>normalizeQuery(n)===key));}
function findRoutes(from,to,edges,limit=200,budget=100000){
 const adjacency=new Map();for(const e of edges){if(!adjacency.has(e.from))adjacency.set(e.from,[]);adjacency.get(e.from).push(e);}
 // Prune nodes that cannot reach the destination before enumerating simple paths.
 const reachable=new Set([to]);let changed=true;
 while(changed){changed=false;for(const e of edges)if(reachable.has(e.to)&&!reachable.has(e.from)){reachable.add(e.from);changed=true;}}
 const routes=[];let visits=0,truncated=false;
 function walk(node,path,seen){
  if(++visits>budget){truncated=true;return;}
  if(node===to){if(routes.length===limit){truncated=true;return;}routes.push(path);return;}
  for(const e of adjacency.get(node)||[]){if(truncated)return;if(seen.has(e.to)||!reachable.has(e.to))continue;const next=new Set(seen);next.add(e.to);walk(e.to,[...path,e],next);}
 }
 if(from!==to)walk(from,[],new Set([from]));
 routes.sort((a,b)=>a.length-b.length);return {routes,truncated};
}
function routeObjectIds(routes){
 const ids=new Set();
 for(const edge of routes.flat()){
  courseReactions.find(r=>r.id===edge.reaction)?.objects.forEach(id=>ids.add(id));
  for(const name of [edge.from,edge.to])courseMetabolites[name]?.ids.forEach(id=>ids.add(id));
 }
 return [...ids];
}
function clearRouteResults(){document.querySelectorAll('.query-result').forEach(el=>el.classList.remove('query-result'));}
function highlightRoutes(routes){
 const ids=routeObjectIds(routes);clearRouteResults();
 ids.forEach(id=>document.querySelector('#atlas-map [data-id="'+id+'"]')?.classList.add('query-result'));
 if(!ids.length)return;
 const chosen=new Set(ids),objects=atlasData.objects.filter(o=>chosen.has(o.id));
 const left=Math.min(...objects.map(o=>o.x)),top=Math.min(...objects.map(o=>o.y));
 const right=Math.max(...objects.map(o=>o.x+o.width)),bottom=Math.max(...objects.map(o=>o.y+o.height));
 const viewport=document.querySelector('.atlas-viewport'),map=document.getElementById('atlas-map');
 const scale=Math.min((viewport.clientWidth-64)/Math.max(1,right-left),(viewport.clientHeight-64)/Math.max(1,bottom-top));
 setAtlasZoom(scale*atlasData.width/viewport.clientWidth);
 const actual=map.clientWidth/atlasData.width;
 viewport.scrollTo({left:map.offsetLeft+(left+right)/2*actual-viewport.clientWidth/2,top:map.offsetTop+(top+bottom)/2*actual-viewport.clientHeight/2});
}
function submitRouteQuery(value,target=''){
 const result=document.getElementById('route-results');result.replaceChildren();result.hidden=false;
 clearRouteResults();
 const parts=target.trim()?[value.trim(),target.trim()]:[value.trim()];
 if(!value.trim()||parts.length>2||parts.some(p=>!p.trim())){result.append(courseNode('p','请先填写物质或酶；查找路径时，再填写目标物质。'));return;}
 const choose=(index,selected)=>{
  if(index===parts.length){if(selected.length===1){const e=selected[0];e.kind==='enzyme'?showCourseReaction(e.id):showCourseMetabolite(e.id);result.hidden=true;}else showRoutes(selected[0],selected[1]);return;}
  const candidates=resolveQuery(parts[index]);
  if(!candidates.length){result.append(courseNode('p','未找到：'+parts[index]+'。请尝试英文全名或下拉建议。'));return;}
  if(candidates.length===1){choose(index+1,[...selected,candidates[0]]);return;}
  result.replaceChildren(courseNode('p',parts[index]+' 有多个含义，请选择：'));
  for(const candidate of candidates)result.append(courseButton(candidate.name+(candidate.kind==='enzyme'?'（酶）':'（物质）'),()=>{result.replaceChildren();choose(index+1,[...selected,candidate]);}));
 };
 function showRoutes(a,b){
  if(a.kind!=='metabolite'||b.kind!=='metabolite'){result.append(courseNode('p','两个端点请填写底物或产物。查询酶详情时，只输入一个酶名。'));return;}
  if(a.id===b.id){result.append(courseNode('p','起点与终点相同，请选择两个不同物质。'));return;}
  const {routes,truncated}=findRoutes(a.id,b.id,routeEdges.filter(e=>available(e.pathway)));
  result.append(courseNode('strong',a.name+' → '+b.name));
  result.append(courseNode('p',state.cell+' · 已收录的有向反应连接；不重复经过同一物质。共 '+routes.length+' 条'+(truncated?'（达到搜索上限，结果不完整）':'')+'。'));
  if(!routes.length){result.append(courseNode('p',truncated?'搜索达到上限，尚未找到结果，请缩小起点和终点范围。':'当前细胞的已收录反应中未找到连接，不代表生物学上不存在。'));return;}
  result.append(courseNode('p','按底物和产物连接查询，不把 ATP、NADH 等辅因子当作捷径；结果不表示这些反应能同时运行。'));
  highlightRoutes(routes);
  result.append(courseButton('显示全部结果',()=>highlightRoutes(routes)),courseButton('清除查询',()=>{clearRouteResults();result.replaceChildren();result.hidden=true;}));
  for(const [i,route] of routes.entries()){
   const section=courseNode('details');section.append(courseNode('summary',(i+1)+'. '+route.length+' 条反应记录'));
   section.append(courseNode('p',[a.name,...route.map(e=>e.to)].join(' → ')));
   section.append(courseButton('在图中显示此路径',()=>highlightRoutes([route])));
   for(const edge of route){const reaction=courseReactions.find(r=>r.id===edge.reaction);section.append(courseButton(reaction.name+(reaction.summary?'（多步）':''),()=>showCourseReaction(reaction.id)));}
   const undrawn=[...new Set(route.filter(e=>!courseReactions.find(r=>r.id===e.reaction).objects.length).map(e=>courseReactions.find(r=>r.id===e.reaction).name))];
   if(undrawn.length)section.append(courseNode('p','总图尚未绘制：'+undrawn.join('、')));
   result.append(section);
  }
 }
 choose(0,[]);
}
function initRouteSearch(){
 const form=document.getElementById('route-search');
 const source=document.getElementById('route-query'),target=document.getElementById('route-target');
 const updateLabel=()=>{document.getElementById('route-submit').textContent=target.value.trim()?'查找路径':'查看详情';};
 target.addEventListener('input',updateLabel);updateLabel();
 form.onsubmit=e=>{e.preventDefault();submitRouteQuery(source.value,target.value);};
 const suggestions=document.getElementById('route-suggestions');
 const names=new Set(queryEntries().flatMap(e=>[e.name,...e.aliases]));
 for(const name of names){const option=document.createElement('option');option.value=name;suggestions.append(option);}
 // Context changes invalidate results and their markings.
 document.getElementById('cell').addEventListener('change',resetRouteSearch);
 document.getElementById('cell').addEventListener('input',resetRouteSearch);
 document.getElementById('groups').addEventListener('click',resetRouteSearch);
}
function resetRouteSearch(){clearRouteResults();const result=document.getElementById('route-results');result.replaceChildren();result.hidden=true;}
initRouteSearch();
