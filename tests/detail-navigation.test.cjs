const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
test('detail back restores content and scroll; closing starts a new navigation chain',()=>{
 const nodes={};const document={activeElement:null,getElementById(id){return nodes[id]??=( {textContent:'',childNodes:[],scrollTop:0,open:false,setAttribute(){},replaceChildren(...children){this.childNodes=children;},showModal(){this.open=true;},close(){this.open=false;this.onclose?.();},addEventListener(name,fn){this['on'+name]=fn;}});}};
 const context=vm.createContext({document});vm.runInContext(fs.readFileSync('dist/course.js','utf8'),context);
 vm.runInContext("openCourse('Reaction')",context);const oldContent={id:'original-content'};
 nodes['course-body'].childNodes=[oldContent];nodes['course-body'].scrollTop=120;
 vm.runInContext("openCourse('Molecule');openCourse('Other reaction');backCourse()",context);
 assert.equal(nodes['course-title'].textContent,'Molecule');
 vm.runInContext('backCourse()',context);assert.equal(nodes['course-title'].textContent,'Reaction');assert.equal(nodes['course-body'].childNodes[0],oldContent);assert.equal(nodes['course-body'].scrollTop,120);
 vm.runInContext('backCourse()',context);assert.equal(nodes['course-dialog'].open,false);
 vm.runInContext("openCourse('New molecule')",context);assert.equal(vm.runInContext('courseHistory.length',context),0);
});
test('selected pathways has a single clear action outside the collapsible navigation',()=>{
 const html=fs.readFileSync('dist/index.html','utf8');
 assert.equal((html.match(/id="atlas-clear"/g)||[]).length,1);
 assert.equal(html.includes('id="sidebar-clear"'),false);
 assert.match(html,/<section class="selected-pathways"[^]*?id="atlas-clear"[^]*?id="atlas-selected"[^]*?<\/section>/);
});
