
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
test('diagram raster layers retain original PPT pixels',()=>{
 const records=JSON.parse(fs.readFileSync('dist/assets/atlas/source-images.json','utf8').replace(/^\uFEFF/,''));assert.equal(records.length,60);
 for(const r of records){const svg=fs.readFileSync('dist/assets/atlas/shape-'+r.id+'.svg','utf8');const image=Buffer.from(svg.match(/data:image\/png;base64,([^"\s]+)/)[1],'base64');assert.equal(crypto.createHash('sha256').update(image).digest('hex'),r.sha256,'shape '+r.id);}
 for(const [id,minWidth] of [[2,2048],[588,1254],[288,1480],[101,1254]]){const svg=fs.readFileSync('dist/assets/atlas/shape-'+id+'.svg','utf8');const image=Buffer.from(svg.match(/data:image\/png;base64,([^"\s]+)/)[1],'base64');assert.ok(image.readUInt32BE(16)>=minWidth);}
});
