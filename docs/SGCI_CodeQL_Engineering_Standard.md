# SGCI — CodeQL Engineering Standard

## 1. Propósito

Este documento define el estándar de ingeniería y seguridad para CodeQL en SGCI.

CodeQL es una capa de análisis estático para detectar vulnerabilidades, flujos peligrosos de datos y patrones inseguros antes de producción. Para JavaScript y TypeScript analiza estructuras del programa, flujo de control y flujo de datos; TypeScript se analiza mediante el extractor JavaScript con soporte TypeScript. Las suites incluyen default, security-extended y security-and-quality. citeturn0search0turn0search1turn0search2turn0search8turn0search10

## 2. Principios

1. Todo alert debe investigarse.
2. No cerrar alertas sin comprender la causa.
3. Corregir la causa raíz, no solo la línea señalada.
4. No modificar código a ciegas para conseguir verde.
5. Los datos externos son no confiables hasta validación contextual.
6. No desactivar consultas para ocultar problemas.
7. Los falsos positivos requieren justificación técnica.
8. CI es la evidencia final para el HEAD analizado.

## 3. Sources, flows y sinks

Ante cada alerta identificar:

- Source: origen del dato no confiable.
- Flow: recorrido del dato.
- Sink: operación donde puede producirse daño.
- Sanitizer o barrier: validación que rompe el flujo peligroso.

No corregir únicamente el sink si el mismo dato continúa siendo peligroso en otros caminos.

## 4. Superficies de entrada SGCI

Considerar no confiables datos procedentes de:

- requests HTTP;
- parámetros y query strings;
- body;
- XLSX y otros archivos;
- APIs externas;
- jobs y colas;
- variables externas;
- datos almacenados originalmente por usuarios.

La validación debe realizarse antes de operaciones sensibles.

## 5. Inyección y Prisma

Preferir Prisma Client y APIs parametrizadas.

Las consultas raw son una frontera de seguridad:

- no interpolar entradas externas en SQL;
- parametrizar valores;
- validar identificadores dinámicos;
- revisar SQL dinámico;
- añadir pruebas adversarias.

TypeScript no elimina riesgos de inyección.

## 6. XSS y Web

Los datos externos que terminen como HTML, URL o contenido ejecutable deben revisarse.

No introducir HTML dinámico sin sanitización adecuada.

La procedencia de una base de datos o servicio interno no convierte automáticamente el contenido en seguro.

## 7. Expresiones regulares y ReDoS

Reglas:

1. no construir regex dinámicas con datos externos sin escape y validación;
2. evitar patrones ambiguos con backtracking excesivo;
3. limitar entradas cuando corresponda;
4. medir casos adversos;
5. preferir parsers deterministas cuando sea apropiado.

Lección permanente de SGCI: el problema anterior de escapeRegex demostró que no se debe inventar un escape manual sin comprender el contexto y verificar el resultado real de CodeQL.

## 8. Paths y archivos

Nunca construir rutas directamente con datos externos.

Normalizar y validar el resultado y comprobar que permanezca dentro del directorio permitido.

En importaciones validar:

- tipo;
- tamaño;
- estructura;
- contenido;
- número de filas cuando corresponda;
- valores usados posteriormente como nombres o rutas.

## 9. Información sensible

No registrar ni exponer:

- passwords;
- tokens;
- API keys;
- secretos;
- documentos sensibles completos;
- datos personales innecesarios.

Los logs y respuestas de error son sinks potenciales.

## 10. Autorización

CodeQL ayuda a detectar patrones inseguros, pero no demuestra que todas las reglas de autorización sean correctas.

Las operaciones sensibles deben validar identidad, permisos, pertenencia al recurso y reglas de negocio.

La seguridad crítica debe imponerse en backend.

## 11. Proceso ante un alert

1. Leer nombre y severidad.
2. Identificar archivo y línea.
3. Revisar source y sink.
4. Comprender el flujo.
5. Determinar explotabilidad real.
6. Localizar causa raíz.
7. Aplicar corrección mínima.
8. Añadir test de regresión cuando corresponda.
9. Ejecutar validaciones.
10. Esperar el nuevo resultado real de CodeQL.

## 12. Falsos positivos y supresiones

Un falso positivo requiere documentar:

- por qué no es explotable;
- qué garantía existe;
- por qué CodeQL no puede inferirla;
- por qué una corrección alternativa sería incorrecta.

Las supresiones deben ser locales, excepcionales y nunca una forma de desbloquear CI.

## 13. Suites y personalización

La suite estándar debe ser la base mínima.

Si SGCI lo justifica, evaluar security-extended o security-and-quality, entendiendo que amplían cobertura y pueden aumentar alertas. citeturn0search8turn0search10

Las consultas o modelos personalizados deben justificarse para patrones propios, sanitizers internos o sinks específicos. CodeQL permite extensiones para modelar bibliotecas y flujos, que deben mantenerse versionadas y revisadas. citeturn0search9

## 14. Revisión de Pull Requests

Revisar:

- alertas nuevas;
- cambios de configuración CodeQL;
- supresiones;
- nuevas superficies de entrada;
- SQL raw;
- regex;
- manejo de archivos;
- HTML y URLs dinámicas;
- logging;
- autorización.

No declarar un PR seguro hasta que CodeQL termine para el HEAD correcto.

## 15. Errores que SGCI no debe repetir

### Corregir visualmente

Cambiar código porque parece seguro.

Solución: comprender el flujo y verificar CodeQL.

### Implementar escapes caseros no verificados

Solución: usar mecanismos apropiados, pruebas adversarias y análisis real.

### Asumir que TypeScript garantiza seguridad

Solución: validar semánticamente el contenido.

### Desactivar reglas para conseguir verde

Solución: corregir la causa o justificar técnicamente un falso positivo.

### Declarar éxito antes del workflow final

Solución: comprobar el estado real del commit HEAD.

## 16. Definition of Done

- [ ] nuevas superficies de entrada identificadas;
- [ ] datos externos validados;
- [ ] SQL raw revisado;
- [ ] regex dinámicas revisadas;
- [ ] paths y archivos revisados;
- [ ] no se exponen secretos;
- [ ] autorización no se debilitó;
- [ ] alertas nuevas investigadas;
- [ ] falsos positivos justificados;
- [ ] no hay supresiones amplias;
- [ ] CodeQL está verde para el HEAD correcto;
- [ ] el resto del Quality Gate sigue pasando.

## 17. Reglas de oro

1. Un alert es una señal para investigar.
2. Corrige causas raíz.
3. Sigue source → flow → sink.
4. Los datos externos no son confiables.
5. TypeScript no es un sanitizer.
6. Prisma no elimina riesgos de SQL raw.
7. Trata regex como código sensible a seguridad y rendimiento.
8. No construyas paths inseguros.
9. No expongas secretos.
10. La autorización crítica vive en backend.
11. No desactives CodeQL para conseguir verde.
12. Documenta falsos positivos reales.
13. Usa supresiones locales y excepcionales.
14. Añade tests de regresión cuando sea posible.
15. Verifica siempre el HEAD exacto.
16. CodeQL complementa, no reemplaza, la revisión humana.

## 18. Referencias oficiales

- CodeQL: https://codeql.github.com/docs/
- JavaScript y TypeScript: https://codeql.github.com/docs/codeql-language-guides/codeql-for-javascript/
- Consultas integradas: https://docs.github.com/en/code-security/reference/code-scanning/codeql/codeql-queries/javascript-typescript-built-in-queries
- Lenguajes compatibles: https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/
- Query help: https://codeql.github.com/codeql-query-help/javascript/
