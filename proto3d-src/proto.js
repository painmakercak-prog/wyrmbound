// ===== Journey of Aethra 3D prototype: game-side overrides (loaded after game.js/field.js/gfx3.js) =====
// Classes (DT2-style roster; logic shares the original 3 archetypes)
CLASSES.knight.n='Swordsman';CLASSES.knight.e='⚔️';CLASSES.ranger.n='Archer';CLASSES.mage.n='Sorcerer';
CLASSES.assassin={n:'Assassin',d:'Twin daggers. Huge crits, lighter armor.',e:'🗡️',atk:1.3,hp:.9};
CLASSES.scholar={n:'Scholar',d:'Tome magic. Steady ranged damage and strong heals.',e:'📖',atk:1.05,hp:1.1};
CLASSES.gunslinger={n:'Gunslinger',d:'Revolver deadeye. Longest range, fastest shots, crit build.',e:'🤠',atk:1.2,hp:.95};
if(IMG.ranger_idle){IMG.gunslinger_idle=IMG.ranger_idle;IMG.gunslinger_attack=IMG.ranger_attack;IMG.gunslinger_hurt=IMG.ranger_hurt}
const CLS_ORDER=['knight','ranger','mage','assassin','scholar','gunslinger'];
const MELEE={knight:1,assassin:1};
range=function(){return MELEE[S.cls]?58:S.cls==='gunslinger'?205:(S.cls==='mage'||S.cls==='scholar')?170:190};
const SKI={knight:['swordsman_flame_slash','swordsman_whirlwind'],ranger:['archer_power_shot','archer_arrow_rain'],mage:['sorcerer_rune_orb','sorcerer_storm'],assassin:['assassin_shadow_blades','swordsman_whirlwind'],scholar:['sorcerer_rune_orb','scholar_tome_heal'],gunslinger:['archer_power_shot','archer_arrow_rain']};
const SKN={knight:['Flame Slash','Whirlwind'],ranger:['Power Shot','Arrow Rain'],mage:['Rune Orb','Storm'],assassin:['Shadow Blades','Whirl'],scholar:['Rune Orb','Tome Bolt'],gunslinger:['Deadeye Shot','Fan the Hammer']};
classPick=function(){}; // class select is the 3D screen (g3d.js)
if(S.autoSkill===undefined)S.autoSkill=false; // auto-skill toggle, OFF by default (auto basic attacks always on)
function toggleAutoSkill(){S.autoSkill=!S.autoSkill;toast(S.autoSkill?'Auto Skill ON':'Auto Skill OFF: tap skills yourself',1);save();hudSkills()}
function hudSkills(){const c=S.cls||'knight',U=window.UI||{};for(let i=0;i<2;i++){const b=$('fs'+i);if(b){b.querySelector('img').src=U['skills_'+SKI[c][i]]||'';b.querySelector('small').textContent=SKN[c][i]}}
 const a=$('ask');if(a){a.classList.toggle('on',!!S.autoSkill);a.textContent=S.autoSkill?'AUTO SKILL ON':'AUTO SKILL OFF'}
 [[3,15],[4,30]].forEach(([i,l])=>{const b=$('fs'+i);if(b){const lk=S.lv<l;b.classList.toggle('lock',lk);b.querySelector('small').textContent=lk?`Lv ${l} unlock`:'Soon'}})}
// Big attack button: lock nearest enemy and walk into range (manual nudge; auto resumes after 4s)
function attackBtn(){if(!F||F.h.dead)return;const m=nearest(F.mobs.concat(F.boss?[F.boss]:[]).filter(m=>!m.dead&&D(m,F.h)<520));if(!m){toast('No enemies nearby',1);return}
 F.tgt=m;F.manualT=F.now;const d=D(m,F.h);if(d>range())F.dest={x:m.x-(m.x-F.h.x)/d*range()*.8,y:m.y-(m.y-F.h.y)/d*range()*.8}}
// ---- visible power growth
let PWS=null,PWL=null;
function powerTick(){if(!F)return;const p=stats().power;if(PWS===null){PWS=PWL=p}
 if(p>PWL){powerPop(p-PWL)}PWL=p;PWS+=(p-PWS)*.18;if(Math.abs(p-PWS)<1)PWS=p;const e=$('pw');if(e)e.textContent=Math.round(PWS).toLocaleString();
 // upgrade arrows on nav
 const up={hero:S.keys>0,pets:S.treats>0,nest:S.eggs>0};document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('upg',!!up[b.dataset.t]))}
function powerPop(d){const w=$('pwpop');if(!w)return;const s=document.createElement('div');s.className='pp';s.innerHTML=`<img src="${(window.UI||{}).fx_power_up_arrow||''}">+${fmt(Math.round(d))}`;w.appendChild(s);setTimeout(()=>s.remove(),1600);
 const t=$('pw');if(t){t.classList.remove('bump');void t.offsetWidth;t.classList.add('bump')}}
const _gx=gainXp;gainXp=function(x){const l=S.lv;_gx(x);if(S.lv>l){render();const b=$('lvban');$('lvbt').textContent='Lv '+S.lv;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');AUD.sting('stinger_levelup');if(window.G3D)G3D.burst();hudSkills()}};
const _qd=questDone;questDone=function(){_qd();AUD.sting('stinger_quest_complete')};
const _ag=autoGear;autoGear=function(){const r=_ag();if(r){const w=$('gearpop');if(w){w.classList.remove('on');void w.offsetWidth;w.classList.add('on')}}return r};
// ---- community (SIMULATED: offline prototype, no server; names and chat are generated locally)
const TITLES=['Meadow Warden','Dawn Seeker','Wolf Rider','Star Tamer','Grove Guard'];
const SYSL=n=>pick([`${n} reached Power ${fmt(rint(8,90)*1000)}!`,`${n} hatched a rare dragon!`,`${n} cleared Bloomvale's field boss`,`${n} joined guild Emberwing`]);
function chatRender(){const c=$('chatl');if(!c)return;c.innerHTML=chatLog.slice(-3).map(m=>m[2]?`<p><i class="sys">System</i> ${m[1]}</p>`:`<p><i>World</i> <b>${m[0]}:</b> ${m[1]}</p>`).join('')}
const _ct=chatTick;chatTick=function(){_ct();if(R()<.12){chatLog.push(['',SYSL(pick(NAMES)),1])}chatRender()};// SIMULATED
function guildM(){modal(`<h3>Guild</h3><p class="ctr"><b>Emberwing</b> · Lv 4 · 18/30 members<br><small>SIMULATED in this prototype</small></p>${NAMES.slice(0,6).map((n,i)=>`<div class="srw"><span>${n}${i?'':' (Leader)'}</span><b>Power ${fmt(42000-i*5100)}</b></div>`).join('')}<button class="btn g" onclick="closeM()">Close</button>`)}
function friendsM(){modal(`<h3>Friends</h3><p class="ctr"><small>SIMULATED in this prototype</small></p>${NAMES.slice(6,11).map((n,i)=>`<div class="srw"><span>${i<2?'🟢':'⚪'} ${n}</span><b>${i<2?'Online':'Offline'}</b></div>`).join('')}<button class="btn g" onclick="closeM()">Close</button>`)}
// ---- monetization UI: premium currency (Starshards 💎, earned in game) ONLY. No real money anywhere.
if(S.vip===undefined)S.vip=0;if(!S.packs)S.packs={};
const VIPC=[300,800,2000];
function vipM(){const n=S.vip,c=VIPC[n];modal(`<h3>VIP ${n}</h3><p class="ctr">VIP perks: +10% gold and +1 relic key per quest per level.<br><small>Paid with 💎 Starshards earned in game. No real money.</small></p>
 ${c?`<button class="btn y big" onclick="buyVip()">Upgrade to VIP ${n+1} · 💎${c}</button>`:'<p class="ctr"><b>Max VIP reached</b></p>'}<button class="btn" onclick="closeM()">Close</button>`)}
function buyVip(){const c=VIPC[S.vip];if(!c)return;if(S.shards<c){toast('Not enough 💎 Starshards. Earn more from quests and bosses.');return}S.shards-=c;S.vip++;save();render();vipHud();closeM();toast('VIP '+S.vip+' unlocked!')}
function vipHud(){const e=$('vipl');if(e)e.textContent='VIP '+S.vip}
const PACKS=[{k:'starter',n:'Starter Pack',d:'10 🗝️ keys · 5 🍖 treats · 1 🥚 egg',c:120,f:()=>{S.keys+=10;S.treats+=5;S.eggs++}},{k:'tamer',n:'Tamer Pack',d:'3 🥚 eggs · 20 🍖 treats',c:400,f:()=>{S.eggs+=3;S.treats+=20}},{k:'forge',n:'Forge Pack',d:'30 🗝️ relic keys',c:250,f:()=>{S.keys+=30}}];
function packsM(){modal(`<h3>Packs</h3><p class="ctr"><small>💎 Starshards only (earned in game). No real money.</small></p>${PACKS.map(p=>`<div class="shop"><span class="si">🎁</span><div><b>${p.n}</b><small>${p.d}</small></div><button class="btn g sm" ${S.packs[p.k]?'disabled':''} onclick="buyPack('${p.k}')">${S.packs[p.k]?'Owned':'💎'+p.c}</button></div>`).join('')}<button class="btn" onclick="closeM()">Close</button>`)}
function buyPack(k){const p=PACKS.find(x=>x.k===k);if(!p||S.packs[k])return;if(S.shards<p.c){toast('Not enough 💎 Starshards');return}S.shards-=p.c;S.packs[k]=1;p.f();save();render();packsM();toast(p.n+' claimed!')}
// ---- side modes registry (architecture for minigames; next milestone = Hunting Stage idle mode)
const MODES={};function registerMode(id,def){MODES[id]=def}let MODE=null;
function enterMode(id){const m=MODES[id];if(!m)return;if(m.soon){toast(m.n+' is coming in the next update',1);return}MODE=m;B={mode:'side:'+id};m.enter&&m.enter();if(window.G3D)G3D.setScene(m.scene||'field')}
function exitMode(){if(MODE&&MODE.exit)MODE.exit();MODE=null;B=null;if(window.G3D)G3D.setScene('field')}
registerMode('hunt',{n:'Hunting Stage',soon:1,scene:'hunt'});registerMode('trial',{n:'Extra Trials',soon:1});
function eventsM(){modal(`<h3>Events</h3>${Object.entries(MODES).map(([k,m])=>`<div class="shop"><span class="si">🏹</span><div><b>${m.n}</b><small>${m.soon?'Coming soon':'Open'}</small></div><button class="btn b sm" onclick="closeM();enterMode('${k}')">Go</button></div>`).join('')}<button class="btn" onclick="closeM()">Close</button>`)}
// ---- audio: WebAudio gain crossfade (works on iOS; unlocked by the first tap)
const AUD={ctx:null,tr:{},cur:'title_theme',mute:!!S.mute,urls:{},
 init(urls){this.urls=urls},
 start(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=this.mute?0:1;this.master.connect(this.ctx.destination);
  for(const k of['title_theme','meadow_theme','combat_loop','boss_fight']){if(!this.urls[k])continue;const a=new Audio(this.urls[k]);a.loop=true;a.preload='auto';const g=this.ctx.createGain();g.gain.value=0;this.ctx.createMediaElementSource(a).connect(g);g.connect(this.master);this.tr[k]={a,g,v:0}}
  this.ctx.resume();this.set(this.cur);setInterval(()=>this.step(),100)},
 set(k){this.cur=k;const t=this.tr[k];if(t&&t.a.paused)t.a.play().catch(()=>{})},
 step(){if(F&&!document.getElementById('ttl')&&!document.getElementById('cs')?.classList.contains('on')){let k='meadow_theme';if(F.boss&&!F.boss.dead&&D(F.boss,F.h)<450)k='boss_fight';else if(F.h.combatT<2.5)k='combat_loop';if(k!==this.cur)this.set(k)}
  for(const[k,t]of Object.entries(this.tr)){const tg=k===this.cur?.55:0;t.v+=(tg-t.v)*.12;if(Math.abs(tg-t.v)<.005)t.v=tg;t.g.gain.value=t.v;if(t.v===0&&!t.a.paused&&k!==this.cur)t.a.pause();else if(t.v>0&&t.a.paused)t.a.play().catch(()=>{})}},
 sting(k){if(!this.ctx||!this.urls[k])return;const a=new Audio(this.urls[k]),g=this.ctx.createGain();g.gain.value=.55*.7;this.ctx.createMediaElementSource(a).connect(g);g.connect(this.master);a.play().catch(()=>{})},
 toggle(){this.mute=!this.mute;S.mute=this.mute;save();if(this.master)this.master.gain.value=this.mute?0:1;muteHud()}};
function muteHud(){const b=$('mute');if(b)b.textContent=AUD.mute?'🔇':'🔊'}
function creditsM(){modal(`<h3>Credits</h3><div class="card" style="max-height:52dvh;overflow:auto">${(window.CREDITS_HTML||'')}</div><button class="btn" onclick="closeM()">Close</button>`)}
setInterval(powerTick,100);
const _rd=render;render=function(){_rd();if(PWS!==null){const e=$('pw');if(e)e.textContent=Math.round(PWS).toLocaleString()}vipHud()};

// smooth hero locomotion: eased velocity instead of instant full speed (world speeds: walk/jog 3.8 u/s, wolf mount 6.2 u/s)
const HSPD=38,MSPD=62;
function moveH(vx,vy,dt){const h=F.h,sp=h.mount?MSPD:HSPD;h.vx=h.vx||0;h.vy=h.vy||0;const k=Math.min(1,dt*((vx||vy)?5:8));h.vx+=(vx*sp-h.vx)*k;h.vy+=(vy*sp-h.vy)*k;if(Math.abs(h.vx)+Math.abs(h.vy)<.5&&!vx&&!vy){h.vx=h.vy=0}
 h.x=Math.max(30,Math.min(ZW-30,h.x+h.vx*dt));h.y=Math.max(60,Math.min(ZH-30,h.y+h.vy*dt));if(vx)h.face=vx>0?1:-1;h.walk=vx||vy?h.walk+dt:0}
{const _us=useSkillF;useSkillF=function(i){const b=F.h.sk[i];_us(i);if(F.h.sk[i]!==b)F.h.skAnim=(F.h.skAnim||0)+1}}

// level-up: keep only the banner
{const _f=addFx;addFx=function(x,y,t,...r){if(typeof t==='string'&&t.startsWith('LEVEL UP'))return;return _f(x,y,t,...r)};const _t=toast;toast=function(t,...r){if(typeof t==='string'&&t.startsWith('Level up!'))return;return _t(t,...r)}}

// ===== FEEL PASS: tuning + synthesized SFX + hit feel. Every number lives in FEEL. =====
// All SFX are synthesized live with WebAudio (original, no audio files, no packs) and route
// through AUD.master, so the existing sound toggle (AUD.toggle / S.mute) mutes everything.
const FEEL={stopCrit:.06,stopBossHit:.1,stopBossKill:.15,stopGap:.25,kbMob:9,kbBoss:1.5,shakeCrit:.16,shakeSlam:.34,shakeBossDie:.5,burstN:12,sfxVol:.9,
 vol:{hit:.45,crit:.65,hurt:.55,die:.55,bossDie:.9,pickup:.4,chest:.55,equip:.5,skill:.55,tap:.22},
 skillHz:{knight:160,ranger:900,mage:520,assassin:1200,scholar:660,gunslinger:340}};
let _stopT=0,_feelT=0,_gapUntil=0,_lastHitSfx=0,_lastHurtSfx=0,_lastPickSfx=0,_lastTapSfx=0,_pvHp=null,_pvGold=null,_pvKeys=null,_pvTreats=null;
function stopFor(sec){if(_stopT>0||_feelT<_gapUntil)return;_stopT=sec;if(window.G3D&&G3D.freeze)G3D.freeze(1)}
AUD.sfxGain=null;
AUD.sfx=function(n){if(!this.ctx||this.mute)return;const C=this.ctx,t=C.currentTime;
 if(!this.sfxGain){this.sfxGain=C.createGain();this.sfxGain.gain.value=FEEL.sfxVol;this.sfxGain.connect(this.master)}
 const out=this.sfxGain,V=FEEL.vol;
 const tone=(f0,f1,d,type,v,when=0)=>{const o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f0,t+when);o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+when+d);g.gain.setValueAtTime(v,t+when);g.gain.exponentialRampToValueAtTime(.001,t+when+d);o.connect(g);g.connect(out);o.start(t+when);o.stop(t+when+d+.02)};
 const nz=(d,v,fc,when=0)=>{const len=Math.max(1,(C.sampleRate*d)|0),buf=C.createBuffer(1,len,C.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<len;i++)ch[i]=Math.random()*2-1;const s=C.createBufferSource();s.buffer=buf;const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=fc;const g=C.createGain();g.gain.setValueAtTime(v,t+when);g.gain.exponentialRampToValueAtTime(.001,t+when+d);s.connect(f);f.connect(g);g.connect(out);s.start(t+when)};
 switch(n){
  case 'hit':nz(.07,V.hit,1800);tone(190,120,.07,'square',V.hit*.5);break;
  case 'crit':nz(.1,V.crit,3200);tone(880,240,.14,'sawtooth',V.crit*.6);tone(1560,1560,.07,'sine',V.crit*.5,.01);break;
  case 'hurt':tone(140,60,.16,'sine',V.hurt);nz(.1,V.hurt*.6,500);break;
  case 'die':nz(.18,V.die,900);tone(320,55,.25,'triangle',V.die);break;
  case 'bossDie':tone(200,38,.55,'sine',V.bossDie);nz(.45,V.bossDie*.8,700);tone(90,45,.6,'square',V.bossDie*.5,.03);break;
  case 'pickup':tone(920,920,.06,'sine',V.pickup);tone(1380,1380,.09,'sine',V.pickup,.05);break;
  case 'chest':nz(.05,V.chest,2400);tone(520,780,.09,'triangle',V.chest,.04);tone(780,1180,.12,'triangle',V.chest,.1);break;
  case 'equip':tone(620,620,.05,'square',V.equip*.7);tone(930,930,.08,'square',V.equip*.7,.045);break;
  case 'tap':tone(1250,1250,.03,'sine',V.tap);break;
  default:{const hz=FEEL.skillHz[S.cls]||600;nz(.14,V.skill,2600);tone(hz,hz*.5,.16,'sawtooth',V.skill*.55);tone(hz*1.5,hz*1.5,.07,'sine',V.skill*.4,.02)}}};
// hit / crit: sound, hit-stop, knockback (bosses barely move)
const _hmF=hitMob;hitMob=function(m,d,tag,c){const crit=tag==='CRIT ',skill=tag==='SK',pet=c==='#ffd0ff';_hmF(m,d,tag,c);const now=performance.now();
 if(crit){if(window.G3D&&G3D.shake)G3D.shake(FEEL.shakeCrit);if(now-_lastHitSfx>50){_lastHitSfx=now;AUD.sfx('crit')}}
 else if(now-_lastHitSfx>55){_lastHitSfx=now;AUD.sfx('hit')}
 if(m.boss){if(skill)stopFor(FEEL.stopBossHit);else if(crit&&!pet)stopFor(FEEL.stopCrit)}
 else if(crit&&!pet)stopFor(FEEL.stopCrit);
 if(F&&F.h){let ox=F.h.x,oy=F.h.y,kb=m.boss?FEEL.kbBoss:FEEL.kbMob;
  if(pet){kb*=.5;let bp=null,bd=1e9;for(const fp of F.pets){const dd=D(fp,m);if(dd<bd){bd=dd;bp=fp}}if(bp){ox=bp.x;oy=bp.y}}
  const dx=m.x-ox,dy=m.y-oy,dd=Math.hypot(dx,dy)||1;m.x=Math.max(30,Math.min(ZW-30,m.x+dx/dd*kb));m.y=Math.max(60,Math.min(ZH-30,m.y+dy/dd*kb))}};
// deaths: sound, hit-stop, extra burst + ring (the 3D die animation and sink already play in g3d)
const _kmF=killMob;killMob=function(m){_kmF(m);AUD.sfx(m.boss?'bossDie':'die');if(m.boss)stopFor(FEEL.stopBossKill);
 sparks(m.x,m.y-34,'#ffffff',FEEL.burstN);F.fx.push({ring:1,x:m.x,y:m.y});if(m.boss&&window.G3D&&G3D.shake)G3D.shake(FEEL.shakeBossDie)};
// skill casts: one synthesized voice per class
const _usF=useSkillF;useSkillF=function(i){const b=F&&F.h?F.h.sk[i]:0;_usF(i);if(F&&F.h&&F.h.sk[i]!==b)AUD.sfx('skill')};
// chest + equip
const _ocF=openChest;openChest=function(){const r=_ocF();if(r)AUD.sfx('chest');return r};
const _eqF=equip;equip=function(){_eqF();AUD.sfx('equip')};
// hit-stop clock + hurt/pickup detection (watches hp and currency deltas each frame)
const _stF=step;step=function(dt){_feelT+=dt;
 if(_stopT>0){_stopT-=dt;if(_stopT<=0){_stopT=0;_gapUntil=_feelT+FEEL.stopGap;if(window.G3D&&G3D.freeze)G3D.freeze(0)}_stF(0)}else _stF(dt);
 if(!F)return;const h=F.h,now=performance.now();
 if(_pvHp!==null&&h.hp<_pvHp-.5&&h.dead<=0){if(now-_lastHurtSfx>150){_lastHurtSfx=now;AUD.sfx('hurt')}if(_pvHp-h.hp>hmax()*.09&&window.G3D&&G3D.shake)G3D.shake(FEEL.shakeSlam)}
 _pvHp=h.hp;
 if(_pvGold===null){_pvGold=S.gold;_pvKeys=S.keys;_pvTreats=S.treats}
 else if((S.gold>_pvGold||S.keys>_pvKeys||S.treats>_pvTreats)&&now-_lastPickSfx>70){_lastPickSfx=now;AUD.sfx('pickup')}
 _pvGold=S.gold;_pvKeys=S.keys;_pvTreats=S.treats};
// menu button taps (skill cluster excluded: casts have their own sound)
document.addEventListener('pointerdown',e=>{if(!e.target.closest||!e.target.closest('button')||e.target.closest('.skills'))return;const now=performance.now();if(now-_lastTapSfx<60)return;_lastTapSfx=now;AUD.sfx('tap')},true);

// ---- field-native Boss Hunt + arena leak guard (3D build: the 2D arena chain soft-locked the field) ----
startFight=function(){B=null};
huntGo=function(){if(S.hunt<1){toast('No hunts left today');return}if(!F){toast('Enter the field first');return}S.hunt--;F.boss=spawnBoss();F.boss.hunt=1;F.banner=3;toast('Boss Hunt: '+F.boss.n+' stirs in the north lair!');if(AUD.sting)AUD.sting('quest');save();render()};
const _qtF=questTarget;questTarget=function(){if(F&&F.boss&&F.boss.hunt&&!F.boss.dead)return{x:F.boss.x,y:F.boss.y,kind:'mob',m:F.boss,label:'boss hunt: '+F.boss.n};return _qtF()};
const _kmB=killMob;killMob=function(m){if(m.boss)S.bossKills=(S.bossKills||0)+1;_kmB(m)};
const _kmH=killMob;killMob=function(m){const wasHunt=!!(m.boss&&m.hunt);_kmH(m);if(wasHunt){S.shards+=30;S.eggs++;toast('Boss hunted! +30 💎 +1 🥚');save()}};


// ---- M4: power milestones + first-session goals (7-day login track and 8h offline earnings already ship in game.js) ----
const PMS=[1000,2500,5000,10000,20000,40000,80000];
const FSGOALS=[['Reach level 5',()=>S.lv>=5],['Defeat 25 foes',()=>S.kills>=25],['Open 3 relic chests',()=>(S.stat.chest||0)>=3],['Slay any boss',()=>(S.bossKills||0)>=1],['Equip 4 pieces of gear',()=>Object.keys(S.gear).length>=4]];
let _fsT=0;
function m4Tick(){if(!F)return;const now=F.now;if(now-_fsT<1)return;_fsT=now;
 const pw=stats().power;
 while((S.pms||0)<PMS.length&&pw>=PMS[S.pms]){const i=S.pms;S.pms++;const r=25*(i+1);S.shards+=r;toast(`🏆 Power milestone ${fmt(PMS[i])}! +${r} 💎`);if(AUD.sting)AUD.sting('level');save()}
 FSGOALS.forEach((g,i)=>{const k='g'+i;if(!S.fs[k]&&g[1]()){S.fs[k]=1;S.shards+=20;toast(`⭐ First steps ${i+1}/5: ${g[0]} +20 💎`);if(AUD.sting)AUD.sting('quest');
  if(FSGOALS.every((_,j)=>S.fs['g'+j])){S.shards+=100;S.eggs++;toast('🌟 First Steps complete! +100 💎 +1 🥚')}save()}})}
const _stM4=step;step=function(dt){_stM4(dt);m4Tick()};
const _tqM4=tQuests;tQuests=function(){const done=FSGOALS.filter((_,i)=>S.fs['g'+i]).length;
 return `<div class="card"><b>⭐ First Steps (${done}/5)</b>${FSGOALS.map((g,i)=>`<div class="task"><span>${S.fs['g'+i]?'✅':'▫️'} ${g[0]}</span><small>+20 💎</small></div>`).join('')}<div class="task"><span>🏆 Power milestones</span><small>${S.pms||0}/${PMS.length} claimed</small></div></div>`+_tqM4()};
