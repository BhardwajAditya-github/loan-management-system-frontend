"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applicationsApi,
  loansApi,
  type ApplicationResponse,
  type LoanResponse,
} from "@/lib/api";
import { ApplicationProgress } from "./application-progress";
import { PersonalDetailsForm } from "./personal-details-form";
import { SalarySlipUpload } from "./salary-slip-upload";
import { LoanRequestForm } from "./loan-request-form";
import { ApplicationSummary } from "./application-summary";

export function BorrowerDashboard() {
  const [application, setApplication] = useState<ApplicationResponse | null>(
    null,
  );
  const [loan, setLoan] = useState<LoanResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const applicationResponse =
          await applicationsApi.getMyLatestApplication();
        const latestApplication = applicationResponse.data;

        if (latestApplication?.loanNumber) {
          try {
            const loanResponse = await loansApi.getMyLoanByNumber(
              latestApplication.loanNumber,
            );

            const fetchedLoan = loanResponse?.data ?? null;

            if (fetchedLoan?.status === "CLOSED" || fetchedLoan?.status === "REJECTED") {
              // Previous loan cycle is finished -> borrower can start a new application
              setLoan(null);
              setApplication(null);
            } else {
              setLoan(fetchedLoan);
              setApplication(latestApplication);
            }
          } catch {
            setLoan(null);
            setApplication(latestApplication);
          }
        } else {
          setLoan(null);
          setApplication(latestApplication);
        }
      } catch (err) {
        setApplication(null);
        setLoan(null);

        const message =
          err instanceof Error ? err.message.toLowerCase() : "unknown error";

        if (
          !message.includes("not found") &&
          !message.includes("application")
        ) {
          setPageError(
            err instanceof Error
              ? err.message
              : "Failed to load borrower dashboard",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const progressSteps = useMemo(() => {
    const hasPersonalDetails =
      !!application?.fullName &&
      !!application?.pan &&
      !!application?.dateOfBirth;

    const breFailed = !!application && !application.brePassed;
    const brePassed = !!application?.brePassed;
    const hasSalarySlip = !!application?.salarySlipUrl;
    const isSubmitted = application?.status === "SUBMITTED";
    const hasLoan = !!loan;
    const hasActiveLoan = !!loan && loan.status !== "CLOSED";

    return [
      {
        id: "personal-details",
        title: "Personal details",
        description: "Fill personal and employment information",
        state: hasPersonalDetails ? "completed" : "active",
      },
      {
        id: "bre-check",
        title: "BRE decision",
        description: breFailed
          ? "BRE failed. Review the reasons before continuing."
          : "System evaluates your profile based on submitted details.",
        state: breFailed
          ? "failed"
          : brePassed
            ? "completed"
            : hasPersonalDetails
              ? "active"
              : "pending",
      },
      {
        id: "salary-slip",
        title: "Salary slip upload",
        description: "Upload salary slip to continue application processing",
        state: hasSalarySlip ? "completed" : brePassed ? "active" : "pending",
      },
      {
        id: "loan-request",
        title: "Loan request",
        description: "Choose loan amount and tenure, then submit application",
        state:
          isSubmitted || hasLoan
            ? "completed"
            : hasSalarySlip
              ? "active"
              : "pending",
      },
    ] as const;
  }, [application, loan]);

  const canUploadSalarySlip =
    !!application?.brePassed && application?.status !== "SUBMITTED";

  const canSubmitLoanRequest =
    !!application?.brePassed &&
    !!application?.salarySlipUrl &&
    application?.status !== "SUBMITTED";

  const hasActiveLoan = !!loan && loan.status !== "CLOSED";

  const isSubmittedApplication =
    application?.status === "SUBMITTED" && hasActiveLoan;

  const isReadOnly = isSubmittedApplication;

  const personalDetailsInitialValues = application
    ? {
        fullName: application.fullName,
        pan: application.pan,
        dateOfBirth: application.dateOfBirth?.slice(0, 10),
        monthlySalary: application.monthlySalary,
        employmentMode: application.employmentMode,
      }
    : undefined;

  return (
    <main className="min-h-screen bg-gradient-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-3xl border bg-white p-8 shadow-card">
            <p className="text-sm text-muted-foreground">
              Loading your application workspace...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-6">
              <ApplicationProgress
                steps={progressSteps.map((step) => ({
                  ...step,
                  state: step.state as
                    | "pending"
                    | "active"
                    | "completed"
                    | "failed",
                }))}
              />

              {application ? (
                <ApplicationSummary application={application} loan={loan} />
              ) : null}
            </div>

            <div className="space-y-6">
              {pageError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  {pageError}
                </div>
              ) : null}

              {isReadOnly ? (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Application submitted successfully
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-blue-800">
                      Your loan application has already been submitted and is
                      currently under internal review. You can track the status
                      from the summary panel, but the application can no longer
                      be edited.
                    </p>

                    {loan ? (
                      <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        Loan #{loan.loanNumber} · {loan.status}
                      </div>
                    ) : (
                      <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        Status · {application?.status}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border bg-white p-6 shadow-card">
                    <h3 className="text-lg font-semibold text-slate-900">
                      What happens next
                    </h3>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          1. Review
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Internal team reviews your submitted application and
                          loan details.
                        </p>
                      </div>

                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          2. Decision
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          The sanction team will approve or reject the loan
                          based on internal checks.
                        </p>
                      </div>

                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          3. Disbursement
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          If approved, the loan will move to disbursement and
                          then repayment tracking.
                        </p>
                      </div>
                    </div>
                  </div>

                  {loan?.status === "DISBURSED" ? (
                    <div className="rounded-3xl border bg-white p-6 shadow-card">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Repayment & payment history
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Track all payments received against your loan and
                            the remaining amount.
                          </p>
                        </div>

                        <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                          Loan #{loan.loanNumber} · {loan.status}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Loan amount
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">
                            ₹{(loan.amount ?? 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="rounded-2xl border bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Total repayment
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">
                            ₹{(loan.totalPaid ?? 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="rounded-2xl border bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Total paid
                          </p>
                          <p className="mt-2 text-lg font-semibold text-emerald-700">
                            ₹{(loan.totalPaid ?? 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="rounded-2xl border bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Amount remaining
                          </p>
                          <p className="mt-2 text-lg font-semibold text-amber-700">
                            ₹{(loan.outstandingAmount ?? loan.totalRepayment).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <PersonalDetailsForm
                    initialValues={personalDetailsInitialValues}
                    onSuccess={(nextApplication) => {
                      setApplication(nextApplication);
                      if (!nextApplication.loanNumber) {
                        setLoan(null);
                      }
                    }}
                  />

                  {application && !application.brePassed ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                      <h3 className="text-lg font-semibold text-red-700">
                        BRE did not pass
                      </h3>
                      <p className="mt-2 text-sm text-red-700">
                        Your current details did not pass the eligibility rules.
                        Update your details and try again.
                      </p>

                      {application.breReasons.length > 0 ? (
                        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-red-700">
                          {application.breReasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}

                  <SalarySlipUpload
                    disabled={!canUploadSalarySlip}
                    hasUploaded={!!application?.salarySlipUrl}
                    fileName={application?.salarySlipFileName}
                    onSuccess={(nextApplication) => {
                      setApplication(nextApplication);
                    }}
                  />

                  {canSubmitLoanRequest ? (
                    <LoanRequestForm
                      onSuccess={({
                        application: nextApplication,
                        loan: nextLoan,
                      }) => {
                        setApplication(nextApplication);
                        setLoan(nextLoan);
                      }}
                    />
                  ) : (
                    <div className="rounded-3xl border bg-slate-50 p-5 text-sm text-muted-foreground">
                      You can submit your loan request after BRE passes and
                      salary slip is uploaded successfully.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
