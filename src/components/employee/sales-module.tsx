import type {
  InProgressApplicationResponse,
  SalesLeadResponse,
} from "@/lib/api";

interface SalesModuleProps {
  leads: SalesLeadResponse[];
  applications: InProgressApplicationResponse[];
}

export function SalesModule({ leads, applications }: SalesModuleProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">New leads</h2>
          <span className="text-sm text-muted-foreground">{leads.length}</span>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No new leads available.
          </p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.borrowerId}
                className="rounded-2xl border bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">
                  {lead.firstName} {lead.lastName ?? ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lead.email}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            In-progress applications
          </h2>
          <span className="text-sm text-muted-foreground">
            {applications.length}
          </span>
        </div>

        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No applications in progress.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.applicationId}
                className="rounded-2xl border bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">{app.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  PAN: {app.pan} · {app.status}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Salary: ₹{app.monthlySalary.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
