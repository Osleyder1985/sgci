# SGCI — TypeScript Web Engineering Standard

## 1. Propósito

Este documento define el estándar de ingeniería para el código TypeScript del frontend web de SGCI.

El objetivo no es únicamente que el código compile. El frontend debe ser tipado, predecible, accesible, mantenible, observable, seguro, testeable y resistente a cambios del backend.

Este estándar complementa:

- `SGCI_Prisma_Engineering_Standard.md`
- `SGCI_TypeScript_API_Engineering_Standard.md`

## 2. Principios fundamentales

1. TypeScript debe detectar errores antes de producción siempre que sea posible.
2. La UI no debe convertirse en el lugar donde se concentra la lógica de negocio.
3. Los contratos del backend deben estar representados mediante tipos y validación.
4. El estado debe tener una única fuente de verdad.
5. Las operaciones asíncronas deben tener estados explícitos: idle, loading, success y error cuando corresponda.
6. Los errores deben ser visibles y accionables; nunca deben ocultarse silenciosamente.
7. Los componentes deben ser pequeños y tener responsabilidades claras.
8. La accesibilidad es parte del contrato funcional, no un acabado posterior.
9. El frontend debe manejar correctamente loading, empty, partial y error states.
10. La seguridad no puede depender de que el frontend oculte controles.
11. Las pruebas deben verificar comportamiento observable, no implementación interna.
12. Performance debe medirse y protegerse, especialmente en tablas, listas, polling e importaciones grandes.
13. La consistencia visual y técnica debe prevalecer sobre soluciones ad-hoc.
14. El código muerto, tipos `any` innecesarios y duplicación deben eliminarse.

## 3. TypeScript estricto

El proyecto debe utilizar una configuración estricta de TypeScript.

Como mínimo deben evaluarse y mantenerse activas las garantías equivalentes a:

- `strict`
- `noImplicitAny`
- `strictNullChecks`
- `noImplicitReturns`
- `noEmit` para validaciones de tipos en CI cuando el build sea responsabilidad del bundler

No se debe desactivar una regla estricta globalmente para solucionar un problema local.

Si una excepción es imprescindible, debe ser local, justificada y revisable.

### 3.1 `any`

`any` elimina garantías del compilador y debe evitarse.

Preferir:

- tipos concretos;
- `unknown` para datos externos desconocidos;
- type guards;
- schemas de validación;
- tipos derivados de contratos.

Un `any` temporal debe tener una justificación técnica y no convertirse en deuda permanente.

### 3.2 `unknown`

Los datos procedentes de:

- `fetch`;
- APIs externas;
- `localStorage`;
- parámetros dinámicos;
- mensajes externos;
- respuestas no confiables;

deben considerarse no confiables hasta ser validados.

## 4. Arquitectura del frontend

El frontend debe separar como mínimo:

```text
UI / Components
      ↓
Feature / Presentation Logic
      ↓
Application State / Queries / Mutations
      ↓
API Client / Contract Layer
      ↓
HTTP / Backend API
```

Cuando el proyecto lo requiera pueden existir además:

```text
shared/
features/
components/
lib/
api/
state/
utils/
types/
tests/
```

La estructura exacta debe seguir la organización real del proyecto, pero debe evitarse una carpeta gigante de componentes sin límites funcionales.

## 5. Organización por funcionalidades

Cuando una funcionalidad tenga suficiente complejidad, debe agrupar su código por dominio o feature.

Ejemplo conceptual:

```text
features/
  manifiestos/
    components/
    hooks/
    api/
    types/
    utils/
    tests/
```

Esto reduce acoplamiento y facilita eliminar o evolucionar una funcionalidad completa.

Los componentes realmente compartidos deben permanecer fuera de una feature específica.

## 6. Componentes

Cada componente debe tener una responsabilidad clara.

Evitar componentes que simultáneamente:

- hagan llamadas HTTP;
- transformen grandes cantidades de datos;
- contengan reglas de negocio;
- gestionen formularios complejos;
- manejen navegación;
- rendericen toda la pantalla;
- y controlen polling.

Dividir responsabilidades cuando el componente se vuelva difícil de leer, probar o reutilizar.

### 6.1 Props

Las props deben estar tipadas explícitamente.

Preferir interfaces o type aliases claros y pequeños.

Evitar props genéricas como:

```ts
props: any
```

No pasar objetos completos cuando el componente solo necesita unas pocas propiedades, salvo que exista una razón clara para hacerlo.

### 6.2 Componentes presentacionales

Cuando sea posible, separar:

- componentes de presentación;
- lógica de interacción;
- acceso a datos;
- estado de aplicación.

Esto facilita las pruebas y reduce el acoplamiento.

## 7. Estado

Cada estado debe tener un propietario claro.

Clasificar el estado antes de almacenarlo:

1. Estado local de UI.
2. Estado de formulario.
3. Estado de servidor/cache.
4. Estado global de aplicación.
5. Estado derivado.

No guardar como estado aquello que puede calcularse de manera determinista a partir de otros datos.

### 7.1 Estado derivado

Evitar:

```ts
const [total, setTotal] = useState(0);
```

si `total` siempre puede calcularse a partir de una colección ya existente.

Preferir valores derivados para evitar inconsistencias.

### 7.2 Estado global

No colocar todo en un store global.

El estado global debe reservarse para información que realmente necesita ser compartida entre partes no relacionadas directamente de la UI.

## 8. Datos del servidor

El estado proveniente del backend debe diferenciarse del estado puramente visual.

Una operación remota debe representar claramente:

```text
idle → loading → success
              ↘ error
```

En operaciones largas también pueden existir:

```text
queued → running → completed
                 ↘ failed
```

Esto es especialmente importante para el Centro de Control de Importaciones de SGCI.

## 9. Cliente HTTP y contratos API

El acceso HTTP debe centralizarse cuando sea posible.

No duplicar lógica de:

- base URL;
- headers;
- autenticación;
- serialización;
- manejo de errores;
- timeout;
- parsing;
- logging;

en decenas de componentes.

Los componentes deberían consumir una API de aplicación tipada, por ejemplo:

```ts
const result = await manifiestosApi.getImportJob(jobId);
```

en lugar de construir manualmente URLs y respuestas HTTP dentro de la UI.

## 10. Validación de respuestas

No asumir que una respuesta HTTP exitosa significa que los datos son correctos.

Los datos externos deben validarse cuando el riesgo o complejidad lo justifique.

Una respuesta desconocida debe pasar de:

```ts
unknown
```

a un tipo confiable mediante validación.

No hacer casts indiscriminados:

```ts
const data = response as SomeType;
```

si no existe evidencia de que la estructura es realmente compatible.

## 11. Tipos de dominio

Los tipos deben representar el dominio real.

Ejemplo:

```ts
interface ImportJob {
  id: string;
  status: ImportJobStatus;
  processed: number;
  total: number;
}
```

No utilizar un único tipo gigantesco para representar todas las respuestas del sistema.

Separar DTOs, modelos de UI y tipos internos cuando sus responsabilidades sean diferentes.

## 12. Estados discriminados

Para operaciones con estados mutuamente excluyentes, preferir unions discriminadas.

Ejemplo:

```ts
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

Esto obliga a la UI a tratar explícitamente cada escenario.

## 13. Nullability

`null` y `undefined` deben tener significado.

No ocultar la ausencia de datos mediante valores artificiales como:

```ts
''
0
[]
```

cuando semánticamente significan otra cosa.

La UI debe distinguir, cuando corresponda:

- dato inexistente;
- dato vacío;
- dato todavía no cargado;
- dato no disponible;
- dato inválido.

## 14. Async/Await

Preferir `async/await` para flujos asíncronos complejos.

Toda Promise relevante debe:

- esperarse;
- retornarse;
- o manejarse explícitamente.

No ignorar errores mediante Promises flotantes.

Especial atención a callbacks de eventos, efectos y polling.

## 15. Effects y ciclo de vida

Los efectos deben utilizarse para sincronizar el componente con sistemas externos.

No usar efectos simplemente para calcular valores derivados que podrían calcularse directamente.

Los efectos que crean:

- timers;
- intervals;
- listeners;
- subscriptions;
- polling;

deben liberar siempre sus recursos.

Ejemplo conceptual:

```ts
useEffect(() => {
  const timer = setInterval(refresh, 2000);

  return () => clearInterval(timer);
}, [refresh]);
```

## 16. Polling

El polling debe ser controlado.

Debe definir explícitamente:

- intervalo;
- condición de inicio;
- condición de finalización;
- cleanup;
- comportamiento ante errores;
- comportamiento cuando el componente desaparece;
- prevención de solicitudes duplicadas;
- límites razonables de frecuencia.

Para los jobs de importación de SGCI, el polling debe detenerse cuando el job llegue a un estado terminal como `COMPLETED` o `FAILED`, según el contrato real.

No crear un `setInterval` por render.

## 17. AbortController y cancelación

Las solicitudes que puedan quedar obsoletas deben poder cancelarse cuando sea apropiado.

Especialmente importante para:

- búsquedas;
- autocompletado;
- navegación rápida;
- cambios de filtros;
- componentes desmontados.

La cancelación debe distinguirse de un error real de negocio.

## 18. Formularios

Los formularios deben separar:

- valores;
- validación;
- errores por campo;
- errores generales;
- estado de envío;
- éxito;
- reset.

Validar tanto en frontend como backend.

La validación del frontend mejora UX; nunca sustituye la validación del servidor.

## 19. Accesibilidad

Toda UI debe ser usable mediante teclado y tecnologías de asistencia cuando corresponda.

Requisitos fundamentales:

- HTML semántico;
- labels asociados a inputs;
- botones reales para acciones;
- focus visible;
- navegación por teclado;
- nombres accesibles;
- mensajes de error comprensibles;
- estados de loading anunciables cuando sea necesario;
- tablas con estructura semántica;
- contraste adecuado.

No usar un `<div>` con `onClick` como sustituto de un botón cuando un `<button>` resuelve el problema.

## 20. Loading, empty y error states

Toda pantalla que dependa de datos remotos debe definir al menos:

1. Loading.
2. Success con datos.
3. Success sin datos.
4. Error.

Cuando exista información parcial, debe mostrarse explícitamente como parcial y no confundirse con ausencia de datos.

## 21. Errores

Los errores del backend deben transformarse en mensajes útiles para el usuario sin exponer información sensible.

No mostrar directamente:

- stack traces;
- SQL;
- tokens;
- claves API;
- detalles internos del servidor.

El logging técnico debe mantenerse separado de los mensajes de usuario.

## 22. Seguridad del frontend

El frontend nunca debe considerarse una frontera de seguridad.

Autorización real debe existir en el backend.

No confiar en:

- botones ocultos;
- rutas ocultas;
- variables JavaScript;
- permisos almacenados únicamente en cliente.

### 22.1 XSS

Evitar insertar HTML arbitrario.

No utilizar mecanismos equivalentes a `dangerouslySetInnerHTML` salvo necesidad real y con sanitización adecuada.

### 22.2 Secretos

Nunca colocar secretos reales en código frontend.

Todo valor enviado al navegador debe considerarse público.

Las claves privadas, tokens de servicio y credenciales deben permanecer en backend/infraestructura segura.

### 22.3 Storage

No guardar información sensible en `localStorage` por comodidad sin analizar las implicaciones de seguridad.

## 23. Routing y navegación

Las rutas deben tener una responsabilidad clara.

Los parámetros de ruta y query string deben validarse antes de usarse.

Una ruta protegida debe estar respaldada por autorización real en backend.

La navegación después de una mutación debe ser determinista y coherente con el estado persistido.

## 24. Performance

No optimizar prematuramente, pero tampoco ignorar problemas evidentes.

Vigilar especialmente:

- listas grandes;
- tablas;
- renders repetitivos;
- imágenes;
- polling;
- consultas duplicadas;
- serialización de grandes objetos;
- componentes demasiado pesados;
- bundle size.

## 25. Listas y tablas grandes

Para grandes volúmenes de datos, preferir:

- paginación server-side;
- filtros server-side;
- ordenamiento server-side;
- virtualización cuando sea necesaria;
- selección incremental.

No descargar miles de registros al navegador simplemente para filtrarlos localmente si el backend puede realizarlo correctamente.

## 26. Memoización

Usar memoización solo cuando exista una razón medible o una necesidad clara de estabilidad referencial.

No convertir todo en:

- `useMemo`;
- `useCallback`;
- `memo`;

sin evidencia de beneficio.

## 27. Imágenes y recursos

Optimizar imágenes y evitar cargar recursos innecesarios.

Utilizar lazy loading cuando sea apropiado.

Los assets grandes no deben bloquear innecesariamente la carga inicial.

## 28. Internacionalización y formato

Fechas, números, pesos y textos deben mostrarse de acuerdo con las reglas funcionales del producto.

No concatenar manualmente formatos sensibles a locale cuando APIs estándar resuelvan el problema.

Para cantidades numéricas, distinguir claramente:

- valor interno;
- unidad;
- representación visual.

## 29. Fechas y zonas horarias

No asumir que una fecha sin zona horaria representa un instante universal.

Distinguir entre:

- instante temporal;
- fecha de calendario;
- hora local;
- timestamp recibido del backend.

La UI debe utilizar una política consistente para mostrar timestamps.

## 30. Utilidades

Las funciones auxiliares deben ser pequeñas, puras cuando sea posible y fáciles de probar.

Evitar un archivo `utils.ts` gigante.

Preferir utilidades agrupadas por responsabilidad:

```text
format/
validation/
parsing/
dates/
numbers/
```

## 31. Reutilización

Reutilizar cuando exista una abstracción natural.

No crear abstracciones prematuras únicamente para evitar dos líneas duplicadas.

La abstracción debe reducir complejidad, no aumentarla.

## 32. Dependencias

Toda dependencia frontend debe justificar su existencia.

Antes de añadir una librería evaluar:

- mantenimiento;
- tamaño;
- seguridad;
- compatibilidad;
- licencia;
- soporte TypeScript;
- impacto en bundle;
- si el runtime ya proporciona una alternativa.

No duplicar funcionalidad existente del proyecto sin motivo.

## 33. API y mutaciones

Una mutación debe reflejar correctamente:

```text
idle → submitting → success/error
```

Después de una mutación, actualizar o invalidar el estado de servidor correspondiente.

No asumir que una mutación fue exitosa solo porque el usuario hizo click.

## 34. Idempotencia desde la UI

Las acciones sensibles deben evitar dobles envíos accidentales.

Durante una operación no idempotente:

- deshabilitar el control cuando corresponda;
- mostrar progreso;
- impedir clicks duplicados;
- manejar reintentos conscientemente.

Esto es especialmente importante en `Importar Manifiesto`.

El frontend debe ayudar a prevenir dobles ejecuciones, pero la idempotencia real debe estar garantizada por backend y base de datos cuando sea necesaria.

## 35. Centro de Control de Importaciones SGCI

Para los jobs de importación, la UI debe consumir el estado persistido del job y no intentar reconstruirlo mediante consultas ambiguas.

Debe poder representar, según el contrato real:

- `jobId`;
- estado;
- archivo/manifiesto;
- progreso;
- Houses procesados;
- bultos;
- personas;
- peso total;
- direcciones;
- geocodificación;
- velocidad;
- ETA;
- errores;
- cobertura;
- resultado final;
- rollback cuando corresponda.

La pantalla no debe mostrar “Operación completada” si el backend no ha confirmado de forma durable el estado final.

## 36. Consistencia entre backend y frontend

Cuando cambie un contrato API:

1. Identificar consumidores.
2. Actualizar tipos.
3. Actualizar cliente API.
4. Actualizar componentes.
5. Actualizar tests.
6. Ejecutar TypeScript/lint/format/tests/build.

No mantener tipos falsos para ocultar incompatibilidades.

## 37. Tests

Las pruebas deben concentrarse en comportamiento observable.

### 37.1 Unit tests

Adecuados para:

- funciones puras;
- transformaciones;
- validaciones;
- formateadores;
- reglas pequeñas.

### 37.2 Component tests

Verificar:

- render;
- interacción;
- estados;
- errores;
- accesibilidad básica;
- callbacks importantes.

### 37.3 E2E

Las rutas críticas deben cubrirse mediante pruebas end-to-end cuando el riesgo lo justifique.

Ejemplos SGCI:

- autenticación;
- navegación principal;
- importación de manifiesto;
- seguimiento de job;
- visualización de resultado;
- manejo de errores.

Las pruebas deben interactuar con la UI como un usuario real en lugar de depender de detalles internos frágiles.

## 38. Tests de estados

Una pantalla compleja debe probar al menos:

- loading;
- success;
- empty;
- error;
- acciones del usuario;
- estados terminales.

Para polling/importaciones también probar:

- job en progreso;
- job completado;
- job fallido;
- pérdida temporal de conectividad;
- desmontaje del componente;
- ausencia de polling después del estado terminal.

## 39. ESLint

ESLint debe utilizarse como barrera automatizada de calidad.

Reglas especialmente importantes:

- variables no utilizadas;
- Promises flotantes;
- Promises mal utilizadas;
- imports inválidos;
- hooks incorrectos;
- dependencias incorrectas de efectos;
- patrones peligrosos.

No desactivar una regla globalmente para solucionar un caso individual.

## 40. Prettier

El código debe formatearse automáticamente.

CI debe ejecutar una comprobación equivalente a:

```bash
npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

Una modificación no está terminada mientras el formatter no esté limpio.

## 41. CI

La validación del frontend debe incluir como mínimo, según la configuración del repositorio:

1. Instalación reproducible.
2. TypeScript sin errores.
3. Lint.
4. Prettier.
5. Tests.
6. Build.
7. CodeQL u otras comprobaciones de seguridad aplicables.

El frontend no se considera listo solo porque `npm run build` termine correctamente.

## 42. Code review

Todo cambio frontend debe revisarse buscando:

- errores de tipado ocultos;
- estados no contemplados;
- race conditions;
- memory leaks;
- polling sin cleanup;
- solicitudes duplicadas;
- manejo incorrecto de errores;
- problemas de accesibilidad;
- exposición de secretos;
- XSS;
- regresiones visuales;
- problemas de performance;
- duplicación;
- tipos demasiado amplios;
- contratos API incorrectos.

## 43. Observabilidad

Las pantallas operativas deben mostrar información suficiente para entender qué está ocurriendo.

Para operaciones largas, preferir métricas reales provenientes del backend frente a estimaciones reconstruidas en el cliente.

No registrar en consola información sensible en producción.

## 44. Manejo de concurrencia

La UI debe contemplar que las respuestas HTTP pueden llegar en un orden diferente al de las solicitudes.

Ejemplo típico:

```text
request A
request B

B responde primero
A responde después
```

Si A ya no es relevante, su respuesta no debe sobrescribir el estado producido por B.

Usar cancelación, request IDs, versionado o estrategias equivalentes cuando el flujo lo requiera.

## 45. Manejo de errores de red

Distinguir entre:

- timeout;
- cancelación;
- offline;
- error HTTP;
- respuesta inválida;
- error funcional del backend.

La UI debe proporcionar una acción apropiada, por ejemplo:

- reintentar;
- volver a cargar;
- corregir datos;
- esperar;
- contactar soporte.

## 46. No duplicar lógica de negocio

Reglas críticas como:

- autorización;
- unicidad;
- integridad;
- transacciones;
- rollback;
- idempotencia;
- validaciones críticas;

deben estar garantizadas en backend/DB.

El frontend puede anticipar errores para mejorar UX, pero no debe convertirse en la única implementación de la regla.

## 47. Compatibilidad y evolución

Los cambios de API deben ser compatibles con clientes existentes cuando corresponda.

No eliminar campos o cambiar semántica sin analizar consumidores.

Para cambios incompatibles, utilizar una estrategia explícita de versionado/migración.

## 48. Documentación del código

Comentar el “por qué”, no repetir el “qué”.

Buen comentario:

```ts
// Evitamos actualizar el progreso después del estado terminal
// porque el backend persiste el resultado final de forma atómica.
```

Mal comentario:

```ts
// Incrementa el contador
counter++;
```

## 49. Anti-patrones prohibidos o fuertemente desaconsejados

### 49.1 `any` como solución rápida

No usar `any` para silenciar TypeScript.

### 49.2 `as` indiscriminado

Un cast no valida datos.

### 49.3 `catch {}` vacío

Nunca ocultar errores relevantes.

### 49.4 Requests directamente desde cualquier componente

Centralizar acceso API cuando sea posible.

### 49.5 Polling sin cleanup

Provoca fugas, tráfico innecesario y estados inconsistentes.

### 49.6 Estado duplicado

Mantener dos fuentes de verdad produce divergencias.

### 49.7 Seguridad solo en frontend

El backend debe imponer permisos reales.

### 49.8 HTML arbitrario

Evitar inserción de HTML no confiable.

### 49.9 Componente monolítico

Dividir responsabilidades cuando la complejidad lo requiera.

### 49.10 Tests frágiles

No probar detalles internos cuando puede probarse el comportamiento observable.

## 50. Definition of Done — TypeScript Web

Un cambio frontend está terminado cuando:

- [ ] TypeScript pasa sin errores.
- [ ] No se añadió `any` innecesario.
- [ ] Los datos externos están correctamente tipados/validados.
- [ ] Los estados loading/success/empty/error están contemplados cuando corresponda.
- [ ] Los efectos tienen cleanup cuando crean recursos.
- [ ] El polling tiene inicio/finalización/cleanup definidos.
- [ ] No existen requests duplicados innecesarios.
- [ ] Las mutaciones manejan correctamente loading/success/error.
- [ ] La UI no contiene secretos.
- [ ] La autorización real permanece en backend.
- [ ] La UI es accesible en los flujos modificados.
- [ ] Tests relevantes están actualizados.
- [ ] ESLint pasa.
- [ ] Prettier pasa.
- [ ] Build pasa.
- [ ] CodeQL/seguridad pasa cuando aplica.
- [ ] No existen logs sensibles.
- [ ] No se introdujo una regresión evidente de performance.
- [ ] El contrato API coincide con backend.
- [ ] La documentación se actualizó si cambió el comportamiento público.

## 51. Checklist específico para SGCI

Antes de cerrar un cambio relacionado con Importar Manifiesto o geocodificación, revisar:

- [ ] El frontend usa el `jobId` persistido.
- [ ] El progreso mostrado proviene del estado real del job.
- [ ] Un job `FAILED` no se presenta como completado.
- [ ] Un job `COMPLETED` tiene resultado durable.
- [ ] El polling se detiene en estados terminales.
- [ ] Los errores de persistencia no se presentan como éxito.
- [ ] Rollback y sus fallos se muestran de forma coherente cuando el backend los expone.
- [ ] Las métricas de Houses, bultos, personas, peso y direcciones corresponden al resultado real.
- [ ] La UI distingue datos no encontrados, pendientes y errores cuando el contrato los diferencia.
- [ ] No se reconstruye el resultado final mediante timestamps o consultas ambiguas.
- [ ] Las acciones de importación no permiten accidentalmente doble ejecución.

## 52. Referencias oficiales

La implementación debe contrastarse con la documentación oficial de las tecnologías realmente instaladas en el proyecto.

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- TypeScript TSConfig Reference: https://www.typescriptlang.org/tsconfig/
- ESLint Documentation: https://eslint.org/docs/latest/
- typescript-eslint: https://typescript-eslint.io/
- Prettier Documentation: https://prettier.io/docs/
- React Documentation: https://react.dev/
- React Accessibility: https://react.dev/learn
- Playwright Documentation: https://playwright.dev/docs/intro
- MDN Web Docs: https://developer.mozilla.org/
- OWASP Cross Site Scripting Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- GitHub CodeQL Documentation: https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql

## 53. Reglas de oro

1. Tipos estrictos primero.
2. `unknown` antes que `any` para datos desconocidos.
3. Validar lo que viene de fuera.
4. La UI no es la frontera de seguridad.
5. Un componente debe tener una responsabilidad clara.
6. No guardar como estado lo que puede derivarse.
7. Toda operación asíncrona debe tener estados explícitos.
8. Toda suscripción, timer o polling debe limpiarse.
9. No ocultar errores.
10. No exponer secretos al navegador.
11. No confiar en casts como validación.
12. Preferir contratos API tipados.
13. Probar comportamiento observable.
14. Diseñar para loading, empty y error, no solo para success.
15. Evitar solicitudes y renders innecesarios.
16. La accesibilidad forma parte de la funcionalidad.
17. Las reglas críticas deben estar garantizadas por backend/DB.
18. Las importaciones largas deben mostrar estado real y durable.
19. Prettier, ESLint, tests y build deben estar verdes.
20. No considerar terminado un cambio que solo “compila”.
