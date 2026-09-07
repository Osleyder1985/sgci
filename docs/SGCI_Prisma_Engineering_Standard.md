# SGCI — Prisma Engineering Standard

## Guía de ingeniería profesional con Prisma

**Proyecto:** SGCI  
**Versión del documento:** 1.0  
**Estado:** Propuesta de estándar de ingeniería

---

## 1. Propósito

Este documento define cómo diseñar, modificar, revisar, probar y operar Prisma de forma profesional dentro de SGCI.

No es únicamente una guía de sintaxis. Prisma forma parte del contrato de datos de la aplicación: el schema, las migraciones, las relaciones, las restricciones de la base de datos, Prisma Client y el código que lo utiliza deben evolucionar de forma coordinada.

Una implementación profesional debe optimizar simultáneamente:

- Correctitud.
- Integridad de datos.
- Seguridad.
- Rendimiento.
- Mantenibilidad.
- Evolución del schema.
- Concurrencia.
- Observabilidad.
- Testabilidad.
- Compatibilidad.
- Calidad de código.
- Claridad arquitectónica.

**Regla principal:** que el código compile no significa que el cambio esté terminado.

---

## 2. Prisma dentro de la arquitectura

Prisma es una capa de acceso a datos, no la arquitectura completa.

```text
HTTP / UI
   ↓
Controller / Route
   ↓
Application Service
   ↓
Domain / Business Rules
   ↓
Persistence / Repository (cuando aporte valor)
   ↓
Prisma Client
   ↓
Database
```

### Responsabilidades

**Controller:** HTTP, entrada, autenticación/autorización y respuesta.

**Application Service:** casos de uso, coordinación, transacciones, estados, idempotencia y operaciones externas.

**Domain:** reglas de negocio.

**Persistence:** consultas y patrones de acceso cuando una abstracción realmente aporte valor.

**Prisma:** acceso tipado y estructurado a la base de datos.

No convertir Prisma en el lugar donde vive toda la lógica de negocio.

---

## 3. Versionado

Antes de modificar Prisma:

```bash
npx prisma -v
```

Revisar la versión instalada de `prisma` y `@prisma/client` y utilizar la documentación correspondiente a esa versión.

Una actualización mayor de Prisma no debe introducirse únicamente porque exista una versión más nueva. Debe tratarse como un cambio técnico planificado, con pruebas y revisión de compatibilidad.

---

## 4. Modelado de datos

Modelar el dominio, no la pantalla.

El schema debe representar entidades, reglas y relaciones reales. No crear una tabla gigante llena de campos opcionales solo para simplificar una interfaz.

### Convenciones

- Modelos: `PascalCase` y singular.
- Campos: `camelCase`.
- Nombres físicos heredados: usar `@map` y `@@map`.

Ejemplo:

```prisma
model Manifest {
  id        Int      @id @default(autoincrement())
  fileHash  String   @unique
  createdAt DateTime @default(now())
}
```

Si la base existente utiliza otros nombres:

```prisma
model Manifest {
  id       Int    @id @default(autoincrement()) @map("manifest_id")
  fileHash String @unique @map("file_hash")

  @@map("manifests")
}
```

---

## 5. Tipos de datos

Usar el tipo que represente la naturaleza real del dato.

- `String`: texto, códigos y valores dinámicos.
- `Int`: enteros dentro del rango apropiado.
- `BigInt`: enteros que pueden superar el rango de `Int`.
- `Decimal`: valores que requieren precisión decimal, especialmente importes.
- `Float`: valores de coma flotante cuando su precisión sea aceptable.
- `Boolean`: estados realmente binarios.
- `DateTime`: instantes temporales reales.
- `Json`: estructuras variables cuando realmente necesiten flexibilidad.
- Tipos nativos: utilizarlos cuando expresen correctamente una capacidad del motor.

No almacenar fechas, pesos o estados como `String` por comodidad cuando existe un tipo mejor.

No utilizar `Json` para esconder un modelo relacional que necesita relaciones, restricciones o índices.

---

## 6. Nullabilidad y defaults

Usar `?` únicamente cuando la ausencia tenga significado de negocio.

Preferir:

```prisma
status String @default("PENDING")
```

cuando todo registro deba tener un estado inicial válido, en lugar de hacer `status` nullable sin necesidad.

Los defaults deben representar valores iniciales válidos, no ocultar datos obligatorios.

---

## 7. Identidad y claves

Toda entidad persistida debe tener una estrategia clara de identidad.

Puede utilizar:

- clave técnica autoincremental;
- UUID;
- identificador natural;
- clave compuesta.

No confundir el ID técnico con identificadores de negocio como AWB, tracking number o códigos externos.

Si una regla de negocio exige unicidad, expresarla también en la base de datos:

```prisma
awb String @unique
```

---

## 8. Unique constraints

Las reglas importantes de unicidad deben protegerse en la base de datos.

No depender únicamente de:

```text
SELECT → comprobar → INSERT
```

porque dos procesos concurrentes pueden observar que el dato no existe al mismo tiempo.

La aplicación puede hacer una comprobación previa para mejorar la experiencia, pero la constraint de la DB es la defensa definitiva.

Las claves únicas compuestas son apropiadas cuando la identidad depende de varios campos:

```prisma
@@unique([countryCode, externalCode])
```

---

## 9. Relaciones

Las relaciones deben representar la cardinalidad real.

### 1:1

Una relación uno a uno necesita una FK única en el lado dependiente:

```prisma
model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
}
```

### 1:N

La FK suele vivir en el lado dependiente:

```prisma
model Manifest {
  id     Int    @id @default(autoincrement())
  houses House[]
}

model House {
  id         Int      @id @default(autoincrement())
  manifestId Int
  manifest   Manifest @relation(fields: [manifestId], references: [id])
}
```

### N:M

Usar relación implícita cuando no existan atributos propios de la relación y sea apropiado para el caso.

Usar modelo explícito cuando la relación tenga información propia:

```prisma
model UserTeam {
  userId   Int
  teamId   Int
  joinedAt DateTime @default(now())
  role     String

  user User @relation(fields: [userId], references: [id])
  team Team @relation(fields: [teamId], references: [id])

  @@id([userId, teamId])
}
```

### Autorelaciones y relaciones múltiples

Nombrar explícitamente las relaciones cuando existan varias relaciones entre los mismos modelos o relaciones autorreferenciales.

---

## 10. Foreign keys y acciones referenciales

Las foreign keys protegen la integridad de las relaciones.

No confiar exclusivamente en la aplicación para impedir referencias inválidas.

Las acciones `onDelete` y `onUpdate` deben ser deliberadas. `Cascade` no debe utilizarse automáticamente: una cascada incorrecta puede eliminar datos válidos.

Revisar también `relationMode` y preferir la integridad de la base de datos cuando el motor relacional lo soporte y sea apropiado.

---

## 11. Herencia y polimorfismo

Prisma no implementa herencia OOP como:

```ts
class Dog extends Animal {}
```

El modelado relacional necesita un patrón equivalente.

Opciones habituales:

1. **Composición / 1:1** para especializaciones separadas.
2. **Single Table + discriminator** cuando una tabla común sea adecuada.
3. **Table-per-type** cuando las especializaciones necesiten tablas separadas.
4. **Características específicas del motor** cuando estén soportadas por el conector y la versión utilizada.

Ejemplo discriminator:

```prisma
enum PartyType {
  PERSON
  COMPANY
}

model Party {
  id    Int       @id @default(autoincrement())
  type  PartyType
  name  String
  taxId String?
}
```

No introducir herencia solo para imitar una jerarquía OOP. Preferir el modelo que haga explícitas las reglas de datos.

---

## 12. Enums vs tablas de referencia

Usar `enum` para conjuntos pequeños, estables y controlados por código.

Usar tablas de referencia cuando los valores sean dinámicos, configurables, administrables o necesiten metadata.

Ejemplos de catálogos de negocio que normalmente requieren entidades propias:

```text
Country
Province
Municipality
Locality
Consejo Popular
```

---

## 13. Índices

Diseñar índices a partir de consultas reales.

Considerar índices para campos utilizados frecuentemente en:

- `where`;
- `orderBy`;
- relaciones/FK;
- búsquedas críticas.

Ejemplo:

```prisma
@@index([manifestId])
```

Para consultas compuestas:

```prisma
@@index([manifestId, status])
```

El orden de las columnas importa.

No indexar todo: los índices también tienen coste de almacenamiento y escritura.

---

## 14. Organización del schema

Cuando la versión/configuración del proyecto lo permita, un schema grande puede dividirse por dominio:

```text
prisma/
  schema/
    manifest.prisma
    person.prisma
    address.prisma
    geocoding.prisma
    territory.prisma
```

La división debe mejorar descubribilidad y revisión, no añadir complejidad sin beneficio.

---

## 15. Migraciones

Una migración es código versionado y debe revisarse como código crítico.

Flujo:

```text
Cambiar schema
    ↓
Generar migración
    ↓
Revisar SQL
    ↓
Probar
    ↓
Verificar datos
    ↓
Aplicar
```

### Regla crítica

**Nunca modificar una migración que ya fue aplicada.**

Si existe un problema, crear una nueva migración.

---

## 16. Cambios destructivos

Requieren análisis especial:

- eliminar columnas o tablas;
- cambiar tipos incompatibles;
- nullable → required;
- modificar claves;
- eliminar enums utilizados;
- borrar datos.

Analizar siempre:

- datos existentes;
- código consumidor;
- jobs;
- integraciones;
- frontend;
- rollback o compensación.

---

## 17. Expand / Contract

Para cambios de producción complejos:

1. **Expand:** añadir lo nuevo sin romper lo existente.
2. **Migrate:** transformar/copiar datos.
3. **Switch:** cambiar la aplicación al nuevo contrato.
4. **Contract:** retirar lo antiguo cuando ya no tenga consumidores.

Este patrón reduce riesgos de incompatibilidad y downtime.

---

## 18. Prisma Client

Operaciones habituales:

- `create`
- `createMany`
- `findUnique`
- `findFirst`
- `findMany`
- `update`
- `updateMany`
- `delete`
- `deleteMany`
- `upsert`

Elegir la operación que exprese claramente la intención.

---

## 19. select e include

No recuperar datos innecesarios.

Preferir `select` cuando el contrato necesita un conjunto pequeño y conocido de campos:

```ts
const person = await prisma.person.findUnique({
  where: { id },
  select: {
    id: true,
    firstName: true,
    lastName: true,
  },
});
```

Usar `include` cuando realmente se necesitan relaciones.

---

## 20. N+1 y consultas en loops

Evitar patrones como:

```ts
for (const item of items) {
  await prisma.person.findUnique(...);
}
```

si el volumen puede ser grande y la consulta puede resolverse mediante:

- `include`;
- `select`;
- batching;
- `createMany`;
- consultas agrupadas.

No toda consulta dentro de un loop es incorrecta, pero siempre debe justificarse.

---

## 21. Paginación

No asumir que una tabla permanecerá pequeña.

Diseñar paginación desde el dominio de consulta cuando los conjuntos puedan crecer.

Opciones:

- offset pagination;
- cursor pagination.

Las consultas paginadas deben tener orden determinista. Cuando sea necesario, utilizar una segunda columna estable como desempate:

```text
ORDER BY createdAt, id
```

---

## 22. Raw SQL

El SQL directo puede ser válido cuando Prisma no exprese bien una consulta o se necesite una capacidad específica del motor.

Reglas:

- parametrizar valores;
- evitar concatenación de entrada del usuario;
- revisar permisos y compatibilidad;
- probar la consulta;
- documentar por qué es necesario.

Nunca utilizar SQL inseguro para evitar la API tipada por comodidad.

---

## 23. Transacciones

Las transacciones agrupan operaciones que deben ser atómicas.

Ejemplo:

```ts
await prisma.$transaction(async (tx) => {
  await tx.person.create(...);
  await tx.document.create(...);
});
```

Dentro de la transacción se debe utilizar el cliente transaccional `tx` para las operaciones que formen parte de ella.

### Regla de duración

Mantener las transacciones cortas.

No incluir dentro de una transacción larga:

- llamadas HTTP externas;
- geocodificación;
- procesamiento completo de XLSX;
- esperas prolongadas.

---

## 24. Concurrencia e idempotencia

Diseñar pensando en procesos simultáneos.

Una comprobación previa no garantiza unicidad bajo concurrencia. Utilizar constraints, transacciones y manejo de errores.

Una operación crítica repetida debe ser idempotente cuando el negocio lo requiera.

Ejemplo SGCI:

```text
mismo archivo
    ↓
SHA-256
    ↓
unique constraint
    ↓
no duplicar la importación equivalente
```

---

## 25. Manejo de errores

Los errores de Prisma deben convertirse en errores de dominio/API apropiados.

No hacer:

```ts
catch {
  return null;
}
```

si eso oculta un fallo real.

Los errores de persistencia deben poder:

- reintentarse cuando proceda;
- provocar fallo cuando corresponda;
- quedar registrados;
- ser observables.

**Nunca fingir éxito después de un fallo de persistencia.**

---

## 26. Seguridad

Prisma no sustituye:

- autenticación;
- autorización;
- validación de entrada;
- gestión de secretos;
- políticas de acceso.

No seleccionar ni devolver información sensible si no es necesaria.

Separar claramente:

```text
¿Quién puede ejecutar la operación?
```

de:

```text
¿Cómo se persisten los datos?
```

---

## 27. TypeScript

Mantener TypeScript estricto cuando el proyecto lo permita:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true
  }
}
```

Prestar especial atención a:

- `strictNullChecks`;
- `noImplicitAny`;
- `noImplicitReturns`;
- promesas no esperadas.

No relajar tipos para ocultar un problema del modelo.

---

## 28. Promesas y jobs

En operaciones críticas no lanzar trabajo asíncrono y marcar el proceso como terminado antes de esperar su resultado.

Malo:

```text
iniciar procesamiento
↓
marcar COMPLETED
↓
el procesamiento continúa
```

Correcto:

```text
RUNNING
↓
await procesamiento
↓
await persistir resultado
↓
COMPLETED
```

Reglas de lint como `no-floating-promises` pueden ayudar a detectar errores de lifecycle.

---

## 29. Prettier, ESLint y CodeQL

Son capas distintas:

```text
TypeScript → tipos
ESLint     → patrones/calidad
Prettier   → formato
CodeQL     → seguridad/análisis estático
Tests      → comportamiento
Build      → integración de compilación
```

No considerar un cambio completo hasta que las comprobaciones relevantes estén verdes.

Prettier en CI puede utilizar:

```bash
npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,md}"
```

`--check` verifica; no corrige.

No desactivar reglas de ESLint para ocultar problemas sin una justificación técnica.

---

## 30. Testing

Usar diferentes niveles de prueba.

### Unit

Para:

- reglas de negocio;
- transformaciones;
- parsers;
- validaciones;
- cálculos.

### Integration

Para comprobar con una base real o equivalente:

- FK;
- unique constraints;
- relaciones;
- transacciones;
- migraciones;
- rollback.

### E2E

Para comportamiento observable de extremo a extremo.

### Concurrencia

Probar operaciones simultáneas cuando existan reglas de unicidad, jobs o recursos compartidos.

No sustituir todos los tests de persistencia por mocks: los mocks no prueban constraints reales de la base de datos.

---

## 31. Observabilidad

Un sistema profesional debe permitir responder:

- qué ocurrió;
- cuándo ocurrió;
- cuánto tardó;
- dónde falló;
- qué datos procesó;
- cuántas consultas ejecutó cuando sea relevante.

Los logs no deben contener secretos ni datos sensibles innecesarios.

Un log útil debe incluir contexto, por ejemplo:

```text
importJob=abc123
stage=geocoding
processed=500
failed=3
elapsed=12.4s
```

---

## 32. Importaciones SGCI

Una importación de manifiesto es una operación de larga duración y debe tratarse como job persistente, no como una simple petición HTTP.

Arquitectura:

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

El resultado final debe estar asociado inequívocamente al `jobId`.

No reconstruir el resultado mediante:

- último manifiesto;
- timestamp aproximado;
- totales ambiguos;
- consultas que puedan cruzarse con otra importación concurrente.

---

## 33. Rollback de importaciones

Una importación puede afectar:

- Master AWB;
- Houses;
- bultos;
- personas;
- documentos;
- direcciones;
- datos de geocodificación;
- metadatos.

Si el contrato exige rollback, debe contemplar todos los efectos relevantes, no únicamente la tabla principal.

Los fallos durante rollback no deben ocultarse.

Cuando una operación externa no pueda deshacerse, utilizar compensación, estados, reintentos o reconciliación según corresponda.

---

## 34. Geocodificación

Las llamadas a proveedores externos deben permanecer fuera de transacciones DB largas.

Separar conceptualmente:

```text
dirección encontrada
≠
dirección reutilizada
≠
dirección creada
≠
dirección pendiente
≠
no encontrada
≠
error
```

Los estados deben reflejar el contrato real del sistema.

---

## 35. Catálogo territorial cubano

El modelo territorial de SGCI debe poder representar de forma determinista:

```text
País
 ↓
Provincia
 ↓
Municipio
 ↓
Localidad
 ↓
Consejo Popular
```

Además de:

- aliases;
- normalización;
- identificadores;
- fuentes;
- relaciones;
- mecanismos de resolución/cache cuando correspondan.

No declarar el catálogo completo sin verificar realmente su cobertura.

---

## 36. Compatibilidad del schema

Un campo Prisma puede ser utilizado por:

- servicios;
- controllers;
- frontend;
- tests;
- jobs;
- migraciones;
- integraciones;
- reportes.

Por eso, renombrar un campo no es una operación puramente estética.

Antes de modificar un campo:

```text
buscar consumidores
↓
evaluar impacto
↓
planificar migración
↓
adaptar código
↓
probar
```

Los nombres existentes deben preservarse cuando forman parte de contratos o compatibilidad histórica, salvo que exista un plan de migración explícito.

---

## 37. Performance checklist

Antes de aprobar una consulta importante:

```text
[ ] ¿Trae solo los campos necesarios?
[ ] ¿Trae solo las relaciones necesarias?
[ ] ¿Puede producir N+1?
[ ] ¿Tiene paginación?
[ ] ¿El orden es determinista?
[ ] ¿Existen índices adecuados?
[ ] ¿El volumen futuro fue considerado?
[ ] ¿Se necesita batching?
[ ] ¿La consulta fue medida cuando el riesgo lo justifica?
```

Optimizar con evidencia, no únicamente por intuición.

---

## 38. Code review checklist

### Modelo

- [ ] Representa el dominio real.
- [ ] Tipos correctos.
- [ ] Nullability justificada.
- [ ] Defaults correctos.

### Integridad

- [ ] PK correcta.
- [ ] Unique constraints correctas.
- [ ] FK correctas.
- [ ] Referential actions revisadas.

### Relaciones

- [ ] Cardinalidad correcta.
- [ ] Relaciones nombradas cuando sea necesario.
- [ ] N:M explícita si tiene atributos propios.

### Performance

- [ ] Índices basados en consultas reales.
- [ ] Sin N+1 accidental.
- [ ] Sin sobrecarga de datos.
- [ ] Paginación cuando corresponda.

### Concurrencia

- [ ] Race conditions consideradas.
- [ ] Idempotencia considerada.
- [ ] Constraints DB protegen reglas críticas.

### Transacciones

- [ ] Atomicidad correcta.
- [ ] Transacción corta.
- [ ] No hay HTTP externo dentro de una transacción larga.
- [ ] Se usa `tx` dentro de la transacción.

### Migración

- [ ] SQL revisado.
- [ ] Datos existentes considerados.
- [ ] Cambios destructivos analizados.
- [ ] No se modifican migraciones aplicadas.

### Calidad

- [ ] TypeScript.
- [ ] ESLint.
- [ ] Prettier.
- [ ] Tests.
- [ ] CodeQL.
- [ ] Build.

### Operación

- [ ] Logs suficientes.
- [ ] Estados coherentes.
- [ ] Fallos observables.
- [ ] Recuperación/reintento definido cuando corresponda.

---

## 39. Anti-patrones

Evitar:

### Todo nullable

```prisma
name   String?
status String?
type   String?
```

sin una razón de negocio.

### Todo String

```prisma
createdAt String
weight    String
active    String
```

cuando existen tipos apropiados.

### Unicidad solo en código

```text
if (!exists) create
```

sin constraint de DB.

### Catch silencioso

```ts
catch {
  // ignorar
}
```

### Transacción gigante

```text
BEGIN
→ HTTP
→ XLSX
→ geocoding
→ loops
→ COMMIT
```

### Queries sin control dentro de loops

```ts
for (...) {
  await prisma...
}
```

### Tests manipulados para pasar

No cambiar el test únicamente para esconder un bug.

### Reescribir migraciones antiguas

Crear una migración nueva.

---

## 40. Definition of Done

Un cambio Prisma se considera terminado únicamente cuando:

### Schema

- [ ] PK definida.
- [ ] FK definida.
- [ ] Unique constraints definidas.
- [ ] Índices revisados.
- [ ] Tipos correctos.
- [ ] Nullability justificada.
- [ ] Defaults correctos.
- [ ] Acciones referenciales revisadas.

### Migración

- [ ] Generada.
- [ ] SQL revisado.
- [ ] Probada.
- [ ] Datos existentes considerados.
- [ ] Cambios destructivos analizados.
- [ ] Rollback/compensación definido.

### Código

- [ ] Reglas de negocio correctas.
- [ ] Errores tratados.
- [ ] Sin promesas abandonadas.
- [ ] Sin consultas innecesarias.
- [ ] Seguridad revisada.

### Tests

- [ ] Unit cuando corresponda.
- [ ] Integration cuando haya persistencia.
- [ ] Casos de error.
- [ ] Concurrencia cuando aplique.
- [ ] Rollback cuando aplique.

### CI

- [ ] Prisma generate.
- [ ] Prisma validate.
- [ ] TypeScript API/Web.
- [ ] Lint.
- [ ] Prettier.
- [ ] Tests.
- [ ] Build.
- [ ] CodeQL.

### Operación

- [ ] Observabilidad suficiente.
- [ ] Estados consistentes.
- [ ] Idempotencia cuando corresponda.
- [ ] Estrategia ante fallo a mitad.

---

## 41. Flujo profesional para cambios Prisma

```text
1. Leer código actual
2. Leer schema
3. Buscar consumidores
4. Entender relaciones
5. Diseñar cambio
6. Evaluar integridad y concurrencia
7. Modificar schema
8. Crear migración
9. Revisar SQL
10. Implementar servicio
11. Implementar errores
12. Crear tests
13. Prisma validate/generate
14. TypeScript
15. ESLint
16. Prettier
17. Tests
18. Build
19. CodeQL
20. Revisión funcional
```

---

## 42. Principios de oro

1. **Modela el dominio, no la pantalla.**
2. **Usa tipos que representen correctamente los datos.**
3. **No hagas todo nullable.**
4. **Protege reglas importantes con constraints de base de datos.**
5. **Las relaciones deben representar la cardinalidad real.**
6. **Los índices deben responder a consultas reales.**
7. **No confundas herencia OOP con modelado relacional.**
8. **No uses JSON para ocultar un modelo relacional mal diseñado.**
9. **Revisa las migraciones como código crítico.**
10. **Nunca reescribas migraciones aplicadas.**
11. **Mantén las transacciones cortas.**
12. **No metas llamadas externas dentro de transacciones largas.**
13. **Diseña para concurrencia.**
14. **Haz operaciones críticas idempotentes.**
15. **Nunca ocultes errores de persistencia.**
16. **No marques un job como completado antes de terminar.**
17. **Evita N+1.**
18. **No recuperes datos innecesarios.**
19. **Prueba constraints y transacciones con una DB real.**
20. **TypeScript, ESLint, Prettier y CodeQL son capas distintas.**
21. **CI verde no sustituye revisión funcional.**
22. **El schema Prisma es un contrato.**
23. **Los datos existentes importan tanto como el código nuevo.**
24. **Toda operación de alto impacto necesita una estrategia de fallo.**
25. **Si no puedes explicar qué pasa cuando falla a mitad, el diseño todavía no está terminado.**

---

## 43. Ruta de aprendizaje

### Nivel 1 — Fundamentos

- SQL.
- Tablas.
- PK/FK.
- Índices.
- Joins.
- Nullability.
- Transacciones.

### Nivel 2 — Prisma

- Schema.
- Models.
- Scalar types.
- Relations.
- Prisma Client.
- CRUD.
- `select` / `include`.
- Filters.

### Nivel 3 — Diseño

- Normalización.
- Cardinalidad.
- Constraints.
- Índices.
- Enums.
- Composición.
- Polimorfismo.

### Nivel 4 — Migraciones

- Migration workflow.
- SQL generado.
- Data migrations.
- Cambios destructivos.
- Expand/contract.
- Producción.

### Nivel 5 — Backend profesional

- Arquitectura.
- Servicios.
- Persistencia.
- Errores.
- Validación.
- Transacciones.
- Idempotencia.

### Nivel 6 — Rendimiento

- N+1.
- Batching.
- Índices.
- Paginación.
- Query plans.
- Observabilidad.
- Concurrencia.

### Nivel 7 — Producción

- Deployments.
- Backups.
- Recuperación.
- Migraciones.
- Compatibilidad.
- Concurrencia alta.
- Monitoring.

### Nivel 8 — Arquitectura avanzada

- Bounded contexts.
- Eventos.
- Outbox.
- Idempotencia distribuida.
- Consistencia eventual.
- Compensaciones.
- Escalabilidad.

---

## 44. Fuentes oficiales

La documentación primaria debe ser la referencia principal:

- Prisma: https://www.prisma.io/docs
- Prisma ORM: https://www.prisma.io/docs/orm
- Prisma Data Model: https://www.prisma.io/docs/orm/prisma-schema/data-model
- Prisma Relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- Prisma Indexes: https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes
- Prisma Migrate: https://www.prisma.io/docs/orm/prisma-migrate
- Prisma Client: https://www.prisma.io/docs/orm/prisma-client
- Prisma Transactions: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
- Prisma Database Features: https://www.prisma.io/docs/orm/reference/database-features
- Prisma Best Practices: https://www.prisma.io/docs/orm/more/best-practices
- TypeScript: https://www.typescriptlang.org/docs/
- ESLint: https://eslint.org/docs/latest/
- typescript-eslint: https://typescript-eslint.io/
- Prettier: https://prettier.io/docs/
- GitHub CodeQL: https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql
- Playwright: https://playwright.dev/docs/

---

## 45. Nota final

Este documento debe mantenerse vivo y revisarse cuando cambien Prisma, el motor de base de datos, la arquitectura, el volumen de datos, los requisitos de seguridad o la estrategia de despliegue.

**Objetivo de SGCI:**

> Código que compile, datos que permanezcan íntegros, operaciones observables, cambios reversibles o compensables cuando corresponda y un sistema mantenible después de años de evolución.
