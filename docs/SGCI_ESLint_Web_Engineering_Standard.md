# SGCI — ESLint Web Engineering Standard

## 1. Propósito

Este documento define el estándar profesional de ESLint para el frontend TypeScript de SGCI.

ESLint no debe utilizarse únicamente para eliminar errores de estilo. Su objetivo es detectar defectos, reducir deuda técnica, imponer límites arquitectónicos y proteger el comportamiento del frontend antes de producción.

Este estándar complementa:

- `SGCI_TypeScript_Web_Engineering_Standard.md`
- `SGCI_TypeScript_API_Engineering_Standard.md`
- `SGCI_Prisma_Engineering_Standard.md`

## 2. Principios

1. ESLint debe ejecutarse automáticamente en CI.
2. Las reglas deben priorizar defectos reales sobre preferencias cosméticas.
3. TypeScript debe permanecer estrictamente tipado.
4. No se debe desactivar una regla global para resolver un problema local.
5. Los `any` deben evitarse y las excepciones deben ser explícitas.
6. Las Promises deben gestionarse de forma segura.
7. Los componentes deben mantener responsabilidades claras.
8. Los hooks deben respetar sus reglas de uso y dependencias.
9. Las reglas de accesibilidad deben formar parte del linting cuando el stack lo permita.
10. Los imports deben ser predecibles y no crear dependencias circulares innecesarias.
11. ESLint y Prettier deben tener responsabilidades separadas.
12. Los warnings importantes no deben convertirse silenciosamente en deuda permanente.
13. Las excepciones deben documentar el motivo técnico.
14. El lint debe proteger el diseño del frontend, no bloquear cambios legítimos sin razón.

## 3. Configuración

La configuración debe mantenerse versionada junto al proyecto.

Cuando el ecosistema utilizado lo permita, preferir el formato de configuración moderno y soportado por la versión instalada de ESLint.

La configuración debe distinguir claramente:

```text
TypeScript
React / framework
Testing
Accessibility
Imports
Promises
Security
Code quality
Generated files
Build output
```

No copiar configuraciones enormes sin entender qué problema resuelve cada regla.

## 4. Alcance

ESLint debe ejecutarse sobre el código fuente mantenido por el equipo.

Excluir de forma explícita artefactos generados, cuando corresponda:

- `node_modules`;
- builds;
- coverage;
- archivos generados automáticamente;
- artefactos temporales.

No utilizar exclusiones para esconder código de aplicación que debería corregirse.

## 5. TypeScript

La configuración debe trabajar con TypeScript de forma consciente.

Siempre que el proyecto tenga la infraestructura necesaria, las reglas que requieren información de tipos deben utilizarse especialmente para código asíncrono y errores potencialmente peligrosos.

La validación de ESLint no sustituye `tsc`.

Deben mantenerse ambos controles:

```text
ESLint → calidad, patrones y errores potenciales
TypeScript → sistema de tipos y compilación
```

## 6. `any`

Evitar `any` en el frontend.

Especialmente problemáticos:

```ts
const data: any = ...;
function render(value: any) { ... }
```

Preferir:

- tipos concretos;
- `unknown`;
- type guards;
- validadores;
- tipos derivados de contratos API.

Un `eslint-disable` relacionado con `any` debe ser excepcional y explicar por qué es inevitable.

## 7. Nullability y tipos seguros

Las reglas deben ayudar a detectar:

- acceso inseguro a valores opcionales;
- valores posiblemente `null`;
- propiedades inexistentes;
- casts innecesarios;
- ramas imposibles.

No utilizar ESLint para ocultar errores de nullability mediante casts indiscriminados.

## 8. Promises

El frontend de SGCI realiza operaciones HTTP, polling y mutaciones, por lo que el tratamiento de Promises es crítico.

Cuando `typescript-eslint` y el parser configurado lo permitan, deben considerarse reglas como:

- `@typescript-eslint/no-floating-promises`;
- `@typescript-eslint/no-misused-promises`;
- `@typescript-eslint/await-thenable`;
- `@typescript-eslint/no-misused-promises` en callbacks y eventos.

### 8.1 No floating promises

No permitir operaciones asíncronas que puedan fallar y queden sin manejar.

Evitar:

```ts
saveImport();
```

si `saveImport()` devuelve una Promise cuyo rechazo importa.

Preferir:

```ts
await saveImport();
```

o manejar explícitamente el caso donde no sea necesario esperar.

### 8.2 Eventos

Los handlers de UI deben respetar el contrato esperado por el framework.

Si un callback síncrono no debe recibir directamente una función async, adaptar el flujo explícitamente en lugar de ignorar el warning.

## 9. Hooks

Para React, deben utilizarse las reglas oficiales/recomendadas del ecosistema correspondiente.

Especialmente:

- reglas de hooks;
- dependencias de efectos;
- reglas de componentes cuando sean aplicables.

No desactivar una regla de dependencias simplemente porque añadir la dependencia revela un problema de diseño.

## 10. `useEffect`

ESLint debe ayudar a detectar dependencias incorrectas o incompletas.

Antes de silenciar una advertencia de dependencias, evaluar si existe:

- función recreada innecesariamente;
- estado derivado incorrectamente;
- efecto con responsabilidad excesiva;
- dependencia circular;
- arquitectura que debería separarse.

Un `eslint-disable` permanente en un efecto debe justificar el motivo.

## 11. Polling

El polling del Centro de Control de Importaciones es especialmente sensible.

ESLint debe ayudar a prevenir patrones como:

```ts
setInterval(async () => {
  await refresh();
}, 2000);
```

cuando el patrón pueda provocar solapamiento de solicitudes, errores no manejados o cleanup incorrecto.

Debe existir una estrategia clara para:

- inicio;
- intervalo;
- cancelación;
- cleanup;
- errores;
- estados terminales;
- desmontaje del componente;
- prevención de solicitudes concurrentes innecesarias.

## 12. Variables no utilizadas

Las variables, imports, parámetros y funciones no utilizados deben eliminarse.

Una excepción solo debe utilizarse cuando el parámetro o símbolo tenga una función contractual real.

No conservar código muerto bajo la excusa de que podría utilizarse posteriormente.

## 13. Imports

Mantener imports limpios y deterministas.

Evitar:

- imports duplicados;
- imports no utilizados;
- dependencias circulares;
- rutas internas frágiles;
- acceso accidental a módulos privados de otra feature.

Cuando el proyecto tenga reglas de alias, deben aplicarse consistentemente.

## 14. Dependencias entre features

ESLint puede utilizarse para reforzar límites arquitectónicos.

Una feature no debería depender arbitrariamente de detalles internos de otra feature.

Preferir contratos públicos:

```text
feature A
   ↓
public API de feature B
```

en lugar de:

```text
feature A
   ↓
archivo interno privado de feature B
```

## 15. Componentes

ESLint debe favorecer componentes pequeños y comprensibles.

No utilizar reglas de lint como sustituto de una arquitectura adecuada, pero sí detectar señales como:

- complejidad excesiva;
- funciones gigantes;
- demasiadas variables locales;
- anidamiento excesivo;
- código duplicado evidente.

Cuando una pantalla se vuelve demasiado compleja, dividirla por responsabilidades.

## 16. Complejidad

La complejidad ciclomática debe mantenerse bajo control.

Una función con numerosas condiciones puede indicar:

- demasiadas responsabilidades;
- lógica de negocio dentro de la UI;
- estados mal modelados;
- falta de funciones auxiliares;
- necesidad de una máquina de estados o discriminated union.

No bajar artificialmente el límite de complejidad solo para satisfacer el lint.

## 17. Condicionales

Evitar condicionales redundantes y ramas imposibles.

Preferir expresiones claras frente a cadenas de ternarios difíciles de leer.

La prioridad es que el comportamiento sea evidente para otro desarrollador.

## 18. Comparaciones y coerción

Evitar comparaciones ambiguas y coerción implícita salvo casos deliberados y documentados.

Preferir comparaciones estrictas y conversiones explícitas.

Esto es especialmente importante al procesar:

- query parameters;
- respuestas API;
- valores de formularios;
- `localStorage`;
- datos provenientes de URL.

## 19. Variables y mutabilidad

Preferir `const` cuando una referencia no cambia.

Evitar mutaciones innecesarias de objetos y arrays compartidos.

La inmutabilidad facilita razonar sobre renders, cache y estado.

## 20. Accesibilidad

Para React u otros frameworks soportados, integrar las reglas de accesibilidad apropiadas.

Detectar, cuando las herramientas lo soporten:

- imágenes sin texto alternativo;
- labels incorrectos;
- elementos interactivos no accesibles;
- roles inválidos;
- navegación por teclado deficiente;
- problemas de nombres accesibles.

ESLint no sustituye una auditoría completa de accesibilidad.

## 21. Seguridad

ESLint debe formar parte de la defensa contra patrones inseguros, pero no debe considerarse una frontera de seguridad.

Revisar especialmente:

- HTML arbitrario;
- APIs de ejecución dinámica;
- manipulación peligrosa del DOM;
- URLs no confiables;
- almacenamiento de secretos;
- datos controlados por usuario.

Un warning de seguridad no debe resolverse simplemente con `eslint-disable` sin una revisión técnica.

## 22. XSS y HTML dinámico

Evitar mecanismos de HTML dinámico salvo necesidad real.

Cuando una funcionalidad requiera HTML proporcionado por una fuente externa o por usuarios, debe existir sanitización apropiada y una justificación documentada.

El frontend no debe confiar en que un valor es seguro únicamente porque proviene de la API.

## 23. Logging

Evitar `console.log` permanente en código de producción salvo que forme parte de una estrategia deliberada de observabilidad.

No registrar:

- tokens;
- cookies sensibles;
- credenciales;
- información personal innecesaria;
- respuestas completas que puedan contener datos sensibles.

Los logs temporales deben eliminarse antes de cerrar una tarea.

## 24. Errores

Los bloques `catch` no deben ocultar errores.

Evitar:

```ts
try {
  await operation();
} catch {
  // nada
}
```

si el error tiene impacto funcional.

Un error puede:

- mostrarse al usuario;
- registrarse técnicamente;
- convertirse en un estado de UI;
- reintentarse;
- propagarse.

Pero debe existir una decisión explícita.

## 25. Manejo de estados

Las reglas de lint deben convivir con un modelo explícito de estados.

Para operaciones remotas, preferir estados que representen claramente:

```text
idle
loading
success
error
```

Y para jobs:

```text
queued
running
completed
failed
```

No introducir booleanos contradictorios como:

```ts
isLoading === true
isFinished === true
hasError === true
```

sin una razón clara para permitir esas combinaciones.

## 26. Código muerto

Eliminar:

- funciones sin referencias;
- imports muertos;
- variables sin uso;
- ramas inalcanzables;
- componentes abandonados.

El código muerto aumenta la superficie de mantenimiento y dificulta las revisiones.

## 27. Comentarios y disables

Un comentario ESLint debe explicar una excepción real.

Preferir:

```ts
// eslint-disable-next-line <regla> -- Motivo técnico y estable.
```

Evitar:

```ts
// eslint-disable-next-line
```

sin regla ni explicación.

No utilizar `eslint-disable` a nivel de archivo para ocultar problemas de una funcionalidad completa salvo una razón excepcional.

## 28. Reglas y responsabilidades

ESLint debe encargarse principalmente de:

- errores potenciales;
- patrones peligrosos;
- TypeScript safety;
- hooks;
- imports;
- accesibilidad;
- complejidad;
- seguridad;
- calidad estructural.

Prettier debe encargarse principalmente del formato.

No duplicar innecesariamente reglas de formato en ESLint si Prettier ya controla ese aspecto.

## 29. ESLint + Prettier

El pipeline debe poder ejecutar ambos controles sin conflicto.

Conceptualmente:

```text
ESLint → calidad y correctness
Prettier → formato
TypeScript → tipos
Tests → comportamiento
Build → artefacto ejecutable
```

El hecho de que ESLint pase no significa que Prettier pase.

## 30. Tests

Las reglas deben contemplar el código de pruebas con una configuración apropiada.

No aplicar automáticamente todas las restricciones del código de producción a tests si perjudican su claridad.

Aun así, los tests deben mantener:

- imports limpios;
- Promises correctamente gestionadas;
- ausencia de errores silenciosos;
- tipos razonables;
- cleanup correcto.

## 31. Testing Library

Cuando se utilice Testing Library, preferir patrones centrados en comportamiento del usuario.

Evitar reglas o prácticas que fomenten dependencia excesiva de detalles internos del componente.

Preferir queries accesibles y comportamiento observable.

## 32. Dependencias externas

No introducir plugins ESLint sin una necesidad clara.

Antes de añadir una regla o plugin:

1. comprobar compatibilidad con la versión instalada de ESLint;
2. comprobar compatibilidad con TypeScript/framework;
3. revisar mantenimiento del proyecto;
4. evaluar coste de configuración;
5. confirmar que detecta un problema relevante.

## 33. CI

ESLint debe formar parte del Quality Gate.

Una ejecución representativa debe ser equivalente a:

```bash
npm run lint --workspace=@sgci/web
```

La configuración exacta debe seguir los scripts reales del repositorio.

El CI debe ejecutar ESLint sobre el código que será construido y probado.

## 34. Política de errores

En código de producción:

- errores reales de ESLint deben corregirse;
- no convertir indiscriminadamente errores en warnings;
- no desactivar reglas para acelerar un PR;
- no aceptar deuda de lint sin una razón explícita.

Si temporalmente existe una excepción, debe existir un plan razonable para eliminarla.

## 35. Monorepo

SGCI contiene API y Web.

Las reglas compartidas pueden centralizarse cuando realmente sean comunes, pero no deben forzar falsas equivalencias entre backend y frontend.

Ejemplo conceptual:

```text
eslint base
   ├── API rules
   └── Web rules
```

Las reglas específicas del navegador, React o UI deben permanecer en la configuración Web.

## 36. Generated code

No modificar manualmente código generado para satisfacer ESLint.

Si el código generado debe estar fuera del análisis, excluirlo de manera explícita.

La fuente que produce el código debe ser la que se revise.

## 37. Rendimiento del lint

La configuración debe mantenerse suficientemente rápida para que el equipo pueda ejecutarla con frecuencia.

Si una regla costosa aporta poco valor, evaluar su utilidad.

Las reglas que requieren información de tipos deben habilitarse deliberadamente y medirse cuando el repositorio crezca.

## 38. Migraciones de configuración

Cuando se actualice ESLint, TypeScript, `typescript-eslint`, React o el framework:

1. revisar breaking changes;
2. revisar configuración;
3. ejecutar lint;
4. revisar nuevos warnings;
5. revisar tests;
6. revisar build;
7. actualizar esta documentación si cambia el estándar.

No actualizar herramientas críticas solamente para eliminar warnings sin comprender el cambio.

## 39. Code Review

Antes de aprobar un cambio Web:

- ¿ESLint pasa?
- ¿TypeScript pasa?
- ¿Prettier pasa?
- ¿Hay `any` nuevo?
- ¿Hay `eslint-disable` nuevo?
- ¿Las Promises están correctamente gestionadas?
- ¿Los efectos tienen dependencias correctas?
- ¿Existe polling sin cleanup?
- ¿Se introdujo un import arquitectónicamente incorrecto?
- ¿Hay código muerto?
- ¿Se introdujo una vulnerabilidad potencial?
- ¿La accesibilidad se mantiene?

## 40. Definition of Done — ESLint Web

Una tarea no debe considerarse terminada cuando solamente funciona manualmente.

Debe cumplir como mínimo:

- ESLint verde;
- TypeScript verde;
- Prettier verde;
- tests relevantes verdes;
- build Web verde;
- excepciones ESLint justificadas;
- sin secretos ni datos sensibles expuestos;
- sin Promises flotantes relevantes;
- sin errores silenciosos;
- sin deuda evidente introducida deliberadamente.

## 41. Reglas críticas para SGCI

Por las características de SGCI, deben considerarse especialmente críticas:

1. `no-floating-promises`.
2. `no-misused-promises`.
3. reglas de hooks/dependencias.
4. no-unused-vars/imports.
5. reglas de accesibilidad.
6. detección de complejidad excesiva.
7. patrones inseguros de HTML/DOM.
8. control de `any`.
9. control de errores silenciosos.
10. cleanup de timers y polling.
11. dependencias arquitectónicas entre features.
12. reglas que eviten código muerto.

## 42. Relación con el Centro de Control de Importaciones

La UI del importador debe considerarse una operación asíncrona crítica.

ESLint debe ayudar a evitar:

- polling que continúe después de finalizar el job;
- múltiples intervalos para el mismo job;
- Promises sin manejo;
- callbacks async incorrectos;
- efectos que se ejecuten por dependencias mal definidas;
- actualización de estado después de recursos obsoletos;
- errores de API ocultos;
- lógica de negocio duplicada dentro de componentes.

El frontend debe consumir el estado persistido del job y no reconstruir resultados importantes mediante consultas ambiguas.

## 43. Política de `eslint-disable`

Toda excepción debe responder a tres preguntas:

1. ¿Qué regla se desactiva?
2. ¿Por qué el código correcto requiere esta excepción?
3. ¿Por qué no puede resolverse mejorando el diseño?

Si no existe una respuesta clara, la excepción no debe aceptarse.

## 44. Quality Gate recomendado

El flujo de calidad del Web debe mantenerse conceptualmente así:

```text
Install
  ↓
TypeScript
  ↓
ESLint
  ↓
Prettier
  ↓
Tests
  ↓
Build
```

Una etapa verde no sustituye las demás.

## 45. Referencias oficiales

La implementación concreta debe seguir la documentación oficial de las versiones instaladas:

- ESLint: https://eslint.org/docs/latest/
- ESLint Configuration: https://eslint.org/docs/latest/use/configure/
- typescript-eslint: https://typescript-eslint.io/
- typescript-eslint Rules: https://typescript-eslint.io/rules/
- React ESLint: https://react.dev/learn
- Testing Library: https://testing-library.com/docs/
- Prettier: https://prettier.io/docs/
- TypeScript: https://www.typescriptlang.org/docs/

## 46. Golden Rules

1. ESLint no es solo formato.
2. `tsc` y ESLint cumplen funciones diferentes.
3. No permitir Promises importantes sin manejo.
4. No ocultar errores con `eslint-disable`.
5. No introducir `any` sin justificación.
6. No ignorar reglas de hooks sin comprender el efecto.
7. No crear polling sin cleanup y condición terminal.
8. No confiar en el frontend para autorización.
9. No registrar secretos o datos sensibles.
10. No mantener código muerto.
11. Mantener imports limpios.
12. Respetar límites entre features.
13. Mantener accesibilidad como requisito funcional.
14. No usar ESLint para reemplazar tests.
15. No usar tests para justificar código inseguro.
16. Mantener ESLint y Prettier con responsabilidades claras.
17. Ejecutar lint en CI.
18. Revisar las excepciones durante code review.
19. Actualizar la configuración conscientemente al actualizar dependencias.
20. Un frontend profesional debe ser correcto, seguro, accesible y mantenible, no solamente compilable.
