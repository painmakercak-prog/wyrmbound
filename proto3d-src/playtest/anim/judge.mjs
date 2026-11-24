// Animation judge v2: role resolution (static audit covers it), T-pose (bind-pose deviation + action coverage),
// foot slide at steady run, clip impact frames (max weapon-hand forward extension), live impact sync.
// Usage: node judge.mjs <port> <label>
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
await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h&&!!window.G3D&&!!G3D.debug,{timeout:120000});
await p.waitForTimeout(800);
await p.evaluate(()=>{window.__realNow=performance.now.bind(performance);window.__q=[];window.__t=window.__realNow();window.requestAnimationFrame=cb=>{window.__q.push(cb);return window.__q.length};performance.now=()=>window.__t;window.__step=ms=>{window.__t+=ms;const q=window.__q;window.__q=[];for(const cb of q)cb(window.__t)}});
const step=async(ms,n=1)=>{for(let i=0;i<n;i++)await p.evaluate(m=>window.__step(m),ms)};
await step(33,10);
// go to camp A so mob chars exist, let draw3 build them
await p.evaluate(()=>{const m=F.mobs.find(m=>!m.dead);if(m){F.h.x=m.x+80;F.h.y=m.y+40}});
await step(33,15);
// ---- impact frames: max forward extension of the striking bone, stepped through each clip in isolation
const windups=await p.evaluate(()=>{
  const D=G3D.debug.chars();const out={};
  const boneFor=c=>c.w.getObjectByName('WristR')||c.w.getObjectByName('Head')||c.w.getObjectByName('Foot.L');
  const measure=(c,tag)=>{if(!c)return;const bone=boneFor(c);if(!bone)return;
    for(const role of['atk','atk2','atk3','shoot','cast','skill']){const a=c.A[role];if(!a)continue;const clip=a.getClip(),nm=clip.name.split('|').pop(),key=tag+':'+nm;
      if(out[key])continue;c.mx.stopAllAction();a.reset();a.setLoop(2200,1);a.timeScale=1;a.play();
      const dt=1/120;let t=0,best={t:0,z:-1e9};const loc={x:0,y:0,z:0};
      while(t<clip.duration){c.mx.update(dt);t+=dt;c.w.updateMatrixWorld(true);const e=bone.matrixWorld.elements;
        // world -> char local: use stored inverse via matrixWorld of group: approximate with group world matrix inverse elements
        const g=c.w.matrixWorld.elements;const dx=e[12]-g[12],dy=e[13]-g[13],dz=e[14]-g[14];
        // forward = group local +Z in world = (g[8],g[9],g[10])
        const fwd=dx*g[8]+dy*g[9]+dz*g[10];if(fwd>best.z)best={t,z:fwd}}
      out[key]={clip:nm,dur:+clip.duration.toFixed(3),impact:+best.t.toFixed(3)};c.mx.stopAllAction()}
    if(c.A.idle){c.A.idle.reset().play();c.cur=c.A.idle}};
  measure(D.hero,'hero');D.mobs.forEach(c=>measure(c,'mob'+(c.key==='boss'?'boss':c.key)));
  return out});
// ---- (b) T-pose coverage + (c) foot slide at steady run, during autoplay
await p.evaluate(()=>{S.auto=true});
await step(33,30);
await p.evaluate(()=>window.__j={minCover:9,tposeFrames:0,slide:[],n:0});
for(let i=0;i<240;i++){
  await step(33);
  const s=await p.evaluate(()=>{const D=G3D.debug.chars();const res={cover:9,slide:null};
    const cover=c=>{if(c.cur&&c.cur.getEffectiveWeight()>.5)return 1;let mx=0;for(const a of Object.values(c.A))mx=Math.max(mx,a.getEffectiveWeight());return mx>.5?1:0};
    if(D.hero)res.cover=Math.min(res.cover,cover(D.hero));for(const c of D.mobs)if(c.w.visible)res.cover=Math.min(res.cover,cover(c));
    const H=D.hero;
    if(H){const px=H.w.position.x,pz=H.w.position.z;if(window.__lp){const mv=Math.hypot(px-window.__lp[0],pz-window.__lp[1])/.033;const base=(H.spd.run||0)*H.h;
      if(H.cur===H.A.run&&mv>2.2&&window.__lmv&&Math.abs(mv-window.__lmv)/mv<.05&&base>.05)res.slide=Math.abs(base*H.cur.timeScale-mv)/mv;
      window.__lmv=mv}window.__lp=[px,pz]}
    // hero bind-pose deviation (gold standard): max angle from bind across tracked bones
    if(H&&H.bones){let mx=0;for(const k in H.bones){const o=H.bones[k];mx=Math.max(mx,o.b.quaternion.angleTo(o.q))}res.dev=mx}
    return res});
  await p.evaluate(s=>{const j=window.__j;j.minCover=Math.min(j.minCover,s.cover);if(s.dev!==undefined&&s.dev<0.01)j.tposeFrames++;if(s.slide!==null)j.slide.push(+s.slide.toFixed(3));j.n++},s);
}
const jd=await p.evaluate(()=>window.__j);
// ---- (d) live impact sync: wrist forward extension peak vs damage tick
await p.evaluate(()=>{const m=F.mobs.find(m=>!m.dead);if(m){m.hp=m.mhp;F.h.hp=hmax();F.h.dead=0;F.h.x=m.x+34;F.h.y=m.y;F.tgt=m}S.auto=true;window.__s={win:[],lastHp:null,ticks:[],noTgt:0}});
for(let i=0;i<900;i++){
  await step(33);
  const s=await p.evaluate(()=>{const D=G3D.debug.chars();const H=D.hero;const m=F.tgt;const out={hp:m?m.hp:null};
    if(H){const bone=H.w.getObjectByName('WristR');if(bone){H.w.updateMatrixWorld(true);const e=bone.matrixWorld.elements,g=H.w.matrixWorld.elements;out.fwd=(e[12]-g[12])*g[8]+(e[13]-g[13])*g[9]+(e[14]-g[14])*g[10]}}
    return out});
  await p.evaluate(s=>{const j=window.__s;if(s.fwd!==undefined){j.win.push(s.fwd);if(j.win.length>20)j.win.shift()}
    if(s.hp===null)j.noTgt++;
    if(j.lastHp!==null&&s.hp!==null&&s.hp<j.lastHp-0.01&&j.win.length){const pk=Math.max(...j.win);const ago=j.win.length-1-j.win.lastIndexOf(pk);j.ticks.push(-ago*33)}
    j.lastHp=s.hp},s);
  if(s.hp!==null&&(await p.evaluate(()=>window.__s.ticks.length))>=6)break;
}
const sd=await p.evaluate(()=>window.__s);
const sl=jd.slide.sort((a,b)=>a-b);
const report={label,port:+port,pageErrors:errs.slice(0,5),windups,
 tpose:{minCover:+jd.minCover.toFixed(3),heroBindPoseFrames:jd.tposeFrames,samples:jd.n,pass:jd.minCover>=0.99&&jd.tposeFrames===0},
 footslide:{samples:sl.length,median:sl.length?sl[Math.floor(sl.length/2)]:null,p90:sl.length?sl[Math.floor(sl.length*.9)]:null,pass:sl.length>4&&sl[Math.floor(sl.length*.9)]<0.05},
 impactSync:{swings:sd.ticks.length,offsetsMs:sd.ticks,noTargetSamples:sd.noTgt,pass:sd.ticks.length>=3&&sd.ticks.filter(t=>Math.abs(t)<=33).length>=Math.ceil(sd.ticks.length*.75)}};
fs.writeFileSync(`../anim/judge-${label}.json`,JSON.stringify(report,null,1));
console.log(JSON.stringify({tpose:report.tpose,footslide:report.footslide,impactSync:report.impactSync,windups:Object.fromEntries(Object.entries(windups).map(([k,v])=>[k,v.impact])),errs:errs.length},null,1));
await b.close();
