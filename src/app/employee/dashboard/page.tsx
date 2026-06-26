import { requireServerRole } from "@/lib/server-auth";
import { EmployeeDashboard } from "@/components/employee/employee-dashboard";
import type { EmployeeRole } from "@/components/employee/employee-dashboard.types";

export default async function EmployeeDashboardPage() {
  const user = await requireServerRole([
    "ADMIN",
    "SALES",
    "SANCTION",
    "DISBURSEMENT",
    "COLLECTION",
  ]);

  return (
    <EmployeeDashboard
      user={{
        userId: user.userId,
        email: user.email,
        role: user.role as EmployeeRole,
      }}
    />
  );
}
