import { readConfig } from './configService.js';
import { getWorkspaceDir } from './workspaceService.js';
import { readSettings } from './settingsService.js';
import { execSync } from 'child_process';

export function getStatus(): {
  configPath: string;
  configReadOk: boolean;
  configError?: string;
  workspacePath: string | null;
  settings: { configRootOverride?: string | null; openclawCliPath?: string | null; gatewayUrl?: string | null };
} {
  const settings = readSettings();
  const { configPath, error: configError } = readConfig();
  const workspacePath = getWorkspaceDir();
  return {
    configPath,
    configReadOk: !configError,
    configError,
    workspacePath,
    settings,
  };
}

export function runOpenClawHealth(openclawCliPath: string | null): {
  ok: boolean;
  output?: string;
  error?: string;
} {
  const cmd = openclawCliPath && openclawCliPath.trim()
    ? `"${openclawCliPath.trim()}" health`
    : 'openclaw health';
  try {
    const out = execSync(cmd, { encoding: 'utf-8', timeout: 10000 });
    return { ok: true, output: out };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    const output = [err.stdout, err.stderr].filter(Boolean).join('\n') || err.message;
    return { ok: false, error: output || String(e) };
  }
}
