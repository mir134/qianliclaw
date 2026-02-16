import path from 'path';
import fs from 'fs';
import JSON5 from 'json5';
import {
  getConfigRoot,
  getConfigFilePath,
  resolveHome,
  ensureDir,
} from './paths.js';

export type ConfigRootOverride = string | null;

let configRootOverride: ConfigRootOverride = null;

export function setConfigRootOverride(root: string | null): void {
  configRootOverride = root;
}

function getRoot(): string {
  return getConfigRoot(configRootOverride ?? undefined);
}

export function getConfigPath(): string {
  return getConfigFilePath(getRoot());
}

/**
 * Read and parse openclaw.json (or moltbot.json). Returns empty object if missing.
 */
export function readConfig(): {
  config: Record<string, unknown>;
  configPath: string;
  error?: string;
} {
  const configPath = getConfigPath();
  try {
    if (!fs.existsSync(configPath)) {
      return { config: {}, configPath };
    }
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON5.parse(raw) as Record<string, unknown>;
    return { config, configPath };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { config: {}, configPath, error: message };
  }
}

/**
 * Write config to openclaw.json. Creates directory if needed.
 * Returns error message or null on success.
 */
export function writeConfig(config: Record<string, unknown>): string | null {
  const configPath = getConfigPath();
  const dir = path.dirname(configPath);
  try {
    ensureDir(dir);
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

/**
 * Resolve workspace path from config (agents.defaults.workspace).
 */
export function getWorkspacePath(): string | null {
  const { config } = readConfig();
  const agents = config?.agents as Record<string, unknown> | undefined;
  const defaults = agents?.defaults as Record<string, unknown> | undefined;
  const ws = defaults?.workspace;
  if (typeof ws !== 'string' || !ws.trim()) return null;
  return resolveHome(ws.trim());
}
