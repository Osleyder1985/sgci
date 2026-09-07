# SGCI — Prisma Engineering Standard

## Estándar de ingeniería profesional para diseño, persistencia y evolución con Prisma

**Proyecto:** SGCI  
**Versión del documento:** 2.0  
**Estado:** Estándar de ingeniería  
**Alcance:** diseño de datos, Prisma, base de datos, migraciones, rendimiento, concurrencia, seguridad, testing y operación.

---

## 1. Propósito

Este documento define cómo diseñar, modificar, revisar, probar, desplegar y operar la capa de persistencia de SGCI.

No es una guía de sintaxis. Un cambio de Prisma afecta un sistema formado por:

- modelo de datos;
- contrato de la aplicación;
- base de datos;
- migraciones;
- consultas;
- reglas de negocio;
- concurrencia;
- integraciones;
- datos históricos;
- observabilidad;
- despliegue.

**Regla principal:** que el código compile o que CI esté verde no significa que el cambio esté terminado.

Una implementación profesional debe preservar simultáneamente:

- correctitud;
- integridad;
- seguridad;
- rendimiento;
- mantenibilidad;
- compatibilidad;
- testabilidad;
- observabilidad;
- capacidad de recuperación.

---

# PARTE I — GOBERNANZA DE VERSIONES

## 2. Política de versión y compatibilidad

Antes de modificar Prisma, identificar:

```bash
npx prisma -v
```

Registrar la versión instalada y la documentación oficial correspondiente.

Cada recomendación debe interpretarse con estas etiquetas:

- **Version-independent:** principio de ingeniería.
- **Prisma 7:** específico de esa generación.
- **Prisma 8:** específico de esa generación.
- **Provider-dependent:** depende del motor.
- **Preview/Experimental:** requiere aprobación explícita.
- **Legacy/Deprecated:** no usar en código nuevo salvo compatibilidad.

Una actualización mayor no es una actualización rutinaria de dependencias. Debe incluir:

1. inventario de APIs usadas;
2. análisis de compatibilidad;
3. migración técnica;
4. pruebas de integración;
5. revisión de migraciones;
6. validación de producción.

**Regla:** nunca mezclar instrucciones de generaciones distintas como si fueran intercambiables.

Prisma 8 usa un modelo de contrato y flujos diferentes a las generaciones anteriores; por tanto, este estándar separa los principios universales de la API concreta usada por el proyecto. citeturn0search0turn0search8turn0search9

---

## 3. Matriz de compatibilidad

Toda decisión avanzada debe declarar su alcance por:

- PostgreSQL;
- MySQL;
- SQL Server;
- SQLite;
- CockroachDB;
- MongoDB, cuando aplique.

No extrapolar automáticamente entre motores:

- transacciones;
- aislamiento;
- foreign keys;
- índices;
- JSON;
- relaciones;
- SQL;
- capacidades de migración.

La API y el comportamiento pueden variar por método y proveedor. citeturn0search6turn0search7

---

# PARTE II — ARQUITECTURA Y RESPONSABILIDADES

## 4. Prisma dentro de la arquitectura

```text
HTTP / UI
   ↓
Controller / Route
   ↓
Application Service
   ↓
Domain / Business Rules
   ↓
Persistence abstraction (cuando aporte valor)
   ↓
Prisma
   ↓
Database
```

### Responsabilidades

**Controller/Route**
- entrada;
- autenticación/autorización;
- respuesta.

**Application Service**
- casos de uso;
- coordinación;
- límites transaccionales;
- idempotencia;
- integración con efectos externos.

**Domain**
- reglas de negocio.

**Persistence**
- consultas y abstracciones solamente cuando reduzcan acoplamiento o complejidad.

**Prisma**
- acceso estructurado a persistencia.

No convertir Prisma en el lugar donde vive toda la lógica de negocio.

---

## 5. Matriz Application vs Prisma vs Database

| Responsabilidad | Aplicación | Prisma | Base de datos |
|---|---|---|---|
| Autorización | Principal | No sustituye | No sustituye |
| Validación de entrada | Principal | Tipos/API | Constraints complementarios |
| Workflow | Principal | Coordinación | No |
| Unicidad crítica | Manejo del resultado | Declaración | Enforcement |
| Integridad referencial | Complementaria | Modelo | Enforcement cuando exista |
| Atomicidad | Define límites | API | Garantía |
| Índices | Decide necesidad | Declara | Ejecuta |
| Concurrencia | Estrategia | API | Isolation/constraints |

**Principio:** si una invariante crítica debe sobrevivir a múltiples procesos o clientes, no puede depender exclusivamente de una comprobación previa en código.

---

# PARTE III — MODELADO

## 6. Modelar el dominio

Modelar entidades y reglas reales, no pantallas.

Convenciones:

- modelos: `PascalCase`, singular;
- campos: `camelCase`;
- nombres físicos heredados: `@map` y `@@map`.

No crear una tabla gigante llena de campos opcionales para simplificar la UI.

---

## 7. Tipos de datos

Usar el tipo que represente la naturaleza real:

- `String`: texto y códigos;
- `Int`: enteros apropiados;
- `BigInt`: enteros de crecimiento elevado;
- `Decimal`: precisión decimal;
- `Float`: aproximación aceptable;
- `Boolean`: estado binario;
- `DateTime`: instante temporal;
- `Json`: estructura flexible justificada.

No almacenar fechas, pesos o estados como texto por comodidad.

No usar JSON para esconder relaciones que requieren constraints o índices.

---

## 8. Nullabilidad y defaults

Usar `?` solo cuando la ausencia tenga significado real.

Preferir un default válido a una propiedad nullable sin semántica.

Un default no debe ocultar un dato que realmente era obligatorio.

---

## 9. Identidad y claves

Toda entidad debe tener estrategia explícita:

- clave técnica;
- UUID;
- identificador natural;
- clave compuesta.

No confundir ID técnico con identidad de negocio.

Una regla de unicidad importante debe estar protegida en la base de datos.

---

## 10. Relaciones

Representar la cardinalidad real:

- 1:1;
- 1:N;
- N:M.

En relaciones relacionales, el lado propietario almacena la FK y el campo de relación permite navegación. Las relaciones 1:N y 1:1 deben diseñarse desde esa realidad física. citeturn0search1turn0search2turn0search11

Para N:M:

- implícita cuando la relación no tiene identidad ni atributos propios y la versión/capacidad lo permita;
- explícita cuando la relación tenga metadata, lifecycle o reglas propias.

Nombrar relaciones explícitamente cuando haya ambigüedad.

---

## 11. Foreign keys y acciones referenciales

No confiar exclusivamente en la aplicación para impedir referencias inválidas.

`Cascade` nunca debe ser automático.

Antes de una acción referencial preguntar:

1. ¿Qué datos se eliminan?
2. ¿Puede existir información histórica?
3. ¿Qué servicios consumen esos datos?
4. ¿Debe prohibirse, restringirse, poner NULL o cascada?

---

## 12. relationMode

Documentar explícitamente el modelo de integridad usado.

Cambiar el modo de relaciones puede modificar:

- dónde se aplica la integridad;
- existencia de constraints físicas;
- comportamiento de migraciones;
- necesidad de índices.

No elegirlo por comodidad sin documentar consecuencias.

---

## 13. Herencia y polimorfismo

Prisma no convierte automáticamente herencia OOP en modelo relacional.

Evaluar:

1. composición/1:1;
2. single table + discriminator;
3. table-per-type;
4. capacidad específica del proveedor.

No introducir herencia para imitar clases; elegir el modelo que exprese mejor los invariantes de datos.

---

## 14. Enums vs tablas

Usar enum para valores pequeños, estables y controlados por código.

Usar tabla de referencia para valores:

- dinámicos;
- administrables;
- configurables;
- con metadata;
- dependientes de jerarquía.

---

# PARTE IV — PERFORMANCE

## 15. Index Decision Framework

Un índice debe responder a una consulta concreta.

Antes de crearlo:

1. ¿Qué query lo necesita?
2. ¿Cuál es la cardinalidad?
3. ¿Qué filtros usa?
4. ¿Qué orden usa?
5. ¿Debe ser compuesto?
6. ¿Cuál es el coste de escritura?
7. ¿Existe redundancia?
8. ¿El proveedor ya crea estructura equivalente?
9. ¿Se revisó el plan real cuando corresponde?
10. ¿Se midió?

**Regla:** un índice es una decisión de carga de trabajo, no decoración del schema.

---

## 16. Query engineering

Recuperar únicamente:

- campos necesarios;
- relaciones necesarias;
- filas necesarias.

Evitar N+1 accidental y consultas por elemento cuando puedan agruparse.

La paginación debe tener orden determinista y, cuando sea necesario, desempate estable.

No asumir que una tabla permanecerá pequeña.

---

## 17. Medición

Separar:

**Performance del ORM**
- shape de respuesta;
- relaciones;
- N+1;
- batching;
- paginación.

**Performance de base de datos**
- índices;
- planes;
- cardinalidad;
- locks;
- I/O;
- conexiones.

Una consulta que parece eficiente en código no necesariamente es eficiente en la base de datos.

Optimizar con evidencia.

---

# PARTE V — MIGRACIONES

## 18. Principios universales

Una migración es código crítico:

```text
Cambiar contrato/schema
↓
Generar o planificar migración
↓
Revisar
↓
Probar
↓
Verificar datos
↓
Aplicar
```

Nunca tratar los datos existentes como secundarios.

No reescribir una migración histórica aplicada sin un procedimiento de recuperación explícitamente aprobado.

---

## 19. Prisma 7 y generaciones schema-first

Cuando el proyecto use el flujo schema-first tradicional, revisar el SQL generado y probar la migración con datos representativos.

El schema tradicional puede organizarse en uno o varios archivos cuando la configuración y versión lo soporten. citeturn0search4

---

## 20. Prisma 8 y contratos

En Prisma 8 el contrato de datos es el artefacto central; las migraciones se planifican y verifican contra ese contrato. citeturn0search8turn0search9

No aplicar comandos o flujos de otra generación sin verificar compatibilidad.

---

## 21. Zero-Downtime Migration Engineering

Para cambios complejos:

### Expand
Agregar estructuras compatibles.

### Backfill
Migrar datos históricos de manera medible y reintentable.

### Dual Compatibility
Permitir coexistencia temporal de versiones cuando el despliegue lo requiera.

### Switch
Mover lectores y escritores.

### Observe
Verificar que no existan consumidores del contrato antiguo.

### Contract
Eliminar lo obsoleto.

Casos de alto riesgo:

- NULL → NOT NULL;
- cambio de tipo;
- rename;
- cambios de claves;
- tablas grandes;
- índices grandes;
- eliminación de columnas.

---

# PARTE VI — TRANSACCIONES Y CONCURRENCIA

## 22. Production Transaction Engineering

Una transacción no es un workflow completo.

No incluir en una transacción larga:

- HTTP;
- geocodificación;
- procesamiento completo de XLSX;
- esperas;
- efectos externos lentos.

Patrón:

```text
validar/preparar
↓
transacción corta
↓
persistir cambios atómicos
↓
commit
↓
efectos posteriores
```

Dentro de una transacción, utilizar el handle transaccional para todas las operaciones que deban participar.

---

## 23. Atomicidad vs workflow

Distinguir:

```text
Database transaction
≠
Business workflow
```

Una importación SGCI puede durar minutos; su workflow necesita estados persistentes y recuperación, no una transacción abierta durante todo el proceso.

---

## 24. Concurrencia

Nunca confiar únicamente en:

```text
SELECT → comprobar → INSERT
```

Diseñar con:

- constraints;
- transacciones;
- manejo de conflictos;
- concurrencia optimista cuando aplique;
- versionado o compare-and-swap cuando el dominio lo requiera.

---

## 25. Idempotencia y retry

Toda operación reintentable debe tener identidad.

Ejemplo:

```text
entrada normalizada
↓
identificador/hash
↓
constraint o estado durable
↓
reintento seguro
```

Clasificar errores:

- transitorio y reintentable;
- conflicto de concurrencia;
- violación de integridad;
- negocio;
- permanente.

No hacer retry ciego.

Cuando exista retry definir:

- máximo de intentos;
- backoff;
- jitter si múltiples workers pueden sincronizarse;
- observabilidad;
- condición de parada.

No prometer exactly-once sin una garantía real de extremo a extremo. Preferir:

```text
at-least-once delivery
+
idempotent processing
+
durable state
```

---

## 26. Transactional Outbox

Problema:

```text
persistir negocio
COMMIT
↓
falla antes de publicar evento/job
```

Solución cuando aplique:

En la misma transacción persistir:

- cambio de negocio;
- registro Outbox.

Un worker procesa posteriormente el efecto.

Los consumidores también deben ser idempotentes.

Evaluar especialmente en SGCI para:

- importaciones;
- jobs;
- progreso;
- notificaciones;
- sincronizaciones.

---

# PARTE VII — CONSULTAS Y RAW SQL

## 27. Elegir la superficie correcta

Orden preferente:

1. ORM/API tipada adecuada a la versión;
2. superficie SQL tipada disponible para versión/proveedor;
3. raw query parametrizada;
4. unsafe raw solo como excepción aprobada.

Prisma 8 documenta superficies separadas para ORM, SQL builder, pipelines y raw queries según proveedor. citeturn0search7

---

## 28. Raw SQL Governance

Toda consulta raw relevante debe documentar:

- problema;
- alternativa descartada;
- versión;
- proveedor;
- seguridad;
- test;
- expectativa de rendimiento.

Nunca concatenar entrada no confiable en SQL.

---

# PARTE VIII — SEGURIDAD Y ERRORES

## 29. Seguridad

Prisma no sustituye:

- autenticación;
- autorización;
- validación runtime;
- secretos;
- mínimos privilegios;
- protección de información sensible.

No seleccionar ni devolver datos sensibles sin necesidad.

---

## 30. Manejo de errores

Los errores de persistencia deben traducirse al nivel apropiado.

Nunca:

```ts
catch {
  return null
}
```

si eso convierte un fallo real en éxito aparente.

Un error debe poder:

- reintentarse cuando proceda;
- fallar cuando corresponda;
- registrarse;
- observarse.

Nunca fingir éxito después de un fallo de persistencia.

---

# PARTE IX — TESTING

## 31. Pirámide de pruebas

### Unit
Reglas puras, transformaciones, parsers y cálculos.

### Integration
Base real o equivalente para probar:

- constraints;
- FK;
- relaciones;
- transacciones;
- queries.

### Concurrencia
Operaciones simultáneas, duplicados y retries.

### Migration
Evolución desde datos existentes.

### Historical data
Compatibilidad de datos antiguos.

### Failure injection
Fallo:

- después de escribir;
- durante rollback;
- durante retry;
- entre commit y efecto externo.

Los mocks no sustituyen pruebas de constraints reales.

---

# PARTE X — OBSERVABILIDAD Y OPERACIÓN

## 32. Observabilidad

Medir cuando corresponda:

- latencia de queries;
- consultas lentas;
- tasa de errores;
- duración de transacciones;
- saturación de conexiones;
- agotamiento de conexiones;
- deadlocks;
- retries;
- duración de migraciones;
- throughput de jobs;
- fallos de rollback.

Logs útiles incluyen contexto, sin secretos ni datos sensibles innecesarios.

**Regla:** no optimizar ni diagnosticar por intuición cuando puede medirse.

---

# PARTE XI — PATRONES SGCI

## 33. Importaciones

Una importación de manifiesto es un job persistente:

```text
POST iniciar
↓
crear ImportJob
↓
RUNNING
↓
procesar
↓
persistir progreso
↓
persistir resultado
↓
COMPLETED / FAILED
```

El resultado debe estar asociado inequívocamente al `jobId`.

Nunca reconstruirlo mediante “último manifiesto” o timestamps ambiguos.

---

## 34. Rollback y compensación

Una importación puede afectar:

- Master AWB;
- Houses;
- bultos;
- personas;
- documentos;
- direcciones;
- geocodificación;
- metadatos.

Si existe rollback contractual, cubrir todos los efectos relevantes.

Los fallos de rollback no se ocultan.

Cuando un efecto externo no pueda revertirse, usar:

- compensación;
- estados;
- retries;
- reconciliación.

---

## 35. Geocodificación

Las llamadas externas permanecen fuera de transacciones largas.

Distinguir estados:

```text
encontrada
reutilizada
creada
pendiente
no encontrada
error
```

No colapsar estados técnicamente distintos si el workflow necesita diferenciarlos.

---

# PARTE XII — CALIDAD Y CI

## 36. Capas de validación

```text
Prisma       → contrato/schema
TypeScript   → tipos
ESLint       → patrones/calidad
Prettier     → formato
Tests        → comportamiento
Build        → integración
CodeQL       → seguridad/análisis
```

Cada capa cubre riesgos distintos.

CI verde no sustituye revisión funcional ni arquitectónica.

---

# PARTE XIII — ANTI-PATRONES

## 37. Anti-reglas

Evitar reglas absolutas:

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
- “TypeScript valida runtime”.
- “CI verde garantiza corrección funcional”.

La decisión depende del dominio, volumen, proveedor, arquitectura y operación.

---

# PARTE XIV — DECISIONES DE ARQUITECTURA

## 38. Persistence ADR

Para decisiones de alto impacto registrar:

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

Usar para:

- IDs;
- soft delete;
- JSON;
- multi-tenancy;
- repositorios;
- raw SQL;
- auditoría;
- particionamiento;
- outbox.

---

# PARTE XV — CODE REVIEW

## 39. Checklist

### Modelo
- [ ] Representa el dominio.
- [ ] Tipos correctos.
- [ ] Nullability justificada.
- [ ] Defaults válidos.

### Integridad
- [ ] PK correcta.
- [ ] Unicidad crítica protegida.
- [ ] FK correcta.
- [ ] Acciones referenciales revisadas.

### Performance
- [ ] Campos mínimos.
- [ ] Relaciones mínimas.
- [ ] Sin N+1 accidental.
- [ ] Índices justificados.
- [ ] Volumen futuro considerado.

### Concurrencia
- [ ] Race conditions consideradas.
- [ ] Idempotencia evaluada.
- [ ] Retry clasificado.
- [ ] Constraints protegen invariantes.

### Transacciones
- [ ] Límite correcto.
- [ ] Duración corta.
- [ ] Sin I/O externo innecesario.
- [ ] Handle transaccional usado correctamente.

### Migraciones
- [ ] Datos existentes considerados.
- [ ] Cambio destructivo analizado.
- [ ] Compatibilidad de despliegue evaluada.
- [ ] Recuperación/compensación definida.

### Testing
- [ ] Unit cuando aplica.
- [ ] Integration para persistencia crítica.
- [ ] Concurrencia cuando aplica.
- [ ] Migración/histórico cuando aplica.
- [ ] Failure paths cubiertos.

---

# PARTE XVI — DEFINITION OF DONE

## 40. Un cambio de persistencia está terminado cuando

### Compatibilidad
- [ ] Versión Prisma identificada.
- [ ] Proveedor identificado.
- [ ] Dependencias de versión documentadas.

### Modelo
- [ ] Identidad correcta.
- [ ] Tipos correctos.
- [ ] Nullability justificada.
- [ ] Constraints correctas.
- [ ] Relaciones correctas.

### Migración
- [ ] Generada/planificada según generación.
- [ ] Revisada.
- [ ] Datos existentes considerados.
- [ ] Cambios destructivos analizados.
- [ ] Compatibilidad de despliegue evaluada.

### Concurrencia
- [ ] Race conditions evaluadas.
- [ ] Idempotencia definida.
- [ ] Retry definido si aplica.

### Operación
- [ ] Observabilidad suficiente.
- [ ] Estados consistentes.
- [ ] Estrategia ante fallo a mitad.

### Calidad
- [ ] Prisma.
- [ ] TypeScript.
- [ ] ESLint.
- [ ] Prettier.
- [ ] Tests.
- [ ] Build.
- [ ] CodeQL.
- [ ] Revisión funcional.

---

# PARTE XVII — PRINCIPIOS DE ORO

## 41. Principios

1. Modela el dominio, no la pantalla.
2. Usa tipos que representen el dato.
3. No hagas todo nullable.
4. Protege invariantes críticas en el nivel correcto.
5. Las relaciones representan cardinalidad real.
6. Los índices responden a queries reales.
7. No confundas modelo OOP con modelo relacional.
8. No uses JSON para ocultar un mal modelo.
9. Las migraciones son código crítico.
10. Los datos existentes importan tanto como el código nuevo.
11. Una transacción no es un workflow.
12. Mantén las transacciones cortas.
13. Diseña para concurrencia.
14. Haz idempotentes las operaciones que puedan repetirse.
15. Clasifica antes de reintentar.
16. Nunca ocultes fallos de persistencia.
17. Evita N+1.
18. Recupera solo lo necesario.
19. Prueba constraints con una DB real.
20. CI verde no sustituye revisión funcional.
21. Documenta las decisiones irreversibles.
22. Si no puedes explicar qué ocurre cuando falla a mitad, el diseño no está terminado.

---

# 42. Fuentes oficiales prioritarias

- Prisma ORM y Prisma 8: documentación oficial.
- Prisma 7: documentación versionada oficial.
- Data modeling y relations.
- Migrations.
- Transactions.
- Raw queries.
- Database features.
- TypeScript.
- ESLint.
- typescript-eslint.
- Prettier.
- GitHub CodeQL.

La documentación oficial correspondiente a la versión instalada tiene prioridad sobre ejemplos antiguos, artículos o convenciones heredadas.

---

## 43. Nota final

Este estándar debe mantenerse vivo.

Revisarlo cuando cambien:

- Prisma;
- proveedor o versión de base de datos;
- arquitectura;
- volumen;
- seguridad;
- estrategia de despliegue.

**Objetivo de SGCI:**

> Código correcto, datos íntegros, operaciones observables, concurrencia entendida, migraciones seguras y un sistema que siga siendo mantenible después de años de evolución.
