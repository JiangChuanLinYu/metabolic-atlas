const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function app(saved) {
  const elements = new Map();
  function element() {
    return {value:'',children:[],classList:{add(){},remove(){},toggle(){}},
      setAttribute(){},append(...children){this.children.push(...children);},
      replaceChildren(...children){this.children=children;},querySelector(){return element();}};
  }
  const document = {getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},
    createElement:element,createTextNode:text=>({textContent:text}),querySelector:element,
    body:element(),addEventListener(){}};
  const context = vm.createContext({document,Option:function(text,value){this.textContent=text;this.value=value;},
    localStorage:{getItem:()=>JSON.stringify(saved),setItem(){}},setTimeout,clearTimeout});
  for(const path of ['dist/availability.js','dist/app.js'])vm.runInContext(fs.readFileSync(path,'utf8'),context);
  return {run:code=>vm.runInContext(code,context),elements};
}

test('all animal contexts exclude photosynthesis and glyoxylate',()=>{
  const a=app();
  assert.equal(a.run("cells.Animal.every(cell=>['Light Reactions','Calvin–Benson Cycle','Glyoxylate Cycle','C₄ Carbon Assimilation'].every(p=>!isPathwayAvailable(p,'Animal',cell)))"),true);
});
test('context switches reconcile selection and filter search',()=>{
  const a=app();
  a.run("selectPath('Gluconeogenesis');changeContext('Animal','Skeletal Muscle Cell')");
  assert.equal(a.run('state.path'),'Glycolysis');
  assert.equal(a.run("available('Gluconeogenesis')"),false);
  a.elements.get('search').value='gluconeogenesis';a.run('renderNav()');
  assert.equal(a.elements.get('path-count').textContent,'0 found');
  a.run("selectPath('Gluconeogenesis')");assert.equal(a.run('state.path'),'Glycolysis');
  a.run("changeContext('Animal','Hepatocyte')");
  assert.equal(a.elements.get('path-count').textContent,'1 found');
});
test('restored invalid choices recover and valid extensions remain visible',()=>{
  assert.equal(app({group:'Animal',cell:'Cardiomyocyte',path:'Gluconeogenesis'}).run('state.path'),'Glycolysis');
  const a=app({group:'Animal',cell:'Hepatocyte',path:'Fructose Metabolism'});
  assert.equal(a.run('state.extra.has(0)'),true);
});
test('plant and microbial contexts distinguish photosynthetic roles',()=>{
  const a=app();
  for(const [cell,calvin,light] of [['C₄ Mesophyll Cell',false,true],['C₄ Bundle Sheath Cell',true,true],['Germinating Seed Cell',false,false]]){
    a.run(`changeContext('Plant',${JSON.stringify(cell)})`);
    assert.equal(a.run("available('Calvin–Benson Cycle')"),calvin);
    assert.equal(a.run("available('Light Reactions')"),light);
  }
  a.run("changeContext('Microbial','Green Sulfur Bacterium')");
  assert.equal(a.run("available('Calvin–Benson Cycle')"),false);
  assert.equal(a.run("available('Light Reactions')"),true);
  a.run("changeContext('Microbial','Escherichia coli')");
  assert.equal(a.run("available('Light Reactions')"),false);
});

test('hepatic ethanol diagram is selectable in the liver context',()=>{
 const a=app();assert.equal(a.run("available('Ethanol Metabolism')"),true);
 a.run("selectPath('Ethanol Metabolism')");assert.equal(a.run('state.path'),'Ethanol Metabolism');
 a.run("changeContext('Animal','Skeletal Muscle Cell')");assert.equal(a.run("available('Ethanol Metabolism')"),false);
 a.run("changeContext('Microbial','Yeast Cell')");assert.equal(a.run("available('Ethanol Metabolism')"),false);
});

test('animal menu has only the four supported contexts and removed saved cells recover',()=>{
 const a=app();assert.deepEqual(Array.from(a.run('cells.Animal')),['Hepatocyte','Skeletal Muscle Cell','Adipocyte','Brown Adipocyte']);
 assert.equal(app({group:'Animal',cell:'Renal Cell / Renal Cortex',path:'Glycolysis'}).run('state.cell'),'Hepatocyte');
 a.run("changeContext('Animal','Cardiomyocyte')");assert.equal(a.run('state.cell'),'Hepatocyte');
});
