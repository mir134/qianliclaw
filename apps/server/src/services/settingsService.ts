import path from 'path';
import fs from 'fs';

export interface AppSettings {
  configRootOverride?: string | null;
  openclawCliPath?: string | null;
  gatewayUrl?: string | null;
}

const HOME = process.env.USERPROFILE || process.env.HOME || '';
const SETTINGS_DIR = path.join(HOME, '.qianliclaw');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readSettings(): AppSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw) as AppSettings;
  } catch {
    return {};
  }
}

export function writeSettings(settings: AppSettings): string | null {
  try {
    ensureDir(SETTINGS_DIR);
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
