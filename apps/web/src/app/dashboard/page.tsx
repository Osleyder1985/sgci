import type { ReactNode } from 'react';

interface DashboardData {
  ok: boolean;
  generadoAt: string;

  kpis: {
    manifiestos: number;
    masterAwb: number;
    guias: number;
    houses: number;
    bultos: number;
    paquetes: number;
    personas: number;
    pesoTotalKg: number;
  };

  cobro: {
    cobrado: number;
    noCobrado: number;
    total: number;
  };

  destinos: Array<{
    destino: string;
    cantidad: number;
  }>;

  actividad: Array<{
    id: string;
    masterAwb: string | null;
    archivoNombre: string;
    fecha: string | null;
    importadoAt: string;
    houses: number;
    bultos: number;
    personas: number;
    pesoKg: number;
  }>;

  consistencia: {
    pesoDesdeManifiestosKg: number;
    pesoDesdeGuiasKg: number;
    bultosDesdeManifiestos: number;
    bultosDesdeGuias: number;
  };
}

interface Kpi {
  label: string;
  value: string;
  description: string;
  trend?: string;
}

interface PanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

async function getDashboard(): Promise<DashboardData> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const response = await fetch(`${apiUrl}/dashboard`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `No fue posible obtener el Dashboard. HTTP ${response.status}`,
    );
  }

  return response.json();
}

function DashboardPanel({
  title,
  description,
  children,
  className = '',
}: PanelProps) {
  return (
    <section
      className={[
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        className,
      ].join(' ')}
    >
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-base font-bold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function KpiCard({ item }: { item: Kpi }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {item.label}
          </p>

          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            {item.value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          ◈
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {item.description}
        </span>

        {item.trend && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {item.trend}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.min(Math.round((value / total) * 100), 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-950">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatKg(value: number) {
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kg`;
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default async function DashboardPage() {
  let dashboard: DashboardData;

  try {
    dashboard = await getDashboard();
  } catch {
    return (
      <div className="space-y-8">
        <section>
          <div className="mb-2 text-sm font-semibold text-blue-600">
            Centro de operaciones
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Dashboard operativo
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            No fue posible conectar con el API de SGCI.
          </p>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-base font-bold text-red-900">
            API no disponible
          </h2>

          <p className="mt-2 text-sm text-red-700">
            Verifica que el backend esté ejecutándose en:
          </p>

          <code className="mt-3 block rounded-lg bg-white p-3 text-sm text-red-900">
            http://localhost:3001
          </code>
        </section>
      </div>
    );
  }

  const { kpis, cobro, destinos, actividad, consistencia } =
    dashboard;

  const kpiCards: Kpi[] = [
    {
      label: 'Guías / Houses',
      value: kpis.guias.toLocaleString('es-ES'),
      description: 'Operaciones registradas',
    },
    {
      label: 'Bultos',
      value: kpis.bultos.toLocaleString('es-ES'),
      description: 'Unidades procesadas',
    },
    {
      label: 'Peso total',
      value: formatKg(kpis.pesoTotalKg),
      description: 'Carga procesada',
    },
    {
      label: 'Personas',
      value: kpis.personas.toLocaleString('es-ES'),
      description: 'Personas registradas',
    },
    {
      label: 'Master AWB',
      value: kpis.masterAwb.toLocaleString('es-ES'),
      description: 'Master activos',
    },
    {
      label: 'Manifiestos',
      value: kpis.manifiestos.toLocaleString('es-ES'),
      description: 'Manifiestos procesados',
    },
    {
      label: 'Cobrado',
      value: cobro.cobrado.toLocaleString('es-ES'),
      description: 'Identificados como cobrados',
    },
    {
      label: 'No cobrado',
      value: cobro.noCobrado.toLocaleString('es-ES'),
      description: 'Identificados como no cobrados',
    },
  ];

  return (
    <div className="space-y-8">
      {/* CABECERA */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 text-sm font-semibold text-blue-600">
            Centro de operaciones
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Dashboard operativo
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Vista general del estado operativo de SGCI, con
            indicadores, actividad, excepciones y accesos rápidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Actualizar
          </a>

          <a
            href="/operaciones/manifiestos/importar"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Nueva operación
          </a>
        </div>
      </section>

      {/* FILTROS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm font-bold text-slate-950">
              Filtros operativos
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Controla el período y el contexto de los indicadores.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Hoy
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              7 días
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              30 días
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Personalizado
            </button>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-950">
            Indicadores principales
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Datos obtenidos directamente de la operación registrada.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>
      </section>

      {/* OPERACIÓN */}
      <section className="grid gap-6 xl:grid-cols-3">
        <DashboardPanel
          title="Volumen operativo"
          description="Distribución de la operación procesada."
          className="xl:col-span-2"
        >
          <div className="space-y-6">
            <ProgressBar
              label="Houses"
              value={kpis.houses}
              total={kpis.houses}
            />

            <ProgressBar
              label="Bultos"
              value={kpis.bultos}
              total={kpis.houses}
            />

            <ProgressBar
              label="Personas"
              value={kpis.personas}
              total={kpis.houses}
            />

            <ProgressBar
              label="Paquetes"
              value={kpis.paquetes}
              total={kpis.bultos}
            />
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Estado de cobro"
          description="Control de identificación en origen."
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Cobrado
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Identificados como cobrados
                </div>
              </div>

              <div className="text-2xl font-black text-emerald-600">
                {cobro.cobrado}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  No cobrado
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Identificados como no cobrados
                </div>
              </div>

              <div className="text-2xl font-black text-amber-600">
                {cobro.noCobrado}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Total identificado
                </span>

                <span className="text-lg font-black text-slate-950">
                  {cobro.total}
                </span>
              </div>
            </div>
          </div>
        </DashboardPanel>
      </section>

      {/* DESTINOS */}
      <DashboardPanel
        title="Destinos"
        description="Distribución de Houses por unidad de destino."
      >
        {destinos.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            No existen destinos registrados.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {destinos.map((item) => (
              <div
                key={item.destino}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Destino
                </div>

                <div className="mt-2 text-lg font-black text-slate-950">
                  {item.destino}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {item.cantidad} Houses
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>

      {/* ACTIVIDAD + CONSISTENCIA */}
      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel
          title="Actividad reciente"
          description="Últimos manifiestos registrados en el sistema."
        >
          {actividad.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No existe actividad registrada.
            </div>
          ) : (
            <div className="space-y-5">
              {actividad.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4"
                >
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      Manifiesto importado
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {item.masterAwb
                        ? `Master AWB ${item.masterAwb}`
                        : 'Sin Master AWB'}{' '}
                      · {item.houses} Houses ·{' '}
                      {formatKg(item.pesoKg)}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {item.bultos} Bultos · {item.personas} Personas ·{' '}
                      {formatDate(item.importadoAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Consistencia de datos"
          description="Comparación entre los totales del manifiesto y las guías."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-600">
                Peso manifiestos
              </span>

              <span className="font-bold text-slate-950">
                {formatKg(
                  consistencia.pesoDesdeManifiestosKg,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-600">
                Peso guías
              </span>

              <span className="font-bold text-slate-950">
                {formatKg(consistencia.pesoDesdeGuiasKg)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-600">
                Bultos manifiestos
              </span>

              <span className="font-bold text-slate-950">
                {consistencia.bultosDesdeManifiestos}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-600">
                Bultos guías
              </span>

              <span className="font-bold text-slate-950">
                {consistencia.bultosDesdeGuias}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-bold text-emerald-900">
                Datos sincronizados
              </div>

              <div className="mt-1 text-xs text-emerald-700">
                Los indicadores se calculan directamente desde
                PostgreSQL mediante Prisma.
              </div>
            </div>
          </div>
        </DashboardPanel>
      </section>

      {/* ALERTAS */}
      <DashboardPanel
        title="Alertas y excepciones"
        description="Elementos que requieren atención."
      >
        <div className="space-y-3">
          {cobro.total < kpis.houses && (
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div>
                <div className="text-sm font-bold text-amber-900">
                  Información pendiente
                </div>

                <div className="mt-1 text-xs text-amber-700">
                  Existen Houses sin identificación de estado de
                  cobro.
                </div>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700">
                Revisar
              </span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-bold text-slate-900">
                Sin incidencias críticas
              </div>

              <div className="mt-1 text-xs text-slate-500">
                No existen excepciones críticas registradas.
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              OK
            </span>
          </div>
        </div>
      </DashboardPanel>

      {/* ACCIONES */}
      <DashboardPanel
        title="Acciones rápidas"
        description="Accede directamente a las operaciones más utilizadas."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/operaciones/manifiestos/importar"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-950">
              Importar manifiesto
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Cargar XLSX, XLS o CSV.
            </div>
          </a>

          <a
            href="/operaciones/manifiestos"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-950">
              Ver manifiestos
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Consultar operaciones.
            </div>
          </a>

          <a
            href="/operaciones/guias"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-950">
              Consultar guías
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Buscar Houses y destinatarios.
            </div>
          </a>

          <a
            href="/reportes/operativos"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="text-sm font-bold text-slate-950">
              Reportes
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Consultar información operativa.
            </div>
          </a>
        </div>
      </DashboardPanel>
    </div>
  );
}