'use client';

import { ChangeEvent, useState } from 'react';

interface HousePreview {
  numeroHouse?: string;
  house?: string;
  naturalezaCantidad?: string;
  pesoKg?: number;
  bultos?: number;
  cantidadBultos?: number;
  remitenteNombre?: string;
  remitentePasaporte?: string | null;
  destinatarioNombre?: string;
  destinatarioCarnet?: string | null;
  telefonoDestinatario?: string | null;
  direccionDestinatario?: string;
  estadoCobroOrigen?: number | null;
  unidadDestino?: string | null;
}

interface PreviewResponse {
  ok: boolean;
  mensaje?: string;

  archivo?: {
    nombre: string;
    hash: string;
    duplicado: boolean;
  };

  metadata?: {
    masterAwb?: string | null;
    fecha?: string | null;
  };

  total?: {
    cantidadHouses: number;
    cantidadSacas: number;
    cantidadPersonas: number;
    pesoTotalKg: number;
  };

  registros?: number;

  casas?: HousePreview[];

  duplicado?: {
    existe: boolean;
    id?: string;
    masterAwb?: string | null;
    fecha?: string | null;
    pesoTotalKg?: string | null;
    cantidadHouse?: number;
    totalSacas?: number;
    totalPersonas?: number;
  };
}

interface ImportResponse {
  ok: boolean;
  mensaje?: string;

  manifiesto?: {
    id: string;
    masterAwb: string;
    cantidadHouse: number;
    totalSacas: number;
    totalPersonas: number;
    pesoTotalKg: string | number;
    archivoNombre: string;
    importadoAt: string;
  };

  estadisticas?: {
    guias: number;
    paquetes: number;
  };

  error?: string;
}

export default function ImportarManifiestoPage() {
  const [archivo, setArchivo] = useState<File | null>(null);

  const [preview, setPreview] =
    useState<PreviewResponse | null>(null);

  const [resultado, setResultado] =
    useState<ImportResponse | null>(null);

  const [cargandoPreview, setCargandoPreview] =
    useState(false);

  const [importando, setImportando] =
    useState(false);

  const [error, setError] = useState('');

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

  // ============================================================================
  // SELECCIONAR ARCHIVO
  // ============================================================================

  const seleccionarArchivo = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ?? null;

    setArchivo(file);
    setPreview(null);
    setResultado(null);
    setError('');

    if (!file) {
      return;
    }

    await generarPreview(file);
  };

  // ============================================================================
  // PREVIEW
  // ============================================================================

  const generarPreview = async (
    file: File,
  ) => {
    setCargandoPreview(true);
    setError('');

    try {
      const formData = new FormData();

      /*
       * IMPORTANTE:
       * El backend recibe el archivo con el nombre "file".
       */
      formData.append('archivo', file);

      const response = await fetch(
        `${apiUrl}/api/guias/importar/preview`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const texto = await response.text();

      let data: PreviewResponse;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          `El servidor respondió con HTTP ${response.status}.`,
        );
      }

      if (!response.ok || !data.ok) {
        throw new Error(
          data.mensaje ??
            'No fue posible generar la vista previa.',
        );
      }

      setPreview(data);
    } catch (err) {
      setPreview(null);

      setError(
        err instanceof Error
          ? err.message
          : 'Error al generar la vista previa.',
      );
    } finally {
      setCargandoPreview(false);
    }
  };

  // ============================================================================
  // IMPORTAR
  // ============================================================================

  const importarManifiesto = async () => {
    if (!archivo) {
      setError(
        'Seleccione un archivo de manifiesto.',
      );

      return;
    }

    setImportando(true);
    setError('');
    setResultado(null);

    try {
      const formData = new FormData();

      /*
       * Debe utilizar exactamente el nombre
       * que espera FileInterceptor('archivo')
       * del controlador de NestJS.
      */
      formData.append('archivo', archivo);

      const response = await fetch(
        `${apiUrl}/api/guias/importar`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const texto = await response.text();

      let data: ImportResponse;

      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(
          `El servidor respondió con HTTP ${response.status}.`,
        );
      }

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ??
            data.mensaje ??
            'No fue posible importar el manifiesto.',
        );
      }

      setResultado(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al importar el manifiesto.',
      );
    } finally {
      setImportando(false);
    }
  };

  // ============================================================================
  // LIMPIAR
  // ============================================================================

  const limpiar = () => {
    setArchivo(null);
    setPreview(null);
    setResultado(null);
    setError('');

    const input =
      document.getElementById(
        'archivo-manifiesto',
      ) as HTMLInputElement | null;

    if (input) {
      input.value = '';
    }
  };

  const pesoPreview = Number(
    preview?.total?.pesoTotalKg ?? 0,
  );

  const pesoResultado = Number(
    resultado?.manifiesto?.pesoTotalKg ?? 0,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* ================================================================== */}
        {/* ENCABEZADO */}
        {/* ================================================================== */}

        <div className="mb-6">
          <div className="mb-2">
            <a
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              ← Dashboard
            </a>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Importar Manifiesto
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Cargue un manifiesto XLSX, XLS o CSV
            para validar e importar sus Houses,
            bultos, personas y pesos.
          </p>
        </div>

        {/* ================================================================== */}
        {/* ARCHIVO */}
        {/* ================================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Archivo del manifiesto
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Formatos permitidos: XLSX, XLS y CSV.
          </p>

          <div className="mt-5 flex flex-col gap-4 md:flex-row">

            <label
              htmlFor="archivo-manifiesto"
              className="flex min-h-32 flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center hover:bg-slate-100"
            >
              <div>
                <div className="mb-2 text-3xl">
                  📄
                </div>

                <div className="font-medium text-slate-800">
                  Seleccionar manifiesto
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Haga clic para seleccionar el archivo
                </div>
              </div>

              <input
                id="archivo-manifiesto"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={seleccionarArchivo}
                className="hidden"
              />
            </label>

            {archivo && (
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5">

                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Archivo seleccionado
                </div>

                <div className="mt-2 break-all font-semibold text-slate-900">
                  {archivo.name}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {(archivo.size / 1024).toFixed(1)} KB
                </div>

                <button
                  type="button"
                  onClick={limpiar}
                  className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Limpiar
                </button>

              </div>
            )}

          </div>

        </section>

        {/* ================================================================== */}
        {/* PREVIEW CARGANDO */}
        {/* ================================================================== */}

        {cargandoPreview && (
          <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <div className="flex items-center gap-3 text-blue-800">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />

              <span className="font-medium">
                Analizando manifiesto...
              </span>

            </div>

          </section>
        )}

        {/* ================================================================== */}
        {/* ERROR */}
        {/* ================================================================== */}

        {error && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="font-semibold text-red-800">
              Error
            </div>

            <div className="mt-1 whitespace-pre-wrap text-sm text-red-700">
              {error}
            </div>

          </section>
        )}

        {/* ================================================================== */}
        {/* PREVIEW */}
        {/* ================================================================== */}

        {preview?.ok &&
          preview.total && (
            <>

              <section className="mt-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Vista previa
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Datos detectados en el manifiesto.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                  <KpiCard
                    label="Master AWB"
                    value={
                      preview.metadata?.masterAwb ??
                      'No detectado'
                    }
                  />

                  <KpiCard
                    label="Houses"
                    value={
                      preview.total.cantidadHouses
                    }
                  />

                  <KpiCard
                    label="Bultos"
                    value={
                      preview.total.cantidadSacas
                    }
                  />

                  <KpiCard
                    label="Personas"
                    value={
                      preview.total.cantidadPersonas
                    }
                  />

                  <KpiCard
                    label="Peso total"
                    value={`${pesoPreview.toFixed(2)} kg`}
                  />

                </div>

              </section>

              {/* ============================================================ */}
              {/* DUPLICADO */}
              {/* ============================================================ */}

              {preview.archivo?.duplicado && (
                <section className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5">

                  <div className="font-semibold text-yellow-900">
                    Manifiesto ya importado
                  </div>

                  <p className="mt-1 text-sm text-yellow-800">
                    Este archivo ya existe en la base de datos.
                  </p>

                  {preview.duplicado?.masterAwb && (
                    <p className="mt-2 text-sm text-yellow-900">
                      Master AWB:{' '}
                      <strong>
                        {preview.duplicado.masterAwb}
                      </strong>
                    </p>
                  )}

                </section>
              )}

              {/* ============================================================ */}
              {/* HOUSES */}
              {/* ============================================================ */}

              <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-4">

                  <h3 className="font-semibold text-slate-900">
                    Houses detectados
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {preview.registros ?? 0}{' '}
                    registros encontrados.
                  </p>

                </div>

                <div className="max-h-[600px] overflow-auto">

                  <table className="min-w-full text-left text-sm">

                    <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">

                      <tr>

                        <th className="px-4 py-3">
                          House
                        </th>

                        <th className="px-4 py-3">
                          Naturaleza
                        </th>

                        <th className="px-4 py-3">
                          Peso
                        </th>

                        <th className="px-4 py-3">
                          Bultos
                        </th>

                        <th className="px-4 py-3">
                          Remitente
                        </th>

                        <th className="px-4 py-3">
                          Destinatario
                        </th>

                        <th className="px-4 py-3">
                          Teléfono
                        </th>

                        <th className="px-4 py-3">
                          Estado
                        </th>

                        <th className="px-4 py-3">
                          Destino
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {(preview.casas ?? []).map(
                        (house, index) => {

                          const numeroHouse =
                            house.numeroHouse ??
                            house.house ??
                            '';

                          const peso =
                            Number(
                              house.pesoKg ?? 0,
                            );

                          const bultos =
                            Number(
                              house.bultos ??
                                house.cantidadBultos ??
                                0,
                            );

                          return (
                            <tr
                              key={`${numeroHouse}-${index}`}
                              className="hover:bg-slate-50"
                            >

                              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                                {numeroHouse}
                              </td>

                              <td className="max-w-xs px-4 py-3 text-slate-600">
                                {house.naturalezaCantidad ??
                                  '—'}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3">
                                {peso.toFixed(2)} kg
                              </td>

                              <td className="px-4 py-3">
                                {bultos}
                              </td>

                              <td className="min-w-48 px-4 py-3">
                                {house.remitenteNombre ??
                                  '—'}
                              </td>

                              <td className="min-w-48 px-4 py-3">
                                {house.destinatarioNombre ??
                                  '—'}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3">
                                {house.telefonoDestinatario ??
                                  '—'}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3">

                                {house.estadoCobroOrigen ===
                                1 ? (
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                    COBRADO
                                  </span>
                                ) : house.estadoCobroOrigen ===
                                  2 ? (
                                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                                    NO COBRADO
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    SIN ESTADO
                                  </span>
                                )}

                              </td>

                              <td className="whitespace-nowrap px-4 py-3">
                                {house.unidadDestino ??
                                  '—'}
                              </td>

                            </tr>
                          );
                        },
                      )}

                    </tbody>

                  </table>

                </div>

              </section>

              {/* ============================================================ */}
              {/* BOTON IMPORTAR */}
              {/* ============================================================ */}

              <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="font-semibold text-slate-900">
                    Importar manifiesto
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Los datos serán almacenados en SGCI.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={importarManifiesto}
                  disabled={
                    importando ||
                    !archivo ||
                    preview.archivo?.duplicado === true
                  }
                  className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importando
                    ? 'Importando...'
                    : 'Importar Manifiesto'}
                </button>

              </section>

            </>
          )}

        {/* ================================================================== */}
        {/* RESULTADO */}
        {/* ================================================================== */}

        {resultado?.ok &&
          resultado.manifiesto && (
            <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">

              <div className="flex items-start gap-4">

                <div className="text-3xl">
                  ✓
                </div>

                <div className="flex-1">

                  <h2 className="text-xl font-bold text-green-900">
                    Operación completada
                  </h2>

                  <p className="mt-1 text-sm text-green-800">
                    {resultado.mensaje ??
                      'Manifiesto importado correctamente.'}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    <KpiCard
                      label="Master AWB"
                      value={
                        resultado.manifiesto.masterAwb
                      }
                    />

                    <KpiCard
                      label="Houses"
                      value={
                        resultado.manifiesto.cantidadHouse
                      }
                    />

                    <KpiCard
                      label="Bultos"
                      value={
                        resultado.manifiesto.totalSacas
                      }
                    />

                    <KpiCard
                      label="Personas"
                      value={
                        resultado.manifiesto.totalPersonas
                      }
                    />

                    <KpiCard
                      label="Peso total"
                      value={`${pesoResultado.toFixed(2)} kg`}
                    />

                  </div>

                  {resultado.estadisticas && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-white p-4">

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Guías creadas
                          </div>

                          <div className="mt-1 text-lg font-bold">
                            {resultado.estadisticas.guias}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Paquetes creados
                          </div>

                          <div className="mt-1 text-lg font-bold">
                            {resultado.estadisticas.paquetes}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={limpiar}
                      className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Importar otro manifiesto
                    </button>

                    <a
                      href="/dashboard"
                      className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Ver Dashboard
                    </a>

                  </div>

                </div>

              </div>

            </section>
          )}

      </div>
    </main>
  );
}

// ============================================================================
// KPI
// ============================================================================

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-2 break-words text-2xl font-bold text-slate-900">
        {value}
      </div>

    </div>
  );
}