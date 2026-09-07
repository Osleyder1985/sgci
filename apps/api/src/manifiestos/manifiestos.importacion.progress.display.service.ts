import { Injectable } from '@nestjs/common';
import {
  ImportJobResult,
  ManifiestosImportacionProgressService,
} from './manifiestos.importacion.progress.service.js';

@Injectable()
export class ManifiestosImportacionProgressDisplayService extends ManifiestosImportacionProgressService {
  override complete(
    jobId: string,
    message = 'Manifiesto importado correctamente.',
    result?: ImportJobResult,
  ): Promise<void> {
    const completedMessage = result
      ? `${message} Resultado persistido: Master AWB ${result.masterAwb} · Houses ${result.guias} · Bultos ${result.paquetes} · Personas ${result.personas} · Peso total ${result.pesoTotalKg} kg.`
      : message;

    return super.complete(jobId, completedMessage, result);
  }
}
