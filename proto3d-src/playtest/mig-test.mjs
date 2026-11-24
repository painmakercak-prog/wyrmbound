// Save migration proof (dev only). Seeds a PRE-TONIGHT save (26d6af3-era shape: v=1,
// no pms/fs/bossKills/wbest/wruns) with real progress, boots the current build, and
// verifies every progress field survives while tonight's fields get safe defaults.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import os from 'node:os';
const site=process.argv[2]||path.join(os.homedir(),'workspace/journey-of-aethra/build3d/site');
let _s=99;const rng=()=>{_s|=0;_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function ctxStub(){const base={canvas:{},measureText:()=>({width:10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),getImageData:()=>({data:[]})};return new Proxy(base,{get:(o,k)=>(k in o?o[k]:()=>{}),set:()=>true})}
function elStub(){return{style:{setProperty(){},removeProperty(){}},dataset:{},children:[],classList:{add(){},remove(){},toggle(){}},innerHTML:'',textContent:'',value:'',width:300,height:150,addEventListener(){},removeEventListener(){},appendChild(c){return c},remove(){},setAttribute(){},getAttribute:()=>null,insertAdjacentHTML(){},insertAdjacentElement(){},querySelector:()=>elStub(),querySelectorAll:()=>[],getContext:()=>ctxStub(),getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),focus(){},click(){}}}
const els=new Map(),store=new Map();let vnow=0;const errors=[];
const sandbox={console:{log(){},warn(){},error:(...a)=>errors.push(a.join(' '))},Math:Object.create(Math,{random:{value:rng}}),JSON,Date,Promise,Set,Map,WeakMap,Array,Object,Number,String,Boolean,RegExp,Error,TypeError,Symbol,Reflect,Proxy,parseInt,parseFloat,isNaN,isFinite,encodeURIComponent,decodeURIComponent,performance:{now:()=>vnow},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},Image:class{constructor(){this.complete=true;this.width=96;this.height=96}},Audio:class{constructor(){this.volume=1}play(){return Promise.resolve()}pause(){}addEventListener(){}},navigator:{userAgent:'mig'},location:{href:'http://localhost/',reload(){}},addEventListener(){},removeEventListener(){},devicePixelRatio:2,innerWidth:390,innerHeight:844};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
sandbox.document={getElementById:id=>{if(!els.has(id))els.set(id,elStub());return els.get(id)},querySelector:()=>elStub(),querySelectorAll:()=>[],createElement:()=>elStub(),addEventListener(){},body:elStub(),documentElement:elStub(),hidden:false};
vm.createContext(sandbox);
const html=fs.readFileSync(path.join(site,'index.html'),'utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const run=(c,n)=>{try{vm.runInContext(c,sandbox,{filename:n})}catch(e){errors.push('LOAD '+n+': '+e.message)}};
// pre-tonight save: exactly the 26d6af3-era DEF shape (v=1) with progress baked in
const oldSave={v:1,cls:'knight',name:'Hero',lv:12,xp:40,gold:5000,shards:300,eggs:4,treats:9,keys:7,isle:1,stage:3,wave:2,best:11,
 gear:{weapon:{slot:'weapon',n:'Old Blade',r:2,lv:9,atk:55,hp:20,ic:'loot_sword',sub:{}}},bag:[],pets:[{id:1,s:0,r:1,st:2,lv:5,xp:0,hunger:80}],team:[1],auto:true,autoSell:0,tower:3,hunt:2,arena:4,arenaPts:1150,lodge:{lv:2,xp:1,don:1,buffA:5,buffH:5},
 day:'2026-11-23',login:4,claimed:2,tasks:{},tdone:{},sound:1,t:Date.now()-3600000,kills:321,stat:{hatch:2,chest:9,feed:3,arena:1,kills:321}};
store.set('aethra3d1',JSON.stringify(oldSave));
run(fs.readFileSync(path.join(site,'ui.js'),'utf8'),'ui.js');inline.forEach((c,i)=>run(c,'inline'+i));
const ev=x=>vm.runInContext(x,sandbox);
ev('boot()');
const after=JSON.parse(ev('JSON.stringify(S)'));
const checks={
  versionBumpedTo3: after.v===3,
  levelKept: after.lv===12, isleKept: after.isle===1, questKept: after.stage===3,
  goldKeptPlusOffline: after.gold>=5000, shardsKept: after.shards===300,
  gearKept: !!after.gear.weapon&&after.gear.weapon.atk===55,
  petKept: after.pets.length===1&&after.pets[0].lv===5&&after.pets[0].s===0, killsKept: after.kills===321,
  lodgeKept: after.lodge.lv===2&&after.lodge.buffA===5, towerKept: after.tower===3,
  m4FieldsDefaulted: after.pms===0&&typeof after.fs==='object'&&after.bossKills===0,
  tonightFieldsDefaulted: after.wbest===0&&after.wruns===0,
  noErrors: errors.length===0,
};
console.log(JSON.stringify({checks,pass:Object.values(checks).every(Boolean),goldAfter:after.gold,errors:errors.slice(0,3)},null,1));
process.exit(Object.values(checks).every(Boolean)?0:1);
