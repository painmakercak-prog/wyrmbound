// Real-browser playtest bot v2 (dev only, never ships). Grades in GAME time (F.now).
// Usage: node run.mjs <label> <class> <gameMinutes> [shots]
import {chromium} from 'playwright-core';
import fs from 'fs';
const [label='run',cls='knight',minsS='32',shots='1']=process.argv.slice(2);
const MINS=parseFloat(minsS), WALLCAP=80*60000;
const out={label,class:cls,env:'headless Chromium, SwiftShader software WebGL, local serve of the exact gh-pages files',startedAt:new Date().toISOString()};
const errors=[];
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const ctx=await b.newContext({viewport:{width:360,height:740}});
const p=await ctx.newPage();
p.on('pageerror',e=>errors.push('PAGEERROR '+e.message.slice(0,160)));
p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errors.push('CONSOLE '+m.text().slice(0,160))});
const cdp=await ctx.newCDPSession(p);
await p.goto('http://127.0.0.1:8901/',{waitUntil:'load',timeout:90000});
await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:180000});
await p.evaluate(()=>{window.__frames=[];let last=performance.now();const loop=t=>{window.__frames.push(t-last);last=t;if(window.__frames.length>400000)window.__frames.splice(0,100000);requestAnimationFrame(loop)};requestAnimationFrame(loop);
 window.__P={goldE:0,goldS:0,lastGold:null,goldE30:null,goldS30:null,deaths:0,deathsPre2:0,minHpPre2:1,bossFights:[],cur:null,bossSeen:0,progT:0,maxDry:0,lv:1,kills:0,q:-1,isle:-1,levelAt:{},nan:false,towerAt:null,towerFailed:false,inTower:false,firstBossAt:null};
 setInterval(()=>{try{const P=window.__P;if(typeof S==='undefined'||typeof F==='undefined'||!F||!F.h)return;const gt=F.now;
  if(P.lastGold===null)P.lastGold=S.gold;const dg=S.gold-P.lastGold;if(dg>0)P.goldE+=dg;else if(dg<0)P.goldS+=-dg;P.lastGold=S.gold;
  if(gt>=1800&&P.goldE30===null){P.goldE30=P.goldE;P.goldS30=P.goldS}
  const hr=F.h.combatT<3?F.h.hp/Math.max(1,hmax()):1;
  if(P.bossSeen<2&&hr<P.minHpPre2)P.minHpPre2=hr;
  if(F.h.hp<=0&&!P._wasDead){P.deaths++;if(P.bossSeen<2)P.deathsPre2++;if(P.inTower)P.towerFailed=true;P._wasDead=true}if(F.h.hp>1)P._wasDead=false;
  if(F.boss&&F.boss!==P.cur){P.cur=F.boss;P.bossSeen++;if(P.firstBossAt===null)P.firstBossAt=gt;P.fight={name:F.boss.n,t0:gt,d0:P.deaths}}
  if(!F.boss&&P.cur){P.fight.t1=gt;P.fight.seconds=+(gt-P.fight.t0).toFixed(1);P.fight.tries=P.deaths-P.fight.d0+1;P.bossFights.push(P.fight);P.cur=null;P.progT=gt}
  if(F.tower){if(P.towerAt===null)P.towerAt=gt;P.inTower=true}else P.inTower=false;
  if(S.lv!==P.lv||S.kills!==P.kills||S.q!==P.q||S.isle!==P.isle){P.lv=S.lv;P.kills=S.kills;P.q=S.q;P.isle=S.isle;P.progT=gt}
  for(const m of[5,10,30])if(gt>=m*60&&P.levelAt[m]===undefined)P.levelAt[m]=S.lv;
  const dry=gt-P.progT;if(dry>P.maxDry)P.maxDry=dry;
  if(!isFinite(S.gold)||!isFinite(S.xp))P.nan=true;
 }catch(e){}},100);});
async function shot(name){try{await p.screenshot({path:name,timeout:60000,animations:'disabled'});console.log('shot ok:',name)}catch(e){console.log('shot FAILED:',name,e.message.split('\n')[0])}}
await p.evaluate(()=>document.getElementById('ttlg').click());
await p.waitForTimeout(3000);
async function clickClass(name){return p.evaluate(n=>{const els=[...document.querySelectorAll('#cs *')].filter(e=>e.children.length<4&&e.textContent&&e.textContent.includes(n));els.sort((a,b)=>a.textContent.length-b.textContent.length);if(els.length){els[0].click();return true}return false},name)}
if(shots==='1'){await clickClass('Gunslinger');await p.waitForTimeout(1200);await shot('shot-class-gunslinger.png')}
await clickClass(cls==='knight'?'Knight':cls==='gunslinger'?'Gunslinger':cls);
await p.waitForTimeout(800);
await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h,{timeout:120000}).catch(()=>{});
console.log('inField:',await p.evaluate(()=>typeof F!=='undefined'&&!!F&&!!F.h).catch(()=>false));
await p.evaluate(()=>{S.auto=true});
// phase A: 150s at 4x CPU throttle (frame-time record), then throttle off for the graded run
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const markA=await p.evaluate(()=>window.__frames.length);
await p.waitForTimeout(150000);
const framesA=await p.evaluate(m=>window.__frames.slice(m),markA);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
await p.evaluate(()=>{window.__markB=window.__frames.length});
console.log('phase A done (4x throttle frames:',framesA.length,')');
let teleShot=false;const t0=Date.now();let lastLog=0;
while(Date.now()-t0<WALLCAP){
  const gt=await p.evaluate(()=>window.F?F.now:-1).catch(()=>-1);
  if(gt>=MINS*60)break;
  await p.waitForTimeout(150);
  const st=await p.evaluate(()=>({boss:!!(window.F&&F.boss),tele:!!(window.F&&(F.tele||F.ringFx))})).catch(()=>({}));
  if(st.boss&&!teleShot&&st.tele){await shot('shot-telegraph.png');teleShot=true;console.log('telegraph shot at game t=',gt.toFixed(0))}
  if(Date.now()-lastLog>120000){lastLog=Date.now();const P=await p.evaluate(()=>window.__P).catch(()=>null);if(P)console.log(`[wall ${((Date.now()-t0)/60000).toFixed(1)}m] game t=${(gt/60).toFixed(1)}m lv`,P.lv,'fights',P.bossFights.length,'goldE/S',P.goldE,P.goldS,'deaths',P.deaths,'minHp',P.minHpPre2.toFixed(2))}
}
const P=await p.evaluate(()=>window.__P);
const framesB=await p.evaluate(m=>window.__frames.slice(m),await p.evaluate(()=>window.__markB));
function fpsStats(fr){const d=fr.filter(x=>x>0&&x<2000);if(!d.length)return{n:0};const avg=d.reduce((a,x)=>a+x,0)/d.length;const bk=[];let acc=0,n=0;for(const x of d){acc+=x;n++;if(acc>=1000){bk.push(n*1000/acc);acc=0;n=0}}let worst=0,cur=0;for(const f of bk){if(f<30){cur++;worst=Math.max(worst,cur)}else cur=0}return{n:d.length,avgMs:+avg.toFixed(1),avgFps:+(1000/Math.max(avg,.01)).toFixed(1),worstBelow30Sec:worst,buckets:bk.length}}
out.gameMinutes=+(await p.evaluate(()=>window.F?F.now/60:0)).toFixed(1);
out.levelAt=P.levelAt;out.deaths=P.deaths;out.deathsPreBoss2=P.deathsPre2;out.minHpPreBoss2=+P.minHpPre2.toFixed(3);
out.goldEarned=P.goldE;out.goldSpent=P.goldS;out.goldEarnedBy30=P.goldE30;out.goldSpentBy30=P.goldS30;
out.goldSpentRatio=P.goldE30>0?+(P.goldS30/P.goldE30).toFixed(3):0;
out.bossFights=P.bossFights;out.firstBossAtSeconds=P.firstBossAt!==null?+P.firstBossAt.toFixed(0):null;
out.maxDryStretchSeconds=Math.round(P.maxDry);out.consoleErrorCount=errors.length;out.errors=errors.slice(0,10);
out.fpsThrottled4x=fpsStats(framesA);out.fpsUnthrottled=fpsStats(framesB);
out.nanSeen=P.nan;out.teleShot=teleShot;out.tower={enteredAt:P.towerAt,failed:P.towerFailed};
const first=P.bossFights[0];
out.checks={consoleErrors:errors.length===0,fpsRealBrowser:out.fpsUnthrottled.avgFps>=30,
 firstBoss:P.firstBossAt!==null&&P.firstBossAt<=600,
 bossLength:!!first&&first.seconds>=45&&first.seconds<=120,
 firstBossTries:!!first&&first.tries<=2,
 dryStretch:P.maxDry<=180,
 dangerBeforeBoss2:P.deathsPre2>=1||P.minHpPre2<0.25,
 goldSpentRatio:P.goldE30>0&&P.goldS30>=0.5*P.goldE30,
 finite:!P.nan};
out.passGameplay=Object.entries(out.checks).filter(([k])=>k!=='fpsRealBrowser').every(([,v])=>v);
if(shots==='1'){
  await p.evaluate(()=>{S.auto=false;if(typeof closeM==='function')closeM()}).catch(()=>{});
  const spots=[[0,520,1640],[1,900,900],[2,900,900],[3,620,450]];
  for(const [isle,x,y] of spots){await p.evaluate(([i,xx,yy])=>{S.isle=i;initZone();F.h.x=xx;F.h.y=yy},[isle,x,y]).catch(()=>{});await p.waitForTimeout(1200);await shot(`shot-gimmick-isle${isle}.png`)}
}
fs.writeFileSync(`report-${label}.json`,JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
await b.close();
