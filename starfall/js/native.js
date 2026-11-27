const Cap = window.Capacitor;
export const IS_APP = !!(Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform());
const plug = n => (IS_APP && Cap.Plugins && Cap.Plugins[n]) || null;
const Prefs = plug('Preferences'), Haptics = plug('Haptics'), Notes = plug('LocalNotifications');

const stamp = v => { try { return JSON.parse(v).lastSeen || 0; } catch (e) { return -1; } };

export async function nativeRestore(key) {
  if (!Prefs) return;
  try {
    const { value } = await Prefs.get({ key });
    let local = null; try { local = localStorage.getItem(key); } catch (e) {}
    if (value && (!local || stamp(value) >= stamp(local))) { try { localStorage.setItem(key, value); } catch (e) {} }
    else if (local) await Prefs.set({ key, value: local });
  } catch (e) {}
}
export function nativeSet(key, value) { if (!Prefs) return Promise.resolve(); return Prefs.set({ key, value }).catch(() => {}); }
export function nativeRemove(key) { if (!Prefs) return Promise.resolve(); return Prefs.remove({ key }).catch(() => {}); }

let buzz = true, lastBuzz = 0;
export const setHaptics = v => { buzz = v !== false; };
export const hasHaptics = !!Haptics;
const FEEL = { crit: ['impact', 'LIGHT'], skill: ['impact', 'LIGHT'], gear: ['impact', 'LIGHT'], hatch: ['impact', 'MEDIUM'], down: ['impact', 'MEDIUM'], spike: ['impact', 'MEDIUM'], ult: ['impact', 'HEAVY'], boss: ['impact', 'HEAVY'], bossdie: ['notification', 'SUCCESS'], level: ['notification', 'SUCCESS'], quest: ['notification', 'SUCCESS'] };
export function haptic(name) {
  if (!Haptics || !buzz) return;
  const f = FEEL[name]; if (!f) return;
  const now = performance.now(); if (now - lastBuzz < 90) return; lastBuzz = now;
  try { if (f[0] === 'impact') Haptics.impact({ style: f[1] }); else Haptics.notification({ type: f[1] }); } catch (e) {}
}

export const hasNotes = !!Notes;
const NOTE_ID = 4101;
export async function askNotes() {
  if (!Notes) return false;
  try { const r = await Notes.requestPermissions(); return r && r.display === 'granted'; } catch (e) { return false; }
}
export function offlineNote(on, name, fullInSec) {
  if (!Notes) return;
  try {
    Notes.cancel({ notifications: [{ id: NOTE_ID }] }).catch(() => {});
    if (!on) return;
    Notes.schedule({ notifications: [{ id: NOTE_ID, title: 'Wyrmbound: Starfall', body: `${name || 'Your hunter'} has a full haul waiting. Come collect it.`, schedule: { at: new Date(Date.now() + fullInSec * 1000), allowWhileIdle: true } }] }).catch(() => {});
  } catch (e) {}
}
