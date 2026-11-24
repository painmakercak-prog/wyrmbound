// Review-video capture: hand-stepped clock, CDP frames, ffmpeg mp4. Usage: node capture.mjs <port> <setlabel>
import {chromium} from 'playwright-core';
import fs from 'fs';
import {execSync} from 'child_process';
const [port='8901',set='after']=process.argv.slice(2);
const OUT=`../anim/videos/${set}`; fs.mkdirSync(OUT,{recursive:true});
const FR='/tmp/animframes'; fs.mkdirSync(FR,{recursive:true});
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
async function boot(cls){
  const ctx=await b.newContext({viewport:{width:360,height:740}});
  const p=await ctx.newPage(); const cdp=await ctx.newCDPSession(p);
  p.on('pageerror',e=>console.log('PAGEERROR',e.message.slice(0,80)));
  await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'load',timeout:90000});
  await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:180000});
  await p.evaluate(()=>document.getElementById('ttlg').click());
  await p.waitForTimeout(2200);
  const name={knight:'Knight',ranger:'Ranger',mage:'Mage',assassin:'Assassin',scholar:'Scholar',gunslinger:'Gunslinger'}[cls];
  await p.evaluate(n=>{const els=[...document.querySelectorAll('#cs *')].filter(e=>e.children.length<4&&e.textContent&&e.textContent.includes(n));els.sort((a,b)=>a.textContent.length-b.textContent.length);if(els.length)els[0].click()},name);
  await p.waitForTimeout(500);
  await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
  await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h,{timeout:120000});
  await p.waitForTimeout(600);
  await p.evaluate(()=>{window.__q=[];window.__t=performance.now();window.requestAnimationFrame=cb=>{window.__q.push(cb);return window.__q.length};performance.now=()=>window.__t;window.__step=ms=>{window.__t+=ms;const q=window.__q;window.__q=[];for(const cb of q)cb(window.__t)}});
  return {ctx,p,cdp};
}
async function shoot(p,cdp,name,frames=24,stepMs=100){
  for(let i=0;i<frames;i++){
    await p.evaluate(m=>window.__step(m),stepMs);
    try{const r=await cdp.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${FR}/f${String(i).padStart(2,'0')}.png`,Buffer.from(r.data,'base64'))}catch(e){}
  }
  try{execSync(`ffmpeg -y -v error -framerate 10 -i ${FR}/f%02d.png -vf scale=540:-2 -c:v libx264 -pix_fmt yuv420p -r 30 ${OUT}/${name}.mp4`);console.log('video',name)}catch(e){console.log('ffmpeg FAIL',name)}
}
const stepN=async(p,ms,n)=>{for(let i=0;i<n;i++)await p.evaluate(m=>window.__step(m),ms)};
for(const cls of ['knight','ranger','mage','assassin','scholar','gunslinger']){
  const {ctx,p,cdp}=await boot(cls);
  // attack: park next to a live mob, autoplay fights
  await p.evaluate(()=>{const m=F.mobs.find(m=>!m.dead);if(m){F.h.x=m.x+36;F.h.y=m.y}S.auto=true});
  await stepN(p,100,6);
  await shoot(p,cdp,`${cls}-attack`);
  // skills: zero cooldowns, fire each with the target in range
  await p.evaluate(()=>{S.auto=false;F.h.sk=[0,0,0];const m=F.mobs.find(m=>!m.dead);if(m){F.h.x=m.x+36;F.h.y=m.y;F.tgt=m}});
  await p.evaluate(()=>{try{useSkillF(0)}catch(e){}});
  await shoot(p,cdp,`${cls}-skill1`);
  await p.evaluate(()=>{F.h.sk=[0,0,0];const m=F.mobs.find(m=>!m.dead);if(m){F.h.x=m.x+36;F.h.y=m.y;F.tgt=m}});
  await p.evaluate(()=>{try{useSkillF(1)}catch(e){}});
  await shoot(p,cdp,`${cls}-skill2`);
  // hurt
  await p.evaluate(()=>{S.auto=false;try{hurtHero(Math.round(hmax()*.35))}catch(e){}});
  await shoot(p,cdp,`${cls}-hurt`);
  // death
  await p.evaluate(()=>{try{hurtHero(99999)}catch(e){}});
  await shoot(p,cdp,`${cls}-death`);
  if(cls==='knight'){
    await stepN(p,100,40); // revive (3 game-sec)
    await p.evaluate(()=>{F.h.mount=1;F.h.x=900;F.h.y=1500});
    await shoot(p,cdp,'knight-mount-idle');
    await p.evaluate(()=>{F.dest={x:1500,y:1500}});
    for(let i=0;i<24;i++){await p.evaluate(()=>{F.h.mount=1;if(!F.dest)F.dest={x:1500,y:1500}});await p.evaluate(m=>window.__step(m),100);try{const r=await cdp.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${FR}/f${String(i).padStart(2,'0')}.png`,Buffer.from(r.data,'base64'))}catch(e){}}
    try{execSync(`ffmpeg -y -v error -framerate 10 -i ${FR}/f%02d.png -vf scale=540:-2 -c:v libx264 -pix_fmt yuv420p -r 30 ${OUT}/knight-mount-gallop.mp4`);console.log('video knight-mount-gallop')}catch(e){}
    // mobs: hit + death per camp rig
    for(const [camp,rig] of [['A','frog'],['B','spider'],['C','skel']]){
      await p.evaluate(c=>{const m=F.mobs.find(m=>!m.dead&&m.camp===c);if(m){F.h.x=m.x+36;F.h.y=m.y;F.tgt=m;m.hp=m.mhp}S.auto=true},camp);
      await stepN(p,100,4);
      await shoot(p,cdp,`mob-${rig}-hit`);
      await p.evaluate(c=>{const m=F.mobs.find(m=>!m.dead&&m.camp===c);if(m)m.hp=1},camp);
      await shoot(p,cdp,`mob-${rig}-death`);
    }
    // boss telegraph (isle 0: slam)
    await p.evaluate(()=>{S.auto=false;try{huntGo()}catch(e){}});
    await stepN(p,100,10);
    await p.evaluate(()=>{if(F.boss){F.h.x=F.boss.x+60;F.h.y=F.boss.y}S.auto=true});
    let got=false;
    for(let i=0;i<200&&!got;i++){await p.evaluate(m=>window.__step(m),100);got=await p.evaluate(()=>!!F.tele)}
    if(got)await shoot(p,cdp,'boss-telegraph-slam',30);else console.log('telegraph NOT reached');
  }
  await ctx.close();
}
await b.close();
console.log('CAPTURE DONE',set);
