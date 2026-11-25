const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('dist/atlas-data.js','utf8'),context);
const data=vm.runInContext('atlasData',context);
const atlasSource=fs.readFileSync('dist/atlas.js','utf8');
vm.runInContext(atlasSource.slice(atlasSource.indexOf('function selectedAtlasBounds'),atlasSource.indexOf('function focusAtlasSelection')),context);
test('selection bounds include the union of selected paths and exclude background',()=>{
 const bounds=vm.runInContext('selectedAtlasBounds',context);
 const objects=[{x:0,y:0,width:1000,height:1000,background:true,pathways:['A']},{x:10,y:20,width:30,height:40,pathways:['A']},{x:80,y:90,width:10,height:20,pathways:['B']}];
 assert.equal(bounds(objects,new Set()),null);
 assert.deepEqual({...bounds(objects,new Set(['A']))},{left:10,top:20,width:30,height:40});
 assert.deepEqual({...bounds(objects,new Set(['A','B']))},{left:10,top:20,width:80,height:90});
 assert.equal(bounds(objects,new Set(['Not drawn'])),null);
});
test('every exported object has a local asset and finite nonnegative dimensions',()=>{
 assert.equal(data.objects.length,1053);
 assert.equal(new Set(data.objects.map(o=>o.id)).size,1053);
 for(const o of data.objects){
  assert.ok(fs.existsSync('dist/'+o.asset),o.asset);
  assert.ok([o.x,o.y,o.width,o.height].every(Number.isFinite));
  assert.ok(o.width>=0&&o.height>=0);
 }
});
test('glycolysis and gluconeogenesis share reversible steps but not hexokinase or PFK',()=>{
 const obj=id=>data.objects.find(o=>o.id===id);
 for(const id of [543,546,547,556,562,564,569]){
  assert.ok(obj(id).pathways.includes('Glycolysis'));
  assert.ok(obj(id).pathways.includes('Gluconeogenesis'));
 }
 for(const id of [528,537,572])assert.ok(!obj(id).pathways.includes('Gluconeogenesis'));
 assert.deepEqual(Array.from(obj(540).pathways),['Gluconeogenesis']);
 assert.equal(data.coverage.Gluconeogenesis,'Source diagram');
});

test('select all includes available extensions and excludes unavailable pathways',()=>{
 const selection=new Set(['Old context']);let renders=0;
 const ctx=vm.createContext({atlasSelection:selection,modules:[{core:['A','Unavailable'],extra:['Extension']}],available:p=>p!=='Unavailable',renderNav:()=>renders++,renderMain:()=>renders++});
 vm.runInContext(atlasSource.slice(atlasSource.indexOf('function selectAllAtlasPaths'),atlasSource.indexOf('function clearAtlasSelection')),ctx);
 vm.runInContext('selectAllAtlasPaths()',ctx);
 assert.deepEqual([...selection],['A','Extension']);assert.equal(renders,2);
 vm.runInContext('selectAllAtlasPaths()',ctx);assert.equal(selection.size,2);
});

test('ethanol oxidation and acetate activation are assigned to ethanol metabolism',()=>{
 for(const o of data.objects.filter(o=>[872,873,874,875,876,877,878,879,880,881,882,883,885,886,887,888,889,890,891,892,893,895,896,898,899,900,901].includes(o.id)))assert.ok(o.pathways.includes('Ethanol Metabolism'),String(o.id));
 assert.ok(data.objects.find(o=>o.id===596).pathways.includes('Ethanol Metabolism'));
 assert.ok(!data.objects.find(o=>o.id===871).pathways.includes('Ethanol Metabolism'));
});

test('real hepatocyte select-all renders ethanol labels, enzymes and arrows highlighted',()=>{
 const nodes=new Map();
 function el(){const classes=new Set();return {value:'',style:{},dataset:{},children:[],classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle(x,on){on?classes.add(x):classes.delete(x);},contains:x=>classes.has(x)},setAttribute(){},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},querySelector(selector){const match=selector.match(/data-id="(\d+)"/);return match?this.children.find(n=>String(n.dataset.id)===match[1]):el();}};}
 const viewport=el();const document={getElementById(id){if(!nodes.has(id))nodes.set(id,el());return nodes.get(id);},createElement:el,querySelector:()=>viewport,addEventListener(){},body:el()};
 const ctx=vm.createContext({document,Option:function(text,value){this.textContent=text;this.value=value;},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame(){}});
 for(const file of ['availability.js','app.js','atlas-data.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
 vm.runInContext(atlasSource.slice(0,atlasSource.indexOf("if(typeof ResizeObserver")),ctx);
 nodes.get('atlas-select-all').onclick();
 assert.equal(vm.runInContext("atlasSelection.has('Ethanol Metabolism')",ctx),true);
 for(const id of [872,873,877,878,883,885,893,896]){
  const object=nodes.get('atlas-map').querySelector('[data-id="'+id+'"]');
  assert.ok(object.classList.contains('highlighted'),'not highlighted: '+id);
 }

 assert.ok(nodes.get('atlas-selected').children.some(n=>n.textContent==='Ethanol Metabolism ×'));
 vm.runInContext("changeContext('Animal','Brown Adipocyte')",ctx);
 assert.equal(vm.runInContext("atlasSelection.has('Thermogenesis')",ctx),true);
 assert.equal(vm.runInContext("atlasSelection.has('Ethanol Metabolism')",ctx),false);
 assert.ok(nodes.get('atlas-map').querySelector('[data-id="330"]').classList.contains('highlighted'));
 vm.runInContext("changeContext('Animal','Hepatocyte')",ctx);
 assert.equal(vm.runInContext("atlasSelection.has('Ethanol Metabolism')",ctx),true);
 vm.runInContext("toggleAtlasPath('Ethanol Metabolism');changeContext('Animal','Brown Adipocyte')",ctx);
 assert.equal(vm.runInContext('atlasSelectAllMode',ctx),false);
 assert.equal(vm.runInContext("atlasSelection.has('Thermogenesis')",ctx),false);

});

test('updated core map classifies every added object and keeps the cell background separate',()=>{
 const addedIds=[31,5,16,19,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,49,51,52,53,54,55,56,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,77,78,79,80,81,82,83,84,85,86,88,89,90,91,92,93,94,95,96,97,98,99,100,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,119,120,121,122,124];
 const added=addedIds.map(id=>data.objects.find(o=>o.id===id));
 assert.equal(added.length,88);
 for(const o of added)assert.ok(o.referenceLink||o.pathways.length,'unmapped new shape '+o.id);
 assert.deepEqual(Array.from(data.objects.filter(o=>o.background).map(o=>o.id)),[2]);
 assert.equal(data.objects.find(o=>o.id===2).pathways.length,0);
 for(const id of [16,19])assert.ok(!data.objects.find(o=>o.id===id).pathways.includes('Glucose–Alanine Cycle'));
 for(const id of [47,62,88,89,90])assert.ok(data.objects.find(o=>o.id===id).pathways.includes('Urea Cycle'));
});

test('cell background uses the complete original raster without Office SVG clipping',()=>{
 const background=data.objects.find(o=>o.background);
 assert.equal(background.asset,'assets/atlas/cell-background.png');
 const svg=fs.readFileSync('dist/assets/atlas/shape-2.svg','utf8');
 const original=Buffer.from(svg.match(/xlink:href="data:image\/png;base64,([^"]+)"/)[1],'base64');
 assert.deepEqual(fs.readFileSync('dist/'+background.asset),original);
 const source=JSON.parse(fs.readFileSync('dist/assets/atlas/objects.json','utf8').replace(/^\uFEFF/,'')).objects.find(o=>o.id===2);
 for(const key of ['x','y','width','height'])assert.equal(background[key],source[key]);
});
