# SGCI — TypeScript API Engineering Standard
## Guía mundial de ingeniería profesional para TypeScript en la API

**Versión:** 1.0  
**Proyecto:** SGCI  
**Ámbito:** `apps/api` y código TypeScript backend asociado  
**Estado:** Estándar de ingeniería

---

## 1. Propósito

Este documento define cómo diseñar, escribir, revisar, probar y mantener TypeScript profesional en la API de SGCI.

No es una guía de sintaxis. El objetivo es establecer un estándar para producir backend:

- correcto;
- seguro;
- tipado;
- mantenible;
- testeable;
- observable;
- resistente a errores;
- preparado para concurrencia;
- eficiente;
- evolutivo.

**Regla principal:** que TypeScript compile no significa que la API sea correcta. La calidad debe verificarse en tipos, arquitectura, lógica, persistencia, errores, seguridad, pruebas, rendimiento y operación.

---

# 2. Principios fundamentales

1. El compilador debe ayudar, no ser evitado.
2. Los tipos deben representar el dominio real.
3. `any` no debe utilizarse para ocultar problemas.
4. La entrada externa no es confiable.
5. Los errores deben ser explícitos y observables.
6. Las funciones deben tener responsabilidades claras.
7. Los servicios no deben convertirse en clases gigantes.
8. Las promesas importantes siempre deben esperarse o gestionarse explícitamente.
9. La concurrencia debe considerarse desde el diseño.
10. Las operaciones críticas deben ser idempotentes cuando corresponda.
11. La API debe validar entrada y controlar salida.
12. Los tests deben proteger comportamiento real.
13. El código debe ser legible antes que ingenioso.
14. Las abstracciones deben resolver problemas reales.
15. No se debe sacrificar integridad por comodidad.

---

# 3. Configuración estricta de TypeScript

La API debe utilizar el modo estricto siempre que sea compatible con el proyecto.

Configuración recomendada:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

Revisar especialmente:

- `strictNullChecks`;
- `noImplicitAny`;
- `noImplicitReturns`;
- `noUnusedLocals` cuando sea viable;
- `noUnusedParameters` cuando sea viable;
- `noFallthroughCasesInSwitch`;
- `noUncheckedIndexedAccess` cuando el coste de adopción sea aceptable.

No desactivar una comprobación global únicamente para solucionar un error local.

---

# 4. `any`: prohibido como solución rápida

Evitar:

```ts
const data: any = value;
```

`any` elimina precisamente la protección que TypeScript debe proporcionar.

Preferir:

```ts
unknown
```

cuando el tipo sea realmente desconocido, y después validarlo o estrecharlo.

```ts
function process(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
}
```

Un cast:

```ts
value as SomeType
```

no valida datos. Solo le dice al compilador qué asumir.

---

# 5. `unknown` y validación

Los datos procedentes de:

- HTTP;
- archivos;
- JSON;
- proveedores externos;
- colas;
- variables de entorno;
- integraciones;

deben considerarse no confiables.

El flujo correcto es:

```text
entrada externa
    ↓
validación
    ↓
normalización
    ↓
modelo interno tipado
    ↓
lógica de negocio
```

---

# 6. Nullability

No eliminar `null`/`undefined` mediante casts sin entender el dominio.

Mala solución:

```ts
user!.profile!.address!
```

Esto silencia el compilador, pero no evita un `undefined` en ejecución.

Mejor:

```ts
if (!user?.profile?.address) {
  throw new NotFoundError('Address not found');
}
```

La ausencia de un valor debe representar una condición real del dominio.

---

# 7. Tipos del dominio

Evitar tipos genéricos que permitan estados inválidos.

En vez de:

```ts
status: string;
```

cuando el conjunto sea estable:

```ts
type ImportStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED';
```

Para dominios grandes, los tipos deben derivarse del contrato existente y no duplicar arbitrariamente definiciones incompatibles.

---

# 8. Interfaces y type aliases

Usar la herramienta que exprese mejor la intención.

`type` es apropiado para:

- uniones;
- intersecciones;
- tipos derivados;
- composiciones.

`interface` es apropiado cuando se define una forma extensible de objeto o contrato público interno.

No convertir la elección en una guerra de estilo. La consistencia del proyecto es más importante que una preferencia personal.

---

# 9. Tipos derivados

Evitar duplicar tipos manualmente cuando pueden derivarse.

Herramientas útiles:

- `Pick`;
- `Omit`;
- `Partial`;
- `Required`;
- `Readonly`;
- `Record`;
- `ReturnType`;
- `Parameters`;
- `Awaited`;
- tipos condicionales cuando aporten valor.

Pero no abusar de tipos extremadamente complejos que hagan el código imposible de leer.

---

# 10. Enums, uniones y constantes

Para estados internos pequeños y estables, una unión literal puede ser excelente:

```ts
type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
```

Usar enums cuando el contrato del proyecto o la integración realmente lo requiera.

No introducir abstracciones únicamente para evitar escribir cuatro strings.

---

# 11. Variables de entorno

No asumir que una variable existe porque esté documentada.

Mala práctica:

```ts
const key = process.env.API_KEY!;
```

Mejor validar la configuración al arrancar la aplicación.

```text
process.env
   ↓
validación
   ↓
configuración tipada
   ↓
application
```

Un servicio no debería descubrir que falta una API key después de recibir tráfico real.

---

# 12. Arquitectura recomendada para la API

Estructura conceptual:

```text
Controller
   ↓
Application Service
   ↓
Domain logic
   ↓
Persistence / Prisma
   ↓
Database
```

Para integraciones:

```text
Application Service
   ├── Repository
   ├── External Provider
   └── Domain services
```

La estructura física puede adaptarse al proyecto, pero las responsabilidades deben permanecer separadas.

---

# 13. Controllers

Un controller debe ser pequeño.

Responsabilidades:

- recibir petición;
- validar/transformar entrada;
- invocar caso de uso;
- transformar resultado a respuesta HTTP.

Evitar controllers que:

- contengan cientos de líneas;
- hagan loops de negocio;
- ejecuten múltiples queries complejas;
- implementen rollback manual completo;
- llamen directamente a múltiples proveedores externos.

---

# 14. Services

Un service representa una capacidad o caso de uso coherente.

Evitar:

```text
MegaService
  ├── usuarios
  ├── manifiestos
  ├── geocoding
  ├── reportes
  ├── pagos
  └── todo lo demás
```

Preferir servicios con responsabilidades claras.

---

# 15. Funciones

Una función debe hacer una cosa razonablemente bien.

Si una función:

- parsea XLSX;
- valida;
- llama API externa;
- escribe diez tablas;
- actualiza progreso;
- calcula métricas;
- envía respuesta;

probablemente necesita descomposición.

No descomponer mecánicamente: la unidad debe seguir siendo comprensible.

---

# 16. Nombres

Los nombres deben explicar intención.

Preferir:

```ts
calculateImportProgress()
resolveCubanAddress()
persistImportResult()
```

sobre:

```ts
doIt()
processData()
handle()
```

Los booleanos deberían sonar a pregunta:

```ts
isValid
hasAddress
canRetry
isCompleted
```

---

# 17. `const` por defecto

Preferir `const`.

Usar `let` únicamente cuando la variable deba cambiar.

Evitar `var`.

---

# 18. Inmutabilidad

No mutar objetos compartidos sin necesidad.

La inmutabilidad reduce efectos secundarios, especialmente en servicios complejos y procesamiento concurrente.

Pero tampoco crear copias profundas innecesarias de grandes estructuras. Rendimiento y claridad deben evaluarse conjuntamente.

---

# 19. `readonly`

Usar `readonly` cuando una propiedad no deba cambiar después de construirse.

```ts
interface JobContext {
  readonly jobId: string;
}
```

Esto convierte una regla conceptual en una protección del compilador.

---

# 20. Async/Await

Preferir `async/await` para flujos de backend complejos.

Evitar cadenas de `.then()` innecesariamente difíciles de seguir.

---

# 21. Promesas no gestionadas

Una de las reglas críticas de SGCI:

**Una operación importante no puede lanzarse y olvidarse.**

Peligroso:

```ts
void this.importar(jobId);
await markCompleted(jobId);
```

si `markCompleted` puede ejecutarse antes de que la importación termine.

Correcto cuando el lifecycle exige esperar:

```ts
await this.importar(jobId);
await markCompleted(jobId);
```

Si realmente debe ser fire-and-forget, debe existir un mecanismo explícito de lifecycle, logging, retry y manejo de errores.

---

# 22. `Promise.all`

`Promise.all` es apropiado cuando las operaciones pueden ejecutarse en paralelo y todas son necesarias.

```ts
const [a, b] = await Promise.all([
  loadA(),
  loadB(),
]);
```

No utilizarlo indiscriminadamente cuando:

- haya límites de rate;
- existan dependencias entre operaciones;
- se pueda saturar la DB;
- se generen miles de requests simultáneas.

---

# 23. Concurrencia controlada

Para grandes volúmenes, limitar concurrencia.

Mala práctica:

```ts
await Promise.all(items.map(processItem));
```

si `items` puede contener decenas de miles de elementos.

Puede provocar:

- saturación DB;
- rate limiting externo;
- memoria elevada;
- timeouts.

Usar batching o un límite de concurrencia apropiado.

---

# 24. Manejo de errores

No utilizar excepciones como flujo normal cuando un resultado explícito sea más claro.

Pero los fallos realmente excepcionales deben propagarse correctamente.

Evitar:

```ts
try {
  await operation();
} catch {
  return null;
}
```

si `null` oculta un error operacional.

---

# 25. Errores de dominio

Crear errores semánticos cuando ayuden al sistema:

```ts
class NotFoundError extends Error {}
class ValidationError extends Error {}
class ConflictError extends Error {}
```

El controller o filtro global puede convertirlos en HTTP apropiado.

---

# 26. Mapeo HTTP

Ejemplo conceptual:

```text
ValidationError → 400
Unauthorized     → 401
Forbidden        → 403
NotFound         → 404
Conflict         → 409
Unexpected       → 500
```

No exponer detalles internos de Prisma, SQL o infraestructura directamente al cliente.

---

# 27. Logging de errores

Un error debe conservar contexto útil:

- operation;
- jobId;
- entity ID cuando sea seguro;
- etapa;
- error code;
- duración;
- proveedor externo.

Nunca incluir secretos, tokens o información sensible innecesaria.

---

# 28. Validación de entrada

La API debe validar:

- body;
- query;
- params;
- headers relevantes;
- archivos;
- estructuras JSON;
- tamaños;
- tipos;
- rangos;
- formatos.

La validación debe ocurrir antes de ejecutar operaciones críticas.

---

# 29. DTOs

Los DTOs deben representar contratos de entrada/salida.

No exponer automáticamente entidades internas de Prisma como API pública.

Evitar acoplar:

```text
Prisma model = HTTP response
```

cuando la API necesite un contrato diferente.

---

# 30. Transformación de datos

Separar cuando sea necesario:

```text
HTTP DTO
 ↓
Application command
 ↓
Domain model
 ↓
Persistence model
```

No crear capas artificiales para cada variable. Introducirlas cuando protejan contratos o responsabilidades.

---

# 31. Seguridad

TypeScript no es una frontera de seguridad.

Un tipo:

```ts
interface UserInput {
  admin: boolean;
}
```

no significa que el usuario realmente sea admin.

La autorización debe verificarse en runtime.

---

# 32. Autenticación vs autorización

Distinguir:

```text
Autenticación → ¿quién eres?
Autorización  → ¿qué puedes hacer?
```

Nunca confiar en un campo enviado por el cliente para decidir permisos.

---

# 33. Secrets

Nunca almacenar en código:

- API keys;
- passwords;
- tokens;
- credenciales DB.

Usar variables de entorno/secret manager apropiado.

No imprimir secretos en logs.

---

# 34. Inyección

No construir SQL, shell commands, URLs o expresiones peligrosas concatenando input sin control.

La validación y parametrización son obligatorias.

Esto incluye llamadas a Prisma raw SQL.

---

# 35. Archivos

En importaciones XLSX/CSV, controlar:

- tamaño máximo;
- tipo MIME cuando sea posible;
- extensión;
- estructura;
- número de filas;
- memoria;
- errores de parseo.

Nunca asumir que un archivo recibido es válido solo porque termina en `.xlsx`.

---

# 36. Servicios externos

Una integración externa debe tener:

- timeout;
- manejo de errores;
- retry cuando sea seguro;
- rate limiting cuando corresponda;
- logging;
- métricas;
- circuit breaking cuando el volumen/criticidad lo justifique;
- idempotencia cuando sea necesaria.

---

# 37. No mezclar HTTP externo con transacciones largas

Evitar:

```text
BEGIN DB
 ↓
HTTP externo
 ↓
esperar
 ↓
procesar
 ↓
COMMIT
```

Preparar información fuera y mantener las transacciones DB lo más cortas posible.

---

# 38. Prisma y TypeScript

Prisma proporciona tipos generados, pero esos tipos no sustituyen la arquitectura.

No permitir que el código quede completamente acoplado a los modelos Prisma si la capa necesita un contrato de dominio diferente.

---

# 39. Consultas y rendimiento

Revisar siempre:

- N+1;
- sobre-fetching;
- consultas dentro de loops;
- falta de índices;
- paginación;
- tamaño de resultados;
- concurrencia.

Seleccionar solo los campos necesarios cuando sea relevante.

---

# 40. Paginación

Todo endpoint que pueda devolver colecciones grandes debe definir una estrategia.

Opciones:

- offset pagination;
- cursor pagination.

El orden debe ser determinista.

---

# 41. Cache

No introducir cache como solución automática a consultas mal diseñadas.

Antes:

```text
consulta correcta
+ índice correcto
+ paginación
```

Después, si sigue siendo necesario:

```text
cache
```

La cache necesita estrategia de invalidación y consistencia.

---

# 42. Jobs de larga duración

Los procesos como importaciones no deben depender del lifecycle de una request HTTP.

Modelo recomendado:

```text
POST /import
   ↓
crear job
   ↓
procesamiento
   ↓
persistir progreso
   ↓
persistir resultado
   ↓
COMPLETED / FAILED
```

---

# 43. Estados de jobs

Los estados deben ser consistentes.

No permitir:

```text
FAILED mientras el proceso continúa
```

ni:

```text
COMPLETED antes de persistir el resultado
```

---

# 44. Idempotencia

Los endpoints y jobs críticos deben definir qué sucede si se ejecutan dos veces.

Ejemplo:

```text
mismo manifiesto
→ mismo hash
→ conflicto/control de duplicado
```

No depender únicamente de comprobaciones en memoria.

---

# 45. Concurrencia y race conditions

Analizar explícitamente:

- dos requests simultáneas;
- dos workers;
- retries;
- doble click;
- timeout del cliente con servidor aún trabajando;
- reinicio del proceso.

La solución puede requerir:

- unique constraints;
- transacciones;
- locks;
- estados;
- idempotency keys;
- colas.

---

# 46. Atomicidad

Si varias operaciones deben ocurrir juntas, deben diseñarse como unidad atómica cuando sea posible.

Si no pueden ser atómicas por incluir sistemas externos, utilizar compensación y estados explícitos.

---

# 47. Rollback

Un rollback profesional debe cubrir todos los efectos persistentes relevantes.

Para una importación SGCI pueden existir:

- Master AWB;
- Houses;
- bultos;
- personas;
- documentos;
- direcciones;
- geocodificación;
- metadatos.

No considerar únicamente la tabla principal.

---

# 48. No ocultar fallos de rollback

Mala práctica:

```ts
try {
  await rollback();
} catch {
  // ignorar
}
```

Si rollback falla, el sistema debe saberlo.

El estado resultante puede requerir:

```text
FAILED
ROLLBACK_FAILED
REQUIRES_RECONCILIATION
```

según el modelo del sistema.

---

# 49. Tests unitarios

Adecuados para:

- reglas puras;
- parsers pequeños;
- validaciones;
- transformaciones;
- cálculos;
- utilidades.

Deben ser rápidos y deterministas.

---

# 50. Tests de integración

Necesarios cuando intervienen:

- Prisma;
- DB;
- transacciones;
- constraints;
- proveedores simulados;
- persistencia de jobs.

No confiar únicamente en mocks para probar integridad de datos.

---

# 51. Tests E2E

Probar los flujos que realmente importan al usuario/sistema:

```text
request
→ controller
→ service
→ DB
→ response
```

Usar un entorno de prueba controlado y datos aislados.

---

# 52. Tests de errores

Todo caso crítico debe tener pruebas para:

- entrada inválida;
- registro inexistente;
- duplicado;
- timeout;
- proveedor externo caído;
- error de DB;
- rollback;
- ejecución concurrente.

---

# 53. Tests de jobs

Para un job SGCI probar:

```text
PENDING → RUNNING → COMPLETED
```

```text
PENDING → RUNNING → FAILED
```

```text
RUNNING → error → rollback
```

Y comprobar que el estado persistido coincide con el estado real.

---

# 54. Tests no deben ser cosméticos

No cambiar un test únicamente para que pase si el contrato funcional está mal.

La prueba debe responder:

> ¿Este comportamiento es realmente el que queremos proteger?

---

# 55. ESLint

ESLint debe funcionar como una capa de calidad, no como una colección de reglas arbitrarias.

Especialmente útiles en backend TypeScript:

- promesas no gestionadas;
- funciones async mal utilizadas;
- imports;
- variables sin uso;
- patrones peligrosos.

Las reglas desactivadas deben tener una razón.

---

# 56. `no-floating-promises`

Especialmente importante para SGCI.

Detecta operaciones async cuyo resultado no se gestiona correctamente.

Esto ayuda a evitar errores como:

```ts
startImport();
markJobCompleted();
```

cuando la segunda operación depende de la primera.

---

# 57. `no-misused-promises`

Ayuda a detectar promesas usadas en contextos donde el runtime puede no esperarlas correctamente.

Debe evaluarse en callbacks, eventos y APIs async.

---

# 58. Prettier

El formato debe estar automatizado.

CI debe verificar el formato de forma consistente.

El objetivo es que una revisión se concentre en lógica y arquitectura, no en espacios o saltos de línea.

---

# 59. CodeQL

CodeQL aporta análisis de seguridad y patrones peligrosos.

Un código que compile y pase ESLint todavía puede tener vulnerabilidades.

CodeQL debe tratarse como una capa independiente.

---

# 60. CI de API

Como mínimo:

```text
Prisma generate
Prisma validate
TypeScript API
Lint API
Prettier
Tests API
Build API
CodeQL
```

La validación debe ejecutarse antes de considerar un cambio listo.

---

# 61. Observabilidad

Una API profesional debe permitir responder:

- ¿qué ocurrió?
- ¿qué operación falló?
- ¿cuánto tardó?
- ¿qué job estaba ejecutándose?
- ¿qué proveedor falló?
- ¿cuántos elementos se procesaron?

Usar logs estructurados y métricas cuando corresponda.

---

# 62. Correlation ID

Las operaciones distribuidas deberían poder correlacionarse mediante un identificador.

Ejemplo:

```text
requestId
jobId
manifestId
```

Esto facilita seguir una operación desde HTTP hasta DB y proveedores externos.

---

# 63. Timeouts

Toda llamada de red relevante debe tener un timeout.

Nunca asumir que un servidor externo responderá rápidamente o siempre.

Un timeout debe producir un estado manejable, no dejar el job indefinidamente en `RUNNING`.

---

# 64. Retries

Reintentar únicamente cuando sea seguro.

No reintentar ciegamente operaciones no idempotentes.

Ejemplo conceptual:

```text
GET → normalmente reintentable
POST → depende de idempotencia
```

Siempre considerar:

- backoff;
- máximo de intentos;
- timeout total;
- tipo de error.

---

# 65. Contratos API

Los contratos deben evolucionar de forma compatible.

Evitar cambiar silenciosamente:

```text
campo
tipo
semántica
estado
error HTTP
```

Los cambios incompatibles deben tener estrategia de migración.

---

# 66. Versionado

Cuando un cambio rompe consumidores, considerar versionado o estrategia de compatibilidad.

No introducir breaking changes solo porque el código interno pueda compilar.

---

# 67. Documentación

Cada módulo complejo debe explicar:

- propósito;
- invariantes;
- dependencias externas;
- decisiones no obvias;
- estrategia de errores;
- concurrencia cuando sea relevante.

No documentar obviedades que el código ya expresa claramente.

---

# 68. Comentarios

Los comentarios deben explicar **por qué**, no repetir **qué** hace el código.

Malo:

```ts
// Incrementa i
 i++;
```

Bueno:

```ts
// Se mantiene el orden de inserción porque el proveedor exige procesamiento estable.
```

---

# 69. Complejidad

No aceptar complejidad accidental.

Si un algoritmo procesa `n` elementos, revisar si realmente necesita:

```text
O(n²)
```

cuando podría ser:

```text
O(n)
```

Especialmente importante en importaciones masivas.

---

# 70. Memoria

No cargar archivos gigantes completos en memoria si el volumen puede crecer sin límite.

Considerar:

- streaming;
- procesamiento por lotes;
- límites de tamaño;
- liberación de estructuras intermedias.

---

# 71. Backpressure

Si una fuente produce datos más rápido que la DB/proveedor puede consumirlos, controlar el flujo.

Evitar:

```text
producer rápido
→ Promise.all de miles
→ sistema saturado
```

Diseñar límites y batches.

---

# 72. Caches y datos derivados

Distinguir:

```text
source of truth
```

de:

```text
cache / métrica / dato derivado
```

Nunca tratar una cache como fuente de verdad sin una estrategia explícita.

---

# 73. Revisión de código

Antes de aprobar TypeScript API preguntar:

### Tipos
- ¿Hay `any` injustificado?
- ¿Los nullables están correctamente tratados?
- ¿Los casts tienen fundamento?

### Arquitectura
- ¿El controller es pequeño?
- ¿El service tiene responsabilidad clara?
- ¿La lógica de negocio está en el lugar correcto?

### Async
- ¿Todas las promesas importantes se esperan?
- ¿Hay concurrencia ilimitada?

### Errores
- ¿Se ocultan excepciones?
- ¿El cliente recibe errores seguros?

### Persistencia
- ¿Hay transacción cuando corresponde?
- ¿Existe riesgo de carrera?
- ¿La operación es idempotente?

### Rendimiento
- ¿Hay N+1?
- ¿Hay loops con queries?
- ¿Hay resultados enormes?

### Seguridad
- ¿Se valida input?
- ¿Se protegen secretos?
- ¿La autorización está realmente comprobada?

### Operación
- ¿Hay logs y métricas suficientes?
- ¿Qué ocurre si el proceso muere a mitad?

---

# 74. Definition of Done — TypeScript API

## Código

- [ ] TypeScript estricto.
- [ ] Sin `any` injustificado.
- [ ] Sin casts peligrosos innecesarios.
- [ ] Nullability correcta.
- [ ] Nombres claros.
- [ ] Responsabilidades separadas.
- [ ] Promesas correctamente gestionadas.

## API

- [ ] Input validado.
- [ ] DTO/contrato correcto.
- [ ] Errores HTTP correctos.
- [ ] No se filtran detalles internos.
- [ ] Autorización comprobada.

## Prisma/DB

- [ ] Consultas revisadas.
- [ ] Relaciones correctas.
- [ ] Constraints correctas.
- [ ] Transacciones necesarias.
- [ ] Concurrencia considerada.

## Rendimiento

- [ ] Sin N+1 accidental.
- [ ] Paginación donde corresponde.
- [ ] Concurrencia limitada.
- [ ] Archivos grandes considerados.

## Calidad

- [ ] ESLint.
- [ ] Prettier.
- [ ] TypeScript.
- [ ] Tests.
- [ ] Build.
- [ ] CodeQL.

## Operación

- [ ] Logs.
- [ ] Métricas cuando corresponda.
- [ ] Timeouts.
- [ ] Retries seguros.
- [ ] Estados de jobs correctos.
- [ ] Fallos observables.

---

# 75. Checklist para un nuevo endpoint

```text
[ ] ¿Qué caso de uso representa?
[ ] ¿Quién puede ejecutarlo?
[ ] ¿Qué input recibe?
[ ] ¿Está validado?
[ ] ¿Cuál es el contrato de respuesta?
[ ] ¿Qué errores puede producir?
[ ] ¿Qué códigos HTTP corresponden?
[ ] ¿Qué datos persiste?
[ ] ¿Necesita transacción?
[ ] ¿Qué ocurre bajo concurrencia?
[ ] ¿Es idempotente?
[ ] ¿Puede producir N+1?
[ ] ¿Necesita paginación?
[ ] ¿Tiene timeout para dependencias externas?
[ ] ¿Tiene logs suficientes?
[ ] ¿Tiene tests?
[ ] ¿Pasa TypeScript?
[ ] ¿Pasa ESLint?
[ ] ¿Pasa Prettier?
[ ] ¿Pasa CodeQL?
```

---

# 76. Checklist para modificar un servicio existente

```text
[ ] Leer implementación actual.
[ ] Leer tests existentes.
[ ] Buscar todos los consumidores.
[ ] Revisar tipos públicos.
[ ] Revisar dependencias Prisma.
[ ] Revisar efectos secundarios.
[ ] Revisar concurrencia.
[ ] Revisar errores.
[ ] Revisar performance.
[ ] Añadir/actualizar tests.
[ ] Ejecutar CI completo.
```

---

# 77. Anti-patrones críticos de SGCI

Evitar especialmente:

### 1. `void` para esconder lifecycle

```ts
void importManifest();
```

cuando el estado del job depende de que termine.

### 2. Catch silencioso

```ts
catch {}
```

### 3. `as` para evitar tipos

```ts
const value = data as ExpectedType;
```

sin validación real.

### 4. `any` como solución

```ts
const result: any = ...;
```

### 5. Query dentro de loop masivo

```ts
for (const row of rows) {
  await prisma.person.findUnique(...);
}
```

sin analizar volumen/batching.

### 6. `Promise.all` sin límite

### 7. Transacciones gigantes

### 8. Secrets en código

### 9. Error interno devuelto al cliente

### 10. Tests modificados solo para pasar

---

# 78. Flujo profesional de desarrollo

```text
1. Entender requisito
        ↓
2. Revisar arquitectura existente
        ↓
3. Revisar tipos y contratos
        ↓
4. Revisar Prisma/DB
        ↓
5. Identificar riesgos
        ↓
6. Diseñar solución
        ↓
7. Implementar
        ↓
8. Tests unitarios
        ↓
9. Tests integración
        ↓
10. TypeScript
        ↓
11. ESLint
        ↓
12. Prettier
        ↓
13. Build
        ↓
14. CodeQL
        ↓
15. Revisión funcional
        ↓
16. Revisión de concurrencia
        ↓
17. Revisión de producción
```

---

# 79. SGCI: regla especial para importaciones

Una importación de manifiesto debe considerarse un proceso de negocio crítico, no una función utilitaria.

Debe contemplar:

```text
Input
 ↓
Parsing
 ↓
Validation
 ↓
Normalization
 ↓
Persistence
 ↓
Geocoding
 ↓
Progress
 ↓
Result
 ↓
Completion / Failure
```

Cada transición importante debe ser observable.

---

# 80. SGCI: resultado final durable

El resultado de una importación debe quedar vinculado al job que lo produjo.

No reconstruirlo posteriormente usando:

- timestamp;
- último registro;
- totales aproximados;
- consultas ambiguas.

La identidad correcta es:

```text
jobId → result
```

---

# 81. SGCI: fallos parciales

Si un proceso falla a mitad, debe quedar claro:

- qué se procesó;
- qué se persistió;
- qué se revirtió;
- qué no pudo revertirse;
- qué estado tiene el job;
- si requiere intervención.

Nunca ocultar un fallo parcial detrás de `COMPLETED`.

---

# 82. SGCI: calidad de código no es solo CI

Un Quality Gate verde significa que las verificaciones automatizadas pasaron.

No significa automáticamente que:

- el modelo de negocio sea correcto;
- el rollback sea completo;
- la concurrencia esté bien resuelta;
- el UX sea correcto;
- la arquitectura sea óptima.

Debe existir revisión funcional y arquitectónica.

---

# 83. Regla de oro

> Si no puedes explicar qué ocurre cuando el código falla a mitad, cuando se ejecuta dos veces y cuando dos procesos lo ejecutan simultáneamente, el diseño todavía no está terminado.

---

# 84. Referencias oficiales

Usar siempre documentación primaria para decisiones de lenguaje y herramientas:

- TypeScript Handbook — https://www.typescriptlang.org/docs/
- TypeScript TSConfig Reference — https://www.typescriptlang.org/tsconfig/
- TypeScript Release Notes — https://www.typescriptlang.org/docs/handbook/release-notes/overview.html
- ESLint Documentation — https://eslint.org/docs/latest/
- typescript-eslint — https://typescript-eslint.io/
- Prettier Documentation — https://prettier.io/docs/
- Node.js Documentation — https://nodejs.org/docs/latest/api/
- Prisma Documentation — https://www.prisma.io/docs
- GitHub CodeQL Documentation — https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql
- Playwright Documentation — https://playwright.dev/docs/

---

# 85. Principios de oro para SGCI

1. **Tipa el dominio, no ocultes problemas con `any`.**
2. **Valida toda entrada externa en runtime.**
3. **No confundas tipos TypeScript con seguridad.**
4. **Mantén controllers pequeños.**
5. **Mantén servicios con responsabilidades claras.**
6. **No abandones promesas importantes.**
7. **Controla la concurrencia.**
8. **Diseña para retries y ejecuciones duplicadas.**
9. **Protege la integridad en la base de datos.**
10. **Mantén transacciones cortas.**
11. **No ocultes errores de persistencia ni rollback.**
12. **Evita N+1.**
13. **No cargues cantidades ilimitadas de datos en memoria.**
14. **No expongas entidades internas como API automáticamente.**
15. **Protege secretos.**
16. **Usa timeouts para dependencias externas.**
17. **Reintenta solo cuando sea seguro.**
18. **Prueba los caminos de fallo, no solo el happy path.**
19. **CI verde no sustituye la revisión funcional.**
20. **Escribe código que otro ingeniero pueda entender y mantener años después.**
