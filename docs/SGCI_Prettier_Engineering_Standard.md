# SGCI — Prettier Engineering Standard

## 1. Propósito

Este documento define el estándar profesional de Prettier para SGCI.

Prettier debe ser la autoridad de formato del código y debe eliminar discusiones manuales sobre espacios, saltos de línea, comillas y estructura visual. Su objetivo es producir un formato determinista, reproducible y verificable automáticamente.

Este estándar complementa:

- `SGCI_TypeScript_API_Engineering_Standard.md`
- `SGCI_TypeScript_Web_Engineering_Standard.md`
- `SGCI_ESLint_API_Engineering_Standard.md`
- `SGCI_ESLint_Web_Engineering_Standard.md`
- `SGCI_Prisma_Engineering_Standard.md`

## 2. Principios fundamentales

1. Prettier debe ejecutarse de forma determinista en desarrollo y CI.
2. El formato no debe depender de la configuración individual del IDE.
3. CI debe comprobar el formato y fallar cuando exista divergencia.
4. ESLint debe encargarse de calidad y reglas semánticas; Prettier, del formato.
5. No deben existir guerras entre ESLint y Prettier por reglas de estilo.
6. Los cambios de formato deben ser reproducibles con la misma versión/configuración.
7. No se deben mezclar cambios funcionales con reformateos masivos sin necesidad.
8. Un fallo de formato debe corregirse ejecutando el formatter, no reconstruyendo manualmente archivos grandes.

## 3. Configuración única

El repositorio debe tener una configuración de Prettier claramente identificable y compartida.

La configuración puede residir en:

- `.prettierrc`;
- `.prettierrc.json`;
- `.prettierrc.js`;
- `prettier.config.js`;
- o la configuración equivalente aceptada por la versión instalada.

No debe haber múltiples configuraciones contradictorias entre API y Web salvo una necesidad técnica documentada.

## 4. Versión fijada

La versión de Prettier debe estar fijada mediante el gestor de paquetes del proyecto.

No depender de una instalación global diferente en cada máquina.

Los desarrolladores deben utilizar la versión instalada por el repositorio.

Ejemplo conceptual:

```bash
npx prettier --version
```

La versión utilizada localmente y en CI debe ser la misma que declara el proyecto.

## 5. Archivos cubiertos

La política de formato debe definir explícitamente qué archivos se formatean.

Para SGCI debe mantenerse coherencia con el alcance de CI, actualmente basado en patrones como:

```bash
npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

Si se amplía el alcance, debe revisarse primero el impacto sobre archivos generados, snapshots, assets y archivos que no deban ser modificados automáticamente.

## 6. Formato como Quality Gate

El formato debe validarse automáticamente en CI.

La comprobación equivalente a:

```bash
npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

debe considerarse obligatoria antes de aceptar cambios.

`--check` no modifica archivos: detecta divergencias y hace fallar la validación cuando corresponde.

## 7. Formatear vs comprobar

Existen dos operaciones distintas:

### Formatear

```bash
npx prettier --write "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

Se utiliza para aplicar el formato.

### Comprobar

```bash
npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

Se utiliza en CI para comprobar que los archivos ya están correctamente formateados.

CI no debería modificar el código para ocultar un fallo.

## 8. Prettier y ESLint

Prettier y ESLint tienen responsabilidades diferentes.

### Prettier

Debe controlar principalmente:

- indentación;
- saltos de línea;
- longitud visual;
- comillas;
- trailing commas;
- espacios;
- formato de objetos y arrays;
- formato de imports;
- estructura visual.

### ESLint

Debe controlar principalmente:

- errores potenciales;
- TypeScript incorrecto;
- Promises mal manejadas;
- imports inválidos;
- variables no utilizadas;
- complejidad;
- seguridad;
- patrones peligrosos;
- arquitectura cuando sea posible mediante reglas.

No duplicar en ESLint reglas puramente cosméticas que Prettier ya controla.

## 9. Orden recomendado del Quality Gate

El pipeline puede mantener una secuencia equivalente a:

```text
install
  ↓
Prisma generate / validate
  ↓
TypeScript
  ↓
ESLint
  ↓
Prettier --check
  ↓
tests
  ↓
build
```

El orden exacto puede cambiar por necesidades del repositorio, pero el formato debe verificarse antes de considerar el cambio completo.

## 10. EditorConfig e IDE

Si el repositorio utiliza `.editorconfig`, debe evitarse una configuración contradictoria con Prettier.

El editor debe configurarse para utilizar Prettier como formatter del proyecto.

No confiar únicamente en el formato automático del IDE: CI sigue siendo la autoridad final.

## 11. Formato al guardar

Se recomienda habilitar format-on-save para los desarrolladores.

Esto reduce errores antes del commit, pero no reemplaza la validación de CI.

El objetivo es que el desarrollador reciba el problema inmediatamente, no después de abrir un Pull Request.

## 12. Hooks de Git

Puede utilizarse un pre-commit para ejecutar Prettier sobre archivos modificados.

Una estrategia típica es utilizar `lint-staged` para no reformatear todo el repositorio en cada commit.

Ejemplo conceptual:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": "prettier --write"
  }
}
```

Los hooks locales mejoran la experiencia, pero nunca deben ser la única protección.

## 13. Pull Requests

Un PR debe evitar introducir diferencias de formato.

Si un cambio funcional requiere reformateo, se recomienda que el formato sea aplicado de manera consistente dentro del mismo cambio.

Evitar commits que mezclen miles de líneas reformateadas con cambios funcionales complejos salvo que exista una razón clara.

## 14. Revisiones de código

El reviewer no debería discutir manualmente reglas que ya están automatizadas por Prettier.

En cambio, debe concentrarse en:

- comportamiento;
- arquitectura;
- seguridad;
- contratos;
- persistencia;
- rendimiento;
- pruebas;
- errores;
- mantenibilidad.

## 15. Cambios de configuración

Modificar `.prettierrc` es un cambio de ingeniería, no una preferencia individual.

Antes de modificarlo deben evaluarse:

- cantidad de archivos afectados;
- impacto en API y Web;
- CI;
- documentación;
- snapshots;
- diffs de PR;
- compatibilidad con ESLint;
- impacto sobre el equipo.

Un cambio de configuración debe ser deliberado y documentado cuando tenga impacto amplio.

## 16. `printWidth`

`printWidth` debe considerarse una guía de formato, no una regla rígida para introducir saltos manuales innecesarios.

No utilizar espacios manuales para intentar engañar al formatter.

Si Prettier produce una línea determinada, el código debe aceptar su formato salvo que exista una razón técnica para utilizar una excepción.

## 17. Excepciones

Las excepciones deben ser poco frecuentes y locales.

Cuando una sección de código realmente requiera evitar el procesamiento de Prettier, debe utilizarse el mecanismo de ignore soportado por la versión instalada, con una razón clara.

No utilizar ignores para ocultar código desordenado o evitar arreglar un fallo normal de formato.

## 18. Archivos generados

Los archivos generados automáticamente deben identificarse claramente.

No debe modificarse manualmente un archivo generado solo para satisfacer Prettier si será sobrescrito posteriormente.

Cuando sea apropiado, los archivos generados pueden excluirse mediante la configuración/ignore correspondiente.

## 19. Prisma

Los archivos Prisma deben seguir la política de formato compatible con la versión de Prisma utilizada por SGCI.

No introducir manualmente cambios de formato que después serán reescritos por herramientas oficiales.

El estándar de Prisma y el de Prettier deben mantenerse coordinados.

## 20. Markdown

La documentación Markdown también debe mantener formato consistente cuando esté incluida en el alcance de Prettier.

Especial cuidado con:

- tablas;
- listas;
- bloques de código;
- enlaces;
- saltos de línea;
- documentos extensos.

El contenido técnico no debe modificarse semánticamente solo por ejecutar el formatter.

## 21. JSON

Los archivos JSON deben utilizar el formato determinado por Prettier.

No editar manualmente espacios o indentación para satisfacer una preferencia personal.

## 22. CSS y estilos

Los archivos CSS y formatos soportados deben utilizar Prettier cuando estén incluidos en el alcance del proyecto.

Las decisiones visuales pertenecen al código de estilos; Prettier solo determina su representación consistente.

## 23. Código TypeScript

Prettier debe trabajar junto con TypeScript, no sustituir al compilador.

Un archivo correctamente formateado puede seguir teniendo errores de tipos, lógica, seguridad o arquitectura.

Por tanto:

```text
Prettier ≠ TypeScript compiler ≠ ESLint ≠ tests
```

Cada herramienta protege una dimensión diferente.

## 24. Formato y código muerto

Prettier no debe utilizarse como mecanismo para ocultar código muerto.

Imports no utilizados, variables innecesarias y ramas muertas deben ser detectados por TypeScript/ESLint y eliminados correctamente.

## 25. Formato y refactorizaciones

Cuando un refactor modifica muchos archivos, se recomienda:

1. realizar el cambio funcional;
2. ejecutar Prettier;
3. revisar el diff;
4. ejecutar ESLint;
5. ejecutar TypeScript;
6. ejecutar tests;
7. verificar CI.

El objetivo es distinguir errores reales de ruido de formato.

## 26. No reconstruir archivos manualmente

Una regla crítica para SGCI:

**No reconstruir manualmente archivos grandes para solucionar un fallo de Prettier cuando pueda obtenerse el resultado exacto del formatter.**

Esto evita:

- pérdida accidental de código;
- cambios semánticos involuntarios;
- eliminación de imports;
- cambios de comportamiento;
- diferencias difíciles de revisar.

Ante un fallo de formato, la solución preferida es ejecutar la misma versión de Prettier que utiliza el proyecto.

## 27. Verificación antes del PR

Antes de abrir o actualizar un PR:

```bash
npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

Si falla:

```bash
npx prettier --write "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

Después se debe revisar el diff y ejecutar nuevamente `--check`.

## 28. Verificación después de cambios remotos

Cuando una corrección se aplica directamente en GitHub, no debe afirmarse que el formato está solucionado únicamente porque el archivo parece visualmente correcto.

Debe verificarse mediante:

- CI;
- ejecución real de Prettier;
- o evidencia equivalente confiable.

Esto es especialmente importante en SGCI porque el Quality Gate ha fallado históricamente exclusivamente por formato.

## 29. CI como autoridad

La condición de aceptación debe ser:

```text
Prettier --check → SUCCESS
```

Un archivo que funciona pero falla Prettier no está terminado desde el punto de vista del estándar del proyecto.

## 30. Performance

Prettier debe ejecutarse con un alcance razonable.

En repositorios grandes, utilizar archivos modificados para feedback local y el alcance completo requerido por CI para la validación definitiva.

No introducir patrones de configuración que hagan el formatter innecesariamente lento.

## 31. Consistencia entre API y Web

API y Web deben compartir una filosofía de formato.

Si existen diferencias necesarias, deben estar explícitamente justificadas.

La existencia de dos aplicaciones no justifica dos estándares de estilo incompatibles.

## 32. Documentación

Los cambios relevantes de configuración deben quedar documentados.

Como mínimo deben ser comprensibles:

- versión de Prettier;
- configuración utilizada;
- archivos incluidos;
- comando local;
- comando CI;
- política de excepciones.

## 33. Definition of Done — Prettier

Un cambio cumple el estándar cuando:

- [ ] utiliza la versión fijada del proyecto;
- [ ] `prettier --check` pasa;
- [ ] no existen ignores innecesarios;
- [ ] no se introducen configuraciones locales contradictorias;
- [ ] ESLint y Prettier no compiten por formato;
- [ ] el diff no contiene reformateos accidentales;
- [ ] CI confirma el formato;
- [ ] el código continúa pasando TypeScript, lint y tests.

## 34. Reglas de oro para SGCI

1. Una versión de Prettier para todo el repositorio salvo excepción justificada.
2. La configuración debe estar versionada.
3. CI siempre debe ejecutar `prettier --check`.
4. El desarrollador debe utilizar la versión local del proyecto.
5. No confiar en formato manual.
6. No mezclar preferencias personales con el estándar.
7. No desactivar Prettier para evitar trabajo normal.
8. Los ignores deben ser excepcionales.
9. Revisar siempre el diff después de `--write`.
10. No reconstruir manualmente archivos grandes para corregir formato.
11. Prettier no sustituye TypeScript, ESLint ni tests.
12. Un PR no está completo si el Quality Gate de formato falla.
13. Los cambios de configuración requieren revisión.
14. Mantener API y Web coherentes.
15. La misma entrada debe producir el mismo formato en local y CI.
16. Automatizar formato antes de la revisión humana.
17. Mantener el formatter fuera de discusiones subjetivas de code review.
18. Evitar reformateos masivos sin objetivo técnico.
19. Verificar CI antes de declarar un PR terminado.
20. El formato es una condición de calidad, no un detalle cosmético.

## 35. Referencias oficiales

- Prettier documentation: https://prettier.io/docs/
- Prettier options: https://prettier.io/docs/options
- Prettier CLI: https://prettier.io/docs/cli
- Prettier configuration: https://prettier.io/docs/configuration
- Prettier ignore: https://prettier.io/docs/ignore
- Prettier integrations: https://prettier.io/docs/editors
