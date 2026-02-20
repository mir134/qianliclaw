import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

const nav = [
  { to: '/config', label: '配置' },
  { to: '/workspace', label: '工作区' },
  { to: '/status', label: '状态' },
  { to: '/settings', label: '设置' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <header className="border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 py-4 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-bold text-lg">🦀</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent">
                OpenClaw
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                可视化配置平台
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                theme === 'light'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-slate-700'
              )}
              title="浅色模式"
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                theme === 'dark'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-slate-700'
              )}
              title="深色模式"
            >
              <Moon size={18} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                theme === 'system'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-slate-700'
              )}
              title="跟随系统"
            >
              <Monitor size={18} />
            </button>
          </div>
        </div>
        <nav className="mt-4 flex gap-2 max-w-7xl mx-auto">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden group',
                  isActive
                    ? 'bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-800'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-slate-800/50 hover:text-primary-700 dark:hover:text-primary-400'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6 w-full">{children}</main>
    </div>
  );
}
