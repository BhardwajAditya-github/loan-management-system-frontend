export function AdminModule() {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">Admin overview</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Admin can see all operational modules, user management, reports, and
        settings from this dashboard. We can wire users/reports next.
      </p>
    </section>
  );
}
