import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';

export function StatusPage() {
  const [configPath, setConfigPath] = useState('');
  const [configReadOk, setConfigReadOk] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthOutput, setHealthOutput] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [openclawCliPath, setOpenclawCliPath] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.status.get();
      setConfigPath(s.configPath);
      setConfigReadOk(s.configReadOk);
      setConfigError(s.configError ?? null);
      setWorkspacePath(s.workspacePath);
      const cli = (s.settings as { openclawCliPath?: string | null })?.openclawCliPath;
      setOpenclawCliPath(cli ?? null);
    } catch {
      setConfigPath('');
      setConfigReadOk(false);
      setWorkspacePath(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthOutput(null);
    setHealthError(null);
    try {
      const res = await api.status.health(openclawCliPath);
      if (res.ok) setHealthOutput(res.output ?? '');
      else setHealthError(res.error ?? 'Unknown error');
    } catch (e) {
      setHealthError(e instanceof Error ? e.message : String(e));
    } finally {
      setHealthLoading(false);
    }
  }, [openclawCliPath]);

  if (loading) return <p className="text-neutral-600">加载状态中…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-neutral-700">配置与工作区</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-neutral-500">配置文件</dt>
            <dd className="font-mono">{configPath || '—'}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">配置读取</dt>
            <dd>
              {configReadOk ? (
                <span className="text-green-600">正常</span>
              ) : (
                <span className="text-amber-600">{configError || '失败'}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">工作区路径</dt>
            <dd className="font-mono">{workspacePath || '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-neutral-700">OpenClaw 健康检查</h3>
        <p className="mb-2 text-xs text-neutral-500">
          需已安装 OpenClaw CLI；可在设置中填写可执行路径。
        </p>
        <button
          type="button"
          className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
          onClick={runHealth}
          disabled={healthLoading}
        >
          {healthLoading ? '执行中…' : '执行 openclaw health'}
        </button>
        {healthOutput != null && (
          <pre className="mt-3 overflow-auto rounded border border-neutral-200 bg-neutral-50 p-3 text-xs">
            {healthOutput}
          </pre>
        )}
        {healthError != null && (
          <p className="mt-2 text-sm text-red-600">{healthError}</p>
        )}
      </div>
    </div>
  );
}
