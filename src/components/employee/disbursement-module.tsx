"use client";

import { useState } from "react";
import {
  disbursementDashboardApi,
  type DashboardLoanResponse,
} from "@/lib/api";

interface DisbursementModuleProps {
  loans: DashboardLoanResponse[];
  onActionSuccess?: () => Promise<void> | void;
}

export function DisbursementModule({
  loans,
  onActionSuccess,
}: DisbursementModuleProps) {
  const [actionLoanId, setActionLoanId] = useState<string | null>(null);
  const [moduleError, setModuleError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDisburse = async (loanId: string) => {
    try {
      setModuleError("");
      setSuccessMessage("");
      setActionLoanId(loanId);

      await disbursementDashboardApi.disburseLoan(loanId);

      setSuccessMessage("Loan marked as disbursed successfully.");
      await onActionSuccess?.();
    } catch (error) {
      setModuleError(
        error instanceof Error ? error.message : "Failed to disburse loan",
      );
    } finally {
      setActionLoanId(null);
    }
  };

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Sanctioned loans
        </h2>
        <span className="text-sm text-muted-foreground">{loans.length}</span>
      </div>

      {moduleError ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {moduleError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {loans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sanctioned loans pending disbursement.
        </p>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const isActionLoading = actionLoanId === loan.id;

            return (
              <div key={loan.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {loan.borrowerName ?? "Borrower"} · {loan.loanNumber}
                    </p>

                    {loan.borrowerEmail ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {loan.borrowerEmail}
                      </p>
                    ) : null}

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>Amount: ₹{loan.amount.toLocaleString("en-IN")}</p>
                      <p>Tenure: {loan.tenureDays} days</p>
                      <p>
                        Total repayment: ₹
                        {loan.totalRepayment.toLocaleString("en-IN")}
                      </p>
                      <p>Status: {loan.status}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDisburse(loan.id)}
                    disabled={isActionLoading}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isActionLoading ? "Processing..." : "Mark as disbursed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
