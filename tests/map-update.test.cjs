
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});for(const f of ['atlas-data.js','course-data.js','map-update.js','route-data.js','route-update.js','availability.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
vm.runInContext(fs.readFileSync('dist/route-search.js','utf8').replace(/initRouteSearch\(\);\s*$/,''),c);
const run=s=>vm.runInContext(s,c);
test('every new map layer has an explicit classification or is background/attribution',()=>{
 const d=run('atlasData');assert.equal(d.objects.length,1053);
 for(const o of d.objects)assert.ok(o.background||o.decorative||o.referenceLink||o.pathways.length,'unmapped '+o.id);
 assert.equal(d.objects.find(o=>o.id===266).decorative,true);
});
test('reused source IDs no longer open unrelated reactions or compounds',()=>{
 assert.ok(run("courseMetabolites['Glucose 6-phosphate'].ids.includes(94)"));
 assert.ok(!run("courseMetabolites['α-Ketoglutarate'].ids.includes(94)"));
 assert.ok(run("courseMetabolites['IMP'].ids.includes(869)"));
 assert.ok(run("courseMetabolites['Adenylosuccinate'].ids.includes(897)"));
 assert.ok(!run("courseReactions.find(r=>r.id==='ald').objects.includes(542)"));
 assert.ok(run("courseMetabolites['Alanine'].ids.includes(542)"));
});
test('new route branches connect and obey animal pathway restrictions',()=>{
 for(const [a,b] of [['Pyruvate','Glucose'],['Ribose 5-phosphate','GMP'],['UMP','CTP'],['Ethanol','Acetyl-CoA'],['Acetyl-CoA','Cholesterol'],['UDP','dTMP']])assert.ok(run('findRoutes('+JSON.stringify(a)+','+JSON.stringify(b)+",routeEdges.filter(e=>isPathwayAvailable(e.pathway,'Animal','Hepatocyte'))).routes.length")>0,a+' -> '+b);
 assert.equal(run("isPathwayAvailable('Thermogenesis','Animal','Hepatocyte')"),false);
 assert.equal(run("isPathwayAvailable('Thermogenesis','Animal','Brown Adipocyte')"),true);
 assert.equal(run("isPathwayAvailable('Aromatic Amino Acid Biosynthesis','Animal','Hepatocyte')"),false);
 assert.equal(run("findRoutes('Phosphoenolpyruvate','Tryptophan',routeEdges.filter(e=>isPathwayAvailable(e.pathway,'Animal','Hepatocyte'))).routes.length"),0);
 for(const alias of ['PEPCK','G6Pase','FASN','CPS2','TYMS','DHFR','ADH'])assert.equal(run('resolveQuery('+JSON.stringify(alias)+').length'),1,alias);
});
test('imported SVG pictures keep their current PowerPoint positions',()=>{
 const raw=JSON.parse(fs.readFileSync('dist/assets/atlas/objects.json','utf8').replace(/^\uFEFF/,''));
 for(const id of [288,382,389,266]){
  const source=raw.objects.find(o=>o.id===id),rendered=run('atlasData.objects').find(o=>o.id===id);
  assert.ok(Math.abs((source.x+source.width/2)-(rendered.x+rendered.width/2))<.01);
  assert.ok(Math.abs((source.y+source.height/2)-(rendered.y+rendered.height/2))<.01);
 }
});

test('schematic connectors never acquire pathway or reaction meaning',()=>{
 const links=run('atlasData.objects.filter(o=>o.referenceLink)');assert.equal(links.length,13);
 for(const o of links){assert.equal(o.pathways.length,0);assert.equal(run(`courseReactions.some(r=>r.objects.includes(${o.id}))`),false);assert.equal(run(`Object.values(courseMetabolites).some(m=>m.ids.includes(${o.id}))`),false);}
 assert.equal(run('atlasData.objects.find(o=>o.id===721).referenceLink'),'Glycerol');
 assert.equal(run("courseReactions.find(r=>r.id==='ketone').objects.includes(828)"),false);
 assert.equal(run('atlasData.objects.find(o=>o.id===828).referenceLink'),null);
 assert.ok(run("atlasData.objects.find(o=>o.id===828).pathways.includes('Fatty Acid β-Oxidation')"));
 assert.equal(run('routeEdges.some(e=>e.from===e.to)'),false);
});
