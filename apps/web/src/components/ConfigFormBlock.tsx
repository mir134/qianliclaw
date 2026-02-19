import { ReactNode } from 'react';

export function ConfigFormBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function FormRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="w-32 shrink-0 text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
