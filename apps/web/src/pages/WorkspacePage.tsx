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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400">
            加载工作区列表…
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {workspacePath && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            工作区：
          </span>
          <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
            {workspacePath}
          </span>
        </div>
      )}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
          自定义工作区路径
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="自定义工作区路径..."
            className="flex-1 min-w-[200px] rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200"
            disabled={savingSettings}
          />
          <button
            type="button"
            onClick={handleApplyCustomPath}
            disabled={savingSettings}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200"
          >
            {savingSettings ? '应用中…' : '应用'}
          </button>
          {isCustomPath && (
            <button
              type="button"
              onClick={handleApplyCustomPath}
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              重置
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[450px] lg:min-w-[450px]">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
              人体模型
            </h2>
            <WorkspaceHumanoid
              onPartClick={handlePartClick}
              selectedFile={selectedFile}
              files={files}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {WORKSPACE_FILE_NAMES.map((name) => {
                  const exists =
                    files.find((f) => f.name === name)?.exists ?? false;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedFile(name)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group',
                        selectedFile === name
                          ? 'bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-800'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:text-primary-700 dark:hover:text-primary-400'
                      )}
                    >
                      {name}
                      {exists && (
                        <span
                          className="ml-1.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"
                          title="文件已存在"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                    <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    保存中…
                  </div>
                )}
                {saveStatus === 'ok' && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    已保存
                  </span>
                )}
                {saveStatus === 'err' && (
                  <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                    <span className="text-lg">✗</span>
                    保存失败
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-white/50 dark:bg-slate-900/50 p-4 shadow-inner border border-neutral-200 dark:border-neutral-700">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {selectedFile.charAt(0)}
                  </span>
                  {selectedFile}
                </span>
                <button
                  type="button"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200"
                  onClick={save}
                >
                  保存
                </button>
              </div>
              {contentLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : (
                <textarea
                  className="w-full min-h-[400px] rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200 resize-y"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {workspacePath && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            工作区：
          </span>
          <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
            {workspacePath}
          </span>
        </div>
      )}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
          自定义工作区路径
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="自定义工作区路径..."
            className="flex-1 min-w-[200px] rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200"
            disabled={savingSettings}
          />
          <button
            type="button"
            onClick={handleApplyCustomPath}
            disabled={savingSettings}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200"
          >
            {savingSettings ? '应用中…' : '应用'}
          </button>
          {isCustomPath && (
            <button
              type="button"
              onClick={handleResetPath}
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl border-2.5 border-neutral-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-200"
            >
              重置
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[450px] lg:min-w-[450px]">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
              人体模型
            </h2>
            <WorkspaceHumanoid
              onPartClick={handlePartClick}
              selectedFile={selectedFile}
              files={files}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {WORKSPACE_FILE_NAMES.map((name) => {
                  const exists =
                    files.find((f) => f.name === name)?.exists ?? false;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedFile(name)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group',
                        selectedFile === name
                          ? 'bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-800'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:text-primary-700 dark:hover:text-primary-400'
                      )}
                    >
                      {name}
                      {exists && (
                        <span
                          className="ml-1.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"
                          title="文件已存在"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                    <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    保存中…
                  </div>
                )}
                {saveStatus === 'ok' && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    已保存
                  </span>
                )}
                {saveStatus === 'err' && (
                  <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                    <span className="text-lg">✗</span>
                    保存失败
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-white/50 dark:bg-slate-900/50 p-4 shadow-inner border border-neutral-200 dark:border-neutral-700">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {selectedFile.charAt(0)}
                  </span>
                  {selectedFile}
                </span>
                <button
                  type="button"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200"
                  onClick={save}
                >
                  保存
                </button>
              </div>
              {contentLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : (
                <textarea
                  className="w-full min-h-[400px] rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200 resize-y"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {workspacePath && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          工作区：{workspacePath}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={customPath}
          onChange={(e) => setCustomPath(e.target.value)}
          placeholder="自定义工作区路径..."
          className="flex-1 min-w-[200px] rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm dark:text-neutral-100"
          disabled={savingSettings}
        />
        <button
          type="button"
          onClick={handleApplyCustomPath}
          disabled={savingSettings}
          className="rounded bg-neutral-800 dark:bg-neutral-600 px-3 py-1.515 text-sm text-white hover:bg-neutral-700 dark:hover:bg-neutral-500 disabled:opacity-50"
        >
          {savingSettings ? '应用中…' : '应用'}
        </button>
        {isCustomPath && (
          <button
            type="button"
            onClick={handleResetPath}
            disabled={savingSettings}
            className="rounded border border-neutral-300 dark:border-neutral-600 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
          >
            重置
          </button>
        )}
      </div>
      {error && (
        <div className="rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-3 text-sm text-amber-800 dark:text-amber-200">
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
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
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
                      ? 'bg-neutral-200 dark:bg-neutral-700 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  )}
                >
                  {name}
                  {exists && (
                    <span
                      className="ml-1 text-green-600 dark:text-green-400"
                      title="文件已存在"
                    >
                      ●
                    </span>
                  )}
                </button>
              );
            })}
            <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
              {saveStatus === 'saving' && '保存中…'}
              {saveStatus === 'ok' && '已保存'}
              {saveStatus === 'err' && '保存失败'}
            </span>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {selectedFile}
              </span>
              <button
                type="button"
                className="rounded bg-neutral-800 dark:bg-neutral-600 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 dark:hover:bg-neutral-500"
                onClick={save}
              >
                保存
              </button>
            </div>
            {contentLoading ? (
              <p className="text-neutral-500 dark:text-neutral-400">加载中…</p>
            ) : (
              <textarea
                className="w-full min-h-[360px] rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 p-2 font-mono text-sm dark:text-neutral-100"
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
