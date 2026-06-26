"use client";

import { useMemo, useState } from "react";
import { IndianRupee, Loader2, Percent, Wallet } from "lucide-react";

import {
  applicationsApi,
  type ApplicationResponse,
  type LoanResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type LoanRequestFormProps = {
  onSuccess: (payload: {
    application: ApplicationResponse;
    loan: LoanResponse;
  }) => void;
};

const MIN_LOAN = 50_000;
const MAX_LOAN = 5_00_000;
const LOAN_STEP = 10_000;

const MIN_TENURE = 30;
const MAX_TENURE = 365;
const TENURE_STEP = 5;

const INTEREST_RATE = 12;

export function LoanRequestForm({ onSuccess }: LoanRequestFormProps) {
  const [loanAmount, setLoanAmount] = useState<number>(2_00_000);
  const [tenureDays, setTenureDays] = useState<number>(180);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preview = useMemo(() => {
    const simpleInterest =
      (loanAmount * INTEREST_RATE * tenureDays) / (365 * 100);

    const totalRepayment = loanAmount + simpleInterest;

    return {
      interestRate: INTEREST_RATE,
      simpleInterest,
      totalRepayment,
      dailyRepayment: totalRepayment / tenureDays,
    };
  }, [loanAmount, tenureDays]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      const response = await applicationsApi.submitApplication({
        loanAmount,
        tenureDays,
      });

      onSuccess(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Step 3 · Loan configuration
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your loan amount and tenure. Repayment preview updates live
            as you move the sliders.
          </p>
        </div>

        <div className="rounded-2xl bg-primary/5 px-4 py-2 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
            Interest rate
          </p>
          <p className="mt-1 text-lg font-bold text-primary">
            {INTEREST_RATE}% p.a.
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT CONFIG PANEL */}
          <div className="space-y-6">
            {/* Loan amount */}
            <div className="rounded-3xl border bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Loan amount
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select an amount between ₹50,000 and ₹5,00,000
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-2 text-right shadow-sm">
                  <p className="text-xs text-muted-foreground">Selected</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(loanAmount)}
                  </p>
                </div>
              </div>

              <Slider
                value={[loanAmount]}
                min={MIN_LOAN}
                max={MAX_LOAN}
                step={LOAN_STEP}
                onValueChange={(value) => setLoanAmount(value[0] ?? MIN_LOAN)}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(MIN_LOAN)}</span>
                <span>{formatCurrency(MAX_LOAN)}</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="rounded-3xl border bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tenure</p>
                  <p className="text-xs text-muted-foreground">
                    Select repayment duration between 30 and 365 days
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-2 text-right shadow-sm">
                  <p className="text-xs text-muted-foreground">Selected</p>
                  <p className="text-lg font-bold text-slate-900">
                    {tenureDays} days
                  </p>
                </div>
              </div>

              <Slider
                value={[tenureDays]}
                min={MIN_TENURE}
                max={MAX_TENURE}
                step={TENURE_STEP}
                onValueChange={(value) => setTenureDays(value[0] ?? MIN_TENURE)}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{MIN_TENURE} days</span>
                <span>{MAX_TENURE} days</span>
              </div>
            </div>

            {/* Formula panel */}
            <div className="rounded-3xl border border-dashed bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                Interest formula
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                <span className="font-medium text-slate-900">
                  Simple Interest
                </span>{" "}
                = (P × R × T) / (365 × 100)
              </p>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                where <span className="font-medium text-slate-900">P</span> =
                principal amount,{" "}
                <span className="font-medium text-slate-900">R</span> = 12%
                p.a., and <span className="font-medium text-slate-900">T</span>{" "}
                = tenure in days.
              </p>
            </div>
          </div>

          {/* RIGHT LIVE CALCULATOR */}
          <div className="rounded-3xl border bg-slate-50 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">
                  Live repayment preview
                </h4>
                <p className="text-sm text-muted-foreground">
                  Updates instantly as you adjust the loan.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <MetricCard
                label="Principal amount"
                value={formatCurrency(loanAmount)}
                icon={<IndianRupee className="h-4 w-4" />}
              />

              <MetricCard
                label="Interest rate"
                value={`${preview.interestRate}% p.a.`}
                icon={<Percent className="h-4 w-4" />}
              />

              <MetricCard
                label="Estimated interest"
                value={formatCurrency(preview.simpleInterest)}
              />

              <MetricCard
                label="Total repayment"
                value={formatCurrency(preview.totalRepayment)}
                highlight
              />

              <MetricCard
                label="Approx. per day"
                value={formatCurrency(preview.dailyRepayment)}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Selected configuration
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                You are applying for{" "}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(loanAmount)}
                </span>{" "}
                for{" "}
                <span className="font-semibold text-slate-900">
                  {tenureDays} days
                </span>
                . Estimated repayment at 12% p.a. will be{" "}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(preview.totalRepayment)}
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Once you apply, your loan request will be created and move into the
            sanction workflow.
          </p>

          <Button
            type="submit"
            className="h-11 rounded-xl px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply for loan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-primary/20 bg-white shadow-sm"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={`mt-2 text-base font-semibold ${
              highlight ? "text-primary" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
