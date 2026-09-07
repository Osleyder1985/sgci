# SGCI — Import Job Durability Standard

## Objetivo

Definir el contrato mínimo de durabilidad para los trabajos de `Importar Manifiesto`.

## Reglas

1. Cada job debe existir en PostgreSQL antes de comenzar su ejecución.
2. Un job `queued` debe adquirirse mediante un claim atómico; dos workers no pueden adquirir el mismo job.
3. El worker propietario se identifica mediante `workerId`.
4. La ejecución mantiene `heartbeatAt` y `leaseUntil` persistentes.
5. Cada intento incrementa `attempt`.
6. Las actualizaciones de progreso deben validar la propiedad del worker.
7. Al completar o fallar, el lease se libera y el worker deja de ser propietario.
8. Un job cuyo lease haya expirado debe detectarse y dejar de aparecer como ejecución activa.
9. El estado persistente del job es la fuente de verdad; la memoria del proceso no puede ser la única fuente de estado.
10. La implementación actual no debe afirmar reanudación automática después de un crash mientras el archivo fuente siga existiendo únicamente en memoria HTTP. Para reanudar realmente, el archivo o una referencia durable al archivo debe persistirse antes del claim.

## Estado actual

Esta fase introduce `attempt`, `workerId`, `heartbeatAt` y `leaseUntil`, además de claim atómico y recuperación de leases expirados. El siguiente paso arquitectónico es desacoplar la ejecución del request HTTP mediante almacenamiento durable de la fuente y un worker que pueda reclamar jobs pendientes después de un reinicio.

## Principio

> Toda ejecución crítica debe tener identidad de worker, lease y estado durable suficientes para detectar una ejecución perdida sin depender de la memoria del proceso.
