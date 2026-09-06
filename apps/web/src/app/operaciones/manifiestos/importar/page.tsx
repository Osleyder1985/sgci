"use client";

import { ChangeEvent, useMemo, useState } from "react";

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
  direccionDestinatario?: string | null;
  estadoCobroOrigen?: number | null;
  unidadDestino?: string | null;
}

interface PreviewResponse {
  ok: boolean;
  mensaje?: string;
  archivo?: { nombre: string; hash: string; duplicado: boolean };
  metadata?: {
    masterAwb?: string | null;
    fecha?: string | null;
    agenteTransitario?: string | null;
    paisOrigen?: string | null;
    consignatario?: string | null;
  };
  total?: {
    cantidadHouses: number;
    cantidadSacas: number;
    cantidadPersonas: number;
    pesoTotalKg: number;
  };
  registros?: number;
  casas?: HousePreview[];
  warnings?: string[];
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
  direcciones?: {
    total: number;
    encontradas: number;
    reutilizables: number;
    pendientesGeocodificacion: number;
    nuevas: number;
    sinDireccion: number;
    cobertura: number;
    personasConDireccion: number;
    personasSinDireccion: number;
    warnings: string[];
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
    personasVerificadas: number;
    direccionesEncontradas: number;
    direccionesReutilizadas: number;
    direccionesGeocodificadas: number;
    direccionesPendientes: number;
  };
  warnings?: string[];
  error?: string;
}

type Tone = "green" | "amber" | "red" | "blue" | "slate";

export default function ImportarManifiestoPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [resultado, setResultado] = useState<ImportResponse | null>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [importando, setImportando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [mostrarWarnings, setMostrarWarnings] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const seleccionarArchivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setArchivo(file);
    setPreview(null);
    setResultado(null);
    setError("");
    setBusqueda("");
    setSoloAlertas(false);
    setMostrarWarnings(false);
    if (file) await generarPreview(file);
  };

  const generarPreview = async (file: File) => {
    setCargandoPreview(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("archivo", file);
      const response = await fetch(`${apiUrl}/api/guias/importar/preview`, {
        method: "POST",
        body: formData,
      });
      const texto = await response.text();
      let data: PreviewResponse;
      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(`El servidor respondió con HTTP ${response.status}.`);
      }
      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje ?? "No fue posible analizar el manifiesto.");
      }
      setPreview(data);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "Error al analizar el manifiesto.");
    } finally {
      setCargandoPreview(false);
    }
  };

  const importarManifiesto = async () => {
    if (!archivo) return setError("Seleccione un archivo de manifiesto.");
    setImportando(true);
    setResultado(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const response = await fetch(`${apiUrl}/api/guias/importar`, {
        method: "POST",
        body: formData,
      });
      const texto = await response.text();
      let data: ImportResponse;
      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(`El servidor respondió con HTTP ${response.status}.`);
      }
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? data.mensaje ?? "No fue posible importar el manifiesto.");
      }
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar el manifiesto.");
    } finally {
      setImportando(false);
    }
  };

  const limpiar = () => {
    setArchivo(null);
    setPreview(null);
    setResultado(null);
    setError("");
    setBusqueda("");
    setSoloAlertas(false);
    setMostrarWarnings(false);
    const input = document.getElementById("archivo-manifiesto") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const casasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (preview?.casas ?? []).filter((house) => {
      const texto = [
        house.numeroHouse ?? house.house,
        house.naturalezaCantidad,
        house.remitenteNombre,
        house.destinatarioNombre,
        house.destinatarioCarnet,
        house.telefonoDestinatario,
        house.direccionDestinatario,
        house.unidadDestino,
      ].filter(Boolean).join(" ").toLowerCase();
      const alerta = !house.destinatarioNombre || !house.direccionDestinatario;
      return (!q || texto.includes(q)) && (!soloAlertas || alerta);
    });
  }, [preview?.casas, busqueda, soloAlertas]);

  const d = preview?.direcciones;
  const geo = resultado?.estadisticas;
  const resultadoPositivo = (geo?.direccionesGeocodificadas ?? 0) + (geo?.direccionesReutilizadas ?? 0);
  const resultadoTotal = resultadoPositivo + (geo?.direccionesPendientes ?? 0);
  const coberturaFinal = resultadoTotal ? Math.round((resultadoPositivo / resultadoTotal) * 100) : 0;
  const warnings = [...(preview?.warnings ?? []), ...(d?.warnings ?? [])];

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-16 text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Dashboard</a>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xl text-white">⇧</div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Centro de Control de Importación</h1>
                <p className="mt-1 text-sm text-slate-500">Valida, importa y audita cada manifiesto desde un único lugar.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> API de importación conectada</div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <label htmlFor="archivo-manifiesto" className="group flex min-h-[190px] cursor-pointer flex-col justify-center border-b border-slate-200 p-7 hover:bg-slate-50 lg:border-b-0 lg:border-r">
              <input id="archivo-manifiesto" type="file" accept=".xlsx,.xls,.csv" onChange={seleccionarArchivo} className="hidden" />
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl">📄</div>
                <div>
                  <p className="text-lg font-bold">Seleccionar manifiesto</p>
                  <p className="mt-1 text-sm text-slate-500">XLSX, XLS o CSV. Al seleccionarlo iniciaremos la validación automáticamente.</p>
                  <span className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Elegir archivo</span>
                </div>
              </div>
            </label>
            <div className="flex min-h-[190px] flex-col justify-center p-7">
              {archivo ? <>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Archivo en análisis</div>
                <div className="mt-2 break-all text-lg font-bold">{archivo.name}</div>
                <div className="mt-1 text-sm text-slate-500">{(archivo.size / 1024).toFixed(1)} KB · {archivo.type || "tipo detectado por extensión"}</div>
                <button type="button" onClick={limpiar} className="mt-5 w-fit rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cambiar / limpiar</button>
              </> : <>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Flujo operativo</div>
                <p className="mt-2 text-base font-semibold">Archivo → validación → importación → personas → direcciones</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">El sistema mostrará los resultados reales devueltos por la API.</p>
              </>}
            </div>
          </div>
        </section>

        {cargandoPreview && <StatusBanner tone="blue" title="Analizando manifiesto" text="Leyendo estructura, identificando Houses, personas, bultos y preparando el diagnóstico de direcciones..." spinner />}
        {error && <StatusBanner tone="red" title="No se pudo completar la operación" text={error} />}

        {preview?.ok && preview.total && <>
          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi label="Master AWB" value={preview.metadata?.masterAwb ?? "No detectado"} detail={preview.metadata?.fecha ? formatDate(preview.metadata.fecha) : "Fecha no detectada"} />
            <Kpi label="Houses" value={preview.total.cantidadHouses} detail={`${preview.registros ?? preview.total.cantidadHouses} filas reconocidas`} />
            <Kpi label="Bultos" value={preview.total.cantidadSacas} detail="Total declarado" />
            <Kpi label="Personas" value={preview.total.cantidadPersonas} detail="Total declarado" />
            <Kpi label="Peso total" value={`${Number(preview.total.pesoTotalKg ?? 0).toFixed(2)} kg`} detail="Peso declarado" />
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">Diagnóstico previo a importación</h2><Badge tone={preview.archivo?.duplicado ? "amber" : "green"}>{preview.archivo?.duplicado ? "DUPLICADO" : "LISTO PARA IMPORTAR"}</Badge></div>
                <p className="mt-1 text-sm text-slate-500">La API ya comprobó la estructura y consultó el estado de las direcciones existentes sin ejecutar geocodificación.</p>
              </div>
              <div className="flex flex-wrap gap-2"><InfoPill label="Agente" value={preview.metadata?.agenteTransitario ?? "—"} /><InfoPill label="Origen" value={preview.metadata?.paisOrigen ?? "—"} /><InfoPill label="Consignatario" value={preview.metadata?.consignatario ?? "—"} /></div>
            </div>

            {preview.archivo?.duplicado && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Este manifiesto ya fue importado.</strong> Master AWB: {preview.duplicado?.masterAwb ?? "—"}.</div>}

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Stage title="Archivo" text="Recibido" done />
              <Stage title="Parser" text="Estructura válida" done />
              <Stage title="Personas" text={`${preview.total.cantidadPersonas} declaradas`} done />
              <Stage title="Direcciones" text={d ? `${d.total} con dirección` : "Analizando"} done={!!d} />
              <Stage title="Geocodificación" text={d ? "Preparación lista" : "Pendiente"} done={!!d} />
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-900 bg-slate-950 p-6 text-white shadow-lg">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><h2 className="text-xl font-bold">Inteligencia de direcciones</h2></div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Antes de importar puedes saber exactamente cuántas direcciones ya existen, cuáles pueden reutilizarse, cuáles deberán geocodificarse y cuántas no tienen dirección.</p>
                {d && <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.min(100, d.cobertura)}%` }} /></div>}
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-[650px] xl:grid-cols-4">
                <DarkMetric label="Cobertura" value={d ? `${d.cobertura}%` : "—"} />
                <DarkMetric label="Reutilizables" value={d?.reutilizables ?? "—"} />
                <DarkMetric label="Nuevas" value={d?.nuevas ?? "—"} />
                <DarkMetric label="Pendientes" value={d?.pendientesGeocodificacion ?? "—"} />
              </div>
            </div>
            {d && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <DarkMetric label="Direcciones" value={d.total} />
              <DarkMetric label="Encontradas" value={d.encontradas} />
              <DarkMetric label="Sin dirección" value={d.sinDireccion} />
              <DarkMetric label="Personas con dirección" value={d.personasConDireccion} />
              <DarkMetric label="Personas sin dirección" value={d.personasSinDireccion} />
            </div>}
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div><h2 className="text-lg font-bold">Houses detectados</h2><p className="mt-1 text-sm text-slate-500">{casasFiltradas.length} de {(preview.casas ?? []).length} registros visibles.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row"><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar House, persona, carnet, dirección..." className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 sm:w-80" /><button type="button" onClick={() => setSoloAlertas((v) => !v)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${soloAlertas ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-300 bg-white text-slate-700"}`}>{soloAlertas ? "Mostrando alertas" : "Solo alertas"}</button></div>
            </div>
            <div className="max-h-[620px] overflow-auto"><table className="min-w-[1250px] w-full text-left text-sm"><thead className="sticky top-0 z-10 bg-slate-100 text-[11px] uppercase tracking-wider text-slate-500"><tr>{["House","Naturaleza","Peso","Bultos","Remitente","Destinatario","Identificación","Dirección","Estado","Destino"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
              {casasFiltradas.map((house, index) => { const numero = house.numeroHouse ?? house.house ?? "—"; const incompleto = !house.destinatarioNombre || !house.direccionDestinatario; return <tr key={`${numero}-${index}`} className="align-top hover:bg-slate-50"><td className="whitespace-nowrap px-4 py-3 font-bold">{numero}</td><td className="max-w-[220px] px-4 py-3 text-slate-600">{house.naturalezaCantidad ?? "—"}</td><td className="whitespace-nowrap px-4 py-3">{Number(house.pesoKg ?? 0).toFixed(2)} kg</td><td className="px-4 py-3">{Number(house.bultos ?? house.cantidadBultos ?? 0)}</td><td className="min-w-[190px] px-4 py-3">{house.remitenteNombre ?? "—"}</td><td className="min-w-[190px] px-4 py-3 font-medium">{house.destinatarioNombre ?? "—"}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{house.destinatarioCarnet ?? "—"}</td><td className="min-w-[260px] px-4 py-3 text-slate-600">{house.direccionDestinatario ?? "—"}</td><td className="whitespace-nowrap px-4 py-3"><Badge tone={incompleto ? "amber" : "green"}>{incompleto ? "REVISAR" : "DATOS OK"}</Badge></td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{house.unidadDestino ?? "—"}</td></tr>; })}
              {casasFiltradas.length === 0 && <tr><td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-500">No hay Houses que coincidan con el filtro.</td></tr>}
            </tbody></table></div>
          </section>

          {warnings.length > 0 && <section className="mt-6 overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/70"><button type="button" onClick={() => setMostrarWarnings((v) => !v)} className="flex w-full items-center justify-between p-5 text-left"><div><div className="font-bold text-amber-950">Advertencias y observaciones</div><div className="mt-1 text-sm text-amber-800">{warnings.length} observaciones devueltas por la validación.</div></div><span className="text-xl text-amber-700">{mostrarWarnings ? "−" : "+"}</span></button>{mostrarWarnings && <ul className="border-t border-amber-200 px-5 pb-5 pt-3 space-y-2 text-sm text-amber-900">{warnings.map((w, i) => <li key={i} className="flex gap-2"><span>•</span><span>{w}</span></li>)}</ul>}</section>}

          <section className="mt-6 rounded-3xl border border-slate-900 bg-slate-950 p-6 text-white shadow-lg"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-bold">Confirmar importación</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Se crearán las guías y paquetes, se resolverán las personas y se procesarán las direcciones. La geocodificación real se ejecutará durante la importación.</p></div><button type="button" disabled={importando || !!preview.archivo?.duplicado} onClick={importarManifiesto} className="min-w-[220px] rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">{importando ? "Importando..." : preview.archivo?.duplicado ? "Manifiesto duplicado" : "Importar manifiesto"}</button></div></section>
        </>}

        {importando && <StatusBanner tone="blue" title="Importación en curso" text="Creando guías y paquetes, resolviendo personas y procesando direcciones con LocationIQ. No cierre esta ventana." spinner />}

        {resultado?.ok && resultado.manifiesto && <section className="mt-8 space-y-5"><div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm"><div className="border-b border-emerald-100 bg-emerald-50 p-6"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-emerald-950">✓ Operación completada</h2><p className="mt-2 text-sm text-emerald-800">{resultado.mensaje ?? "Manifiesto importado correctamente."}</p></div><Badge tone="green">IMPORTADO</Badge></div></div><div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-5"><Kpi label="Master AWB" value={resultado.manifiesto.masterAwb} detail="Identificador maestro" /><Kpi label="Houses / Guías" value={resultado.manifiesto.cantidadHouse} detail={`${geo?.guias ?? 0} guías creadas`} /><Kpi label="Bultos / Paquetes" value={resultado.manifiesto.totalSacas} detail={`${geo?.paquetes ?? 0} paquetes creados`} /><Kpi label="Personas" value={resultado.manifiesto.totalPersonas} detail={`${geo?.personasVerificadas ?? 0} verificadas`} /><Kpi label="Peso total" value={`${Number(resultado.manifiesto.pesoTotalKg).toFixed(2)} kg`} detail="Registrado" /></div></div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-bold">Trazabilidad de la operación</h3><div className="mt-6 space-y-4"><ResultStage title="Lectura y validación" text="Manifiesto parseado y validado" /><ResultStage title="Guías" text={`${geo?.guias ?? 0} guías creadas`} /><ResultStage title="Paquetes" text={`${geo?.paquetes ?? 0} paquetes creados`} /><ResultStage title="Personas" text={`${geo?.personasVerificadas ?? 0} personas únicas verificadas`} /><ResultStage title="Direcciones" text={`${resultadoPositivo} ubicaciones encontradas/reutilizadas · ${geo?.direccionesPendientes ?? 0} pendientes`} /></div></section><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-bold">Inteligencia de direcciones</h3><p className="mt-1 text-sm text-slate-500">Resultado real de geocodificación.</p><div className="mt-6 text-center"><div className="text-5xl font-black">{coberturaFinal}%</div><div className="text-xs font-bold uppercase tracking-widest text-slate-400">Cobertura con resultado</div></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${coberturaFinal}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Geocodificadas" value={geo?.direccionesGeocodificadas ?? 0} /><Metric label="Reutilizadas" value={geo?.direccionesReutilizadas ?? 0} /><Metric label="Encontradas" value={geo?.direccionesEncontradas ?? 0} /><Metric label="Pendientes" value={geo?.direccionesPendientes ?? 0} /></div></section></div>
          {(resultado.warnings ?? []).length > 0 && <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><div className="font-bold text-amber-950">Advertencias / pendientes</div><ul className="mt-4 max-h-64 space-y-2 overflow-auto text-sm text-amber-950">{resultado.warnings!.map((w, i) => <li key={i}>• {w}</li>)}</ul></section>}
          <div className="flex justify-end gap-3"><button type="button" onClick={limpiar} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700">Importar otro manifiesto</button><a href="/dashboard" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Volver al dashboard</a></div>
        </section>}
      </div>
    </main>
  );
}

function Kpi({ label, value, detail }: { label: string; value: string | number; detail?: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</div><div className="mt-2 break-words text-2xl font-black tracking-tight">{value}</div>{detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}</div>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-1 text-xl font-black">{value}</div></div>; }
function DarkMetric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div><div className="mt-1 text-xl font-black text-white">{value}</div></div>; }
function Stage({ title, text, done }: { title: string; text: string; done: boolean }) { return <div className={`rounded-2xl border p-4 ${done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center gap-3"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${done ? "bg-emerald-600" : "bg-slate-300"}`}>{done ? "✓" : ""}</div><div><div className="font-bold">{title}</div><div className="text-xs text-slate-500">{text}</div></div></div></div>; }
function ResultStage({ title, text }: { title: string; text: string }) { return <div className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">✓</div><div><div className="font-semibold">{title}</div><div className="text-sm text-slate-500">{text}</div></div></div>; }
function InfoPill({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-0.5 max-w-[220px] truncate text-xs font-semibold text-slate-700">{value}</div></div>; }
function Badge({ tone, children }: { tone: Exclude<Tone, "blue" | "red">; children: React.ReactNode }) { const styles = tone === "green" ? "bg-emerald-100 text-emerald-800" : tone === "amber" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"; return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${styles}`}>{children}</span>; }
function StatusBanner({ tone, title, text, spinner }: { tone: "blue" | "red"; title: string; text: string; spinner?: boolean }) { const styles = tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-950" : "border-red-200 bg-red-50 text-red-950"; return <section className={`mt-6 rounded-2xl border p-5 ${styles}`}><div className="flex gap-3"><div>{spinner ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : "⚠"}</div><div><div className="font-bold">{title}</div><div className="mt-1 text-sm opacity-80">{text}</div></div></div></section>; }
function formatDate(value: string) { const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(date); }
