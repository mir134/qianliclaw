import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { ConfigFormBlock, FormRow } from '@/components/ConfigFormBlock';

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
      <p className="text-neutral-600 dark:text-neutral-400">加载设置中…</p>
    );

  return (
    <div className="space-y-4">
      <ConfigFormBlock title="配置根目录">
        <FormRow label="覆盖路径">
          <input
            type="text"
            className="min-w-[320px] rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm dark:text-neutral-100"
            placeholder="留空则使用默认 ~/.openclaw 或 OPENCLAW_CONFIG_HOME"
            value={configRootOverride}
            onChange={(e) => setConfigRootOverride(e.target.value)}
          />
        </FormRow>
      </ConfigFormBlock>
      <ConfigFormBlock title="OpenClaw CLI">
        <FormRow label="可执行路径">
          <input
            type="text"
            className="min-w-[320px] rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm dark:text-neutral-100"
            placeholder="留空则使用 PATH 中的 openclaw"
            value={openclawCliPath}
            onChange={(e) => setOpenclawCliPath(e.target.value)}
          />
        </FormRow>
      </ConfigFormBlock>
      <ConfigFormBlock title="Gateway">
        <FormRow label="Gateway URL">
          <input
            type="text"
            className="min-w-[320px] rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm dark:text-neutral-100"
            placeholder="例如 http://127.0.0.1:18789"
            value={gatewayUrl}
            onChange={(e) => setGatewayUrl(e.target.value)}
          />
        </FormRow>
      </ConfigFormBlock>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded bg-neutral-800 dark:bg-neutral-600 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 dark:hover:bg-neutral-500"
          onClick={save}
        >
          保存
        </button>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {saveStatus === 'saving' && '保存中…'}
          {saveStatus === 'ok' && '已保存'}
          {saveStatus === 'err' && '保存失败'}
        </span>
      </div>
    </div>
  );
}
