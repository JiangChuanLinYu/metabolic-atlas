const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function surface(){return {handlers:{},addEventListener(type,fn){this.handlers[type]=fn;},emit(type,props={}){const e={preventDefault(){this.prevented=true;},stopPropagation(){},stopImmediatePropagation(){this.stopped=true;},...props};this.handlers[type]?.(e);return e;}};}
function setup(){
 const viewport=Object.assign(surface(),{scrollLeft:500,scrollTop:400,clientLeft:0,clientTop:0,clientHeight:600,getBoundingClientRect:()=>({left:20,top:40}),classList:{add(){},remove(){}},setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;}});
 const map={clientWidth:1000,dataset:{zoom:1}},dialog={open:false};
 const document=Object.assign(surface(),{getElementById:id=>id==='atlas-map'?map:dialog});const window=surface();
 const ctx=vm.createContext({document,window,Math,setAtlasZoom(value){map.dataset.zoom=Math.max(.25,Math.min(12,value));map.clientWidth=1000*map.dataset.zoom;}});
 const source=fs.readFileSync('dist/atlas.js','utf8');vm.runInContext(source.slice(source.indexOf('function setupAtlasGestures'),source.lastIndexOf("setupAtlasGestures(document")),ctx);ctx.viewport=viewport;vm.runInContext('setupAtlasGestures(viewport)',ctx);
 return {viewport,map,document,window,dialog};
}
test('wheel zoom preserves the point under the mouse and handles zoom limits',()=>{
 const {viewport:v,map}=setup();const e=v.emit('wheel',{clientX:220,clientY:140,deltaY:-120,deltaMode:0});
 assert.equal(e.prevented,true);assert.ok(map.dataset.zoom>1);
 assert.ok(Math.abs((v.scrollLeft+200)/map.dataset.zoom-700)<1e-8);
 assert.ok(Math.abs((v.scrollTop+100)/map.dataset.zoom-500)<1e-8);
 for(let i=0;i<20;i++)v.emit('wheel',{clientX:220,clientY:140,deltaY:-500,deltaMode:0});
 assert.equal(map.dataset.zoom,12);const left=v.scrollLeft;
 v.emit('wheel',{clientX:220,clientY:140,deltaY:-500,deltaMode:0});assert.equal(v.scrollLeft,left);
});
test('space drag pans, suppresses accidental click, and releases on window blur',()=>{
 const {viewport:v,document:d,window:w}=setup();d.emit('keydown',{code:'Space'});
 v.emit('pointerdown',{button:0,pointerId:1,clientX:200,clientY:200});
 v.emit('pointermove',{pointerId:1,clientX:260,clientY:230});assert.equal(v.scrollLeft,440);assert.equal(v.scrollTop,370);
 v.emit('pointerup',{pointerId:1});assert.equal(v.capture,null);assert.equal(v.emit('click').stopped,true);
 w.emit('blur');v.emit('pointerdown',{button:0,pointerId:2,clientX:200,clientY:200});v.emit('pointermove',{pointerId:2,clientX:300,clientY:300});assert.equal(v.scrollLeft,440);assert.equal(v.emit('click').stopped,undefined);
});
test('typing and modal details do not activate space dragging',()=>{
 const {viewport:v,document:d,dialog}=setup();assert.equal(d.emit('keydown',{code:'Space',target:{closest:()=>true}}).prevented,undefined);
 v.emit('pointerdown',{button:0,pointerId:1});assert.equal(v.capture,undefined);
 dialog.open=true;assert.equal(d.emit('keydown',{code:'Space'}).prevented,undefined);
 assert.equal(v.emit('wheel',{deltaY:-100}).prevented,undefined);
});
