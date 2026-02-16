import path from 'path';
import fs from 'fs';

const HOME = process.env.USERPROFILE || process.env.HOME || '';

/**
 * Resolve config root directory.
 * Priority: OPENCLAW_CONFIG_HOME env > app settings (later) > default ~/.openclaw
 * Fallback for legacy: ~/.moltbot if openclaw path missing.
 */
export function getConfigRoot(override?: string): string {
  const envRoot = process.env.OPENCLAW_CONFIG_HOME;
  if (override && override.trim()) return resolveHome(override.trim());
  if (envRoot) return resolveHome(envRoot);
  const defaultOpenClaw = path.join(HOME, '.openclaw');
  const defaultMoltbot = path.join(HOME, '.moltbot');
  if (fs.existsSync(path.join(defaultOpenClaw, 'openclaw.json')))
    return defaultOpenClaw;
  if (fs.existsSync(path.join(defaultMoltbot, 'moltbot.json')))
    return defaultMoltbot;
  return defaultOpenClaw;
}

/**
 * Config file name: openclaw.json (OpenClaw) or moltbot.json (legacy)
 */
export function getConfigFileName(configRoot: string): string {
  if (configRoot.endsWith('.moltbot') || path.basename(configRoot) === '.moltbot')
    return 'moltbot.json';
  return 'openclaw.json';
}

export function getConfigFilePath(configRoot: string): string {
  return path.join(configRoot, getConfigFileName(configRoot));
}

/** Expand ~ to user home. */
export function resolveHome(p: string): string {
  if (p.startsWith('~/') || p === '~')
    return path.join(HOME, p.slice(1) || '');
  if (p.startsWith('~\\')) return path.join(HOME, p.slice(2));
  return p;
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
