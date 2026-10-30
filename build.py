import sys,os,io,base64,json,glob,re
from PIL import Image
V=sys.argv[1];A='/workspace/newgame-art'
SZ={'field':240,'heroes':300,'companions':140,'enemies':240,'bosses':360,'items':110,'ui':80,'props':220}
IMG={}
for d,h in SZ.items():
  for f in glob.glob(f'{A}/{d}/*.webp'):
    k=os.path.basename(f)[:-5];im=Image.open(f).convert('RGBA')
    if d=='ui' and not k.startswith('icon_'):continue
    s=h/max(im.size);im=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.LANCZOS) if s<1 else im
    b=io.BytesIO();im.save(b,'WEBP',quality=82);IMG[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
for f in glob.glob(f'{A}/backgrounds/*.webp'):
  k=os.path.basename(f)[:-5];im=Image.open(f).convert('RGB').resize((540,960),Image.LANCZOS);b=io.BytesIO();im.save(b,'WEBP',quality=70);IMG[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
for f in glob.glob(f'{A}/tiles/*.webp'):
  k=os.path.basename(f)[:-5];b=io.BytesIO();Image.open(f).convert('RGB').save(b,'WEBP',quality=78);IMG[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
I180='data:image/png;base64,'+base64.b64encode(open(f'{A}/icon/app_icon_180.png','rb').read()).decode()
im=Image.open(f'{A}/icon/app_icon_512.png');b=io.BytesIO();im.save(b,'PNG',optimize=True);I512='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
h=open('head.html').read().replace('href="icon180.png"','href="'+I180+'"')
h=re.sub(r'__([a-z_0-9]+)__',lambda m:IMG.get(m.group(1),'') if m.group(1)!='IMG' else '__IMG__',h).replace('__IMG__',json.dumps(IMG))
js=open('game.js').read()+'\n'+open('field.js').read()+'\n'+open('gfx3.js').read()
out=h+js+"\nboot();fieldInit();document.getElementById('avi').src=IMG[(S.cls||'knight')+'_idle'];\n</script></body></html>"
os.makedirs('site',exist_ok=True);open('site/index.html','w').write(out)
open('site/sw.js','w').write(f"const C='wb-v{V}';self.addEventListener('install',e=>{{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.json'])))}});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))}});\n")
json.dump({"name":"Wyrmbound","short_name":"Wyrmbound","start_url":"./","display":"standalone","orientation":"portrait","background_color":"#101a3c","theme_color":"#1b2a5e","icons":[{"src":I180,"sizes":"180x180","type":"image/png"},{"src":I512,"sizes":"512x512","type":"image/png"}]},open('site/manifest.json','w'))

print(len(out))
