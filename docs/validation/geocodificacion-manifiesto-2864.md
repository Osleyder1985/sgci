# Validación funcional — Manifiesto 2864

## Fuente
Manifiesto real disponible en la biblioteca como `Manifiesto(2).xlsx`.

## Muestra validada
Se verificaron como casos representativos direcciones reales del manifiesto con las reglas cubanas implementadas:

- `CALLE VICENTE SOMONTE # 16 E/ AGRAMONTE Y MARTI...`
- `CALLE SALVADOR CISNEROS # 54 E/ PEDRO VEGA Y NIETO...`
- `CALLE ANTONIO MACEO # 063B E/ CAMILO CIENFUEGOS...`
- `CALLE APARTAMENTO 59, EDIF 15, RPTO JUNCO SUR...`

## Resultado esperado

1. `#` se interpreta como número de casa.
2. `E/` se interpreta como entrecalles.
3. `APARTAMENTO` y `APTO.` se interpretan como apartamento.
4. `EDIF` / `EDIF.` se interpretan como edificio.
5. `RPTO` / `RPTO.` se interpreta como reparto.
6. El sufijo `(Zona N)` se elimina de la provincia.
7. No se inventan componentes ausentes.
8. Las direcciones identificadas como cubanas se geocodifican con contexto `CUBA`, aunque el país de origen del manifiesto sea `MEXICO`.

La validación automatizada de estos casos queda cubierta por `geocodificacion.service.spec.ts` y `geocodificacion.manifest.spec.ts`.

> La cobertura final de geocodificación contra LocationIQ requiere ejecutar la importación con `LOCATIONIQ_API_KEY` configurada en el entorno operativo; el repositorio no expone secretos ni permite leerlos desde el conector.
