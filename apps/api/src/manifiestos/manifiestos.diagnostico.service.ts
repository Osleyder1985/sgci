import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import {
  ManifiestoParsed,
  ManifiestoParser,
} from './parsers/manifiesto.parser.js';

export interface DiagnosticoDireccionesPreview {
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
}

interface CandidatoDireccion {
  nombre: string;
  carnet: string | null;
  direccion: string | null;
}

@Injectable()
export class ManifiestosDiagnosticoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ManifiestoParser,
  ) {}

  async analizarArchivo(
    buffer: Buffer,
    originalname: string,
  ): Promise<DiagnosticoDireccionesPreview> {
    const parsed = this.parser.parse(buffer, originalname);
    return this.analizar(parsed);
  }

  private async analizar(
    parsed: ManifiestoParsed,
  ): Promise<DiagnosticoDireccionesPreview> {
    const candidatos = this.obtenerCandidatos(parsed);
    const warnings: string[] = [];

    let encontradas = 0;
    let reutilizables = 0;
    let pendientesGeocodificacion = 0;
    let nuevas = 0;
    let sinDireccion = 0;

    const personasConDireccion = new Set<string>();
    const personasSinDireccion = new Set<string>();

    for (const candidato of candidatos) {
      const identidad = this.identityKey(candidato.nombre, candidato.carnet);
      const direccion = this.cleanText(candidato.direccion);

      if (!direccion) {
        sinDireccion++;
        personasSinDireccion.add(identidad);
        continue;
      }

      personasConDireccion.add(identidad);

      try {
        const persona = await this.buscarPersona(
          candidato.nombre,
          candidato.carnet,
        );

        if (!persona) {
          nuevas++;
          continue;
        }

        const existentes = await this.prisma.direccion.findMany({
          where: { personaId: persona.id, activa: true },
          select: {
            direccionOriginal: true,
            estadoGeocodificacion: true,
          },
        });

        const existente = existentes.find(
          (item) =>
            this.normalizeIdentity(item.direccionOriginal) ===
            this.normalizeIdentity(direccion),
        );

        if (!existente) {
          nuevas++;
          continue;
        }

        encontradas++;

        if (existente.estadoGeocodificacion === 'GEOCODIFICADA') {
          reutilizables++;
        } else {
          pendientesGeocodificacion++;
        }
      } catch (error) {
        pendientesGeocodificacion++;
        warnings.push(
          `No se pudo consultar el estado de la dirección de ${candidato.nombre || 'destinatario'}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const total = candidatos.filter((item) => !!item.direccion).length;
    const cobertura = total > 0 ? Math.round((reutilizables / total) * 100) : 0;

    return {
      total,
      encontradas,
      reutilizables,
      pendientesGeocodificacion,
      nuevas,
      sinDireccion,
      cobertura,
      personasConDireccion: personasConDireccion.size,
      personasSinDireccion: personasSinDireccion.size,
      warnings,
    };
  }

  private obtenerCandidatos(parsed: ManifiestoParsed): CandidatoDireccion[] {
    const deduplicados = new Map<string, CandidatoDireccion>();

    for (const house of parsed.rows) {
      const candidato: CandidatoDireccion = {
        nombre: this.cleanText(house.destinatarioNombre) ?? '',
        carnet: this.cleanText(house.destinatarioCarnet),
        direccion: this.cleanText(house.direccionDestinatario),
      };

      if (!candidato.nombre && !candidato.carnet) continue;

      const identidad = this.identityKey(candidato.nombre, candidato.carnet);
      const key = `${identidad}|${this.normalizeIdentity(candidato.direccion)}`;
      const existente = deduplicados.get(key);

      if (!existente || (!existente.direccion && candidato.direccion)) {
        deduplicados.set(key, candidato);
      }
    }

    return [...deduplicados.values()];
  }

  private async buscarPersona(nombre: string, carnet: string | null) {
    const numero = this.normalizeIdentity(carnet);

    if (numero) {
      const documento = await this.prisma.documentoIdentidad.findUnique({
        where: {
          tipo_numero: {
            tipo: 'CARNET_IDENTIDAD',
            numero,
          },
        },
        select: { personaId: true },
      });

      if (documento) {
        return this.prisma.persona.findUnique({
          where: { id: documento.personaId },
          select: { id: true },
        });
      }
    }

    if (!nombre) return null;

    return this.prisma.persona.findFirst({
      where: {
        nombreCompleto: {
          equals: nombre.trim(),
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });
  }

  private cleanText(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }

  private normalizeIdentity(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  private identityKey(nombre: string, carnet: string | null): string {
    return `${this.normalizeIdentity(carnet)}|${this.normalizeIdentity(nombre)}`;
  }
}
