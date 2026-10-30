// ===== v3 graphics layer (overrides field.js renderers) =====
const BIO=['meadow','ruins','frost','volcano'];
const PATHC=[{p:'#d8b878',e:'#9a7a44',s:'#c4a060'},{p:'#cbbf9a',e:'#7d7258',s:'#b3a67e'},{p:'#f4f8ff',e:'#a8bfd8',s:'#dde8f6'},{p:'#5a4038',e:'#2a1a16',s:'#7a3a22'}];
const MOBH={enemy_helmet_slime:46,enemy_mushroom_goblin:56,enemy_frog_shaman:58,enemy_crab_knight:54,enemy_skeleton_archer:62,enemy_wolf_bandit:62,enemy_stone_golem:74,enemy_bat_imp:54};
const FLY={enemy_bat_imp:1};
function buildZone(){const bi=S.isle%4,b=BIO[bi],th=THEME[bi],pc=PATHC[bi],c=document.createElement('canvas');c.width=ZW;c.height=ZH;const g=c.getContext('2d'),r=seedR(S.isle*977+13);
 const tile=im('tile_'+b);
 if(tile){const t=document.createElement('canvas'),T=256;t.width=t.height=T*2;const q=t.getContext('2d');
  // mirror-tile so edges match = seamless
  for(const[sx,sy]of[[1,1],[-1,1],[1,-1],[-1,-1]]){q.save();q.translate(sx<0?T*2:0,sy<0?T*2:0);q.scale(sx,sy);q.drawImage(tile,0,0,T,T);q.restore()}
  g.fillStyle=g.createPattern(t,'repeat');g.fillRect(0,0,ZW,ZH)}else{g.fillStyle=th.g;g.fillRect(0,0,ZW,ZH)}
 // large soft colour variation to hide tiling
 for(let i=0;i<70;i++){const x=r()*ZW,y=r()*ZH,rr=120+r()*260,gr=g.createRadialGradient(x,y,0,x,y,rr);const col=r()<.5?th.g2:th.g;gr.addColorStop(0,col+'55');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2)}
 const path=[PTS.village,PTS.A,PTS.B,PTS.C,PTS.lair,PTS.portal];
 const plaza=(x,y,rx,ry,col,a)=>{g.globalAlpha=a;g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();g.globalAlpha=1};
 // edge -> body -> highlight (same seed for curve so strokes line up)
 const seed=S.isle*977+13;[[92,pc.e,.35],[76,pc.e,.6],[66,pc.p,1],[30,pc.s,.35]].forEach(([w,col,a])=>{const rr=seedR(seed+5);
  g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.lineCap=g.lineJoin='round';g.beginPath();path.forEach((p,i)=>{if(!i)g.moveTo(...p);else{const q=path[i-1],mx=(p[0]+q[0])/2+(rr()-.5)*90,my=(p[1]+q[1])/2+(rr()-.5)*60;g.quadraticCurveTo(mx,my,...p)}});g.stroke();g.globalAlpha=1});
 for(const[x,y,rx,ry]of[[700,1790,200,128],[700,330,210,158]]){plaza(x,y,rx+14,ry+10,pc.e,.45);plaza(x,y,rx,ry,pc.p,1);plaza(x-30,y-20,rx*.55,ry*.45,pc.s,.4)}
 // cobble / speckle texture on dirt
 for(let i=0;i<2600;i++){const x=r()*ZW,y=r()*ZH;g.globalAlpha=.18+r()*.2;g.fillStyle=r()<.5?pc.e:'#fff';g.beginPath();g.ellipse(x,y,1.5+r()*3,1+r()*2,0,0,7);g.fill()}g.globalAlpha=1;
 // camps: subtle trampled patch
 for(const k of['A','B','C']){const[x,y]=PTS[k],gr=g.createRadialGradient(x,y,10,x,y,150);gr.addColorStop(0,'#0000');gr.addColorStop(.7,pc.e+'22');gr.addColorStop(1,'#0000');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,150,100,0,0,7);g.fill()}
 // grass tufts / ground detail
 const tc=bi===2?['#c8d8ee','#ffffff']:bi===3?['#ff6a2a','#3a2a26']:bi===1?['#6a9a5a','#8a7aa0']:['#3f9a2e','#7ad04a'];
 for(let i=0;i<900;i++){const x=r()*ZW,y=r()*ZH;g.strokeStyle=tc[i%2];g.globalAlpha=.55;g.lineWidth=2;g.beginPath();for(let k=-1;k<=1;k++){g.moveTo(x+k*3,y);g.lineTo(x+k*5,y-5-r()*5)}g.stroke()}g.globalAlpha=1;
 const near=(x,y,pad)=>path.some((p,i)=>{if(!i)return false;const q=path[i-1],dx=p[0]-q[0],dy=p[1]-q[1],t=Math.max(0,Math.min(1,((x-q[0])*dx+(y-q[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-q[0]-t*dx,y-q[1]-t*dy)<pad})||Object.values(PTS).some(p=>Math.hypot(x-p[0],y-p[1])<190);
 const deco=[];const W=[['tree',.34,150],['tree2',.24,140],['bush',.14,60],['rock',.14,56],['stump',.09,52],['sign',.05,70]];
 for(let i=0;i<340&&deco.length<190;i++){const x=40+r()*(ZW-80),y=60+r()*(ZH-60);if(near(x,y,120))continue;if(deco.some(d=>Math.hypot(d[0]-x,d[1]-y)<70))continue;
  let u=r(),k=W[0];for(const w of W){if(u<w[1]){k=w;break}u-=w[1]}deco.push([x,y,b+'_'+k[0],k[2]*(.85+r()*.3),r()<.5])}
 // border forest so edges never look empty
 for(let x=20;x<ZW;x+=70){deco.push([x+(r()-.5)*30,70+r()*30,b+'_tree'+(r()<.5?'2':''),150,r()<.5]);deco.push([x+(r()-.5)*30,ZH-10,b+'_tree'+(r()<.5?'2':''),150,r()<.5])}
 for(let y=120;y<ZH;y+=80){deco.push([20+r()*20,y,b+'_tree',150,0]);deco.push([ZW-20-r()*20,y,b+'_tree2',150,1])}
 // village
 [[540,1680],[870,1675],[590,1930],[830,1935]].forEach(([x,y],i)=>deco.push([x,y,b+'_house',150,i%2]));
 [[470,1790],[930,1790]].forEach(([x,y])=>deco.push([x,y,b+'_fence',58,0]));
 deco.push([PTS.A[0]+120,PTS.A[1]-90,b+'_sign',70,0]);
 return{bg:c,deco:deco.sort((a,b)=>a[1]-b[1]),tiled:!!tile,bi}}
// sprite with transforms + flash
const WC={};function white(k){if(WC[k])return WC[k];const i=im(k);if(!i)return null;const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);return WC[k]=c}
function spr(k,x,y,hgt,flip,alpha,o){const i=im(k);if(!i)return;o=o||{};const w=i.width*hgt/i.height;CX.save();CX.globalAlpha=alpha==null?1:alpha;CX.translate(x,y);if(o.rot)CX.rotate(o.rot);CX.scale((flip?-1:1)*(o.sx||1),o.sy||1);CX.drawImage(i,-w/2,-hgt,w,hgt);
 if(o.flash>0){const wc=white(k);if(wc){CX.globalAlpha=Math.min(1,o.flash)*(alpha==null?1:alpha);CX.drawImage(wc,-w/2,-hgt,w,hgt)}}CX.restore()}
function shadow(x,y,r,a){const g=CX.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a||.38})`);g.addColorStop(1,'rgba(0,0,0,0)');CX.fillStyle=g;CX.save();CX.translate(x,y);CX.scale(1,.38);CX.translate(-x,-y);CX.beginPath();CX.arc(x,y,r,0,7);CX.fill();CX.restore()}
const FONT='"Arial Rounded MT Bold","Trebuchet MS",Arial,sans-serif';
function tag(x,y,t,c,plate){CX.font=`900 11px ${FONT}`;CX.textAlign='center';CX.textBaseline='alphabetic';if(plate){const w=CX.measureText(t).width+12;CX.fillStyle='rgba(10,23,52,.72)';rr(x-w/2,y-11,w,15,7);CX.fill()}CX.lineWidth=3;CX.strokeStyle='rgba(0,0,0,.75)';CX.strokeText(t,x,y);CX.fillStyle=c||'#fff';CX.fillText(t,x,y)}
function rr(x,y,w,h,r){CX.beginPath();CX.moveTo(x+r,y);CX.arcTo(x+w,y,x+w,y+h,r);CX.arcTo(x+w,y+h,x,y+h,r);CX.arcTo(x,y+h,x,y,r);CX.arcTo(x,y,x+w,y,r);CX.closePath()}
function bar(x,y,w,p,c){p=Math.max(0,Math.min(1,p));CX.fillStyle='rgba(10,23,52,.9)';rr(x-w/2-2,y-2,w+4,9,4);CX.fill();if(p>0){const g=CX.createLinearGradient(0,y,0,y+5);g.addColorStop(0,'#fff8');g.addColorStop(.35,c);g.addColorStop(1,c);CX.fillStyle=g;rr(x-w/2,y,Math.max(4,w*p),5,2.5);CX.fill()}}
function addFx(x,y,t,c,big){const n=F.fx.filter(f=>f.t!==undefined&&f.l<.3&&Math.abs(f.x0-x)<60).length;F.fx.push({x:x+(Math.random()-.5)*26,x0:x,y:y-n*14,t,c,big,l:0})}
function sparks(x,y,c,n){for(let i=0;i<(n||6);i++){const a=Math.random()*6.28,s=80+Math.random()*160;F.fx.push({spark:1,x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,c,l:0})}}
let VIG=null;function vig(){if(VIG&&VIG.w===CW&&VIG.h===CH)return VIG.c;const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d'),gr=g.createRadialGradient(CW/2,CH*.5,Math.min(CW,CH)*.35,CW/2,CH*.5,Math.max(CW,CH)*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(5,10,30,.45)');g.fillStyle=gr;g.fillRect(0,0,CW,CH);VIG={w:CW,h:CH,c};return c}
function draw(){if(!F||!CX)return;if(!F.z.tiled&&im('tile_'+BIO[S.isle%4]))F.z=buildZone();
 const[cx,cy]=camXY(),t=F.now,h=F.h,q=Q();CX.setTransform(DPR,0,0,DPR,0,0);CX.imageSmoothingQuality='high';CX.drawImage(F.z.bg,cx,cy,CW,CH,0,0,CW,CH);CX.translate(-cx,-cy);
 const L=[];const vis=(x,y)=>x>cx-140&&x<cx+CW+140&&y>cy-40&&y<cy+CH+220;
 // quest guide chevrons on the ground
 if(isAuto()&&!h.dead&&!F.dlg){const tg=questTarget(),dx=tg.x-h.x,dy=tg.y-h.y,d=Math.hypot(dx,dy);if(d>160){const ux=dx/d,uy=dy/d;CX.save();for(let i=0;i<4;i++){const s=((t*1.5+i/4)%1),px=h.x+ux*(50+s*110),py=h.y+uy*(50+s*110)*.9;CX.globalAlpha=Math.sin(s*Math.PI)*.75;CX.translate(px,py);CX.rotate(Math.atan2(uy,ux));CX.fillStyle='#ffe066';CX.beginPath();CX.moveTo(8,0);CX.lineTo(-6,-7);CX.lineTo(-2,0);CX.lineTo(-6,7);CX.closePath();CX.fill();CX.setTransform(DPR,0,0,DPR,-cx*DPR,-cy*DPR)}CX.restore()}}
 for(const d of F.z.deco)if(vis(d[0],d[1]))L.push([d[1],()=>{const[x,y,k,s,fl]=d;shadow(x,y,s*.32,.32);const sway=k.includes('tree')?Math.sin(t*1.3+x*.01)*.015:0;spr(k,x,y+4,s,fl,1,{rot:sway})}]);
 if(q.t==='portal'||S.q>=7)L.push([PTS.portal[1],()=>{const[x,y]=PTS.portal;const g=CX.createRadialGradient(x,y-60,10,x,y-60,110);g.addColorStop(0,'rgba(90,200,255,.45)');g.addColorStop(1,'rgba(90,200,255,0)');CX.fillStyle=g;CX.fillRect(x-120,y-170,240,220);shadow(x,y,70);spr('portal',x,y,130+Math.sin(t*3)*3);tag(x,y-140,'Waygate','#9fe0ff',1)}]);
 for(const k in NPCS){const[x,y]=PTS[k];L.push([y,()=>{shadow(x,y,26);spr(NPCS[k].k,x,y,78,k==='smith',1,{sy:1+Math.sin(t*2.4+x)*.012});tag(x,y-88,NPCS[k].n,'#ffe066',1);
  if(q.t==='talk'&&q.who===k){const yy=y-112+Math.sin(t*5)*4;CX.fillStyle='#ffd54a';CX.strokeStyle='#0a1734';CX.lineWidth=3;CX.beginPath();CX.arc(x,yy,12,0,7);CX.fill();CX.stroke();CX.font=`900 17px ${FONT}`;CX.textAlign='center';CX.fillStyle='#0a1734';CX.fillText('!',x,yy+6)}}])}
 if(F.chest){const c=F.chest;L.push([c.y,()=>{const g=CX.createRadialGradient(c.x,c.y-16,2,c.x,c.y-16,46);g.addColorStop(0,'rgba(255,220,90,.55)');g.addColorStop(1,'rgba(255,220,90,0)');CX.fillStyle=g;CX.fillRect(c.x-50,c.y-66,100,90);shadow(c.x,c.y,26);spr('loot_chest',c.x,c.y,40,0,1,{sy:1+Math.sin(t*4)*.03});tag(c.x,c.y-48,'Treasure','#ffd54a',1)}])}
 for(const o of F.drops)L.push([o.y,()=>{const hop=Math.abs(Math.sin(t*6+o.x))*5;shadow(o.x,o.y,10,.3);spr(o.k==='gold'?'loot_gold':o.k==='key'?'loot_key':'loot_meat',o.x,o.y-hop,o.k==='key'?26:22)}]);
 for(const m of F.mobs.concat(F.boss?[F.boss]:[])){const dying=m.dead&&m.dieT!=null&&F.now-m.dieT<.5;if((m.dead&&!dying)||!vis(m.x,m.y))continue;
  L.push([m.y,()=>{const hh=m.boss?160:(MOBH[m.k]||58),fly=FLY[m.k]?14+Math.sin(t*5+m.hx)*5:0;
   if(m.boss){const a=.35+Math.sin(t*4)*.15,g=CX.createRadialGradient(m.x,m.y,10,m.x,m.y,95);g.addColorStop(0,`rgba(255,60,40,${a})`);g.addColorStop(1,'rgba(255,60,40,0)');CX.fillStyle=g;CX.save();CX.translate(m.x,m.y);CX.scale(1,.38);CX.beginPath();CX.arc(0,0,95,0,7);CX.fill();CX.restore()}
   shadow(m.x,m.y,m.boss?56:hh*.36);
   const moving=m.aggro||(m.tx!==undefined&&Math.hypot(m.tx-m.x,m.ty-m.y)>4),ph=t*(moving?9:3)+m.hx,hop=moving?Math.abs(Math.sin(ph))*4:0,sq=1+Math.sin(ph*2)*(moving?.04:.02);
   let alpha=1,sc=1;if(dying){const k=(F.now-m.dieT)/.5;alpha=1-k;sc=1-k*.3}
   const kb=m.hit>0?(m.x<h.x?-1:1)*m.hit*20:0;
   spr(m.k,m.x+kb,m.y-hop-fly,hh*sc,m.x<h.x,alpha,{sy:sq,sx:2-sq,flash:m.hit>0?m.hit/.15:0});
   if(dying)return;
   const show=m.boss||F.tgt===m||m.hp<m.mhp;if(show)bar(m.x,m.y-hh-fly-10,m.boss?96:46,m.hp/m.mhp,'#e2382a');
   if(m.boss||F.tgt===m)tag(m.x,m.y-hh-fly-15,`Lv${m.lv} ${m.n}`,m.boss?'#ff9a8a':'#ffe066')}])}
 for(const o of F.others)if(vis(o.x,o.y))L.push([o.y,()=>{const mv=Math.hypot(o.tx-o.x,o.ty-o.y)>5,b=mv?Math.abs(Math.sin(t*10+o.x))*3:0;shadow(o.x,o.y,22);spr(o.c+'_idle',o.x,o.y-b,70,o.face<0,1,{sy:mv?1-b*.01:1+Math.sin(t*2.5+o.x)*.015});tag(o.x,o.y-78,o.n,'#9fe0ff')}]);
 F.pets.forEach(p=>L.push([p.y+18,()=>{const st=p.p?p.p.st:0,fl=Math.sin(t*5+p.x*.01)*5;shadow(p.x,p.y+18,16,.28);const wing=1+Math.sin(t*14+p.x)*.04;spr(PETS[p.p.s].k,p.x,p.y-fl,42*(1+st*.15),p.face<0,1,{sy:wing})}]));
 L.push([h.y,()=>{if(h.dead>0){tag(h.x,h.y-40,'Reviving '+Math.ceil(h.dead)+'s','#ff9a8a',1);return}
  const mv=h.walk>0,ph=h.walk*10,by=mv?Math.abs(Math.sin(ph))*4:0,sq=mv?1-Math.abs(Math.cos(ph))*.04:1+Math.sin(t*2.6)*.018,lean=mv&&!h.mount?h.face*.05:0;
  const atk=h.pose==='attack'?Math.max(0,h.pt)/.25:0,lx=h.face*Math.sin(atk*Math.PI)*8,hurt=h.pose==='hurt'?Math.max(0,h.pt)/.3:0;
  if(h.mount){shadow(h.x,h.y,40);const wb=Math.abs(Math.sin(ph*.8))*5;spr('mount_wolf',h.x,h.y-wb,92,h.face<0,1,{sy:1-Math.abs(Math.cos(ph*.8))*.03});spr((S.cls||'knight')+'_idle',h.x-h.face*6,h.y-wb-36,58,h.face<0)}
  else{shadow(h.x,h.y,28);spr((S.cls||'knight')+'_'+h.pose,h.x+lx,h.y-by,76,h.face<0,1,{sy:sq*(1+atk*.03),sx:2-sq,rot:lean,flash:hurt*.7})}
  const top=h.mount?h.y-112:h.y-92;bar(h.x,top,54,h.hp/hmax(),'#4cd82a');tag(h.x,top-5,S.name||'You','#9fff6a')}]);
 L.sort((a,b)=>a[0]-b[0]);
 // target ring under everything sorted: draw before units
 if(F.tgt&&!F.tgt.dead){const m=F.tgt,rx=m.boss?64:28;CX.save();CX.translate(m.x,m.y);CX.scale(1,.38);CX.rotate(t*1.5);CX.strokeStyle='#ff5a3a';CX.lineWidth=4;CX.setLineDash([12,8]);CX.beginPath();CX.arc(0,0,rx,0,7);CX.stroke();CX.restore()}
 if(F.dest){CX.save();CX.translate(F.dest.x,F.dest.y);CX.scale(1,.4);CX.strokeStyle='#fff';CX.globalAlpha=.9;CX.lineWidth=3;CX.beginPath();CX.arc(0,0,10+((t*2)%1)*14,0,7);CX.stroke();CX.restore()}
 L.forEach(l=>l[1]());
 // fx
 for(const f of F.fx){
  if(f.proj){const a=Math.atan2((f.tx.y-40)-f.y,f.tx.x-f.x);CX.save();CX.translate(f.x,f.y);CX.rotate(a);
   if(S.cls==='mage'){const g=CX.createRadialGradient(0,0,1,0,0,14);g.addColorStop(0,'#fff6c0');g.addColorStop(.4,'#ff9a2a');g.addColorStop(1,'rgba(255,80,20,0)');CX.fillStyle=g;CX.beginPath();CX.arc(0,0,14,0,7);CX.fill();CX.globalAlpha=.5;CX.fillStyle='#ff6a1a';CX.beginPath();CX.ellipse(-16,0,16,5,0,0,7);CX.fill()}
   else{CX.strokeStyle='rgba(220,240,255,.5)';CX.lineWidth=3;CX.beginPath();CX.moveTo(-34,0);CX.lineTo(-6,0);CX.stroke();CX.strokeStyle='#6a4020';CX.lineWidth=2.5;CX.beginPath();CX.moveTo(-14,0);CX.lineTo(8,0);CX.stroke();CX.fillStyle='#dfe8f0';CX.beginPath();CX.moveTo(12,0);CX.lineTo(5,-4);CX.lineTo(5,4);CX.fill()}
   CX.restore()}
  else if(f.ring){const k=f.l/.4;CX.save();CX.translate(f.x,f.y);CX.scale(1,.45);CX.globalAlpha=1-k;CX.strokeStyle='#ffd54a';CX.lineWidth=10*(1-k)+2;CX.beginPath();CX.arc(0,0,20+k*110,0,7);CX.stroke();CX.fillStyle='rgba(255,160,40,.25)';CX.beginPath();CX.arc(0,0,20+k*110,0,7);CX.fill();CX.restore();if(f.l<.05)spr('icon_slash',f.x,f.y-20,70,0,.9)}
  else if(f.slash){const k=f.l/.22;CX.save();CX.translate(f.x,f.y);CX.scale(f.face,1);CX.globalAlpha=1-k;CX.strokeStyle='#fff';CX.lineWidth=6*(1-k)+1;CX.lineCap='round';CX.beginPath();CX.arc(0,0,34,-1.6+k*.6,.6+k*.6);CX.stroke();CX.strokeStyle='#ffd54a';CX.lineWidth=2;CX.beginPath();CX.arc(0,0,28,-1.4+k*.6,.5+k*.6);CX.stroke();CX.restore()}
  else if(f.spark){CX.globalAlpha=Math.max(0,1-f.l/.4);CX.fillStyle=f.c||'#ffe9a0';CX.beginPath();CX.arc(f.x,f.y,3*(1-f.l/.4)+1,0,7);CX.fill();CX.globalAlpha=1}
  else if(f.heal){CX.globalAlpha=Math.max(0,1-f.l/.9);CX.fillStyle='#9fff6a';for(let i=0;i<8;i++){const a=i*.8+f.l*3,rx=Math.cos(a)*24,yy=-f.l*70-i*6;CX.beginPath();CX.arc(f.x+rx,f.y+yy,3,0,7);CX.fill()}CX.globalAlpha=1}
  else if(f.t!==undefined){const k=f.l/.9,pop=f.l<.12?1.5-f.l/.12*.5:1,sz=(f.big?22:15)*pop,yy=f.y-(1-Math.pow(1-Math.min(1,k),2))*44;CX.globalAlpha=Math.max(0,k<.6?1:1-(k-.6)/.4);CX.font=`900 ${sz}px ${FONT}`;CX.textAlign='center';CX.lineJoin='round';CX.lineWidth=4;CX.strokeStyle='#0a1734';CX.strokeText(f.t,f.x,yy);CX.fillStyle=f.c;CX.fillText(f.t,f.x,yy);CX.globalAlpha=1}}
 CX.setTransform(DPR,0,0,DPR,0,0);CX.drawImage(vig(),0,0,CW,CH);
 if(F.joy){const j=F.joy;CX.globalAlpha=.35;CX.fillStyle='#0a1734';CX.beginPath();CX.arc(j.sx,j.sy,50,0,7);CX.fill();CX.globalAlpha=.6;CX.strokeStyle='#fff';CX.lineWidth=3;CX.stroke();CX.globalAlpha=.95;const g=CX.createRadialGradient(j.sx+j.dx*36,j.sy+j.dy*36-6,2,j.sx+j.dx*36,j.sy+j.dy*36,24);g.addColorStop(0,'#bfe0ff');g.addColorStop(1,'#2f6ad8');CX.fillStyle=g;CX.beginPath();CX.arc(j.sx+j.dx*36,j.sy+j.dy*36,24,0,7);CX.fill();CX.globalAlpha=1}
 if(F.banner>0){const a=Math.min(1,F.banner),n=ISLES[S.isle%4].n,y=CH*.3;CX.globalAlpha=a;CX.font=`900 22px ${FONT}`;CX.textAlign='center';const w=CX.measureText(n).width+60;const g=CX.createLinearGradient(0,y-24,0,y+12);g.addColorStop(0,'#3a6fd8');g.addColorStop(1,'#1c3f94');CX.fillStyle=g;rr(CW/2-w/2,y-26,w,40,14);CX.fill();CX.strokeStyle='#ffd54a';CX.lineWidth=3;CX.stroke();CX.lineWidth=5;CX.strokeStyle='#0a1734';CX.strokeText(n,CW/2,y+2);CX.fillStyle='#ffe066';CX.fillText(n,CW/2,y+2);CX.font=`900 11px ${FONT}`;CX.fillStyle='#cfe0ff';CX.fillText('ZONE '+(S.isle+1),CW/2,y+28);CX.globalAlpha=1}
 drawHud();drawMini()}
// unit separation so sprites stop stacking on top of each other
function separate(){const h=F.h,ms=F.mobs.concat(F.boss?[F.boss]:[]).filter(m=>!m.dead);for(let i=0;i<ms.length;i++){const a=ms[i];for(let j=i+1;j<ms.length;j++){const b=ms[j],dx=b.x-a.x,dy=(b.y-a.y)*1.6,d=Math.hypot(dx,dy)||1,mn=(a.boss||b.boss)?90:42;if(d<mn){const p=(mn-d)/2/d;a.x-=dx*p;a.y-=dy*p/1.6;b.x+=dx*p;b.y+=dy*p/1.6}}
  if(!h.dead){const dx=a.x-h.x,dy=(a.y-h.y)*1.6,d=Math.hypot(dx,dy)||1,mn=a.boss?80:38;if(d<mn){const p=(mn-d)/d;a.x+=dx*p;a.y+=dy*p/1.6}}}}
