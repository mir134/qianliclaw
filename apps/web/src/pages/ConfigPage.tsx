import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { ConfigFormBlock, FormRow } from '@/components/ConfigFormBlock';

const CONFIG_TABS = [
  { id: 'gateway', label: '网关' },
  { id: 'agents', label: '智能体' },
  { id: 'channels', label: '渠道' },
  { id: 'session', label: '会话' },
  { id: 'raw', label: '原始 JSON' },
] as const;

type ConfigTabId = (typeof CONFIG_TABS)[number]['id'];

type Config = Record<string, unknown>;

export function ConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTabId>('gateway');
  const [config, setConfig] = useState<Config | null>(null);
  const [configPath, setConfigPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [rawText, setRawText] = useState('');

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
        setRawText(JSON.stringify(res.config, null, 2));
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

  const save = useCallback(
    async (next: Config) => {
      setSaveStatus('saving');
      try {
        await api.config.put(next);
        setConfig(next);
        setRawText(JSON.stringify(next, null, 2));
        setSaveStatus('ok');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('err');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    []
  );

  const update = useCallback(
    (path: string, value: unknown) => {
      if (!config) return;
      const parts = path.split('.');
      const next = JSON.parse(JSON.stringify(config)) as Config;
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const existing = cur[key];
        if (existing != null && typeof existing === 'object' && !Array.isArray(existing)) {
          cur = existing as Record<string, unknown>;
        } else {
          const child: Record<string, unknown> = {};
          cur[key] = child;
          cur = child;
        }
      }
      cur[parts[parts.length - 1]] = value;
      setConfig(next);
      setRawText(JSON.stringify(next, null, 2));
    },
    [config]
  );

  const merge = useCallback(
    (slice: Record<string, unknown>, rootKey: string) => {
      if (!config) return;
      const next = { ...config, [rootKey]: { ...((config[rootKey] as Record<string, unknown>) || {}), ...slice } };
      setConfig(next);
      setRawText(JSON.stringify(next, null, 2));
    },
    [config]
  );

  if (loading) return <p className="text-neutral-600">加载配置中…</p>;
  if (error) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p>配置路径：{configPath || '—'}</p>
        <p>错误：{error}</p>
      </div>
    );
  }

  const cfg = config ?? {};

  return (
    <div className="space-y-4">
      {configPath && (
        <p className="text-xs text-neutral-500">配置文件：{configPath}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
        {CONFIG_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm',
              activeTab === id ? 'bg-neutral-200 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
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
      <div className="min-h-[200px]">
        {activeTab === 'gateway' && (
          <ConfigGateway config={cfg} onUpdate={update} onSave={save} />
        )}
        {activeTab === 'agents' && (
          <ConfigAgents config={cfg} onUpdate={update} onSave={save} />
        )}
        {activeTab === 'channels' && (
          <ConfigChannels config={cfg} onMerge={merge} onSave={save} />
        )}
        {activeTab === 'session' && (
          <ConfigSession config={cfg} onUpdate={update} onSave={save} />
        )}
        {activeTab === 'raw' && (
          <ConfigRaw
            rawText={rawText}
            setRawText={setRawText}
            onSave={save}
            config={config}
            setConfig={setConfig}
          />
        )}
      </div>
    </div>
  );
}

function ConfigGateway({
  config,
  onUpdate,
  onSave,
}: {
  config: Config;
  onUpdate: (path: string, value: unknown) => void;
  onSave: (c: Config) => void;
}) {
  const gateway = (config.gateway as Record<string, unknown>) || {};
  const port = gateway.port ?? 18789;
  const reload = (gateway.reload as Record<string, unknown>) || {};
  const reloadMode = (reload.mode as string) || 'hybrid';

  return (
    <div className="space-y-4">
      <ConfigFormBlock title="网关">
        <FormRow label="端口">
          <input
            type="number"
            className="w-24 rounded border border-neutral-300 px-2 py-1 text-sm"
            value={String(port)}
            onChange={(e) =>
              onUpdate('gateway.port', e.target.value === '' ? 18789 : Number(e.target.value))
            }
          />
        </FormRow>
        <FormRow label="reload 模式">
          <select
            className="rounded border border-neutral-300 px-2 py-1 text-sm"
            value={reloadMode}
            onChange={(e) =>
              onUpdate('gateway.reload', { ...reload, mode: e.target.value })
            }
          >
            <option value="hybrid">hybrid</option>
            <option value="hot">hot</option>
            <option value="restart">restart</option>
            <option value="off">off</option>
          </select>
        </FormRow>
      </ConfigFormBlock>
      <button
        type="button"
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
        onClick={() => onSave(config)}
      >
        保存
      </button>
    </div>
  );
}

function ConfigAgents({
  config,
  onUpdate,
  onSave,
}: {
  config: Config;
  onUpdate: (path: string, value: unknown) => void;
  onSave: (c: Config) => void;
}) {
  const agents = (config.agents as Record<string, unknown>) || {};
  const defaults = (agents.defaults as Record<string, unknown>) || {};
  const workspace = (defaults.workspace as string) ?? '~/.openclaw/workspace';
  const model = defaults.model as Record<string, unknown> | string | undefined;
  const primary =
    typeof model === 'object' && model?.primary != null
      ? String(model.primary)
      : typeof model === 'string'
        ? model
        : '';
  const sandbox = (defaults.sandbox as Record<string, unknown>) || {};
  const sandboxMode = (sandbox.mode as string) ?? 'off';

  return (
    <div className="space-y-4">
      <ConfigFormBlock title="智能体默认">
        <FormRow label="工作区路径">
          <input
            type="text"
            className="min-w-[280px] rounded border border-neutral-300 px-2 py-1 text-sm"
            value={workspace}
            onChange={(e) => onUpdate('agents.defaults.workspace', e.target.value)}
          />
        </FormRow>
        <FormRow label="主模型">
          <input
            type="text"
            className="min-w-[280px] rounded border border-neutral-300 px-2 py-1 text-sm"
            placeholder="anthropic/claude-sonnet-4-5"
            value={primary}
            onChange={(e) => {
              const m = typeof model === 'object' ? { ...model, primary: e.target.value } : { primary: e.target.value };
              onUpdate('agents.defaults.model', m);
            }}
          />
        </FormRow>
        <FormRow label="沙箱模式">
          <select
            className="rounded border border-neutral-300 px-2 py-1 text-sm"
            value={sandboxMode}
            onChange={(e) =>
              onUpdate('agents.defaults.sandbox', { ...sandbox, mode: e.target.value })
            }
          >
            <option value="off">off</option>
            <option value="non-main">non-main</option>
            <option value="all">all</option>
          </select>
        </FormRow>
      </ConfigFormBlock>
      <button
        type="button"
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
        onClick={() => onSave(config)}
      >
        保存
      </button>
    </div>
  );
}

function ConfigChannels({
  config,
  onMerge,
  onSave,
}: {
  config: Config;
  onMerge: (slice: Record<string, unknown>, root: string) => void;
  onSave: (c: Config) => void;
}) {
  const channels = (config.channels as Record<string, unknown>) || {};
  const whatsapp = (channels.whatsapp as Record<string, unknown>) || {};
  const telegram = (channels.telegram as Record<string, unknown>) || {};
  const allowFromWhatsApp = Array.isArray(whatsapp.allowFrom)
    ? (whatsapp.allowFrom as string[]).join(', ')
    : '';
  const allowFromTelegram = Array.isArray(telegram.allowFrom)
    ? (telegram.allowFrom as string[]).join(', ')
    : '';

  return (
    <div className="space-y-4">
      <ConfigFormBlock title="WhatsApp">
        <FormRow label="allowFrom">
          <input
            type="text"
            className="min-w-[280px] rounded border border-neutral-300 px-2 py-1 text-sm"
            placeholder="+15555550123 或 *"
            value={allowFromWhatsApp}
            onChange={(e) =>
              onMerge(
                {
                  ...channels,
                  whatsapp: {
                    ...whatsapp,
                    allowFrom: e.target.value ? e.target.value.split(/[\s,]+/).filter(Boolean) : [],
                  },
                },
                'channels'
              )
            }
          />
        </FormRow>
      </ConfigFormBlock>
      <ConfigFormBlock title="Telegram">
        <FormRow label="allowFrom">
          <input
            type="text"
            className="min-w-[280px] rounded border border-neutral-300 px-2 py-1 text-sm"
            placeholder="tg:123 或 *"
            value={allowFromTelegram}
            onChange={(e) =>
              onMerge(
                {
                  ...channels,
                  telegram: {
                    ...telegram,
                    allowFrom: e.target.value ? e.target.value.split(/[\s,]+/).filter(Boolean) : [],
                  },
                },
                'channels'
              )
            }
          />
        </FormRow>
      </ConfigFormBlock>
      <button
        type="button"
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
        onClick={() => onSave(config)}
      >
        保存
      </button>
    </div>
  );
}

function ConfigSession({
  config,
  onUpdate,
  onSave,
}: {
  config: Config;
  onUpdate: (path: string, value: unknown) => void;
  onSave: (c: Config) => void;
}) {
  const session = (config.session as Record<string, unknown>) || {};
  const dmScope = (session.dmScope as string) ?? 'per-channel-peer';
  const reset = (session.reset as Record<string, unknown>) || {};
  const resetMode = (reset.mode as string) ?? '';

  return (
    <div className="space-y-4">
      <ConfigFormBlock title="会话">
        <FormRow label="dmScope">
          <select
            className="rounded border border-neutral-300 px-2 py-1 text-sm"
            value={dmScope}
            onChange={(e) => onUpdate('session.dmScope', e.target.value)}
          >
            <option value="main">main</option>
            <option value="per-peer">per-peer</option>
            <option value="per-channel-peer">per-channel-peer</option>
            <option value="per-account-channel-peer">per-account-channel-peer</option>
          </select>
        </FormRow>
        <FormRow label="reset.mode">
          <input
            type="text"
            className="min-w-[120px] rounded border border-neutral-300 px-2 py-1 text-sm"
            placeholder="daily / idleMinutes"
            value={resetMode}
            onChange={(e) =>
              onUpdate('session.reset', { ...reset, mode: e.target.value })
            }
          />
        </FormRow>
      </ConfigFormBlock>
      <button
        type="button"
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
        onClick={() => onSave(config)}
      >
        保存
      </button>
    </div>
  );
}

function ConfigRaw({
  rawText,
  setRawText,
  onSave,
  setConfig,
}: {
  rawText: string;
  setRawText: (s: string) => void;
  onSave: (c: Config) => void;
  config: Config | null;
  setConfig: (c: Config) => void;
}) {
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(rawText) as Config;
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        setParseError('配置必须为 JSON 对象');
        return;
      }
      setParseError(null);
      setConfig(parsed);
      onSave(parsed);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'JSON 解析失败');
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-500">编辑完整 JSON，保存前会校验格式。</p>
      {parseError && (
        <p className="text-sm text-red-600">{parseError}</p>
      )}
      <textarea
        className="w-full min-h-[360px] rounded border border-neutral-300 p-2 font-mono text-sm"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        spellCheck={false}
      />
      <button
        type="button"
        className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
        onClick={handleSave}
      >
        保存
      </button>
    </div>
  );
}
