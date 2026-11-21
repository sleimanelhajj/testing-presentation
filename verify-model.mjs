import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('./dist/model.js',import.meta.url),'utf8'),ctx);const m=ctx.CatapultModel;
const tests=[];
for(let i=0;i<16;i++){
 const x={A:i>>3,B:(i>>2)&1,C:(i>>1)&1,D:i&1},s=x.A!==x.B;
 const expectedGood=s?x.C:x.D,expectedFaulty=x.D,detect=Number(expectedGood!==expectedFaulty),r=m.simulate(x);
 assert.equal(r.F,expectedGood);assert.equal(r.faulty,expectedFaulty);assert.equal(r.T,detect);
 for(const [name,bdd]of Object.entries(m.graphs))assert.equal(m.evaluate(bdd,{...x,S:Number(s)}),m.functions[name]({...x,S:Number(s)}),name);
 assert.equal(m.functions.test({...x,S:Number(s)}),m.functions.final(x),'Composition must preserve the test function');
 if(detect)tests.push(i.toString(2).padStart(4,'0'));
}
assert.deepEqual(tests,['0101','0110','1001','1010']);
for(const [key,bdd]of Object.entries(m.graphs)){
 const keys=new Set();for(const n of bdd.nodes.filter(n=>n.variable)){assert.notEqual(n.low,n.high);const k=[n.variable,n.low,n.high].join(':');assert(!keys.has(k));keys.add(k);for(const id of[n.low,n.high]){const child=bdd.nodes[id];if(child.variable)assert(child.level>n.level);}}
 const cubes=m.paths(bdd);for(let i=0;i<2**bdd.order.length;i++){const x=Object.fromEntries(bdd.order.map((v,j)=>[v,(i>>(bdd.order.length-1-j))&1]));assert.equal(Number(cubes.some(c=>Object.entries(c).every(([v,n])=>x[v]===n))),m.evaluate(bdd,x),key+' accepting paths');}
}
// Apply BDD AND and XOR to arbitrary decomposed values as the walkthrough does.
for(let s=0;s<2;s++)for(let c=0;c<2;c++)for(let d=0;d<2;d++){
 const x={S:s,C:c,D:d};assert.equal(m.evaluate(m.graphs.observable,x),m.evaluate(m.graphs.co0,x)^m.evaluate(m.graphs.co1,x));assert.equal(m.evaluate(m.graphs.test,x),s&m.evaluate(m.graphs.observable,x));
}
console.log('Verified all 16 circuit inputs, four detecting tests, cofactor XOR, test AND, stem composition, and every BDD accepting path.');
