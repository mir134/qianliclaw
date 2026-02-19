import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { ConfigOctopus3D } from '@/components/ConfigOctopus3D';

const CONFIG_KEYS = [
  { id: 'gateway', label: '网关' },
  { id: 'models', label: '模型' },
  { id: 'agents', label: '智能体' },
  { id: 'channels', label: '渠道' },
  { id: 'tools', label: '工具' },
  { id: 'skills', label: '技能' },
  { id: 'plugins', label: '插件' },
  { id: 'auth', label: '认证' },
  { id: 'commands', label: '命令' },
  { id: 'raw', label: '原始 JSON' },
] as const;

type ConfigKeyId = (typeof CONFIG_KEYS)[number]['id'];

type Config = Record<string, unknown>;

export function ConfigPage() {
  const [activeConfigKey, setActiveConfigKey] =
    useState<ConfigKeyId>('gateway');
  const [config, setConfig] = useState<Config | null>(null);
  const [configPath, setConfigPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'ok' | 'err'
  >('idle');
  const [editingText, setEditingText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.config.get();
      if (res.error) {
        setError(res.error);
        setConfig(res.config || {});
      } else {
        setConfig(res.config || {});
      }
      setConfigPath(res.configPath || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConfig({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (config) {
      if (activeConfigKey === 'raw') {
        setEditingText(JSON.stringify(config, null, 2));
      } else {
        const section = config[activeConfigKey];
        setEditingText(
          JSON.stringify(section !== undefined ? section : {}, null, 2)
        );
      }
      setParseError(null);
    }
  }, [config, activeConfigKey]);

  const save = useCallback(async () => {
    if (!config) return;

    try {
      const parsed = JSON.parse(editingText);
      if (activeConfigKey === 'raw') {
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          setParseError('配置必须为 JSON 对象');
          return;
        }
        setConfig(parsed);
      } else {
        const next = { ...config, [activeConfigKey]: parsed };
        setConfig(next);
      }
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'JSON 解析失败');
      return;
    }

    setSaveStatus('saving');
    try {
      const configToSave =
        activeConfigKey === 'raw'
          ? JSON.parse(editingText)
          : { ...config, [activeConfigKey]: JSON.parse(editingText) };
      await api.config.put(configToSave);
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [config, editingText, activeConfigKey]);

  const handlePartClick = useCallback((configKey: string) => {
    if (CONFIG_KEYS.some((k) => k.id === configKey)) {
      setActiveConfigKey(configKey as ConfigKeyId);
    }
  }, []);

  if (loading) return <p className="text-neutral-600">加载配置中…</p>;
  if (error) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p>配置路径：{configPath || '—'}</p>
        <p>错误：{error}</p>
      </div>
    );
  }

  const currentLabel =
    CONFIG_KEYS.find((k) => k.id === activeConfigKey)?.label || '';

  return (
    <div className="space-y-4">
      {configPath && (
        <p className="text-xs text-neutral-500">配置文件：{configPath}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
        {CONFIG_KEYS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveConfigKey(id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm',
              activeConfigKey === id
                ? 'bg-neutral-200 font-medium'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-sm text-neutral-500">
          {saveStatus === 'saving' && '保存中…'}
          {saveStatus === 'ok' && '已保存'}
          {saveStatus === 'err' && '保存失败'}
        </span>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[400px] lg:min-w-[400px]">
          <ConfigOctopus3D
            onPartClick={handlePartClick}
            selectedConfigKey={activeConfigKey}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                {activeConfigKey === 'raw' ? '完整配置' : currentLabel}
              </span>
              <button
                type="button"
                className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
                onClick={save}
              >
                保存
              </button>
            </div>
            {parseError && (
              <p className="mb-2 text-sm text-red-600">{parseError}</p>
            )}
            <textarea
              className="w-full min-h-[400px] rounded border border-neutral-300 p-2 font-mono text-sm"
              value={editingText}
              onChange={(e) => {
                setEditingText(e.target.value);
                setParseError(null);
              }}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
