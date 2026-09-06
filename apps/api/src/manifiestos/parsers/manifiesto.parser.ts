// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/manifiestos/parsers/manifiesto.parser.ts
//
// Descripción:
//   Parser responsable de leer y transformar manifiestos XLSX, XLS o CSV.
//
// Reglas:
//   - Detecta automáticamente la fila de encabezados.
//   - Detecta las columnas aunque tengan pequeñas variaciones de nombre.
//   - Ignora la fila TOTAL del Excel.
//   - Calcula peso total únicamente sobre Houses reales.
//   - Calcula personas por combinación NOMBRE + CARNET/CI.
//   - Conserva el total de personas declarado por el manifiesto.
//   - Genera warnings cuando los totales declarados no coinciden.
// ================================================================================

import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';

// ================================================================================
// TIPOS
// ================================================================================

type MatrixRow = unknown[];

interface ColumnMap {
  house: number;
  naturalezaCantidad: number;
  peso: number;
  bultos: number;
  remitente: number;
  pasaporte: number;
  destinatario: number;
  carnet: number;
  telefono: number;
  direccion: number;
  estadoCobroOrigen: number;
  unidadDestino: number;
}

export interface ManifiestoHouse {
  numeroHouse: string | null;
  naturalezaCantidad: string | null;
  pesoKg: number;
  bultos: number;
  remitenteNombre: string | null;
  remitentePasaporte: string | null;
  destinatarioNombre: string | null;
  destinatarioCarnet: string | null;
  telefonoDestinatario: string | null;
  direccionDestinatario: string | null;
  estadoCobroOrigen: number | null;
  unidadDestino: string | null;
}

export interface ManifiestoMetadata {
  agenteTransitario: string | null;
  fecha: Date | null;
  paisOrigen: string | null;
  consignatario: string | null;
  masterAwb: string | null;
  cantidadHouseDeclarada: number | null;
  totalSacasDeclarado: number | null;
  totalPersonasDeclarado: number | null;
}

export interface ManifiestoTotal {
  cantidadHouses: number;
  cantidadSacas: number;
  cantidadPersonas: number;
  pesoTotalKg: number;
}

export interface ManifiestoParsed {
  metadata: ManifiestoMetadata;
  rows: ManifiestoHouse[];
  total: ManifiestoTotal;
  warnings: string[];
}

// ================================================================================
// PARSER
// ================================================================================

@Injectable()
export class ManifiestoParser {
  private readonly logger = new Logger(ManifiestoParser.name);

  // ==============================================================================
  // MÉTODO PRINCIPAL
  // ==============================================================================

  parse(buffer: Buffer, originalname?: string): ManifiestoParsed {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('El archivo del manifiesto está vacío o es inválido.');
    }

    this.logger.log(
      `Procesando manifiesto: ${originalname ?? 'archivo sin nombre'}`,
    );

    let workbook: XLSX.WorkBook;

    try {
      workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true,
        raw: true,
      });
    } catch (error) {
      throw new Error(
        `No fue posible leer el archivo del manifiesto: ${this.errorMessage(error)}`,
      );
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('El archivo no contiene hojas de cálculo.');
    }

    // ============================================================================
    // SELECCIONAR HOJA
    // ============================================================================

    const sheetName =
      workbook.SheetNames.find(
        (name) => this.normalizeText(name) === 'MANIFIESTO',
      ) ?? workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error(`No fue posible acceder a la hoja "${sheetName}".`);
    }

    const matrix = XLSX.utils.sheet_to_json<MatrixRow>(sheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    if (!matrix.length) {
      throw new Error('La hoja del manifiesto está vacía.');
    }

    this.logger.log(`Hoja seleccionada: ${sheetName}. Filas: ${matrix.length}`);

    // ============================================================================
    // BUSCAR ENCABEZADO
    // ============================================================================

    const headerRowIndex = this.findHeaderRow(matrix);

    if (headerRowIndex < 0) {
      throw new Error(
        'No fue posible identificar la fila de encabezados del manifiesto.',
      );
    }

    const header = matrix[headerRowIndex];

    this.logger.log(`Fila de encabezados detectada: ${headerRowIndex + 1}`);

    // ============================================================================
    // RESOLVER COLUMNAS
    // ============================================================================

    const columns = this.resolveColumns(header);

    // ============================================================================
    // VALIDACIONES DE COLUMNAS OBLIGATORIAS
    // ============================================================================

    if (columns.house < 0) {
      throw new Error('No se encontró la columna HOUSE en el manifiesto.');
    }

    if (columns.peso < 0) {
      throw new Error('No se encontró la columna PESO en el manifiesto.');
    }

    if (columns.destinatario < 0) {
      throw new Error(
        'No se encontró la columna DESTINATARIO en el manifiesto.',
      );
    }

    // ============================================================================
    // METADATA
    // ============================================================================

    const metadata = this.extractMetadata(matrix.slice(0, headerRowIndex));

    // ============================================================================
    // PROCESAR HOUSES
    // ============================================================================

    const rows: ManifiestoHouse[] = [];

    for (
      let rowIndex = headerRowIndex + 1;
      rowIndex < matrix.length;
      rowIndex++
    ) {
      const row = matrix[rowIndex];

      if (!row || this.isEmptyRow(row)) {
        continue;
      }

      if (this.isTotalRow(row, columns, rowIndex, matrix.length)) {
        this.logger.log(`Fila TOTAL ignorada: ${rowIndex + 1}`);
        continue;
      }

      const house = this.parseHouse(row, columns);

      if (!house.numeroHouse) {
        this.logger.warn(
          `Fila ${rowIndex + 1} ignorada: no contiene número de House.`,
        );
        continue;
      }

      rows.push(house);
    }

    // ============================================================================
    // TOTALES CALCULADOS
    // ============================================================================

    const cantidadHouses = rows.length;

    const cantidadSacas = rows.reduce(
      (total, house) => total + this.safeInteger(house.bultos, 0),
      0,
    );

    const pesoTotalKg = this.roundNumber(
      rows.reduce(
        (total, house) => total + this.safeNumber(house.pesoKg, 0),
        0,
      ),
      2,
    );

    // ============================================================================
    // PERSONAS
    // ============================================================================

    const personas = new Set<string>();

    for (const house of rows) {
      const nombre = this.normalizeIdentity(house.destinatarioNombre);

      const carnet = this.normalizeIdentity(house.destinatarioCarnet);

      if (!nombre && !carnet) {
        continue;
      }

      personas.add(`${nombre}|${carnet}`);
    }

    const cantidadPersonas = personas.size;

    // ============================================================================
    // TOTAL
    // ============================================================================

    const total: ManifiestoTotal = {
      cantidadHouses,
      cantidadSacas,
      cantidadPersonas,
      pesoTotalKg,
    };

    // ============================================================================
    // WARNINGS
    // ============================================================================

    const warnings: string[] = [];

    // ----------------------------------------------------------------------------
    // HOUSES
    // ----------------------------------------------------------------------------

    if (
      metadata.cantidadHouseDeclarada !== null &&
      metadata.cantidadHouseDeclarada !== cantidadHouses
    ) {
      warnings.push(
        `Inconsistencia de Houses: el manifiesto declara ${metadata.cantidadHouseDeclarada}, pero se encontraron ${cantidadHouses}.`,
      );
    }

    // ----------------------------------------------------------------------------
    // SACAS
    // ----------------------------------------------------------------------------

    if (
      metadata.totalSacasDeclarado !== null &&
      metadata.totalSacasDeclarado !== cantidadSacas
    ) {
      warnings.push(
        `Inconsistencia de sacas: el manifiesto declara ${metadata.totalSacasDeclarado}, pero se encontraron ${cantidadSacas}.`,
      );
    }

    // ----------------------------------------------------------------------------
    // PERSONAS
    // ----------------------------------------------------------------------------

    if (
      metadata.totalPersonasDeclarado !== null &&
      metadata.totalPersonasDeclarado !== cantidadPersonas
    ) {
      const diferencia = metadata.totalPersonasDeclarado - cantidadPersonas;

      warnings.push(
        `Personas declaradas en manifiesto: ${metadata.totalPersonasDeclarado}. Personas encontradas/calculadas: ${cantidadPersonas}. Diferencia: ${diferencia}.`,
      );
    }

    // ============================================================================
    // LOG FINAL
    // ============================================================================

    this.logger.log(
      `Manifiesto procesado correctamente. ` +
        `Master AWB=${metadata.masterAwb ?? '-'} | ` +
        `Houses=${cantidadHouses} | ` +
        `Bultos=${cantidadSacas} | ` +
        `Personas=${cantidadPersonas} | ` +
        `Peso=${pesoTotalKg} kg`,
    );

    if (warnings.length > 0) {
      for (const warning of warnings) {
        this.logger.warn(warning);
      }
    }

    return {
      metadata,
      rows,
      total,
      warnings,
    };
  }

  // ==============================================================================
  // BUSCAR FILA DE ENCABEZADOS
  // ==============================================================================

  private findHeaderRow(matrix: MatrixRow[]): number {
    let bestIndex = -1;
    let bestScore = 0;

    const maxRows = Math.min(matrix.length, 50);

    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      const row = matrix[rowIndex];

      if (!row || row.length === 0) {
        continue;
      }

      const normalized = row.map((value) => this.normalizeText(value));

      const has = (...names: string[]): boolean => {
        return normalized.some((value) =>
          names.some((name) => value === name || value.includes(name)),
        );
      };

      let score = 0;

      if (has('HOUSE')) {
        score += 3;
      }

      if (has('DESTINATARIO')) {
        score += 3;
      }

      if (has('PESO')) {
        score += 3;
      }

      if (has('REMITENTE')) {
        score += 2;
      }

      if (has('CARNET', 'CEDULA', 'IDENTIFICACION')) {
        score += 2;
      }

      if (has('BULTOS', 'SACAS', 'PACKAGES')) {
        score += 2;
      }

      if (has('PASAPORTE')) {
        score += 1;
      }

      if (has('TELEFONO')) {
        score += 1;
      }

      if (has('DIRECCION')) {
        score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndex = rowIndex;
      }
    }

    if (bestScore < 5) {
      return -1;
    }

    return bestIndex;
  }

  // ==============================================================================
  // RESOLVER COLUMNAS
  // ==============================================================================

  private resolveColumns(header: MatrixRow): ColumnMap {
    const normalized = header.map((value) => this.normalizeText(value));

    const findExact = (...aliases: string[]): number => {
      for (let index = 0; index < normalized.length; index++) {
        const value = normalized[index];

        if (aliases.includes(value)) {
          return index;
        }
      }

      return -1;
    };

    const findContains = (...aliases: string[]): number => {
      for (let index = 0; index < normalized.length; index++) {
        const value = normalized[index];

        if (!value) {
          continue;
        }

        for (const alias of aliases) {
          if (value === alias || value.includes(alias)) {
            return index;
          }
        }
      }

      return -1;
    };

    // --------------------------------------------------------------------------
    // HOUSE
    // --------------------------------------------------------------------------

    let house = findExact(
      'HOUSE',
      'NO HOUSE',
      'NUMERO HOUSE',
      'NUMERO DE HOUSE',
      'NUMERO DEL HOUSE',
    );

    if (house < 0) {
      house = findContains('HOUSE');
    }

    // --------------------------------------------------------------------------
    // NATURALEZA
    // --------------------------------------------------------------------------

    let naturalezaCantidad = findExact(
      'NATURALEZA / CANTIDAD',
      'NATURALEZA/CANTIDAD',
      'NATURALEZA',
    );

    if (naturalezaCantidad < 0) {
      naturalezaCantidad = findContains('NATURALEZA');
    }

    // --------------------------------------------------------------------------
    // PESO
    // --------------------------------------------------------------------------

    let peso = findExact(
      'PESO',
      'PESO KG',
      'PESO KG.',
      'PESO(KG)',
      'PESO (KG)',
      'PESO TOTAL',
      'PESO TOTAL KG',
      'PESO TOTAL (KG)',
    );

    if (peso < 0) {
      peso = findContains('PESO');
    }

    // --------------------------------------------------------------------------
    // BULTOS
    // --------------------------------------------------------------------------

    let bultos = findExact(
      'CANTIDAD BULTOS',
      'BULTOS',
      'BULTOS (CANT.)',
      'SACAS',
      'PACKAGES',
      'PIECES',
      'PIEZAS',
    );

    if (bultos < 0) {
      bultos = findContains('BULTOS', 'SACAS', 'PACKAGES', 'PIECES', 'PIEZAS');
    }

    // --------------------------------------------------------------------------
    // REMITENTE
    // --------------------------------------------------------------------------

    let remitente = findExact(
      'REMITENTE',
      'NOMBRE REMITENTE',
      'NOMBRE Y APELLIDOS DEL REMITENTE:',
      'NOMBRE Y APELLIDOS DEL REMITENTE',
    );

    if (remitente < 0) {
      remitente = findContains('REMITENTE');
    }

    // --------------------------------------------------------------------------
    // PASAPORTE
    // --------------------------------------------------------------------------

    let pasaporte = findExact('PASAPORTE', 'PASSPORT', 'ID REMITENTE');

    if (pasaporte < 0) {
      pasaporte = findContains('PASAPORTE', 'PASSPORT');
    }

    // --------------------------------------------------------------------------
    // DESTINATARIO
    // --------------------------------------------------------------------------

    let destinatario = findExact(
      'DESTINATARIO',
      'NOMBRE DESTINATARIO',
      'NOMBRE Y APELLIDOS DEL DESTINATARIO:',
      'NOMBRE Y APELLIDOS DEL DESTINATARIO',
    );

    if (destinatario < 0) {
      destinatario = findContains('DESTINATARIO');
    }

    // --------------------------------------------------------------------------
    // CARNET / CI
    // --------------------------------------------------------------------------
    //
    // IMPORTANTE:
    // La columna H del manifiesto es:
    //
    // "No. de Carnet de Identidad:"
    //
    // No usamos "IDENTIFICACION" como alias genérico porque la columna K
    // también contiene la palabra IDENTIFICACION.
    // --------------------------------------------------------------------------

    let carnet = findExact(
      'NO. DE CARNET DE IDENTIDAD:',
      'NO. DE CARNET DE IDENTIDAD',
      'NO DE CARNET DE IDENTIDAD:',
      'NO DE CARNET DE IDENTIDAD',
      'CARNET DE IDENTIDAD',
      'CARNET',
      'CARNET DESTINATARIO',
      'CI',
      'CI DESTINATARIO',
      'CEDULA',
      'CEDULA DESTINATARIO',
    );

    if (carnet < 0) {
      carnet = findContains(
        'CARNET DE IDENTIDAD',
        'CARNET DESTINATARIO',
        'CI DESTINATARIO',
        'CEDULA DESTINATARIO',
        'CARNET',
        'CEDULA',
      );
    }

    // --------------------------------------------------------------------------
    // TELEFONO
    // --------------------------------------------------------------------------

    let telefono = findExact(
      'TELEFONO',
      'TELÉFONO',
      'TELEFONO DESTINATARIO',
      'TEL DESTINATARIO',
    );

    if (telefono < 0) {
      telefono = findContains('TELEFONO');
    }

    // --------------------------------------------------------------------------
    // DIRECCION
    // --------------------------------------------------------------------------

    let direccion = findExact(
      'DIRECCION',
      'DIRECCIÓN',
      'DIRECCION DESTINATARIO',
      'DIRECCIÓN DESTINATARIO',
    );

    if (direccion < 0) {
      direccion = findContains('DIRECCION');
    }

    // --------------------------------------------------------------------------
    // ESTADO COBRO ORIGEN
    // --------------------------------------------------------------------------
    //
    // COLUMNA K:
    //
    // Identificación si el House está "COBRADO" ó "NO COBRADO" en origen
    //
    // Los tres manifiestos utilizan este mismo encabezado.
    // --------------------------------------------------------------------------

    let estadoCobroOrigen = findExact(
      'IDENTIFICACION SI EL HOUSE ESTA "COBRADO" Ó "NO COBRADO" EN ORIGEN',
      'IDENTIFICACION SI EL HOUSE ESTA "COBRADO" O "NO COBRADO" EN ORIGEN',
    );

    if (estadoCobroOrigen < 0) {
      estadoCobroOrigen = findContains('IDENTIFICACION SI EL HOUSE ESTA');
    }

    // --------------------------------------------------------------------------
    // UNIDAD DESTINO
    // --------------------------------------------------------------------------

    let unidadDestino = findExact('UNIDAD DESTINO', 'DESTINO', 'UNIDAD');

    if (unidadDestino < 0) {
      unidadDestino = findContains('UNIDAD DESTINO', 'DESTINO');
    }

    // --------------------------------------------------------------------------
    // DEBUG
    // --------------------------------------------------------------------------

    this.logger.log(
      `Columnas detectadas: ` +
        `HOUSE=${house}, ` +
        `NATURALEZA=${naturalezaCantidad}, ` +
        `PESO=${peso}, ` +
        `BULTOS=${bultos}, ` +
        `REMITENTE=${remitente}, ` +
        `PASAPORTE=${pasaporte}, ` +
        `DESTINATARIO=${destinatario}, ` +
        `CARNET=${carnet}, ` +
        `TELEFONO=${telefono}, ` +
        `DIRECCION=${direccion}, ` +
        `ESTADO_COBRO=${estadoCobroOrigen}, ` +
        `UNIDAD_DESTINO=${unidadDestino}`,
    );

    return {
      house,
      naturalezaCantidad,
      peso,
      bultos,
      remitente,
      pasaporte,
      destinatario,
      carnet,
      telefono,
      direccion,
      estadoCobroOrigen,
      unidadDestino,
    };
  }

  // ==============================================================================
  // EXTRAER METADATA
  // ==============================================================================

  private extractMetadata(rows: MatrixRow[]): ManifiestoMetadata {
    const agenteTransitario = this.findMetadataValue(rows, [
      'AGENTE TRANSITARIO',
      'AGENTE',
    ]);

    const fechaRaw = this.findMetadataValue(rows, ['FECHA']);

    const paisOrigen = this.findMetadataValue(rows, ['PAIS', 'PAIS ORIGEN']);

    const consignatario = this.findMetadataValue(rows, ['CONSIGNATARIO']);

    const masterAwb = this.findMetadataValue(rows, ['MASTER AWB', 'MASTER']);

    const cantidadHouseRaw = this.findMetadataValue(rows, [
      'CANTIDAD DE HOUSE',
      'CANTIDAD HOUSE',
      'CANTIDAD DE HOUSES',
      'CANTIDAD HOUSES',
    ]);

    const totalSacasRaw = this.findMetadataValue(rows, [
      'TOTAL DE SACAS',
      'TOTAL SACAS',
    ]);

    const totalPersonasRaw = this.findMetadataValue(rows, [
      'TOTAL DE PERSONAS',
      'TOTAL PERSONAS',
      'CANTIDAD DE PERSONAS',
    ]);

    const metadata: ManifiestoMetadata = {
      agenteTransitario: this.cleanText(agenteTransitario),

      fecha: this.parseDate(fechaRaw),

      paisOrigen: this.cleanText(paisOrigen),

      consignatario: this.cleanText(consignatario),

      masterAwb: this.cleanText(masterAwb),

      cantidadHouseDeclarada: this.parseInteger(cantidadHouseRaw),

      totalSacasDeclarado: this.parseInteger(totalSacasRaw),

      totalPersonasDeclarado: this.parseInteger(totalPersonasRaw),
    };

    this.logger.log(
      `Metadata detectada: ` +
        `agente=${metadata.agenteTransitario ?? '-'} | ` +
        `fecha=${metadata.fecha?.toISOString() ?? '-'} | ` +
        `pais=${metadata.paisOrigen ?? '-'} | ` +
        `consignatario=${metadata.consignatario ?? '-'} | ` +
        `masterAwb=${metadata.masterAwb ?? '-'} | ` +
        `housesDeclarados=${metadata.cantidadHouseDeclarada ?? '-'} | ` +
        `sacasDeclaradas=${metadata.totalSacasDeclarado ?? '-'} | ` +
        `personasDeclaradas=${metadata.totalPersonasDeclarado ?? '-'}`,
    );

    return metadata;
  }

  // ==============================================================================
  // BUSCAR VALOR DE METADATA
  // ==============================================================================

  private findMetadataValue(rows: MatrixRow[], aliases: string[]): unknown {
    const normalizedAliases = aliases.map((alias) => this.normalizeText(alias));

    for (const row of rows) {
      if (!row || row.length === 0) {
        continue;
      }

      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const rawLabel = row[columnIndex];

        const label = this.normalizeText(rawLabel);

        if (!label) {
          continue;
        }

        const matched = normalizedAliases.some(
          (alias) => label === alias || label.includes(alias),
        );

        if (!matched) {
          continue;
        }

        // ------------------------------------------------------------------------
        // Caso 1:
        // Label en una celda y valor en la siguiente.
        // ------------------------------------------------------------------------

        for (
          let valueIndex = columnIndex + 1;
          valueIndex < row.length;
          valueIndex++
        ) {
          const value = row[valueIndex];

          if (this.cleanText(value)) {
            return value;
          }
        }

        // ------------------------------------------------------------------------
        // Caso 2:
        // El valor puede estar en la siguiente fila.
        // ------------------------------------------------------------------------

        const currentRowIndex = rows.indexOf(row);

        if (currentRowIndex >= 0 && currentRowIndex + 1 < rows.length) {
          const nextRow = rows[currentRowIndex + 1];

          for (const value of nextRow) {
            if (this.cleanText(value)) {
              return value;
            }
          }
        }
      }
    }

    return null;
  }

  // ==============================================================================
  // PARSE HOUSE
  // ==============================================================================

  private parseHouse(row: MatrixRow, columns: ColumnMap): ManifiestoHouse {
    const numeroHouse = this.cleanText(this.valueAt(row, columns.house));

    const naturalezaCantidad = this.cleanText(
      this.valueAt(row, columns.naturalezaCantidad),
    );

    // ============================================================================
    // PESO
    // ============================================================================

    const pesoKg = this.roundNumber(
      this.safeNumber(this.valueAt(row, columns.peso), 0),
      2,
    );

    const bultos = this.safeInteger(this.valueAt(row, columns.bultos), 1);

    const remitenteNombre = this.cleanText(
      this.valueAt(row, columns.remitente),
    );

    const remitentePasaporte = this.cleanText(
      this.valueAt(row, columns.pasaporte),
    );

    const destinatarioNombre = this.cleanText(
      this.valueAt(row, columns.destinatario),
    );

    const destinatarioCarnet = this.cleanText(
      this.valueAt(row, columns.carnet),
    );

    const telefonoDestinatario = this.cleanText(
      this.valueAt(row, columns.telefono),
    );

    const direccionDestinatario = this.cleanText(
      this.valueAt(row, columns.direccion),
    );

    const estadoCobroOrigen = this.parseInteger(
      this.valueAt(row, columns.estadoCobroOrigen),
    );

    const unidadDestino = this.cleanText(
      this.valueAt(row, columns.unidadDestino),
    );

    return {
      numeroHouse,
      naturalezaCantidad,
      pesoKg,
      bultos,
      remitenteNombre,
      remitentePasaporte,
      destinatarioNombre,
      destinatarioCarnet,
      telefonoDestinatario,
      direccionDestinatario,
      estadoCobroOrigen,
      unidadDestino,
    };
  }

  // ==============================================================================
  // DETECTAR FILA TOTAL
  // ==============================================================================

  private isTotalRow(
    row: MatrixRow,
    columns: ColumnMap,
    rowIndex: number,
    totalRows: number,
  ): boolean {
    const isNearEnd = rowIndex >= totalRows - 2;

    if (!isNearEnd) {
      return false;
    }

    const house = this.valueAt(row, columns.house);

    const naturaleza = this.valueAt(row, columns.naturalezaCantidad);

    const remitente = this.valueAt(row, columns.remitente);

    const destinatario = this.valueAt(row, columns.destinatario);

    const peso = this.parseNumber(this.valueAt(row, columns.peso));

    const houseNumber = this.parseNumber(house);

    const noTextFields =
      !this.cleanText(naturaleza) &&
      !this.cleanText(remitente) &&
      !this.cleanText(destinatario);

    const hasNumericHouse = houseNumber !== null;

    const hasNumericWeight = peso !== null;

    return hasNumericHouse && hasNumericWeight && noTextFields;
  }

  // ==============================================================================
  // VALUE AT
  // ==============================================================================

  private valueAt(row: MatrixRow, index: number): unknown {
    if (index < 0 || index >= row.length) {
      return null;
    }

    return row[index];
  }

  // ==============================================================================
  // FILA VACÍA
  // ==============================================================================

  private isEmptyRow(row: MatrixRow): boolean {
    return !row.some((value) => this.cleanText(value));
  }

  // ==============================================================================
  // NORMALIZAR TEXTO
  // ==============================================================================

  private normalizeText(value: unknown): string {
    const text = this.cleanText(value);

    if (!text) {
      return '';
    }

    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ==============================================================================
  // LIMPIAR TEXTO
  // ==============================================================================

  private cleanText(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value).trim();
    }

    return String(value).trim();
  }

  // ==============================================================================
  // NORMALIZAR IDENTIDAD
  // ==============================================================================

  private normalizeIdentity(value: unknown): string {
    return this.normalizeText(value).replace(/[^A-Z0-9]/g, '');
  }

  // ==============================================================================
  // PARSE NUMBER
  // ==============================================================================

  private parseNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    const text = this.cleanText(value);

    if (!text) {
      return null;
    }

    let normalized = text.replace(/\s/g, '');

    // --------------------------------------------------------------------------
    // Formato europeo:
    // 2.123,23 -> 2123.23
    // --------------------------------------------------------------------------

    if (normalized.includes('.') && normalized.includes(',')) {
      const lastDot = normalized.lastIndexOf('.');

      const lastComma = normalized.lastIndexOf(',');

      if (lastComma > lastDot) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }
    } else if (normalized.includes(',')) {
      // ------------------------------------------------------------------------
      // 2123,23 -> 2123.23
      // ------------------------------------------------------------------------

      normalized = normalized.replace(',', '.');
    }

    // --------------------------------------------------------------------------
    // Mantener solamente números, punto y signo.
    // --------------------------------------------------------------------------

    normalized = normalized.replace(/[^0-9.-]/g, '');

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }

  // ==============================================================================
  // PARSE INTEGER
  // ==============================================================================

  private parseInteger(value: unknown): number | null {
    const parsed = this.parseNumber(value);

    if (parsed === null) {
      return null;
    }

    return Math.trunc(parsed);
  }

  // ==============================================================================
  // SAFE NUMBER
  // ==============================================================================

  private safeNumber(value: unknown, fallback = 0): number {
    const parsed = this.parseNumber(value);

    return parsed === null ? fallback : parsed;
  }

  // ==============================================================================
  // SAFE INTEGER
  // ==============================================================================

  private safeInteger(value: unknown, fallback = 0): number {
    const parsed = this.parseInteger(value);

    return parsed === null ? fallback : parsed;
  }

  // ==============================================================================
  // REDONDEAR
  // ==============================================================================

  private roundNumber(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);

    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  // ==============================================================================
  // PARSE DATE
  // ==============================================================================

  private parseDate(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
      try {
        const parsed = XLSX.SSF.parse_date_code(value);

        if (!parsed) {
          return null;
        }

        const date = new Date(
          parsed.y,
          parsed.m - 1,
          parsed.d,
          parsed.H ?? 0,
          parsed.M ?? 0,
          parsed.S ?? 0,
        );

        return Number.isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    }

    const text = this.cleanText(value);

    if (!text) {
      return null;
    }

    // DD/MM/YYYY
    const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);

    if (match) {
      const day = Number(match[1]);

      const month = Number(match[2]);

      const year = Number(match[3]);

      const date = new Date(year, month - 1, day);

      return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(text);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // ==============================================================================
  // ERROR MESSAGE
  // ==============================================================================

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
