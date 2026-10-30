import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    errs=[];pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None);pg.on('pageerror',lambda e:errs.append('PE '+str(e)))
    await pg.goto('http://localhost:8931/index.html');
    try:
      await pg.wait_for_selector('#ttl.rdy',timeout=40000)
    except Exception:
      print(await pg.evaluate("document.getElementById('ttlt').textContent"));print('\n'.join(errs[:20]));await pg.screenshot(path='/tmp/dbg.png');return
    await pg.screenshot(path='shots/p3d_1_title.png')
    await pg.click('#ttlg',force=True);await pg.wait_for_timeout(2500);await pg.click('#csl button[data-k="assassin"]',force=True);await pg.wait_for_timeout(1500);await pg.screenshot(path='shots/p3d_2_class.png')
    await pg.click('#csl button[data-k="knight"]',force=True);await pg.wait_for_timeout(800);await pg.click('#csgo',force=True);await pg.wait_for_timeout(5000)
    await pg.screenshot(path='shots/p3d_3_field.png')
    print('fps',await pg.evaluate('P3D_FPS'))
    await pg.evaluate("S.q=1;S.qk=0;hudK=''");await pg.wait_for_timeout(int(sys.argv[1]) if len(sys.argv)>1 else 25000)
    print('fps',await pg.evaluate('P3D_FPS'),await pg.evaluate('[S.q,S.qk,S.lv,F.mobs.filter(m=>!m.dead).length,Math.round(F.h.x),Math.round(F.h.y),F.h.combatT]'))
    await pg.screenshot(path='shots/p3d_4_combat.png')
    bi=await pg.evaluate("QUESTS().findIndex(q=>q.t==='boss')");await pg.evaluate(f"S.q={bi};S.qk=0;hudK='';S.lv=Math.max(S.lv,8);F.h.x=700;F.h.y=560;F.dest=null")
    await pg.wait_for_timeout(9000);await pg.evaluate("gainXp(5000)");await pg.wait_for_timeout(700)
    await pg.screenshot(path='shots/p3d_5_boss_levelup.png');print('boss',await pg.evaluate('[!!F.boss,S.lv,P3D_FPS]'))
    print('scroll',await pg.evaluate('[document.documentElement.scrollHeight,innerHeight]'))
    print('\n'.join(errs[:20]))
    await b.close()
asyncio.run(main())
