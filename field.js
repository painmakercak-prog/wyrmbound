// ===== Wyrmbound v2: field world + full auto loop =====
const ZW=1400,ZH=2000;
const THEME=[{g:'#6cbf4a',g2:'#5aa83c',p:'#d9c27a',t:'#2f8a3a',t2:'#47b04a',r:'#9a9a8a'},{g:'#b9b07a',g2:'#a39a66',p:'#e6dcb0',t:'#4f8a6a',t2:'#6aa884',r:'#8c8676'},
 {g:'#dfeaf5',g2:'#c8d9ec',p:'#f7fbff',t:'#3a6a8a',t2:'#5f93b5',r:'#9aa8b8'},{g:'#6a3a2e',g2:'#57301f',p:'#d07a3a',t:'#3a2a26',t2:'#ff6a2a',r:'#4a3a36'}];
const NPCS={elder:{n:'Elder Oswin',k:'npc_elder'},smith:{n:'Mara the Smith',k:'npc_smith'}};
const PTS={village:[700,1800],elder:[630,1790],smith:[790,1770],A:[380,1400],B:[1020,1120],C:[430,720],lair:[700,330],portal:[1120,250]};
function QUESTS(){const I=ISLES[S.isle%4],F=I.foes.map(k=>FOE[k][0]),bn=FOE[I.boss][0];return[
 {t:'talk',who:'elder',title:'A Restless Wild',lines:[`Ah, a wyrm-bonded traveler! ${I.n} has gone wild lately.`,`${F[0]}s swarm the old stones to the west. Thin them out for us?`]},
 {t:'kill',camp:'A',n:6,title:`Thin the ${F[0]}s`},
 {t:'talk',who:'smith',title:'The Smith\'s Gift',lines:[`You fight well! Here, three relic keys from my forge.`,`Open relic chests and wear whatever hits harder.`],gift:1},
 {t:'kill',camp:'B',n:8,title:`Drive off the ${F[1]}s`},
 {t:'kill',camp:'C',n:10,title:`Break the ${F[2]} pack`},
 {t:'talk',who:'elder',title:'The Old Terror',lines:[`The ground shakes... ${bn} has woken in the north lair.`,`Take your dragon and end it. We are counting on you.`]},
 {t:'boss',title:`Defeat ${bn}`},
 {t:'portal',title:'Through the Waygate',lines:[]}]}
let F=null;const ZNI={};
function seedR(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function buildZone(){const th=THEME[S.isle%4],c=document.createElement('canvas');c.width=ZW;c.height=ZH;const g=c.getContext('2d'),r=seedR(S.isle*977+13);
 g.fillStyle=th.g;g.fillRect(0,0,ZW,ZH);for(let i=0;i<500;i++){g.fillStyle=r()<.5?th.g2:th.g;g.globalAlpha=.5;g.beginPath();g.ellipse(r()*ZW,r()*ZH,20+r()*60,10+r()*30,0,0,7);g.fill()}g.globalAlpha=1;
 const path=[PTS.village,PTS.A,PTS.B,PTS.C,PTS.lair,PTS.portal];g.strokeStyle=th.p;g.lineCap=g.lineJoin='round';g.lineWidth=70;g.beginPath();path.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();
 g.strokeStyle='#0001';g.lineWidth=82;g.globalCompositeOperation='destination-over';g.stroke();g.globalCompositeOperation='source-over';
 g.fillStyle=th.p;g.beginPath();g.ellipse(700,1790,190,120,0,0,7);g.fill();g.beginPath();g.ellipse(700,330,200,150,0,0,7);g.fill();
 for(const k of['A','B','C']){g.fillStyle='#0002';g.beginPath();g.ellipse(...PTS[k],150,100,0,0,7);g.fill()}
 const deco=[];const near=(x,y)=>path.some((p,i)=>{if(!i)return false;const q=path[i-1],dx=p[0]-q[0],dy=p[1]-q[1],t=Math.max(0,Math.min(1,((x-q[0])*dx+(y-q[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-q[0]-t*dx,y-q[1]-t*dy)<110})||Object.values(PTS).some(p=>Math.hypot(x-p[0],y-p[1])<170);
 for(let i=0;i<260;i++){const x=r()*ZW,y=r()*ZH;if(near(x,y))continue;deco.push([x,y,r()<.75?'t':'r',.7+r()*.6])}
 // houses
 [[560,1700],[860,1690],[600,1900]].forEach(([x,y])=>deco.push([x,y,'h',1]));
 return{bg:c,deco:deco.sort((a,b)=>a[1]-b[1])}}
const IC={};function im(k){if(!IMG[k])return null;if(!IC[k]){IC[k]=new Image();IC[k].src=IMG[k]}return IC[k].complete?IC[k]:null}
function mobStat(t){return{hp:Math.round(60*Math.pow(1.17,t-1)),atk:Math.round(6*Math.pow(1.17,t-1))}}
function zoneTier(){return S.isle*10+1}
function spawnMob(camp){const I=ISLES[S.isle%4],ci={A:0,B:1,C:2}[camp],t=zoneTier()+ci*2,st=mobStat(t),[hx,hy]=PTS[camp],a=R()*7,d=R()*110;
 return{k:I.foes[ci],n:FOE[I.foes[ci]][0],camp,x:hx+Math.cos(a)*d,y:hy+Math.sin(a)*d*.7,hx,hy,hp:st.hp,mhp:st.hp,atk:st.atk,lv:t,cd:1,dead:0,rt:0,fl:0,hit:0,wt:R()*3}}
function spawnBoss(){const I=ISLES[S.isle%4],t=zoneTier()+7,st=mobStat(t);return{k:I.boss,n:FOE[I.boss][0],camp:'lair',boss:1,x:PTS.lair[0],y:PTS.lair[1],hx:PTS.lair[0],hy:PTS.lair[1],hp:st.hp*10,mhp:st.hp*10,atk:Math.round(st.atk*1.8),lv:t,cd:2,dead:0,rt:0,hit:0,wt:0}}
function initZone(){const z=buildZone(),mobs=[];for(const c of['A','B','C'])for(let i=0;i<5;i++)mobs.push(spawnMob(c));
 const others=[0,1,2,3].map(i=>({n:pick(NAMES),c:pick(['knight','mage','ranger']),x:300+R()*800,y:600+R()*1200,tx:0,ty:0,w:0}));
 const s=stats();F={z,mobs,boss:null,drops:[],fx:[],others,chest:null,ct:20,
  h:{x:PTS.village[0],y:PTS.village[1]-60,hp:s.hp+s.ph,face:1,cd:0,sk:[0,0,0],dead:0,mount:0,combatT:9,pose:'idle',pt:0,walk:0},
  pets:[],dest:null,joy:null,manualT:-99,dlg:null,status:'',tgt:null,bossFails:0,trainT:0,dungT:0,now:0,banner:3,lvT:0};
 if(S.q===undefined)S.q=0;if(S.q>=6&&S.q<7)F.boss=spawnBoss();
 const nm=$('znm');if(nm)nm.textContent=ISLES[S.isle%4].n}
// ---- helpers
const D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function Q(){return QUESTS()[S.q]||QUESTS()[0]}
function qProg(){return S.qk||0}
function hmax(){const s=stats();return s.hp+s.ph}
function range(){return S.cls==='knight'?58:S.cls==='mage'?170:190}
function isAuto(){return S.auto&&F.now-F.manualT>4}
function addFx(x,y,t,c,big){F.fx.push({x,y,t,c,big,l:0})}
function questTarget(){const q=Q();if(q.t==='talk')return{x:PTS[q.who][0]+40,y:PTS[q.who][1]+20,kind:'npc',who:q.who,label:'walking to '+NPCS[q.who].n};
 if(q.t==='kill'){const m=nearest(F.mobs.filter(m=>!m.dead&&m.camp===q.camp));return m?{x:m.x,y:m.y,kind:'mob',m,label:`hunting ${m.n} (${qProg()}/${q.n})`}:{x:PTS[q.camp][0],y:PTS[q.camp][1],kind:'go',label:`waiting for ${FOE[ISLES[S.isle%4].foes[{A:0,B:1,C:2}[q.camp]]][0]}s to respawn`}}
 if(q.t==='boss'){if(!F.boss)F.boss=spawnBoss();if(F.bossFails>=2&&F.trainT>0){const m=nearest(F.mobs.filter(m=>!m.dead&&m.camp==='C'));if(m)return{x:m.x,y:m.y,kind:'mob',m,label:`training before the boss (${Math.ceil(F.trainT)}s)`}}
  return{x:F.boss.x,y:F.boss.y,kind:'mob',m:F.boss,label:'fighting '+F.boss.n}}
 return{x:PTS.portal[0],y:PTS.portal[1]+30,kind:'portal',label:'heading to the Waygate'}}
function nearest(a){let b=null,bd=1e9;for(const m of a){const d=D(m,F.h);if(d<bd){bd=d;b=m}}return b}
// ---- quest flow
function questDone(){const q=Q();const g=Math.round(40*Math.pow(1.12,zoneTier()+S.q)),x=Math.round(30*Math.pow(1.1,zoneTier()+S.q));S.gold+=g;gainXp(x);
 let m=`Quest complete! +${fmt(g)} gold +${fmt(x)} EXP`;if(q.gift){S.keys+=3;m+=' +3 🗝️'}if(q.t==='boss'){S.shards+=25;S.eggs++;S.keys+=2;m+=' +25 💎 +1 🥚'}
 toast(m);S.q++;S.qk=0;S.stage=Math.min(10,S.q+1);save();render()}
function talk(who){const q=Q();if(q.t!=='talk'||q.who!==who){F.dlg={who,lines:[pick(['Safe travels, friend.','The wilds grow stronger the further you go.','Feed your dragon. A happy dragon bites harder.'])],i:0,t:0,end:null};return}
 F.dlg={who,lines:q.lines,i:0,t:0,end:questDone}}
function dlgNext(){if(!F.dlg)return;F.dlg.i++;F.dlg.t=0;if(F.dlg.i>=F.dlg.lines.length){const e=F.dlg.end;F.dlg=null;if(e)e()}drawDlg()}
function drawDlg(){const b=$('dlg');if(!F.dlg){b.style.display='none';return}const n=NPCS[F.dlg.who];b.style.display='flex';
 b.innerHTML=`<img src="${IMG[n.k]||''}"><div><b>${n.n}</b><p>${F.dlg.lines[F.dlg.i]}</p><small>${isAuto()?'Auto continues…':'Tap to continue'}</small></div>`}
function enterPortal(){S.isle++;S.q=0;S.qk=0;S.stage=1;S.best=Math.max(S.best,S.isle*10+1);save();initZone();F.banner=3;toast('Entered '+ISLES[S.isle%4].n+'!');render()}
// ---- combat
function hitMob(m,d,tag,c){if(m.dead)return;m.hp-=d;m.hit=.15;m.aggro=1;addFx(m.x,m.y-(m.boss?130:(MOBH[m.k]||58)+6),(tag==='CRIT '?'CRIT ':'')+fmt(d),tag==='CRIT '?'#ffd54a':(c||'#fff'),tag==='CRIT '||tag==='SK');sparks(m.x,m.y-(m.boss?70:28),tag==='CRIT '?'#ffd54a':'#fff3c0',tag==='CRIT '?10:5);if(m.hp<=0)killMob(m)}
function killMob(m){m.dead=1;m.dieT=F.now;sparks(m.x,m.y-30,'#ffe066',14);m.rt=m.boss?0:5+R()*2;const t=m.lv;S.kills++;S.stat.kills++;const g=Math.round(6*Math.pow(1.12,t)*(m.boss?8:1)),x=Math.round(8*Math.pow(1.1,t)*(m.boss?6:1));
 gainXp(x);addFx(m.x,m.y-30,'+'+fmt(x)+' EXP','#9fff6a');F.drops.push({x:m.x,y:m.y,k:'gold',v:g,a:0});if(R()<(m.boss?1:.22))F.drops.push({x:m.x+20,y:m.y+8,k:'key',v:m.boss?3:1,a:0});if(R()<.05)F.drops.push({x:m.x-20,y:m.y,k:'treat',v:1,a:0});
 const q=Q();if(q.t==='kill'&&m.camp===q.camp){S.qk=(S.qk||0)+1;if(S.qk>=q.n)questDone()}
 if(m.boss){F.boss=null;F.bossFails=0;if(q.t==='boss')questDone()}
 if(F.tgt===m)F.tgt=null}
function heroDie(){F.h.dead=3;F.h.mount=0;toast('Knocked out! Reviving at the village…');const q=Q();if(q.t==='boss'){F.bossFails++;if(F.bossFails>=2)F.trainT=45;if(F.boss){F.boss.hp=F.boss.mhp;F.boss.x=F.boss.hx;F.boss.y=F.boss.hy}}}
function useSkillF(i){const h=F.h;if(h.dead||h.sk[i]>0)return;const s=stats(),m=F.tgt&&!F.tgt.dead?F.tgt:null;
 if(i<2&&(!m||D(m,h)>range()+40))return;h.sk[i]=SK[i].cd;const mul=S.cls==='mage'?1.6:1;
 if(i===0){for(const o of F.mobs.concat(F.boss?[F.boss]:[]))if(!o.dead&&D(o,m)<90)hitMob(o,s.atk*4*mul*(o.boss?1+s.t.bd/100:1),'SK','#ffb04a');F.fx.push({x:m.x,y:m.y,ring:1,l:0})}
 if(i===1){hitMob(m,(s.pa*5+s.atk)*mul,'SK','#ffb0ff');sparks(m.x,m.y-30,'#ffb0ff',12)}
 if(i===2){h.hp=Math.min(hmax(),h.hp+hmax()*.35);addFx(h.x,h.y-80,'+'+fmt(hmax()*.35),'#9fff6a');F.fx.push({heal:1,x:h.x,y:h.y-10,l:0})}
 h.pose='attack';h.pt=.25}
// ---- auto equip from keys (uses chest + compare logic silently)
function autoGear(){if(S.keys<1)return false;S.keys--;S.stat.chest++;const it=mkItem(),cur=S.gear[it.slot];
 if(!cur||ipw(it)>ipw(cur)){if(cur)S.gold+=sv(cur);S.gear[it.slot]=it;toast(`Auto-equipped ${it.name} (${RAR[it.r]}) Power +${fmt(Math.round(ipw(it)-ipw(cur)))}`,1)}else S.gold+=sv(it);render();return true}
// ---- main update
function step(dt){if(!F||B)return;F.now+=dt;const h=F.h,s=stats(),mx=hmax();F.banner=Math.max(0,F.banner-dt);
 for(let i=0;i<3;i++)h.sk[i]=Math.max(0,h.sk[i]-dt);h.cd-=dt;h.pt-=dt;if(h.pt<=0)h.pose='idle';h.combatT+=dt;
 if(h.dead>0){h.dead-=dt;F.status='💤 Reviving at the village…';if(h.dead<=0){h.x=PTS.village[0];h.y=PTS.village[1]-60;h.hp=mx;F.tgt=null;F.dest=null}return}
 h.hp=Math.min(mx,h.hp+(h.combatT>3?mx*.08:s.rg)*dt);if(h.hp>mx)h.hp=mx;
 if(F.trainT>0)F.trainT-=dt;
 // dialogue
 if(F.dlg){F.dlg.t+=dt;F.status='💬 Talking to '+NPCS[F.dlg.who].n;if(isAuto()&&F.dlg.t>2.4)dlgNext();moveH(0,0,dt);return}
 // decide movement
 let vx=0,vy=0,auto=isAuto();const aggro=F.mobs.concat(F.boss?[F.boss]:[]).filter(m=>!m.dead&&m.aggro&&D(m,h)<260);
 if(F.joy){vx=F.joy.dx;vy=F.joy.dy;F.manualT=F.now;F.tgt=aggro.length?nearest(aggro):null}
 else if(F.dest){const dx=F.dest.x-h.x,dy=F.dest.y-h.y,d=Math.hypot(dx,dy);F.manualT=F.now;if(d<10){const a=F.dest.act;F.dest=null;if(a)a()}else{vx=dx/d;vy=dy/d}}
 else if(auto){let tg=null,act=null,lab='';
  // priorities: fight aggro > loot > chest > daily claims/gear > quest
  if(aggro.length){const m=nearest(aggro);tg=m;lab='defending against '+m.n}
  else if(F.drops.length&&nearest(F.drops)&&D(nearest(F.drops),h)<220){const d=nearest(F.drops);tg=d;lab='picking up loot'}
  else if(F.chest&&D(F.chest,h)<450){tg=F.chest;lab='grabbing a treasure chest';act=openFieldChest}
  else if(S.keys>0&&h.combatT>1.5&&autoGear()){F.status='🤖 Auto: opening relic chests';return}
  else if(F.dungT>200&&S.hunt>0&&S.lv>=5&&Q().t!=='boss'){F.dungT=0;F.status='🤖 Auto: entering Boss Hunt';toast('Auto: entering a Boss Hunt run');huntGo();return}
  else{const t=questTarget();tg=t;lab=t.label;if(t.kind==='npc')act=()=>talk(t.who);if(t.kind==='portal')act=enterPortal;if(t.kind==='mob')F.tgt=t.m}
  if(tg&&tg.hp!==undefined)F.tgt=tg;
  F.status='🤖 Auto: '+lab;
  const stop=F.tgt&&tg===F.tgt?range()*.85:act?40:8,dx=tg.x-h.x,dy=tg.y-h.y,d=Math.hypot(dx,dy);
  if(d>stop){vx=dx/d;vy=dy/d;h.mount=d>380&&!aggro.length?1:0}else{h.mount=0;if(act)act()}}
 else{F.status=S.auto?`🕹️ Manual. Auto resumes in ${Math.max(0,Math.ceil(4-(F.now-F.manualT)))}s`:'🕹️ Manual control. Tap Auto to let your hero play.';if(!F.tgt&&aggro.length)F.tgt=nearest(aggro)}
 if(F.joy||F.dest){if(F.status.startsWith('🤖'))F.status='🕹️ Manual'}
 if(F.joy||F.dest)F.status=S.auto?'🕹️ Manual. Auto resumes 4s after you stop':'🕹️ Manual control';
 if((F.joy||F.dest)&&aggro.length)h.mount=0;
 moveH(vx,vy,dt);
 // hero attack
 const t=F.tgt;if(t&&!t.dead&&D(t,h)<range()+6){h.combatT=0;h.mount=0;if(t.x!==h.x)h.face=t.x>h.x?1:-1;
  if(h.cd<=0){h.cd=.9/(1+s.t.as/100);let d=s.atk,cr=R()<s.cc;if(cr)d*=s.cm;if(t.boss)d*=1+s.t.bd/100;
   if(range()>100)F.fx.push({x:h.x,y:h.y-40,tx:t,proj:1,l:0,c:S.cls==='mage'?'#ff8a2a':'#cfe8ff',d,cr});else{hitMob(t,d,cr?'CRIT ':'');F.fx.push({slash:1,x:t.x,y:t.y-30,face:h.face,l:0})}h.pose='attack';h.pt=.25;h.hp=Math.min(mx,h.hp+d*s.t.ls/100)}
  if(auto||S.auto)for(let i=0;i<3;i++)if(h.sk[i]<=0&&(i<2||h.hp<mx*.5))useSkillF(i)}
 // pets
 const team=S.team.map(id=>S.pets.find(p=>p.id===id)).filter(Boolean);while(F.pets.length<team.length)F.pets.push({x:h.x,y:h.y,cd:1});F.pets.length=team.length;
 F.pets.forEach((p,i)=>{p.p=team[i];let tx=h.x-h.face*(40+i*30),ty=h.y-10+i*14;if(t&&!t.dead&&h.combatT<2&&i===0){tx=t.x-(t.x>h.x?50:-50);ty=t.y-20}
  const ox=p.x;p.x+=(tx-p.x)*Math.min(1,dt*4);if(Math.abs(p.x-ox)>.3)p.face=p.x>ox?1:-1;else if(t&&!t.dead&&h.combatT<2)p.face=t.x>p.x?1:-1;else p.face=h.face;p.y+=(ty-p.y)*Math.min(1,dt*4);p.cd-=dt;if(t&&!t.dead&&h.combatT<2&&D(p,t)<90&&p.cd<=0){p.cd=1.1;hitMob(t,s.pa*1.1/Math.max(1,team.length)*(1+i*.2),'','#ffd0ff')}});
 // mobs
 for(const m of F.mobs.concat(F.boss?[F.boss]:[])){m.hit=Math.max(0,m.hit-dt);if(m.dead){if(!m.boss){m.rt-=dt;if(m.rt<=0)Object.assign(m,spawnMob(m.camp))}continue}
  const d=D(m,h);if(d<(m.boss?170:110))m.aggro=1;if(Math.hypot(m.x-m.hx,m.y-m.hy)>(m.boss?300:260)){m.aggro=0;m.hp=m.mhp}
  if(m.aggro){const r=m.boss?80:46;if(d>r){const sp=m.boss?55:75;m.x+=(h.x-m.x)/d*sp*dt;m.y+=(h.y-m.y)/d*sp*dt}else{m.cd-=dt;if(m.cd<=0){m.cd=m.boss?1.6:1.3;h.combatT=0;
   if(R()<s.t.dg/100)addFx(h.x,h.y-90,'Dodge','#9fff6a');else{const dm=m.atk*(S.cls==='knight'?.8:1);h.hp-=dm;h.pose='hurt';h.pt=.3;addFx(h.x,h.y-90,'-'+fmt(dm),'#ff7a6a');if(h.hp<=0){heroDie();return}}}}}
  else{m.wt-=dt;if(m.wt<=0){m.wt=2+R()*3;m.tx=m.hx+(R()-.5)*200;m.ty=m.hy+(R()-.5)*140}if(m.tx!==undefined){const dx=m.tx-m.x,dy=m.ty-m.y,dd=Math.hypot(dx,dy);if(dd>4){m.x+=dx/dd*30*dt;m.y+=dy/dd*30*dt}}}}
 // drops: auto-pickup magnet
 F.drops=F.drops.filter(o=>{o.a+=dt;const d=D(o,h);if(d<110&&o.a>.4){o.x+=(h.x-o.x)*Math.min(1,dt*8);o.y+=(h.y-o.y)*Math.min(1,dt*8)}if(d<22){if(o.k==='gold')S.gold+=o.v;if(o.k==='key')S.keys+=o.v;if(o.k==='treat')S.treats+=o.v;addFx(h.x,h.y-100,o.k==='gold'?'+'+fmt(o.v)+' gold':o.k==='key'?'+'+o.v+' 🗝️':'+1 🍖','#ffd54a');return false}return o.a<60});
 // chest spawn
 F.ct-=dt;if(!F.chest&&F.ct<=0){F.chest={x:200+R()*1000,y:500+R()*1300};F.ct=60}
 F.dungT+=dt;
 // other players wander
 for(const o of F.others){o.w-=dt;if(o.w<=0){o.w=3+R()*6;const c=pick(['A','B','C','village']);o.tx=PTS[c][0]+(R()-.5)*160;o.ty=PTS[c][1]+(R()-.5)*100}const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);if(d>5){o.x+=dx/d*110*dt;o.y+=dy/d*110*dt;o.face=dx>0?1:-1}}
 F.fx=F.fx.filter(f=>{f.l+=dt;if(f.proj){const t=f.tx,dx=t.x-f.x,dy=t.y-40-f.y,d=Math.hypot(dx,dy);if(d<16||t.dead){if(!t.dead)hitMob(t,f.d,f.cr?'CRIT ':'');return false}f.x+=dx/d*600*dt;f.y+=dy/d*600*dt;return f.l<2}if(f.spark){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=500*dt;return f.l<.4}return f.l<(f.ring?.4:f.slash?.22:.9)});separate()}
function moveH(vx,vy,dt){const h=F.h,sp=h.mount?270:150;h.x=Math.max(30,Math.min(ZW-30,h.x+vx*sp*dt));h.y=Math.max(60,Math.min(ZH-30,h.y+vy*sp*dt));if(vx)h.face=vx>0?1:-1;h.walk=vx||vy?h.walk+dt:0}
function openFieldChest(){if(!F.chest)return;const k=rint(1,2),g=Math.round(30*Math.pow(1.12,zoneTier()));S.keys+=k;S.gold+=g;addFx(F.chest.x,F.chest.y-40,`+${k} 🗝️ +${fmt(g)} gold`,'#ffd54a');F.chest=null;save();render()}
// ---- draw
let CV,CX,CW,CH,DPR;
function resize(){const w=$('world');CV=$('cv');DPR=Math.min(2,devicePixelRatio||1);CW=w.clientWidth;CH=w.clientHeight;CV.width=CW*DPR;CV.height=CH*DPR;CX=CV.getContext('2d');
 const a=$('arena');if(a)a.style.setProperty('--ah',CH+'px')}
function camXY(){const h=F.h;return[Math.max(0,Math.min(ZW-CW,h.x-CW/2)),Math.max(0,Math.min(ZH-CH,h.y-CH*.55))]}
function spr(k,x,y,hgt,flip,alpha){const i=im(k);if(!i)return;const w=i.width*hgt/i.height;CX.save();CX.globalAlpha=alpha||1;CX.translate(x,y);if(flip)CX.scale(-1,1);CX.drawImage(i,-w/2,-hgt,w,hgt);CX.restore()}
function shadow(x,y,r){CX.fillStyle='#0004';CX.beginPath();CX.ellipse(x,y,r,r*.35,0,0,7);CX.fill()}
function tag(x,y,t,c){CX.font='bold 11px Arial';CX.textAlign='center';CX.lineWidth=3;CX.strokeStyle='#000a';CX.strokeText(t,x,y);CX.fillStyle=c||'#fff';CX.fillText(t,x,y)}
function bar(x,y,w,p,c){CX.fillStyle='#0a1734';CX.fillRect(x-w/2-1,y-1,w+2,7);CX.fillStyle=c;CX.fillRect(x-w/2,y,w*Math.max(0,p),5)}
function draw(){if(!F||!CX)return;const[cx,cy]=camXY(),th=THEME[S.isle%4],t=F.now,h=F.h;CX.setTransform(DPR,0,0,DPR,0,0);CX.drawImage(F.z.bg,cx,cy,CW,CH,0,0,CW,CH);CX.translate(-cx,-cy);
 const L=[];const vis=(x,y)=>x>cx-120&&x<cx+CW+120&&y>cy-40&&y<cy+CH+200;
 for(const d of F.z.deco)if(vis(d[0],d[1]))L.push([d[1],()=>{const[x,y,k,s]=d;if(k==='t'){shadow(x,y,26*s);CX.fillStyle='#5a3a1a';CX.fillRect(x-5*s,y-26*s,10*s,26*s);CX.fillStyle=th.t;CX.beginPath();CX.arc(x,y-44*s,28*s,0,7);CX.fill();CX.fillStyle=th.t2;CX.beginPath();CX.arc(x-8*s,y-52*s,16*s,0,7);CX.fill()}
  else if(k==='r'){shadow(x,y,18*s);CX.fillStyle=th.r;CX.beginPath();CX.ellipse(x,y-10*s,20*s,14*s,0,0,7);CX.fill();CX.fillStyle='#fff3';CX.beginPath();CX.ellipse(x-5*s,y-16*s,8*s,5*s,0,0,7);CX.fill()}
  else{shadow(x,y,50);CX.fillStyle='#e8d2a8';CX.fillRect(x-40,y-60,80,60);CX.fillStyle='#b8443a';CX.beginPath();CX.moveTo(x-52,y-58);CX.lineTo(x,y-100);CX.lineTo(x+52,y-58);CX.fill();CX.fillStyle='#6a4020';CX.fillRect(x-10,y-30,20,30)}}]);
 const q=Q();
 if(q.t==='portal'||S.q>=7)L.push([PTS.portal[1],()=>{spr('portal',PTS.portal[0],PTS.portal[1],120+Math.sin(t*3)*4);tag(PTS.portal[0],PTS.portal[1]-130,'Waygate','#9fe0ff')}]);
 for(const k in NPCS){const[x,y]=PTS[k];L.push([y,()=>{shadow(x,y,22);spr(NPCS[k].k,x,y,74);tag(x,y-82,NPCS[k].n,'#ffe066');if(q.t==='talk'&&q.who===k){CX.font='bold 26px Arial';CX.fillStyle='#ffd54a';CX.strokeStyle='#0a1734';CX.lineWidth=4;const yy=y-96+Math.sin(t*5)*4;CX.strokeText('!',x,yy);CX.fillText('!',x,yy)}}])}
 if(F.chest){const c=F.chest;L.push([c.y,()=>{shadow(c.x,c.y,20);CX.font='34px Arial';CX.textAlign='center';CX.fillText('🧰',c.x,c.y-4+Math.sin(t*4)*2);tag(c.x,c.y-40,'Treasure','#ffd54a')}])}
 for(const o of F.drops)L.push([o.y,()=>{CX.font='20px Arial';CX.textAlign='center';CX.fillText(o.k==='gold'?'🪙':o.k==='key'?'🗝️':'🍖',o.x,o.y-4-Math.abs(Math.sin(t*6+o.x))*5)}]);
 for(const m of F.mobs.concat(F.boss?[F.boss]:[]))if(!m.dead&&vis(m.x,m.y))L.push([m.y,()=>{const hh=m.boss?150:58;shadow(m.x,m.y,m.boss?50:20);if(m.boss){CX.strokeStyle='#ff3a2a88';CX.lineWidth=3;CX.beginPath();CX.ellipse(m.x,m.y,70,24,0,0,7);CX.stroke()}
  spr(m.k,m.x,m.y-Math.abs(Math.sin(t*4+m.hx))*3,hh,m.x<h.x,m.hit>0?.6:1);bar(m.x,m.y-hh-12,m.boss?90:44,m.hp/m.mhp,'#e2382a');tag(m.x,m.y-hh-16,`Lv${m.lv} ${m.n}`,m.boss?'#ff9a8a':F.tgt===m?'#ffe066':'#fff')}]);
 for(const o of F.others)if(vis(o.x,o.y))L.push([o.y,()=>{shadow(o.x,o.y,20);spr(o.c+'_idle',o.x,o.y,62,o.face<0,.95);tag(o.x,o.y-68,o.n,'#9fe0ff')}]);
 F.pets.forEach(p=>L.push([p.y,()=>{const st=p.p?p.p.st:0;shadow(p.x,p.y+18,14);spr(PETS[p.p.s].k,p.x,p.y-Math.sin(t*5+p.x*.01)*5,40*(1+st*.15),p.x>h.x+5?false:h.face<0)}]));
 L.push([h.y,()=>{if(h.dead>0){tag(h.x,h.y-40,'Reviving '+Math.ceil(h.dead)+'s','#ff9a8a');return}shadow(h.x,h.y,26);const by=h.walk?Math.abs(Math.sin(h.walk*10))*3:0;
  if(h.mount){spr('mount_wolf',h.x,h.y-by,64,h.face<0);spr((S.cls||'knight')+'_idle',h.x-h.face*4,h.y-34-by,62,h.face<0)}
  else spr((S.cls||'knight')+'_'+h.pose,h.x,h.y-by,74,h.face<0);
  bar(h.x,h.y-(h.mount?104:86),52,h.hp/hmax(),'#4cb82a');tag(h.x,h.y-(h.mount?108:90),S.name||'You','#9fff6a')}]);
 L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
 if(F.tgt&&!F.tgt.dead){const m=F.tgt;CX.strokeStyle='#ffd54a';CX.lineWidth=2;CX.beginPath();CX.ellipse(m.x,m.y,m.boss?60:26,m.boss?20:9,0,0,7);CX.stroke()}
 if(F.dest){CX.strokeStyle='#fff';CX.lineWidth=2;CX.beginPath();CX.arc(F.dest.x,F.dest.y,8+Math.sin(t*8)*3,0,7);CX.stroke()}
 for(const f of F.fx){if(f.proj){CX.fillStyle=f.c;CX.beginPath();CX.arc(f.x,f.y,S.cls==='mage'?7:4,0,7);CX.fill()}else if(f.ring){CX.strokeStyle='#ffd54a';CX.lineWidth=4;CX.globalAlpha=1-f.l/.4;CX.beginPath();CX.arc(f.x,f.y,20+f.l*200,0,7);CX.stroke();CX.globalAlpha=1}
  else{CX.globalAlpha=Math.max(0,1-f.l/.9);CX.font=`bold ${f.big?20:15}px Arial`;CX.textAlign='center';CX.lineWidth=3;CX.strokeStyle='#000';CX.strokeText(f.t,f.x,f.y-f.l*40);CX.fillStyle=f.c;CX.fillText(f.t,f.x,f.y-f.l*40);CX.globalAlpha=1}}
 CX.setTransform(DPR,0,0,DPR,0,0);
 if(F.joy){const j=F.joy;CX.globalAlpha=.5;CX.fillStyle='#fff';CX.beginPath();CX.arc(j.sx,j.sy,48,0,7);CX.fill();CX.globalAlpha=.9;CX.fillStyle='#3a6fd8';CX.beginPath();CX.arc(j.sx+j.dx*36,j.sy+j.dy*36,22,0,7);CX.fill();CX.globalAlpha=1}
 if(F.banner>0){CX.globalAlpha=Math.min(1,F.banner);CX.font='bold 22px Arial';CX.textAlign='center';CX.lineWidth=5;CX.strokeStyle='#0a1734';const n=ISLES[S.isle%4].n;CX.strokeText(n,CW/2,CH*.32);CX.fillStyle='#ffe066';CX.fillText(n,CW/2,CH*.32);CX.globalAlpha=1}
 drawHud();drawMini()}
function drawMini(){const c=$('mini');if(!c)return;const g=c.getContext('2d'),w=c.width,hh=c.height,sx=w/ZW,sy=hh/ZH;g.drawImage(F.z.bg,0,0,w,hh);
 const dot=(x,y,col,r)=>{g.fillStyle=col;g.beginPath();g.arc(x*sx,y*sy,r||2.5,0,7);g.fill()};for(const m of F.mobs)if(!m.dead)dot(m.x,m.y,'#e2382a',1.6);if(F.boss)dot(F.boss.x,F.boss.y,'#ff0',4);
 for(const k in NPCS)dot(...PTS[k],'#ffd54a',3);if(S.q>=7)dot(...PTS.portal,'#3ac8ff',4);for(const o of F.others)dot(o.x,o.y,'#9fe0ff',1.8);
 const t=questTarget();g.strokeStyle='#fff';g.lineWidth=1;g.setLineDash([2,2]);g.beginPath();g.moveTo(F.h.x*sx,F.h.y*sy);g.lineTo(t.x*sx,t.y*sy);g.stroke();g.setLineDash([]);dot(F.h.x,F.h.y,'#4cff4a',3.5)}
let hudK='';function drawHud(){const q=Q(),qs=$('qtr'),st=$('autost');const k=S.q+'|'+(S.qk||0)+'|'+S.isle;if(k!==hudK){hudK=k;qs.innerHTML=`<b>📜 Main · ${q.title}</b><span>${q.t==='kill'?`Defeat (${S.qk||0}/${q.n})`:q.t==='talk'?'Speak with '+NPCS[q.who].n:q.t==='boss'?'Boss lair, north':'Step into the Waygate'}</span>`}
 st.textContent=F.status;st.className=F.status.startsWith('🤖')?'on':'';const ab=$('autob');ab.classList.toggle('on',!!S.auto);ab.querySelector('small').textContent=S.auto?'AUTO ON':'AUTO OFF';
 SK.forEach((s,i)=>{const b=$('fs'+i);if(b)b.style.setProperty('--cd',F.h.sk[i]/s.cd)});
 const tf=$('tframe'),m=F.tgt;if(m&&!m.dead){tf.style.display='block';tf.innerHTML=`<b>Lv${m.lv} ${m.n}</b><div class="bar e"><i style="width:${m.hp/m.mhp*100}%"></i><span>${fmt(Math.max(0,m.hp))}</span></div>`}else tf.style.display='none';
 $('mtb').classList.toggle('on',!!F.h.mount);const av=$('avi'),ak=IMG[(S.cls||'knight')+'_idle'];if(av&&av.src!==ak)av.src=ak;drawDlg()}
// ---- input
function worldPt(e){const r=CV.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
function initInput(){let st=null;CV.addEventListener('pointerdown',e=>{const[x,y]=worldPt(e);st={x,y,t:performance.now(),moved:0};CV.setPointerCapture(e.pointerId)});
 CV.addEventListener('pointermove',e=>{if(!st)return;const[x,y]=worldPt(e),dx=x-st.x,dy=y-st.y,d=Math.hypot(dx,dy);if(d>12){st.moved=1;F.dest=null;const k=Math.min(1,d/48);F.joy={sx:st.x,sy:st.y,dx:dx/d*k,dy:dy/d*k}}});
 const up=e=>{if(!st)return;if(F.dlg&&!st.moved){dlgNext();st=null;return}if(!st.moved){const[cx,cy]=camXY(),wx=st.x+cx,wy=st.y+cy;F.manualT=F.now;
   const m=F.mobs.concat(F.boss?[F.boss]:[]).find(m=>!m.dead&&Math.hypot(m.x-wx,m.y-30-wy)<40);
   const npc=Object.keys(NPCS).find(k=>Math.hypot(PTS[k][0]-wx,PTS[k][1]-30-wy)<45);
   if(m){F.tgt=m;F.dest={x:m.x-(m.x>F.h.x?range()*.8:-range()*.8),y:m.y}}else if(npc)F.dest={x:PTS[npc][0]+40,y:PTS[npc][1]+20,act:()=>talk(npc)};
   else if(F.chest&&Math.hypot(F.chest.x-wx,F.chest.y-wy)<45)F.dest={x:F.chest.x,y:F.chest.y,act:openFieldChest};
   else if(S.q>=7&&Math.hypot(PTS.portal[0]-wx,PTS.portal[1]-40-wy)<70)F.dest={x:PTS.portal[0],y:PTS.portal[1]+30,act:enterPortal};else F.dest={x:wx,y:wy}}
  F.joy=null;F.manualT=F.now;st=null};CV.addEventListener('pointerup',up);CV.addEventListener('pointercancel',up)}
function toggleAuto(){S.auto=!S.auto;F.manualT=-99;F.dest=null;toast(S.auto?'Auto ON: your hero will quest, fight, loot and gear up':'Auto OFF',1);save()}
function questTrackerTap(){if(!S.auto){S.auto=true;toast('Auto-path on',1)}F.manualT=-99;F.dest=null}
// ---- overrides of old wave core
startFight=function(mode='story',opp){if(mode==='story'){B=null;$('arena').style.display='none';return}const s=stats();B={mode,opp,php:s.hp+s.ph,pmax:s.hp+s.ph,t:0,cd:[0,0,0],ft:0,ht:0,end:0};B.e=foeFor(mode);$('arena').style.display='block';tab=null;render();drawArena();
 $('arena').insertAdjacentHTML('beforeend','<button class="btn r sm aexit" onclick="B=null;startFight(\'story\')">Leave</button>')};
const _drawArena=drawArena;drawArena=function(){_drawArena();const qb=$('quest');if(qb)qb.remove();$('arena').insertAdjacentHTML('beforeend','<button class="btn r sm aexit" onclick="B=null;startFight(\'story\')">Leave</button>')};
render=function(){const s=stats();$('gold').textContent=fmt(S.gold);$('shards').textContent=fmt(S.shards);$('lvl').textContent='Lv '+S.lv;$('pw').textContent=fmt(s.power);
 $('xpb').style.width=Math.min(100,S.xp/Math.round(60*Math.pow(1.22,S.lv-1))*100)+'%';$('xpt').textContent=Math.floor(Math.min(100,S.xp/Math.round(60*Math.pow(1.22,S.lv-1))*100))+'%';
 document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('on',b.dataset.t===tab);b.classList.toggle('dot',dot(b.dataset.t))});
 const P=$('panel');if(!tab){P.style.display='none';return}P.style.display='block';P.innerHTML=`<div class="phd"><b>${{hero:'Hero & Gear',pets:'Dragons',nest:'Nest',quests:'Quests & Modes',lodge:'Lodge',shop:'Shop'}[tab]}</b><button onclick="tab=null;render()">✕</button></div>`+({hero:tHero,pets:tPets,nest:tNest,quests:tQuests,lodge:tLodge,shop:tShop})[tab](s)};
const _lv=gainXp;gainXp=function(x){const l=S.lv;_lv(x);if(S.lv>l&&F){F.h.hp=hmax();addFx(F.h.x,F.h.y-120,'LEVEL UP! Lv '+S.lv,'#ffe066',1)}};
function fieldInit(){tab=null;if(S.auto===undefined)S.auto=true;initZone();resize();initInput();addEventListener('resize',resize);
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=tab===b.dataset.t?null:b.dataset.t;render()});render();
 let last=performance.now();const loop=n=>{const dt=Math.min(.1,(n-last)/1000);last=n;try{step(dt);draw()}catch(e){console.error(e)}requestAnimationFrame(loop)};requestAnimationFrame(loop);
 setInterval(()=>{if(S.auto&&F&&!B){const d=dailyList().find(t=>!S.tdone[t.k]&&prog(t)>=t.n);if(d){S.tdone[d.k]=1;S.shards+=d.r;toast('Auto-claimed: '+d.n2+' +'+d.r+' 💎',1);save()}if(S.claimed<S.login-1)claimLogin()}},5000)}
