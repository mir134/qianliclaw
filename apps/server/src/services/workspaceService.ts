import path from 'path';
import fs from 'fs';
import { getWorkspacePath } from './configService.js';
import { readSettings } from './settingsService.js';

export const WORKSPACE_FILES = [
  'USER.md',
  'IDENTITY.md',
  'SOUL.md',
  'AGENTS.md',
  'TOOLS.md',
  'BOOTSTRAP.md',
] as const;

export type WorkspaceFileName = (typeof WORKSPACE_FILES)[number];

function isAllowedName(name: string): name is WorkspaceFileName {
  return (WORKSPACE_FILES as readonly string[]).includes(name);
}

export function getWorkspaceDir(): string | null {
  const settings = readSettings();
  if (settings.workspacePathOverride) {
    const resolved = path.resolve(settings.workspacePathOverride);
    return resolved;
  }
  return getWorkspacePath();
}

export function listWorkspaceFiles(): {
  workspacePath: string | null;
  files: { name: string; exists: boolean }[];
  error?: string;
} {
  const workspacePath = getWorkspaceDir();
  if (!workspacePath) {
    return {
      workspacePath: null,
      files: WORKSPACE_FILES.map((name) => ({ name, exists: false })),
      error: 'No workspace path in config (agents.defaults.workspace)',
    };
  }
  if (!fs.existsSync(workspacePath)) {
    return {
      workspacePath,
      files: WORKSPACE_FILES.map((name) => ({ name, exists: false })),
      error: 'Workspace directory does not exist',
    };
  }
  const files = WORKSPACE_FILES.map((name) => {
    const fullPath = path.join(workspacePath, name);
    return { name, exists: fs.existsSync(fullPath) };
  });
  return { workspacePath, files };
}

export function readWorkspaceFile(name: string): {
  content: string;
  error?: string;
} {
  if (!isAllowedName(name)) {
    return { content: '', error: 'Invalid file name' };
  }
  const workspacePath = getWorkspaceDir();
  if (!workspacePath) return { content: '', error: 'No workspace path' };
  const fullPath = path.join(workspacePath, name);
  if (
    path
      .relative(workspacePath, path.resolve(workspacePath, name))
      .startsWith('..')
  ) {
    return { content: '', error: 'Invalid path' };
  }
  try {
    if (!fs.existsSync(fullPath)) return { content: '' };
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { content };
  } catch (e) {
    return {
      content: '',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function writeWorkspaceFile(
  name: string,
  content: string
): string | null {
  if (!isAllowedName(name)) return 'Invalid file name';
  const workspacePath = getWorkspaceDir();
  if (!workspacePath) return 'No workspace path';
  const fullPath = path.join(workspacePath, name);
  const resolved = path.resolve(workspacePath, name);
  if (!resolved.startsWith(path.resolve(workspacePath))) return 'Invalid path';
  try {
    const dir = path.dirname(fullPath);
    if (dir !== workspacePath) return 'Invalid path';
    if (!fs.existsSync(workspacePath))
      fs.mkdirSync(workspacePath, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
