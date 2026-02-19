const API = '/api';

async function handleRes<T>(r: Response): Promise<T> {
  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error((data as { error?: string }).error || r.statusText);
  return data as T;
}

export const api = {
  config: {
    get: () =>
      fetch(`${API}/config`).then(
        handleRes<{
          config: Record<string, unknown>;
          configPath: string;
          error?: string;
        }>
      ),
    put: (config: Record<string, unknown>) =>
      fetch(`${API}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).then(handleRes<{ ok: boolean }>),
    getSchema: () =>
      fetch(`${API}/config/schema`).then(
        handleRes<{
          sections: { key: string; label: string; fields: string[] }[];
        }>
      ),
  },
  workspace: {
    list: () =>
      fetch(`${API}/workspace/files`).then(
        handleRes<{
          workspacePath: string | null;
          files: { name: string; exists: boolean }[];
          error?: string;
        }>
      ),
    getFile: (name: string) =>
      fetch(`${API}/workspace/files/${encodeURIComponent(name)}`).then(
        handleRes<{ content: string; name: string }>
      ),
    putFile: (name: string, content: string) =>
      fetch(`${API}/workspace/files/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }).then(handleRes<{ ok: boolean }>),
  },
  status: {
    get: () =>
      fetch(`${API}/status`).then(
        handleRes<{
          configPath: string;
          configReadOk: boolean;
          configError?: string;
          workspacePath: string | null;
          settings: Record<string, unknown>;
        }>
      ),
    health: (openclawCliPath: string | null) =>
      fetch(`${API}/status/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openclawCliPath }),
      }).then(handleRes<{ ok: boolean; output?: string; error?: string }>),
  },
  settings: {
    get: () =>
      fetch(`${API}/settings`).then(
        handleRes<{
          configRootOverride?: string | null;
          workspacePathOverride?: string | null;
          openclawCliPath?: string | null;
          gatewayUrl?: string | null;
        }>
      ),
    put: (settings: {
      configRootOverride?: string | null;
      workspacePathOverride?: string | null;
      openclawCliPath?: string | null;
      gatewayUrl?: string | null;
    }) =>
      fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).then(handleRes<{ ok: boolean; settings: unknown }>),
  },
};
