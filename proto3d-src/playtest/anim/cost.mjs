// Animation cost probe: per-char mixer update cost (real clock, no stepper), Step0-equivalent vs shipped (half-rate far mobs).
import {chromium} from 'playwright-core';
import fs from 'fs';
const [port='8901',label='after']=process.argv.slice(2);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const ctx=await b.newContext({viewport:{width:360,height:740}});
const p=await ctx.newPage();
await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'load',timeout:90000});
await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:180000});
await p.evaluate(()=>document.getElementById('ttlg').click());
await p.waitForTimeout(2200);
await p.evaluate(()=>{const els=[...document.querySelectorAll('#cs *')].filter(e=>e.children.length<4&&e.textContent&&e.textContent.includes('Knight'));els.sort((a,b)=>a.textContent.length-b.textContent.length);if(els.length)els[0].click()});
await p.waitForTimeout(500);
await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h&&!!window.G3D&&!!G3D.debug,{timeout:120000});
await p.waitForTimeout(1000);
// stand in a camp so several mob chars exist
await p.evaluate(()=>{const m=F.mobs[4]||F.mobs[0];if(m){F.h.x=m.x;F.h.y=m.y}S.auto=true});
await p.waitForTimeout(2500);
const res=await p.evaluate(()=>{
  const D=G3D.debug.chars();const cost=c=>{if(!c)return 0;const t0=performance.now();for(let i=0;i<300;i++)c.mx.update(1/60);return (performance.now()-t0)/300*1000}; // us per update
  const hero=D.hero,heroCost=cost(hero);
  // hero with upper-body action active (Step 3 cost)
  let heroUpper=0;if(hero&&hero.playUpper){hero.playUpper('shoot',1);heroUpper=cost(hero);if(hero.upper){hero.upper.stop();hero.upper=null;hero.upperT=0}}
  const wolfCost=cost(D.wolf);
  const npcCosts=D.npcs.map(cost),othCosts=D.oth.map(cost);
  const mobCosts=D.mobs.filter(c=>c.w.visible).map(c=>({us:cost(c),x:c.w.position.x,z:c.w.position.z}));
  const hx=hero?hero.w.position.x:0,hz=hero?hero.w.position.z:0;
  const fullRate=heroCost+wolfCost+npcCosts.reduce((a,c)=>a+c,0)+othCosts.reduce((a,c)=>a+c,0)+mobCosts.reduce((a,c)=>a+c.us,0);
  const shipped=heroUpper+wolfCost+npcCosts.reduce((a,c)=>a+c,0)+othCosts.reduce((a,c)=>a+c,0)+mobCosts.reduce((a,c)=>{const d2=(c.x-hx)**2+(c.z-hz)**2;return a+(d2>676?c.us/2:c.us)},0);
  return {heroCost:+heroCost.toFixed(1),heroUpperCost:+heroUpper.toFixed(1),wolfCost:+wolfCost.toFixed(1),npcCount:npcCosts.length,mobCount:mobCosts.length,fullRateUs:+fullRate.toFixed(1),shippedUs:+shipped.toFixed(1),changePct:+(((shipped-fullRate)/fullRate)*100).toFixed(1)};
});
fs.writeFileSync(`../anim/cost-${label}.json`,JSON.stringify(res,null,1));
console.log(JSON.stringify(res));
await b.close();
