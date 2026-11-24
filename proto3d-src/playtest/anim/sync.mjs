// Impact-sync only: pets dismissed, skills disabled, manual hold, chunky target. Pairs each damage tick with its swing.
// Usage: node sync.mjs <port> <label>
import {chromium} from 'playwright-core';
import fs from 'fs';
const [port='8901',label='after']=process.argv.slice(2);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const ctx=await b.newContext({viewport:{width:360,height:740}});
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,90)));
await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'load',timeout:90000});
await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:180000});
await p.evaluate(()=>document.getElementById('ttlg').click());
await p.waitForTimeout(2200);
await p.evaluate(()=>{const els=[...document.querySelectorAll('#cs *')].filter(e=>e.children.length<4&&e.textContent&&e.textContent.includes('Knight'));els.sort((a,b)=>a.textContent.length-b.textContent.length);if(els.length)els[0].click()});
await p.waitForTimeout(500);
await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h,{timeout:120000});
await p.waitForTimeout(800);
await p.evaluate(()=>{window.__q=[];window.__t=performance.now();window.requestAnimationFrame=cb=>{window.__q.push(cb);return window.__q.length};performance.now=()=>window.__t;window.__step=ms=>{window.__t+=ms;const q=window.__q;window.__q=[];for(const cb of q)cb(window.__t)}});
const step=async(ms,n=1)=>{for(let i=0;i<n;i++)await p.evaluate(m=>window.__step(m),ms)};
await p.evaluate(()=>{S.auto=false;S.team=[];const m=F.mobs.find(m=>!m.dead);m.mhp=100000;m.hp=100000;F.h.hp=hmax();F.h.x=m.x+34;F.h.y=m.y;F.h.sk=[999,999,999];window.__s={hist:[],lastHp:100000,ticks:[],step:0}});
const dbg=!!(await p.evaluate(()=>!!(window.G3D&&G3D.debug)));
for(let i=0;i<500;i++){
  await step(33);
  const s=await p.evaluate(()=>{const out={hp:F.tgt?F.tgt.hp:null};
    if(window.G3D&&G3D.debug){const H=G3D.debug.chars().hero;if(H){out.swing=H.swing?1:0;const bone=H.w.getObjectByName('WristR');if(bone){H.w.updateMatrixWorld(true);const e=bone.matrixWorld.elements,g=H.w.matrixWorld.elements;out.fwd=(e[12]-g[12])*g[8]+(e[13]-g[13])*g[9]+(e[14]-g[14])*g[10]}}}
    return out});
  const done=await p.evaluate(s=>{const j=window.__s;j.step++;j.hist.push({hp:s.hp,fwd:s.fwd,swing:s.swing});if(j.hist.length>40)j.hist.shift();
    if(j.lastHp!==null&&s.hp!==null&&s.hp<j.lastHp-0.01){
      // find last swing start within hist
      let si=-1;for(let k=j.hist.length-1;k>=0;k--){if(j.hist[k].swing&&!j.hist[k-1]?.swing){si=k;break}}
      if(si>=0){let pk=si;for(let k=si;k<j.hist.length;k++)if(j.hist[k].fwd>j.hist[pk].fwd)pk=k;
        j.ticks.push({offsetMs:(pk-(j.hist.length-1))*33,drop:+(j.lastHp-s.hp).toFixed(1)})}
      else j.ticks.push({offsetMs:null,drop:+(j.lastHp-s.hp).toFixed(1)})}
    j.lastHp=s.hp;return j.ticks.filter(t=>t.offsetMs!==null).length},s);
  if(i%90===0)await p.evaluate(()=>{F.h.hp=hmax();F.h.sk=[999,999,999];const m=F.tgt||F.mobs.find(m=>!m.dead);if(m&&!F.tgt){F.h.x=m.x+34;F.h.y=m.y}});
  if(done>=6)break;
}
const sd=await p.evaluate(()=>window.__s);
const offs=sd.ticks.filter(t=>t.offsetMs!==null).map(t=>t.offsetMs);
const report={label,debugAvailable:dbg,paired:offs.length,allTicks:sd.ticks,offsetsMs:offs,pass:offs.length>=3&&offs.filter(t=>Math.abs(t)<=33).length>=Math.ceil(offs.length*.75),pageErrors:errs.slice(0,3)};
fs.writeFileSync(`../anim/sync-${label}.json`,JSON.stringify(report,null,1));
console.log(JSON.stringify(report));
await b.close();
