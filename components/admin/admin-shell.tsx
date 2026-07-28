"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { OfficialLogo } from "@/components/brand/official-logo";
import { AdminIcon } from "@/components/admin/admin-icon";

const navigation = [
  { href: "/admin", icon: "map", label: "Resumen" },
  { href: "/admin/reservas", icon: "document", label: "Reservas" },
] as const;

export function AdminShell({
  adminEmail,
  adminName,
  children,
}: Readonly<{
  adminEmail: string;
  adminName: string;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="admin-ui admin-atmosphere relative min-h-screen overflow-hidden text-stone-200">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080c09]/85 px-4 py-3 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <Link
              className="flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#b9ff4a]/40"
              href="/admin"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.06]">
                <OfficialLogo className="size-10" priority sizes="40px" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.58rem] font-extrabold uppercase tracking-[0.2em] text-[#b9ff4a]">
                  Aventuras Sin Límites
                </span>
                <span className="mt-0.5 block truncate text-sm font-extrabold text-white sm:text-base">
                  Centro de operaciones
                </span>
              </span>
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <nav aria-label="Navegación administrativa">
              <ul className="grid grid-cols-2 gap-2">
                {navigation.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#b9ff4a]/35 ${
                          active
                            ? "border border-[#b9ff4a]/25 bg-[#b9ff4a]/10 text-[#d6ff94]"
                            : "border border-transparent text-stone-400 hover:bg-white/[0.04] hover:text-white"
                        }`}
                        href={item.href}
                      >
                        <AdminIcon className="size-4" name={item.icon} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white sm:text-sm">
                  {adminName}
                </p>
                <p className="max-w-36 truncate text-[0.68rem] text-stone-500 sm:max-w-48">{adminEmail}</p>
              </div>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="relative px-4 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-11">
        <div className="mx-auto max-w-[92rem]">{children}</div>
      </main>
    </div>
  );
}
