import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/config', label: '配置' },
  { to: '/workspace', label: '工作区' },
  { to: '/status', label: '状态' },
  { to: '/settings', label: '设置' },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold">OpenClaw 可视化配置</h1>
        <nav className="mt-2 flex gap-2">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-md text-sm',
                  isActive
                    ? 'bg-neutral-200 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
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
