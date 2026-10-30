import os,io,base64,json,glob,re,shutil,sys
from PIL import Image
V=sys.argv[1] if len(sys.argv)>1 else '1'
B='/workspace/wyrmbound_backup_v4';A='/workspace/newgame-art';O='site';shutil.rmtree(O,ignore_errors=True);os.makedirs(O+'/lib');os.makedirs(O+'/packs')
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
SZ={'heroes':200,'companions':110,'enemies':160,'bosses':220,'items':96,'ui':72,'mounts':96}
IMG={}
for d,h in SZ.items():
  for f in glob.glob(f'{A}/{d}/*.webp'):
    k=os.path.basename(f)[:-5];im=Image.open(f).convert('RGBA')
    if d=='ui' and not k.startswith('icon_'):continue
    s=h/max(im.size);im=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.LANCZOS) if s<1 else im
    b=io.BytesIO();im.save(b,'WEBP',quality=80);IMG[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
UI={os.path.basename(f)[:-5]:'data:image/webp;base64,'+b64(f) for f in glob.glob('out/ui/*.webp')}
im=Image.open(f'{A}/ui/keyart.webp').convert('RGB');im.thumbnail((540,960));b=io.BytesIO();im.save(b,'WEBP',quality=70);KA='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
I180='data:image/png;base64,'+b64(f'{A}/icon/app_icon_180.png')
h=open('src/head3d.html').read().replace('href="icon180.png"','href="'+I180+'"').replace('__keyart__',KA)
def sub(m):
  k=m.group(1)
  if k=='IMG':return '__IMG__'
  if k.startswith('ui_'):return 'UI:'+k[3:]
  return IMG.get(k,'')
h=re.sub(r'__([a-z_0-9]+)__',sub,h)
h=re.sub(r'src="UI:([a-z_0-9]+)"',r'data-ui="\1"',h);h=re.sub(r'url\(UI:([a-z_0-9]+)\)',r'var(--ui-\1)',h);assert 'UI:' not in h.replace('__IMG__',json.dumps(IMG))
g=open(f'{B}/game.js').read().replace("'wyrm1'","'aethra3d1'");assert 'aethra3d1' in g
f=open(f'{B}/field.js').read();o="if(auto||S.auto)for(let i=0;i<3;i++)";assert o in f;f=f.replace(o,"if(S.autoSkill)for(let i=0;i<3;i++)")
o="if(av&&av.src!==ak)av.src=ak"
if o in f:f=f.replace(o,"if(av&&S.avi&&av.src!==S.avi)av.src=S.avi")
else:print('WARN avatar patch')
x=open(f'{B}/gfx3.js').read();p=open('src/proto.js').read()
# packs (binary as base64 text so the text-only push path works)
items=[(os.path.basename(f),b64(f)) for f in sorted(glob.glob('out/assets/*.glb'))]+[(os.path.basename(f),b64(f)) for f in sorted(glob.glob('out/a96/*.mp3'))]
packs=[];cur={};sz=0
for n,d in items:
  if sz+len(d)>1_400_000 and cur:packs.append(cur);cur={};sz=0
  cur[n]=d;sz+=len(d)
packs.append(cur);tot=0;names=[]
for i,pk in enumerate(packs):
  s=json.dumps(pk);open(f'{O}/packs/p{i}.json','w').write(s);tot+=len(s);names.append(f'packs/p{i}.json?v={V}')
CRED=open('src/CREDITS.md').read()
ch='<p>'+'</p><p>'.join(l for l in CRED.splitlines() if l.strip() and not l.startswith('#'))+'</p>'
open(f'{O}/ui.js','w').write('window.UI='+json.dumps(UI)+';(()=>{const r=document.documentElement.style;for(const k in UI)r.setProperty("--ui-"+k,"url("+UI[k]+")");document.querySelectorAll("[data-ui]").forEach(e=>e.src=UI[e.dataset.ui])})();')
js='<script src="./ui.js?v='+V+'"></script><script>const IMG='+json.dumps(IMG)+';\n'+g+'\n'+f+'\n'+x+'\n'+p+f'\nwindow.CREDITS_HTML={json.dumps(ch)};window.P3D_PACKS={json.dumps(names)};window.P3D_SIZE={tot};\nboot();\n</script>'
js+='<script type="importmap">{"imports":{"three":"./lib/three.module.js"}}</script><script type="module" src="./g3d.js?v='+V+'"></script></body></html>'
open(f'{O}/index.html','w').write(h+js)
for l in glob.glob('out/lib/*.js'):shutil.copy(l,O+'/lib/')
shutil.copy('src/g3d.js',O);shutil.copy('src/CREDITS.md',O)
open(f'{O}/sw.js','w').write(f"const C='aethra3d-v{V}';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('aethra3d')).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}}).catch(()=>caches.match(e.request)))}});\n")
json.dump({"name":"Journey of Aethra","short_name":"Aethra","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#0b1430","theme_color":"#1b2a5e","icons":[{"src":I180,"sizes":"180x180","type":"image/png"}]},open(f'{O}/manifest.json','w'))
for r,_,fs in os.walk(O):
  for q in fs:print(os.path.join(r,q),os.path.getsize(os.path.join(r,q)))
