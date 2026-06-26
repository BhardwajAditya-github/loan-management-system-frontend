import type { ApplicationResponse, LoanResponse } from "@/lib/api";
import { BadgeCheck, FileText, Wallet } from "lucide-react";

type ApplicationSummaryProps = {
  application: ApplicationResponse;
  loan?: LoanResponse | null;
};

export function ApplicationSummary({
  application,
  loan,
}: ApplicationSummaryProps) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-card">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Application summary
            </h3>
            <p className="text-sm text-muted-foreground">
              Latest application and linked loan snapshot.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* APPLICATION SECTION */}
        <section className="rounded-2xl border bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="font-semibold text-slate-900">Application</h4>

            <StatusPill
              tone={
                application.status === "SUBMITTED"
                  ? "success"
                  : application.brePassed
                    ? "info"
                    : "warning"
              }
            >
              {application.status}
            </StatusPill>
          </div>

          <div className="space-y-3">
            <Row label="Full name" value={application.fullName || "-"} />
            <Row label="PAN" value={application.pan || "-"} />
            <Row
              label="Monthly salary"
              value={formatCurrency(application.monthlySalary)}
            />
            <Row
              label="Employment"
              value={formatEmploymentMode(application.employmentMode)}
            />
            <Row
              label="BRE result"
              value={application.brePassed ? "Passed" : "Failed"}
              valueClassName={
                application.brePassed ? "text-emerald-700" : "text-red-700"
              }
            />
            <Row
              label="Salary slip"
              value={application.salarySlipFileName || "Not uploaded"}
            />
            {application.loanNumber ? (
              <Row label="Loan number" value={application.loanNumber} />
            ) : null}
          </div>

          {!application.brePassed && application.breReasons.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-red-600" />
                <p className="text-sm font-semibold text-red-700">
                  BRE reasons
                </p>
              </div>

              <ul className="mt-3 space-y-2 text-sm text-red-700">
                {application.breReasons.map((reason) => (
                  <li
                    key={reason}
                    className="rounded-xl bg-white/60 px-3 py-2 leading-6"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* LOAN SECTION */}
        <section className="rounded-2xl border bg-slate-50 p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-slate-900">Loan</h4>
          </div>

          {loan ? (
            <div className="space-y-3">
              <Row label="Loan number" value={loan.loanNumber} />
              <Row label="Amount" value={formatCurrency(loan.amount)} />
              <Row label="Tenure" value={`${loan.tenureDays} days`} />
              <Row label="Interest rate" value={`${loan.interestRate}%`} />
              <Row
                label="Simple interest"
                value={formatCurrency(loan.simpleInterest)}
              />
              <Row
                label="Total repayment"
                value={formatCurrency(loan.totalRepayment)}
              />
              <Row
                label="Loan status"
                value={loan.status}
                valueClassName={
                  loan.status === "DISBURSED" || loan.status === "CLOSED"
                    ? "text-emerald-700"
                    : loan.status === "REJECTED"
                      ? "text-red-700"
                      : "text-slate-900"
                }
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-white p-4 text-sm leading-6 text-muted-foreground">
              Loan details will appear here after successful application
              submission and loan creation.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`min-w-0 break-all text-right font-medium text-slate-900 ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusPill({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatEmploymentMode(mode: string) {
  return mode
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
