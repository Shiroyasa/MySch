import { VisualSettings, LessonSchedule } from '../types';

const DB_NAME = 'myacademy_permanent_storage_v1';
const DB_VERSION = 1;
const STORE_NAME = 'kv_store';

function openPermanentDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openPermanentDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (err) {
    console.warn(`IndexedDB write notice for ${key}:`, err);
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openPermanentDB();
    const result = await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch (err) {
    console.warn(`IndexedDB read notice for ${key}:`, err);
    return null;
  }
}

/**
 * Ensures any image DataURL is compact enough (< maxChars) to fit comfortably
 * inside a Firestore document (< 1MB limit) and localStorage (< 5MB limit)
 * without ever turning the user's background into null.
 */
export async function ensureCompactImageDataUrl(
  dataUrl: string | null | undefined,
  maxChars = 420_000,
  maxWidth = 1366
): Promise<string | null | undefined> {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  // Ignore non-image data URLs (e.g., external https:// URLs or SVG or video)
  if (!dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/svg')) {
    return dataUrl;
  }
  if (dataUrl.length <= maxChars) {
    return dataUrl;
  }
  if (typeof document === 'undefined') {
    return dataUrl;
  }

  return new Promise(resolve => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.76;
        let compressed = canvas.toDataURL('image/jpeg', quality);
        while (compressed.length > maxChars && quality > 0.32) {
          quality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Saves VisualSettings to both localStorage (deduplicated with per-field fallbacks)
 * and IndexedDB (full fidelity, unlimited size).
 */
export function saveVisualSettingsLocally(settings: VisualSettings): void {
  // 1. Always save full settings (including any large images/videos/boxBgs) to IndexedDB
  idbSet('myschool_visual_settings_full', settings).catch(() => {});

  // 2. Save individual dedicated keys in localStorage with isolated try/catch blocks
  try {
    if (settings.appLogoUrl) {
      localStorage.setItem('myschool_app_logo', settings.appLogoUrl);
    } else if (settings.appLogoUrl === null) {
      localStorage.removeItem('myschool_app_logo');
    }
    if (settings.appLogoFit) {
      localStorage.setItem('myschool_app_logo_fit', settings.appLogoFit);
    }
    if (settings.faviconUrl) {
      localStorage.setItem('myschool_app_favicon', settings.faviconUrl);
    } else if (settings.faviconUrl === null) {
      localStorage.removeItem('myschool_app_favicon');
    }
  } catch {}

  try {
    if (settings.loginBgUrl && !settings.loginBgUrl.startsWith('data:video/')) {
      localStorage.setItem('myacademy_login_custom_bg', settings.loginBgUrl);
    } else if (!settings.loginBgUrl) {
      localStorage.removeItem('myacademy_login_custom_bg');
    }
  } catch {}

  try {
    if (settings.menuBgUrl && !settings.menuBgUrl.startsWith('data:video/')) {
      localStorage.setItem('myacademy_menu_custom_bg', settings.menuBgUrl);
    } else if (!settings.menuBgUrl) {
      localStorage.removeItem('myacademy_menu_custom_bg');
    }
  } catch {}

  try {
    const bannerUrl = settings.globalBannerBgUrl ?? settings.moduleBannerBgUrl ?? null;
    if (bannerUrl) {
      localStorage.setItem('myacademy_global_banner_bg', bannerUrl);
    } else {
      localStorage.removeItem('myacademy_global_banner_bg');
    }
  } catch {}

  // 3. Save deduplicated VisualSettings object to localStorage with progressive fallbacks
  try {
    const compactForLocalStorage: VisualSettings = {
      ...settings,
      loginBgUrl:
        settings.loginBgUrl && settings.loginBgUrl.startsWith('data:video/')
          ? null
          : settings.loginBgUrl,
      menuBgUrl:
        settings.menuBgUrl && settings.menuBgUrl.startsWith('data:video/')
          ? null
          : settings.menuBgUrl,
      perModuleBannerBgs: undefined,
      moduleBannerBgUrl: undefined,
    };
    localStorage.setItem('myschool_visual_settings', JSON.stringify(compactForLocalStorage));
  } catch {
    try {
      const mediumForLocalStorage: VisualSettings = {
        ...settings,
        loginBgUrl:
          settings.loginBgUrl && settings.loginBgUrl.length < 450_000
            ? settings.loginBgUrl
            : null,
        menuBgUrl:
          settings.menuBgUrl && settings.menuBgUrl.length < 450_000
            ? settings.menuBgUrl
            : null,
        perModuleBannerBgs: undefined,
        moduleBannerBgUrl: undefined,
        moduleBannerBgs: {},
        boxBgs: {},
      };
      localStorage.setItem('myschool_visual_settings', JSON.stringify(mediumForLocalStorage));
    } catch {
      try {
        const metadataOnly: VisualSettings = {
          appLogoUrl: null,
          appLogoFit: settings.appLogoFit || 'contain',
          faviconUrl: null,
          loginBgUrl: null,
          loginBgType: settings.loginBgType || 'default',
          loginLivePreset: settings.loginLivePreset || 'starlight_castle',
          menuBgUrl: null,
          menuBgType: settings.menuBgType || 'default',
          menuLivePreset: settings.menuLivePreset || 'starlight_castle',
          menuBgOpacity: settings.menuBgOpacity ?? 45,
          ambientDarkMode: settings.ambientDarkMode !== false,
          globalBannerBgUrl: null,
          moduleBannerBgs: {},
          boxBgs: {},
          bannerOverlayOpacity: settings.bannerOverlayOpacity ?? 40,
          updatedAt: settings.updatedAt || new Date().toISOString(),
        };
        localStorage.setItem('myschool_visual_settings', JSON.stringify(metadataOnly));
      } catch {}
    }
  }
}

/**
 * Saves LessonSchedules to both localStorage and IndexedDB permanently.
 */
export function saveLessonSchedulesLocally(schedules: LessonSchedule[]): void {
  idbSet('myschool_lesson_schedules_full', schedules).catch(() => {});
  try {
    localStorage.setItem('myschool_lesson_schedules', JSON.stringify(schedules));
    localStorage.setItem('myschool_lesson_schedules_customized', 'true');
  } catch (err) {
    console.warn('localStorage notice for lessonSchedules:', err);
  }
}
