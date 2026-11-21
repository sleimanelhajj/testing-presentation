import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const source=path.join(root,'dist');
const out=path.join(root,'offline');
fs.mkdirSync(out,{recursive:true});
let app=fs.readFileSync(path.join(source,'model.js'),'utf8')+'\n'+fs.readFileSync(path.join(source,'app.js'),'utf8');
for(const name of ['timing.png','bdd-size.png']){
 const data=fs.readFileSync(path.join(source,'assets',name)).toString('base64');
 app=app.replaceAll(`assets/${name}`,`data:image/png;base64,${data}`);
}
const css=['style.css','theme.css','walkthrough.css'].map(name=>fs.readFileSync(path.join(source,name),'utf8')).join('\n');
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="[^"]+">/g,'').replace('</head>',`<style>${css}</style></head>`).replace('<script src="model.js"></script><script src="app.js"></script>',`<script>${app.replaceAll('</script','<\\/script')}</script>`);
fs.writeFileSync(path.join(out,'CATAPULT-Presentation.html'),html);
console.log('Created offline/CATAPULT-Presentation.html (self-contained, no installation or network required)');
