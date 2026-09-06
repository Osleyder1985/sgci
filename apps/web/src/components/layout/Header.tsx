"use client";

import { usePathname } from "next/navigation";

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  if (pathname.includes("/manifiestos/importar")) {
    return "Importar Manifiesto";
  }

  if (pathname.includes("/manifiestos")) {
    return "Manifiestos";
  }

  if (pathname.includes("/guias")) {
    return "Guías / Houses";
  }

  if (pathname.includes("/bultos")) {
    return "Bultos";
  }

  if (pathname.includes("/master-awb")) {
    return "Master AWB";
  }

  if (pathname.includes("/personas")) {
    return "Personas";
  }

  if (pathname.includes("/recepcion")) {
    return "Recepción";
  }

  if (pathname.includes("/almacen")) {
    return "Almacén";
  }

  if (pathname.includes("/ubicaciones")) {
    return "Ubicaciones";
  }

  if (pathname.includes("/viajes")) {
    return "Viajes";
  }

  if (pathname.includes("/rutas")) {
    return "Rutas";
  }

  if (pathname.includes("/entregas")) {
    return "Entregas";
  }

  if (pathname.includes("/incidencias")) {
    return "Incidencias";
  }

  if (pathname.includes("/excepciones")) {
    return "Excepciones";
  }

  if (pathname.includes("/inspecciones")) {
    return "Inspecciones";
  }

  if (pathname.includes("/auditoria")) {
    return "Auditoría";
  }

  if (pathname.includes("/reportes")) {
    return "Reportes";
  }

  if (pathname.includes("/administracion")) {
    return "Administración";
  }

  return "SGCI";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-bold text-slate-950">{title}</h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Sistema de Gestión Contextualmente Inteligente
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 md:block"
          >
            Buscar
          </button>

          <button
            type="button"
            aria-label="Notificaciones"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            🔔
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              SG
            </div>

            <div className="hidden lg:block">
              <div className="text-sm font-semibold text-slate-900">
                Operador
              </div>

              <div className="text-xs text-slate-500">Sesión activa</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
