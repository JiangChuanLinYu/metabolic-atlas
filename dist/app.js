const modules = [
 {name:'Carbohydrate Metabolism',icon:'◈',source:'Ch14 · Ch20',core:['Glycolysis','Gluconeogenesis','Glycogen Metabolism','Pentose Phosphate Pathway'],extra:['Fructose Metabolism','Galactose Metabolism','Mannose Metabolism']},
 {name:'Citric Acid Cycle & Energy',icon:'◎',source:'Ch16 · Ch19-I',core:['Citric Acid Cycle','Oxidative Phosphorylation','Pyruvate Oxidation'],extra:['NADH Shuttles','Anaplerotic Reactions','Thermogenesis']},
 {name:'Lipid Metabolism',icon:'◇',source:'Ch17 · Ch21',core:['Fatty Acid β-Oxidation','Fatty Acid Biosynthesis','Ketone Body Metabolism','Cholesterol Metabolism'],extra:['Triacylglycerol Metabolism','Lipoprotein Transport','Glycerophospholipid Biosynthesis']},
 {name:'Amino Acid & Nitrogen Metabolism',icon:'⌁',source:'Ch18',core:['Urea Cycle','Amino Acid Catabolism'],extra:['Nitrogen Transport','Branched-Chain Amino Acid Catabolism','Amino Acid Biosynthesis','Aromatic Amino Acid Biosynthesis']},
 {name:'Photosynthesis & Plant Metabolism',icon:'✳',source:'Ch16 · Ch19-II · Ch20',core:['Calvin–Benson Cycle','Light Reactions','Glyoxylate Cycle'],extra:['Photorespiration','C₄ Carbon Assimilation','Starch & Sucrose Metabolism']},
 {name:'Nucleotide Metabolism',icon:'◇',source:'Ch22',core:['Purine Biosynthesis','Pyrimidine Biosynthesis','Deoxyribonucleotide Biosynthesis'],extra:['Purine Degradation','Pyrimidine Degradation']},
 {name:'Alcohol Metabolism',icon:'◇',source:'Ch14',core:['Ethanol Metabolism'],extra:[]},
 {name:'Interorgan Cycles',icon:'⇄',source:'Ch14 · Ch18 · Ch20',core:['Cori Cycle','Glucose–Alanine Cycle'],extra:[]}
];
const cells={Animal:['Hepatocyte','Skeletal Muscle Cell','Adipocyte','Brown Adipocyte'],Plant:['C₃ Photosynthetic Cell','C₄ Mesophyll Cell','C₄ Bundle Sheath Cell','Germinating Seed Cell','General Plant Cell'],Microbial:['Yeast Cell','Escherichia coli','Anaerobic Bacterium','Purple Photosynthetic Bacterium','Green Sulfur Bacterium','Cyanobacterium','Algal Cell','Red Algal Cell','General Bacterial Cell']};
const $=id=>document.getElementById(id);
const state={group:'Animal',cell:'Hepatocyte',path:'Glycolysis',open:new Set([0]),extra:new Set()};
try{const saved=JSON.parse(localStorage.getItem('metabolic-atlas-ui')||'null');if(saved&&cells[saved.group]?.includes(saved.cell)&&modules.some(m=>[...m.core,...m.extra].includes(saved.path))){Object.assign(state,{group:saved.group,cell:saved.cell,path:saved.path});state.open.add(modules.findIndex(m=>[...m.core,...m.extra].includes(state.path)));}}catch{}
function available(path){return modules.some(m=>[...m.core,...m.extra].includes(path))&&isPathwayAvailable(path,state.group,state.cell);}
function ensureAvailablePath(){
 if(!available(state.path))state.path=modules.flatMap(m=>m.core).find(available);
 const i=modules.findIndex(m=>[...m.core,...m.extra].includes(state.path));
 state.open.add(i);
 if(modules[i].extra.includes(state.path))state.extra.add(i);
}
function changeContext(group,cell){
 if(!cells[group]?.includes(cell))return;
 if(state.group===group&&state.cell===cell)return;
 if(typeof prepareAtlasContextChange==='function')prepareAtlasContextChange();
 state.group=group;state.cell=cell;ensureAvailablePath();save();renderCells();renderMain();renderNav();
}
function save(){try{localStorage.setItem('metabolic-atlas-ui',JSON.stringify({group:state.group,cell:state.cell,path:state.path}));}catch{}}
function moduleFor(path=state.path){return modules.find(m=>[...m.core,...m.extra].includes(path));}
function renderCells(){ $('groups').replaceChildren(...Object.keys(cells).map(group=>{const b=document.createElement('button');b.textContent=group;b.className=group===state.group?'active':'';b.setAttribute('aria-pressed',group===state.group);b.onclick=()=>{changeContext(group,cells[group][0]);};return b;}));$('cell').replaceChildren(...cells[state.group].map(name=>{const opt=new Option(name,name);opt.selected=name===state.cell;return opt;}));}
function selectPath(path){if(!available(path))return;if(typeof atlasSelection!=='undefined')atlasSelection.add(path);state.path=path;const i=modules.findIndex(m=>[...m.core,...m.extra].includes(path));state.open.add(i);if(modules[i].extra.includes(path))state.extra.add(i);$('search').value='';document.body.classList.remove('menu-open');save();renderNav();renderMain();}
function renderNav(){const query=$('search').value.trim().toLowerCase();$('modules').replaceChildren();let matches=0;modules.forEach((m,i)=>{const paths=[...m.core,...m.extra].filter(p=>available(p)&&p.toLowerCase().includes(query));if(!paths.length)return;matches+=paths.length;const section=document.createElement('section');section.className='module';const expanded=state.open.has(i)||!!query;const heading=document.createElement('button');heading.className='module-heading';heading.setAttribute('aria-expanded',expanded);heading.innerHTML=`<span class="module-symbol">${m.icon}</span><span>${m.name}</span><span class="chevron">${expanded?'⌃':'⌄'}</span>`;heading.onclick=()=>{state.open.has(i)?state.open.delete(i):state.open.add(i);renderNav();};section.append(heading);if(expanded){const list=document.createElement('div');list.className='path-list';paths.filter(p=>query||m.core.includes(p)||state.extra.has(i)).forEach(path=>{const b=document.createElement('button');b.className='path'+(typeof atlasSelection!=='undefined'&&atlasSelection.has(path)?' active':'');b.setAttribute('aria-pressed',typeof atlasSelection!=='undefined'&&atlasSelection.has(path));b.textContent=path;if(path===state.path){b.setAttribute('aria-current','page');const a=document.createElement('span');a.className='arrow';a.textContent='↗';b.append(a);}b.onclick=()=>toggleAtlasPath(path);list.append(b);});section.append(list);if(m.extra.filter(available).length&&!query){const more=document.createElement('button');more.className='more';more.textContent=state.extra.has(i)?'− Hide extensions':`+ ${m.extra.filter(available).length} more pathways`;more.setAttribute('aria-expanded',state.extra.has(i));more.onclick=()=>{state.extra.has(i)?state.extra.delete(i):state.extra.add(i);renderNav();};section.append(more);}}$('modules').append(section);});if(!matches){const p=document.createElement('p');p.className='no-results';p.textContent='No pathways found for this cell context. Try a different name or cell type.';$('modules').append(p);}$('path-count').textContent=query?`${matches} found`:`${modules.reduce((n,m)=>n+m.core.filter(available).length,0)} core`;$('collapse').textContent=state.open.size?'Collapse all':'Expand all';}
function renderMain(){if(typeof renderAtlas==='function')renderAtlas();}
$('cell').oninput=$('cell').onchange=e=>changeContext(state.group,e.target.value);
$('search').oninput=renderNav;
$('collapse').onclick=()=>{state.open=state.open.size?new Set():new Set(modules.map((_,i)=>i));renderNav();};
$('mobile-menu').onclick=()=>{const collapsed=document.body.classList.toggle('sidebar-collapsed');$('mobile-menu').setAttribute('aria-expanded',!collapsed);};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('course-dialog').open){e.preventDefault();document.body.classList.remove('sidebar-collapsed');$('mobile-menu').setAttribute('aria-expanded','true');$('search').focus();}});
ensureAvailablePath();save();renderCells();renderNav();renderMain();
