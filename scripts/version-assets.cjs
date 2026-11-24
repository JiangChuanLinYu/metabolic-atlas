// Run after changes to browser assets to keep HTML and scripts in sync.
const fs=require('node:fs');
const crypto=require('node:crypto');
const html=fs.readFileSync('dist/index.html','utf8').replace(/(src|href)="([^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g,(_,attribute,file)=>{
 const version=crypto.createHash('sha256').update(fs.readFileSync('dist/'+file)).digest('hex').slice(0,12);
 return attribute+'="'+file+'?v='+version+'"';
});
fs.writeFileSync('dist/index.html',html);
