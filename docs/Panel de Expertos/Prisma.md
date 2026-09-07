Panel de expertos recomendado

1. Prisma ORM Expert / Prisma Solution Architect ⭐⭐⭐⭐⭐

Es el experto principal.

Debe dominar profundamente:

Prisma Schema;

Prisma Client;

relaciones;

cardinalidad;

claves;

índices;

migraciones;

transacciones;

consultas complejas;

Prisma Migrate;

rendimiento;

Prisma Accelerate/Pulse u otras capacidades vigentes cuando apliquen;

estrategias de testing;

producción.

Su misión sería responder:

> ¿Todo lo que afirma el documento está alineado con las capacidades reales y las recomendaciones actuales de Prisma?

Idealmente, debería ser alguien con experiencia directa en proyectos grandes con Prisma y conocimiento profundo de la documentación oficial.

---

2. Database Architect / Database Engineer ⭐⭐⭐⭐⭐

Un experto en Prisma no es suficiente.

Prisma es una capa ORM, pero debajo existe un sistema de bases de datos que tiene sus propias reglas.

Este experto debe dominar:

PostgreSQL;

MySQL;

SQL Server;

modelado relacional;

normalización;

desnormalización;

claves primarias;

claves foráneas;

índices;

índices compuestos;

integridad referencial;

planes de ejecución;

concurrencia;

bloqueos;

transacciones;

aislamiento;

consistencia.

Su misión:

> Determinar si las recomendaciones del documento producen un modelo de datos correcto y escalable incluso más allá de Prisma.

Esto es fundamental para evitar un error frecuente:

hacer algo que parece correcto en Prisma pero que es una mala decisión a nivel de base de datos.

---

3. Senior Backend Architect / Staff Engineer ⭐⭐⭐⭐⭐

Debe evaluar Prisma dentro de una arquitectura real.

Áreas:

NestJS;

arquitectura modular;

Clean Architecture;

Domain-Driven Design;

Repository Pattern cuando realmente sea necesario;

separación entre dominio e infraestructura;

transacciones;

servicios;

DTOs;

límites de módulos;

dependencias.

Su misión:

> Evitar que el documento enseñe a usar Prisma correctamente pero produzca una arquitectura de backend incorrecta.

Debe analizar preguntas como:

¿Debe Prisma aparecer directamente en todos los servicios?

¿Cuándo tiene sentido encapsular Prisma?

¿Cuándo un Repository Pattern añade valor y cuándo solo añade abstracción innecesaria?

¿Cómo deben propagarse las transacciones?

¿Dónde deben vivir las reglas de negocio?

---

4. Principal Software Engineer / Staff+ Engineer ⭐⭐⭐⭐⭐

Este perfil evalúa el documento como estándar de ingeniería, no solamente como manual técnico.

Debe evaluar:

mantenibilidad;

evolución del sistema;

consistencia;

simplicidad;

deuda técnica;

decisiones reversibles;

decisiones irreversibles;

API design;

contratos;

refactoring;

escalabilidad del equipo.

Su misión:

> ¿Este documento ayudaría a un equipo a tomar buenas decisiones durante años?

Porque un documento de referencia mundial debe funcionar no solamente para escribir código hoy.

Debe ayudar a evitar problemas dentro de:

1 año;

3 años;

5 años.

---

Expertos especializados adicionales

5. Database Performance Engineer ⭐⭐⭐⭐⭐

Especialista en:

índices;

N+1 queries;

queries costosas;

paginación;

carga masiva;

conexiones;

connection pooling;

límites de recursos;

métricas;

profiling.

Debe evaluar especialmente:

Performance
Escalabilidad
Queries
Includes
Selects
Índices
Paginación
Bulk operations
Transactions

Su pregunta principal:

> ¿Las recomendaciones siguen funcionando cuando SGCI pasa de miles a millones de registros?

---

6. Distributed Systems / Concurrency Engineer ⭐⭐⭐⭐⭐

Muy importante para sistemas reales.

Debe revisar:

condiciones de carrera;

transacciones;

aislamiento;

concurrencia;

idempotencia;

retries;

consistencia;

locks;

operaciones duplicadas;

jobs.

Especialmente relevante para SGCI debido a procesos como:

importación de manifiestos;

creación de personas;

direcciones;

documentos;

geocodificación;

jobs;

progreso;

rollback.

Su misión:

> ¿Qué ocurre cuando dos o más procesos ejecutan operaciones simultáneamente?

---

7. Application Security Engineer ⭐⭐⭐⭐⭐

Debe evaluar Prisma desde el punto de vista de seguridad.

Especialmente:

SQL injection;

$queryRaw;

$executeRaw;

consultas dinámicas;

exposición de datos;

autorización;

mass assignment;

validación;

información sensible;

logs;

secretos.

Su misión:

> Identificar cualquier recomendación que pueda llevar a un desarrollador a creer que usar Prisma automáticamente hace segura una aplicación.

---

8. Data Integrity Specialist ⭐⭐⭐⭐⭐

Especialista en:

invariantes;

constraints;

consistencia;

duplicados;

integridad referencial;

unicidad;

cascadas;

borrado;

soft delete;

auditoría.

Debe revisar preguntas como:

¿Qué reglas deben estar en Prisma?

¿Qué reglas deben estar en la base de datos?

¿Qué reglas deben estar en la aplicación?

¿Qué pasa si Prisma no es el único cliente de la base de datos?

Este punto es extremadamente importante para convertir el documento en referencia de alto nivel.

---

9. QA Automation / Test Architect ⭐⭐⭐⭐⭐

Debe revisar cómo el documento recomienda probar Prisma.

Áreas:

tests unitarios;

integración;

bases de datos de prueba;

fixtures;

aislamiento;

transacciones;

rollback;

migraciones;

concurrencia;

regresiones.

Su pregunta:

> ¿Las recomendaciones permiten demostrar realmente que la persistencia funciona?

No debe aceptarse una guía que recomiende únicamente mocks para probar operaciones críticas de Prisma.

---

10. DevOps / Platform Engineer ⭐⭐⭐⭐⭐

Debe revisar la operación de Prisma en producción.

Áreas:

migraciones;

CI/CD;

despliegues;

rollback;

backups;

connection pooling;

variables de entorno;

observabilidad;

producción;

múltiples instancias.

Su misión:

> ¿Puede un equipo desplegar y evolucionar este esquema de forma segura?

---

El experto que falta y es muy importante: Technical Writer

Para ser una referencia mundial, el contenido correcto no es suficiente.

Un Technical Writer de nivel alto debería evaluar:

estructura;

progresión pedagógica;

terminología;

consistencia;

ejemplos;

ambigüedad;

referencias;

navegación;

índice;

separación entre reglas y recomendaciones;

ejemplos correctos e incorrectos.

Debe conseguir que el documento tenga esta propiedad:

> Un junior puede aprender correctamente y un Staff Engineer puede utilizarlo como referencia sin encontrar ambigüedades.

---

El panel ideal

Si queremos llevar el documento al máximo nivel posible, yo organizaría la evaluación así:

Experto Prioridad

Prisma Expert ⭐⭐⭐⭐⭐
Database Architect ⭐⭐⭐⭐⭐
Backend Architect ⭐⭐⭐⭐⭐
Principal/Staff Engineer ⭐⭐⭐⭐⭐
Database Performance Engineer ⭐⭐⭐⭐⭐
Concurrency/Distributed Systems Engineer ⭐⭐⭐⭐⭐
Application Security Engineer ⭐⭐⭐⭐⭐
Data Integrity Specialist ⭐⭐⭐⭐⭐
Test Architect ⭐⭐⭐⭐
DevOps/Platform Engineer ⭐⭐⭐⭐
Technical Writer especializado ⭐⭐⭐⭐
