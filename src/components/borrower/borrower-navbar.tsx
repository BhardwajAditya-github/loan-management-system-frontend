"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronDown, FileText, LogOut, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserResponse } from "@/lib/api";
import { clearAuthAndLogout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type BorrowerNavbarProps = {
  user: UserResponse;
};

function getInitials(user: UserResponse) {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return `${first}${last}`.trim().toUpperCase() || "U";
}

const navItems = [
  {
    label: "My Application",
    href: "/borrower/dashboard",
    icon: FileText,
  },
  {
    label: "My Loans",
    href: "/borrower/loans",
    icon: Wallet,
  },
];

export function BorrowerNavbar({ user }: BorrowerNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuthAndLogout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/borrower/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Loan Management System
              </p>
              <p className="text-xs text-muted-foreground">
                Borrower workspace
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/borrower/dashboard"
                  ? pathname === "/borrower/dashboard"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user.firstName} {user.lastName ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getInitials(user)}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">Borrower</p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">
                  {user.firstName} {user.lastName ?? ""}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                <Link href="/borrower/dashboard">My Applications</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                <Link href="/borrower/loans">My Loans</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer rounded-xl text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-t border-slate-100 md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6">
          {navItems.map((item) => {
            const isActive =
              item.href === "/borrower/dashboard"
                ? pathname === "/borrower/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-700",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
