# SGCI — Prisma Engineering Standard

## Certification Edition

**Proyecto:** SGCI  
**Versión del documento:** 2.1  
**Estado:** Estándar de ingeniería — Certification Edition  
**Alcance:** diseño de datos, persistencia, migraciones, rendimiento, concurrencia, seguridad, testing y operación.

---

# 1. Propósito

Este estándar define cómo diseñar, modificar, revisar, probar, desplegar y operar la persistencia de SGCI.

No es una guía de sintaxis. Un cambio puede afectar:

- modelo de datos;
- contrato o schema según la generación de Prisma;
- base de datos;
- datos históricos;
- migraciones;
- concurrencia;
- seguridad;
- observabilidad;
- despliegue.

**Regla principal:** código que compila y CI verde no significan que el cambio esté terminado.

Un cambio terminado preserva, según corresponda:

- correctitud;
- integridad;
- seguridad;
- rendimiento;
- compatibilidad;
- recuperabilidad;
- mantenibilidad;
- observabilidad.

---

# PARTE I — VERSIONES, GENERACIONES Y CAPACIDADES

## 2. Regla de precisión

Antes de aplicar una recomendación técnica identificar:

```text
Prisma version:
Generation/API surface:
Database provider:
Database version:
Preview/experimental features:
Deployment topology:
```

Cada regla debe clasificarse como:

- **Version-independent**
- **Prisma 7**
- **Prisma 8**
- **Provider-dependent**
- **Database-version-dependent**
- **Preview/Experimental**
- **Legacy/Deprecated**

**Prohibido:** presentar una API de una generación como si fuera una regla universal.

---

## 3. Provider Capability Matrix

No mantener una lista de proveedores como si todos ofrecieran las mismas capacidades.

Para SGCI, cada cambio avanzado debe comprobar:

```text
Required feature
      ↓
Prisma generation
      ↓
Supported provider?
      ↓
Supported database version?
      ↓
Capability/configuration requirement?
      ↓
Approved implementation
```

La matriz real debe basarse en la versión de Prisma instalada y en la documentación oficial correspondiente.

No extrapolar entre proveedores:

- transacciones;
- aislamiento;
- constraints;
- foreign keys;
- índices;
- JSON;
- SQL;
- migraciones;
- relation handling.

---

## 4. Capability Engineering

Una capacidad avanzada debe tratarse como requisito explícito.

Registrar:

- funcionalidad requerida;
- proveedor;
- versión de base de datos;
- generación de Prisma;
- API utilizada;
- limitaciones conocidas;
- estrategia alternativa.

**Regla:** no diseñar sobre una capacidad asumida; verificarla.

---

# PARTE II — ARQUITECTURA

## 5. Responsabilidades

```text
HTTP/UI
  ↓
Controller/Route
  ↓
Application Service
  ↓
Domain Rules
  ↓
Persistence boundary (cuando aporte valor)
  ↓
Prisma / Query surface
  ↓
Database
```

### Aplicación

Responsable de:

- autorización;
- validación runtime;
- workflows;
- reglas de negocio;
- idempotencia del caso de uso;
- coordinación.

### Prisma

Responsable de proporcionar la superficie de persistencia configurada para el proyecto.

### Base de datos

Responsable de las garantías que el motor puede hacer cumplir:

- constraints;
- transacciones;
- integridad física;
- índices;
- aislamiento.

**Principio:** una invariante crítica que debe sobrevivir a múltiples procesos o clientes no puede depender únicamente de una comprobación previa en la aplicación.

---

## 6. Repository Pattern

No es obligatorio ni prohibido.

Usarlo cuando aporte:

- desacoplamiento real;
- aislamiento de infraestructura;
- lenguaje del dominio;
- reducción de complejidad.

No usarlo solo para envolver mecánicamente cada llamada de Prisma.

---

# PARTE III — MODELADO

## 7. Modelar el dominio

Modelar entidades e invariantes, no pantallas.

Convenciones:

- modelos: `PascalCase`;
- campos: `camelCase`;
- mapeos físicos cuando correspondan: `@map`, `@@map`.

Evitar entidades gigantes creadas únicamente para simplificar formularios.

---

## 8. Tipos

Elegir tipos por significado:

- `String`: texto/códigos;
- `Int`: enteros apropiados;
- `BigInt`: rangos elevados;
- `Decimal`: precisión decimal requerida;
- `Float`: aproximación aceptable;
- `Boolean`: binario;
- `DateTime`: instante;
- `Json`: estructura flexible justificada.

No almacenar datos estructurados como texto por comodidad.

No usar JSON para ocultar relaciones que requieren identidad, constraints o consultas relacionales.

---

## 9. Nullability, defaults e identidad

Un campo nullable debe representar ausencia semánticamente válida.

Un default debe representar un valor válido, no ocultar un dato obligatorio.

Separar:

- ID técnico;
- identidad de negocio;
- constraint de unicidad.

Las invariantes de unicidad críticas deben estar protegidas donde puedan sobrevivir a concurrencia y clientes múltiples.

---

## 10. Relaciones

Representar cardinalidad real:

- 1:1;
- 1:N;
- N:M.

Para N:M:

- implícita cuando no existe identidad ni metadata propia y la capacidad/version lo permite;
- explícita cuando la relación tiene atributos, lifecycle, auditoría o reglas propias.

Nombrar relaciones cuando exista ambigüedad.

---

## 11. Integridad y acciones referenciales

No confiar exclusivamente en lógica de aplicación para impedir referencias inválidas.

Antes de usar una acción referencial definir:

1. qué datos pueden desaparecer;
2. qué información histórica debe sobrevivir;
3. qué clientes consumen esos datos;
4. qué comportamiento contractual se espera.

`Cascade` requiere justificación explícita.

---

## 12. relationMode

Cuando la generación y proveedor soporten configuraciones de modo de relaciones, documentar:

- dónde se aplica la integridad;
- qué constraints físicas existen;
- qué emulación realiza la capa;
- qué índices adicionales son necesarios.

No elegir un modo por comodidad sin evaluar sus consecuencias.

---

## 13. Polimorfismo

No intentar reproducir automáticamente herencia OOP en tablas.

Evaluar:

- composición;
- discriminator;
- table-per-type;
- modelado específico del proveedor.

La elección debe preservar invariantes y patrones de consulta.

---

## 14. Enums vs tablas

Enum:

- pequeño;
- estable;
- controlado por código.

Tabla:

- dinámica;
- administrable;
- configurable;
- con metadata;
- jerárquica.

---

# PARTE IV — QUERIES Y PERFORMANCE

## 15. Query-by-query surface selection

La elección de superficie se hace por consulta, no necesariamente por proyecto.

Para cada consulta:

1. ¿La API ORM disponible expresa correctamente el requisito?
2. ¿Existe una superficie SQL/pipeline apropiada para versión y proveedor?
3. ¿Se necesita una excepción raw?
4. ¿Cuál es el coste de mantenibilidad?
5. ¿Cuál es la evidencia de rendimiento?

**No decir:** “el proyecto usa siempre X”.

**Decir:** “esta consulta usa X porque satisface este requisito concreto”.

---

## 16. Index Decision Framework

Antes de crear un índice:

1. query concreta;
2. filtros;
3. orden;
4. cardinalidad;
5. selectividad;
6. índice compuesto;
7. coste de escritura;
8. redundancia;
9. plan real cuando corresponda;
10. medición.

Un índice es una decisión de carga de trabajo.

---

## 17. Query Engineering

Recuperar solo:

- campos necesarios;
- relaciones necesarias;
- filas necesarias.

Evitar N+1.

La paginación debe tener orden determinista y desempate cuando sea necesario.

No asumir que el volumen actual será el volumen futuro.

---

## 18. Performance

Separar:

### Aplicación/ORM
- shape;
- relaciones;
- batching;
- N+1;
- paginación.

### Base de datos
- índices;
- planes;
- locks;
- I/O;
- conexiones;
- cardinalidad.

Optimizar con evidencia.

---

# PARTE V — MIGRACIONES Y EVOLUCIÓN DE DATOS

## 19. Terminología

### Version-independent

Usar:

- **modelo de datos**;
- **estructura de base de datos**.

### Prisma 7-specific

Usar la terminología y flujo oficial de schema/migrations correspondiente a la versión instalada.

### Prisma 8-specific

Usar:

- **contract** para el artefacto versionado;
- **database schema** para la estructura física.

No usar contract y schema como sinónimos cuando la generación los distingue.

---

## 20. Cambios históricos

Clasificar cada cambio:

### Compatible

Los datos existentes continúan siendo válidos.

### Transformable

Requiere backfill o transformación.

### Dual-compatible

Requiere convivencia temporal de contratos/versiones.

### Incompatible/destructive

Requiere aprobación explícita, plan de datos y estrategia de recuperación o compensación.

“Considerar datos históricos” no significa solamente revisarlos manualmente.

---

## 21. Zero-Downtime Migration Pattern

Cuando aplique:

```text
EXPAND
  ↓
BACKFILL
  ↓
DUAL COMPATIBILITY
  ↓
SWITCH
  ↓
OBSERVE
  ↓
CONTRACT
```

Casos de alto riesgo:

- NULL → NOT NULL;
- cambios de tipo;
- rename;
- cambios de PK/FK;
- tablas grandes;
- índices grandes;
- eliminaciones.

---

## 22. Migración por generación

### Prisma 7

Seguir el flujo oficial correspondiente al modelo schema-first instalado.

Revisar SQL generado cuando corresponda y probar con datos representativos.

### Prisma 8

Seguir el flujo oficial basado en contracts y las herramientas de migración disponibles para la versión instalada.

**Regla:** no copiar comandos entre generaciones.

---

# PARTE VI — TRANSACCIONES

## 23. Principio universal

Una transacción de base de datos no es un workflow de negocio.

```text
Database transaction
≠
Business workflow
```

Una única mutación que ya es atómica no necesita envolverse automáticamente en una transacción adicional.

Una transacción debe coordinar varias operaciones solo cuando existe una garantía conjunta que preservar.

---

## 24. Production Transaction Engineering

Patrón preferente:

```text
validar/preparar
↓
transacción corta
↓
mutaciones coordinadas
↓
commit
↓
efectos externos/workflow posterior
```

No mantener transacciones abiertas durante:

- HTTP;
- geocodificación;
- procesamiento completo de archivos;
- esperas;
- I/O externo lento.

---

## 25. Matriz transaccional

| Concepto | Prisma 7 | Prisma 8 relacional | Prisma 8 MongoDB |
|---|---|---|---|
| API | Depende de la superficie oficial instalada | Depende de la superficie oficial instalada | No asumir equivalencia |
| Handle transaccional | Usar el handle provisto | Usar el handle provisto | Verificar capability |
| Operación fuera del handle | No debe asumirse dentro | No debe asumirse dentro | Provider-dependent |
| Capacidad | Version/provider-dependent | Version/provider-dependent | Provider-dependent |

**Regla de certificación:** la API exacta se documenta contra la versión instalada; el estándar no inventa equivalencias.

---

# PARTE VII — CONCURRENCIA E IDEMPOTENCIA

## 26. Race conditions

Nunca depender únicamente de:

```text
SELECT
↓
comprobar
↓
INSERT
```

Usar según el caso:

- constraints;
- transacciones;
- manejo de conflictos;
- concurrencia optimista;
- versionado;
- compare-and-swap;
- locks cuando estén justificados y disponibles.

---

## 27. Idempotencia

Toda operación reintentable debe tener identidad durable.

Ejemplo:

```text
entrada normalizada
↓
idempotency key / hash
↓
constraint o estado durable
↓
reintento seguro
```

---

## 28. Retry

Clasificar:

- transitorio;
- conflicto;
- integridad;
- negocio;
- permanente.

Definir:

- máximo de intentos;
- backoff;
- jitter cuando corresponda;
- observabilidad;
- condición de parada.

Nunca retry ciego.

No prometer exactly-once sin una garantía real extremo a extremo.

Diseño preferente cuando corresponda:

```text
at-least-once delivery
+
idempotent processing
+
durable state
```

---

## 29. Transactional Outbox

Cuando un cambio de base y un efecto posterior deben mantenerse coordinados:

En la misma unidad transaccional persistir:

- cambio de negocio;
- intención durable del efecto.

Un worker procesa posteriormente.

El consumidor debe ser idempotente.

Evaluar para:

- jobs;
- importaciones;
- notificaciones;
- sincronizaciones.

---

# PARTE VIII — SQL Y ESCAPE HATCHES

## 30. Política por generación y provider

### Prisma 7

Seguir la documentación oficial de la versión instalada para consultas raw y parámetros.

### Prisma 8 PostgreSQL

Evaluar, por consulta:

1. ORM;
2. superficie SQL apropiada;
3. fragmentos/raw permitidos por esa superficie.

### Prisma 8 MongoDB

Evaluar:

1. ORM;
2. pipeline/aggregation surface disponible;
3. comando o expresión avanzada cuando sea necesaria y oficialmente soportada.

### Regla universal

Raw/escape hatch:

- requiere justificación;
- debe respetar parámetros seguros;
- debe declarar provider;
- debe declarar versión;
- debe probarse;
- debe documentar rendimiento esperado.

Nunca concatenar entrada no confiable en una consulta.

---

# PARTE IX — SEGURIDAD

## 31. Prisma no sustituye seguridad de aplicación

Persistencia no sustituye:

- autenticación;
- autorización;
- validación runtime;
- secretos;
- mínimos privilegios;
- clasificación de datos.

No devolver ni registrar datos sensibles innecesariamente.

---

## 32. Errores

No convertir un error real en éxito aparente.

Nunca usar:

```ts
catch {
  return null
}
```

si `null` significa éxito o ausencia normal.

Clasificar y traducir errores al límite arquitectónico apropiado.

---

# PARTE X — TESTING

## 33. Testing por semántica

### Unit

¿La regla funciona?

### Infrastructure Integration

¿Prisma, provider y base real cumplen?

Probar:

- constraints;
- relaciones;
- transacciones;
- queries críticas.

### Contract Test

¿El modelo/contract sigue representando lo que la aplicación necesita?

### Migration Test

¿El estado anterior evoluciona correctamente?

### Historical Data Test

¿Los datos existentes siguen siendo válidos o se transforman correctamente?

### Concurrency Test

¿Operaciones simultáneas preservan invariantes?

### Failure Injection

¿Qué ocurre si falla:

- después de una escritura;
- durante rollback;
- durante retry;
- entre persistencia y efecto externo?

Los mocks no sustituyen pruebas de garantías reales de la base.

---

# PARTE XI — OBSERVABILIDAD

## 34. Medir

Cuando corresponda:

- latencia;
- queries lentas;
- errores;
- duración transaccional;
- conexiones;
- agotamiento;
- deadlocks;
- retries;
- migraciones;
- jobs;
- rollback.

Logs:

- contexto suficiente;
- sin secretos;
- sin datos sensibles innecesarios.

---

# PARTE XII — PATRONES SGCI

## 35. Importaciones

Una importación es un workflow persistente:

```text
POST
↓
ImportJob
↓
RUNNING
↓
PROCESS
↓
PROGRESS
↓
RESULT
↓
COMPLETED / FAILED
```

El resultado debe estar vinculado inequívocamente al `jobId`.

Nunca reconstruir resultados mediante “último registro” o timestamps ambiguos.

---

## 36. Rollback y compensación

Inventariar efectos:

- Master AWB;
- Houses;
- bultos;
- personas;
- documentos;
- direcciones;
- geocodificación;
- metadatos.

Si existe rollback contractual, cubrir todos los efectos relevantes.

Para efectos no reversibles usar:

- compensación;
- estados;
- retries;
- reconciliación.

---

## 37. Geocodificación

No mantener llamadas externas dentro de transacciones largas.

Modelar estados que el workflow necesite distinguir.

---

# PARTE XIII — EJEMPLOS Y PEDAGOGÍA

## 38. Política editorial de ejemplos

Todo patrón complejo debe incluir cuando sea útil:

1. contexto;
2. cuándo usarlo;
3. cuándo no usarlo;
4. ejemplo correcto;
5. ejemplo incorrecto;
6. explicación de la diferencia;
7. versión/provider aplicable;
8. consecuencia operacional.

Patrones prioritarios:

- transacciones;
- cascadas;
- relaciones;
- JSON;
- soft delete;
- idempotencia;
- retry;
- raw SQL;
- rollback.

---

# PARTE XIV — CI Y REVISIÓN

## 39. Capas

```text
Prisma       → modelo/contract según generación
TypeScript   → tipos
ESLint       → patrones
Prettier     → formato
Tests        → comportamiento
Build        → integración
CodeQL       → análisis de seguridad
```

Cada capa cubre riesgos diferentes.

CI verde no sustituye revisión:

- funcional;
- arquitectónica;
- de datos;
- operacional.

---

# PARTE XV — ANTI-REGLAS

## 40. No convertir heurísticas en dogmas

Evitar:

- siempre/nunca Repository;
- siempre/nunca Raw SQL;
- siempre UUID;
- siempre soft delete;
- toda operación en transacción;
- todo normalizado;
- nunca JSON;
- indexar automáticamente;
- Prisma elimina necesidad de conocer la base;
- CI verde = funcionalidad correcta.

La decisión depende de:

- dominio;
- provider;
- versión;
- volumen;
- requisitos operativos.

---

# PARTE XVI — PERSISTENCE ADR

## 41. Registro

```text
Decision:
Context:
Problem:
Alternatives:
Chosen option:
Why:
Consequences:
Reversibility:
Prisma generation/version:
Provider/database version:
Capabilities:
Operational impact:
Review date:
```

Usar para decisiones de alto impacto.

---

# PARTE XVII — CERTIFICATION CHECKLIST

## 42. Versiones y capabilities

- [ ] Prisma version identificada.
- [ ] Generación identificada.
- [ ] Provider identificado.
- [ ] Database version identificada cuando importa.
- [ ] Capability verificada.

## Modelo

- [ ] Identidad correcta.
- [ ] Tipos correctos.
- [ ] Nullability justificada.
- [ ] Constraints correctas.
- [ ] Relaciones correctas.

## Queries

- [ ] Superficie elegida por query.
- [ ] Datos mínimos.
- [ ] Sin N+1 accidental.
- [ ] Índices justificados.

## Transacciones

- [ ] Varias mutaciones requieren atomicidad conjunta.
- [ ] Límite correcto.
- [ ] Duración corta.
- [ ] Handle correcto.

## Concurrencia

- [ ] Race conditions evaluadas.
- [ ] Idempotencia definida.
- [ ] Retry clasificado.

## Migraciones

- [ ] Tipo de cambio histórico clasificado.
- [ ] Datos existentes probados.
- [ ] Compatibilidad de despliegue evaluada.
- [ ] Recuperación/compensación definida.

## Testing

- [ ] Semántica cubierta.
- [ ] Infraestructura crítica cubierta.
- [ ] Migración cubierta cuando aplica.
- [ ] Concurrencia cubierta cuando aplica.
- [ ] Failure paths cubiertos.

## Operación

- [ ] Observabilidad suficiente.
- [ ] Estados consistentes.
- [ ] Fallo a mitad entendido.

---

# 43. Principios de oro

1. Modela invariantes, no pantallas.
2. No mezcles generaciones.
3. No asumas capacidades de un provider.
4. Elige la superficie por query.
5. Protege invariantes contra concurrencia.
6. Una transacción no es un workflow.
7. Una única mutación atómica no necesita transacción ceremonial.
8. Mantén transacciones cortas.
9. Haz reintentos explícitos e idempotentes.
10. Los datos históricos son parte del contrato.
11. Raw es una excepción gobernada, no un atajo automático.
12. Optimiza con evidencia.
13. Prueba garantías reales con infraestructura real.
14. CI verde no sustituye corrección funcional.
15. Si no puedes explicar qué ocurre cuando falla a mitad, el diseño no está terminado.

---

# 44. Política de mantenimiento

Este estándar debe revisarse cuando cambien:

- generación o versión de Prisma;
- provider o versión de base de datos;
- capacidades usadas;
- arquitectura;
- volumen;
- seguridad;
- despliegue.

La documentación oficial correspondiente a la versión instalada tiene prioridad sobre:

- ejemplos antiguos;
- artículos;
- convenciones heredadas;
- memoria del equipo.

**Objetivo final:**

> Código correcto, datos íntegros, capacidades verificadas, concurrencia entendida, migraciones seguras, fallos recuperables y persistencia mantenible durante años.
