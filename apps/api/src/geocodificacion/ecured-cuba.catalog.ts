export const ECURED_CUBA_PROVINCES = [
  'Pinar del Río',
  'Artemisa',
  'La Habana',
  'Mayabeque',
  'Matanzas',
  'Cienfuegos',
  'Villa Clara',
  'Sancti Spíritus',
  'Ciego de Ávila',
  'Camagüey',
  'Las Tunas',
  'Holguín',
  'Granma',
  'Santiago de Cuba',
  'Guantánamo',
  'Isla de la Juventud',
] as const;

export interface EcuredTerritoryRow {
  municipio: string;
  valores: string[];
}

export interface EcuredProvinceCatalog {
  provincia: string;
  url: string;
  localidades: EcuredTerritoryRow[];
  consejosPopulares: EcuredTerritoryRow[];
}

export function ecuredLocalidadesUrl(provincia: string): string {
  return `https://www.ecured.cu/Localidades_de_${encodeURIComponent(provincia).replace(/%20/g, '_')}`;
}

export function normalizarTerritorio(valor: string): string {
  return valor
    .replace(/\u00a0/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extraerTextoHtml(fragmento: string): string {
  return decodeHtmlEntities(
    fragmento
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export function extraerEnlaces(fragmento: string): string[] {
  const valores: string[] = [];
  const patron = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let coincidencia: RegExpExecArray | null;

  while ((coincidencia = patron.exec(fragmento))) {
    const texto = extraerTextoHtml(coincidencia[1]);
    if (texto) valores.push(texto);
  }

  return [...new Set(valores)];
}

export function extraerTablaTerritorial(
  html: string,
  seccion: 'Localidades' | 'Consejos Populares',
): EcuredTerritoryRow[] {
  const encabezado = new RegExp(
    `<span[^>]*class=["']mw-headline["'][^>]*>${seccion}<\\/span>`,
    'i',
  ).exec(html);

  if (!encabezado) return [];

  const resto = html.slice(encabezado.index + encabezado[0].length);
  const tabla = /<table\b[\s\S]*?<\/table>/i.exec(resto)?.[0];
  if (!tabla) return [];

  const filas: EcuredTerritoryRow[] = [];
  const patronFila = /<tr\b[\s\S]*?<\/tr>/gi;
  let fila: RegExpExecArray | null;

  while ((fila = patronFila.exec(tabla))) {
    const celdas = [...fila[0].matchAll(/<td\b[\s\S]*?<\/td>/gi)].map(
      (match) => match[0],
    );

    if (celdas.length < 2) continue;

    const municipio = extraerEnlaces(celdas[0])[0] ?? extraerTextoHtml(celdas[0]);
    const valores = extraerEnlaces(celdas[1]);

    if (municipio && valores.length) {
      filas.push({ municipio, valores: [...new Set(valores)] });
    }
  }

  return filas;
}

export function parsearPaginaEcured(
  provincia: string,
  html: string,
): EcuredProvinceCatalog {
  return {
    provincia,
    url: ecuredLocalidadesUrl(provincia),
    localidades: extraerTablaTerritorial(html, 'Localidades'),
    consejosPopulares: extraerTablaTerritorial(html, 'Consejos Populares'),
  };
}

function decodeHtmlEntities(valor: string): string {
  return valor
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, numero: string) =>
      String.fromCodePoint(Number(numero)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, numero: string) =>
      String.fromCodePoint(parseInt(numero, 16)),
    );
}
