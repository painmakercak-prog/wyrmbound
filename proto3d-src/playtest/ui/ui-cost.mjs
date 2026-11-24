// UI Step 4: load time (to Ready) + frame time in a camp scene, one build per port.
// Usage: node ui-cost.mjs <portBefore> <portAfter>
import {chromium} from 'playwright-core';
import fs from 'fs';
const [pb='8902',pa='8901']=process.argv.slice(2);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--no-proxy-server']});
async function measure(port){
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const p=await ctx.newPage();
  const t0=Date.now();
  await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'load',timeout:120000});
  await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:240000});
  const readyMs=Date.now()-t0;
  await p.evaluate(()=>document.getElementById('ttlg').click()); await p.waitForTimeout(500);
  await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
  await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h,{timeout:120000});
  await p.waitForTimeout(1500);
  const frame=await p.evaluate(()=>new Promise(res=>{const ts=[];let last=performance.now();function f(t){ts.push(t-last);last=t;if(ts.length<300)requestAnimationFrame(f);else{ts.sort((a,b2)=>a-b2);res({median:+ts[150].toFixed(2),p90:+ts[270].toFixed(2)})}}requestAnimationFrame(f)}));
  await ctx.close();
  return {readyMs,frameMedianMs:frame.median,frameP90Ms:frame.p90};
}
const before=await measure(+pb), after=await measure(+pa);
const out={before,after,readyDeltaPct:+(((after.readyMs-before.readyMs)/before.readyMs)*100).toFixed(1),frameDeltaPct:+(((after.frameMedianMs-before.frameMedianMs)/before.frameMedianMs)*100).toFixed(1)};
fs.writeFileSync('../anim/ui-cost.json',JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
await b.close();
