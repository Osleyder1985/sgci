"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { navigation, type NavigationItem } from "@/config/navigation";

function NavigationGroup({
  item,
  pathname,
}: {
  item: NavigationItem;
  pathname: string;
}) {
  const hasActiveChild = item.children?.some(
    (child) => child.href && pathname.startsWith(child.href),
  );

  const [open, setOpen] = useState(Boolean(hasActiveChild));

  if (!item.children) {
    const active = item.href === pathname;

    return (
      <Link
        href={item.href ?? "#"}
        className={[
          "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition",
          active
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        ].join(" ")}
      >
        <span className="mr-3 h-2 w-2 rounded-full bg-current opacity-70" />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition",
          hasActiveChild
            ? "bg-slate-100 text-slate-950"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <span>{item.label}</span>

        <span
          className={[
            "text-xs transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="ml-3 space-y-1 border-l border-slate-200 pl-3">
          {item.children.map((child) => {
            const active =
              child.href === pathname ||
              Boolean(child.href && pathname.startsWith(child.href));

            return (
              <Link
                key={child.href}
                href={child.href ?? "#"}
                className={[
                  "block rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-950">
              SGCI
            </div>

            <div className="text-xs font-medium text-slate-500">
              Gestión Contextualmente Inteligente
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menú principal
          </div>

          <div className="space-y-2">
            {navigation.map((item) => (
              <NavigationGroup
                key={item.label}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500">Sistema</div>

            <div className="mt-1 text-sm font-semibold text-slate-900">
              SGCI Operaciones
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Plataforma empresarial
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
