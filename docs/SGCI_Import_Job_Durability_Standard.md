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
10. La fuente XLSX del job debe persistirse antes de responder al request HTTP, de forma que la ejecución pueda desacoplarse del request.
11. El resultado debe persistirse antes de limpiar la fuente XLSX.
12. Un fallo al limpiar la fuente después de una importación completada no debe convertir el job en `failed`; debe quedar registrado para observabilidad y permitir limpieza posterior.

## Estado actual

Esta fase implementa `attempt`, `workerId`, `heartbeatAt` y `leaseUntil`, claim atómico, recuperación de leases expirados, persistencia durable de la fuente XLSX y ejecución mediante worker desacoplado del request HTTP.

La reanudación automática después de un crash todavía no forma parte del contrato: los jobs cuyo lease expira se marcan como fallidos y la fuente durable permanece asociada al job para permitir una estrategia explícita de reintento posterior.

## Principio

> Toda ejecución crítica debe tener identidad de worker, lease y estado durable suficientes para detectar una ejecución perdida sin depender de la memoria del proceso.
