// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/dashboard/dashboard.service.ts
//
// Descripción:
//   Servicio de métricas operativas del Dashboard.
// ================================================================================

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      manifiestos,
      masterAwb,
      guias,
      paquetes,
      resumenManifiestos,
      resumenGuias,
      cobrado,
      noCobrado,
      destinos,
      actividad,
    ] = await Promise.all([
      this.prisma.manifiesto.count(),

      this.prisma.masterAwb.count(),

      this.prisma.guia.count(),

      this.prisma.paquete.count(),

      this.prisma.manifiesto.aggregate({
        _sum: {
          pesoTotalKg: true,
          cantidadHouse: true,
          totalSacas: true,
          totalPersonas: true,
        },
      }),

      this.prisma.guia.aggregate({
        _sum: {
          pesoKg: true,
          bultos: true,
        },
      }),

      this.prisma.guia.count({
        where: {
          estadoCobroOrigen: '1',
        },
      }),

      this.prisma.guia.count({
        where: {
          estadoCobroOrigen: '2',
        },
      }),

      this.prisma.guia.groupBy({
        by: ['unidadDestino'],
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            unidadDestino: 'desc',
          },
        },
        take: 10,
      }),

      this.prisma.manifiesto.findMany({
        orderBy: {
          importadoAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          fecha: true,
          importadoAt: true,
          archivoNombre: true,
          cantidadHouse: true,
          totalSacas: true,
          totalPersonas: true,
          pesoTotalKg: true,
          masterAwb: {
            select: {
              numero: true,
            },
          },
        },
      }),
    ]);

    const pesoTotalKg = Number(resumenManifiestos._sum.pesoTotalKg ?? 0);

    return {
      ok: true,

      generadoAt: new Date().toISOString(),

      kpis: {
        manifiestos,
        masterAwb,
        guias,
        houses: resumenManifiestos._sum.cantidadHouse ?? 0,
        bultos: resumenManifiestos._sum.totalSacas ?? 0,
        paquetes,
        personas: resumenManifiestos._sum.totalPersonas ?? 0,
        pesoTotalKg,
      },

      cobro: {
        cobrado,
        noCobrado,
        total: cobrado + noCobrado,
      },

      destinos: destinos.map((item) => ({
        destino: item.unidadDestino ?? 'Sin destino',
        cantidad: item._count._all,
      })),

      actividad: actividad.map((item) => ({
        id: item.id,
        masterAwb: item.masterAwb?.numero ?? null,
        archivoNombre: item.archivoNombre,
        fecha: item.fecha,
        importadoAt: item.importadoAt,
        houses: item.cantidadHouse,
        bultos: item.totalSacas,
        personas: item.totalPersonas,
        pesoKg: Number(item.pesoTotalKg ?? 0),
      })),

      consistencia: {
        pesoDesdeManifiestosKg: pesoTotalKg,
        pesoDesdeGuiasKg: Number(resumenGuias._sum.pesoKg ?? 0),
        bultosDesdeManifiestos: resumenManifiestos._sum.totalSacas ?? 0,
        bultosDesdeGuias: resumenGuias._sum.bultos ?? 0,
      },
    };
  }
}
