"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collectionDashboardApi,
  disbursementDashboardApi,
  salesDashboardApi,
  sanctionDashboardApi,
} from "@/lib/api";

import { EmployeeHeader } from "./employee-header";
import { EmployeeSidebar } from "./employee-sidebar";
import { EmployeeStatCard } from "./employee-stat-card";
import { SalesModule } from "./sales-module";
import { SanctionModule } from "./sanction-module";
import { DisbursementModule } from "./disbursement-module";
import { CollectionModule } from "./collection-module";
import { AdminModule } from "./admin-module";

import type {
  EmployeeDashboardData,
  EmployeeDashboardProps,
  EmployeeModuleKey,
} from "./employee-dashboard.types";

import {
  getDefaultModule,
  getRoleLabel,
  getSidebarModules,
} from "./employee-dashboard.utils";

const EMPTY_DASHBOARD_DATA: EmployeeDashboardData = {
  salesLeads: [],
  inProgressApplications: [],
  appliedLoans: [],
  sanctionedLoans: [],
  disbursedLoans: [],
};

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [dashboardData, setDashboardData] =
    useState<EmployeeDashboardData>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeModule, setActiveModule] = useState<EmployeeModuleKey>(
    getDefaultModule(user.role),
  );

  const roleLabel = useMemo(() => getRoleLabel(user.role), [user.role]);
  const sidebarModules = useMemo(
    () => getSidebarModules(user.role),
    [user.role],
  );

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setPageError("");

      const nextData: EmployeeDashboardData = {
        salesLeads: [],
        inProgressApplications: [],
        appliedLoans: [],
        sanctionedLoans: [],
        disbursedLoans: [],
      };

      if (user.role === "ADMIN" || user.role === "SALES") {
        const [leadsResponse, inProgressResponse] = await Promise.all([
          salesDashboardApi.getLeads(),
          salesDashboardApi.getInProgressApplications(),
        ]);

        nextData.salesLeads = leadsResponse.data;
        nextData.inProgressApplications = inProgressResponse.data;
      }

      if (user.role === "ADMIN" || user.role === "SANCTION") {
        const appliedLoansResponse =
          await sanctionDashboardApi.getAppliedLoans();
        nextData.appliedLoans = appliedLoansResponse.data;
      }

      if (user.role === "ADMIN" || user.role === "DISBURSEMENT") {
        const sanctionedLoansResponse =
          await disbursementDashboardApi.getSanctionedLoans();
        nextData.sanctionedLoans = sanctionedLoansResponse.data;
      }

      if (user.role === "ADMIN" || user.role === "COLLECTION") {
        const disbursedLoansResponse =
          await collectionDashboardApi.getDisbursedLoans();
        nextData.disbursedLoans = disbursedLoansResponse.data;
      }

      setDashboardData(nextData);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to load employee dashboard",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = useMemo(() => {
    if (user.role === "SALES") {
      return [
        { label: "New leads", value: dashboardData.salesLeads.length },
        {
          label: "In-progress applications",
          value: dashboardData.inProgressApplications.length,
        },
      ];
    }

    if (user.role === "SANCTION") {
      return [
        { label: "Applied loans", value: dashboardData.appliedLoans.length },
      ];
    }

    if (user.role === "DISBURSEMENT") {
      return [
        {
          label: "Sanctioned loans",
          value: dashboardData.sanctionedLoans.length,
        },
      ];
    }

    if (user.role === "COLLECTION") {
      return [
        {
          label: "Disbursed loans",
          value: dashboardData.disbursedLoans.length,
        },
      ];
    }

    return [
      { label: "Sales leads", value: dashboardData.salesLeads.length },
      {
        label: "In-progress applications",
        value: dashboardData.inProgressApplications.length,
      },
      { label: "Applied loans", value: dashboardData.appliedLoans.length },
      { label: "Disbursed loans", value: dashboardData.disbursedLoans.length },
    ];
  }, [dashboardData, user.role]);

  const renderModule = () => {
    if (user.role === "ADMIN" && activeModule === "overview") {
      return <AdminModule />;
    }

    if (activeModule === "sales") {
      return (
        <SalesModule
          leads={dashboardData.salesLeads}
          applications={dashboardData.inProgressApplications}
        />
      );
    }

    if (activeModule === "sanction") {
      return (
        <SanctionModule
          loans={dashboardData.appliedLoans}
          onActionSuccess={loadDashboard}
        />
      );
    }

    if (activeModule === "disbursement") {
      return (
        <DisbursementModule
          loans={dashboardData.sanctionedLoans}
          onActionSuccess={loadDashboard}
        />
      );
    }

    if (activeModule === "collection") {
      return (
        <CollectionModule
          loans={dashboardData.disbursedLoans}
          onActionSuccess={loadDashboard}
        />
      );
    }

    return <AdminModule />;
  };

  return (
    <main className="min-h-screen bg-gradient-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-3xl border bg-white p-8 shadow-card">
            <p className="text-sm text-muted-foreground">
              Loading operations dashboard...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <EmployeeSidebar
              roleLabel={roleLabel}
              modules={sidebarModules}
              activeModule={activeModule}
              onModuleChange={setActiveModule}
            />

            <div className="space-y-6">
              <EmployeeHeader
                title="Operations Dashboard"
                subtitle="Manage sales, sanction, disbursement and collection workflows from one role-aware dashboard."
                userEmail={user.email}
              />

              {pageError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  {pageError}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                      <EmployeeStatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                      />
                    ))}
                  </div>

                  {renderModule()}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
