// UI Step 2 verification: force every theme x every size, run the Step 0 audit in each.
// Usage: node ui-themes.mjs <port> <label>
import {chromium} from 'playwright-core';
import fs from 'fs';
const [port='8901',label='after']=process.argv.slice(2);
const SIZES=[[360,780],[390,844],[430,932]];
const OUT=`../anim/ui-shots/${label}-themes`; fs.mkdirSync(OUT,{recursive:true});
const AUDIT=fs.readFileSync('ui-step0.mjs','utf8').match(/const AUDIT=`([\s\S]*?)`;/)[1].replace(/\\\\/g,'\\');
const themes=['village','isle0','isle1','isle2','isle3','boss','tower'];
const report={label,themes:{},shots:[]};
for(const t of themes)report.themes[t]={contrast:0,targets:0,overflow:0,emoji:0,findings:[]};
async function runSize(W,H){
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--no-proxy-server']});
  try{
    const ctx=await b.newContext({viewport:{width:W,height:H}});
    const p=await ctx.newPage();
    const cdp=await ctx.newCDPSession(p);
    await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'load',timeout:120000});
    await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:240000});
    await p.evaluate(()=>document.getElementById('ttlg').click()); await p.waitForTimeout(500);
    await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
    await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h,{timeout:120000});
    await p.waitForTimeout(800);
    for(const state of ['hud','panel']){
      if(state==='panel')await p.evaluate(()=>{tab='hero';render()});
      for(const t of themes){
        await p.evaluate(th=>{applyTheme(th)},t);
        await p.waitForTimeout(420); // let the 300ms crossfade settle
        const a=await p.evaluate("("+AUDIT+")()");
        const R=report.themes[t];
        for(const k of['contrast','targets','overflow','emoji']){R[k]+=a[k].length;for(const it of a[k].slice(0,4))R.findings.push({size:`${W}x${H}`,state,kind:k,...it})}
        if(W===390){const shot=await cdp.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${OUT}/390x844-${state}-${t}.png`,Buffer.from(shot.data,'base64'));report.shots.push(`${state}-${t}`)}
      }
      if(state==='panel')await p.evaluate(()=>{const c=document.querySelector('.phd button');if(c)c.click()});
    }
    await ctx.close();
  } finally { await b.close().catch(()=>{}) }
}
for(const [W,H] of SIZES){
  try{ await runSize(W,H) }
  catch(e){ console.log(`size ${W}x${H} failed once (${String(e).slice(0,80)}), retrying`); await runSize(W,H) }
}
fs.writeFileSync(`../anim/ui-themes-${label}.json`,JSON.stringify(report,null,1));
const sum={};for(const t of themes)sum[t]={contrast:report.themes[t].contrast,targets:report.themes[t].targets,overflow:report.themes[t].overflow,emoji:report.themes[t].emoji};
console.log(JSON.stringify(sum,null,1));
