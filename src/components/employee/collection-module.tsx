"use client";

import { useState } from "react";
import {
  collectionDashboardApi,
  type DashboardLoanResponse,
  type PaymentResponse,
} from "@/lib/api";

interface CollectionModuleProps {
  loans: DashboardLoanResponse[];
  onActionSuccess?: () => Promise<void> | void;
}

interface PaymentFormState {
  utrNumber: string;
  amount: string;
  paymentDate: string;
}

const EMPTY_PAYMENT_FORM: PaymentFormState = {
  utrNumber: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
};

export function CollectionModule({
  loans,
  onActionSuccess,
}: CollectionModuleProps) {
  const [openPaymentLoanId, setOpenPaymentLoanId] = useState<string | null>(
    null,
  );
  const [openPaymentsLoanId, setOpenPaymentsLoanId] = useState<string | null>(
    null,
  );
  const [paymentForm, setPaymentForm] =
    useState<PaymentFormState>(EMPTY_PAYMENT_FORM);

  const [paymentsByLoanId, setPaymentsByLoanId] = useState<
    Record<string, PaymentResponse[]>
  >({});
  const [loadingPaymentsLoanId, setLoadingPaymentsLoanId] = useState<
    string | null
  >(null);

  const [actionLoanId, setActionLoanId] = useState<string | null>(null);
  const [moduleError, setModuleError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetPaymentForm = () => {
    setPaymentForm({
      utrNumber: "",
      amount: "",
      paymentDate: new Date().toISOString().slice(0, 10),
    });
  };

  const openPaymentForm = (loanId: string) => {
    setModuleError("");
    setSuccessMessage("");
    setOpenPaymentLoanId(loanId);
    resetPaymentForm();
  };

  const closePaymentForm = () => {
    setOpenPaymentLoanId(null);
    resetPaymentForm();
  };

  const handlePaymentInputChange = (
    field: keyof PaymentFormState,
    value: string,
  ) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTogglePayments = async (loanId: string) => {
    if (openPaymentsLoanId === loanId) {
      setOpenPaymentsLoanId(null);
      return;
    }

    try {
      setModuleError("");
      setSuccessMessage("");
      setLoadingPaymentsLoanId(loanId);

      const response = await collectionDashboardApi.getLoanPayments(loanId);

      setPaymentsByLoanId((prev) => ({
        ...prev,
        [loanId]: response.data,
      }));
      setOpenPaymentsLoanId(loanId);
    } catch (error) {
      setModuleError(
        error instanceof Error
          ? error.message
          : "Failed to load payment history",
      );
    } finally {
      setLoadingPaymentsLoanId(null);
    }
  };

  const handleAddPayment = async (loan: DashboardLoanResponse) => {
    const utrNumber = paymentForm.utrNumber.trim();
    const amount = Number(paymentForm.amount);
    const paymentDate = paymentForm.paymentDate;

    if (!utrNumber) {
      setModuleError("UTR number is required.");
      return;
    }

    if (!paymentDate) {
      setModuleError("Payment date is required.");
      return;
    }

    if (!paymentForm.amount || Number.isNaN(amount) || amount <= 0) {
      setModuleError("Payment amount must be greater than 0.");
      return;
    }

    if (amount > loan.outstandingAmount) {
      setModuleError(
        `Payment amount cannot exceed outstanding amount of ₹${loan.outstandingAmount.toLocaleString(
          "en-IN",
        )}.`,
      );
      return;
    }

    try {
      setModuleError("");
      setSuccessMessage("");
      setActionLoanId(loan.id);

      const response = await collectionDashboardApi.addPayment({
        loanId: loan.id,
        utrNumber,
        amount,
        paymentDate,
      });

      setSuccessMessage(
        response.data.loan.status === "CLOSED"
          ? "Payment recorded and loan closed successfully."
          : "Payment recorded successfully.",
      );

      // Refresh dashboard loan list first
      await onActionSuccess?.();

      // Refresh payment history for this loan if it's currently open
      if (openPaymentsLoanId === loan.id) {
        const paymentsResponse = await collectionDashboardApi.getLoanPayments(
          loan.id,
        );
        setPaymentsByLoanId((prev) => ({
          ...prev,
          [loan.id]: paymentsResponse.data,
        }));
      }

      closePaymentForm();
    } catch (error) {
      setModuleError(
        error instanceof Error ? error.message : "Failed to record payment",
      );
    } finally {
      setActionLoanId(null);
    }
  };

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Active collection loans
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
          No disbursed loans found.
        </p>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const isPaymentOpen = openPaymentLoanId === loan.id;
            const isPaymentsOpen = openPaymentsLoanId === loan.id;
            const isActionLoading = actionLoanId === loan.id;
            const isPaymentsLoading = loadingPaymentsLoanId === loan.id;
            const payments = paymentsByLoanId[loan.id] ?? [];

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

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                      <p>Loan amount: ₹{loan.amount.toLocaleString("en-IN")}</p>
                      <p>
                        Total repayment: ₹
                        {loan.totalRepayment.toLocaleString("en-IN")}
                      </p>
                      <p>Status: {loan.status}</p>
                      <p>
                        Total paid: ₹{loan.totalPaid.toLocaleString("en-IN")}
                      </p>
                      <p>
                        Outstanding: ₹
                        {loan.outstandingAmount.toLocaleString("en-IN")}
                      </p>
                      <p>Tenure: {loan.tenureDays} days</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openPaymentForm(loan.id)}
                      disabled={isActionLoading}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Record payment
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePayments(loan.id)}
                      disabled={isPaymentsLoading}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPaymentsLoading
                        ? "Loading..."
                        : isPaymentsOpen
                          ? "Hide payments"
                          : "View payments"}
                    </button>
                  </div>
                </div>

                {isPaymentOpen ? (
                  <div className="mt-4 rounded-2xl border bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Record borrower payment
                    </h3>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-900">
                          UTR Number
                        </label>
                        <input
                          type="text"
                          value={paymentForm.utrNumber}
                          onChange={(e) =>
                            handlePaymentInputChange(
                              "utrNumber",
                              e.target.value,
                            )
                          }
                          placeholder="Enter UTR number"
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-900">
                          Amount
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={(e) =>
                            handlePaymentInputChange("amount", e.target.value)
                          }
                          placeholder="Enter amount"
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-900">
                          Payment date
                        </label>
                        <input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) =>
                            handlePaymentInputChange(
                              "paymentDate",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Outstanding amount for this loan: ₹
                      {loan.outstandingAmount.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddPayment(loan)}
                        disabled={isActionLoading}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isActionLoading ? "Saving..." : "Submit payment"}
                      </button>

                      <button
                        type="button"
                        onClick={closePaymentForm}
                        disabled={isActionLoading}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {isPaymentsOpen ? (
                  <div className="mt-4 rounded-2xl border bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Payment history
                    </h3>

                    {payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No payments recorded yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="border-b text-slate-500">
                              <th className="px-2 py-2 font-medium">UTR</th>
                              <th className="px-2 py-2 font-medium">Amount</th>
                              <th className="px-2 py-2 font-medium">
                                Payment date
                              </th>
                              <th className="px-2 py-2 font-medium">
                                Recorded at
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr
                                key={payment.id}
                                className="border-b last:border-b-0"
                              >
                                <td className="px-2 py-2">
                                  {payment.utrNumber}
                                </td>
                                <td className="px-2 py-2">
                                  ₹{payment.amount.toLocaleString("en-IN")}
                                </td>
                                <td className="px-2 py-2">
                                  {payment.paymentDate}
                                </td>
                                <td className="px-2 py-2">
                                  {new Date(payment.createdAt).toLocaleString(
                                    "en-IN",
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
