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

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  ManifiestosService,
} from './manifiestos.service.js';

/**
 * Archivo recibido mediante multipart/form-data.
 *
 * Definimos el tipo localmente para no depender de
 * Express.Multer.File ni de multer.File.
 */
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
  ) {}

  /**
   * ===========================================================================
   * PREVISUALIZAR MANIFIESTO
   * ===========================================================================
   *
   * POST /api/guias/importar/preview
   *
   * Analiza el manifiesto sin modificar la base de datos.
   */
  @Post('importar/preview')
  @UseInterceptors(
    FileInterceptor('archivo'),
  )
  async preview(
    @UploadedFile() archivo?: UploadedManifestFile,
  ) {
    this.validarArchivo(archivo);

    return this.manifiestosService.preview(
      archivo.buffer,
      archivo.originalname,
    );
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
  @UseInterceptors(
    FileInterceptor('archivo'),
  )
  async importar(
    @UploadedFile() archivo?: UploadedManifestFile,
  ) {
    this.validarArchivo(archivo);

    return this.manifiestosService.importar(
      archivo.buffer,
      archivo.originalname,
    );
  }

  /**
   * ===========================================================================
   * VALIDAR ARCHIVO
   * ===========================================================================
   */
  private validarArchivo(
    archivo?: UploadedManifestFile,
  ): asserts archivo is UploadedManifestFile {
    if (!archivo) {
      throw new BadRequestException(
        'Debe seleccionar un archivo de manifiesto.',
      );
    }

    if (
      !archivo.buffer ||
      archivo.buffer.length === 0
    ) {
      throw new BadRequestException(
        'El archivo de manifiesto está vacío.',
      );
    }
  }
}