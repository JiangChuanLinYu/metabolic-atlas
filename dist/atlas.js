const atlasSelection = new Set();
let atlasHasSavedSelection=false;
let atlasSelectAllMode=false;
try{atlasSelectAllMode=localStorage.getItem('metabolic-atlas-select-all')==='true';}catch{}
try { const saved=JSON.parse(localStorage.getItem('metabolic-atlas-selection')); if(Array.isArray(saved)){atlasHasSavedSelection=true;saved.forEach(p=>atlasSelection.add(p));} } catch {}
let atlasReady=false;
let atlasSelectionKey=null;
function selectedAtlasBounds(objects, selection){
 const items=objects.filter(o=>!o.background&&!o.decorative&&o.pathways.some(p=>selection.has(p)));
 if(!items.length)return null;
 const left=Math.min(...items.map(o=>o.x)),top=Math.min(...items.map(o=>o.y));
 return {left,top,width:Math.max(...items.map(o=>o.x+o.width))-left,height:Math.max(...items.map(o=>o.y+o.height))-top};
}
function focusAtlasSelection(){
 const viewport=document.querySelector('.atlas-viewport');
 const bounds=selectedAtlasBounds(atlasData.objects,atlasSelection);
 if(!bounds){fitAtlas();return;}
 const padding=32;
 const scale=Math.min(Math.max(1,viewport.clientWidth-padding*2)/Math.max(1,bounds.width),Math.max(1,viewport.clientHeight-padding*2)/Math.max(1,bounds.height));
 setAtlasZoom(scale*atlasData.width/viewport.clientWidth);
 const actualScale=document.getElementById('atlas-map').clientWidth/atlasData.width;
 viewport.scrollTo({left:document.getElementById('atlas-map').offsetLeft+(bounds.left+bounds.width/2)*actualScale-viewport.clientWidth/2,top:document.getElementById('atlas-map').offsetTop+(bounds.top+bounds.height/2)*actualScale-viewport.clientHeight/2,behavior:'auto'});
}
function prepareAtlasContextChange(){
 // Evaluate against the OLD context before changing state. This also recognizes
 // full selections restored from versions that did not save the all-mode flag.
 const paths=modules.flatMap(m=>[...m.core,...m.extra]).filter(available);
 atlasSelectAllMode=atlasSelectAllMode||(paths.length>0&&paths.every(p=>atlasSelection.has(p)));
}
function selectAllAtlasPaths(){
 atlasSelectAllMode=true;
 atlasSelection.clear();
 for(const module of modules)for(const path of [...module.core,...module.extra])if(available(path))atlasSelection.add(path);
 atlasSelectionKey=null;
 renderMain();renderNav();
}
function clearAtlasSelection(){atlasSelectAllMode=false;atlasSelection.clear();renderNav();renderMain();}
function toggleAtlasPath(path){
 if(!available(path))return;
 atlasSelectAllMode=false;
 if(atlasSelection.has(path))atlasSelection.delete(path);else atlasSelection.add(path);
 state.path=path;save();renderNav();renderMain();
}
function renderAtlas(){
 const host=document.getElementById('atlas-map');if(!host)return;
 if(!atlasReady){
  host.style.aspectRatio=`${atlasData.width} / ${atlasData.height}`;
  for(const item of atlasData.objects){
   const el=document.createElement(item.background||item.decorative||item.referenceLink?'div':'button');
   el.className='atlas-object'+(item.background?' atlas-background':item.decorative?' atlas-decoration':'');
   el.dataset.id=item.id;
   if(item.referenceLink){el.classList.add('atlas-reference-link');el.setAttribute('aria-hidden','true');}
   Object.assign(el.style,{left:100*item.x/atlasData.width+'%',top:100*item.y/atlasData.height+'%',width:100*item.width/atlasData.width+'%',height:100*item.height/atlasData.height+'%'});
   const img=document.createElement('img');img.src=item.asset+(item.assetVersion?'?v='+item.assetVersion:'');img.alt='';img.draggable=false;el.append(img);
   if(!item.background&&!item.decorative&&!item.referenceLink){
    el.title=(item.text||'Diagram object')+' — '+item.pathways.join(' / ');
    el.setAttribute('aria-label',el.title);
    el.onclick=event=>inspectAtlasClick(item,event);
   }
   host.append(el);
  }
  atlasReady=true;
 }
 if(atlasSelectAllMode){
  atlasSelection.clear();
  for(const module of modules)for(const path of [...module.core,...module.extra])if(available(path))atlasSelection.add(path);
 }else for(const p of atlasSelection)if(!available(p))atlasSelection.delete(p);
 try{localStorage.setItem('metabolic-atlas-selection',JSON.stringify([...atlasSelection]));localStorage.setItem('metabolic-atlas-select-all',String(atlasSelectAllMode));}catch{}
 for(const item of atlasData.objects){
  const el=host.querySelector(`[data-id="${item.id}"]`);
  const on=item.pathways.some(p=>atlasSelection.has(p));
  el.classList.toggle('highlighted',on);
  if(!item.background&&!item.decorative&&!item.referenceLink){
   const eligible=item.pathways.some(available);
   const status=on?'已高亮':eligible?'尚未选择所属通路':'当前细胞展示规则下不可选';
   el.title=(item.text||'图形对象')+' — '+item.pathways.join(' / ')+' — '+status;
   el.setAttribute('aria-label',(item.text||'Reaction object')+' — '+status+' — 查看结构、反应及调控');
  }
 }
 const selected=document.getElementById('atlas-selected');selected.replaceChildren();
 for(const p of atlasSelection){const b=document.createElement('button');b.textContent=p+' ×';b.onclick=()=>toggleAtlasPath(p);selected.append(b);}
 document.getElementById('atlas-selected-count').textContent=atlasSelection.size;
 if(!atlasSelection.size){const empty=document.createElement('span');empty.className='selection-empty';empty.textContent='尚未选择通路';selected.append(empty);}
 const notes=[...atlasSelection].map(p=>!atlasData.objects.some(o=>o.pathways.includes(p))?`${p}: not drawn in the supplied PPT.`:atlasData.coverage[p]&&atlasData.coverage[p]!=='Source diagram'?`${p}: ${atlasData.coverage[p]}`:'').filter(Boolean);
 document.getElementById('atlas-status').textContent=notes.join(' ')|| (atlasSelection.size?`${atlasSelection.size} pathways highlighted. Other objects are grey.`:'Select one or more pathways to highlight.');
 document.getElementById('atlas-clear').disabled=atlasSelection.size===0;
 document.getElementById('atlas-select-all').setAttribute('aria-pressed',String(atlasSelectAllMode));
 document.getElementById('atlas-select-all').title=atlasSelectAllMode?'已全选，切换细胞时自动更新':'选择当前细胞的全部可用通路';
 const key=JSON.stringify([...atlasSelection].sort());
 if(key!==atlasSelectionKey){atlasSelectionKey=key;requestAnimationFrame(focusAtlasSelection);}
}
function setAtlasZoom(value){
 const map=document.getElementById('atlas-map'),stage=document.getElementById('atlas-stage');
 const viewport=document.querySelector('.atlas-viewport');
 const zoom=Math.max(.25,Math.min(12,value));
 const width=viewport.clientWidth*zoom,height=width*atlasData.height/atlasData.width;
 const marginX=Math.max(800,viewport.clientWidth),marginY=Math.max(800,viewport.clientHeight);
 map.dataset.zoom=zoom;
 Object.assign(map.style,{width:width+'px',height:height+'px',left:marginX+'px',top:marginY+'px'});
 Object.assign(stage.style,{width:width+marginX*2+'px',height:height+marginY*2+'px'});
 document.getElementById('atlas-zoom-label').textContent=Math.round(zoom*100)+'%';
}
function zoomAtlasAt(value,x,y){
 const viewport=document.querySelector('.atlas-viewport'),map=document.getElementById('atlas-map');
 const width=map.clientWidth;
 if(!width)return;
 const localX=(viewport.scrollLeft+x-map.offsetLeft)/width;
 const localY=(viewport.scrollTop+y-map.offsetTop)/width;
 setAtlasZoom(value);
 viewport.scrollLeft=map.offsetLeft+localX*map.clientWidth-x;
 viewport.scrollTop=map.offsetTop+localY*map.clientWidth-y;
}
for(const [id,delta] of [['atlas-zoom-in',.5],['atlas-zoom-out',-.5]])document.getElementById(id).onclick=()=>{
 const viewport=document.querySelector('.atlas-viewport');
 zoomAtlasAt(Number(document.getElementById('atlas-map').dataset.zoom||1)+delta,viewport.clientWidth/2,viewport.clientHeight/2);
};
function fitAtlas(){
 const viewport=document.querySelector('.atlas-viewport');
 setAtlasZoom(Math.min((viewport.clientWidth-64)/viewport.clientWidth,(viewport.clientHeight-64)*atlasData.width/(viewport.clientWidth*atlasData.height)));
 const map=document.getElementById('atlas-map');
 viewport.scrollTo({left:map.offsetLeft+(map.clientWidth-viewport.clientWidth)/2,top:map.offsetTop+(map.clientHeight-viewport.clientHeight)/2});
}
document.getElementById('atlas-fit').onclick=fitAtlas;
document.getElementById('atlas-clear').onclick=clearAtlasSelection;
document.getElementById('atlas-select-all').onclick=selectAllAtlasPaths;
document.getElementById('atlas-focus').onclick=focusAtlasSelection;
if(!atlasHasSavedSelection)atlasSelection.add(state.path);
renderAtlas();renderNav();

if(typeof ResizeObserver!=='undefined'){
 let resizeFrame;
 new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(focusAtlasSelection);}).observe(document.querySelector('.atlas-viewport'));
}

// Canvas gestures keep the diagram point under the cursor fixed while zooming.
function setupAtlasGestures(viewport){
 let space=false,drag=null,suppressClick=false;
 const editable=target=>target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
 const blocked=()=>document.getElementById('course-dialog').open;
 function finish(){
  const current=drag;drag=null;
  viewport.classList.remove('is-panning');
  if(current&&viewport.hasPointerCapture(current.id))viewport.releasePointerCapture(current.id);
 }
 function reset(){space=false;finish();viewport.classList.remove('pan-ready');}
 document.addEventListener('keydown',event=>{
  if(event.code!=='Space'||editable(event.target)||blocked())return;
  event.preventDefault();space=true;viewport.classList.add('pan-ready');
 },true);
 document.addEventListener('keyup',event=>{
  if(event.code!=='Space')return;
  if(space)event.preventDefault();reset();
 },true);
 window.addEventListener('blur',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
 viewport.addEventListener('wheel',event=>{
  if(blocked())return;
  event.preventDefault();
  if(drag)return;
  const map=document.getElementById('atlas-map'),oldWidth=map.clientWidth;
  if(!oldWidth)return;
  const rect=viewport.getBoundingClientRect();
  const x=event.clientX-rect.left-viewport.clientLeft,y=event.clientY-rect.top-viewport.clientTop;
  const left=viewport.scrollLeft,top=viewport.scrollTop;
  const offsetX=map.offsetLeft||0,offsetY=map.offsetTop||0;
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);
  const zoom=Number(map.dataset.zoom||1)*Math.exp(-Math.max(-500,Math.min(500,delta))*.002);
  setAtlasZoom(zoom);
  const ratio=map.clientWidth/oldWidth;
  viewport.scrollLeft=(map.offsetLeft||0)+(left+x-offsetX)*ratio-x;
  viewport.scrollTop=(map.offsetTop||0)+(top+y-offsetY)*ratio-y;
 },{passive:false});
 viewport.addEventListener('pointerdown',event=>{
  if(drag)return;
  suppressClick=false;
  if(!space||event.button!==0||blocked())return;
  event.preventDefault();event.stopPropagation();suppressClick=true;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
  viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-panning');
 },true);
 viewport.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  event.preventDefault();
  viewport.scrollLeft=drag.left-(event.clientX-drag.x);
  viewport.scrollTop=drag.top-(event.clientY-drag.y);
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(type,event=>{
  if(drag&&event.pointerId===drag.id)finish();
 });
 viewport.addEventListener('click',event=>{
  if(!suppressClick)return;
  event.preventDefault();event.stopImmediatePropagation();suppressClick=false;
 },true);
}
setupAtlasGestures(document.querySelector('.atlas-viewport'));
