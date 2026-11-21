/* Exact Boolean model and reduced ordered BDDs for the teaching example. */
(function(root){
 const functions={
  stem:x=>x.A^x.B,
  output:x=>(x.S&x.C)|((1-x.S)&x.D),
  co0:x=>x.D,co1:x=>x.C,
  observable:x=>x.C^x.D,
  test:x=>x.S&(x.C^x.D),
  final:x=>(x.A^x.B)&(x.C^x.D)
 };
 function simulate(x){const S=functions.stem(x),F=functions.output({...x,S}),faulty=x.D;return{S,F,faulty,detected:F^faulty,T:functions.final(x)};}
 function makeBDD(order,fn){
  const nodes=[{id:0,value:0},{id:1,value:1}],unique=new Map();
  function build(level,x){if(level===order.length)return Number(!!fn(x));
   const variable=order[level],low=build(level+1,{...x,[variable]:0}),high=build(level+1,{...x,[variable]:1});
   if(low===high)return low;
   const key=[variable,low,high].join(':');if(unique.has(key))return unique.get(key);
   const id=nodes.length;nodes.push({id,variable,level,low,high});unique.set(key,id);return id;
  }
  return{order:[...order],root:build(0,{}),nodes};
 }
 function evaluate(bdd,x){let n=bdd.nodes[bdd.root];while(n.value===undefined)n=bdd.nodes[x[n.variable]?n.high:n.low];return n.value;}
 function paths(bdd){const result=[];function walk(id,cube){const n=bdd.nodes[id];if(n.value!==undefined){if(n.value===1)result.push(cube);return;}walk(n.low,{...cube,[n.variable]:0});walk(n.high,{...cube,[n.variable]:1});}walk(bdd.root,{});return result;}
 const graphs={stem:makeBDD(['A','B'],functions.stem),output:makeBDD(['S','C','D'],functions.output),co0:makeBDD(['C','D'],functions.co0),co1:makeBDD(['C','D'],functions.co1),observable:makeBDD(['C','D'],functions.observable),test:makeBDD(['S','C','D'],functions.test),final:makeBDD(['A','B','C','D'],functions.final)};
 function trace(bdd,x){const steps=[];let id=bdd.root;while(bdd.nodes[id].variable){const n=bdd.nodes[id],bit=Number(!!x[n.variable]),to=bit?n.high:n.low;steps.push({from:id,to,variable:n.variable,bit});id=to;}return{steps,terminal:id,value:bdd.nodes[id].value};}
 function diagram(bdd){
  const locations=new Map(),reachable=new Set();
  function spread(id,l,r){const n=bdd.nodes[id];reachable.add(id);if(!n.variable)return;if(!locations.has(id))locations.set(id,[]);locations.get(id).push((l+r)/2);spread(n.low,l,(l+r)/2);spread(n.high,(l+r)/2,r);}
  spread(bdd.root,65,595);
  const levels=[...new Set([...locations.keys()].map(id=>bdd.nodes[id].level))].sort((a,b)=>a-b),pos=new Map();
  for(const[id,xs]of locations){const level=levels.indexOf(bdd.nodes[id].level);pos.set(id,{x:xs.reduce((a,b)=>a+b,0)/xs.length,y:50+level*(245/Math.max(1,levels.length-1))});}
  pos.set(0,{x:160,y:395});pos.set(1,{x:500,y:395});
  const edges=[];
  for(const id of reachable){const n=bdd.nodes[id];if(!n.variable)continue;const p=pos.get(id);for(const bit of[0,1]){
   const to=bit?n.high:n.low,q=pos.get(to),sx=p.x+(bit?14:-14),sy=p.y+22,ex=q.x,ey=q.y-27;
   let c1x=sx,c2x=ex;
   const point=(t,a,b,c,d)=>(1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
   function clear(a,b){for(let k=2;k<49;k++){const t=k/50,x=point(t,sx,a,b,ex),y=point(t,sy,sy+30,ey-30,ey);for(const other of reachable){if(other===id||other===to)continue;const p=pos.get(other);if(Math.hypot(x-p.x,y-p.y)<34)return false;}}return true;}
   if(!clear(c1x,c2x)){for(const lane of bit?[635,605,30,5]:[25,55,630,655]){if(clear(lane,lane)){c1x=lane;c2x=lane;break;}}}
   const d=`M${sx} ${sy}C${c1x} ${sy+30} ${c2x} ${ey-30} ${ex} ${ey}`;
   edges.push({from:id,to,bit,d,start:{x:sx,y:sy},end:{x:ex,y:ey},label:{x:sx+(bit?15:-15),y:sy+22}});
  }}return{pos,reachable,edges};
 }
 root.CatapultModel={functions,simulate,makeBDD,evaluate,paths,graphs,trace,diagram};
})(globalThis);
