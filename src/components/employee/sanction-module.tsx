"use client";

import { useState } from "react";
import { sanctionDashboardApi, type DashboardLoanResponse } from "@/lib/api";

interface SanctionModuleProps {
  loans: DashboardLoanResponse[];
  onActionSuccess?: () => Promise<void> | void;
}

export function SanctionModule({
  loans,
  onActionSuccess,
}: SanctionModuleProps) {
  const [actionLoanId, setActionLoanId] = useState<string | null>(null);
  const [openRejectLoanId, setOpenRejectLoanId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [moduleError, setModuleError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleApprove = async (loanId: string) => {
    try {
      setModuleError("");
      setSuccessMessage("");
      setActionLoanId(loanId);

      await sanctionDashboardApi.approveLoan(loanId);

      setSuccessMessage("Loan approved successfully.");
      await onActionSuccess?.();
    } catch (error) {
      setModuleError(
        error instanceof Error ? error.message : "Failed to approve loan",
      );
    } finally {
      setActionLoanId(null);
    }
  };

  const handleOpenReject = (loanId: string) => {
    setModuleError("");
    setSuccessMessage("");
    setOpenRejectLoanId(loanId);
    setRejectionReason("");
  };

  const handleCancelReject = () => {
    setOpenRejectLoanId(null);
    setRejectionReason("");
  };

  const handleConfirmReject = async (loanId: string) => {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setModuleError("Please enter a rejection reason.");
      return;
    }

    try {
      setModuleError("");
      setSuccessMessage("");
      setActionLoanId(loanId);

      await sanctionDashboardApi.rejectLoan(loanId, {
        rejectionReason: trimmedReason,
      });

      setSuccessMessage("Loan rejected successfully.");
      setOpenRejectLoanId(null);
      setRejectionReason("");
      await onActionSuccess?.();
    } catch (error) {
      setModuleError(
        error instanceof Error ? error.message : "Failed to reject loan",
      );
    } finally {
      setActionLoanId(null);
    }
  };

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Loans pending sanction
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
        <p className="text-sm text-muted-foreground">No applied loans found.</p>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const isRejectOpen = openRejectLoanId === loan.id;
            const isActionLoading = actionLoanId === loan.id;

            return (
              <div key={loan.id} className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(loan.id)}
                      disabled={isActionLoading}
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isActionLoading ? "Processing..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReject(loan.id)}
                      disabled={isActionLoading}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {isRejectOpen ? (
                  <div className="mt-4 rounded-2xl border bg-white p-4">
                    <label className="mb-2 block text-sm font-medium text-slate-900">
                      Rejection reason
                    </label>

                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      placeholder="Enter the reason for rejecting this loan"
                      className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmReject(loan.id)}
                        disabled={isActionLoading}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isActionLoading ? "Rejecting..." : "Confirm reject"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelReject}
                        disabled={isActionLoading}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
