interface EmployeeStatCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export function EmployeeStatCard({
  label,
  value,
  helper,
}: EmployeeStatCardProps) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
