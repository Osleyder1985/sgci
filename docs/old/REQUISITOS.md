# Requisitos del SGCI - Sistema de Gestión Contextualmente Inteligente

**Versión:** 1.0
**Fecha:** 25 de agosto de 2026
**Estado:** Documento Base - Requisitos del Proyecto
**Ubicación:** `./REQUISITOS.md`

---

## Índice

1. [Introducción](#1-introducción)
2. [Requisitos Funcionales por Módulo](#2-requisitos-funcionales-por-módulo)
3. [Requisitos No Funcionales](#3-requisitos-no-funcionales)
4. [Matriz de Trazabilidad](#4-matriz-de-trazabilidad)
5. [Priorización de Requisitos](#5-priorización-de-requisitos)

---

## 1. Introducción

### 1.1. Propósito del Documento

Este documento recoge todos los **requisitos funcionales y no funcionales** del Sistema de Gestión Contextualmente Inteligente (SGCI), organizados por módulos y categorías. Sirve como:

- **Fuente de verdad** para el desarrollo del sistema
- **Base para las pruebas** de validación
- **Referencia para la documentación** técnica
- **Guía para la priorización** de funcionalidades

### 1.2. Convenciones de Identificación

| Prefijo | Significado |
| :--- | :--- |
| **RF-XXX** | Requisito Funcional |
| **RNF-XXX** | Requisito No Funcional |
| **P1, P2, P3** | Prioridad: Alta, Media, Baja |

---

## 2. Requisitos Funcionales por Módulo

### 2.1. Módulo de Autenticación y Usuarios

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-001 | El sistema debe permitir el registro de usuarios con email y contraseña | P1 | - |
| RF-002 | El sistema debe autenticar usuarios mediante JWT (Access + Refresh Token) | P1 | RF-001 |
| RF-003 | El sistema debe permitir el cierre de sesión | P1 | RF-002 |
| RF-004 | El sistema debe refrescar tokens automáticamente | P1 | RF-002 |
| RF-005 | El sistema debe soportar roles dinámicos (Admin, Operador, Conductor, Cliente, Contador, Agencia) | P1 | RF-002 |
| RF-006 | El sistema debe permitir la asignación de múltiples roles a un usuario | P1 | RF-005 |
| RF-007 | El sistema debe validar permisos granulares (CRUD por módulo) | P1 | RF-005 |
| RF-008 | El sistema debe limitar intentos de login a 5 por minuto | P1 | RF-002 |
| RF-009 | El sistema debe registrar el último acceso de cada usuario | P2 | RF-002 |
| RF-010 | El sistema debe permitir la recuperación de contraseña | P2 | RF-001 |

### 2.2. Módulo de Gestión de Personas y Clientes

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-011 | El sistema debe gestionar personas (naturales y jurídicas) | P1 | - |
| RF-012 | El sistema debe almacenar CI, nombre, teléfonos y email (encriptados) | P1 | RF-011 |
| RF-013 | El sistema debe gestionar clientes (destinatarios, remitentes o ambos) | P1 | RF-011 |
| RF-014 | El sistema debe gestionar direcciones con geolocalización | P1 | RF-011 |
| RF-015 | El sistema debe permitir búsqueda de clientes por nombre, CI o teléfono | P1 | RF-013 |
| RF-016 | El sistema debe validar la unicidad de CI y NIT | P1 | RF-011 |
| RF-017 | El sistema debe geocodificar direcciones automáticamente (LocationIQ + Nominatim) | P1 | RF-014 |

### 2.3. Módulo de Gestión de Agencias de Envíos

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-018 | El sistema debe gestionar agencias de envíos | P1 | - |
| RF-019 | El sistema debe almacenar nombre, NIT, teléfonos, email y dirección | P1 | RF-018 |
| RF-020 | El sistema debe permitir asociar contratos a agencias | P2 | RF-018 |
| RF-021 | El sistema debe soportar tarifas en CUP, USD y MXN por contrato | P2 | RF-020 |

### 2.4. Módulo de Gestión de Guías

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-022 | El sistema debe gestionar guías de envío (AWB) | P1 | RF-018 |
| RF-023 | El sistema debe asignar un código AWB único por guía | P1 | RF-022 |
| RF-024 | El sistema debe soportar los estados: creada, enviada, arribo, proceso_aduana, facturada, recibida, proceso_transportacion, proceso_entrega, parcialmente_entregada, entregada | P1 | RF-022 |
| RF-025 | El sistema debe registrar fechas de cada cambio de estado | P1 | RF-024 |
| RF-026 | El sistema debe permitir listar guías con paginación y filtros | P1 | RF-022 |
| RF-027 | El sistema debe permitir búsqueda de guías por AWB o consignatario | P1 | RF-022 |
| RF-028 | El sistema debe permitir importación de manifiestos desde Excel/CSV | P1 | RF-022, RF-013 |
| RF-029 | El sistema debe mostrar barra de progreso durante importación | P2 | RF-028 |
| RF-030 | El sistema debe detectar duplicados por código AWB | P1 | RF-028 |
| RF-031 | El sistema debe permitir exportación de guías a Excel/PDF | P2 | RF-022 |

### 2.5. Módulo de Gestión de Bultos

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-032 | El sistema debe gestionar bultos individuales (House) | P1 | RF-022 |
| RF-033 | El sistema debe asignar un código House único por bulto | P1 | RF-032 |
| RF-034 | El sistema debe asociar cada bulto a un destinatario y remitente | P1 | RF-032, RF-013 |
| RF-035 | El sistema debe registrar peso, naturaleza y cantidad | P1 | RF-032 |
| RF-036 | El sistema debe soportar los estados: creado, enviado, arribo, presencial, faltante_origen, facturado, recibido, proceso_transportacion, proceso_entrega, entregado, no_entregado | P1 | RF-032 |
| RF-037 | El sistema debe actualizar estado de guía según estados de sus bultos | P1 | RF-032, RF-024 |
| RF-038 | El sistema debe registrar importe real de aduana (Aerovaradero) | P1 | RF-032 |
| RF-039 | El sistema debe permitir actualización de ubicación de bulto (lat/lng) | P1 | RF-032 |
| RF-040 | El sistema debe permitir tracking público por código House | P1 | RF-032 |
| RF-041 | El sistema debe permitir actualización manual de estado con auditoría | P2 | RF-036 |

### 2.6. Módulo de Web Scraping (Aerovaradero)

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-042 | El sistema debe consultar automáticamente el estado de facturación en Aerovaradero | P1 | RF-022 |
| RF-043 | El sistema debe extraer fecha de facturación y monto | P1 | RF-042 |
| RF-044 | El sistema debe actualizar automáticamente el estado a "facturada" | P1 | RF-042 |
| RF-045 | El sistema debe manejar fallos de web scraping y programar reintentos | P1 | RF-042 |
| RF-046 | El sistema debe registrar logs de web scraping para auditoría | P2 | RF-045 |

### 2.7. Módulo de Gestión de Vehículos

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-047 | El sistema debe gestionar vehículos (placa, marca, modelo, capacidad) | P1 | - |
| RF-048 | El sistema debe registrar tipo de combustible y consumo estimado | P1 | RF-047 |
| RF-049 | El sistema debe permitir estados: activo, mantenimiento, inactivo | P1 | RF-047 |
| RF-050 | El sistema debe registrar depreciación diaria | P2 | RF-047 |
| RF-051 | El sistema debe mostrar disponibilidad de vehículos para viajes | P1 | RF-047 |

### 2.8. Módulo de Gestión de Trabajadores

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-052 | El sistema debe gestionar trabajadores (conductores, choferes, mecánicos, administrativos) | P1 | RF-011 |
| RF-053 | El sistema debe registrar licencia de conducir y categoría | P1 | RF-052 |
| RF-054 | El sistema debe gestionar estados: activo, inactivo | P1 | RF-052 |

### 2.9. Módulo de Optimización de Rutas (VRP/VRPTW)

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-055 | El sistema debe generar rutas optimizadas usando algoritmo VRP/VRPTW | P1 | RF-032, RF-047, RF-052 |
| RF-056 | El sistema debe implementar algoritmo híbrido (Clarke-Wright + 2-Opt + Tabu Search) | P1 | RF-055 |
| RF-057 | El sistema debe modelar ventanas de tiempo configurables por cliente | P1 | RF-055 |
| RF-058 | El sistema debe modelar consumo real de combustible por vehículo | P1 | RF-055 |
| RF-059 | El sistema debe calcular distancia total, tiempo estimado y costo de combustible | P1 | RF-055 |
| RF-060 | El sistema debe permitir gestión dinámica de rutas (añadir/eliminar puntos en rutas activas) | P1 | RF-055 |
| RF-061 | El sistema debe almacenar el orden optimizado de entregas (JSONB) | P1 | RF-055 |
| RF-062 | El sistema debe validar restricciones de capacidad de vehículos | P1 | RF-055 |
| RF-063 | El sistema debe mostrar rutas en mapa interactivo | P1 | RF-055 |
| RF-064 | El sistema debe registrar modificaciones de rutas con trazabilidad | P2 | RF-060 |

### 2.10. Módulo de Viajes

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-065 | El sistema debe gestionar viajes asignados a vehículos y conductores | P1 | RF-047, RF-052 |
| RF-066 | El sistema debe registrar fechas de salida y llegada | P1 | RF-065 |
| RF-067 | El sistema debe registrar kilómetros recorridos y combustible gastado | P1 | RF-065 |
| RF-068 | El sistema debe soportar estados: planificado, en_curso, completado, cancelado | P1 | RF-065 |
| RF-069 | El sistema debe asignar bultos a viajes (houseIds en JSONB) | P1 | RF-065, RF-032 |

### 2.11. Módulo de Seguimiento GPS

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-070 | El sistema debe recibir ubicaciones GPS de vehículos en tiempo real | P1 | RF-047 |
| RF-071 | El sistema debe almacenar ubicaciones históricas (particionadas por mes) | P1 | RF-070 |
| RF-072 | El sistema debe mostrar ubicación actual de vehículos en mapa | P1 | RF-070 |
| RF-073 | El sistema debe soportar geocercas y alertas de entrada/salida | P2 | RF-070 |

### 2.12. Módulo Offline-First (App Móvil)

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-074 | El sistema debe operar sin conexión a internet (Offline-First) | P1 | - |
| RF-075 | El sistema debe almacenar datos maestros localmente (agencias, clientes, tarifas) | P1 | RF-074 |
| RF-076 | El sistema debe almacenar ruta activa y bultos localmente | P1 | RF-074 |
| RF-077 | El sistema debe sincronizar datos al recuperar conexión | P1 | RF-074 |
| RF-078 | El sistema debe manejar conflictos de sincronización | P1 | RF-077 |
| RF-079 | El sistema debe tener política FIFO para retención de datos offline | P1 | RF-074 |
| RF-080 | El sistema debe sincronizar ubicaciones GPS en lote al recuperar conexión | P1 | RF-070, RF-074 |

### 2.13. Módulo de Notificaciones

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-081 | El sistema debe enviar notificaciones push a conductores | P1 | RF-074 |
| RF-082 | El sistema debe notificar nuevos bultos y cambios de estado | P1 | RF-081 |
| RF-083 | El sistema debe notificar conflictos offline | P2 | RF-081 |

### 2.14. Módulo de Costos y Finanzas

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-084 | El sistema debe generar ficha de costo según Resolución 148/2023 | P1 | RF-065 |
| RF-085 | El sistema debe calcular: Gasto Material, Salario Directo, Otros Gastos Directos, Gastos Indirectos, Utilidad | P1 | RF-084 |
| RF-086 | El sistema debe soportar múltiples monedas (CUP, USD, MXN) | P1 | RF-084 |
| RF-087 | El sistema debe gestionar tasas de cambio históricas | P1 | RF-084 |
| RF-088 | El sistema debe realizar análisis de sensibilidad de riesgo cambiario (10,000 escenarios) | P2 | RF-087 |
| RF-089 | El sistema debe gestionar ingresos y gastos por línea de negocio | P1 | RF-084 |
| RF-090 | El sistema debe generar estado de resultados | P2 | RF-089 |
| RF-091 | El sistema debe permitir seleccionar tipo de tasa de cambio en cada documento | P1 | RF-087 |

### 2.15. Módulo de Contratos

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-092 | El sistema debe gestionar contratos con agencias | P2 | RF-018 |
| RF-093 | El sistema debe registrar tarifas en CUP, USD y MXN | P2 | RF-092 |

### 2.16. Módulo de Inventario y Taller

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-094 | El sistema debe gestionar repuestos (stock, precios, ubicación) | P2 | - |
| RF-095 | El sistema debe controlar movimientos de inventario (entradas, salidas, ajustes) | P2 | RF-094 |
| RF-096 | El sistema debe gestionar órdenes de trabajo de taller | P2 | RF-047, RF-013 |
| RF-097 | El sistema debe gestionar ventas de repuestos | P2 | RF-094 |
| RF-098 | El sistema debe alertar stock mínimo | P3 | RF-094 |

### 2.17. Módulo de RSE y Gobernanza

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-099 | El sistema debe gestionar reservas voluntarias para RSE | P2 | - |
| RF-100 | El sistema debe gestionar proyectos de RSE | P2 | RF-099 |
| RF-101 | El sistema debe verificar actividades prohibidas (Decreto 107/2024) | P1 | - |
| RF-102 | El sistema debe generar informe de sostenibilidad | P2 | RF-100 |
| RF-103 | El sistema debe integrar trazabilidad de operaciones (auditoría) | P1 | - |

### 2.18. Módulo de Reportes

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-104 | El sistema debe generar dashboard de administrador con KPIs | P1 | - |
| RF-105 | El sistema debe generar reporte de eficiencia de rutas | P1 | RF-055 |
| RF-106 | El sistema debe generar reporte de ficha de costo en PDF/Excel/XML | P1 | RF-084 |
| RF-107 | El sistema debe generar reporte de sostenibilidad | P2 | RF-102 |
| RF-108 | El sistema debe generar reporte para ONAT (Resolución 8/2024) | P1 | RF-089 |
| RF-109 | El sistema debe generar ranking de conductores | P2 | RF-052 |

### 2.19. Módulo de Interoperabilidad

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-110 | El sistema debe proporcionar API abierta (OpenAPI 3.0) | P1 | - |
| RF-111 | El sistema debe permitir integración con Aduana y MITRANS | P2 | RF-110 |
| RF-112 | El sistema debe soportar webhooks para eventos del sistema | P2 | RF-110 |

### 2.20. Módulo de Analíticas y BI

| ID | Requisito | Prioridad | Dependencia |
| :--- | :--- | :--- | :--- |
| RF-113 | El sistema debe predecir demanda usando Prophet/XGBoost | P3 | - |
| RF-114 | El sistema debe predecir mantenimiento de vehículos | P3 | RF-047 |
| RF-115 | El sistema debe generar dashboards interactivos (Recharts/Chart.js) | P3 | - |

---

## 3. Requisitos No Funcionales

### 3.1. Rendimiento (RNF-001 a RNF-010)

| ID | Requisito | Métrica | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-001 | El sistema debe soportar al menos 100 usuarios concurrentes | 100 VUs | P1 |
| RNF-002 | El sistema debe manejar 500 peticiones por segundo | 500 RPS | P1 |
| RNF-003 | La latencia P95 debe ser menor a 2 segundos | P95 < 2s | P1 |
| RNF-004 | La latencia P99 debe ser menor a 4 segundos | P99 < 4s | P1 |
| RNF-005 | El tiempo de carga de la página principal debe ser < 3 segundos | < 3s | P1 |
| RNF-006 | El tiempo de generación de ruta debe ser < 10 segundos para 100 entregas | < 10s | P1 |
| RNF-007 | El tiempo de importación de manifiestos debe ser < 30 segundos para 1000 registros | < 30s | P2 |
| RNF-008 | El tiempo de sincronización offline debe ser < 30 segundos por 10 entregas | < 30s | P1 |
| RNF-009 | La base de datos debe responder en < 200ms para consultas simples | < 200ms | P1 |
| RNF-010 | El uso de CPU debe ser < 70% en condiciones normales | < 70% | P1 |

### 3.2. Seguridad (RNF-011 a RNF-020)

| ID | Requisito | Implementación | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-011 | Todos los datos sensibles deben estar encriptados | AES-256 a nivel de aplicación | P1 |
| RNF-012 | La base de datos debe tener encriptación en disco | TDE (LUKS/dm-crypt) | P1 |
| RNF-013 | Todas las comunicaciones deben usar TLS 1.3 | HTTPS con Let's Encrypt | P1 |
| RNF-014 | El sistema debe implementar JWT con refresh tokens | Access: 1h, Refresh: 7d | P1 |
| RNF-015 | El sistema debe implementar rate limiting | 100 req/min público, 500 req/min autenticado | P1 |
| RNF-016 | El sistema debe resistir ataques de inyección SQL | Validación de entrada | P1 |
| RNF-017 | El sistema debe resistir ataques XSS | Sanitización de salida | P1 |
| RNF-018 | El sistema debe proteger contra CSRF | Tokens CSRF | P1 |
| RNF-019 | El sistema debe registrar auditoría de todas las operaciones | Tabla audit_log | P1 |
| RNF-020 | El sistema debe escanear vulnerabilidades en dependencias | Snyk, npm audit | P2 |

### 3.3. Disponibilidad y Resiliencia (RNF-021 a RNF-030)

| ID | Requisito | Métrica | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-021 | El sistema debe tener disponibilidad del 99.5% | 99.5% uptime | P1 |
| RNF-022 | El sistema debe tener RTO de 4 horas | < 4h | P1 |
| RNF-023 | El sistema debe tener RPO de 15 minutos | < 15min | P1 |
| RNF-024 | El sistema debe implementar Circuit Breaker para servicios externos | OSRM, Traccar, Appwrite | P1 |
| RNF-025 | El sistema debe tener fallback cuando OSRM falla | Estimación Haversine | P1 |
| RNF-026 | El sistema debe tener fallback cuando Traccar falla | Última ubicación conocida | P2 |
| RNF-027 | El sistema debe implementar backoff exponencial para reintentos | Base 1s, Max 60s | P1 |
| RNF-028 | El sistema debe hacer backup diario de la base de datos | pg_dump + WAL | P1 |
| RNF-029 | El sistema debe tener estrategia de rollback de migraciones | Scripts de reversión | P1 |
| RNF-030 | El sistema debe implementar health checks | /api/health | P1 |

### 3.4. Escalabilidad (RNF-031 a RNF-035)

| ID | Requisito | Implementación | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-031 | La base de datos debe tener particionamiento para tablas grandes | vehiculo_ubicaciones, auditoria | P1 |
| RNF-032 | El sistema debe implementar caché con Redis | Datos maestros, sesiones | P1 |
| RNF-033 | El sistema debe soportar horizontal scaling | Docker + Kubernetes | P2 |
| RNF-034 | El sistema debe optimizar consultas con índices | Índices B-tree, GIN, parciales | P1 |
| RNF-035 | El sistema debe tener estrategia de caché en frontend | React Query | P1 |

### 3.5. Usabilidad y Experiencia de Usuario (RNF-036 a RNF-040)

| ID | Requisito | Implementación | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-036 | La interfaz debe ser accesible | WCAG 2.1 | P2 |
| RNF-037 | La interfaz debe ser responsiva | Mobile-first | P1 |
| RNF-038 | La app móvil debe soportar Android e iOS | React Native | P1 |
| RNF-039 | El sistema debe tener feedback visual para acciones offline | Badges de sincronización | P1 |
| RNF-040 | El sistema debe tener indicadores de conectividad | Banner de estado | P1 |

### 3.6. Mantenibilidad (RNF-041 a RNF-045)

| ID | Requisito | Implementación | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-041 | El código debe tener cobertura de pruebas > 80% | Jest, React Testing Library | P1 |
| RNF-042 | El código debe tener complejidad ciclomática < 10 por función | ESLint, SonarQube | P1 |
| RNF-043 | El código debe tener duplicación < 3% | SonarQube | P1 |
| RNF-044 | El sistema debe tener documentación de API (OpenAPI 3.0) | openapi.yaml | P1 |
| RNF-045 | El sistema debe seguir guía de estilo de código | STYLE_GUIDE.md | P1 |

### 3.7. Gestión de Deuda Técnica (RNF-046 a RNF-050)

| ID | Requisito | Implementación | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-046 | El sistema debe tener un Technical Debt Backlog | Backlog centralizado | P1 |
| RNF-047 | El 20% de cada sprint debe dedicarse a refactorización | Política del 20% | P1 |
| RNF-048 | El sistema debe monitorear métricas de deuda técnica | Dashboard | P2 |
| RNF-049 | El sistema debe aplicar la regla del Boy Scout | "Deja el código mejor" | P1 |
| RNF-050 | El sistema debe tener revisión de código obligatoria | PR reviews | P1 |

---

## 4. Matriz de Trazabilidad

### 4.1. Requisitos Funcionales por Módulo y Fase

| Fase | Módulo | IDs de Requisitos | Cantidad |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Autenticación y Usuarios | RF-001 al RF-010 | 10 |
| **Fase 2** | Personas y Clientes, Agencias, Guías, Bultos, Web Scraping | RF-011 al RF-046 | 36 |
| **Fase 3** | Vehículos, Trabajadores, Optimización de Rutas, Viajes | RF-047 al RF-069 | 23 |
| **Fase 4** | GPS, Offline-First, Notificaciones | RF-070 al RF-083 | 14 |
| **Fase 5** | Costos, Contratos, Inventario, RSE, Reportes | RF-084 al RF-109 | 26 |
| **Fase 6** | Interoperabilidad | RF-110 al RF-112 | 3 |
| **Fase 7** | Analíticas y BI | RF-113 al RF-115 | 3 |

### 4.2. Requisitos No Funcionales por Categoría

| Categoría | IDs de Requisitos | Cantidad |
| :--- | :--- | :--- |
| Rendimiento | RNF-001 al RNF-010 | 10 |
| Seguridad | RNF-011 al RNF-020 | 10 |
| Disponibilidad y Resiliencia | RNF-021 al RNF-030 | 10 |
| Escalabilidad | RNF-031 al RNF-035 | 5 |
| Usabilidad | RNF-036 al RNF-040 | 5 |
| Mantenibilidad | RNF-041 al RNF-045 | 5 |
| Gestión de Deuda Técnica | RNF-046 al RNF-050 | 5 |

---

## 5. Priorización de Requisitos

### 5.1. Resumen por Prioridad

| Prioridad | Funcionales | No Funcionales | Total |
| :--- | :--- | :--- | :--- |
| **P1 - Alta** | 80 | 35 | **115** |
| **P2 - Media** | 25 | 8 | **33** |
| **P3 - Baja** | 10 | 7 | **17** |
| **TOTAL** | **115** | **50** | **165** |

### 5.2. Requisitos Críticos (P1) por Módulo

| Módulo | ID | Descripción |
| :--- | :--- | :--- |
| Autenticación | RF-001, RF-002, RF-005, RF-007, RF-008 | Autenticación, roles, permisos, rate limiting |
| Guías | RF-022, RF-024, RF-028, RF-030 | Gestión de guías, importación, duplicados |
| Bultos | RF-032, RF-033, RF-034, RF-036, RF-040 | Gestión de bultos, tracking, estados |
| Vehículos | RF-047, RF-048, RF-049 | Gestión de vehículos |
| Trabajadores | RF-052, RF-053 | Gestión de trabajadores |
| Rutas | RF-055, RF-056, RF-057, RF-058, RF-059, RF-060, RF-061, RF-062 | Optimización de rutas (core) |
| Viajes | RF-065, RF-066, RF-067, RF-068, RF-069 | Gestión de viajes |
| GPS | RF-070, RF-071, RF-072 | Seguimiento GPS |
| Offline | RF-074, RF-075, RF-076, RF-077, RF-078, RF-079, RF-080 | Offline-First |
| Costos | RF-084, RF-085, RF-086, RF-087, RF-089, RF-091 | Ficha de costo, tasas de cambio |
| RSE | RF-101, RF-103 | Verificación actividades prohibidas, auditoría |
| Reportes | RF-104, RF-105, RF-106, RF-108 | Dashboard, reportes |
| Interoperabilidad | RF-110 | API abierta |

---

## Ubicación del Documento en la Estructura

```
.
├── README.md
├── GLOSSARY.md
├── STYLE_GUIDE.md
├── REQUISITOS.md                    ← NUEVO DOCUMENTO
├── Capitulo 1 - Introduccion.txt
├── Capitulo 2 - Marco Teórico.txt
├── Capitulo 3 - Marco Legal.txt
├── Capitulo 4 - Diseño del Sistema.txt
├── Capitulo 5 - Modelo de Datos.txt
├── Capitulo 6 - Metodología de Validación.txt
├── Capitulo 7 - Plan de Implementación.txt
├── Capitulo 8 - Plan de Comercialización.txt
├── Conclusiones y Trabajo Futuro.txt
├── api/
│   ├── RATE_LIMITING.md
│   ├── CIRCUIT_BREAKER.md
│   └── OPENAPI.yaml
├── commercial/
│   ├── CUSTOMER_RETENTION.md
│   ├── COMMERCIAL_METRICS.md
│   └── DYNAMIC_PRICING.md
├── database/
│   ├── ZERO_DOWNTIME.md
│   ├── PARTITIONING.md
│   └── ROLLBACK.md
├── diagrams/
│   └── DIAGRAMAS_SECUENCIA.md
├── frontend/
│   └── CACHE_STRATEGY.md
├── mobile/
│   ├── OFFLINE_PATTERNS.md
│   ├── SYNC_STRATEGY.md
│   ├── OFFLINE_DATA.md
│   └── IOS_ANDROID.md
├── quality/
│   └── TECHNICAL_DEBT.md
├── security/
│   └── ENCRYPTION.md
└── testing/
    ├── FIELD_TESTS.md
    ├── OFFLINE_TESTS.md
    ├── PERFORMANCE_TESTS.md
    └── SECURITY_TESTS.md
```

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 1.0
**Estado:** Activo - Documento Base de Requisitos del SGCI
**Ubicación:** `./REQUISITOS.md`

---

## Resumen del Documento

| Aspecto | Detalle |
| :--- | :--- |
| **Total de Requisitos Funcionales** | 115 |
| **Total de Requisitos No Funcionales** | 50 |
| **Total General** | 165 |
| **Módulos Cubiertos** | 20 |
| **Categorías No Funcionales** | 7 |
| **Prioridad P1 (Alta)** | 115 |
| **Prioridad P2 (Media)** | 33 |
| **Prioridad P3 (Baja)** | 17 |