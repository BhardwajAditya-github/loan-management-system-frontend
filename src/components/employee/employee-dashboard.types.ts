import type {
  DashboardLoanResponse,
  InProgressApplicationResponse,
  SalesLeadResponse,
} from "@/lib/api";

export type EmployeeRole =
  | "ADMIN"
  | "SALES"
  | "SANCTION"
  | "DISBURSEMENT"
  | "COLLECTION";

export type EmployeeModuleKey =
  | "overview"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "users"
  | "reports"
  | "settings";

export interface EmployeeDashboardUser {
  userId: string;
  email: string;
  role: EmployeeRole;
}

export interface SidebarModuleItem {
  key: EmployeeModuleKey;
  label: string;
  locked: boolean;
}

export interface EmployeeDashboardData {
  salesLeads: SalesLeadResponse[];
  inProgressApplications: InProgressApplicationResponse[];
  appliedLoans: DashboardLoanResponse[];
  sanctionedLoans: DashboardLoanResponse[];
  disbursedLoans: DashboardLoanResponse[];
}

export interface EmployeeDashboardProps {
  user: EmployeeDashboardUser;
}
