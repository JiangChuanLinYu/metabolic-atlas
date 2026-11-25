
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({});for(const f of ['atlas-data.js','course-data.js','map-update.js','route-data.js','route-update.js','availability.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);
vm.runInContext(fs.readFileSync('dist/route-search.js','utf8').replace(/initRouteSearch\(\);\s*$/,''),c);
const run=code=>vm.runInContext(code,c);
test('aliases resolve enzymes and compounds without silently resolving ambiguity',()=>{
 assert.equal(run("resolveQuery('g6p')[0].name"),'Glucose 6-phosphate');
 assert.equal(run("resolveQuery('PFK-1')[0].id"),'pfk');
 assert.equal(run("resolveQuery('G3P').length"),2);
 assert.equal(run("resolveQuery('PGM').length"),2);
});
test('routes respect directions, enumerate alternatives and exclude cofactor shortcuts',()=>{
 assert.ok(run("findRoutes('Glucose 6-phosphate','Pyruvate',routeEdges).routes.length")>=2);
 assert.equal(run("findRoutes('Pyruvate','Glucose',routeEdges.filter(e=>isPathwayAvailable(e.pathway,'Animal','Skeletal Muscle Cell'))).routes.length"),0);
 assert.equal(run("routeEdges.some(e=>['ATP','NADH','NAD+'].includes(e.from))"),false);
 assert.equal(run("findRoutes('Arginine','Urea',routeEdges.filter(e=>isPathwayAvailable(e.pathway,'Animal','Hepatocyte'))).routes.length"),1);
 for(const path of run("findRoutes('Glucose 6-phosphate','Pyruvate',routeEdges).routes")){
  const names=[path[0].from,...path.map(e=>e.to)];assert.equal(new Set(names).size,names.length);
 }
});
test('search reports truncation rather than claiming all routes',()=>{
 assert.equal(run("findRoutes('Glucose 6-phosphate','Pyruvate',routeEdges,1).truncated"),true);
 assert.equal(run("findRoutes('Glucose 6-phosphate','Pyruvate',routeEdges,200,1).truncated"),true);
});
test('every edge resolves to a curated reaction and names its actual participants',()=>{
 for(const e of run('routeEdges')){
  const r=run('courseReactions').find(r=>r.id===e.reaction);assert.ok(r,e.reaction);
  assert.ok(r.metabolites.includes(e.from),e.reaction+': '+e.from);assert.ok(r.metabolites.includes(e.to),e.reaction+': '+e.to);
 }
});
