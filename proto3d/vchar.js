// Anime hero (VRoid CC0 base "HairSample_Male", recolored) + procedural, speed-matched animation.
import * as THREE from 'three';
import * as SU from './lib/SkeletonUtils.js';
const TAU=Math.PI*2,q1=new THREE.Quaternion(),q2=new THREE.Quaternion(),X=new THREE.Vector3(1,0,0),Y=new THREE.Vector3(0,1,0),Z=new THREE.Vector3(0,0,1);
const grad=(()=>{const d=new Uint8Array([90,90,90,255,175,175,175,255,255,255,255,255]);const t=new THREE.DataTexture(d,3,1);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
function rim(m,s,col){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=1.-abs(dot(normalize(normal),normalize(vViewPosition)));totalEmissiveRadiance+=vec3('+col+')*smoothstep(.55,.95,fr)*'+s.toFixed(2)+';}')};m.customProgramCacheKey=()=>'vr'+s+col}
export function toonify(o){o.traverse(m=>{if(!m.isMesh)return;if(!m.geometry.attributes.normal)m.geometry.computeVertexNormals();m.castShadow=true;m.frustumCulled=false;const a=Array.isArray(m.material)?m.material:[m.material];
 m.material=a.map(x=>{const n=x.name||'';if(/FACE|EYE|_SKIN/.test(n)&&!/Body/.test(n)){const y=x.clone();if(/Face_00_SKIN/.test(n)){y.color=new THREE.Color(1,.97,.95)}return y}
  const y=new THREE.MeshToonMaterial({map:x.map,color:0xffffff,gradientMap:grad,alphaTest:x.alphaTest||0,transparent:x.transparent,side:x.side,name:n});rim(y,/HAIR/.test(n)?.55:.4,/HAIR/.test(n)?'.75,.85,1.':'.85,.92,1.');return y});if(m.material.length===1)m.material=m.material[0]})}
// silver armor pieces bound to bones
function armor(o,MOD){const steel=new THREE.MeshToonMaterial({color:0xb2c3dc,gradientMap:grad}),blue=new THREE.MeshToonMaterial({color:0x2850b8,gradientMap:grad}),gold=new THREE.MeshToonMaterial({color:0xf0c050,gradientMap:grad});
 rim(steel,.6,'.8,.9,1.');rim(gold,.4,'1.,.9,.6');const add=(bn,geo,mat,p,r,s)=>{const b=o.getObjectByName(bn);if(!b)return;const m=new THREE.Mesh(geo,mat);m.position.set(...p);if(r)m.rotation.set(...r);if(s)m.scale.set(...s);m.castShadow=true;b.add(m);return m};
 const pad=new THREE.SphereGeometry(.12,20,12,0,TAU,0,Math.PI*.55),ring=new THREE.TorusGeometry(.118,.012,6,24);
 const navy=new THREE.MeshToonMaterial({color:0x1d3a8a,gradientMap:grad,side:THREE.DoubleSide});rim(navy,.35,'.6,.75,1.');
 const lathe=(pts,seg)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg||28);
 // cuirass: one big shell over the bulky hoodie torso (Spine bone at y~1.15 model units)
 add('J_Bip_C_Spine',lathe([[.235,-.34],[.245,-.26],[.232,-.12],[.228,0],[.245,.12],[.25,.2],[.225,.27],[.16,.31],[.11,.325]],32),steel,[0,0,.0],null,[1,1,.78]);
 add('J_Bip_C_Spine',new THREE.TorusGeometry(.24,.016,6,32),gold,[0,-.03,0],[Math.PI/2,0,0],[1,.79,1]);
 add('J_Bip_C_Spine',new THREE.TorusGeometry(.25,.02,6,32),blue,[0,-.3,0],[Math.PI/2,0,0],[1,.8,1]);
 add('J_Bip_C_Spine',new THREE.TorusGeometry(.11,.03,8,24),steel,[0,.33,.0],[Math.PI/2,0,0],[1,.9,1]); // gorget
 add('J_Bip_C_Spine',new THREE.OctahedronGeometry(.04),gold,[0,.16,-.2],null,[1,1.3,.5]);
 add('J_Bip_C_Spine',new THREE.BoxGeometry(.018,.22,.01),gold,[0,.12,-.196],[.12,0,0]);add('J_Bip_C_Spine',new THREE.BoxGeometry(.15,.018,.01),gold,[0,.17,-.198],[.12,0,0]);
 // tabard front/back hanging from the plate hem + tassets
 const tab=new THREE.PlaneGeometry(.24,.4);tab.translate(0,-.2,0);
 add('J_Bip_C_Spine',tab,navy,[0,-.33,-.2],[.1,0,0]);add('J_Bip_C_Spine',tab,navy,[0,-.33,.2],[-.1,0,0]);
 add('J_Bip_C_Spine',new THREE.BoxGeometry(.24,.022,.012),gold,[0,-.71,-.24],[.1,0,0]);
 for(const sx of[-1,1])add('J_Bip_C_Spine',lathe([[.1,0],[.13,-.17]],12),steel,[sx*.14,-.32,0],null,[1,1,.85]);
 // cape from shoulders
 const cg=new THREE.PlaneGeometry(.44,1.05,4,8);cg.translate(0,-.525,0);{const p=cg.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),x=p.getX(i);p.setX(i,x*(1+(-y)*.55));p.setZ(i,(-y)*.12+Math.cos(x*9)*.015)}cg.computeVertexNormals()}
 const cape=add('J_Bip_C_UpperChest',cg,navy,[0,.12,.21]);o.userData.cape=cape;
 for(const[sd,sx]of[['L',-1],['R',1]]){add(`J_Bip_${sd}_UpperArm`,pad,steel,[sx*.05,.04,0],[0,0,-sx*.4],[1,.85,1.1]);add(`J_Bip_${sd}_UpperArm`,ring,gold,[sx*.05,.03,0],[Math.PI/2,0,-sx*.4],[1,1.1,1]);
  add(`J_Bip_${sd}_UpperArm`,new THREE.CylinderGeometry(.075,.068,.17,14),steel,[sx*.14,0,0],[0,0,Math.PI/2]);
  add(`J_Bip_${sd}_LowerArm`,new THREE.CylinderGeometry(.066,.056,.17,14),steel,[sx*.13,0,0],[0,0,Math.PI/2]);
  add(`J_Bip_${sd}_Hand`,new THREE.BoxGeometry(.09,.035,.08),steel,[sx*.04,.02,0]);
  add(`J_Bip_${sd}_UpperLeg`,new THREE.CylinderGeometry(.095,.08,.26,14),steel,[0,-.2,-.01],null,[1,1,.95]);
  add(`J_Bip_${sd}_LowerLeg`,new THREE.CylinderGeometry(.062,.05,.3,14),steel,[0,-.2,-.005]);add(`J_Bip_${sd}_LowerLeg`,new THREE.SphereGeometry(.05,12,8),gold,[0,-.01,-.05],null,[1,1,.6])}
 // sword (KayKit CC0) in right hand, blade forward
 const b=o.getObjectByName('J_Bip_R_Hand'),s0=MOD.knight&&MOD.knight.scene.getObjectByName('1H_Sword');if(b&&s0){const m=s0.clone();m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.set(1,1,1);const bb=new THREE.Box3().setFromObject(m),L=Math.max(...bb.getSize(new THREE.Vector3()).toArray());
  const g=new THREE.Group();g.add(m);m.position.y=-(bb.min.y)*(.0);g.scale.setScalar(.62/L);g.rotation.set(-Math.PI/2,0,0);g.position.set(-.07,-.015,0);const gg=new THREE.Group();gg.add(g);b.add(gg);
  m.traverse(x=>{if(x.isMesh){x.castShadow=true;x.material=x.material.clone();x.material.color.multiplyScalar(1.15);x.material.metalness=.3;x.material.roughness=.35;rim(x.material,.6,'.8,.9,1.')}});o.userData.sword=gg}}
export function mkVChar(MOD,h,scene,outline){const src=MOD.hero_vrm;const o=SU.clone(src.scene);toonify(o);armor(o,MOD);
 o.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(o),sz=bx.getSize(new THREE.Vector3());const s=h/sz.y;
 const w=new THREE.Group(),inner=new THREE.Group();inner.add(o);inner.rotation.y=Math.PI;inner.scale.setScalar(s);o.position.y=-bx.min.y;w.add(inner);
 if(outline)outline(o,.006);
 const B={};o.traverse(b=>{if(b.isBone||/J_Bip/.test(b.name))B[b.name.replace('J_Bip_','')]=b});const R0={};for(const k in B)R0[k]=B[k].quaternion.clone();const hip0=B.C_Hips.position.clone();
 const st={role:'idle',t:0,once:0,dur:0,ph:0,v:0,blend:1,prev:null};
 const set=(k,ax,ay,az,mul)=>{const b=B[k];if(!b)return;q1.setFromEuler(new THREE.Euler(ax,ay,az,'YXZ'));b.quaternion.copy(R0[k]).multiply(q1)};
 function pose(dt){st.t+=dt;const T=st.t,v=st.v,role=st.role;const run=role==='run',walk=role==='walk';
  const amp=run?.8:walk?.5:0;st.ph+=(walk||run)?v/(run?2.1:1.35)*TAU*dt:0;const p=st.ph,sp=Math.sin(p),cp=Math.cos(p);
  const br=Math.sin(T*2.2)*.025;let hipY=0,lean=run?.22:walk?.06:0,twist=0,ra=[0,0,0],la=[0,0,0],rl=0,ll=0,rk=0,lk=0,rel=-.35,lel=-.25,head=[0,0,0];
  if(walk||run){rl=-sp*amp;ll=sp*amp;rk=Math.max(0,cp)*amp*.9+.06;lk=Math.max(0,-cp)*amp*.9+.06;hipY=-Math.abs(cp)*(run?.05:.025)/s;ra=[sp*amp*.8,0,0];la=[-sp*amp*.8,0,0];rel=run?-1.1:-.45;lel=run?-1.1:-.4;twist=sp*(run?.18:.08)}
  if(role==='atk'||role==='skill'){const k=Math.min(1,st.t/st.dur);
   if(role==='atk'){// wind-up then diagonal slash
    const up=k<.35?k/.35:1-Math.min(1,(k-.35)/.25),sl=k<.35?0:Math.min(1,(k-.35)/.2);twist=-.5*up+.6*sl*(1-Math.max(0,k-.7)/.3);ra=[2.4*up+0.6*sl*(1-k),0,-.9*up+.3*sl];rel=-.6*up-.2;lean=.12+.15*sl;ll=.35*sl;rl=-.2*sl;lk=.35*sl;rk=.1*sl}
   else{const sp2=Math.sin(k*Math.PI);twist=k*TAU*0;ra=[1.6*sp2,0,-1.2*sp2];la=[1.,0,.9*sp2];rel=-.2;lean=.25*sp2;rk=lk=.5*sp2;hipY=-.08*sp2/s;inner.rotation.y=Math.PI+k*TAU}
   if(k>=1){st.once=0;st.role='idle';inner.rotation.y=Math.PI}}
  if(role==='die'){const k=Math.min(1,st.t/.8);lean=-1.3*k;hipY=-.35*k/s;rk=lk=1.2*k}
  if(role==='hit'){}
  // arms-down offset from VRoid T-pose; char faces -Z in bind space
  set('C_Hips',0,twist*.3,0);B.C_Hips.position.set(hip0.x,hip0.y+hipY,hip0.z);
  set('C_Spine',lean*.5+br,twist*.5,0);set('C_Chest',lean*.3,twist*.5,0);set('C_UpperChest',br,0,0);set('C_Neck',-lean*.4,-twist*.6,0);set('C_Head',-lean*.3+head[0],-twist*.3,0);
  set('L_UpperArm',la[0],0,1.2-la[2]+br);set('R_UpperArm',ra[0],0,-1.2+ra[2]-br);
  set('L_LowerArm',0,-lel,0);set('R_LowerArm',0,rel,0);
  set('R_Hand',0,0,.15);set('L_Hand',0,0,-.1);
  for(const sd of['L','R'])for(const f of['Index','Middle','Ring','Little'])for(const i of[1,2,3])set(`${sd}_${f}${i}`,0,0,(sd==='L'?1:-1)*(i===1?1.0:1.25));
  set('R_Thumb1',0,-.6,.0);set('R_Thumb2',0,-.4,0);
  set('L_UpperLeg',ll,0,.04);set('R_UpperLeg',rl,0,-.04);set('L_LowerLeg',-lk,0,0);set('R_LowerLeg',-rk,0,0);set('L_Foot',lk*.5-ll*.3,0,0);set('R_Foot',rk*.5-rl*.3,0,0)}
 const sh=new THREE.Mesh(new THREE.CircleGeometry(h*.3,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.04;w.add(sh);
 const c={w,h,lock:0,sv:0,vrm:1,A:{},mx:{update:dt=>pose(dt)},cur:null,spd:{},
  play(r,once){if(r==='shoot'||r==='cast')r='atk';if(once){st.role=r;st.t=0;st.dur=r==='skill'?.85:r==='die'?.8:.62;st.once=1;this.lock=st.dur*.9;return}if(st.once&&st.role!=='die')return;if(st.role!==r){st.role=r;st.t=0}},
  move(mv,dt,walkMax){this.sv+=(mv-this.sv)*Math.min(1,dt*8);const v=this.sv;st.v=v;if(st.once)return;if(v<.25){this.play('idle');return}this.play(v<(walkMax||2.6)?'walk':'run')}};
 pose(0);scene.add(w);return c}
