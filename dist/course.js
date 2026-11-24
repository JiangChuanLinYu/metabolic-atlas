function regulationLabel(type){return ({inhibits:'抑制',activates:'激活',controls:'调节',switches:'改变两种酶活性','opposes inhibition':'减弱抑制'})[type]||type;}
function courseNode(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
function sourceSlide(ref){if(ref[0]==='Atlas')return {image:'assets/atlas/reference.png?v='+atlasData.referenceVersion};return courseSlides.find(s=>s.chapter===ref[0]&&s.slide===ref[1]);}
function courseSource(ref,parent,expanded=false){
 const slide=sourceSlide(ref);if(!slide)return;
 const section=courseNode('details');section.open=expanded;
 section.append(courseNode('summary',ref[0]==='Atlas'?'查看最新通路原图':`${ref[0]} · Slide ${ref[1]} — 查看课件原图`));
 const link=courseNode('a');link.href=slide.image;link.target='_blank';link.rel='noopener';
 const img=courseNode('img');img.src=slide.image;img.alt=`${ref[0]} slide ${ref[1]}`;img.loading='lazy';link.append(img);section.append(link);
 parent.append(section);
}
function courseButton(text,handler){const b=courseNode('button',text);b.onclick=handler;return b;}
function clearReactionMark(){
 document.querySelectorAll('.reaction-focus').forEach(el=>el.classList.remove('reaction-focus'));
 document.getElementById('reaction-clear').hidden=true;
}
function markCourseReaction(ids){
 clearReactionMark();
 let marked=false;
 ids.forEach(id=>{const el=document.querySelector(`#atlas-map [data-id="${id}"]`);if(el){el.classList.add('reaction-focus');marked=true;}});
 document.getElementById('reaction-clear').hidden=!marked;
 document.getElementById('course-dialog').close();
}
const courseHistory=[];
function updateCourseBack(){
 const back=document.getElementById('course-back');
 back.setAttribute('aria-label',courseHistory.length?'返回上一级':'返回总图');
 back.title=courseHistory.length?'返回上一级':'返回总图';
}
function backCourse(){
 const previous=courseHistory.pop();
 if(!previous){document.getElementById('course-dialog').close();return;}
 document.getElementById('course-title').textContent=previous.title;
 const body=document.getElementById('course-body');
 body.replaceChildren(...previous.children);body.scrollTop=previous.scroll;
 updateCourseBack();
 if(previous.focus?.isConnected)previous.focus.focus({preventScroll:true});
}
function openCourse(title){
 const dialog=document.getElementById('course-dialog');
 const body=document.getElementById('course-body');
 if(dialog.open)courseHistory.push({title:document.getElementById('course-title').textContent,children:[...body.childNodes],scroll:body.scrollTop,focus:document.activeElement});
 else courseHistory.length=0;
 document.getElementById('course-title').textContent=title;
 body.replaceChildren();updateCourseBack();
 if(!dialog.open)dialog.showModal();body.scrollTop=0;return body;
}
function showCourseReaction(id){
 const r=courseReactions.find(r=>r.id===id);if(!r)return;
 const body=openCourse(r.name);
 body.append(courseNode('p',r.equation,'reaction-equation'));
 const molecules=courseNode('div',null,'course-links');
 r.metabolites.forEach(m=>molecules.append(courseButton(m,()=>showCourseMetabolite(m))));body.append(molecules);
 body.append(courseNode('h3','调控因素与作用条件'));
 if(!r.regulation.length)body.append(courseNode('p','暂无调控信息'));
 for(const e of r.regulation){
  const row=courseNode('section',null,'regulation-row '+(e.type==='inhibits'?'inhibition':'activation'));
  row.append(courseButton(e.m,()=>showCourseMetabolite(e.m)),courseNode('strong',` ${regulationLabel(e.type)} → ${r.name}`),courseNode('p',e.context));
  courseSource(e.source,row);body.append(row);
 }
 body.append(courseNode('h3',r.source[0]==='Atlas'?'反应示意图':'反应结构式'));courseSource(r.source,body,true);
 const linked=courseReactions.filter(other=>other.id!==id&&other.regulation.some(e=>r.metabolites.includes(e.m)));
 if(linked.length){body.append(courseNode('h3','这些反应物／产物还参与调控'));linked.forEach(other=>body.append(courseButton(other.name,()=>showCourseReaction(other.id))));}
 const ids=r.objects;
 if(ids.length)body.append(courseButton('在总图中标记该反应',()=>markCourseReaction(ids)));
 else body.append(courseNode('p','总图中暂未绘制此反应。'));
}
function showCourseMetabolite(name){
 const m=courseMetabolites[name];const body=openCourse(name);
 body.append(courseNode('h3','结构式'));
 if(m?.structure)courseSource(m.structure,body,true);
 else body.append(courseNode('p','暂无结构式'));
 if(m?.reference){body.append(courseNode('h3','相关课件图（非独立结构式）'));courseSource(m.reference,body,true);}
 body.append(courseNode('h3','参与反应'));
 const reactions=courseReactions.filter(r=>r.metabolites.includes(name));
 if(!reactions.length)body.append(courseNode('p','暂无反应信息'));
 reactions.forEach(r=>body.append(courseButton(`${r.name}: ${r.equation}`,()=>showCourseReaction(r.id))));
 body.append(courseNode('h3','作为调控因素的关系'));
 const edges=courseReactions.flatMap(r=>r.regulation.filter(e=>e.m===name).map(e=>({r,e})));
 if(!edges.length)body.append(courseNode('p','暂无调控信息'));
 edges.forEach(({r,e})=>{body.append(courseButton(`${name} — ${regulationLabel(e.type)} → ${r.name}`,()=>showCourseReaction(r.id)),courseNode('p',e.context));});
}
function inspectAtlasObject(item){
 if(typeof mapCompoundGroups!=='undefined'&&mapCompoundGroups[item.id]){
  const body=openCourse('选择物质');
  mapCompoundGroups[item.id].forEach(name=>body.append(courseButton(name,()=>showCourseMetabolite(name))));return;
 }

 const m=Object.values(courseMetabolites).find(m=>m.ids.includes(item.id));
 if(m){showCourseMetabolite(m.name);return;}
 const r=courseReactions.find(r=>r.objects.includes(item.id));
 if(r){showCourseReaction(r.id);return;}
 const normalized=item.text.replace(/[\s\r\n]/g,'').replace(/^2(?=NAD|ATP|ADP)/,'').replace(/\+H\+$/,'');
 const cofactor=Object.keys(courseMetabolites).find(name=>name.replace(/\s/g,'')===normalized);
 if(cofactor){showCourseMetabolite(cofactor);return;}
 const body=openCourse(item.text||`图形对象 ${item.id}`);
 body.append(courseNode('p','暂无详情'));
 item.pathways.forEach(p=>body.append(courseNode('p',p)));
}
function inspectAtlasClick(item,event){
 // PowerPoint text boxes can overlap even when the printed glyphs do not.
 // Offer the nearby labels instead of silently opening a neighbouring molecule.
 const candidates=event.detail===0?[]:atlasData.objects.filter(o=>{
  if(!o.text.trim()||o.background)return false;
  const r=document.querySelector(`#atlas-map [data-id="${o.id}"]`).getBoundingClientRect();
  return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
 });
 if(candidates.length>1){const body=openCourse('选择要查看的物质或反应');body.append(courseNode('p','此处原图文字框重叠，请选择具体标签。'));candidates.forEach(o=>body.append(courseButton(o.text,()=>inspectAtlasObject(o))));return;}
 inspectAtlasObject(item);
}
document.getElementById('course-close').onclick=()=>document.getElementById('course-dialog').close();
document.getElementById('course-back').onclick=backCourse;
document.getElementById('reaction-clear').onclick=clearReactionMark;
document.getElementById('course-dialog').addEventListener('close',()=>{courseHistory.length=0;});
