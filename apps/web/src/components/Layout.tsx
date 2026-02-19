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
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">OpenClaw 可视化配置</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'p-2 rounded-md',
                theme === 'light'
                  ? 'bg-neutral-200 dark:bg-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
              title="浅色模式"
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-2 rounded-md',
                theme === 'dark'
                  ? 'bg-neutral-200 dark:bg-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
              title="深色模式"
            >
              <Moon size={18} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'p-2 rounded-md',
                theme === 'system'
                  ? 'bg-neutral-200 dark:bg-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
              title="跟随系统"
            >
              <Monitor size={18} />
            </button>
          </div>
        </div>
        <nav className="mt-2 flex gap-2">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-md text-sm',
                  isActive
                    ? 'bg-neutral-200 dark:bg-neutral-700 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
