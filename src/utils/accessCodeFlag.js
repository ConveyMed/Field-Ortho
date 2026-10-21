import { Preferences } from '@capacitor/preferences';

// "Access code passed" is remembered per device, for good. It lives in
// Capacitor Preferences (UserDefaults / SharedPreferences on native, so iOS
// clearing WebView storage cannot drop it; localStorage on web). It is never
// cleared on sign-out or by "Clear Cache".
const FLAG_KEY = 'org_code_verified';

// On web, Preferences keeps its value in localStorage under this prefix.
export const PRESERVED_LOCAL_KEYS = [FLAG_KEY, `CapacitorStorage.${FLAG_KEY}`, 'pending_org_code'];

export async function loadAccessCodePassed() {
  try {
    const { value } = await Preferences.get({ key: FLAG_KEY });
    if (value === 'true') return true;
  } catch (e) {
    // fall through to the legacy flag
  }
  // Migrate the flag older builds kept in localStorage.
  let legacy = null;
  try { legacy = localStorage.getItem(FLAG_KEY); } catch (e) { /* ignore */ }
  if (legacy === 'true') {
    await saveAccessCodePassed();
    return true;
  }
  return false;
}

export async function saveAccessCodePassed() {
  try { localStorage.setItem(FLAG_KEY, 'true'); } catch (e) { /* ignore */ }
  try {
    await Preferences.set({ key: FLAG_KEY, value: 'true' });
  } catch (e) {
    console.log('Error saving access code flag:', e);
  }
}

// Run fn (which wipes localStorage) without losing the device's access code state.
export async function preservingAccessCode(fn) {
  const saved = {};
  PRESERVED_LOCAL_KEYS.forEach((k) => {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) saved[k] = v;
    } catch (e) { /* ignore */ }
  });
  try {
    await fn();
  } finally {
    Object.entries(saved).forEach(([k, v]) => {
      try { localStorage.setItem(k, v); } catch (e) { /* ignore */ }
    });
  }
}
