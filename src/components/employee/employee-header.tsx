interface EmployeeHeaderProps {
  title: string;
  subtitle: string;
  userEmail: string;
}

export function EmployeeHeader({
  title,
  subtitle,
  userEmail,
}: EmployeeHeaderProps) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
          <p className="font-medium text-slate-900">{userEmail}</p>
          <p className="text-muted-foreground">Employee session active</p>
        </div>
      </div>
    </div>
  );
}
