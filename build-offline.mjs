import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const source=path.join(root,'dist');
const out=path.join(root,'offline');
fs.mkdirSync(out,{recursive:true});
let app=fs.readFileSync(path.join(source,'app.js'),'utf8');
for(const name of ['timing.png','bdd-size.png']){
 const data=fs.readFileSync(path.join(source,'assets',name)).toString('base64');
 app=app.replaceAll(`assets/${name}`,`data:image/png;base64,${data}`);
}
const css=fs.readFileSync(path.join(source,'style.css'),'utf8')+'\n'+fs.readFileSync(path.join(source,'theme.css'),'utf8');
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="theme.css">',`<style>${css}</style>`).replace('<script src="app.js"></script>',`<script>${app.replaceAll('</script','<\\/script')}</script>`);
fs.writeFileSync(path.join(out,'CATAPULT-Presentation.html'),html);
console.log('Created offline/CATAPULT-Presentation.html (self-contained, no installation or network required)');
