// Explicit object IDs from the supplied PPT. No spatial/keyword auto-classification.
const fs = require('node:fs');
const crypto = require('node:crypto');
const dir = 'dist/assets/atlas/';
const data = JSON.parse(fs.readFileSync(dir+'objects.json','utf8').replace(/^\uFEFF/,''));
const mapping=JSON.parse(fs.readFileSync('scripts/atlas-memberships.json','utf8'));
const backgroundSource=data.objects.find(o=>o.id===mapping.backgroundId);
const backgroundBounds=Object.fromEntries(['x','y','width','height'].map(key=>[key,backgroundSource[key]]));
for(const o of data.objects){
 o.pathways=mapping.memberships[o.id];
 if(!o.pathways)throw new Error('Unreviewed source object '+o.id);
 const svg=fs.readFileSync(dir+`shape-${o.id}.svg`,'utf8');
 const size=svg.match(/<svg width="([\d.]+)" height="([\d.]+)"/);
 const translate=svg.match(/<g[^>]*transform="translate\((-?[\d.]+)[ ,](-?[\d.]+)\)"/);
 // Office exports include arrowhead/rotated bounds; use export coordinates.
 if(o.type===13){
  // Imported pictures may retain their original SVG coordinate system.
  // Use the current PowerPoint placement, including rotation, not embedded translations.
  const radians=o.rotation*Math.PI/180;
  const width=Math.abs(o.width*Math.cos(radians))+Math.abs(o.height*Math.sin(radians));
  const height=Math.abs(o.width*Math.sin(radians))+Math.abs(o.height*Math.cos(radians));
  o.x+=(o.width-width)/2;o.y+=(o.height-height)/2;o.width=width;o.height=height;
 }else if(translate){o.x=-Number(translate[1])*.75;o.y=-Number(translate[2])*.75;o.width=Number(size[1])*.75;o.height=Number(size[2])*.75;}
 o.background=o.id===mapping.backgroundId;
 o.decorative=o.id===266;
 o.referenceLink=mapping.referenceLinks?.[o.id]||null;
 // Office wraps this raster background in enormous clip rectangles and nested
 // transforms. Render the embedded original directly to avoid SVG clipping
 // differences between browsers and zoom levels; retain the source bounds.
 let assetBytes=Buffer.from(svg);
 if(o.background){
  const embedded=svg.match(/xlink:href="data:image\/(jpeg|png);base64,([^"]+)"/);
  if(!embedded)throw new Error('Missing original cell background image');
  assetBytes=Buffer.from(embedded[2],'base64');
  const filename='cell-background.'+(embedded[1]==='jpeg'?'jpg':'png');
  fs.writeFileSync(dir+filename,assetBytes);
  o.asset='assets/atlas/'+filename;
  // Source metadata is read afresh on every build, before SVG bounds conversion.
  Object.assign(o,backgroundBounds);
 }
 o.assetVersion=crypto.createHash('sha256').update(assetBytes).digest('hex').slice(0,12);
}
data.coverage={
 'Glycolysis':'Source diagram',
 'Urea Cycle':'Source diagram',
 'NADH Shuttles':'Source diagram',
 'Gluconeogenesis':'Source diagram',
 'Glycogen Metabolism':'Source diagram',
 'Ketone Body Metabolism':'Ketogenesis in the supplied drawing; ketolysis is not drawn.',
 'Cori Cycle':'Partial: lactate branch only, not the complete interorgan cycle.',
 'Glucose–Alanine Cycle':'Partial: alanine branch only, not the complete interorgan cycle.'
};
data.source=mapping.source;
data.referenceVersion=crypto.createHash('sha256').update(fs.readFileSync(dir+'reference.png')).digest('hex').slice(0,12);
fs.writeFileSync('dist/atlas-data.js','const atlasData = '+JSON.stringify(data)+';\n');
console.log(`Mapped ${data.objects.length} source objects`);
