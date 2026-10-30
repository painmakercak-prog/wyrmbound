// ===== Journey of Aethra: Three.js renderer for the field (replaces 2D draw/resize/input) =====
import * as THREE from 'three';
import {GLTFLoader} from './lib/GLTFLoader.js';
import * as SU from './lib/SkeletonUtils.js';
import {MeshoptDecoder} from './lib/meshopt_decoder.module.js';
const W=window,TAU=Math.PI*2,K=.1; // 10 game px = 1 world unit
const $=id=>document.getElementById(id);
// ---------- loading (assets ship as base64 text packs so they can live on gh-pages via the text-only push path)
const bar=p=>{$('ttlb').style.width=Math.round(p*100)+'%';$('ttlt').textContent='Loading... '+Math.round(p*100)+'%'};
async function loadAll(){const files=W.P3D_PACKS,tot=W.P3D_SIZE||1;let got=0;const out={};
 await Promise.all(files.map(async f=>{const r=await fetch(f);const rd=r.body.getReader(),ch=[];let n=0;for(;;){const{done,value}=await rd.read();if(done)break;ch.push(value);n+=value.length;got+=value.length;bar(Math.min(.92,got/tot*.92))}
  const t=new TextDecoder().decode(await new Blob(ch).arrayBuffer());Object.assign(out,JSON.parse(t))}));return out}
const b64buf=s=>fetch('data:application/octet-stream;base64,'+s).then(r=>r.arrayBuffer());
const MOD={};
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
// ---------- renderer
const gl=$('gl');const R3=new THREE.WebGLRenderer({canvas:gl,antialias:true,powerPreference:'high-performance'});
R3.setPixelRatio(Math.min(1.5,devicePixelRatio||1));R3.outputColorSpace=THREE.SRGBColorSpace;R3.toneMapping=THREE.ACESFilmicToneMapping;R3.toneMappingExposure=1.05;
R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),FOG=0xbfe2f0;scene.background=new THREE.Color(FOG);scene.fog=new THREE.Fog(FOG,30,80);
const cam=new THREE.PerspectiveCamera(42,1,.5,140);
const hemi=new THREE.HemisphereLight(0xe4f2ff,0x5f7f3a,.85);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe6c0,2.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=4;const sc=sun.shadow.camera;sc.left=-20;sc.right=20;sc.top=20;sc.bottom=-20;sc.near=1;sc.far=90;sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
{const es=new THREE.Scene(),sg=new THREE.SphereGeometry(10,32,16),cols=[];const p=sg.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i)/10,c=y>0?new THREE.Color(0xbfe0ff).lerp(new THREE.Color(0x6aa8f0),y):new THREE.Color(0x8aa860).lerp(new THREE.Color(0x3a5a2a),-y);cols.push(c.r,c.g,c.b)}sg.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 es.add(new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));const sd=new THREE.Mesh(new THREE.SphereGeometry(1.4,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color(6,5.5,4.5)}));sd.position.set(5,7,5);es.add(sd);
 const pm=new THREE.PMREMGenerator(R3);scene.environment=pm.fromScene(es,.02).texture;scene.environmentIntensity=.55;pm.dispose()}
// ---------- helpers
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
const PATH=()=>[PTS.village,PTS.A,PTS.B,PTS.C,PTS.lair,PTS.portal];
function segD(x,y){const p=PATH();let b=1e9;for(let i=1;i<p.length;i++){const q=p[i-1],r=p[i],dx=r[0]-q[0],dy=r[1]-q[1],t=Math.max(0,Math.min(1,((x-q[0])*dx+(y-q[1])*dy)/(dx*dx+dy*dy)));b=Math.min(b,Math.hypot(x-q[0]-t*dx,y-q[1]-t*dy))}return b}
const nearPOI=(x,y)=>Math.min(...Object.values(PTS).map(p=>Math.hypot(x-p[0],y-p[1])));
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function hgt(wx,wz){const x=wx/K,y=wz/K;const open=sm(60,200,Math.min(segD(x,y),nearPOI(x,y)-120));
 const n=Math.sin(wx*.21)*Math.cos(wz*.17)*.9+Math.sin(wx*.07+wz*.05)*1.4+Math.cos(wx*.13-wz*.11)*.6;
 const e=Math.min(wx,140-wx,wz,200-wz),rim=(1-sm(0,16,e))*5;return open*n*.9+rim+(open*.4)}
function rimify(y,str){y.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=1.-abs(dot(normalize(normal),normalize(vViewPosition)));totalEmissiveRadiance+=vec3(1.,.92,.78)*pow(fr,3.)*'+str.toFixed(2)+';}')};y.customProgramCacheKey=()=>'rim'+str}
function glossy(o,tint,em,hero){o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=false;const a=Array.isArray(m.material)?m.material:[m.material];
 m.material=a.map(x=>{const y=x.clone();y.roughness=hero?(/skin|face|eye/i.test(x.name)?.55:.34):.42;y.metalness=hero&&/gold|grey|metal|steel|silver/i.test(x.name)?.55:0;y.envMapIntensity=hero?1:.6;if(hero){const pc=(HPAL[hero]||{})[x.name];if(pc)y.color.set(pc);rimify(y,.28)}if(tint)y.color.lerp(new THREE.Color(tint),.35);if(em){y.emissive=new THREE.Color(em);y.emissiveIntensity=.25}return y});if(m.material.length===1)m.material=m.material[0]})}
function norm(k,h){const s=MOD[k].scene;s.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(s),sz=b.getSize(new THREE.Vector3());return{s:h/(sz.y||1),minY:b.min.y,cx:(b.min.x+b.max.x)/2,cz:(b.min.z+b.max.z)/2}}
// ---------- terrain
let ground,GT=null;
function buildGround(){const c=document.createElement('canvas');c.width=1434;c.height=2048;const g=c.getContext('2d'),sx=c.width/ZW,sy=c.height/ZH;seed=77;
 g.fillStyle='#6fb23e';g.fillRect(0,0,c.width,c.height);
 for(let i=0;i<900;i++){const x=rnd()*c.width,y=rnd()*c.height,r=20+rnd()*120,gr=g.createRadialGradient(x,y,0,x,y,r),col=['#86c84a','#5a9a32','#9ad65a','#4f8a2c','#7cbf44'][i%5];gr.addColorStop(0,col+'aa');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<26000;i++){const x=rnd()*c.width,y=rnd()*c.height;g.fillStyle=rnd()<.5?'#3f7a24':'#b6e070';g.globalAlpha=.35;g.fillRect(x,y,1.5,3+rnd()*3)}g.globalAlpha=1;
 g.save();g.scale(sx,sy);const p=PATH();g.lineCap=g.lineJoin='round';
 [[104,'#5e4a2a',.35],[86,'#9a7444',.8],[72,'#d6b47a',1],[34,'#ecd29a',.45]].forEach(([w,col,a])=>{seed=5;g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();p.forEach((q,i)=>{if(!i)g.moveTo(...q);else{const o=p[i-1];g.quadraticCurveTo((q[0]+o[0])/2+(rnd()-.5)*40,(q[1]+o[1])/2+(rnd()-.5)*30,...q)}});g.stroke()});g.globalAlpha=1;
 for(const[x,y,rx,ry]of[[700,1790,210,135],[700,330,215,160]]){g.fillStyle='#9a7444';g.beginPath();g.ellipse(x,y,rx+12,ry+10,0,0,TAU);g.fill();g.fillStyle='#d6b47a';g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill()}
 // cobbles in the village plaza
 seed=9;g.lineWidth=.8;g.strokeStyle='#a08458';for(let i=0;i<2600;i++){const a=rnd()*TAU,d=Math.sqrt(rnd()),x=700+Math.cos(a)*d*195,y=1790+Math.sin(a)*d*124;g.fillStyle=['#cdb07c','#d8bd8a','#c4a674','#dcc496'][i%4];g.beginPath();g.ellipse(x,y,3+rnd()*2.2,2.2+rnd()*1.4,rnd()*3,0,TAU);g.fill();g.stroke()}
 for(const k of['A','B','C']){const[x,y]=PTS[k],gr=g.createRadialGradient(x,y,10,x,y,150);gr.addColorStop(0,'#a0804a88');gr.addColorStop(1,'#a0804a00');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,160,110,0,0,TAU);g.fill()}
 {const[x,y]=PTS.lair,gr=g.createRadialGradient(x,y,10,x,y,220);gr.addColorStop(0,'#3a2a2aaa');gr.addColorStop(1,'#3a2a2a00');g.fillStyle=gr;g.fillRect(x-230,y-230,460,460)}
 seed=11;for(let i=0;i<5000;i++){const x=rnd()*ZW,y=rnd()*ZH;if(segD(x,y)>40)continue;g.globalAlpha=.35;g.fillStyle=rnd()<.5?'#8a6a3a':'#fff4d0';g.beginPath();g.ellipse(x,y,1.5+rnd()*3,1+rnd()*2,0,0,TAU);g.fill()}g.globalAlpha=1;g.restore();
 GT=c;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 const geo=new THREE.PlaneGeometry(180,240,150,200);geo.rotateX(-Math.PI/2);geo.translate(70,0,100);const P=geo.attributes.position,uv=geo.attributes.uv;
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i);P.setY(i,hgt(Math.max(-20,Math.min(160,x)),Math.max(-20,Math.min(220,z)))+(x<0||x>140||z<0||z>200?3:0));uv.setXY(i,x/140,1-z/200)}
 geo.computeVertexNormals();tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
 const gm=new THREE.MeshStandardMaterial({map:tex,roughness:.92});{const d=document.createElement('canvas');d.width=d.height=256;const q=d.getContext('2d');q.fillStyle='#808080';q.fillRect(0,0,256,256);seed=31;for(let i=0;i<5000;i++){const x=rnd()*256,y=rnd()*256,v=90+rnd()*110|0;q.fillStyle=`rgb(${v},${v},${v})`;q.globalAlpha=.5;q.fillRect(x,y,1+rnd()*1.5,2+rnd()*4)}const dt=new THREE.CanvasTexture(d);dt.wrapS=dt.wrapT=THREE.RepeatWrapping;
 gm.onBeforeCompile=sh=>{sh.uniforms.dTex={value:dt};sh.fragmentShader='uniform sampler2D dTex;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{float n=texture2D(dTex,vMapUv*vec2(56.,80.)).r*.6+texture2D(dTex,vMapUv*vec2(13.,19.)).r*.4;diffuseColor.rgb*=.62+n*.76;}')}}
 ground=new THREE.Mesh(geo,gm);ground.receiveShadow=true;scene.add(ground)}
// ---------- instanced props (chunked so frustum culling works)
const PROP={commontree_1:6,commontree_2:6.5,commontree_3:5.5,pinetree_1:7.5,pinetree_2:7,birchtree_1:6.5,bush_1:1.4,bush_2:1.3,bushberries_1:1.4,flowers:.6,grass:.55,grass_2:.6,rock_1:1.3,rock_2:1.6,rock_moss_1:1.8,treestump:.9,woodlog_moss:.9,
 house_1:6,house_2:6.5,house_3:6,fence:1.2,well:2.6,cart:2,barrel:1.1,bonfire_lit:1.2,crate:1,hay:1.2,bench_1:1,marketstand_1:2.8};
const PL={};const put=(k,x,z,s=1,ry=null,y=null)=>{(PL[k]=PL[k]||[]).push([x,z,s,ry===null?rnd()*TAU:ry,y])};
function scatter(){seed=4242;const TR=['commontree_1','commontree_2','commontree_3','pinetree_1','pinetree_2','birchtree_1'];
 // dense border forest (inside + outside the play area)
 for(let x=-24;x<=164;x+=3.2)for(let z=-24;z<=224;z+=3.2){const e=Math.min(x,140-x,z,200-z);if(e>11)continue;if(rnd()<.18)continue;put(TR[(rnd()*TR.length)|0],x+(rnd()-.5)*2.6,z+(rnd()-.5)*2.6,.8+rnd()*.6)}
 // interior
 for(let i=0;i<11000;i++){const x=6+rnd()*128,z=6+rnd()*188,px=x/K,pz=z/K,d=Math.min(segD(px,pz)-50,nearPOI(px,pz)-200),south=Math.min(segD(px,pz-140),nearPOI(px,pz-140)-150);const u=rnd();
  if(d>60&&south>40&&u<.085)put(TR[(rnd()*TR.length)|0],x,z,.75+rnd()*.5);else if(d>25&&u<.13)put(rnd()<.5?'bush_1':rnd()<.5?'bush_2':'bushberries_1',x,z,.45+rnd()*.35);
  else if(d>10&&u<.16)put(['rock_1','rock_2','rock_moss_1'][(rnd()*3)|0],x,z,.7+rnd()*.8);else if(d>30&&u<.17)put(rnd()<.5?'treestump':'woodlog_moss',x,z,1);
  else if(d>-15&&u<.40)put('flowers',x,z,.8+rnd()*.6);else if(d>-40&&u<.97)put(rnd()<.5?'grass':'grass_2',x,z,.7+rnd()*.7)}
 // village
 [[540,1680,.6],[870,1675,-.5],[580,1930,2.7],[830,1935,3.5]].forEach(([x,y,r],i)=>put('house_'+(i%3+1),x*K,y*K,1,r));
 put('well',70,185.5,1,0);put('marketstand_1',60,176,1,.9);put('cart',80.5,177,1,-.6);put('bonfire_lit',70,171,1,0);
 [[63.5,184],[64.5,185.2],[77,186],[52,170]].forEach(([x,z])=>put('barrel',x,z,1));[[76,184.5],[75.3,185.6],[58,173]].forEach(([x,z])=>put('crate',x,z,1));put('hay',84,182,1);put('bench_1',66,168.8,1,0);put('bench_1',74,168.8,1,0);
 for(let i=0;i<9;i++){put('fence',47+i*2.3,192.5,1,0);put('fence',74.5+i*2.3,192.5,1,0)}for(let i=0;i<6;i++){put('fence',45.6,191-i*2.3,1,Math.PI/2);put('fence',95.3,191-i*2.3,1,Math.PI/2)}
 // camps + lair
 for(const k of['A','B','C']){const[x,y]=PTS[k];put('bonfire_lit',x*K+3,y*K-4,1,0);put('crate',x*K-5,y*K-6,1);put('rock_moss_1',x*K+9,y*K+3,1.3)}
 for(let i=0;i<16;i++){const a=i/16*TAU;if(Math.abs(a-Math.PI/2)<.5)continue;put(rnd()<.5?'rock_moss_1':'rock_2',70+Math.cos(a)*19,33+Math.sin(a)*14,1.6+rnd()*1.2)}}
const OCC={value:new THREE.Vector3(0,-99,0)};
function occ(m){m.onBeforeCompile=sh=>{sh.uniforms.uOcc=OCC;
sh.vertexShader='varying vec3 vOW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvOW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;');
sh.fragmentShader='uniform vec3 uOcc;varying vec3 vOW;\n'+sh.fragmentShader.replace('void main() {','void main() {\n{vec2 dd=vOW.xz-vec2(uOcc.x,uOcc.z+4.5);float t=clamp((vOW.z-uOcc.z+.6),0.,1.);if(t>0.&&vOW.y>uOcc.y+.9&&length(dd*vec2(1.,.6))<4.2)discard;}');};}
function buildProps(){const CH=35;for(const[k,list]of Object.entries(PL)){const M=MOD[k];if(!M)continue;const n=norm(k,PROP[k]||1);const parts=[];M.scene.traverse(o=>{if(o.isMesh)parts.push(o)});
  const big=PROP[k]>=1.2,bucket={};for(const it of list){const c=((it[0]/CH)|0)+'_'+((it[1]/CH)|0);(bucket[c]=bucket[c]||[]).push(it)}
  for(const items of Object.values(bucket))for(const p of parts){const mat=p.material.clone();occ(mat);mat.roughness=Math.min(mat.roughness,.75);mat.metalness=0;const im=new THREE.InstancedMesh(p.geometry,mat,items.length);
   const m=new THREE.Matrix4(),q=new THREE.Quaternion(),base=new THREE.Matrix4().makeScale(n.s,n.s,n.s).multiply(new THREE.Matrix4().makeTranslation(-n.cx,-n.minY,-n.cz)).multiply(p.matrixWorld);
   items.forEach((it,i)=>{const s=it[2],y=it[4]??hgt(it[0],it[1])-.05;q.setFromAxisAngle(new THREE.Vector3(0,1,0),it[3]);m.compose(new THREE.Vector3(it[0],y,it[1]),q,new THREE.Vector3(s,s,s)).multiply(base);im.setMatrixAt(i,m)});
   im.castShadow=big&&!k.startsWith('fence');im.receiveShadow=true;im.computeBoundingSphere();scene.add(im)}}}
// ---------- glow sprite
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#fff');r.addColorStop(.25,'#fffa');r.addColorStop(1,'#fff0');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const glow=(col,s)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));sp.scale.set(s,s,s);return sp};
// ---------- characters
const ROLE={idle:['Idle_Sword','Idle_Weapon','Idle','Frog_Idle','Spider_Idle','Wasp_Flying'],walk:['Walk','Spider_Walk'],run:['Run','Run_Weapon','Running_A','Gallop','Spider_Walk','Frog_Jump','Wasp_Flying','Walk'],atk:['Sword_Slash','Staff_Attack','1H_Melee_Attack_Slice_Diagonal','1H_Melee_Attack_Chop','Attack','Frog_Attack','Spider_Attack','Wasp_Attack','Punch_Right'],shoot:['Gun_Shoot','1H_Ranged_Shoot'],cast:['Spell1','Spellcast_Shoot','Gun_Shoot'],skill:['Spell2','Roll','Kick_Right','Sword_Slash','Spellcast_Shoot','1H_Melee_Attack_Chop'],die:['Death','Death_A','Frog_Death','Spider_Death','Wasp_Death'],hit:['HitRecieve','RecieveHit','Hit_A'],cheer:['Wave','Cheer']};
// heroes: Quaternius CC0 rigs (see CREDITS.md); weapons borrowed from KayKit packs, attached to the hand bone
const HEROK={knight:'h_hooded',ranger:'h_adventurer',mage:'h_witch',assassin:'h_adv2',scholar:'h_wizard'},HTINT={assassin:'#6a4a9a'};
const WEAP={knight:[['WristL','knight','Round_Shield',.62]],ranger:[['WristR','ranger','2H_Crossbow',.7]],mage:[['WristR','mage','2H_Staff',1.45]],assassin:[['WristR','assassin','Knife',.5],['WristL','assassin','Knife_Offhand',.5]],scholar:[]};
const WROT={'1H_Sword':[0,0,-Math.PI/2],'Round_Shield':[0,Math.PI/2,0],'2H_Crossbow':[0,0,-Math.PI/2],'2H_Staff':[0,0,-Math.PI/2],'Knife':[0,0,-Math.PI/2],'Knife_Offhand':[0,0,Math.PI/2]};
const HPAL={knight:{Brown2:'#24407e',LightBrown:'#8a5a32',DarkBrown:'#3a2418',Metal:'#c4cedc',Metal_Dark:'#6a7488',Gold:'#f0c050',White:'#e8ecf4',Brown:'#2a1a12'},ranger:{Green:'#2f6a3a',LightGreen:'#5a9a4a',Brown:'#6a4426',Brown2:'#4a3020',Hair:'#6a3a1a'},assassin:{LightGreen:'#3a2a5a',Green:'#22183a',Brown_02:'#4a3a6a',White:'#d8d0ec',Hair_Brown:'#1a1424'},mage:{Purple:'#5a2a9a'}};
const SPD={},_v=new THREE.Vector3(),_q=new THREE.Quaternion();
function outline(o,th){o.traverse(m=>{if(!m.isSkinnedMesh||m.userData.ol)return;const mat=new THREE.MeshBasicMaterial({color:0x1a1020,side:THREE.BackSide});mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=position+normal*'+th.toFixed(4)+';')};mat.customProgramCacheKey=()=>'ol'+th.toFixed(4);
 const ol=new THREE.SkinnedMesh(m.geometry,mat);ol.userData.ol=1;ol.bind(m.skeleton,m.bindMatrix);ol.position.copy(m.position);ol.quaternion.copy(m.quaternion);ol.scale.copy(m.scale);ol.frustumCulled=false;m.parent.add(ol)})}
function attach(o,cls){for(const[bn,src,name,len]of WEAP[cls]||[]){const b=o.getObjectByName(bn),m0=MOD[src]&&MOD[src].scene.getObjectByName(name);if(!b||!m0)continue;const m=m0.clone();m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.set(1,1,1);
  const bb=new THREE.Box3().setFromObject(m),L=Math.max(...bb.getSize(_v).toArray())||1;b.getWorldScale(_v);const r=WROT[name]||[0,0,0];const g=new THREE.Group();g.add(m);g.rotation.set(r[0],r[1],r[2]);g.scale.setScalar(len/(L*_v.x));g.position.y=.09/_v.x;b.add(g);
  m.traverse(x=>{if(x.isMesh){x.castShadow=true;x.material=x.material.clone();x.material.roughness=.25;x.material.metalness=.5;x.material.envMapIntensity=1.2;rimify(x.material,.5)}})}}
function measure(k,c,o,s){// ground speed of a walk/run cycle in world units per sec at height 1 (from foot travel)
 if(SPD[k])return SPD[k];const r={};const feet=[];o.traverse(b=>{if(b.isBone&&/^foot[._]?[lr]?$|^foot\.(l|r)$/i.test(b.name))feet.push(b)});if(!feet.length)o.traverse(b=>{if(b.isBone&&/foot/i.test(b.name)&&!/end|ik/i.test(b.name))feet.push(b)});
 for(const role of['walk','run']){const a=c.A[role];if(!a||!feet.length){r[role]=0;continue}c.mx.stopAllAction();a.reset().play();const T=a.getClip().duration;let lo=1e9,hi=-1e9;
  for(let i=0;i<=24;i++){c.mx.setTime(T*i/24);o.updateMatrixWorld(true);feet[0].getWorldPosition(_v);c.w.worldToLocal(_v);lo=Math.min(lo,_v.z);hi=Math.max(hi,_v.z)}r[role]=2*(hi-lo)/T/c.h}
 c.mx.stopAllAction();c.cur=null;SPD[k]=r;return r}
function mkChar(k,h,tint,em,cls){const src=MOD[k];const n=norm(k,h);const o=SU.clone(src.scene);const hero=!!cls;glossy(o,tint,em,cls);const w=new THREE.Group(),inner=new THREE.Group();inner.add(o);o.position.set(-n.cx,-n.minY,-n.cz);inner.scale.setScalar(n.s);w.add(inner);w.updateMatrixWorld(true);
 if(hero){attach(o,cls);outline(o,.022/n.s)}
 const mx=new THREE.AnimationMixer(o),A={};for(const[r,names]of Object.entries(ROLE)){for(const nm of names){const c=src.animations.find(c=>c.name.split('|').pop()===nm);if(c){A[r]=mx.clipAction(c);break}}}
 const sh=new THREE.Mesh(new THREE.CircleGeometry(h*.34,24),new THREE.MeshBasicMaterial({map:blobTex,color:0,transparent:true,opacity:.42,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.04;w.add(sh);
 const c={w,mx,A,cur:null,h,lock:0,sv:0,play(r,once,fade){const a=A[r]||(r==='walk'?A.run:null)||A.idle;if(!a)return;if(once){a.reset();a.timeScale=1;a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;if(this.cur&&this.cur!==a)a.crossFadeFrom(this.cur,fade||.12,false);a.play();this.cur=a;this.lock=a.getClip().duration*.85;return}
  if(this.cur===a)return;a.reset();a.timeScale=1;a.setLoop(THREE.LoopRepeat);a.play();if(this.cur)a.crossFadeFrom(this.cur,fade||.25,false);this.cur=a},
  // pick idle/walk/run from smoothed ground speed and match playback rate so feet don't slide
  move(mv,dt,walkMax){this.sv+=(mv-this.sv)*Math.min(1,dt*8);const v=this.sv;if(v<.25){this.play('idle');return}const role=v<(walkMax||2.4)&&A.walk?'walk':'run';this.play(role);const base=(this.spd[role]||0)*this.h;if(base>.05&&this.cur)this.cur.timeScale=Math.max(.55,Math.min(1.7,v/base))}};
 c.spd=measure(k,c,o,n.s);c.play('idle');scene.add(w);return c}
const blobTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#fff');r.addColorStop(.55,'#fffa');r.addColorStop(1,'#fff0');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);return t})();
function mkDragon(col){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:col,roughness:.35}),Bm=new THREE.MeshStandardMaterial({color:0xffe0a0,roughness:.4}),Wm=new THREE.MeshStandardMaterial({color:0xff9a4a,roughness:.5,side:THREE.DoubleSide}),E=new THREE.MeshBasicMaterial({color:0x111111});
 const S=(r,m,x,y,z,sx,sy,sz)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),m);s.position.set(x,y,z);s.scale.set(sx||1,sy||1,sz||1);s.castShadow=true;g.add(s);return s};
 S(.42,M,0,0,0,1,.9,1.25);S(.3,Bm,0,-.12,.12,.9,.7,1.1);const hd=S(.3,M,0,.32,.45);S(.16,M,0,.26,.72,1,.8,1.2);S(.05,E,.13,.4,.66);S(.05,E,-.13,.4,.66);
 for(const sx of[-1,1]){const h=new THREE.Mesh(new THREE.ConeGeometry(.06,.25,8),Bm);h.position.set(.12*sx,.6,.36);h.rotation.x=-.5;g.add(h)}
 const tail=new THREE.Mesh(new THREE.ConeGeometry(.16,.9,10),M);tail.position.set(0,-.05,-.75);tail.rotation.x=-Math.PI/2-.3;g.add(tail);
 const wing=sx=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.9,.35);s.lineTo(1.1,-.1);s.lineTo(.7,-.25);s.lineTo(.4,-.15);s.lineTo(0,-.2);const m=new THREE.Mesh(new THREE.ShapeGeometry(s),Wm);const p=new THREE.Group();p.add(m);m.rotation.x=-Math.PI/2;p.scale.x=sx;p.position.set(.22*sx,.18,0);g.add(p);return p};
 const wl=wing(1),wr=wing(-1);const o=new THREE.Group();o.add(g);g.scale.setScalar(.9);const sh=new THREE.Mesh(new THREE.CircleGeometry(.45,16),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-Math.PI/2;o.add(sh);scene.add(o);return{w:o,g,wl,wr,sh}}
// ---------- world objects
let HERO=null,HCLS=null,WOLF=null,NPC={},PORTAL=null,CHEST=null,TRING=null,DRING=null;const MOB=new Map(),OTH=new Map(),PET=[],DROP=new Map(),FX3=[];
const MOBK=['frog','spider','skel'],MOBH3=[1.3,.75,1.75];
function heroObj(){const c=S.cls||'knight';if(HCLS!==c){if(HERO)scene.remove(HERO.w);HERO=mkChar(HEROK[c],1.8,HTINT[c],null,c);HCLS=c}return HERO}
function buildStatic(){WOLF=mkChar('wolf',1.4,'#c8d4ff');WOLF.w.visible=false;
 for(const k in NPCS){const c=mkChar('npc',1.8,k==='elder'?'#7a9aff':'#ff9a5a');const[x,y]=PTS[k];c.w.position.set(x*K,hgt(x*K,y*K),y*K);c.w.rotation.y=k==='smith'?-.4:.4;NPC[k]=c}
 const pg=new THREE.Group(),tm=new THREE.MeshStandardMaterial({color:0x8a7a9a,roughness:.6}),tor=new THREE.Mesh(new THREE.TorusGeometry(2.2,.35,10,32),tm);tor.position.y=2.6;tor.castShadow=true;pg.add(tor);
 const disc=new THREE.Mesh(new THREE.CircleGeometry(2,32),new THREE.MeshBasicMaterial({color:0x6ad8ff,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));disc.position.y=2.6;pg.add(disc);const gl2=glow(0x5ac8ff,9);gl2.position.y=2.6;pg.add(gl2);
 pg.position.set(PTS.portal[0]*K,hgt(PTS.portal[0]*K,PTS.portal[1]*K),PTS.portal[1]*K);pg.rotation.y=-.3;scene.add(pg);PORTAL={g:pg,disc};
 const cg=new THREE.Group(),wd=new THREE.MeshStandardMaterial({color:0x8a4a1a,roughness:.5}),gd=new THREE.MeshStandardMaterial({color:0xffc83a,roughness:.25,metalness:.6,emissive:0x664400,emissiveIntensity:.3});
 const bx=new THREE.Mesh(new THREE.BoxGeometry(1.1,.6,.75),wd);bx.position.y=.3;const lid=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,1.1,12,1,false,0,Math.PI),wd);lid.rotation.z=Math.PI/2;lid.position.y=.6;const tr=new THREE.Mesh(new THREE.BoxGeometry(1.14,.12,.79),gd);tr.position.y=.55;
 [bx,lid,tr].forEach(m=>{m.castShadow=true;cg.add(m)});const cgl=glow(0xffd54a,3.2);cgl.position.y=.8;cg.add(cgl);scene.add(cg);CHEST=cg;
 const ring=(c,r)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r*.82,r,40),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;scene.add(m);return m};
 TRING=ring(0xff5a3a,1.1);DRING=ring(0xffffff,.6)}
const DROPM={gold:()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.08,16),new THREE.MeshStandardMaterial({color:0xffcf3a,metalness:.7,roughness:.25,emissive:0x664400,emissiveIntensity:.5}));m.rotation.x=Math.PI/2;return m},
 key:()=>new THREE.Mesh(new THREE.BoxGeometry(.2,.5,.08),new THREE.MeshStandardMaterial({color:0xffe07a,metalness:.6,roughness:.3,emissive:0x553300,emissiveIntensity:.5})),
 treat:()=>new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshStandardMaterial({color:0xb0503a,roughness:.5}))};
// ---------- 3D fx
function fxSlash(x,z,y,face){const m=new THREE.Mesh(new THREE.RingGeometry(.7,1.25,24,1,-.3,Math.PI*1.1),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:1,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));
 m.position.set(x,y+1,z);m.rotation.set(-1.0,0,face>0?.3:Math.PI-.3);scene.add(m);FX3.push({m,l:0,d:.25,k:'slash'})}
function fxRing(x,z,col,d,r){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,hgt(x,z)+.1,z);scene.add(m);FX3.push({m,l:0,d,k:'ring',r})}
function fxBeam(x,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,9,20,1,true),new THREE.MeshBasicMaterial({color:0xffd54a,transparent:true,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));m.position.set(x,hgt(x,z)+4.5,z);scene.add(m);FX3.push({m,l:0,d:1.1,k:'beam'})}
const PROJ=new Map();
// ---------- 2D overlay helpers
let CW=1,CH=1,DPR=1,CVc,CX;const V=new THREE.Vector3();
function proj(x,y,z){V.set(x,y,z).project(cam);return[(V.x+1)/2*CW,(1-V.y)/2*CH,V.z<1]}
const FONT='"Arial Rounded MT Bold","Trebuchet MS",Arial,sans-serif';
function tagT(x,y,t,c,sz){CX.font=`900 ${sz||11}px ${FONT}`;CX.textAlign='center';CX.lineWidth=3;CX.strokeStyle='rgba(0,0,0,.8)';CX.strokeText(t,x,y);CX.fillStyle=c;CX.fillText(t,x,y)}
function barT(x,y,w,p,c){p=Math.max(0,Math.min(1,p));CX.fillStyle='rgba(10,23,52,.9)';CX.fillRect(x-w/2-1.5,y-1.5,w+3,7);CX.fillStyle=c;CX.fillRect(x-w/2,y,w*p,4)}
// fx text anchoring: map 2D-game fx (x,y-offset) onto the unit below it
function anchor(f){if(f.a3)return;const us=[F.h,...F.mobs,...(F.boss?[F.boss]:[]),...F.others];let b=null,bd=1e9;for(const u of us){const dx=Math.abs(u.x-(f.x0??f.x)),dy=u.y-f.y;if(dx<45&&dy>-10&&dy<220&&dx+Math.abs(dy-70)*.2<bd){bd=dx+Math.abs(dy-70)*.2;b=u}}
 if(b){const H=b.boss?4:1.8;f.a3=[b.x*K,b.y*K,Math.min(H*1.25,(b.y-f.y)/70*1.8)]}else f.a3=[f.x*K,f.y*K,1.5]}
// ---------- resize/input/draw overrides
function resize3(){const w=$('world');CVc=$('cv');DPR=Math.min(2,devicePixelRatio||1);CW=w.clientWidth;CH=w.clientHeight;CVc.width=CW*DPR;CVc.height=CH*DPR;CX=CVc.getContext('2d');R3.setSize(CW,CH,false);cam.aspect=CW/CH;cam.updateProjectionMatrix();W.CV=CVc;W.CX=CX;W.CW=CW;W.CH=CH;W.DPR=DPR}
const ray=new THREE.Raycaster(),NV=new THREE.Vector2();
function pickGround(sx,sy){NV.set(sx/CW*2-1,-(sy/CH)*2+1);ray.setFromCamera(NV,cam);const h=ray.intersectObject(ground,false)[0];return h?[h.point.x/K,h.point.z/K]:null}
function initInput3(){const C=$('cv');let st=null;const pt=e=>{const r=C.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
 C.addEventListener('pointerdown',e=>{const[x,y]=pt(e);st={x,y,moved:0};C.setPointerCapture(e.pointerId)});
 C.addEventListener('pointermove',e=>{if(!st)return;const[x,y]=pt(e),dx=x-st.x,dy=y-st.y,d=Math.hypot(dx,dy);if(d>12){st.moved=1;F.dest=null;const k=Math.min(1,d/48);F.joy={sx:st.x,sy:st.y,dx:dx/d*k,dy:dy/d*k}}});
 const up=()=>{if(!st)return;if(F.dlg&&!st.moved){dlgNext();st=null;return}if(!st.moved){F.manualT=F.now;const p=pickGround(st.x,st.y);
   // tap on units: screen-space pick
   const all=F.mobs.concat(F.boss?[F.boss]:[]).filter(m=>!m.dead);let m=null,bd=46;for(const o of all){const[sx,sy]=proj(o.x*K,hgt(o.x*K,o.y*K)+.8,o.y*K);const d=Math.hypot(sx-st.x,sy-st.y);if(d<bd){bd=d;m=o}}
   const npc=Object.keys(NPCS).find(k=>{const[x,y]=PTS[k];const[sx,sy]=proj(x*K,hgt(x*K,y*K)+.9,y*K);return Math.hypot(sx-st.x,sy-st.y)<45});
   if(m){F.tgt=m;F.dest={x:m.x-(m.x>F.h.x?range()*.8:-range()*.8),y:m.y}}else if(npc)F.dest={x:PTS[npc][0]+40,y:PTS[npc][1]+20,act:()=>talk(npc)};
   else if(p){const[wx,wy]=p;if(F.chest&&Math.hypot(F.chest.x-wx,F.chest.y-wy)<60)F.dest={x:F.chest.x,y:F.chest.y,act:openFieldChest};else if(S.q>=7&&Math.hypot(PTS.portal[0]-wx,PTS.portal[1]-wy)<80)F.dest={x:PTS.portal[0],y:PTS.portal[1]+30,act:enterPortal};else F.dest={x:wx,y:wy}}}
  F.joy=null;F.manualT=F.now;st=null};C.addEventListener('pointerup',up);C.addEventListener('pointercancel',up)}
const CT=new THREE.Vector3(),LP=new WeakMap();let lastT=performance.now(),camInit=0;
function syncUnit(c,u,dt,isHero){const x=u.x*K,z=u.y*K,y=hgt(x,z);const lp=LP.get(u)||{x,z};const dx=x-lp.x,dz=z-lp.z,mv=Math.hypot(dx,dz)/Math.max(dt,1e-3);LP.set(u,{x,z});
 c.w.position.set(x,y,z);let face=null;if(mv>.3)face=Math.atan2(dx,dz);const t=isHero?F.tgt:null;if(isHero&&t&&!t.dead&&D(t,u)<range()+10)face=Math.atan2(t.x*K-x,t.y*K-z);
 if(face!==null){let d=face-c.w.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));c.w.rotation.y+=d*Math.min(1,dt*7)}return mv}
function draw3(){if(!F||!CX)return;const now=performance.now(),dt=Math.min(.1,(now-lastT)/1000);lastT=now;const t=F.now,h=F.h,q=Q();
 // hero
 const H=heroObj();const hm=syncUnit(H,h,dt,1);H.w.visible=!(h.dead>0);H.lock-=dt;
 if(h.mount){WOLF.w.visible=true;WOLF.w.position.copy(H.w.position);WOLF.w.rotation.y=H.w.rotation.y;WOLF.move(hm,dt,3);H.w.position.y+=.95;H.play('idle')}else{WOLF.w.visible=false;
  if((h.skAnim||0)!==H.ska){H.ska=h.skAnim||0;if(H.ska){H.play('skill',1,.1)}}else if(h.pose==='attack'&&H.lock<=0&&hm<.8){H.play(range()>100?(S.cls==='ranger'?'shoot':'cast'):'atk',1)}else if(H.lock<=0||hm>.8){if(hm>.8)H.lock=0;H.move(hm,dt)}else H.sv+=(hm-H.sv)*Math.min(1,dt*8)}
 // mobs
 const ms=F.mobs.concat(F.boss?[F.boss]:[]);const seen=new Set();
 for(const m of ms){seen.add(m);let c=MOB.get(m);const ci={A:0,B:1,C:2}[m.camp];const key=m.boss?'boss':ci;if(c&&c.key!==key){scene.remove(c.w);c=null}
  if(!c){c=m.boss?mkChar('skelw',4.2,'#ff6a4a','#401000'):mkChar(MOBK[ci],MOBH3[ci],null);c.key=key;c.dead=0;MOB.set(m,c)}
  if(m.dead){if(!c.dead){c.dead=now;c.play('die',1)}c.w.visible=now-c.dead<1400;if(c.w.visible){c.w.position.y-=(now-c.dead>900)?dt*.8:0}continue}
  if(c.dead){c.dead=0;c.w.visible=true;c.play('idle');LP.delete(m)}
  const mv=syncUnit(c,m,dt);c.lock-=dt;if(m.aggro&&D(m,h)<(m.boss?85:50)&&c.lock<=0&&m.cd>(m.boss?1.4:1.1))c.play('atk',1);else if(c.lock<=0)c.move(mv,dt,1.8);
  if(m.aggro&&D(m,h)<(m.boss?85:50)){let d=Math.atan2(h.x*K-m.x*K,h.y*K-m.y*K)-c.w.rotation.y;c.w.rotation.y+=Math.atan2(Math.sin(d),Math.cos(d))*Math.min(1,dt*10)}
  c.w.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissiveIntensity=m.hit>0?1.2:(m.boss?.25:0)})}
 for(const[m,c]of MOB)if(!seen.has(m)){scene.remove(c.w);MOB.delete(m)}
 // other players (SIMULATED)
 for(const o of F.others){let c=OTH.get(o);if(!c){c=mkChar(HEROK[o.c]||HEROK.knight,1.8,HTINT[o.c],null,o.c||'knight');OTH.set(o,c)}const mv=syncUnit(c,o,dt);c.move(mv,dt)}
 // pets: procedural dragons
 while(PET.length<F.pets.length)PET.push(mkDragon([0xff6a3a,0x5ab0ff,0x7ad05a][PET.length%3]));while(PET.length>F.pets.length){scene.remove(PET.pop().w)}
 F.pets.forEach((p,i)=>{const d=PET[i],x=p.x*K,z=p.y*K,lp=LP.get(p)||{x,z};LP.set(p,{x,z});const fy=1.4+Math.sin(t*3+i)*.18;d.w.position.set(x,hgt(x,z),z);d.g.position.y=fy;const dx=x-lp.x,dz=z-lp.z;if(Math.hypot(dx,dz)>.005)d.w.rotation.y=Math.atan2(dx,dz);
  const fl=Math.sin(t*14+i)*.7;d.wl.rotation.z=fl;d.wr.rotation.z=-fl;d.sh.scale.setScalar(1-fy*.15)});
 // npcs, portal, chest, drops
 for(const k in NPC)NPC[k].mx.update(dt);PORTAL.g.visible=q.t==='portal'||S.q>=7;PORTAL.disc.rotation.z=t;
 CHEST.visible=!!F.chest;if(F.chest){const x=F.chest.x*K,z=F.chest.y*K;CHEST.position.set(x,hgt(x,z)+Math.abs(Math.sin(t*3))*.12,z)}
 const ds=new Set(F.drops);for(const o of F.drops){let m=DROP.get(o);if(!m){m=DROPM[o.k]();m.castShadow=true;scene.add(m);DROP.set(o,m)}const x=o.x*K,z=o.y*K;m.position.set(x,hgt(x,z)+.4+Math.abs(Math.sin(t*5+o.x))*.25,z);m.rotation.y=t*3}
 for(const[o,m]of DROP)if(!ds.has(o)){scene.remove(m);DROP.delete(o)}
 // rings
 const tg=F.tgt&&!F.tgt.dead?F.tgt:null;TRING.visible=!!tg;if(tg){const x=tg.x*K,z=tg.y*K;TRING.position.set(x,hgt(x,z)+.08,z);TRING.scale.setScalar(tg.boss?2.4:1);TRING.rotation.z=t*1.5}
 DRING.visible=!!F.dest;if(F.dest){const x=F.dest.x*K,z=F.dest.y*K;DRING.position.set(x,hgt(x,z)+.08,z);DRING.scale.setScalar(.6+((t*2)%1)*.8)}
 // fx from the 2D sim -> 3D
 for(const f of F.fx){if(f.seen)continue;f.seen=1;if(f.slash){const u=f.face;fxSlash(f.x*K,(f.y+30)*K,hgt(f.x*K,(f.y+30)*K),u)}if(f.ring)fxRing(f.x*K,f.y*K,0xffb040,.45,7);if(f.heal)fxRing(h.x*K,h.y*K,0x9fff6a,.7,3)}
 for(const f of F.fx)if(f.proj){let m=PROJ.get(f);if(!m){const mage=S.cls==='mage'||S.cls==='scholar';m=new THREE.Group();const core=new THREE.Mesh(new THREE.SphereGeometry(mage?.22:.08,10,8),new THREE.MeshBasicMaterial({color:mage?0xffc080:0xe0f0ff}));m.add(core);m.add(glow(mage?(S.cls==='scholar'?0x6ab0ff:0xff7a2a):0xbfe0ff,mage?1.6:.8));scene.add(m);PROJ.set(f,m)}const x=f.x*K,z=(f.y+40)*K;m.position.set(x,hgt(x,z)+1.1,z)}
 for(const[f,m]of PROJ)if(!F.fx.includes(f)){scene.remove(m);PROJ.delete(f)}
 for(let i=FX3.length-1;i>=0;i--){const e=FX3[i];e.l+=dt;const k=e.l/e.d;if(k>=1){scene.remove(e.m);FX3.splice(i,1);continue}e.m.material.opacity=1-k;if(e.k==='ring')e.m.scale.setScalar(1+k*e.r);if(e.k==='slash')e.m.rotation.z+=dt*6;if(e.k==='beam'){e.m.scale.set(1+k,1,1+k)}}
 // mixers
 H.mx.update(dt);WOLF.mx.update(dt);for(const c of MOB.values())if(c.w.visible)c.mx.update(dt);for(const c of OTH.values())c.mx.update(dt);
 // camera: close 3/4 view, ~53 deg pitch
 const hx=h.x*K,hz=h.y*K,hy=hgt(hx,hz);if(!camInit){CT.set(hx,hy,hz);camInit=1}CT.lerp(V.set(hx,hy,hz),Math.min(1,dt*5));OCC.value.set(CT.x,CT.y,CT.z);cam.position.set(CT.x,CT.y+13.5,CT.z+10.4);cam.lookAt(CT.x,CT.y+.8,CT.z-1);
 sun.position.set(CT.x+14,CT.y+30,CT.z+10);sun.target.position.copy(CT);
 R3.render(scene,cam);
 // ---- 2D overlay
 CX.setTransform(DPR,0,0,DPR,0,0);CX.clearRect(0,0,CW,CH);
 // quest guide chevrons on the ground
 if(isAuto()&&!h.dead&&!F.dlg){const g=questTarget(),dx=g.x-h.x,dy=g.y-h.y,d=Math.hypot(dx,dy);if(d>160){const ux=dx/d,uy=dy/d;for(let i=0;i<4;i++){const s=(t*1.5+i/4)%1,px=h.x+ux*(40+s*110),py=h.y+uy*(40+s*110);const[ax,ay]=proj(px*K,hgt(px*K,py*K)+.1,py*K),[bx,by]=proj((px+ux*10)*K,hgt(px*K,py*K)+.1,(py+uy*10)*K);
  CX.save();CX.globalAlpha=Math.sin(s*Math.PI)*.8;CX.translate(ax,ay);CX.rotate(Math.atan2(by-ay,bx-ax));CX.fillStyle='#ffe066';CX.beginPath();CX.moveTo(9,0);CX.lineTo(-7,-8);CX.lineTo(-2,0);CX.lineTo(-7,8);CX.closePath();CX.fill();CX.restore()}}}
 const head=(u,H3)=>proj(u.x*K,hgt(u.x*K,u.y*K)+H3,u.y*K);
 for(const k in NPCS){const[x,y]=PTS[k];const[sx,sy]=head({x,y},2.2);tagT(sx,sy,NPCS[k].n,'#ffe066');if(q.t==='talk'&&q.who===k){const yy=sy-22+Math.sin(t*5)*4;CX.fillStyle='#ffd54a';CX.strokeStyle='#0a1734';CX.lineWidth=3;CX.beginPath();CX.arc(sx,yy,12,0,TAU);CX.fill();CX.stroke();tagT(sx,yy+6,'!','#0a1734',17)}}
 if(PORTAL.g.visible){const[sx,sy]=head({x:PTS.portal[0],y:PTS.portal[1]},5.4);tagT(sx,sy,'Waygate','#9fe0ff',12)}
 if(F.chest){const[sx,sy]=head(F.chest,1.4);tagT(sx,sy,'Treasure','#ffd54a')}
 for(const m of ms){if(m.dead)continue;const c=MOB.get(m);if(!c)continue;const[sx,sy]=head(m,c.h+.25);const show=!m.boss&&(F.tgt===m||m.hp<m.mhp);if(show)barT(sx,sy,m.boss?90:42,m.hp/m.mhp,'#e2382a');if(m.boss||F.tgt===m)tagT(sx,sy-4,`Lv${m.lv} ${m.n}`,m.boss?'#ff9a8a':'#ffe066')}
 for(const o of F.others){const[sx,sy]=head(o,2.05);if(!o.ti)o.ti=pick(TITLES);tagT(sx,sy-11,'✦ '+o.ti,'#ffd27a',9);tagT(sx,sy,o.n,'#7dff6a')}
 if(h.dead>0){const[sx,sy]=head(h,.5);tagT(sx,sy,'Reviving '+Math.ceil(h.dead)+'s','#ff9a8a',13)}else{const[sx,sy]=head(h,h.mount?3:2.15);barT(sx,sy,52,h.hp/hmax(),'#4cd82a');tagT(sx,sy-5,S.name||'You','#7dff6a',12);tagT(sx,sy-18,'✦ Meadow Warden','#ffd27a',9)}
 for(const f of F.fx){if(f.spark){anchor(f);const[sx,sy]=proj(f.a3[0],hgt(f.a3[0],f.a3[1])+f.a3[2],f.a3[1]);const k=f.l/.4;CX.globalAlpha=Math.max(0,1-k);CX.fillStyle=f.c||'#ffe9a0';CX.beginPath();CX.arc(sx+f.vx*f.l*.35,sy+f.vy*f.l*.35+250*f.l*f.l*.35,3*(1-k)+1.2,0,TAU);CX.fill();CX.globalAlpha=1}
  else if(f.t!==undefined){anchor(f);const[sx,sy]=proj(f.a3[0],hgt(f.a3[0],f.a3[1])+f.a3[2],f.a3[1]);const k=f.l/.9,pop=f.l<.12?1.6-f.l/.12*.6:1,sz=(f.big?24:16)*pop,yy=sy-(1-Math.pow(1-Math.min(1,k),2))*46;CX.globalAlpha=Math.max(0,k<.6?1:1-(k-.6)/.4);CX.font=`900 ${sz}px ${FONT}`;CX.textAlign='center';CX.lineJoin='round';CX.lineWidth=4;CX.strokeStyle='#0a1734';CX.strokeText(f.t,sx+(f.x-(f.x0??f.x))*.6,yy);CX.fillStyle=f.c;CX.fillText(f.t,sx+(f.x-(f.x0??f.x))*.6,yy);CX.globalAlpha=1}}
 if(F.joy){const j=F.joy;CX.globalAlpha=.35;CX.fillStyle='#0a1734';CX.beginPath();CX.arc(j.sx,j.sy,50,0,TAU);CX.fill();CX.globalAlpha=.6;CX.strokeStyle='#fff';CX.lineWidth=3;CX.stroke();CX.globalAlpha=.95;CX.fillStyle='#5a9cff';CX.beginPath();CX.arc(j.sx+j.dx*36,j.sy+j.dy*36,24,0,TAU);CX.fill();CX.globalAlpha=1}
 if(F.banner>0){const a=Math.min(1,F.banner),n=ISLES[S.isle%4].n,y=CH*.27;CX.globalAlpha=a;tagT(CW/2,y,n,'#ffe066',24);tagT(CW/2,y+20,'ZONE '+(S.isle+1),'#cfe0ff',11);CX.globalAlpha=1}
 drawHud();drawMini3();fpsTick(now)}
let fc=0,ft=performance.now();W.P3D_FPS=0;function fpsTick(n){fc++;if(n-ft>1000){W.P3D_FPS=fc*1000/(n-ft);fc=0;ft=n}}
function drawMini3(){const c=$('mini');if(!c||!GT)return;const g=c.getContext('2d'),w=c.width,R=w/2,h=F.h,span=700,sc=w/span;g.save();g.clearRect(0,0,w,w);g.beginPath();g.arc(R,R,R,0,TAU);g.clip();
 g.drawImage(GT,(h.x-span/2)*GT.width/ZW,(h.y-span/2)*GT.height/ZH,span*GT.width/ZW,span*GT.height/ZH,0,0,w,w);
 const dot=(x,y,col,r)=>{g.fillStyle=col;g.beginPath();g.arc(R+(x-h.x)*sc,R+(y-h.y)*sc,r,0,TAU);g.fill()};
 for(const m of F.mobs)if(!m.dead)dot(m.x,m.y,'#e2382a',3);if(F.boss)dot(F.boss.x,F.boss.y,'#ff0',7);for(const k in NPCS)dot(...PTS[k],'#ffd54a',5);for(const o of F.others)dot(o.x,o.y,'#7dff6a',3.5);
 const tq=questTarget();g.strokeStyle='#fff';g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.moveTo(R,R);g.lineTo(R+(tq.x-h.x)*sc,R+(tq.y-h.y)*sc);g.stroke();g.setLineDash([]);dot(h.x,h.y,'#4cff4a',6);g.restore()}
// ---------- class select (3D preview)
let PREV=null;function preview(on){if(!on){if(PREV){scene.remove(PREV.root);PREV=null}return}
 const root=new THREE.Group();scene.add(root);const ped=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.8,.4,40),new THREE.MeshStandardMaterial({color:0x2a3a6a,roughness:.3,metalness:.3}));ped.position.y=-.2;ped.receiveShadow=true;root.add(ped);
 const rg=new THREE.Mesh(new THREE.RingGeometry(1.6,1.9,48),new THREE.MeshBasicMaterial({color:0xffd54a,blending:THREE.AdditiveBlending,transparent:true,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.02;root.add(rg);const gw=glow(0x403020,3);gw.position.y=1.3;root.add(gw);
 root.position.set(70,40,30);PREV={root,ch:null,k:null};}
function previewCls(k){if(!PREV)return;if(PREV.ch){PREV.root.remove(PREV.ch.w)}const c=mkChar(HEROK[k],2.6,HTINT[k],null,k);scene.remove(c.w);PREV.root.add(c.w);c.play('atk',1);PREV.ch=c;PREV.k=k}
function previewLoop(){if(!PREV)return;const dt=1/60;PREV.root.rotation.y+=dt*.5;if(PREV.ch){PREV.ch.mx.update(dt);PREV.ch.lock-=dt;if(PREV.ch.lock<=0)PREV.ch.play('idle')}const r=PREV.root.position;
 cam.position.set(r.x,r.y+2.6,r.z+10.5);cam.lookAt(r.x,r.y+1.15,r.z);scene.fog.near=300;scene.fog.far=600;sun.position.set(r.x+5,r.y+12,r.z+8);sun.target.position.copy(r);R3.render(scene,cam);requestAnimationFrame(previewLoop)}
function avatarSnap(){try{R3.render(scene,cam);const c=document.createElement('canvas');c.width=c.height=96;const s=gl.width,h=gl.height;c.getContext('2d').drawImage(gl,s*.3,h*.12,s*.4,s*.4,0,0,96,96);return c.toDataURL('image/webp')}catch(e){return ''}}
// ---------- public api
W.G3D={burst(){if(F)fxBeam(F.h.x*K,F.h.y*K),fxRing(F.h.x*K,F.h.y*K,0xffe066,.8,6)},setScene(n){/* side-mode scenes plug in here (next: Hunting Stage) */W.G3D.scene=n},scene:'field'};
// ---------- boot
async function boot3(){const P=await loadAll();const ks=Object.keys(P).filter(k=>k.endsWith('.glb'));let i=0;
 for(const k of ks){const buf=await b64buf(P[k]);MOD[k.slice(0,-4)]=await new Promise((res,rej)=>loader.parse(buf,'',res,rej));i++;bar(.92+.06*i/ks.length)}
 const AU={};for(const k of Object.keys(P).filter(k=>k.endsWith('.mp3'))){AU[k.slice(0,-4)]=URL.createObjectURL(new Blob([await b64buf(P[k])],{type:'audio/mpeg'}))}AUD.init(AU);
 buildGround();scatter();buildProps();buildStatic();
 // swap in the 3D renderer
 W.draw=draw3;W.drawMini=drawMini3;W.resize=resize3;W.initInput=initInput3;resize3();
 R3.compile(scene,cam);bar(1);const t=$('ttl');t.classList.add('rdy');$('ttlt').textContent='Ready!';
 const unlock=()=>{AUD.start()};addEventListener('pointerdown',unlock,{once:true});
 $('ttlg').onclick=()=>{AUD.start();t.style.opacity=0;t.style.pointerEvents='none';setTimeout(()=>t.remove(),460);openCS()}}
function openCS(){const cs=$('cs');cs.classList.add('on');document.body.classList.add('csm');let sel=CLASSES[S.cls]?S.cls:'knight';preview(true);previewLoop();
 const L=$('csl');L.innerHTML=CLS_ORDER.map(k=>`<button data-k="${k}"><span>${CLASSES[k].e}</span><b>${CLASSES[k].n}</b></button>`).join('');
 const pickC=k=>{sel=k;L.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));$('cse').textContent=CLASSES[k].e;$('csn').textContent=CLASSES[k].n;$('csd').textContent=CLASSES[k].d;previewCls(k)};
 L.querySelectorAll('button').forEach(b=>b.onclick=()=>pickC(b.dataset.k));pickC(sel);
 $('csnext').onclick=()=>pickC(CLS_ORDER[(CLS_ORDER.indexOf(sel)+1)%CLS_ORDER.length]);
 $('csgo').onclick=()=>{const av=IMG[sel+'_idle']||IMG.knight_idle;S.cls=sel;if(!S.pets.length){const p=mkPet(0);S.pets.push(p);S.team=[p.id]}save();preview(false);scene.fog.near=30;scene.fog.far=80;document.body.classList.remove('csm');cs.classList.remove('on');
  if(av)S.avi=av;fieldInit();resize3();hudSkills();muteHud();vipHud();chatRender();S.avi=av||IMG[(S.cls||'knight')+'_idle'];const a=$('avi');if(a)a.src=S.avi;W.P3D_READY=1}}
boot3().catch(e=>{console.error(e);$('ttlt').textContent='Load error: '+e.message});
