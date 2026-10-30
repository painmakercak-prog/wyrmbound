'use strict';
const $=id=>document.getElementById(id),R=Math.random,rint=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)];
const fmt=n=>n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString();
const img=(k,fb)=>IMG[k]?`<img src="${IMG[k]}" class="ai">`:`<span class="ph">${fb||'?'}</span>`;
// ---------- data ----------
const CLASSES={knight:{n:'Wyrmguard',d:'Sword and shield. +40% HP, takes 20% less damage.',e:'🛡️',atk:1,hp:1.4},
 mage:{n:'Emberseer',d:'Fire staff. Skills hit 60% harder.',e:'🔥',atk:1.1,hp:.95},
 ranger:{n:'Skyhunter',d:'Longbow. +15% crit chance and faster shots.',e:'🏹',atk:1.15,hp:1}};
const RAR=['Common','Uncommon','Rare','Epic','Mythic'],RC=['#9aa7b8','#55c24a','#3a8cf0','#a650f0','#ff9a1a'];
const SLOTS=['weapon','helm','armor','gloves','boots','charm'],SLN={weapon:'Weapon',helm:'Helm',armor:'Armor',gloves:'Gloves',boots:'Boots',charm:'Charm'};
const SLE={weapon:'⚔️',helm:'⛑️',armor:'🥋',gloves:'🧤',boots:'👢',charm:'📿'};
const GN={weapon:['Blade','Bow','Staff','Fang'],helm:['Cap','Circlet','Crest'],armor:['Mail','Robe','Coat'],gloves:['Grips','Wraps'],boots:['Treads','Striders'],charm:['Amulet','Totem','Locket']};
const ICON={weapon:['wpn_battle_axe','wpn_crystal_staff','wpn_flame_greatsword','wpn_longbow','wpn_magic_orb','wpn_spear','wpn_steel_sword','wpn_thunder_hammer','wpn_twin_daggers','wpn_wand'],helm:['arm_knight_helm','arm_wizard_hat'],armor:['arm_chestplate','arm_leather_vest'],gloves:['arm_gauntlets'],boots:['arm_boots'],charm:['amulet_emerald','ring_ruby','ring_sapphire','arm_round_shield']};
const GA=['Mossy','Brave','Coral','Ember','Frost','Storm','Sunlit','Moonlit','Ancient','Starforged'];
const SUB={cc:{n:'Crit Chance',p:1,r:[1,3]},cd:{n:'Crit Damage',p:1,r:[4,10]},as:{n:'Attack Speed',p:1,r:[2,5]},ls:{n:'Lifesteal',p:1,r:[1,2.5]},
 bd:{n:'Boss Damage',p:1,r:[3,8]},pd:{n:'Pet Damage',p:1,r:[3,8]},rg:{n:'Regen',p:0,r:[2,6]},dg:{n:'Dodge',p:1,r:[1,2.5]}};
const PETS=[
 {k:'comp_fire_drake',n:'Cinderwing',e:'🐉',role:'dps',ev:['Cinderwing','Blazewing','Pyre Regent']},
 {k:'comp_leaf_dragon',n:'Mossnout',e:'🐉',role:'tank',ev:['Mossnout','Grovescale','Elder Thicket']},
 {k:'comp_frost_wyrm',n:'Rimecoil',e:'🐉',role:'dps',ev:['Rimecoil','Glacierfang','Frost Sovereign']},
 {k:'comp_storm_dragon',n:'Voltkin',e:'🐉',role:'dps',ev:['Voltkin','Thundercrest','Stormmonarch']},
 {k:'comp_sun_dragon',n:'Dawnpip',e:'🐉',role:'support',ev:['Dawnpip','Sunmane','Solar Oracle']},
 {k:'comp_shadow_dragon',n:'Umbrakit',e:'🐉',role:'tank',ev:['Umbrakit','Duskhide','Night Warden']}];
const PBR=[0,0,1,2,2,3];
const ISLES=[{n:'Bloomvale Meadow',bg:'bg_meadow',foes:['enemy_helmet_slime','enemy_mushroom_goblin','enemy_frog_shaman'],boss:'boss_treant_king'},
 {n:'Sunken Ruins',bg:'bg_ruins',foes:['enemy_crab_knight','enemy_skeleton_archer','enemy_wolf_bandit'],boss:'boss_bone_lich_dragon'},
 {n:'Frostvein Peaks',bg:'bg_frost',foes:['enemy_stone_golem','enemy_wolf_bandit','enemy_bat_imp'],boss:'boss_bone_lich_dragon'},
 {n:'Ashcrown Caldera',bg:'bg_volcano',foes:['enemy_bat_imp','enemy_stone_golem','enemy_skeleton_archer'],boss:'boss_lava_titan'}];
const FOE={enemy_helmet_slime:['Pot-Helm Slime','🟢'],enemy_mushroom_goblin:['Capshroom Goblin','🍄'],enemy_frog_shaman:['Bog Croaker','🐸'],enemy_crab_knight:['Shellguard','🦀'],
 enemy_skeleton_archer:['Bone Archer','💀'],enemy_wolf_bandit:['Wolfpack Raider','🐺'],enemy_stone_golem:['Rubble Golem','🪨'],enemy_bat_imp:['Flitterfang','🦇'],
 boss_treant_king:['Gnarlroot, the Old King','🌳'],boss_bone_lich_dragon:['Ossivar the Hollow','☠️'],boss_lava_titan:['Magmor the Molten','🌋']};
const NAMES=['Kaito','Mira','Bramblejack','Luma','Torvi','Sable','Nix','Orrin','Pip','Yara','Fen','Rook','Ivy','Juno','Kestrel','Wren','Tamsin','Bo','Odessa','Quill'];
// ---------- state ----------
const DEF=()=>({v:1,cls:null,name:'Hero',lv:1,xp:0,gold:300,shards:120,eggs:2,treats:10,keys:5,isle:0,stage:1,wave:1,best:1,
 gear:{},bag:[],pets:[],team:[],auto:true,autoSell:0,tower:1,hunt:3,arena:5,arenaPts:1000,lodge:{lv:1,xp:0,don:0,buffA:0,buffH:0},
 day:'',login:0,claimed:-1,tasks:{},tdone:{},sound:1,t:Date.now(),kills:0,stat:{hatch:0,chest:0,feed:0,arena:0,kills:0}});
let S;try{S=Object.assign(DEF(),JSON.parse(localStorage.getItem('wyrm1')||'null')||{})}catch(e){S=DEF()}
const save=()=>{S.t=Date.now();localStorage.setItem('wyrm1',JSON.stringify(S))};
// ---------- items ----------
function rollRar(boost){const r=R()*100;const t=[[4,.6+boost*.4],[3,3+boost*2],[2,12+boost*4],[1,32]];for(const[k,p]of t)if(r<p)return k;return 0}
function mkItem(slot,r){slot=slot||pick(SLOTS);r=r??rollRar(0);const lv=Math.max(1,S.lv+rint(-2,2));const m=[1,1.35,1.8,2.5,3.6][r];
 const isW=slot==='weapon'||slot==='gloves'||slot==='charm';
 const it={id:Date.now()+R(),slot,r,lv,ic:pick(ICON[slot]),name:pick(GA)+' '+pick(GN[slot]),atk:Math.round((isW?6:2)*lv*m+rint(0,3)),hp:Math.round((isW?20:55)*lv*m+rint(0,10)),sub:{}};
 const ks=Object.keys(SUB).sort(()=>R()-.5).slice(0,r);for(const k of ks){const[a,b]=SUB[k].r;it.sub[k]=Math.round((a+R()*(b-a))*(1+r*.25)*10)/10}return it}
// ---------- pets ----------
function mkPet(i){const sp=PETS[i];return{id:Date.now()+R(),s:i,r:Math.min(4,PBR[i]+(R()<.15?1:0)),lv:1,st:0,xp:0}}
const petN=p=>PETS[p.s].ev[p.st],petE=p=>PETS[p.s].e;
function petStats(p){const m=[1,1.3,1.7,2.3,3.2][p.r]*(1+p.st*.6),role=PETS[p.s].role;
 return{atk:Math.round((role==='dps'?9:role==='tank'?4:5)*p.lv*m),hp:Math.round((role==='tank'?70:35)*p.lv*m),heal:role==='support'?Math.round(2*p.lv*m):0}}
const petCap=p=>[10,25,50][p.st];
// ---------- stats ----------
function subTot(){const t={};for(const k in SUB)t[k]=0;for(const s of SLOTS){const g=S.gear[s];if(g)for(const k in g.sub)t[k]+=g.sub[k]}return t}
function stats(){const c=CLASSES[S.cls||'knight'],t=subTot();let a=10+S.lv*4,h=120+S.lv*30;
 for(const s of SLOTS){const g=S.gear[s];if(g){a+=g.atk;h+=g.hp}}
 a*=c.atk*(1+S.lodge.buffA/100);h*=c.hp*(1+S.lodge.buffH/100);
 let pa=0,ph=0,heal=0;for(const id of S.team){const p=S.pets.find(x=>x.id===id);if(p){const q=petStats(p);pa+=q.atk;ph+=q.hp;heal+=q.heal}}
 pa*=1+t.pd/100;const cc=Math.min(.8,.08+t.cc/100+(S.cls==='ranger'?.15:0)),cm=1.5+t.cd/100;
 const rg=t.rg*S.lv*.5+(0)+heal;
 const power=Math.round((a*(1+cc*(cm-1))*(1+t.as/100)+pa)*6+(h+ph)*.6+rg*8);
 return{atk:Math.round(a),hp:Math.round(h),pa:Math.round(pa),ph:Math.round(ph),cc,cm,t,rg,power}}
// ---------- battle ----------
let B=null,pt;function pose(p){const e=$('himg');if(!e)return;const c=S.cls||'knight';e.src=IMG[c+'_'+p]||e.src;clearTimeout(pt);pt=setTimeout(()=>{e.src=IMG[c+'_idle']||e.src},p==='attack'?260:320)}
function foeFor(mode){const I=ISLES[S.isle%4],tier=S.isle*10+S.stage,boss=mode==='boss'||(mode==='story'&&S.wave===4);
 let k=boss?I.boss:pick(I.foes),sc=Math.pow(1.17,tier-1);
 if(mode==='tower'){sc=Math.pow(1.2,S.tower+2);k=pick(['enemy_stone_golem','enemy_bat_imp','enemy_skeleton_archer'])}
 if(mode==='hunt'){sc=Math.pow(1.17,tier+3);k=I.boss}
 if(mode==='arena'){const o=B&&B.opp;return{k:pick(['knight_idle','mage_idle','ranger_idle']),n:o.n,e:'🧝',atk:o.atk,hp:o.hp,mhp:o.hp,boss:false}}
 const hp=Math.round(90*sc*(boss?4.5:1)),atk=Math.round(9*sc*(boss?1.6:1));
 return{k,n:FOE[k][0],e:FOE[k][1],atk,hp,mhp:hp,boss:boss||mode==='hunt'}}
function startFight(mode='story',opp){const s=stats();B={mode,opp,php:s.hp+s.ph,pmax:s.hp+s.ph,t:0,cd:[0,0,0],ft:0,ht:0,end:0};B.e=foeFor(mode);drawArena();}
const SK=[{n:'Strike',e:'💥',cd:6,f:s=>s.atk*4},{n:'Pet Rally',e:'🐾',cd:10,f:s=>s.pa*5+s.atk},{n:'Second Wind',e:'💚',cd:15,heal:1}];
function useSkill(i,manual){if(!B||B.end||B.cd[i]>0)return;const s=stats();B.cd[i]=SK[i].cd;
 if(SK[i].heal){B.php=Math.min(B.pmax,B.php+B.pmax*.35);fx('💚 +'+fmt(B.pmax*.35),'heal')}else{let d=SK[i].f(s)*(S.cls==='mage'?1.6:1);if(B.e.boss)d*=1+s.t.bd/100;hitFoe(d,SK[i].e)}
 if(manual)render()}
function hitFoe(d,tag){B.e.hp-=d;fx((tag||'')+fmt(d),'dmg');const u=$('foe');if(u){u.classList.remove('hit');void u.offsetWidth;u.classList.add('hit')}}
function tick(dt){if(!B||B.end)return;const s=stats();B.t+=dt;for(let i=0;i<3;i++)B.cd[i]=Math.max(0,B.cd[i]-dt);
 const spd=1/(1+s.t.as/100);B.ht+=dt;if(B.ht>=spd*.9){B.ht=0;let d=s.atk,cr=R()<s.cc;if(cr)d*=s.cm;if(B.e.boss)d*=1+s.t.bd/100;hitFoe(d+s.pa*.6,cr?'CRIT ':'');B.php=Math.min(B.pmax,B.php+d*s.t.ls/100);
  const h=$('hero');if(h){h.classList.remove('atk');void h.offsetWidth;h.classList.add('atk');pose('attack')}}
 B.php=Math.min(B.pmax,B.php+s.rg*dt);
 B.ft+=dt;if(B.ft>=1.2){B.ft=0;if(R()<s.t.dg/100)fx('Dodge','heal',1);else{let d=B.e.atk*(S.cls==='knight'?.8:1);B.php-=d;fx('-'+fmt(d),'hurt',1);pose('hurt')}}
 if(S.auto)for(let i=0;i<3;i++)if(B.cd[i]<=0&&(i<2||B.php<B.pmax*.5))useSkill(i);
 if(B.e.hp<=0)win();else if(B.php<=0)lose();updBars()}
function win(){B.end=1;const m=B.mode,e=B.e,tier=S.isle*10+S.stage;let g=Math.round(12*Math.pow(1.12,tier)*(e.boss?5:1)),x=Math.round(10*Math.pow(1.1,tier)*(e.boss?4:1));
 S.gold+=g;gainXp(x);S.kills++;S.stat.kills++;let msg=`+${fmt(g)} gold`;
 if(R()<(e.boss?1:.35)){S.keys++;msg+=' +1 🗝️'}if(R()<.08||e.boss){S.treats+=e.boss?3:1;msg+=' +🍖'}
 if(m==='story'){if(S.wave<4)S.wave++;else{S.wave=1;S.shards+=10;msg+=' +10 💎';if(S.stage<10)S.stage++;else{S.stage=1;S.isle++;S.eggs++;modal(`<h3>New Isle!</h3><p>${ISLES[S.isle%4].n} is open. +1 egg.</p><button class="btn g" onclick="closeM()">Sail on</button>`)}S.best=Math.max(S.best,S.isle*10+S.stage)}}
 if(m==='tower'){S.tower++;S.shards+=15;S.eggs+=S.tower%5===0?1:0;msg+=' +15 💎';toast('Spire floor cleared! '+msg);setTimeout(()=>{B=null;startFight('story')},900);save();return}
 if(m==='hunt'){S.shards+=30;S.eggs++;msg+=' +30 💎 +1 🥚';toast('Boss hunted! '+msg);setTimeout(()=>{B=null;startFight('story')},900);save();return}
 if(m==='arena'){S.arenaPts+=rint(18,28);S.shards+=8;S.stat.arena++;toast('Arena win! +8 💎');setTimeout(()=>{B=null;startFight('story')},900);save();return}
 toast(msg,1);save();setTimeout(()=>{B=null;startFight('story')},600)}
function lose(){B.end=1;if(B.mode==='story'){S.wave=1;if(S.stage>1&&S.isle*10+S.stage>=S.best)S.stage=Math.max(1,S.stage-1)}
 if(B.mode==='arena'){S.arenaPts=Math.max(0,S.arenaPts-12);S.stat.arena++}
 toast(B.mode==='story'?'Knocked out. Upgrade gear or pets!':'Defeated.');save();setTimeout(()=>{B=null;startFight('story')},1200)}
function gainXp(x){S.xp+=x;let n;while(S.xp>=(n=Math.round(60*Math.pow(1.22,S.lv-1)))){S.xp-=n;S.lv++;toast('Level up! Lv '+S.lv)}
 for(const id of S.team){const p=S.pets.find(q=>q.id===id);if(p&&p.lv<petCap(p)){p.xp+=x*.5;let pn;while(p.lv<petCap(p)&&p.xp>=(pn=40*p.lv)){p.xp-=pn;p.lv++}}}}
// ---------- fx/ui ----------
function fx(t,c,onHero){const a=$('arena');if(!a)return;const d=document.createElement('div');d.className='fx '+c;d.textContent=t;d.style.left=(onHero?18:58)+rint(0,16)+'%';d.style.top=(30+rint(0,18))+'%';a.appendChild(d);setTimeout(()=>d.remove(),900)}
let tt;function toast(t,soft){const d=$('toast');d.textContent=t;d.className=soft?'show soft':'show';clearTimeout(tt);tt=setTimeout(()=>d.className='',soft?1100:2200)}
function modal(h){$('mbody').innerHTML=h;$('modal').className='on'}function closeM(){$('modal').className=''}
function updBars(){if(!B)return;const p=Math.max(0,B.php/B.pmax),e=Math.max(0,B.e.hp/B.e.mhp);
 $('phb').style.width=p*100+'%';$('ehb').style.width=e*100+'%';$('pht').textContent=fmt(Math.max(0,B.php));$('eht').textContent=fmt(Math.max(0,B.e.hp));
 SK.forEach((k,i)=>{const b=$('sk'+i);if(b){b.style.setProperty('--cd',B.cd[i]/k.cd);b.classList.toggle('rdy',B.cd[i]<=0)}})}
function drawArena(){const I=ISLES[S.isle%4],a=$('arena');a.style.backgroundImage=IMG[I.bg]?`url(${IMG[I.bg]})`:'';
 const pets=S.team.map(id=>S.pets.find(p=>p.id===id)).filter(Boolean);
 const mode={story:`${I.n} ${S.isle+1}-${S.stage} · Wave ${S.wave}/4`,tower:`Trial Spire · Floor ${S.tower}`,hunt:'Boss Hunt',arena:'Arena Duel'}[B.mode];
 a.innerHTML=`<div class="stg">${mode}${B.e.boss?' <b class="bossb">BOSS</b>':''}</div>
 <div class="side l"><div class="bar"><i id="phb"></i><span id="pht"></span></div><div id="hero" class="unit">${`<img id="himg" class="ai" src="${IMG[(S.cls||'knight')+'_idle']||''}">`}</div>
 <div class="pets">${pets.map(p=>`<div class="pu st${p.st}">${img(PETS[p.s].k,petE(p))}</div>`).join('')}</div></div>
 <div class="side r"><div class="bar e"><i id="ehb"></i><span id="eht"></span></div><div id="foe" class="unit${B.e.boss?' boss':''}${B.mode==='arena'?' flip':''}">${img(B.e.k,B.e.e)}</div><div class="fn">${B.e.n}</div></div>
 <button id="quest" onclick="questTap()"><b>📜 Quest</b><span>${questText()}</span></button>
 <div class="skills">${SK.map((k,i)=>`<button id="sk${i}" class="sk" onclick="useSkill(${i},1)"><span>${k.e}</span><small>${k.n}</small></button>`).join('')}
 <button class="sk au${S.auto?' on':''}" onclick="S.auto=!S.auto;drawArena();updBars()"><span>${S.auto?'⏸':'▶'}</span><small>Auto ${S.auto?'ON':'OFF'}</small></button></div>`;updBars()}
function questText(){const d=dailyList().find(t=>!S.tdone[t.k]&&prog(t)>=t.n);if(d)return'Claim: '+d.n2;return`Clear ${ISLES[S.isle%4].n} ${S.isle+1}-${S.stage}`}
function questTap(){const d=dailyList().find(t=>!S.tdone[t.k]&&prog(t)>=t.n);if(d){claimTask(d.k);return}tab='quests';render()}
// ---------- daily ----------
function today(){return new Date().toDateString()}
function dailyReset(){if(S.day!==today()){S.day=today();S.hunt=3;S.arena=5;S.tdone={};S.stat={hatch:0,chest:0,feed:0,arena:0,kills:0};S.login=Math.min(7,(S.login||0)+1);S.lodge.don=0}}
const dailyList=()=>[{k:'kills',n:40,n2:'Defeat 40 foes',r:20},{k:'chest',n:8,n2:'Open 8 relic chests',r:20},{k:'hatch',n:1,n2:'Hatch an egg',r:25},{k:'feed',n:3,n2:'Feed pets 3 times',r:15},{k:'arena',n:2,n2:'Fight 2 arena duels',r:25}];
const prog=t=>S.stat[t.k]||0;
function claimTask(k){const t=dailyList().find(x=>x.k===k);if(!t||S.tdone[k]||prog(t)<t.n)return;S.tdone[k]=1;S.shards+=t.r;toast(`Task done! +${t.r} 💎`);save();render()}
const LOGIN=[[50,'💎'],[2,'🥚'],[200,'🗝️'],[80,'💎'],[20,'🍖'],[3,'🥚'],[200,'💎']];
function claimLogin(){const i=S.login-1;if(S.claimed>=i||i<0)return;S.claimed=i;const[n,e]=LOGIN[i];if(e==='💎')S.shards+=n;if(e==='🥚')S.eggs+=n;if(e==='🗝️')S.keys+=Math.round(n/20);if(e==='🍖')S.treats+=n;toast('Login reward claimed!');save();render()}
// ---------- actions ----------
let pend=null;
function openChest(){if(S.keys<1){toast('No keys. Defeat foes to find 🗝️');return false}S.keys--;S.stat.chest++;const it=mkItem();pend=it;showCompare(it);return true}
function ipw(it){if(!it)return 0;return it.atk*6+it.hp*.6+Object.values(it.sub).reduce((a,b)=>a+b*S.lv*1.5,0)}
function cardH(it,other,lab){if(!it)return`<div class="icard"><div class="ilab">${lab}</div><div class="emp">Empty</div></div>`;
 const df=(a,b)=>other===undefined?'':(a-b>0?`<em class="up">▲${fmt(a-b)}</em>`:a-b<0?`<em class="dn">▼${fmt(b-a)}</em>`:'');const o=other||{atk:0,hp:0,sub:{}};
 let rows=`<div class="srw"><span>ATK</span><b>${fmt(it.atk)}${df(it.atk,o.atk)}</b></div><div class="srw"><span>HP</span><b>${fmt(it.hp)}${df(it.hp,o.hp)}</b></div>`;
 for(const k in it.sub)if(it.sub[k])rows+=`<div class="srw"><span>${SUB[k].n}</span><b>+${it.sub[k]}${SUB[k].p?'%':''}</b></div>`;
 return`<div class="icard r${it.r}"><div class="ilab">${lab}</div><div class="ihd">${img(it.ic,SLE[it.slot])}<div><b>${it.name}</b><small>${RAR[it.r]} · Lv ${it.lv}</small></div></div>${rows}</div>`}
function showCompare(it){const cur=S.gear[it.slot],d=Math.round(ipw(it)-ipw(cur));
 if(S.autoSell>0&&it.r<S.autoSell&&cur){sell(it,1);return}
 modal(`<h3>Relic Chest!</h3><div class="cmp">${cardH(it,cur,'New')}${cardH(cur,undefined,'Equipped')}</div><div class="pchg ${d>=0?'up':'dn'}">Power ${d>=0?'+':''}${fmt(d)}</div>
 <div class="b2"><button class="btn g" onclick="equip()">Equip</button><button class="btn y" onclick="sell(pend)">Salvage +${fmt(sv(it))}</button></div>
 <button class="btn b sm" onclick="S.autoSell=(S.autoSell+1)%5;showCompare(pend)">Auto-salvage below: ${S.autoSell?RAR[S.autoSell]:'Off'}</button>`)}
const sv=it=>Math.round(8*it.lv*(1+it.r*1.5));
function equip(){const it=pend;if(!it)return;const cur=S.gear[it.slot];if(cur)S.gold+=sv(cur);S.gear[it.slot]=it;pend=null;closeM();toast('Equipped '+it.name);save();render();if(autoRun)setTimeout(autoStep,250)}
function sell(it,silent){S.gold+=sv(it);pend=null;if(!silent){closeM();toast('Salvaged +'+fmt(sv(it))+' gold')}save();render();if(autoRun)setTimeout(autoStep,silent?60:250)}
let autoRun=0;function autoPull(){autoRun=!autoRun;render();if(autoRun)autoStep()}
function autoStep(){if(!autoRun)return;if(S.keys<1){autoRun=0;toast('Out of keys');render();return}
 S.keys--;S.stat.chest++;const it=mkItem(),cur=S.gear[it.slot];if(!cur||ipw(it)>ipw(cur)){autoRun=0;pend=it;showCompare(it);render();return}S.gold+=sv(it);render();setTimeout(autoStep,90)}
function hatch(n){const cost=n===10?9:1;if(S.eggs<cost){toast('Not enough eggs');return}S.eggs-=cost;const got=[];
 for(let i=0;i<n;i++){const r=R()*100;let pool=r<1.5?[5]:r<8?[3,4]:r<35?[2]:[0,1];const p=mkPet(pick(pool));S.pets.push(p);got.push(p);S.stat.hatch++}
 if(S.team.length<3)for(const p of got)if(S.team.length<3)S.team.push(p.id);
 modal(`<h3>Hatched!</h3><div class="hgrid">${got.map(p=>`<div class="pcard r${p.r}">${img(PETS[p.s].k,petE(p))}<b>${petN(p)}</b><small>${RAR[p.r]} · ${PETS[p.s].role}</small></div>`).join('')}</div><button class="btn g" onclick="closeM()">Nice!</button>`);save();render()}
function buyEggs(){if(S.shards<100){toast('Need 100 💎');return}S.shards-=100;S.eggs++;save();render()}
function feed(id){const p=S.pets.find(x=>x.id===id);if(!p)return;if(S.treats<1){toast('No treats 🍖');return}if(p.lv>=petCap(p)){toast(p.st<2?'Evolve first!':'Max level');return}S.treats--;S.stat.feed++;p.lv=Math.min(petCap(p),p.lv+2);save();render();petInfo(id)}
function evolve(id){const p=S.pets.find(x=>x.id===id);if(!p||p.st>=2||p.lv<petCap(p))return;const dup=S.pets.find(x=>x.s===p.s&&x.id!==p.id&&!S.team.includes(x.id));const cost=(p.st+1)*150;
 if(S.shards<cost&&!dup){toast(`Need ${cost} 💎 or a spare ${PETS[p.s].n}`);return}if(dup)S.pets=S.pets.filter(x=>x!==dup);else S.shards-=cost;p.st++;toast(`Evolved into ${petN(p)}!`);save();render();petInfo(id)}
function release(id){S.pets=S.pets.filter(x=>x.id!==id);S.team=S.team.filter(x=>x!==id);S.treats+=3;closeM();save();render()}
function toggleTeam(id){if(S.team.includes(id))S.team=S.team.filter(x=>x!==id);else{if(S.team.length>=3){toast('Team is full (3)');return}S.team.push(id)}save();closeM();render();drawArena()}
function petInfo(id){const p=S.pets.find(x=>x.id===id);if(!p)return;const q=petStats(p),cap=petCap(p);
 modal(`<h3>${petN(p)}</h3><div class="pbig r${p.r}">${img(PETS[p.s].k,petE(p))}</div><p class="ctr">${RAR[p.r]} ${PETS[p.s].role} · Stage ${p.st+1}/3 · Lv ${p.lv}/${cap}</p>
 <div class="srw"><span>ATK</span><b>${fmt(q.atk)}</b></div><div class="srw"><span>HP</span><b>${fmt(q.hp)}</b></div>${q.heal?`<div class="srw"><span>Heal/s</span><b>${q.heal}</b></div>`:''}
 <div class="b2"><button class="btn g" onclick="feed(${p.id})">Feed 🍖 (${S.treats})</button><button class="btn y" ${p.st>=2||p.lv<cap?'disabled':''} onclick="evolve(${p.id})">Evolve</button></div>
 <div class="b2"><button class="btn b" onclick="toggleTeam(${p.id})">${S.team.includes(p.id)?'Bench':'Add to team'}</button><button class="btn r" onclick="release(${p.id})">Release +3🍖</button></div><button class="btn sm" onclick="closeM()">Close</button>`)}
function donate(){const c=Math.round(200*Math.pow(1.3,S.lodge.lv-1));if(S.lodge.don>=3){toast('3 donations per day');return}if(S.gold<c){toast('Need '+fmt(c)+' gold');return}
 S.gold-=c;S.lodge.don++;S.lodge.xp+=1;S.shards+=5;if(S.lodge.xp>=S.lodge.lv*3){S.lodge.xp=0;S.lodge.lv++;toast('Lodge leveled up!')}save();render()}
function buyBuff(k){const c=40+S.lodge['buff'+k]*15;if(S.lodge['buff'+k]>=S.lodge.lv*5){toast('Raise lodge level first');return}if(S.shards<c){toast('Need '+c+' 💎');return}S.shards-=c;S.lodge['buff'+k]+=1;save();render()}
function arenaOpps(){const s=stats(),out=[];let seed=S.arenaPts;for(let i=0;i<3;i++){const f=[.8,1,1.25][i]*(0.92+((seed*(i+7))%17)/100);out.push({n:NAMES[(seed+i*5)%NAMES.length],pw:Math.round(s.power*f),atk:Math.round(s.atk*f+s.pa*.6*f),hp:Math.round((s.hp+s.ph)*f)})}return out}
function arenaGo(i){if(S.arena<1){toast('No duel tickets left today');return}S.arena--;tab='quests';startFight('arena',arenaOpps()[i]);render()}
function huntGo(){if(S.hunt<1){toast('No hunts left today');return}S.hunt--;startFight('hunt');render()}
function shopBuy(k){const P={eggs:[90,()=>S.eggs++],eggs10:[800,()=>S.eggs+=10],keys:[60,()=>S.keys+=10],treats:[50,()=>S.treats+=10],ticket:[40,()=>S.arena++],hunt:[60,()=>S.hunt++],gold:[50,()=>S.gold+=Math.round(400*Math.pow(1.15,S.lv))]};
 const[c,f]=P[k];if(S.shards<c){toast('Need '+c+' 💎. Earn more from tasks, bosses and the Spire.');return}S.shards-=c;f();toast('Bought!');save();render()}
// ---------- chat (simulated players) ----------
const CHAT=['anyone farming Sunken Ruins?','just hatched an Umbrakit!!','lodge donate pls 🙏','Magmor hits so hard','tip: evolve tanks first','Spire floor 20 done','need 2 for boss hunt','gg arena'];
let chatLog=[];function chatTick(){if(R()<.35){chatLog.push([pick(NAMES),pick(CHAT)]);chatLog=chatLog.slice(-30);const c=$('chat');if(c&&tab==='lodge')render();const s=$('ticker');if(s){const m=chatLog[chatLog.length-1];s.innerHTML=`<b>${m[0]}:</b> ${m[1]}`}}}
function sendChat(){const i=$('cin');if(!i||!i.value.trim())return;chatLog.push([S.name,i.value.trim()]);i.value='';setTimeout(()=>{chatLog.push([pick(NAMES),pick(['nice','same lol','welcome!','go go','gl!'])]);render()},1200);render()}
// ---------- tabs ----------
let tab='hero';
function dot(t){if(t==='quests')return dailyList().some(x=>!S.tdone[x.k]&&prog(x)>=x.n)||S.claimed<S.login-1||S.hunt>0;if(t==='nest')return S.eggs>0;if(t==='hero')return S.keys>0;if(t==='lodge')return S.lodge.don<3;return false}
function render(){const s=stats();$('gold').textContent=fmt(S.gold);$('shards').textContent=fmt(S.shards);$('lvl').textContent='Lv '+S.lv;$('pw').textContent=fmt(s.power);
 $('xpb').style.width=Math.min(100,S.xp/Math.round(60*Math.pow(1.22,S.lv-1))*100)+'%';
 document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('on',b.dataset.t===tab);b.classList.toggle('dot',dot(b.dataset.t))});
 const P=$('panel');P.innerHTML=({hero:tHero,pets:tPets,nest:tNest,quests:tQuests,lodge:tLodge,shop:tShop})[tab](s)}
function tHero(s){return`<div class="gear">${SLOTS.map(k=>{const g=S.gear[k];return`<button class="slot ${g?'r'+g.r:''}" onclick="gearInfo('${k}')">${img(g?g.ic:ICON[k][0],SLE[k])}<small>${g?'Lv '+g.lv:SLN[k]}</small></button>`}).join('')}</div>
 <div class="row2"><button class="btn y big" onclick="openChest()">Open Relic Chest 🗝️ ${S.keys}</button></div>
 <div class="row2"><button class="btn b" onclick="autoPull()">${autoRun?'Stop Auto':'Auto: open until upgrade'}</button><button class="btn sm" onclick="statSheet()">Stats</button></div>
 <div class="card"><div class="kv"><span>${CLASSES[S.cls||'knight'].e} ${CLASSES[S.cls||'knight'].n} · ATK ${fmt(s.atk)} · HP ${fmt(s.hp)}</span></div><div class="kv"><span>Pets ATK ${fmt(s.pa)} · HP ${fmt(s.ph)}</span><span>Crit ${(s.cc*100).toFixed(0)}%</span></div></div>
 <div class="tick" id="ticker">World chat is live…</div>`}
function gearInfo(k){const g=S.gear[k];if(!g){toast('Open relic chests to find '+SLN[k].toLowerCase()+'s');return}modal(`<h3>${SLN[k]}</h3>${cardH(g,undefined,'Equipped')}<button class="btn" onclick="closeM()">Close</button>`)}
function statSheet(){const s=stats(),t=s.t;modal(`<h3>Stats</h3>${Object.keys(SUB).map(k=>`<div class="srw"><span>${SUB[k].n}</span><b>${t[k].toFixed(1)}${SUB[k].p?'%':''}</b></div>`).join('')}<div class="srw"><span>Power</span><b>${fmt(s.power)}</b></div><button class="btn" onclick="closeM()">Close</button>`)}
function tPets(){const L=[...S.pets].sort((a,b)=>(S.team.includes(b.id)-S.team.includes(a.id))||b.r-a.r||b.lv-a.lv);
 return`<div class="hd"><b>Team ${S.team.length}/3</b><span>🍖 ${S.treats}</span></div><div class="pgrid">${L.length?L.map(p=>`<button class="pcard r${p.r}${S.team.includes(p.id)?' in':''}" onclick="petInfo(${p.id})">${img(PETS[p.s].k,petE(p))}<b>${petN(p)}</b><small>Lv ${p.lv}/${petCap(p)}${p.lv>=petCap(p)&&p.st<2?' ⬆️':''}</small></button>`).join(''):'<p class="ctr">No pets yet. Visit the Nest to hatch eggs.</p>'}</div>`}
function tNest(){return`<div class="nest">${`<div class="egg">${img('icon_egg','🥚')}</div>`}<p class="ctr"><b>${S.eggs}</b> eggs</p></div>
 <div class="row2"><button class="btn g big" onclick="hatch(1)">Hatch 1 🥚</button><button class="btn y big" onclick="hatch(10)">Hatch 10 (9🥚)</button></div>
 <button class="btn b" onclick="buyEggs()">Buy egg · 100 💎</button>
 <div class="card odds"><b>Hatch odds</b><br>Epic Umbrakit 1.5% · Voltkin/Dawnpip 6.5% · Rimecoil 27% · Cinderwing/Mossnout 65%. 15% chance a pet hatches one rarity higher.</div>`}
function tQuests(){const L=dailyList();return`<div class="days">${LOGIN.map((l,i)=>`<button class="day${i<=S.claimed?' got':''}${i===S.login-1&&S.claimed<i?' now':''}" onclick="claimLogin()"><small>Day ${i+1}</small>${l[1]}<b>${l[0]}</b></button>`).join('')}</div>
 ${L.map(t=>`<div class="task"><span>${t.n2} <small>${Math.min(prog(t),t.n)}/${t.n}</small></span><button class="btn ${S.tdone[t.k]?'':'g'} sm" ${S.tdone[t.k]||prog(t)<t.n?'disabled':''} onclick="claimTask('${t.k}')">${S.tdone[t.k]?'Done':'+'+t.r+'💎'}</button></div>`).join('')}
 <div class="modes"><button class="mode" onclick="huntGo()">${img('boss_lava_titan','🐲')}<b>Boss Hunt</b><small>${S.hunt}/3 today</small></button>
 <button class="mode" onclick="startFight('tower');render()">${img('enemy_stone_golem','🗼')}<b>Trial Spire</b><small>Floor ${S.tower}</small></button>
 <button class="mode" onclick="arenaSheet()">${img('knight_attack','⚔️')}<b>Arena</b><small>${S.arena} tickets · ${S.arenaPts}</small></button></div>`}
function arenaSheet(){modal(`<h3>Arena</h3><p class="ctr">Rating ${S.arenaPts} · Tickets ${S.arena}</p>${arenaOpps().map((o,i)=>`<div class="task"><span>🧝 ${o.n} <small>Power ${fmt(o.pw)}</small></span><button class="btn ${i===2?'r':'g'} sm" onclick="closeM();arenaGo(${i})">Duel</button></div>`).join('')}<button class="btn" onclick="closeM()">Close</button>`)}
function tLodge(){const L=S.lodge,c=Math.round(200*Math.pow(1.3,L.lv-1));return`<div class="hd"><b>🏕️ Emberwatch Lodge · Lv ${L.lv}</b><span>XP ${L.xp}/${L.lv*3}</span></div>
 <div class="row2"><button class="btn y" onclick="donate()">Donate ${fmt(c)} gold (${3-L.don} left)</button></div>
 <div class="row2"><button class="btn b sm" onclick="buyBuff('A')">ATK +${L.buffA}% · ${40+L.buffA*15}💎</button><button class="btn b sm" onclick="buyBuff('H')">HP +${L.buffH}% · ${40+L.buffH*15}💎</button></div>
 <div id="chat" class="chat">${chatLog.slice(-8).map(m=>`<div><b>${m[0]}</b> ${m[1].replace(/</g,'&lt;')}</div>`).join('')}</div>
 <div class="cin"><input id="cin" placeholder="Say hi to the lodge" maxlength="80"><button class="btn g sm" onclick="sendChat()">Send</button></div>`}
function tShop(){const SI={eggs:'icon_egg',eggs10:'icon_egg',keys:'loot_key',treats:'loot_meat',gold:'icon_pouch',ticket:'icon_banner',hunt:'icon_slash'};const r=(k,ic,n,d,c)=>`<div class="shop"><span class="si">${img(SI[k],ic)}</span><div><b>${n}</b><small>${d}</small></div><button class="btn g sm" onclick="shopBuy('${k}')">💎${c}</button></div>`;
 return`<div class="hd"><b>💎 ${fmt(S.shards)} Starshards</b><span>earned in game only</span></div>
 ${r('eggs','🥚','Egg','Hatch a new pet',90)}${r('eggs10','🧺','Egg Basket','10 eggs',800)}${r('keys','🗝️','Key Ring','10 relic chest keys',60)}${r('treats','🍖','Treat Sack','10 pet treats',50)}
 ${r('gold','💰','Gold Purse','Gold based on level',50)}${r('ticket','🎟️','Duel Ticket','+1 arena duel today',40)}${r('hunt','🐲','Hunt Pass','+1 boss hunt today',60)}`}
// ---------- class pick ----------
function classPick(){modal(`<h3>Choose your path</h3><div class="clsg">${Object.entries(CLASSES).map(([k,c])=>`<button class="cls" onclick="setCls('${k}')">${img(k+'_idle',c.e)}<b>${c.n}</b><small>${c.d}</small></button>`).join('')}</div>`)}
function setCls(k){S.cls=k;if(!S.pets.length){const p=mkPet(0);S.pets.push(p);S.team=[p.id]}closeM();save();startFight('story');render();S.auto=true;toast('Welcome, '+CLASSES[k].n+'! Auto is on: sit back or grab the joystick.')}
// ---------- boot ----------
function boot(){dailyReset();document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;render()});
 const off=Math.min(8*3600,(Date.now()-S.t)/1000);if(S.cls&&off>120){const g=Math.round(off*.4*Math.pow(1.12,S.isle*10+S.stage)/10);S.gold+=g;S.keys+=Math.floor(off/600);setTimeout(()=>modal(`<h3>Welcome back!</h3><p class="ctr">Your hero kept hunting while you were away.<br><b>+${fmt(g)} gold</b> · <b>+${Math.floor(off/600)} 🗝️</b></p><button class="btn g" onclick="closeM()">Collect</button>`),300)}
 render();if(!S.cls)classPick();else startFight('story');
 let last=performance.now();setInterval(()=>{const n=performance.now();tick(Math.min(.5,(n-last)/1000));last=n},100);setInterval(chatTick,2500);setInterval(save,10000);setInterval(()=>{dailyReset()},60000);
 if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js')}
