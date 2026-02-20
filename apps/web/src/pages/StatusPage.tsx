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
      const cli = (s.settings as { openclawCliPath?: string | null })
        ?.openclawCliPath;
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400">加载状态中…</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg">
            ⚙️
          </span>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            配置与工作区
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-neutral-200 dark:border-slate-700">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              配置文件
            </div>
            <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300 break-all">
              {configPath || '—'}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-neutral-200 dark:border-slate-700">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              配置读取
            </div>
            <div className="flex items-center gap-2">
              {configReadOk ? (
                <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  正常
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                  <span className="text-lg">⚠️</span>
                  {configError || '失败'}
                </span>
              )}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-neutral-200 dark:border-slate-700">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              工作区路径
            </div>
            <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300 break-all">
              {workspacePath || '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg">
            🏥
          </span>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            OpenClaw 健康检查
          </h3>
        </div>
        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-slate-900/50 px-4 py-2 rounded-lg">
          需已安装 OpenClaw CLI；可在设置中填写可执行路径。
        </p>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={runHealth}
          disabled={healthLoading}
        >
          {healthLoading ? '执行中…' : '执行 openclaw health'}
        </button>
        {healthOutput != null && (
          <pre className="mt-4 overflow-auto rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs font-mono text-neutral-700 dark:text-neutral-300 shadow-inner">
            {healthOutput}
          </pre>
        )}
        {healthError != null && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span className="text-lg">✗</span>
            {healthError}
          </div>
        )}
      </div>
    </div>
  );
}
