import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';

export function SettingsPage() {
  const [configRootOverride, setConfigRootOverride] = useState<string>('');
  const [openclawCliPath, setOpenclawCliPath] = useState<string>('');
  const [gatewayUrl, setGatewayUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'ok' | 'err'
  >('idle');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.settings.get();
      setConfigRootOverride(s.configRootOverride ?? '');
      setOpenclawCliPath(s.openclawCliPath ?? '');
      setGatewayUrl(s.gatewayUrl ?? '');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await api.settings.put({
        configRootOverride: configRootOverride.trim() || null,
        openclawCliPath: openclawCliPath.trim() || null,
        gatewayUrl: gatewayUrl.trim() || null,
      });
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [configRootOverride, openclawCliPath, gatewayUrl]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400">加载设置中…</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg">
            📁
          </span>
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            配置根目录
          </h2>
        </div>
        <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-neutral-200 dark:border-slate-700">
          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            覆盖路径
          </label>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200"
            placeholder="留空则使用默认 ~/.openclaw 或 OPENCLAW_CONFIG_HOME"
            value={configRootOverride}
            onChange={(e) => setConfigRootOverride(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg">
            ⚡
          </span>
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            OpenClaw CLI
          </h2>
        </div>
        <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-neutral-200 dark:border-slate-700">
          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            可执行路径
          </label>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200"
            placeholder="留空则使用 PATH 中的 openclaw"
            value={openclawCliPath}
            onChange={(e) => setOpenclawCliPath(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg">
            🔗
          </span>
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Gateway
          </h2>
        </div>
        <div className="bg-white/50 dark:gbg-slate-900/50 rounded-xl p-4 border border-neutral-200 dark:border-slate-700">
          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            Gateway URL
          </label>
          <input
            type="text"
            className="w-full rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200"
            placeholder="例如 http://127.0.0.1:18789"
            value={gatewayUrl}
            onChange={(e) => setGatewayUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200"
          onClick={save}
        >
          保存设置
        </button>
        <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              保存中…
            </div>
          )}
          {saveStatus === 'ok' && (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              已保存
            </span>
          )}
          {saveStatus === 'err' && (
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="text-lg">✗</span>
              保存失败
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
