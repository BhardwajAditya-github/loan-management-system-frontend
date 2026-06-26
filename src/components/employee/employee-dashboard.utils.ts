import type {
  EmployeeModuleKey,
  EmployeeRole,
  SidebarModuleItem,
} from "./employee-dashboard.types";

const ALL_MODULES: Array<{ key: EmployeeModuleKey; label: string }> = [
  { key: "overview", label: "Dashboard" },
  { key: "sales", label: "Sales" },
  { key: "sanction", label: "Sanction" },
  { key: "disbursement", label: "Disbursement" },
  { key: "collection", label: "Collection" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
];

const ROLE_ACCESS: Record<EmployeeRole, EmployeeModuleKey[]> = {
  ADMIN: [
    "overview",
    "sales",
    "sanction",
    "disbursement",
    "collection",
    "users",
    "reports",
    "settings",
  ],
  SALES: ["overview", "sales"],
  SANCTION: ["overview", "sanction"],
  DISBURSEMENT: ["overview", "disbursement"],
  COLLECTION: ["overview", "collection"],
};

export function getSidebarModules(role: EmployeeRole): SidebarModuleItem[] {
  const allowedModules = new Set(ROLE_ACCESS[role]);

  return ALL_MODULES.map((module) => ({
    ...module,
    locked: !allowedModules.has(module.key),
  }));
}

export function getDefaultModule(role: EmployeeRole): EmployeeModuleKey {
  switch (role) {
    case "SALES":
      return "sales";
    case "SANCTION":
      return "sanction";
    case "DISBURSEMENT":
      return "disbursement";
    case "COLLECTION":
      return "collection";
    case "ADMIN":
    default:
      return "overview";
  }
}

export function getRoleLabel(role: EmployeeRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "SALES":
      return "Sales Executive";
    case "SANCTION":
      return "Sanction Executive";
    case "DISBURSEMENT":
      return "Disbursement Executive";
    case "COLLECTION":
      return "Collection Executive";
    default:
      return role;
  }
}
