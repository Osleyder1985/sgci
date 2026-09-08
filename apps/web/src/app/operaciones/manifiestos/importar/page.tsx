"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

interface HousePreview {
  numeroHouse?: string;
  house?: string;
  destinatarioNombre?: string;
  destinatarioCarnet?: string | null;
  direccionDestinatario?: string | null;
  unidadDestino?: string | null;
}
interface PreviewResponse {
  ok: boolean;
  mensaje?: string;
  archivo?: { nombre: string; hash: string; duplicado: boolean };
  metadata?: { masterAwb?: string | null; fecha?: string | null; agenteTransitario?: string | null; paisOrigen?: string | null; consignatario?: string | null };
  total?: { cantidadHouses: number; cantidadSacas: number; cantidadPersonas: number; pesoTotalKg: number };
  registros?: number;
  casas?: HousePreview[];
  direcciones?: { total: number; cobertura: number };
}
interface Progress {
  jobId: string;
  stage: "queued" | "parsing" | "creating_guides" | "processing_addresses" | "completed" | "failed";
  status: "running" | "completed" | "failed";
  message: string;
  totalHouses: number;
  processedHouses: number;
  totalPeople: number;
  processedPeople: number;
  totalAddresses: number;
  processedAddresses: number;
  addressesGeocoded: number;
  addressesReused: number;
  addressesNotFound: number;
  addressesReview: number;
  errors: number;
  currentAddress: string | null;
  coverage: number;
  error: string | null;
}
interface GeocodingDetail { estado: "NO_ENCONTRADA" | "REQUIERE_REVISION"; nombre: string; direccion: string; motivo: string }
interface GeocodingDetailsResponse { ok: boolean; jobId: string; total: number; noEncontradas: number; revision: number; detalles: GeocodingDetail[] }
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ImportarManifiestoPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [details, setDetails] = useState<GeocodingDetailsResponse | null>(null);
  const [detailFilter, setDetailFilter] = useState<"ALL" | "NO_ENCONTRADA" | "REQUIERE_REVISION">("ALL");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setArchivo(file); setPreview(null); setProgress(null); setDetails(null); setError("");
    if (file) await loadPreview(file);
  };
  const loadPreview = async (file: File) => {
    setLoading(true);
    try {
      const body = new FormData(); body.append("archivo", file);
      const response = await fetch(`${apiUrl}/api/guias/importar/preview`, { method: "POST", body });
      const data = (await response.json().catch(() => null)) as PreviewResponse | null;
      if (!response.ok || !data?.ok) throw new Error(data?.mensaje ?? `El servidor respondió HTTP ${response.status}.`);
      setPreview(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible analizar el manifiesto."); }
    finally { setLoading(false); }
  };
  const startImport = async () => {
    if (!archivo) return setError("Seleccione un archivo de manifiesto.");
    setStarting(true); setError("");
    try {
      const body = new FormData(); body.append("archivo", archivo);
      const response = await fetch(`${apiUrl}/api/guias/importar/job`, { method: "POST", body });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; jobId?: string; progress?: Progress; message?: string } | null;
      if (!response.ok || !data?.ok || !data.jobId) throw new Error(data?.message ?? `No fue posible iniciar la importación (HTTP ${response.status}).`);
      setProgress(data.progress ?? null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible iniciar la importación."); }
    finally { setStarting(false); }
  };
  const loadDetails = async (filter: "ALL" | "NO_ENCONTRADA" | "REQUIERE_REVISION") => {
    if (!progress?.jobId) return;
    setLoadingDetails(true); setDetailFilter(filter);
    try {
      const response = await fetch(`${apiUrl}/api/guias/importar/job/${progress.jobId}/geocodificacion`, { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as GeocodingDetailsResponse | null;
      if (!response.ok || !data?.ok) throw new Error("No fue posible cargar los detalles de geocodificación.");
      setDetails(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar los detalles de geocodificación."); }
    finally { setLoadingDetails(false); }
  };
  useEffect(() => {
    if (!progress?.jobId || progress.status !== "running") return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/guias/importar/job/${progress.jobId}`, { cache: "no-store" });
        if (response.ok) setProgress((await response.json() as { progress: Progress }).progress);
      } catch { /* conserva el último estado */ }
    }, 900);
    return () => window.clearInterval(timer);
  }, [progress?.jobId, progress?.status]);

  const houses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (preview?.casas ?? []).filter((house) => !q || [house.numeroHouse ?? house.house, house.destinatarioNombre, house.destinatarioCarnet, house.direccionDestinatario, house.unidadDestino].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [preview?.casas, query]);
  const filteredDetails = details?.detalles.filter((item) => detailFilter === "ALL" || item.estado === detailFilter) ?? [];
  const reset = () => { setArchivo(null); setPreview(null); setProgress(null); setDetails(null); setError(""); const input = document.getElementById("archivo-manifiesto") as HTMLInputElement | null; if (input) input.value = ""; };
  const p = progress;
  const housePct = p?.totalHouses ? Math.round((p.processedHouses / p.totalHouses) * 100) : 0;
  const addressPct = p?.totalAddresses ? Math.round((p.processedAddresses / p.totalAddresses) * 100) : 0;
  const geocodingDone = !!p && p.status === "completed" && p.processedAddresses >= p.totalAddresses;

  return <main className="min-h-screen bg-[#f4f7fb] pb-16 text-slate-900"><div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
    <header className="mb-6"><a href="/dashboard" className="text-sm font-medium text-slate-500">← Dashboard</a><h1 className="mt-3 text-3xl font-black tracking-tight">Centro de Control de Importación</h1><p className="mt-1 text-sm text-slate-500">Validación, ejecución y trazabilidad en tiempo real.</p></header>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><input id="archivo-manifiesto" type="file" accept=".xlsx,.xls,.csv" onChange={selectFile} className="hidden" /><label htmlFor="archivo-manifiesto" className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 p-7 hover:bg-slate-50"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Entrada operacional</div><div className="mt-2 text-xl font-black">{archivo?.name ?? "Seleccionar manifiesto"}</div><p className="mt-1 text-sm text-slate-500">XLSX, XLS o CSV. La validación comienza automáticamente.</p></label>{archivo && !p && <div className="mt-4 flex justify-end"><button type="button" disabled={starting || !!preview?.archivo?.duplicado} onClick={startImport} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-50">{starting ? "Iniciando…" : preview?.archivo?.duplicado ? "Manifiesto duplicado" : "Importar y monitorizar"}</button></div>}</section>
    {loading && <Banner text="Analizando manifiesto…" />}{error && <Banner text={error} red />}
    {preview?.ok && preview.total && !p && <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Kpi label="Master AWB" value={preview.metadata?.masterAwb ?? "—"}/><Kpi label="Houses" value={preview.total.cantidadHouses}/><Kpi label="Bultos" value={preview.total.cantidadSacas}/><Kpi label="Personas" value={preview.total.cantidadPersonas}/><Kpi label="Peso total" value={`${Number(preview.total.pesoTotalKg).toFixed(2)} kg`}/></div>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Diagnóstico antes de ejecutar</h2><div className="mt-5 grid gap-3 md:grid-cols-5"><Stage title="Archivo" text="Recibido" done/><Stage title="Parser" text="Estructura válida" done/><Stage title="Personas" text={`${preview.total.cantidadPersonas} declaradas`} done/><Stage title="Direcciones" text={`${preview.direcciones?.total ?? 0} diagnosticadas`} done={!!preview.direcciones}/><Stage title="Geocodificación" text="Se ejecutará al importar" done={false}/></div></section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black">Houses detectados</h2><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar persona, carnet o dirección…" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"/></div><div className="mt-4 max-h-[520px] overflow-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500"><tr>{["House","Destinatario","Carnet","Dirección","Destino"].map((title)=><th key={title} className="px-4 py-3">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{houses.map((house,index)=><tr key={`${house.numeroHouse ?? house.house}-${index}`}><td className="px-4 py-3 font-black">{house.numeroHouse ?? house.house ?? "—"}</td><td className="px-4 py-3 font-bold">{house.destinatarioNombre ?? "—"}</td><td className="px-4 py-3">{house.destinatarioCarnet ?? "—"}</td><td className="min-w-[320px] px-4 py-3 text-slate-600">{house.direccionDestinatario ?? "—"}</td><td className="px-4 py-3">{house.unidadDestino ?? "—"}</td></tr>)}</tbody></table></div></section>
    </>}
    {p && <section className="mt-6 space-y-5">
      <section className={`rounded-3xl border p-6 shadow-sm ${p.status === "completed" ? "border-emerald-200 bg-emerald-50" : p.status === "failed" ? "border-red-200 bg-red-50" : "border-blue-200 bg-white"}`}><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-black">{p.status === "completed" ? "Operación completada" : p.status === "failed" ? "Operación con errores" : "Importación en curso"}</h2><p className="mt-1 text-sm text-slate-600">{p.message}</p></div><Stage title="Geocodificación" done={geocodingDone} text={geocodingDone ? "Completada" : p.stage === "processing_addresses" ? `${addressPct}% procesada` : "Pendiente"}/></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="Houses" value={`${p.processedHouses} / ${p.totalHouses}`} detail={`${housePct}%`}/><Kpi label="Personas" value={`${p.processedPeople} / ${p.totalPeople}`}/><Kpi label="Direcciones" value={`${p.processedAddresses} / ${p.totalAddresses}`} detail={`${addressPct}%`}/><Kpi label="Cobertura" value={`${p.coverage}%`} detail={`${p.addressesGeocoded + p.addressesReused} con resultado`}/></div>{p.currentAddress && <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-950">Dirección actualmente procesada: {p.currentAddress}</div>}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-black">Resultado de direcciones</h3><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Kpi label="Geocodificadas" value={p.addressesGeocoded}/><Kpi label="Reutilizadas" value={p.addressesReused}/><button type="button" onClick={()=>void loadDetails("NO_ENCONTRADA")} className="rounded-2xl bg-slate-50 p-4 text-left hover:bg-amber-50"><div className="text-xs font-black uppercase tracking-widest text-slate-400">No encontradas</div><div className="mt-1 text-2xl font-black">{p.addressesNotFound}</div><div className="text-xs text-slate-500">Ver las direcciones</div></button><button type="button" onClick={()=>void loadDetails("REQUIERE_REVISION")} className="rounded-2xl bg-slate-50 p-4 text-left hover:bg-red-50"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Revisión</div><div className="mt-1 text-2xl font-black">{p.addressesReview}</div><div className="text-xs text-slate-500">Ver el caso</div></button></div></section>
      {loadingDetails && <Banner text="Cargando detalles de geocodificación…"/>}
      {details && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black">Detalle de geocodificación</h3><p className="mt-1 text-sm text-slate-500">Casos persistidos y asociados al job.</p></div><div className="flex gap-2"><button type="button" onClick={()=>setDetailFilter("ALL")} className="rounded-xl border px-3 py-2 text-xs font-bold">Todos ({details.total})</button><button type="button" onClick={()=>setDetailFilter("NO_ENCONTRADA")} className="rounded-xl border px-3 py-2 text-xs font-bold">No encontradas ({details.noEncontradas})</button><button type="button" onClick={()=>setDetailFilter("REQUIERE_REVISION")} className="rounded-xl border px-3 py-2 text-xs font-bold">Revisión ({details.revision})</button></div></div><div className="mt-5 space-y-3">{filteredDetails.length === 0 ? <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No hay casos para este filtro.</div> : filteredDetails.map((item,index)=><article key={`${item.estado}-${item.direccion}-${index}`} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${item.estado === "NO_ENCONTRADA" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{item.estado === "NO_ENCONTRADA" ? "NO ENCONTRADA" : "REQUIERE REVISIÓN"}</span><span className="font-bold">{item.nombre}</span></div><div className="mt-2 text-sm font-semibold">{item.direccion}</div><div className="mt-1 text-xs text-slate-500">{item.motivo}</div></article>)}</div></section>}
      {p.error && <Banner text={p.error} red/>}{p.status !== "running" && <div className="flex justify-end"><button type="button" onClick={reset} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Importar otro manifiesto</button></div>}
    </section>}
  </div></main>;
}

function Kpi({label,value,detail}:{label:string;value:string|number;detail?:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</div><div className="mt-2 break-words text-2xl font-black">{value}</div>{detail&&<div className="mt-1 text-xs text-slate-500">{detail}</div>}</div>}
function Stage({title,text,done}:{title:string;text:string;done:boolean}){return <div className={`rounded-2xl border p-4 ${done?"border-emerald-200 bg-emerald-50":"border-slate-200 bg-slate-50"}`}><div className="flex items-center gap-3"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white ${done?"bg-emerald-600":"bg-slate-300"}`}>{done?"✓":"·"}</div><div><div className="font-black">{title}</div><div className="text-xs text-slate-500">{text}</div></div></div></div>}
function Banner({text,red=false}:{text:string;red?:boolean}){return <div className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${red?"border-red-200 bg-red-50 text-red-900":"border-blue-200 bg-blue-50 text-blue-900"}`}>{text}</div>}