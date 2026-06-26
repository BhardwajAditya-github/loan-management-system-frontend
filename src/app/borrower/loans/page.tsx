"use client";

import { useEffect, useMemo, useState } from "react";
import { loansApi, type LoanResponse } from "@/lib/api";

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const response = await loansApi.getMyLoans();
        setLoans(response.data ?? []);
      } catch (err) {
        setLoans([]);
        setPageError(
          err instanceof Error ? err.message : "Failed to load your loans",
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    return loans.reduce(
      (acc, loan) => {
        acc.totalPrincipal += loan.amount ?? 0;
        acc.totalRepayment += loan.totalRepayment ?? 0;
        acc.totalPaid += loan.totalPaid ?? 0;
        acc.totalOutstanding += loan.outstandingAmount ?? 0;
        return acc;
      },
      {
        totalPrincipal: 0,
        totalRepayment: 0,
        totalPaid: 0,
        totalOutstanding: 0,
      },
    );
  }, [loans]);

  return (
    <main className="min-h-screen bg-gradient-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-3xl border bg-white p-6 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  My Loans
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  View your current and previous loans, repayment progress, and
                  remaining balances.
                </p>
              </div>

              <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {loans.length} loan{loans.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {/* Error */}
          {pageError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {pageError}
            </div>
          ) : null}

          {/* Loading */}
          {isLoading ? (
            <div className="rounded-3xl border bg-white p-8 shadow-card">
              <p className="text-sm text-muted-foreground">
                Loading your loans...
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border bg-white p-5 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total principal
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    ₹{summary.totalPrincipal.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total repayment
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    ₹{summary.totalRepayment.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total paid
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">
                    ₹{summary.totalPaid.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Outstanding
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-amber-700">
                    ₹{summary.totalOutstanding.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Empty state */}
              {loans.length === 0 ? (
                <div className="rounded-3xl border bg-white p-8 shadow-card">
                  <h2 className="text-lg font-semibold text-slate-900">
                    No loans yet
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You do not have any loan records yet. Once a loan is
                    created, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan) => {
                    const isClosed = loan.status === "CLOSED";
                    const isActive = loan.status === "DISBURSED";

                    return (
                      <div
                        key={loan.id}
                        className="rounded-3xl border bg-white p-6 shadow-card"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-lg font-semibold text-slate-900">
                                Loan #{loan.loanNumber}
                              </h2>

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  isClosed
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isActive
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {loan.status}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">
                              Review your principal, repayment progress, and
                              remaining balance for this loan.
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                            <p className="font-medium text-slate-900">
                              Remaining
                            </p>
                            <p className="mt-1 text-lg font-semibold text-amber-700">
                              ₹{loan.outstandingAmount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Principal
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              ₹{loan.amount.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="rounded-2xl border bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Total repayment
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">
                              ₹{loan.totalRepayment.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="rounded-2xl border bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Repaid amount
                            </p>
                            <p className="mt-2 text-lg font-semibold text-emerald-700">
                              ₹{loan.totalPaid.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="rounded-2xl border bg-slate-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Outstanding
                            </p>
                            <p className="mt-2 text-lg font-semibold text-amber-700">
                              ₹{loan.outstandingAmount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                          <p>
                            <span className="font-medium text-slate-700">
                              Tenure:
                            </span>{" "}
                            {loan.tenureDays} days
                          </p>

                          {"createdAt" in loan && loan.createdAt ? (
                            <p>
                              <span className="font-medium text-slate-700">
                                Created:
                              </span>{" "}
                              {new Date(loan.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          ) : null}

                          {"disbursedAt" in loan && loan.disbursedAt ? (
                            <p>
                              <span className="font-medium text-slate-700">
                                Disbursed:
                              </span>{" "}
                              {new Date(loan.disbursedAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          ) : null}

                          {"closedAt" in loan && loan.closedAt ? (
                            <p>
                              <span className="font-medium text-slate-700">
                                Closed:
                              </span>{" "}
                              {new Date(loan.closedAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
