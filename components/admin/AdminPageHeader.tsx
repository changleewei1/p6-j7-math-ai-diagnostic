type Props = { title: string; subtitle?: string };

export function AdminPageHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}
