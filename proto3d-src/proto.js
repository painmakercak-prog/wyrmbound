// ===== Journey of Aethra 3D prototype: game-side overrides (loaded after game.js/field.js/gfx3.js) =====
// Classes (DT2-style roster; logic shares the original 3 archetypes)
CLASSES.knight.n='Swordsman';CLASSES.knight.e='⚔️';CLASSES.ranger.n='Archer';CLASSES.mage.n='Sorcerer';
CLASSES.assassin={n:'Assassin',d:'Twin daggers. Huge crits, lighter armor.',e:'🗡️',atk:1.3,hp:.9};
CLASSES.scholar={n:'Scholar',d:'Tome magic. Steady ranged damage and strong heals.',e:'📖',atk:1.05,hp:1.1};
const CLS_ORDER=['knight','ranger','mage','assassin','scholar'];
const MELEE={knight:1,assassin:1};
range=function(){return MELEE[S.cls]?58:(S.cls==='mage'||S.cls==='scholar')?170:190};
const SKI={knight:['swordsman_flame_slash','swordsman_whirlwind'],ranger:['archer_power_shot','archer_arrow_rain'],mage:['sorcerer_rune_orb','sorcerer_storm'],assassin:['assassin_shadow_blades','swordsman_whirlwind'],scholar:['sorcerer_rune_orb','scholar_tome_heal']};
const SKN={knight:['Flame Slash','Whirlwind'],ranger:['Power Shot','Arrow Rain'],mage:['Rune Orb','Storm'],assassin:['Shadow Blades','Whirl'],scholar:['Rune Orb','Tome Bolt']};
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
