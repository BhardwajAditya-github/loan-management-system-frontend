import { ReactNode } from "react";

import { requireServerRole } from "@/lib/server-auth";
import { getServerMyProfile } from "@/lib/server-api";
import { BorrowerNavbar } from "@/components/borrower/borrower-navbar";

export default async function BorrowerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireServerRole(["BORROWER"]);
  const user = await getServerMyProfile();

  return (
    <div className="min-h-screen bg-slate-50">
      <BorrowerNavbar user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
