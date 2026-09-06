import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ManifiestosDiagnosticoService } from './manifiestos.diagnostico.service.js';
import { ManifiestosImportacionProgressService } from './manifiestos.importacion.progress.service.js';
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
    private readonly progress: ManifiestosImportacionProgressService,
  ) {}

  @Post('importar/preview')
  @UseInterceptors(FileInterceptor('archivo'))
  async preview(@UploadedFile() archivo?: UploadedManifestFile) {
    this.validarArchivo(archivo);
    const [preview, diagnostico] = await Promise.all([
      this.manifiestosService.preview(archivo.buffer, archivo.originalname),
      this.diagnosticoService.analizarArchivo(archivo.buffer, archivo.originalname),
    ]);
    return { ...preview, direcciones: diagnostico };
  }

  @Post('importar')
  @UseInterceptors(FileInterceptor('archivo'))
  async importar(@UploadedFile() archivo?: UploadedManifestFile) {
    this.validarArchivo(archivo);
    return this.manifiestosService.importar(archivo.buffer, archivo.originalname);
  }

  @Post('importar/job')
  @UseInterceptors(FileInterceptor('archivo'))
  async importarJob(@UploadedFile() archivo?: UploadedManifestFile) {
    this.validarArchivo(archivo);
    const [preview, diagnostico] = await Promise.all([
      this.manifiestosService.preview(archivo.buffer, archivo.originalname),
      this.diagnosticoService.analizarArchivo(archivo.buffer, archivo.originalname),
    ]);
    if (preview.archivo?.duplicado) {
      throw new BadRequestException('El manifiesto ya fue importado anteriormente.');
    }
    const job = this.progress.create(
      preview.total?.cantidadHouses ?? preview.registros ?? 0,
      preview.total?.cantidadPersonas ?? 0,
      diagnostico.total,
    );
    void this.manifiestosService.importar(
      archivo.buffer,
      archivo.originalname,
      job.jobId,
    );
    return {
      ok: true,
      jobId: job.jobId,
      message: 'Importación iniciada.',
      progress: job,
    };
  }

  @Get('importar/job/:jobId')
  getImportProgress(@Param('jobId') jobId: string) {
    const job = this.progress.get(jobId);
    if (!job) {
      throw new NotFoundException(
        'No existe el trabajo de importación solicitado.',
      );
    }
    return { ok: true, progress: job };
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
