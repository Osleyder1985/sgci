// ================================================================================
// SGCI - Sistema de Gestión Contextual Integrado
//
// Archivo:
//   apps/api/src/manifiestos/manifiestos.controller.ts
//
// Descripción:
//   Controller HTTP responsable de la funcionalidad "Importar Manifiesto".
// ================================================================================

import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { ManifiestosDiagnosticoService } from './manifiestos.diagnostico.service.js';
import { ManifiestosService } from './manifiestos.service.js';

interface UploadedManifestFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
  stream?: NodeJS.ReadableStream;
}

@Controller('api/guias')
export class ManifiestosController {
  constructor(
    private readonly manifiestosService: ManifiestosService,
    private readonly diagnosticoService: ManifiestosDiagnosticoService,
  ) {}

  /**
   * ===========================================================================
   * PREVISUALIZAR MANIFIESTO
   * ===========================================================================
   *
   * POST /api/guias/importar/preview
   *
   * Analiza el manifiesto sin modificar la base de datos y agrega un
   * diagnóstico de preparación de las direcciones existentes.
   */
  @Post('importar/preview')
  @UseInterceptors(FileInterceptor('archivo'))
  async preview(@UploadedFile() archivo?: UploadedManifestFile) {
    this.validarArchivo(archivo);

    const [preview, diagnostico] = await Promise.all([
      this.manifiestosService.preview(archivo.buffer, archivo.originalname),
      this.diagnosticoService.analizarArchivo(
        archivo.buffer,
        archivo.originalname,
      ),
    ]);

    return {
      ...preview,
      direcciones: diagnostico,
    };
  }

  /**
   * ===========================================================================
   * IMPORTAR MANIFIESTO
   * ===========================================================================
   *
   * POST /api/guias/importar
   *
   * Importa definitivamente el manifiesto.
   */
  @Post('importar')
  @UseInterceptors(FileInterceptor('archivo'))
  async importar(@UploadedFile() archivo?: UploadedManifestFile) {
    this.validarArchivo(archivo);

    return this.manifiestosService.importar(
      archivo.buffer,
      archivo.originalname,
    );
  }

  private validarArchivo(
    archivo?: UploadedManifestFile,
  ): asserts archivo is UploadedManifestFile {
    if (!archivo) {
      throw new BadRequestException(
        'Debe seleccionar un archivo de manifiesto.',
      );
    }

    if (!archivo.buffer || archivo.buffer.length === 0) {
      throw new BadRequestException('El archivo de manifiesto está vacío.');
    }
  }
}
