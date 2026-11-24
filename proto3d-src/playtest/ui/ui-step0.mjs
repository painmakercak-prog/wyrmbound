// UI Step 0: screenshot every screen at 3 sizes + run checks (a)-(e) per state. Usage: node ui-step0.mjs <port> <label>
import {chromium} from 'playwright-core';
import fs from 'fs';
const [port='8902',label='before']=process.argv.slice(2);
const SIZES=[[360,780],[390,844],[430,932]];
const OUT=`../anim/ui-shots/${label}`; fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const results={label,checks:{contrast:[],targets:[],overflow:[],safearea:[],emoji:[]},shots:[]};
const AUDIT=`() => {
  const EMO=/[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}]/u;
  const vis=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
  const lum=c=>{const m=c.match(/[\\d.]+/g).map(Number);if(!m||m.length<3)return null;const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
  const out={contrast:[],targets:[],overflow:[],emoji:[],overCanvas:0};
  const els=[...document.querySelectorAll('body *')].filter(vis);
  for(const el of els){
    const txt=(el.childNodes.length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))?el.textContent.trim():'';
    const r=el.getBoundingClientRect();
    if(txt){
      if(EMO.test(txt))out.emoji.push({tag:el.tagName,id:el.id||'',text:txt.slice(0,24)});
      const cs=getComputedStyle(el);const fg=lum(cs.color);
      let bg=null,n=el;while(n&&n!==document.body){const b2=getComputedStyle(n).backgroundColor;const mm=b2.match(/[\\d.]+/g);if(mm&&(mm[3]===undefined||+mm[3]>0)){bg=lum(b2);break}n=n.parentElement}
      if(fg!==null&&bg!==null){const ratio=(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);const large=parseFloat(cs.fontSize)>=18||(parseFloat(cs.fontSize)>=14&&+cs.fontWeight>=700);
        if(ratio<(large?3:4.5))out.contrast.push({id:el.id||el.className||el.tagName,text:txt.slice(0,20),ratio:+ratio.toFixed(2),need:large?3:4.5})}
      else if(fg!==null){out.overCanvas++;out.contrast.push({over:txt.slice(0,24)})}
      if(el.scrollWidth>el.clientWidth+2&&cs.overflowX==='hidden')out.overflow.push({id:el.id||el.tagName,text:txt.slice(0,20),kind:'clipped-text'});
    }
    if(el.hasAttribute('onclick')||el.tagName==='BUTTON'||el.tagName==='A'){
      if(r.width<44||r.height<44)out.targets.push({id:el.id||'',text:(el.textContent||'').trim().slice(0,16),w:Math.round(r.width),h:Math.round(r.height)});
    }
    if(r.right>innerWidth+2||r.left<-2)out.overflow.push({id:el.id||el.tagName,kind:'offscreen',right:Math.round(r.right),vw:innerWidth});
  }
  return out}`;
for(const [W,H] of SIZES){
  const ctx=await b.newContext({viewport:{width:W,height:H}});
  const p=await ctx.newPage();
  const tag=`${W}x${H}`;
  const shot=async name=>{await p.waitForTimeout(350);const f=`${OUT}/${tag}-${name}.png`;await p.screenshot({path:f});results.shots.push(f);
    const a=await p.evaluate("("+AUDIT+")()");for(const k of['contrast','targets','overflow','emoji'])for(const it of a[k])results.checks[k].push({size:tag,screen:name,...it});
    if(a.overCanvas)results.checks.contrast.push({size:tag,screen:name,overCanvasTextEls:a.overCanvas,kind:'over-canvas-unverifiable'});};
  await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'load',timeout:90000});
  await p.waitForFunction(()=>document.getElementById('ttlt')?.textContent==='Ready!',{timeout:180000});
  await shot('title');
  await p.evaluate(()=>document.getElementById('ttlg').click()); await p.waitForTimeout(600);
  await shot('class-select');
  await p.evaluate(()=>{const els=[...document.querySelectorAll('#cs *')].filter(e=>e.children.length<4&&e.textContent&&e.textContent.includes('Knight'));els.sort((a,b)=>a.textContent.length-b.textContent.length);if(els.length)els[0].click()});
  await p.waitForTimeout(400);
  await p.evaluate(()=>{const bs=[...document.querySelectorAll('#cs button')];const s=bs.find(x=>/start/i.test(x.textContent));if(s)s.click()});
  await p.waitForFunction(()=>typeof F!=='undefined'&&!!F&&!!F.h,{timeout:120000});
  await p.waitForTimeout(900);
  await shot('hud-village');
  // combat HUD (real time, brief)
  await p.evaluate(()=>{const m=F.mobs.find(m=>!m.dead);if(m){F.h.x=m.x+34;F.h.y=m.y}S.auto=true});
  await p.waitForTimeout(2500);
  await shot('hud-combat');
  await p.evaluate(()=>{if(typeof toast==='function')toast('Loot: 42 gold and a Wyrm Scale!')});
  await shot('toast');
  await p.evaluate(()=>{if(typeof addXp==='function')addXp(99999);else if(typeof gainXp==='function')gainXp(99999)});
  await p.waitForTimeout(700);
  await shot('levelup');
  // panels: click each HUD onclick control in turn
  const btns=await p.evaluate(()=>[...document.querySelectorAll('[onclick]')].map((e,i)=>{const r=e.getBoundingClientRect();return{i,text:(e.textContent||'').trim().slice(0,14),id:e.id||'',vis:r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight}}).filter(x=>x.vis&&x.text&&!/start|play/i.test(x.text)));
  const seen=new Set();
  for(const bt of btns.slice(0,16)){
    const nm=('panel-'+(bt.id||bt.text).replace(/[^a-z0-9]+/gi,'-').toLowerCase()).slice(0,40);
    if(seen.has(nm))continue; seen.add(nm);
    await p.evaluate(i=>{const e=document.querySelectorAll('[onclick]')[i];if(e)e.click()},bt.i);
    await p.waitForTimeout(500);
    await shot(nm);
    await p.evaluate(()=>{const c=[...document.querySelectorAll('[onclick]')].find(e=>/close|✕|×/i.test(e.textContent||'')&&e.getBoundingClientRect().width>0);if(c)c.click()});
    await p.waitForTimeout(250);
  }
  // dialog: stand on an NPC
  await p.evaluate(()=>{S.auto=false;const n=(F.npcs&&F.npcs[0])||null;if(n){F.h.x=n.x+20;F.h.y=n.y}});
  await p.waitForTimeout(1200);
  await shot('dialog');
  // tower
  await p.evaluate(()=>{try{S.clear=[1,1,1,1];S.isles=[1,1,1,1];if(typeof towerGo==='function')towerGo()}catch(e){}});
  await p.waitForTimeout(1500);
  await shot('tower');
  await ctx.close();
}
// (d) safe areas: static CSS scan is in the report builder; runtime inset probe:
results.checks.safearea.push({kind:'css-env-usage',note:'see ui-check report: grep of built CSS for env(safe-area-inset) usage'});
const sum={};for(const k of['contrast','targets','overflow','emoji'])sum[k]=results.checks[k].length;
results.summary=sum;
fs.writeFileSync(`../anim/ui-check-${label}.json`,JSON.stringify(results,null,1));
console.log(JSON.stringify({shots:results.shots.length,summary:sum}));
await b.close();
