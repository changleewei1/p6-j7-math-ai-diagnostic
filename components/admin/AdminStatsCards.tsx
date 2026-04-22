type Block = { label: string; value: string; hint?: string };

export function AdminStatsCards({ items }: { items: Block[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((b) => (
        <div
          key={b.label}
          className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-slate-500">{b.label}</p>
          <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">{b.value}</p>
          {b.hint && <p className="mt-0.5 text-xs text-slate-400">{b.hint}</p>}
        </div>
      ))}
    </div>
  );
}
