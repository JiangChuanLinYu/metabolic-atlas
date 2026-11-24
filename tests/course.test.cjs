const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const c=vm.createContext({});for(const f of ['course-data.js','map-update.js','course-slides.js','atlas-data.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
const {reactions,metabolites,slides,objects}=vm.runInContext('({reactions:courseReactions,metabolites:courseMetabolites,slides:courseSlides,objects:atlasData.objects})',c);
test('all 786 course slides and every curated citation resolve locally',()=>{
 assert.equal(slides.length,786);const refs=new Set([...slides.map(s=>s.chapter+':'+s.slide),'Atlas:1']);
 for(const s of slides)assert.ok(fs.existsSync('dist/'+s.image),s.image);
 for(const r of reactions){assert.ok(refs.has(r.source.join(':')));for(const e of r.regulation)assert.ok(refs.has(e.source.join(':')));}
 for(const m of Object.values(metabolites))if(m.structure)assert.ok(refs.has(m.structure.join(':')));
});
test('curated object bindings are valid and do not assign one object to two reactions or molecules',()=>{
 const ids=new Set(objects.map(o=>o.id));const bound=new Set();
 for(const record of [...reactions.map(r=>r.objects),...Object.values(metabolites).map(m=>m.ids)])for(const id of record){assert.ok(ids.has(id),String(id));assert.ok(!bound.has(id),'duplicate '+id);bound.add(id);}
 assert.equal(new Set(reactions.map(r=>r.id)).size,reactions.length);
});
test('reciprocal glycolysis control preserves signs, sources and tissue caveats',()=>{
 const pfk=reactions.find(r=>r.id==='pfk'),fbp=reactions.find(r=>r.id==='fbp');
 assert.equal(pfk.regulation.find(e=>e.m==='Fructose 2,6-bisphosphate').type,'activates');
 assert.equal(fbp.regulation.find(e=>e.m==='Fructose 2,6-bisphosphate').type,'inhibits');
 assert.match(reactions.find(r=>r.id==='hk').regulation[0].context,/肝脏葡萄糖激酶不受/);
 assert.ok(!reactions.find(r=>r.id==='rubisco').regulation.some(e=>e.m==='Reduced thioredoxin'));
});

test('new urea cycle labels and enzymes resolve to molecule and reaction details',()=>{
 for(const [id,reaction] of [[47,'cps1'],[62,'otc'],[88,'ass'],[89,'asl'],[90,'arginase'],[41,'glutaminase'],[95,'gd h'],[114,'ast'],[111,'cyt-mdh'],[124,'fum']])assert.ok(reactions.find(r=>r.id===reaction).objects.includes(id));
 for(const [id,name] of [[46,'Carbamoyl phosphate'],[55,'Ornithine'],[56,'Citrulline'],[68,'Argininosuccinate'],[69,'Arginine'],[78,'Aspartate'],[84,'Urea']])assert.ok(metabolites[name].ids.includes(id));
 assert.equal(reactions.find(r=>r.id==='cps1').regulation.find(e=>e.m==='N-Acetylglutamate').type,'activates');
});
