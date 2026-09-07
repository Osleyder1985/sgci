# SGCI — Prisma Engineering Standard v2 Addendum

## Auditoría formal y ampliaciones de producción

**Proyecto:** SGCI  
**Estado:** Propuesta de evolución del estándar 1.0  
**Objetivo:** complementar el estándar existente sin mezclar APIs ni flujos de Prisma 7 y Prisma 8.

---

# A. Política de versión y compatibilidad

## A.1 Regla de lectura

Ninguna recomendación debe asumirse universal si depende de:

- versión mayor de Prisma;
- proveedor de base de datos;
- modo de relaciones;
- capacidad experimental;
- API deprecada.

Cada cambio técnico debe identificar:

- versión instalada de Prisma;
- versión objetivo;
- proveedor de base de datos;
- capacidades utilizadas.

## A.2 Etiquetas normativas

- **Version-independent:** principio de ingeniería aplicable sin depender de una API concreta.
- **Prisma 7:** específico del modelo Prisma Client / Prisma Migrate de la línea 7.
- **Prisma 8:** específico del modelo de contratos, nuevas superficies de consulta y migraciones de la línea 8.
- **Provider-dependent:** depende del motor.
- **Preview/Experimental:** requiere aprobación explícita.
- **Legacy/Deprecated:** no usar para código nuevo salvo compatibilidad justificada.

## A.3 Regla de actualización

Una actualización mayor no es un cambio de dependencia rutinario. Debe incluir:

1. inventario de APIs utilizadas;
2. análisis de compatibilidad;
3. migración de código y esquema/contrato;
4. pruebas de integración;
5. revisión de migraciones;
6. validación de producción.

---

# B. Matriz de responsabilidades

| Responsabilidad | Aplicación | Prisma | Base de datos |
|---|---|---|---|
| Autorización | Principal | No sustituye | No sustituye |
| Validación de entrada | Principal | Tipos/API | Constraints complementarios |
| Reglas de workflow | Principal | Coordinación | No |
| Unicidad crítica | Manejo del resultado | Declaración | Enforcement |
| Integridad referencial | Complementaria | Modelo de relación | Enforcement cuando exista FK |
| Atomicidad | Define límite | API transaccional | Garantía transaccional |
| Índices | Decide necesidad | Declara cuando corresponda | Ejecuta y optimiza |
| Concurrencia | Estrategia | API | Isolation/locking/constraints |

**Principio:** si una invariante crítica debe sobrevivir a múltiples procesos o clientes, no debe depender exclusivamente de una comprobación previa en código.

---

# C. Production Transaction Engineering

## C.1 Transacción no es workflow

Una transacción protege una unidad corta de trabajo de base de datos.

No debe confundirse con:

- importación completa;
- llamada HTTP;
- geocodificación;
- procesamiento de archivo;
- workflow distribuido.

## C.2 Reglas

- Una única mutación ya puede ser atómica y no requiere envolverla automáticamente en una transacción adicional.
- Dentro de una transacción usar exclusivamente el handle transaccional para las operaciones que deban participar en ella.
- No mantener la transacción abierta mientras se espera I/O externo.
- Definir timeout, retry y clasificación de errores cuando el riesgo lo justifique.
- El aislamiento es una decisión dependiente del motor y de la versión/superficie de Prisma.

## C.3 Patrón SGCI

```text
preparar/validar fuera
        ↓
abrir transacción corta
        ↓
persistir cambios atómicos
        ↓
commit
        ↓
procesar efectos externos / workflow posterior
```

---

# D. Concurrencia e idempotencia

## D.1 Nunca confiar en SELECT → INSERT

La comprobación previa puede mejorar UX, pero no sustituye:

- unique constraints;
- claves adecuadas;
- transacciones;
- manejo de conflictos.

## D.2 Idempotencia

Toda operación reintentable debe definir su clave de identidad.

Ejemplo SGCI:

```text
archivo normalizado
      ↓
SHA-256
      ↓
constraint única
      ↓
resultado inequívoco para reintentos
```

## D.3 Retry

Antes de reintentar, clasificar el error:

- transitorio y reintentable;
- conflicto de concurrencia;
- violación de integridad;
- error de negocio;
- error permanente.

No hacer retry ciego.

Cuando exista retry automático, definir:

- máximo de intentos;
- backoff;
- jitter cuando varios workers puedan reintentar simultáneamente;
- observabilidad;
- condición de parada.

## D.4 Exactly-once

No prometer procesamiento exactly-once sin una garantía real de extremo a extremo.

En sistemas distribuidos, preferir diseñar:

```text
at-least-once delivery
+
idempotent processing
+
durable state
```

---

# E. Transactional Outbox

## E.1 Problema

Puede ocurrir:

```text
BEGIN
persistir estado
COMMIT
proceso falla antes de publicar evento/job
```

La base queda actualizada y el efecto posterior se pierde.

## E.2 Patrón

En la misma transacción persistir:

- cambio de negocio;
- registro Outbox pendiente.

Un worker independiente publica o ejecuta el efecto.

El consumidor también debe ser idempotente.

## E.3 Uso en SGCI

Evaluar especialmente para:

- importaciones;
- jobs;
- progreso;
- notificaciones;
- sincronizaciones;
- efectos externos.

---

# F. Zero-Downtime Migration Engineering

## F.1 Expand

Agregar estructuras compatibles.

## F.2 Backfill

Migrar datos históricos de forma medible y reintentable.

## F.3 Dual compatibility

Permitir temporalmente que versiones antiguas y nuevas funcionen durante el despliegue cuando corresponda.

## F.4 Switch

Mover lectores/escritores al nuevo contrato.

## F.5 Observe

Verificar que no existan consumidores del contrato antiguo.

## F.6 Contract

Eliminar lo obsoleto solamente después de cumplir los criterios de salida.

## F.7 Casos de alto riesgo

- NULL → NOT NULL;
- cambio de tipo;
- rename;
- cambios de claves;
- tablas grandes;
- índices grandes;
- eliminación de columnas.

Cada uno requiere plan de datos existentes y recuperación/compensación.

---

# G. Raw SQL Governance

## G.1 Jerarquía

1. Superficie ORM tipada apropiada para la versión.
2. Superficie SQL/pipeline tipada cuando el proveedor y versión la soporten.
3. Raw query parametrizada.
4. Unsafe raw solamente como excepción aprobada.

## G.2 Requisitos

Toda consulta raw relevante debe documentar:

- problema que resuelve;
- por qué la superficie tipada no basta;
- proveedor;
- versión de Prisma;
- seguridad de parámetros;
- prueba;
- expectativa de rendimiento.

Nunca construir SQL dinámico con entrada no confiable mediante concatenación.

---

# H. Index Decision Framework

Antes de crear un índice responder:

1. ¿Qué consulta concreta lo necesita?
2. ¿Cuál es la cardinalidad?
3. ¿Qué filtros utiliza?
4. ¿Qué orden utiliza?
5. ¿Existe un índice compuesto más apropiado?
6. ¿Cuál es el coste de escritura?
7. ¿Existe un índice redundante?
8. ¿El proveedor ya crea una estructura equivalente?
9. ¿Se revisó el plan real cuando el riesgo lo justifica?
10. ¿Se midió con datos representativos?

**Regla:** un índice es una decisión de carga de trabajo, no una decoración del schema.

---

# I. Provider Assumptions

Toda recomendación dependiente del motor debe declarar su alcance.

Como mínimo distinguir:

- PostgreSQL;
- MySQL;
- SQL Server;
- SQLite;
- CockroachDB;
- MongoDB cuando aplique.

No extrapolar automáticamente:

- aislamiento;
- transacciones;
- foreign keys;
- índices;
- JSON;
- schemas de base de datos;
- full text;
- SQL raw;
- capacidades de migración.

---

# J. relationMode

Cuando se utilice una base relacional con foreign keys disponibles, documentar explícitamente si se usa enforcement de base de datos o emulación de relaciones.

Cambiar de modo puede cambiar:

- dónde se aplica la integridad;
- si existen constraints físicas;
- comportamiento de migraciones;
- necesidad de índices manuales.

No elegir relationMode por conveniencia sin documentar la consecuencia de integridad.

---

# K. Schema multi-file

Dividir archivos solo cuando mejore:

- descubribilidad;
- revisión;
- propiedad por dominio;
- mantenibilidad.

No confundir organización física con bounded contexts.

Definir una convención única para:

- archivo raíz/configuración;
- modelos por dominio;
- relaciones compartidas;
- convenciones de nombres;
- revisión de dependencias.

---

# L. Observabilidad de persistencia

Medir cuando sea relevante:

- latencia de consultas;
- consultas lentas;
- tasa de errores;
- duración de transacciones;
- saturación de conexiones;
- agotamiento de conexiones;
- deadlocks;
- reintentos;
- duración de migraciones;
- throughput de jobs;
- fallos de rollback.

**Regla:** optimizar con evidencia.

---

# M. Testing de migraciones y compatibilidad

Además de unit e integration tests, evaluar:

## Migration tests

¿Una base con datos existentes puede evolucionar?

## Historical data tests

¿Los datos antiguos siguen siendo válidos bajo el nuevo contrato?

## Compatibility tests

¿Las versiones necesarias de la aplicación pueden convivir durante el despliegue?

## Failure injection

¿Qué ocurre si falla:

- después de una escritura;
- durante rollback;
- durante un retry;
- entre commit y efecto externo?

---

# N. Anti-reglas

Estas frases absolutas son anti-patrones:

- “Siempre usar Repository Pattern”.
- “Nunca usar Repository Pattern”.
- “Nunca usar Raw SQL”.
- “Siempre usar UUID”.
- “Siempre usar soft delete”.
- “Toda operación debe estar dentro de una transacción”.
- “Todo debe normalizarse”.
- “Nunca usar JSON”.
- “Indexar automáticamente todas las FK”.
- “Prisma elimina la necesidad de entender la base de datos”.
- “TypeScript valida datos en runtime”.
- “CI verde garantiza corrección funcional”.

La decisión correcta depende del dominio, proveedor, volumen, arquitectura y requisitos operativos.

---

# O. Persistence Architecture Decision Record

Para decisiones de alto impacto:

```text
Decision:
Context:
Problem:
Alternatives:
Chosen option:
Why:
Consequences:
Reversibility:
Prisma version:
Database provider:
Operational impact:
Review date:
```

Usar especialmente para:

- estrategia de IDs;
- soft delete;
- JSON;
- multi-tenancy;
- repository abstraction;
- raw SQL;
- auditoría;
- particionamiento;
- outbox.

---

# P. Addendum al Definition of Done

Antes de cerrar un cambio de persistencia relevante:

- [ ] versión de Prisma identificada;
- [ ] proveedor identificado;
- [ ] diferencias de versión documentadas;
- [ ] invariantes críticas protegidas en el nivel correcto;
- [ ] concurrencia evaluada;
- [ ] retry clasificado si aplica;
- [ ] migración compatible evaluada;
- [ ] datos históricos considerados;
- [ ] observabilidad suficiente;
- [ ] comportamiento funcional revisado además de CI.

---

# Q. Fuentes oficiales prioritarias

- Prisma ORM: https://docs.prisma.io/docs/orm
- Prisma 7: https://docs.prisma.io/docs/orm/v7
- Prisma 8 migrations: https://docs.prisma.io/docs/orm/migrations/how-migrations-work
- Prisma 8 transactions: https://docs.prisma.io/docs/orm/fundamentals/transactions
- Prisma relation mode: https://docs.prisma.io/docs/orm/prisma-schema/data-model/relations/relation-mode
- Prisma database features: https://docs.prisma.io/docs/orm/v7/reference/database-features
- Prisma raw queries: https://docs.prisma.io/docs/orm/reference/raw-queries

---

## Resultado esperado

Este addendum transforma el estándar existente en una guía más rigurosa para producción al introducir:

- control explícito de versiones;
- separación por proveedor;
- transacciones de producción;
- concurrencia;
- idempotencia;
- outbox;
- migraciones sin downtime;
- gobernanza de SQL raw;
- decisiones de índices basadas en evidencia;
- observabilidad;
- pruebas de evolución histórica.

La regla final permanece:

> Un cambio no está terminado cuando compila. Está terminado cuando sus datos, invariantes, migraciones, concurrencia, fallos y operación están entendidos y verificados.
