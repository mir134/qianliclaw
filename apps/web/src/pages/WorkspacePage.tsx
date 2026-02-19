import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { WorkspaceHumanoid } from '@/components/WorkspaceHumanoid';

const WORKSPACE_FILE_NAMES = [
  'USER.md',
  'IDENTITY.md',
  'SOUL.md',
  'AGENTS.md',
  'TOOLS.md',
  'BOOTSTRAP.md',
] as const;

export function WorkspacePage() {
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [files, setFiles] = useState<{ name: string; exists: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>(
    WORKSPACE_FILE_NAMES[0]
  );
  const [content, setContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'ok' | 'err'
  >('idle');
  const [customPath, setCustomPath] = useState<string>('');
  const [isCustomPath, setIsCustomPath] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.workspace.list();
      setWorkspacePath(res.workspacePath);
      setFiles(res.files);
      if (res.error) setError(res.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const settings = await api.settings.get();
      if (settings.workspacePathOverride) {
        setCustomPath(settings.workspacePathOverride);
        setIsCustomPath(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadList();
    loadSettings();
  }, [loadList, loadSettings]);

  const loadFile = useCallback(async (name: string) => {
    setContentLoading(true);
    try {
      const res = await api.workspace.getFile(name);
      setContent(res.content ?? '');
    } catch {
      setContent('');
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFile) loadFile(selectedFile);
  }, [selectedFile, loadFile]);

  const save = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await api.workspace.putFile(selectedFile, content);
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 2000);
      loadList();
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [selectedFile, content, loadList]);

  const handlePartClick = useCallback((fileName: string) => {
    setSelectedFile(fileName);
  }, []);

  const handleApplyCustomPath = useCallback(async () => {
    setSavingSettings(true);
    try {
      const pathToSet = customPath.trim() || null;
      await api.settings.put({ workspacePathOverride: pathToSet });
      setIsCustomPath(!!pathToSet);
      loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingSettings(false);
    }
  }, [customPath, loadList]);

  const handleResetPath = useCallback(async () => {
    setSavingSettings(true);
    try {
      await api.settings.put({ workspacePathOverride: null });
      setCustomPath('');
      setIsCustomPath(false);
      loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingSettings(false);
    }
  }, [loadList]);

  if (loading) return <p className="text-neutral-600">加载工作区列表…</p>;

  return (
    <div className="flex flex-col gap-4">
      {workspacePath && (
        <p className="text-xs text-neutral-500">工作区：{workspacePath}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
          placeholder="自定义工作区路径..."
          className="flex-1 min-w-[200px] rounded border border-neutral-300 px-3 py-1.5 text-sm"
          disabled={savingSettings}
        />
        <button
          type="button"
          onClick={handleApplyCustomPath}
          disabled={savingSettings}
          className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {savingSettings ? '应用中…' : '应用'}
        </button>
        {isCustomPath && (
          <button
            type="button"
            onClick={handleResetPath}
            disabled={savingSettings}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            重置
          </button>
        )}
      </div>
      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[400px] lg:min-w-[400px]">
          <WorkspaceHumanoid
            onPartClick={handlePartClick}
            selectedFile={selectedFile}
            files={files}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
            {WORKSPACE_FILE_NAMES.map((name) => {
              const exists =
                files.find((f) => f.name === name)?.exists ?? false;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedFile(name)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm',
                    selectedFile === name
                      ? 'bg-neutral-200 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {name}
                  {exists && (
                    <span className="ml-1 text-green-600" title="文件已存在">
                      ●
                    </span>
                  )}
                </button>
              );
            })}
            <span className="ml-auto text-sm text-neutral-500">
              {saveStatus === 'saving' && '保存中…'}
              {saveStatus === 'ok' && '已保存'}
              {saveStatus === 'err' && '保存失败'}
            </span>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                {selectedFile}
              </span>
              <button
                type="button"
                className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
                onClick={save}
              >
                保存
              </button>
            </div>
            {contentLoading ? (
              <p className="text-neutral-500">加载中…</p>
            ) : (
              <textarea
                className="w-full min-h-[360px] rounded border border-neutral-300 p-2 font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
