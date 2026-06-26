"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { clearAuthAndLogout } from "@/lib/auth-client";

import type {
  EmployeeModuleKey,
  SidebarModuleItem,
} from "./employee-dashboard.types";

interface EmployeeSidebarProps {
  roleLabel: string;
  modules: SidebarModuleItem[];
  activeModule: EmployeeModuleKey;
  onModuleChange: (module: EmployeeModuleKey) => void;
}

export function EmployeeSidebar({
  roleLabel,
  modules,
  activeModule,
  onModuleChange,
}: EmployeeSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuthAndLogout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full min-h-[calc(100vh-4rem)] flex-col rounded-3xl border bg-white p-4 shadow-card">
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white">
            LMS
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Operations Portal
            </p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {modules.map((module) => {
          const isActive = activeModule === module.key;

          return (
            <button
              key={module.key}
              type="button"
              disabled={module.locked}
              onClick={() => {
                if (!module.locked) onModuleChange(module.key);
              }}
              className={clsx(
                "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-50",
                module.locked && "cursor-not-allowed opacity-50",
              )}
            >
              <span>{module.label}</span>
              {module.locked ? (
                <span className="text-[11px] font-medium text-slate-400">
                  Locked
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
