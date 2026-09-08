# Capítulo 4: Diseño del Sistema (VERSIÓN FINAL CON REFERENCIAS ACTUALIZADAS - 25/08/2026)

---

## 4.1. Visión General de la Arquitectura del Sistema

El Sistema de Gestión Contextualmente Inteligente (SGCI) se concibe como una plataforma integral que integrará la optimización de rutas, la gestión de costos, la gestión de inventarios, la arquitectura Offline-First, la Responsabilidad Social Empresarial (RSE) y la Gobernanza Corporativa en un solo ecosistema tecnológico.

**Estado del Proyecto (25/08/2026):** El SGCI se encuentra en **Fase 0 (Planificación y Diseño Inicial)**. No existe implementación previa. Todas las funcionalidades descritas en este capítulo corresponden a **diseños propuestos** que serán implementados durante el desarrollo del proyecto (Fases 1-6), siguiendo una **estrategia incremental** (ver Sección 4.1.2). Los estados indicados reflejan el nivel de avance del diseño y planificación, no la implementación.

### 4.1.1. Principios de Diseño

El diseño del SGCI se fundamenta en los siguientes principios:

| Principio | Descripción | Justificación |
| :--- | :--- | :--- |
| **Offline-First** | La aplicación móvil debe funcionar sin conexión a internet, almacenando datos localmente y sincronizando cuando haya conectividad. | Las rutas interprovinciales de Cuba tienen conectividad intermitente (ETECSA, 2025). El conductor debe poder operar sin depender de internet (Kumar & Mukherjee, 2023). |
| **Modularidad** | El sistema se divide en módulos independientes (rutas, costos, inventarios, RSE, etc.) que pueden desarrollarse y actualizarse de forma separada. | Permite un desarrollo ágil, facilita el mantenimiento y permite la escalabilidad del sistema (O'Brien & Marakas, 2018). |
| **Escalabilidad** | La arquitectura debe permitir el crecimiento de la flota (de 5 a 20+ vehículos) y el volumen de entregas (hasta 100+ por ruta) sin necesidad de reescribir el código. | La MiPyme tiene previsto crecer en el futuro. El sistema debe adaptarse sin costos adicionales de desarrollo (Crainic & Laporte, 2016). |
| **Seguridad y Trazabilidad** | Todos los datos deben estar protegidos (autenticación, encriptación) y cada operación debe ser trazable (registro de auditoría). | Es un requisito legal (Decreto Ley 88/2024, Resolución 8/2024) y una necesidad de gobernanza (Contraloría General de la República, 2025). |
| **Flexibilidad Normativa** | El sistema debe permitir la configuración de parámetros (tasas de cambio, precios de combustible, coeficientes de gastos indirectos) para adaptarse a cambios normativos y operativos. | La normativa cubana (Resolución 148/2023) y el mercado (tasas de cambio) son dinámicos. El sistema debe ser configurable (Romney & Steinbart, 2021). |
| **Flexibilidad de Roles** | Los roles y permisos son configurables dinámicamente desde la base de datos, sin necesidad de modificar el código. | La MiPyme puede crecer y necesitar nuevos perfiles (ej. supervisor de flota, contador, jefe de taller). El sistema debe adaptarse sin costos de desarrollo adicionales (O'Brien & Marakas, 2018). |
| **Testabilidad** | El sistema debe estar diseñado para ser probado de forma integral (pruebas unitarias, integración, rendimiento, seguridad e interoperabilidad). | El plan de pruebas del Capítulo 7 requiere que el sistema sea testeable desde el diseño (Schwaber & Sutherland, 2020). |
| **Implementación Incremental (YAGNI)** | No se implementa nada que no se vaya a utilizar inmediatamente. Las tablas se crean solo cuando la funcionalidad correspondiente se desarrolla. | Evita código y tablas "huérfanas", reduce deuda técnica y facilita el mantenimiento (Beck et al., 2001). |
| **Accesibilidad (a11y)** | El sistema debe ser accesible para todos los usuarios, siguiendo las pautas WCAG 2.1. | Garantiza la inclusión y el cumplimiento de estándares internacionales. |
| **Performance First** | El sistema debe priorizar el rendimiento en entornos de baja conectividad. | Optimización de carga, lazy loading y caché inteligente para el contexto cubano. |
| **Data-Driven** | El sistema debe capturar y analizar datos para la toma de decisiones basada en evidencia. | La analítica y BI son fundamentales para la mejora continua (O'Brien & Marakas, 2018). |
| **Documentación Primero** | La documentación técnica es parte integral del desarrollo, no un añadido posterior. | Facilita la incorporación de nuevos desarrolladores y asegura la consistencia (Fowler, 2018). |
| **Visualización UML** | El diseño debe representarse visualmente mediante diagramas UML para facilitar la comprensión. | Los diagramas UML son el lenguaje estándar para la comunicación de diseño de software (UML, 2026). |

### 4.1.2. Estrategia de Implementación Incremental (YAGNI)

El SGCI se desarrollará siguiendo un enfoque **incremental y por funcionalidades completas**. Esto significa que:

1. **No se implementa nada que no se vaya a utilizar inmediatamente.**
2. **No se crean tablas en la base de datos hasta que el código que las necesita está listo.**
3. **Cada iteración entrega una funcionalidad completa y operativa.**

**Principio YAGNI (You Aren't Gonna Need It):** Este principio establece que no se debe añadir funcionalidad hasta que sea necesaria. En el contexto del SGCI, esto significa que no se crearán tablas, endpoints o componentes de interfaz de usuario hasta que la funcionalidad que los requiere esté siendo implementada en esa iteración específica.

**Tabla 4.0: Matriz de Trazabilidad - Tablas por Fase de Implementación (51 tablas)**

| Fase | Período | Funcionalidad | Tablas a Crear |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Meses 3-5 | Autenticación, roles, permisos, auditoría | `usuarios`, `roles`, `permisos`, `roles_permisos`, `auditoria` |
| **Fase 2** | Meses 6-8 | Gestión de guías, bultos, clientes, agencias, importación de manifiestos, geocodificación, web scraping | `personas`, `clientes`, `direcciones`, `agencias_envios`, `guias`, `bultos`, `web_scraping_pendiente`, `web_scraping_log` |
| **Fase 3** | Meses 9-11 | Gestión de vehículos, conductores, optimización de rutas (VRP/VRPTW) | `vehiculos`, `trabajadores`, `viajes`, `rutas`, `rutas_modificaciones` |
| **Fase 4** | Meses 12-14 | Seguimiento GPS (Traccar 6.14), app móvil offline-first, notificaciones | `vehiculo_ubicaciones`, `geocercas`, `sincronizacion_pendiente`, `conflictos_offline`, `notificaciones` |
| **Fase 5** | Meses 15-16 | Costos, fichas de costo, tasas de cambio, RSE, roles dinámicos, inventarios, taller, **reportes y análisis** | `fichas_costo`, `fichas_costo_partidas`, `ingresos`, `gastos`, `tasas_cambio`, `proveedores`, `contratos`, `reservas_voluntarias`, `proyectos_rse`, `actividades_prohibidas`, `repuestos`, `movimientos_inventario`, `ordenes_trabajo`, `ventas_repuestos`, **`reportes`**, **`reportes_ejecutados`**, **`alertas`**, **`alertas_historial`**, **`kpis_historicos`** |
| **Fase 6** | Meses 17-18 | Interoperabilidad (API abierta), integración con sistemas externos (Aduana, MITRANS, agencias), validación empírica | `integraciones`, `logs_api`, `webhooks` |
| **Fase 7** | Meses 19-24 | **Analytics y Business Intelligence** (Futura expansión) | `fact_deliveries`, `fact_revenue`, `fact_routes`, `fact_maintenance`, `dim_date`, `dim_vehicle`, `dim_line`, `ml_models`, `ml_predictions`, `ml_metrics` |

### 4.1.3. Diagrama de Arquitectura de Alto Nivel (Diseño Propuesto)

El SGCI se estructurará en una arquitectura de tres capas (Frontend, Backend, Base de Datos) con servicios externos integrados.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ARQUITECTURA DEL SGCI (DISEÑO PROPUESTO)                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              FRONTEND (Aplicaciones Cliente)                                  │ │
│  │  ┌─────────────────────────────────┐  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  APLICACIÓN WEB (Next.js)       │  │  APLICACIÓN MÓVIL (React Native)                    │ │ │
│  │  │  - Dashboard Director/Jefe Ops  │  │  - App Conductor (Offline-First)                    │ │ │
│  │  │  - Portal Agencia de Paquetería │  │  - App Cliente (Remitente/Destinatario)             │ │ │
│  │  │  - Seguimiento de Paquetes      │  │  - Seguimiento GPS (Traccar Client)                 │ │ │
│  │  │  - Gestión de Agencias          │  │  - Notificaciones Push (Appwrite)                   │ │ │
│  │  │  - Gestión de Guías             │  │                                                     │ │ │
│  │  │  - Gestión de Clientes          │  │                                                     │ │ │
│  │  │  - Importación de Manifiestos   │  │                                                     │ │ │
│  │  │  - Módulo de RSE y Gobernanza   │  │                                                     │ │ │
│  │  │  - Mapa de Bultos               │  │                                                     │ │ │
│  │  │  - Edición de Ubicación         │  │                                                     │ │ │
│  │  │  - Generación de Rutas          │  │                                                     │ │ │
│  │  │  - Tracking de Envíos           │  │                                                     │ │ │
│  │  │  - Web Scraping (Aerovaradero)  │  │                                                     │ │ │
│  │  │  - **Módulo de Reportes**       │  │                                                     │ │ │
│  │  │  - **Módulo de Analytics y BI** │  │                                                     │ │ │
│  │  └─────────────────────────────────┘  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                         │                 │
│                                        │              API REST + WebSockets      │                 │
│                                        ▼                                         ▼                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              BACKEND (Next.js API Routes)                                     │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  MÓDULOS DE NEGOCIO (API Routes - Planificados)                                          │ │ │
│  │  │  • Gestión de Agencias (CRUD completo)                                                   │ │ │
│  │  │  • Gestión de Clientes (CRUD con búsqueda y filtros)                                     │ │ │
│  │  │  • Gestión de Guías (importación de manifiestos, listado, detalle, edición, eliminación) │ │ │
│  │  │  • Gestión de Bultos (CRUD con edición de ubicación y estado)                            │ │ │
│  │  │  • Optimización de Rutas (VRP/VRPTW + Algoritmos Híbridos)                               │ │ │
│  │  │  • Gestión de Personas, Trabajadores y Vehículos                                         │ │ │
│  │  │  • Gestión de Costos (Ficha de Costo + Contabilidad)                                     │ │ │
│  │  │  • Geocodificación (LocationIQ + Nominatim)                                              │ │ │
│  │  │  • Web Scraping (Aerovaradero - verificación de facturas)                                │ │ │
│  │  │  • Autenticación y Autorización (JWT + Roles Dinámicos)                                  │ │ │
│  │  │  • RSE y Gobernanza (Proyectos, Reservas, Informes)                                      │ │ │
│  │  │  • Interoperabilidad (API abierta, integraciones)                                        │ │ │
│  │  │  • **Reportes y Análisis (Dashboard, KPIs, Informes)**                                   │ │ │
│  │  │  • **Analytics y BI (Predicción de demanda, Mantenimiento predictivo)**                   │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  SERVICIOS DE COMUNICACIÓN (Planificados)                                                │ │ │
│  │  │  • Socket.io (Tiempo Real – Dashboard GPS)                                               │ │ │
│  │  │  • Appwrite Messaging 15.0.0 (Notificaciones Push)                                       │ │ │
│  │  │  • Cola de Sincronización (Offline-First)                                                │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                                           │
│                                        ▼                                                           │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              BASE DE DATOS (PostgreSQL 16.15 + PostGIS 3.5.0)                 │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  TABLAS PRINCIPALES (51 tablas - Blueprint - Implementación Incremental)                 │ │ │
│  │  │  • Fase 1: usuarios, roles, permisos, roles_permisos, auditoria                          │ │ │
│  │  │  • Fase 2: personas, clientes, direcciones, agencias_envios, guias, bultos,              │ │ │
│  │  │             web_scraping_pendiente, web_scraping_log                                     │ │ │
│  │  │  • Fase 3: trabajadores, vehiculos, viajes, rutas, rutas_modificaciones                  │ │ │
│  │  │  • Fase 4: vehiculo_ubicaciones, geocercas, sincronizacion_pendiente, conflictos_offline,│ │ │
│  │  │             notificaciones                                                               │ │ │
│  │  │  • Fase 5: fichas_costo, fichas_costo_partidas, ingresos, gastos, tasas_cambio,          │ │ │
│  │  │             proveedores, contratos, reservas_voluntarias, proyectos_rse,                 │ │ │
│  │  │             actividades_prohibidas, repuestos, movimientos_inventario,                   │ │ │
│  │  │             ordenes_trabajo, ventas_repuestos, **reportes, reportes_ejecutados,**        │ │ │
│  │  │             **alertas, alertas_historial, kpis_historicos**                              │ │ │
│  │  │  • Fase 6: integraciones, logs_api, webhooks                                             │ │ │
│  │  │  • **Fase 7: fact_deliveries, fact_revenue, fact_routes, fact_maintenance,               │ │ │
│  │  │             dim_date, dim_vehicle, dim_line, ml_models, ml_predictions, ml_metrics**     │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  EXTENSIONES                                                                             │ │ │
│  │  │  • PostGIS 3.5.0 (Consultas Geoespaciales)                                               │ │ │
│  │  │  • JSONB (Datos Semiestructurados)                                                       │ │ │
│  │  │  • **TimescaleDB (Series temporales para Data Warehouse)**                               │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              SERVICIOS EXTERNOS (Planificados)                                │ │
│  │  ┌─────────────────────────────┐   ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  TRACCAR 6.14 (GPS)         │   │  OPENSTREETMAP + MAPLIBRE GL 6.4.1 (Mapas)             │ │ │
│  │  └─────────────────────────────┘   └────────────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐   ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  OSRM v5.25.0 (Rutas)       │   │  APPWRITE MESSAGING 15.0.0 (Notificaciones)            │ │ │
│  │  └─────────────────────────────┘   └────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────┐  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  LOCATIONIQ (Geocodificación)│  │  NOMINATIM (Geocodificación fallback)                  │ │ │
│  │  └──────────────────────────────┘  └────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────┐  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  **MLflow (Gestión de ML)**   │  │  **Superset (BI Dashboards)**                         │ │ │
│  │  └──────────────────────────────┘  └────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Leyenda de Estado (para la implementación):**
- ⏳ **Pendiente de implementación**
- 🚀 **En desarrollo** (cuando se alcance la fase correspondiente)
- ✅ **Implementado** (cuando se complete la fase correspondiente)

### 4.1.4. Entorno Docker Propuesto (Diseño)

Como parte del diseño, se propone un entorno Docker con los siguientes servicios, que serán implementados durante el desarrollo:

#### 4.1.4.1. Servicios Docker Propuestos

| Servicio | Imagen | Uso | Puerto | Estado |
|----------|--------|-----|--------|--------|
| **PostgreSQL + PostGIS** | `postgis/postgis:16-3.5` | Base de datos principal con PostGIS 3.5.0 | 5432 | ⏳ Pendiente |
| **TimescaleDB** | `timescale/timescaledb:2.16-pg16` | Data Warehouse para series temporales | 5433 | ⏳ Pendiente |
| **Redis** | `redis:7.4-alpine` | Caché y colas de sincronización | 6379 | ⏳ Pendiente |
| **OSRM** | `osrm/osrm-backend:v5.25.0` | Motor de rutas | 5000 | ⏳ Pendiente |
| **Nginx** | `nginx:1.27-alpine` | Proxy inverso | 8081 | ⏳ Pendiente |
| **PgBouncer** | `edoburu/pgbouncer:1.21.0` | Pool de conexiones | 6432 | ⏳ Pendiente |
| **Appwrite** | `appwrite/appwrite:15.0.0` | Notificaciones push | 8082 | ⏳ Pendiente |
| **Traccar** | `traccar/traccar:6.14` | Seguimiento GPS | 8083 | ⏳ Pendiente |
| **Adminer** | `adminer:4.8.1` | Gestión BD (desarrollo) | 8084 | ⏳ Pendiente |
| **MLflow** | `mlflow/mlflow:latest` | Gestión de modelos ML | 5001 | ⏳ Pendiente |
| **Superset** | `apache/superset:latest` | Dashboards de BI | 8088 | ⏳ Pendiente |

#### 4.1.4.2. Volúmenes Persistentes Propuestos

| Volumen | Propósito | Estado |
| :--- | :--- | :--- |
| `postgres_data` | Datos de la base de datos PostgreSQL 16.15 + PostGIS 3.5.0 | ⏳ Pendiente |
| `timescaledb_data` | Datos de TimescaleDB para Data Warehouse | ⏳ Pendiente |
| `osrm_data` | Datos de Cuba para OSRM v5.25.0 | ⏳ Pendiente |
| `appwrite_data` | Datos de Appwrite 15.0.0 | ⏳ Pendiente |
| `traccar_data` | Datos de Traccar 6.14 | ⏳ Pendiente |
| `redis_data` | Datos de Redis | ⏳ Pendiente |
| `mlflow_data` | Datos de MLflow | ⏳ Pendiente |
| `superset_data` | Datos de Superset | ⏳ Pendiente |

---

## 4.2. Módulos Funcionales del SGCI (Diseño Propuesto)

### 4.2.1. Módulo de Gestión de Agencias

**Objetivo:** Gestionar las agencias de envíos asociadas a la operación.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Listar agencias | GET | `/api/agencias` | Lista todas las agencias con sus direcciones |
| Crear agencia | POST | `/api/agencias` | Crea una nueva agencia con dirección asociada |
| Ver agencia | GET | `/api/agencias/[id]` | Obtiene una agencia por ID con conteo de guías y contratos |
| Editar agencia | PUT | `/api/agencias/[id]` | Actualiza los datos de una agencia |
| Eliminar agencia | DELETE | `/api/agencias/[id]` | Elimina una agencia (valida guías y contratos asociados) |

**Frontend Propuesto:**
- Listado con botón "Nueva Agencia" (`/agencias`)
- Página de creación (`/agencias/nuevo`)
- Página de edición (`/agencias/[id]`)

**Validaciones Propuestas:**
- No se puede eliminar una agencia con guías asociadas
- No se puede eliminar una agencia con contratos asociados

---

### 4.2.2. Módulo de Gestión de Clientes

**Objetivo:** Gestionar de forma integral los clientes (destinatarios y remitentes) de la MiPyme.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Listar clientes | GET | `/api/clientes` | Lista clientes con paginación, búsqueda y filtros |
| Crear cliente | POST | `/api/clientes` | Crea un nuevo cliente con persona y dirección |
| Ver cliente | GET | `/api/clientes/[id]` | Obtiene un cliente por ID |
| Editar cliente | PUT | `/api/clientes/[id]` | Actualiza un cliente existente |
| Eliminar cliente | DELETE | `/api/clientes/[id]` | Elimina un cliente (valida bultos asociados) |

**Frontend Propuesto:**
- Búsqueda por nombre con debounce (500ms)
- Filtro por tipo: Todos, Destinatario, Remitente, Ambos
- Paginación: 50 clientes por página
- Creación y edición en una sola página (`/clientes/[id]`)

---

### 4.2.3. Módulo de Gestión de Guías

**Objetivo:** Gestionar las guías de envío y su seguimiento en tiempo real.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Listar guías | GET | `/api/guias` | Lista guías con paginación, filtros y búsqueda |
| Crear guía | POST | `/api/guias` | Crea una nueva guía individual |
| Ver detalle de guía | GET | `/api/guias/[id]` | Obtiene una guía con todos sus bultos |
| Editar guía | PUT | `/api/guias/[id]` | Actualiza el estado y consignatario de la guía |
| Actualizar estado | PUT | `/api/guias/[id]/estado` | Cambia el estado de la guía y sus bultos |
| Eliminar guía | DELETE | `/api/guias/[id]` | Elimina una guía y sus bultos asociados |

**Frontend Propuesto:**
- Listado con filtros por estado y agencia (`/guias`)
- Detalle con mapa de bultos (`/guias/[id]`)
- Paginación: 20 guías por página

**Estados de Guía Propuestos:**
- `creada`: Carga creada en el sistema
- `enviada`: Carga en tránsito a Cuba
- `arribo`: Carga ha llegado a Cuba
- `proceso_aduana`: Carga en proceso aduanero
- `facturada`: Carga facturada en Aerovaradero
- `recibida`: Carga recibida por el transportista
- `en_proceso_salida`: Carga en proceso de salida
- `proceso_transportacion`: Carga en transporte hacia destino
- `proceso_entrega`: Carga en proceso de entrega final
- `parcialmente_entregada`: Carga parcialmente entregada
- `entregada`: Carga entregada al destinatario

---

### 4.2.4. Módulo de Importación de Manifiestos

**Objetivo:** Importar manifiestos desde archivos Excel o CSV de forma rápida y eficiente.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Importar manifiesto | POST | `/api/guias/importar` | Importa archivo Excel/CSV con barra de progreso |
| Ver estado de importación | GET | `/api/guias/importar/estado` | Consulta el progreso de una importación |

**Características Propuestas:**
- Soporte para Excel (`.xlsx`, `.xls`) y CSV
- Detección automática de agencia desde el manifiesto
- Creación de guía y bultos en una sola operación
- Detección de duplicados por `codigoAwb`
- Cache de clientes para evitar consultas repetidas
- Uso de `createMany` para bultos (optimización)
- **Barra de progreso en tiempo real** con porcentaje
- Geocodificación automática de direcciones
- Asignación automática de `paisOrigen` y `ubicacionActual`

---

### 4.2.5. Módulo de Gestión de Bultos

**Objetivo:** Gestionar los bultos individuales de cada guía.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Listar bultos | GET | `/api/bultos` | Lista bultos con paginación, filtros y búsqueda |
| Ver bulto | GET | `/api/bultos/[id]` | Obtiene un bulto por ID |
| Editar bulto | PUT | `/api/bultos/[id]` | Actualiza estado, ubicación y observaciones |
| Actualizar estado | PUT | `/api/bultos/[id]/estado` | Cambia el estado del bulto con fecha |
| Actualizar ubicación | PUT | `/api/bultos/[id]/ubicacion` | Actualiza coordenadas del bulto |
| Eliminar bulto | DELETE | `/api/bultos/[id]` | Elimina un bulto |

**Frontend Propuesto:**
- Listado con filtros por estado y búsqueda (`/bultos`)
- Edición de ubicación con mapa interactivo (`/bultos/[id]/ubicacion`)
- Edición de estado y datos básicos (`/bultos/[id]/editar`)
- Paginación: 20 bultos por página

**Estados de Bulto Propuestos:**
- `creado`: Bulto creado en el sistema
- `enviado`: Bulto en tránsito a Cuba
- `arribo`: Bulto ha llegado a Cuba
- `presencial`: Bulto en presencial (Aerovaradero)
- `faltante_origen`: Bulto faltante en origen
- `facturado`: Bulto facturado en Aerovaradero
- `recibido`: Bulto recibido por el transportista
- `proceso_transportacion`: Bulto en transporte hacia destino
- `proceso_entrega`: Bulto en proceso de entrega final
- `entregado`: Bulto entregado al destinatario
- `no_entregado`: Bulto no pudo ser entregado

---

### 4.2.6. Módulo de Optimización de Rutas (VRP/VRPTW)

**Objetivo:** Generar rutas óptimas para la flota de Seta Expreso, minimizando el consumo de combustible y el tiempo de viaje.

**Estado:** ⏳ **Pendiente de implementación** (Fase 3)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Generar ruta optimizada | POST | `/api/rutas/generar` | Genera ruta usando algoritmo VRP/VRPTW |
| Test del algoritmo | GET | `/api/rutas/test-optimizer` | Prueba del algoritmo de optimización |
| Test de OSRM | GET | `/api/rutas/test-osrm` | Verifica disponibilidad de OSRM |

**Algoritmo Híbrido de Optimización Propuesto:**

El sistema implementará un enfoque híbrido que combina tres algoritmos:

1. **Clarke-Wright Savings** (construcción): Genera una ruta inicial rápida.
2. **2-Opt** (mejora): Refina la solución eliminando cruces en la ruta.
3. **Tabu Search** (exploración global): Explora soluciones alternativas y evita mínimos locales.

**Resultados Esperados (Basados en Literatura):**

| Métrica | Resultado Esperado | Fuente |
| :--- | :--- | :--- |
| **Tiempo de Cómputo** | < 10 segundos para 100 entregas | Toth & Vigo, 2014 |
| **Desviación del Óptimo** | < 3% | Cordeau et al., 2024 |
| **Ahorro de Combustible** | 15-20% | Figliozzi, 2012 |

**Modelado del Consumo de Combustible Propuesto:**

| Vehículo | Cantidad | Combustible | Consumo (L/km) | Capacidad de Carga (toneladas) |
| :--- | :--- | :--- | :--- | :--- |
| **Gazelle** | 3 | Diesel | 0.10 | 2 |
| **Howo** | 1 | Diesel | 0.17 | 5 |
| **Changai** | 1 | Gasolina | 0.10 | 2 |

---

### 4.2.7. Módulo de Geocodificación

**Objetivo:** Convertir direcciones de texto en coordenadas (latitud, longitud) para visualización en mapas.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Servicios de Geocodificación Propuestos:**

| Servicio | Uso | Límite | Estado |
| :--- | :--- | :--- | :--- |
| **LocationIQ** | Primario | 5,000 solicitudes/día | ⏳ Pendiente |
| **Nominatim** | Fallback | Sin límite (con delay) | ⏳ Pendiente |

---

### 4.2.8. Módulo de Web Scraping (Aerovaradero)

**Objetivo:** Verificar automáticamente el estado de facturación de los bultos en Aerovaradero.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Características Propuestas:**
- Web scraping de `https://www.aerovaradero.com.cu/payment/`
- Detección de "Carga FACTURADA" en HTML
- Extracción de fecha de facturación y monto
- Actualización automática de `importeAduana` y `monedaAduana`
- Progreso en tiempo real con barra de porcentaje

---

### 4.2.9. Módulo de Tracking de Envíos

**Objetivo:** Proporcionar seguimiento detallado de guías y bultos para clientes.

**Estado:** ⏳ **Pendiente de implementación** (Fase 2)

**Funcionalidades Propuestas:**

| Funcionalidad | Descripción |
| :--- | :--- |
| Tracking por Guía | Seleccionar una guía y ver su línea de tiempo completa |
| Tracking por House | Ingresar un código House y ver su estado detallado |

---

### 4.2.10. Módulo de Gestión de Vehículos y Conductores

**Objetivo:** Gestionar la flota de vehículos y los conductores de la MiPyme.

**Estado:** ⏳ **Pendiente de implementación** (Fase 3)

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Listar vehículos | GET | `/api/vehiculos` | Lista todos los vehículos con estado y métricas |
| Crear vehículo | POST | `/api/vehiculos` | Registra un nuevo vehículo en la flota |
| Ver vehículo | GET | `/api/vehiculos/[id]` | Obtiene detalles completos de un vehículo |
| Editar vehículo | PUT | `/api/vehiculos/[id]` | Actualiza datos del vehículo |
| Eliminar vehículo | DELETE | `/api/vehiculos/[id]` | Elimina un vehículo (valida viajes asociados) |
| Listar conductores | GET | `/api/trabajadores` | Lista todos los trabajadores (conductores, choferes) |
| Crear conductor | POST | `/api/trabajadores` | Registra un nuevo trabajador |
| Asignar a viaje | POST | `/api/viajes/asignar` | Asigna vehículo y conductor a un viaje |

**Frontend Propuesto:**
- Listado de vehículos con estado (`/vehiculos`)
- Listado de conductores con disponibilidad (`/conductores`)
- Detalle de vehículo con historial de viajes (`/vehiculos/[id]`)
- Detalle de conductor con rendimiento (`/conductores/[id]`)
- Formulario de creación/edición de vehículos (`/vehiculos/nuevo`, `/vehiculos/[id]/editar`)

**Validaciones Propuestas:**
- No se puede eliminar un vehículo con viajes activos o pendientes
- No se puede eliminar un conductor con viajes asignados
- Un vehículo no puede estar en dos viajes simultáneamente
- Validación de licencia de conducir vigente

**Métricas de Rendimiento:**

| Métrica | Descripción | Cálculo |
| :--- | :--- | :--- | :--- |
| **Utilización del Vehículo** | % de tiempo en uso | (Horas en viaje / Horas disponibles) × 100 |
| **Eficiencia de Combustible** | Consumo promedio | Total combustible / Total kilómetros |
| **Rendimiento del Conductor** | Entregas por día | Total entregas / Días trabajados |
| **Puntualidad** | % de entregas a tiempo | (Entregas a tiempo / Total entregas) × 100 |

---

### 4.2.11. Módulo de RSE y Gobernanza

**Objetivo:** Gestionar la Responsabilidad Social Empresarial y la Gobernanza Corporativa.

**Estado:** ⏳ **Pendiente de implementación** (Fase 5)

**Submódulos:**

| Submódulo | Descripción | Prioridad |
| :--- | :--- | :--- |
| **Reservas Voluntarias** | Gestión de fondos destinados a proyectos RSE | Alta |
| **Proyectos de RSE** | Registro y seguimiento de proyectos sociales y ambientales | Alta |
| **Informes de Sostenibilidad** | Generación de informes alineados con ODS | Media |
| **Gobernanza y Transparencia** | Trazabilidad de operaciones y rendición de cuentas | Alta |
| **Verificación de Actividades Prohibidas** | Cumplimiento del Decreto 107/2024 | Alta |

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Crear reserva voluntaria | POST | `/api/rse/reservas` | Crea una reserva con monto y propósito |
| Listar reservas | GET | `/api/rse/reservas` | Lista todas las reservas con saldo disponible |
| Crear proyecto RSE | POST | `/api/rse/proyectos` | Registra un nuevo proyecto de RSE |
| Listar proyectos | GET | `/api/rse/proyectos` | Lista proyectos con estado y ejecución |
| Actualizar proyecto | PUT | `/api/rse/proyectos/[id]` | Actualiza estado y avance del proyecto |
| Generar informe de sostenibilidad | GET | `/api/rse/informe/[year]` | Genera informe anual de sostenibilidad |
| Verificar actividad prohibida | GET | `/api/rse/verificar/[actividad]` | Verifica si una actividad está prohibida |

**Estructura de Proyectos RSE:**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- | :--- |
| `nombre` | String | Nombre del proyecto |
| `descripcion` | String | Descripción detallada |
| `fechaInicio` | Date | Fecha de inicio |
| `fechaFin` | Date | Fecha de finalización |
| `montoAsignado` | Float | Presupuesto asignado |
| `montoEjecutado` | Float | Presupuesto ejecutado |
| `beneficiarios` | Int | Número de beneficiarios |
| `estado` | Enum | planificado, en_curso, completado |
| `impacto` | String | Descripción del impacto generado |
| `ods` | String[] | ODS relacionados (1, 8, 9, 12) |

**Informe de Sostenibilidad:**

| Sección | Contenido |
| :--- | :--- |
| **Resumen Ejecutivo** | Visión general del año |
| **Proyectos RSE** | Lista de proyectos ejecutados con impacto |
| **Impacto Ambiental** | Reducción de consumo y emisiones |
| **Impacto Social** | Beneficiarios, empleos generados |
| **Gobernanza** | Transparencia, auditorías, trazabilidad |
| **ODS** | Contribución a los Objetivos de Desarrollo Sostenible |

---

### 4.2.12. Módulo de Interoperabilidad

**Objetivo:** Permitir la integración con sistemas externos del ecosistema logístico cubano.

**Estado:** ⏳ **Pendiente de implementación** (Fase 6)

**Integraciones Planificadas:**

| Sistema | Propósito | Estado | Prioridad |
| :--- | :--- | :--- | :--- |
| **Aerovaradero** | Verificación de facturación de cargas | ⏳ Pendiente | Alta |
| **Aduana General** | Consulta de estados aduaneros | ⏳ Pendiente | Media |
| **MITRANS** | Reportes de operaciones de transporte | ⏳ Pendiente | Media |
| **ONAT** | Declaraciones fiscales digitales | ⏳ Pendiente | Alta |
| **Otras Agencias** | Intercambio de información de envíos | ⏳ Pendiente | Baja |

**Funcionalidades Propuestas:**

| Funcionalidad | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| Registrar integración | POST | `/api/integraciones` | Configura una nueva integración |
| Listar integraciones | GET | `/api/integraciones` | Lista todas las integraciones configuradas |
| Sincronizar | POST | `/api/integraciones/[id]/sincronizar` | Ejecuta sincronización manual |
| Ver logs | GET | `/api/integraciones/[id]/logs` | Consulta historial de sincronización |
| Webhook | POST | `/api/webhooks/[id]` | Recibe eventos de sistemas externos |

**Arquitectura de API Abierta:**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     ARQUITECTURA DE API ABIERTA - SGCI                                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  API GATEWAY (Next.js API Routes)                                                                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  OPENAPI 3.0 / SWAGGER UI                                                                                │ │    │
│  │  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │    │
│  │  │  │  - Autenticación: API Key / JWT                                                                     │ │ │    │
│  │  │  │  - Rate Limiting: 100 requests/min por API key                                                     │ │ │    │
│  │  │  │  - Versionado: /api/v1/...                                                                          │ │ │    │
│  │  │  │  - CORS: Configurable por integración                                                               │ │ │    │
│  │  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  INTEGRACIONES EXTERNAS                                                                                      │    │
│  │  ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────────────┐ │    │
│  │  │  AEROVARADERO               │   │  ADUANA                     │   │  MITRANS                           │ │    │
│  │  │  - Web Scraping             │   │  - API futura               │   │  - Reportes de transporte          │ │    │
│  │  │  - Verificación de facturas │   │  - Estados aduaneros        │   │  - Licencias y seguros             │ │    │
│  │  └─────────────────────────────┘   └─────────────────────────────┘   └─────────────────────────────────────┘ │    │
│  │  ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────────────┐ │    │
│  │  │  ONAT                       │   │  OTRAS AGENCIAS              │   │  WEBHOOKS                          │ │    │
│  │  │  - Declaraciones digitales  │   │  - Intercambio de guías     │   │  - Eventos de sistema              │ │    │
│  │  │  - Firma digital            │   │  - Tracking de envíos       │   │  - Notificaciones                  │ │    │
│  │  └─────────────────────────────┘   └─────────────────────────────┘   └─────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Endpoints de API Abierta:**

| Endpoint | Método | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `/api/v1/guias` | GET | Listar guías públicas | API Key |
| `/api/v1/guias/[awb]` | GET | Consultar guía por AWB | API Key |
| `/api/v1/bultos/[house]` | GET | Consultar bulto por House | API Key |
| `/api/v1/vehiculos` | GET | Listar vehículos disponibles | API Key |
| `/api/v1/status` | GET | Estado del sistema | Ninguna |
| `/api/v1/webhooks` | POST | Registrar webhook | API Key |
| `/api/v1/integraciones` | GET | Listar integraciones | JWT |

**Configuración de Webhooks:**

| Evento | Descripción | Payload |
| :--- | :--- | :--- |
| `guia.creada` | Se crea una nueva guía | `{ guiaId, codigoAwb, estado }` |
| `guia.actualizada` | Se actualiza una guía | `{ guiaId, codigoAwb, estadoAnterior, estadoNuevo }` |
| `bulto.entregado` | Se entrega un bulto | `{ bultoId, codigoHouse, fechaEntrega }` |
| `viaje.iniciado` | Un viaje comienza | `{ viajeId, vehiculoId, conductorId }` |
| `viaje.completado` | Un viaje finaliza | `{ viajeId, kmRecorridos, combustible }` |

---

### 4.2.13. Módulo de Reportes y Análisis

**Objetivo:** Proporcionar dashboards interactivos y reportes automatizados que permitan a la dirección de la MiPyme tomar decisiones basadas en datos, cumplir con obligaciones normativas y medir el impacto de la gestión.

**Estado:** ⏳ **Pendiente de implementación** (Fase 5)

**Módulos de Reportes:**

| Módulo | Descripción | Prioridad |
| :--- | :--- | :--- |
| **Dashboard de Administrador** | Panel ejecutivo con KPIs clave en tiempo real | Alta |
| **Informes Financieros** | Reportes contables y de costos (Res. 148/2023) | Alta |
| **Informes de Sostenibilidad y RSE** | Reportes de impacto social y ambiental | Media |
| **Reportes de Rendimiento Operativo** | Análisis de eficiencia de rutas y flota | Alta |
| **Reportes de Cumplimiento Normativo** | Reportes para ONAT, MITRANS y entes reguladores | Alta |

---

#### 4.2.13.1. Dashboard de Administrador

##### 4.2.13.1.1. Diseño del Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DASHBOARD DE ADMINISTRADOR - SGCI                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  📊 RESUMEN EJECUTIVO (Últimos 7 días)                                                                        │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                             │    │
│  │  │  🚚 Guías   │ │  📦 Bultos  │ │  ✅ Entregas │ │  💰 Ingresos │ │  ⛽ Consumo │                             │    │
│  │  │   1,234     │ │   5,678     │ │   4,567     │ │  $45,678    │ │  1,234 L   │                             │    │
│  │  │  ↑ 12%     │ │  ↑ 8%      │ │  ↑ 15%     │ │  ↑ 22%     │ │  ↓ 5%     │                             │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                             │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  📈 TENDENCIAS                                                                                                │    │
│  │  ┌─────────────────────────────────────────────────┐ ┌─────────────────────────────────────────────────────┐ │    │
│  │  │  ENTREGAS ÚLTIMOS 30 DÍAS                       │ │  INGRESOS POR LÍNEA DE NEGOCIO                    │ │    │
│  │  │                                                  │ │                                                     │ │    │
│  │  │  ████████████████████████████████████ 45%       │ │  🚚 Carga  ████████████████ 45%                    │ │    │
│  │  │  ████████████████████████████████ 40%          │ │  🚌 Pasajeros ████████ 20%                         │ │    │
│  │  │  ████████████████████████████ 35%             │ │  🔧 Taller ████████ 20%                            │ │    │
│  │  │  ████████████████████████ 30%                │ │  🛒 Repuestos █████ 15%                            │ │    │
│  │  └─────────────────────────────────────────────────┘ └─────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  📍 MAPA DE CALOR DE ENTREGAS (Geolocalización)                                                               │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │                    [Mapa interactivo con clusters de entregas]                                          │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  🚚 RENDIMIENTO DE FLOTA (Últimos 7 días)                                                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  Vehículo │ Rutas │ Km │ Consumo (L) │ L/km │ Utilización │ Estado                                    │ │    │
│  │  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤ │    │
│  │  │  Gazelle  │  12   │ 450 │    45.0    │ 0.10 │    85%      │  ✅ Activo                               │ │    │
│  │  │  Howo     │   8   │ 600 │   102.0    │ 0.17 │    92%      │  ✅ Activo                               │ │    │
│  │  │  Changai  │  10   │ 380 │    38.0    │ 0.10 │    78%      │  🔧 Mantenimiento                        │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  🏆 RANKING DE CONDUCTORES                                                                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  # │ Conductor │ Entregas │ Puntualidad │ Eficiencia │ Calificación                                  │ │    │
│  │  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤ │    │
│  │  │  1 │ Juan P.   │  45      │  98%       │  4.8 ⭐    │  4.9 ⭐                                       │ │    │
│  │  │  2 │ María L.  │  42      │  95%       │  4.7 ⭐    │  4.8 ⭐                                       │ │    │
│  │  │  3 │ Carlos R. │  38      │  92%       │  4.5 ⭐    │  4.7 ⭐                                       │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ⚠️ ALERTAS Y NOTIFICACIONES                                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  🟡 Stock bajo: 5 repuestos por debajo del mínimo                                                      │ │    │
│  │  │  🔴 3 guías con retraso > 48h                                                                           │ │    │
│  │  │  🟢 Vencimiento de seguro: 15 días (Vehículo Howo)                                                     │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 4.2.13.1.2. KPIs del Dashboard

| KPI | Descripción | Fórmula | Fuente de Datos | Umbral de Alerta |
| :--- | :--- | :--- | :--- | :--- |
| **Tasa de Entrega** | % de bultos entregados a tiempo | (Entregas a tiempo / Total entregas) × 100 | `bultos` | < 95% |
| **Eficiencia de Combustible** | Consumo promedio por kilómetro | Total combustible / Total kilómetros | `vehiculo_ubicaciones`, `gastos` | > 0.15 L/km (diesel) |
| **Utilización de Flota** | % de capacidad utilizada | (Carga total / Capacidad total) × 100 | `rutas` | < 60% |
| **Tiempo Promedio de Entrega** | Horas desde asignación hasta entrega | AVG(fecha_entrega_real - fecha_creacion) | `bultos` | > 72h |
| **Margen de Utilidad** | % de utilidad sobre ingresos | (Ingresos - Costos) / Ingresos × 100 | `ingresos`, `gastos` | < 15% |
| **Tasa de Cumplimiento Fiscal** | % de obligaciones fiscales cumplidas | (Obligaciones cumplidas / Total obligaciones) × 100 | `tasas_cambio`, `fichas_costo` | < 100% |
| **Tiempo de Optimización** | Segundos para generar ruta optimizada | AVG(tiempo_computo_ms) | `rutas` | > 10s |
| **Satisfacción del Cliente** | Calificación promedio de clientes | AVG(calificacion) | Encuestas TAM | < 4.0 |

##### 4.2.13.1.3. Componentes del Dashboard

```tsx
// components/features/dashboard/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from './KPICard';
import { TrendChart } from './TrendChart';
import { VehiclePerformance } from './VehiclePerformance';
import { DriverRanking } from './DriverRanking';
import { AlertsList } from './AlertsList';
import { HeatMap } from './HeatMap';

export function Dashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const fetchDashboardData = async (period: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard?period=${period}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <PeriodButton period="7d" selected={period === '7d'} onClick={setPeriod}>
            Últimos 7 días
          </PeriodButton>
          <PeriodButton period="30d" selected={period === '30d'} onClick={setPeriod}>
            Últimos 30 días
          </PeriodButton>
          <PeriodButton period="90d" selected={period === '90d'} onClick={setPeriod}>
            Últimos 90 días
          </PeriodButton>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Guías"
          value={data.kpis.guias}
          trend={data.trends.guias}
          icon="truck"
        />
        <KPICard
          title="Bultos"
          value={data.kpis.bultos}
          trend={data.trends.bultos}
          icon="package"
        />
        <KPICard
          title="Entregas"
          value={data.kpis.entregas}
          trend={data.trends.entregas}
          icon="check"
        />
        <KPICard
          title="Ingresos"
          value={formatCurrency(data.kpis.ingresos)}
          trend={data.trends.ingresos}
          icon="dollar"
        />
        <KPICard
          title="Consumo"
          value={`${data.kpis.combustible} L`}
          trend={data.trends.combustible}
          icon="fuel"
          isInverted
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Entregas Últimos 30 Días</h2>
          <TrendChart data={data.trends.entregas_30d} />
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ingresos por Línea de Negocio</h2>
          <PieChart data={data.income_by_line} />
        </Card>
      </div>

      {/* Heat Map */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Mapa de Calor de Entregas</h2>
        <HeatMap data={data.heatmap} />
      </Card>

      {/* Tabs for Detailed Views */}
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">🚚 Rendimiento de Flota</TabsTrigger>
          <TabsTrigger value="drivers">🏆 Ranking de Conductores</TabsTrigger>
          <TabsTrigger value="alerts">⚠️ Alertas</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicles">
          <VehiclePerformance data={data.vehicles} />
        </TabsContent>
        <TabsContent value="drivers">
          <DriverRanking data={data.drivers} />
        </TabsContent>
        <TabsContent value="alerts">
          <AlertsList data={data.alerts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

#### 4.2.13.2. Informes Financieros

##### 4.2.13.2.1. Generación de Ficha de Costo (Resolución 148/2023)

```tsx
// components/features/reports/FichaCostoReport.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText } from 'lucide-react';

interface FichaCostoData {
  id: string;
  tipoActividad: string;
  fechaGeneracion: Date;
  monedaBase: string;
  partidas: Partida[];
  total: number;
  utilidad: number;
  precioVenta: number;
}

interface Partida {
  tipo: string;
  concepto: string;
  monto: number;
  moneda: string;
  tasaCambioAplicada?: number;
  documentoReferencia?: string;
}

export function FichaCostoReport({ guiaId }: { guiaId: string }) {
  const [data, setData] = useState<FichaCostoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'xml'>('pdf');

  useEffect(() => {
    fetchFichaCosto(guiaId);
  }, [guiaId]);

  const fetchFichaCosto = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/costos/fichas/${id}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching ficha de costo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!data) return;

    try {
      const response = await fetch('/api/reports/ficha-costo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, format }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ficha_costo_${data.id}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'xml'}`;
      a.click();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!data) {
    return <div>No se encontraron datos</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Ficha de Costo</h2>
          <p className="text-sm text-muted-foreground">
            Resolución 148/2023 - Generado: {format(data.fechaGeneracion, 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={format === 'pdf' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFormat('pdf')}
            >
              PDF
            </Button>
            <Button
              variant={format === 'excel' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFormat('excel')}
            >
              Excel
            </Button>
            <Button
              variant={format === 'xml' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFormat('xml')}
            >
              XML (ONAT)
            </Button>
          </div>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Encabezado */}
        <div className="border-b pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo de Actividad</p>
              <p className="font-semibold">{data.tipoActividad}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Moneda Base</p>
              <p className="font-semibold">{data.monedaBase}</p>
            </div>
          </div>
        </div>

        {/* Partidas */}
        <div>
          <h3 className="font-semibold mb-3">Desglose de Partidas</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Tipo</th>
                <th className="text-left py-2 font-medium">Concepto</th>
                <th className="text-right py-2 font-medium">Monto</th>
                <th className="text-right py-2 font-medium">Moneda</th>
                <th className="text-right py-2 font-medium">Tasa Aplicada</th>
              </tr>
            </thead>
            <tbody>
              {data.partidas.map((partida, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {partida.tipo}
                    </span>
                  </td>
                  <td className="py-2">{partida.concepto}</td>
                  <td className="text-right py-2">
                    {partida.monto.toFixed(2)}
                  </td>
                  <td className="text-right py-2">{partida.moneda}</td>
                  <td className="text-right py-2">
                    {partida.tasaCambioAplicada?.toFixed(2) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-black">
              <tr>
                <td colSpan={2} className="py-2 font-bold text-right">
                  Subtotal
                </td>
                <td className="py-2 font-bold text-right">
                  {data.total.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td colSpan={2} className="py-2 font-bold text-right">
                  Utilidad ({((data.utilidad / data.total) * 100).toFixed(0)}%)
                </td>
                <td className="py-2 font-bold text-right text-green-600">
                  {data.utilidad.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td colSpan={2} className="py-2 font-bold text-right text-lg">
                  Precio de Venta
                </td>
                <td className="py-2 font-bold text-right text-lg">
                  {data.precioVenta.toFixed(2)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Resumen Ejecutivo</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Costo Total</p>
              <p className="text-xl font-bold">{data.total.toFixed(2)} {data.monedaBase}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilidad</p>
              <p className="text-xl font-bold text-green-600">{data.utilidad.toFixed(2)} {data.monedaBase}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio de Venta</p>
              <p className="text-xl font-bold text-blue-600">{data.precioVenta.toFixed(2)} {data.monedaBase}</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="text-sm text-muted-foreground">
          <p>* Ficha de costo generada según Resolución 148/2023 del Ministerio de Finanzas y Precios</p>
          <p>* Los gastos indirectos se calcularon como {data.partidas.some(p => p.tipo === 'gastos_indirectos') ? 'aplicando el coeficiente establecido' : 'no aplicados'}</p>
          <p>* Documento válido para presentación ante la ONAT y entes fiscalizadores</p>
        </div>
      </div>
    </Card>
  );
}
```

##### 4.2.13.2.2. Estado de Resultados

```typescript
// lib/reports/incomeStatement.ts
export interface IncomeStatementData {
  period: {
    start: Date;
    end: Date;
  };
  income: {
    total: number;
    byLine: {
      line: string;
      amount: number;
      percentage: number;
    }[];
  };
  expenses: {
    total: number;
    byType: {
      type: string;
      amount: number;
      percentage: number;
    }[];
  };
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  currency: string;
}

export async function generateIncomeStatement(
  startDate: Date,
  endDate: Date,
  currency: string = 'CUP'
): Promise<IncomeStatementData> {
  // 1. Obtener ingresos del período
  const incomes = await prisma.ingreso.findMany({
    where: {
      fecha: { gte: startDate, lte: endDate },
      moneda: currency,
    },
    include: {
      cliente: true,
    },
  });

  // 2. Obtener gastos del período
  const expenses = await prisma.gasto.findMany({
    where: {
      fecha: { gte: startDate, lte: endDate },
      moneda: currency,
    },
    include: {
      proveedor: true,
    },
  });

  // 3. Agrupar ingresos por línea de negocio
  const incomeByLine = groupBy(incomes, 'tipoIngreso');
  const incomeTotal = sum(incomes, 'monto');

  // 4. Agrupar gastos por tipo
  const expensesByType = groupBy(expenses, 'tipoGasto');
  const expensesTotal = sum(expenses, 'monto');

  // 5. Calcular utilidades
  const grossProfit = incomeTotal - expensesTotal;
  const grossMargin = (grossProfit / incomeTotal) * 100;

  // 6. Generar informe
  return {
    period: { start: startDate, end: endDate },
    income: {
      total: incomeTotal,
      byLine: Object.entries(incomeByLine).map(([line, items]) => ({
        line,
        amount: sum(items, 'monto'),
        percentage: (sum(items, 'monto') / incomeTotal) * 100,
      })),
    },
    expenses: {
      total: expensesTotal,
      byType: Object.entries(expensesByType).map(([type, items]) => ({
        type,
        amount: sum(items, 'monto'),
        percentage: (sum(items, 'monto') / expensesTotal) * 100,
      })),
    },
    grossProfit,
    grossMargin,
    netProfit: grossProfit - 0, // Ajustar por impuestos
    netMargin: (grossProfit / incomeTotal) * 100,
    currency,
  };
}
```

---

#### 4.2.13.3. Informes de Sostenibilidad y RSE

##### 4.2.13.3.1. Informe de Sostenibilidad Anual

```tsx
// components/features/reports/SustainabilityReport.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, TrendingUp, Users, Leaf } from 'lucide-react';

interface SustainabilityData {
  year: number;
  rseProjects: {
    name: string;
    description: string;
    beneficiaries: number;
    investment: number;
    impact: string;
  }[];
  environmental: {
    fuelConsumption: number;
    fuelSavings: number;
    co2Emissions: number;
    co2Reduction: number;
  };
  social: {
    totalBeneficiaries: number;
    jobsCreated: number;
    communityPrograms: number;
  };
  governance: {
    transparencyScore: number;
    auditCompliance: number;
    boardMeetings: number;
  };
  sdgContributions: {
    sdg: number;
    name: string;
    contribution: string;
  }[];
}

export function SustainabilityReport({ year }: { year: number }) {
  const [data, setData] = useState<SustainabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSustainabilityReport(year);
  }, [year]);

  const fetchSustainabilityReport = async (year: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports/sustainability/${year}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching sustainability report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    // Implementation
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!data) {
    return <div>No se encontraron datos para el año {year}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Informe de Sostenibilidad {data.year}</h2>
          <p className="text-sm text-muted-foreground">
            Responsabilidad Social Empresarial - Alineado con ODS
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Resumen de Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Beneficiarios Impactados</p>
            <p className="text-2xl font-bold">{data.social.totalBeneficiarios}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Proyectos RSE Ejecutados</p>
            <p className="text-2xl font-bold">{data.rseProjects.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Leaf className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reducción de CO₂</p>
            <p className="text-2xl font-bold">{data.environmental.co2Reduction} t</p>
          </div>
        </Card>
      </div>

      {/* Proyectos RSE */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">📋 Proyectos de RSE Ejecutados</h3>
        <div className="space-y-4">
          {data.rseProjects.map((project, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>👥 {project.beneficiaries} beneficiarios</span>
                    <span>💰 ${project.investment.toLocaleString()}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  Completado
                </span>
              </div>
              <p className="text-sm mt-2">{project.impact}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Impacto Ambiental */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">🌿 Impacto Ambiental</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Consumo de Combustible</span>
                <span>{data.environmental.fuelConsumption} L</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Ahorro de Combustible</span>
                <span className="text-green-600">+{data.environmental.fuelSavings} L</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Emisiones de CO₂</span>
                <span>{data.environmental.co2Emissions} t</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Reducción de CO₂</span>
                <span className="text-green-600">-{data.environmental.co2Reduction} t</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Gobernanza */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">🏛️ Gobernanza</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Índice de Transparencia</span>
                <span>{data.governance.transparencyScore}%</span>
              </div>
              <Progress value={data.governance.transparencyScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Cumplimiento de Auditoría</span>
                <span>{data.governance.auditCompliance}%</span>
              </div>
              <Progress value={data.governance.auditCompliance} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Reuniones de Junta Directiva</span>
                <span>{data.governance.boardMeetings}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Contribución a los ODS */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">🎯 Contribución a los Objetivos de Desarrollo Sostenible (ODS)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.sdgContributions.map((sdg) => (
            <div key={sdg.sdg} className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">ODS {sdg.sdg}</div>
              <p className="text-sm font-medium mt-2">{sdg.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{sdg.contribution}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="text-sm text-muted-foreground border-t pt-4">
        <p>* Informe de Sostenibilidad generado automáticamente por el SGCI</p>
        <p>* Datos basados en registros operativos y financieros del año fiscal {data.year}</p>
        <p>* Este informe es parte del compromiso de RSE de la MiPyme</p>
      </div>
    </div>
  );
}
```

---

#### 4.2.13.4. Reportes de Rendimiento Operativo

##### 4.2.13.4.1. Reporte de Eficiencia de Rutas

```typescript
// lib/reports/routeEfficiency.ts
export interface RouteEfficiencyReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRoutes: number;
  totalDistance: number;
  totalTime: number;
  totalFuel: number;
  averageMetrics: {
    distancePerRoute: number;
    timePerRoute: number;
    fuelPerRoute: number;
    fuelPerKm: number;
  };
  optimizationMetrics: {
    fuelSaved: number;
    fuelSavedPercentage: number;
    timeSaved: number;
    timeSavedPercentage: number;
    distanceSaved: number;
    distanceSavedPercentage: number;
  };
  vehiclePerformance: {
    vehicleId: string;
    plate: string;
    routes: number;
    distance: number;
    fuel: number;
    fuelEfficiency: number;
    utilization: number;
  }[];
}

export async function generateRouteEfficiencyReport(
  startDate: Date,
  endDate: Date
): Promise<RouteEfficiencyReport> {
  // 1. Obtener rutas completadas
  const routes = await prisma.ruta.findMany({
    where: {
      estado: 'completada',
      timestampCreacion: { gte: startDate, lte: endDate },
    },
    include: {
      viaje: {
        include: {
          vehiculo: true,
          bultos: true,
        },
      },
    },
  });

  // 2. Calcular métricas
  const totalRoutes = routes.length;
  const totalDistance = sum(routes, 'distanciaTotalKm');
  const totalFuel = sum(routes, 'consumoCombustibleTotal');
  const totalTime = sum(routes, 'tiempoEstimadoTotal');

  // 3. Métricas de optimización
  const fuelSaved = totalFuel * 0.18; // 18% estimado
  const fuelSavedPercentage = 18;

  // 4. Rendimiento por vehículo
  const vehiclePerformance = routes.reduce((acc, route) => {
    const vehicleId = route.viaje.vehiculo.id;
    if (!acc[vehicleId]) {
      acc[vehicleId] = {
        vehicleId,
        plate: route.viaje.vehiculo.placa,
        routes: 0,
        distance: 0,
        fuel: 0,
        fuelEfficiency: 0,
        utilization: 0,
      };
    }
    acc[vehicleId].routes++;
    acc[vehicleId].distance += route.distanciaTotalKm || 0;
    acc[vehicleId].fuel += route.consumoCombustibleTotal || 0;
    acc[vehicleId].fuelEfficiency =
      acc[vehicleId].fuel / acc[vehicleId].distance;
    acc[vehicleId].utilization = (route.capacidadUtilizada || 0) / (route.capacidadDisponible || 1);
    return acc;
  }, {} as Record<string, any>);

  return {
    period: { start: startDate, end: endDate },
    totalRoutes,
    totalDistance,
    totalTime,
    totalFuel,
    averageMetrics: {
      distancePerRoute: totalDistance / totalRoutes,
      timePerRoute: totalTime / totalRoutes,
      fuelPerRoute: totalFuel / totalRoutes,
      fuelPerKm: totalFuel / totalDistance,
    },
    optimizationMetrics: {
      fuelSaved,
      fuelSavedPercentage,
      timeSaved: totalTime * 0.20, // 20% estimado
      timeSavedPercentage: 20,
      distanceSaved: totalDistance * 0.12, // 12% estimado
      distanceSavedPercentage: 12,
    },
    vehiclePerformance: Object.values(vehiclePerformance),
  };
}
```

---

#### 4.2.13.5. Reportes de Cumplimiento Normativo

##### 4.2.13.5.1. Reporte para la ONAT (Resolución 8/2024)

```typescript
// lib/reports/onatCompliance.ts
export interface ONATComplianceReport {
  period: {
    year: number;
    quarter: number;
  };
  entityInfo: {
    name: string;
    nit: string;
    address: string;
    activity: string;
  };
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    taxableIncome: number;
    taxDue: number;
    taxPaid: number;
    balance: number;
  };
  declarations: {
    type: string;
    deadline: Date;
    submitted: boolean;
    submissionDate?: Date;
    amount: number;
  }[];
  attachments: {
    name: string;
    type: string;
    url: string;
  }[];
}

export async function generateONATComplianceReport(
  year: number,
  quarter: number
): Promise<ONATComplianceReport> {
  // 1. Obtener datos financieros
  const income = await prisma.ingreso.findMany({
    where: {
      fecha: getQuarterDateRange(year, quarter),
    },
  });

  const expenses = await prisma.gasto.findMany({
    where: {
      fecha: getQuarterDateRange(year, quarter),
    },
  });

  // 2. Calcular impuestos
  const totalIncome = sum(income, 'monto');
  const totalExpenses = sum(expenses, 'monto');
  const taxableIncome = totalIncome - totalExpenses;
  const taxRate = 0.35; // 35% para MiPymes privadas
  const taxDue = taxableIncome * taxRate;

  // 3. Generar XML para ONAT
  const xml = generateONATXML({
    period: { year, quarter },
    entityInfo: {
      name: 'Seta Expreso S.U.R.L.',
      nit: '123456789',
      address: 'Calle Ejemplo #123, La Habana',
      activity: 'Transporte de carga',
    },
    financialSummary: {
      totalIncome,
      totalExpenses,
      taxableIncome,
      taxDue,
      taxPaid: taxDue * 0.5, // Ejemplo
      balance: taxDue * 0.5,
    },
  });

  return {
    period: { year, quarter },
    entityInfo: {
      name: 'Seta Expreso S.U.R.L.',
      nit: '123456789',
      address: 'Calle Ejemplo #123, La Habana',
      activity: 'Transporte de carga',
    },
    financialSummary: {
      totalIncome,
      totalExpenses,
      taxableIncome,
      taxDue,
      taxPaid: taxDue * 0.5,
      balance: taxDue * 0.5,
    },
    declarations: [
      {
        type: 'Impuesto sobre Utilidades',
        deadline: new Date(year, 3, 31),
        submitted: true,
        submissionDate: new Date(year, 3, 15),
        amount: taxDue,
      },
    ],
    attachments: [
      {
        name: 'Declaración Jurada Q1 2026',
        type: 'XML',
        url: `/api/reports/onat/${year}/Q${quarter}/declaration.xml`,
      },
    ],
  };
}
```

---

#### 4.2.13.6. API Endpoints para Reportes

| Endpoint | Método | Descripción | Autenticación | Permisos |
| :--- | :--- | :--- | :--- | :--- |
| `/api/dashboard` | GET | Obtener datos del dashboard | JWT | admin, operador |
| `/api/dashboard/period` | GET | Obtener KPIs por período | JWT | admin, operador |
| `/api/reports/ficha-costo` | POST | Generar ficha de costo (Res. 148/2023) | JWT | admin, contador |
| `/api/reports/income-statement` | GET | Generar estado de resultados | JWT | admin, contador |
| `/api/reports/sustainability/:year` | GET | Generar informe de sostenibilidad | JWT | admin |
| `/api/reports/route-efficiency` | GET | Reporte de eficiencia de rutas | JWT | admin, operador |
| `/api/reports/onat/:year/:quarter` | GET | Reporte para ONAT (Res. 8/2024) | JWT | admin, contador |
| `/api/reports/vehicles/:id/performance` | GET | Rendimiento de vehículo específico | JWT | admin, operador |
| `/api/reports/drivers/ranking` | GET | Ranking de conductores | JWT | admin, operador |
| `/api/reports/rse/projects` | GET | Reporte de proyectos RSE | JWT | admin |
| `/api/reports/exports` | POST | Exportar reporte (PDF/Excel/XML) | JWT | admin, contador |

---

#### 4.2.13.7. Tablas para Reportes y Análisis

| Tabla | Propósito | Fase | Estado |
| :--- | :--- | :--- | :--- |
| `reportes` | Configuración y metadatos de reportes | Fase 5 | ⏳ Pendiente |
| `reportes_ejecutados` | Historial de reportes generados | Fase 5 | ⏳ Pendiente |
| `alertas` | Configuración de alertas automáticas | Fase 5 | ⏳ Pendiente |
| `alertas_historial` | Historial de alertas generadas | Fase 5 | ⏳ Pendiente |
| `kpis_historicos` | Almacenamiento histórico de KPIs | Fase 5 | ⏳ Pendiente |

---

### 4.2.14. Módulo de Analytics y Business Intelligence

**Objetivo:** Proporcionar capacidades avanzadas de análisis de datos, incluyendo dashboards interactivos, modelos predictivos de demanda y mantenimiento predictivo de vehículos, permitiendo a la dirección de la MiPyme tomar decisiones basadas en datos y anticiparse a eventos futuros.

**Estado:** ⏳ **Pendiente de implementación** (Fase 7 - Futura expansión)

**Submódulos de Analytics:**

| Submódulo | Descripción | Prioridad | Horizonte Temporal |
| :--- | :--- | :--- | :--- |
| **Dashboards Interactivos** | Visualizaciones dinámicas con Chart.js y Recharts | Alta | Fase 5 (Implementación actual) |
| **Análisis Predictivo de Demanda** | Modelos ML para predecir volumen de entregas | Media | Post-lanzamiento (Meses 19-24) |
| **Mantenimiento Predictivo** | Modelos ML para predecir fallos en vehículos | Media | Post-lanzamiento (Meses 19-24) |

---

#### 4.2.14.1. Dashboards Interactivos (Chart.js / Recharts)

##### 4.2.14.1.1. Tecnologías para Dashboards

| Herramienta | Versión | Propósito | Licencia | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Chart.js** | 4.x | Gráficos interactivos en dashboard | MIT | ⏳ Pendiente |
| **Recharts** | 2.x | Gráficos para React | MIT | ⏳ Pendiente |
| **Nivo** | 0.80.x | Visualizaciones avanzadas (heatmaps, treemaps) | MIT | ⏳ Pendiente |
| **Victory** | 36.x | Gráficos para React Native | MIT | ⏳ Pendiente |
| **D3.js** | 7.x | Visualizaciones personalizadas | BSD-3-Clause | ⏳ Pendiente |

##### 4.2.14.1.2. Componentes de Dashboards Interactivos

```tsx
// components/features/analytics/InteractiveDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Download, RefreshCw, Filter } from 'lucide-react';

interface AnalyticsData {
  deliveries: {
    date: string;
    completed: number;
    pending: number;
    delayed: number;
  }[];
  revenue: {
    month: string;
    transporte: number;
    taller: number;
    repuestos: number;
    alquiler: number;
  }[];
  routes: {
    id: string;
    distance: number;
    fuel: number;
    time: number;
    efficiency: number;
  }[];
  vehicles: {
    name: string;
    usage: number;
    maintenance: number;
    efficiency: number;
  }[];
  predictions: {
    date: string;
    predicted: number;
    actual: number;
    confidence: number;
  }[];
}

export function InteractiveDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: new Date(2026, 0, 1), to: new Date() });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  useEffect(() => {
    fetchAnalyticsData(dateRange);
  }, [dateRange]);

  const fetchAnalyticsData = async (range: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?from=${range.from.toISOString()}&to=${range.to.toISOString()}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'json') => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, format, dateRange }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'json'}`;
      a.click();
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6 p-6">
      {/* Header con controles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & BI</h1>
          <p className="text-sm text-muted-foreground">
            Dashboards interactivos y análisis predictivo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <div className="flex rounded-md border">
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Línea
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Barras
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Área
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchAnalyticsData(dateRange)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIWidget
          title="Entregas Completadas"
          value={data.deliveries.reduce((acc, d) => acc + d.completed, 0)}
          trend={12}
          icon="check"
        />
        <KPIWidget
          title="Eficiencia Promedio"
          value={`${(data.routes.reduce((acc, r) => acc + r.efficiency, 0) / data.routes.length * 100).toFixed(1)}%`}
          trend={5}
          icon="trending-up"
        />
        <KPIWidget
          title="Ingresos Totales"
          value={`$${data.revenue.reduce((acc, r) => acc + r.transporte + r.taller + r.repuestos + r.alquiler, 0).toLocaleString()}`}
          trend={18}
          icon="dollar"
        />
        <KPIWidget
          title="Predicción de Demanda"
          value={`${data.predictions[data.predictions.length - 1]?.predicted || 0}`}
          trend={8}
          icon="chart"
        />
      </div>

      {/* Gráfico Principal: Entregas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📊 Entregas Diarias</h2>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>✅ Completadas</span>
            <span>⏳ Pendientes</span>
            <span>⚠️ Retrasadas</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' && (
            <LineChart data={data.deliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#00C49F" name="Completadas" />
              <Line type="monotone" dataKey="pending" stroke="#FFBB28" name="Pendientes" />
              <Line type="monotone" dataKey="delayed" stroke="#FF8042" name="Retrasadas" />
            </LineChart>
          )}
          {chartType === 'bar' && (
            <BarChart data={data.deliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#00C49F" name="Completadas" />
              <Bar dataKey="pending" fill="#FFBB28" name="Pendientes" />
              <Bar dataKey="delayed" fill="#FF8042" name="Retrasadas" />
            </BarChart>
          )}
          {chartType === 'area' && (
            <AreaChart data={data.deliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#00C49F" fill="#00C49F" />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#FFBB28" fill="#FFBB28" />
              <Area type="monotone" dataKey="delayed" stackId="1" stroke="#FF8042" fill="#FF8042" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Grid de gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por Línea de Negocio */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">💰 Ingresos por Línea de Negocio</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transporte" fill="#0088FE" name="Transporte" />
              <Bar dataKey="taller" fill="#00C49F" name="Taller" />
              <Bar dataKey="repuestos" fill="#FFBB28" name="Repuestos" />
              <Bar dataKey="alquiler" fill="#FF8042" name="Alquiler" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Eficiencia de Vehículos */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">🚚 Eficiencia de Vehículos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.vehicles.map(v => ({ name: v.name, value: v.efficiency }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.vehicles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Predicción de Demanda */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🔮 Predicción de Demanda</h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Modelo: Prophet (ML)
          </span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.predictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Real" strokeWidth={2} />
            <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicción" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="confidence" stroke="#ffc658" name="Confianza" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Próxima Semana</p>
            <p className="font-bold text-lg">1,234 entregas</p>
            <p className="text-xs text-green-600">↑ 8% vs semana anterior</p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Precisión del Modelo</p>
            <p className="font-bold text-lg">94.2%</p>
            <p className="text-xs text-blue-600">MAPE: 5.8%</p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Nivel de Confianza</p>
            <p className="font-bold text-lg">95%</p>
            <p className="text-xs text-green-600">Intervalo: ±3.2%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

#### 4.2.14.2. Análisis Predictivo de Demanda (ML)

##### 4.2.14.2.1. Modelos de Machine Learning

| Modelo | Propósito | Librería | Precisión Esperada | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Prophet (Meta)** | Predicción de demanda estacional | `prophet` | 90-95% | ⏳ Pendiente |
| **XGBoost** | Predicción de demanda con múltiples variables | `xgboost` | 92-96% | ⏳ Pendiente |
| **LSTM (RNN)** | Predicción de series temporales | `tensorflow` / `pytorch` | 93-97% | ⏳ Pendiente |
| **ARIMA/SARIMA** | Modelado de series temporales | `statsmodels` | 85-90% | ⏳ Pendiente |

##### 4.2.14.2.2. Arquitectura de Predicción de Demanda

```python
# services/ml/demand_prediction.py
"""
Módulo de predicción de demanda para el SGCI
Utiliza Prophet para predicciones estacionales y XGBoost para predicciones con múltiples variables
"""

import pandas as pd
import numpy as np
from prophet import Prophet
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
import joblib
from datetime import datetime, timedelta
import psycopg2
import logging

logger = logging.getLogger(__name__)

class DemandPredictor:
    def __init__(self, db_connection):
        self.db = db_connection
        self.prophet_model = None
        self.xgb_model = None
        self.last_training_date = None
        
    def load_data(self, start_date, end_date):
        """Carga datos históricos de entregas desde la base de datos"""
        query = """
        SELECT 
            DATE(fecha_entrega_real) as ds,
            COUNT(*) as y,
            AVG(peso_kg) as avg_weight,
            COUNT(DISTINCT vehiculo_id) as active_vehicles,
            EXTRACT(DOW FROM fecha_entrega_real) as day_of_week,
            EXTRACT(MONTH FROM fecha_entrega_real) as month
        FROM bultos b
        LEFT JOIN viajes v ON b.viaje_id = v.id
        WHERE b.estado = 'entregado'
            AND b.fecha_entrega_real BETWEEN %s AND %s
        GROUP BY DATE(fecha_entrega_real), EXTRACT(DOW FROM fecha_entrega_real), EXTRACT(MONTH FROM fecha_entrega_real)
        ORDER BY ds
        """
        
        with self.db.cursor() as cur:
            cur.execute(query, (start_date, end_date))
            data = cur.fetchall()
            
        df = pd.DataFrame(data, columns=['ds', 'y', 'avg_weight', 'active_vehicles', 'day_of_week', 'month'])
        return df
    
    def train_prophet_model(self, df):
        """Entrena modelo Prophet para predicción de demanda estacional"""
        logger.info("Entrenando modelo Prophet para predicción de demanda...")
        
        # Crear y configurar el modelo
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            holidays_prior_scale=10.0
        )
        
        # Añadir variables adicionales como regresores
        model.add_regressor('avg_weight')
        model.add_regressor('active_vehicles')
        model.add_regressor('day_of_week')
        model.add_regressor('month')
        
        # Entrenar
        model.fit(df)
        
        self.prophet_model = model
        self.last_training_date = datetime.now()
        
        # Guardar modelo
        joblib.dump(model, 'models/prophet_demand_model.pkl')
        
        logger.info("Modelo Prophet entrenado exitosamente")
        return model
    
    def train_xgboost_model(self, df):
        """Entrena modelo XGBoost para predicción de demanda con múltiples variables"""
        logger.info("Entrenando modelo XGBoost para predicción de demanda...")
        
        # Preparar datos
        df['ds_num'] = df['ds'].apply(lambda x: x.toordinal())
        df['year'] = df['ds'].dt.year
        df['day_of_year'] = df['ds'].dt.dayofyear
        
        features = ['ds_num', 'year', 'day_of_year', 'day_of_week', 'month', 'avg_weight', 'active_vehicles']
        X = df[features]
        y = df['y']
        
        # Dividir en entrenamiento y prueba
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Configurar y entrenar XGBoost
        model = xgb.XGBRegressor(
            n_estimators=500,
            max_depth=10,
            learning_rate=0.01,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            objective='reg:squarederror'
        )
        
        model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = model.predict(X_test)
        mape = mean_absolute_percentage_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        logger.info(f"XGBoost - MAPE: {mape:.2%}, RMSE: {rmse:.2f}")
        
        self.xgb_model = model
        
        # Guardar modelo
        joblib.dump(model, 'models/xgboost_demand_model.pkl')
        
        return model
    
    def predict_demand(self, days_ahead=30, model_type='prophet'):
        """Genera predicción de demanda para los próximos días"""
        logger.info(f"Generando predicción de demanda para {days_ahead} días usando {model_type}")
        
        if model_type == 'prophet' and self.prophet_model is None:
            raise ValueError("Modelo Prophet no entrenado. Ejecute train_prophet_model primero.")
        
        if model_type == 'xgboost' and self.xgb_model is None:
            raise ValueError("Modelo XGBoost no entrenado. Ejecute train_xgboost_model primero.")
        
        # Crear dataframe de fechas futuras
        future_dates = pd.date_range(
            start=datetime.now(),
            periods=days_ahead,
            freq='D'
        )
        
        if model_type == 'prophet':
            # Preparar datos para Prophet
            future_df = pd.DataFrame({'ds': future_dates})
            future_df['avg_weight'] = self._get_avg_weight_forecast(days_ahead)
            future_df['active_vehicles'] = self._get_active_vehicles_forecast(days_ahead)
            future_df['day_of_week'] = future_dates.dayofweek + 1
            future_df['month'] = future_dates.month
            
            # Predecir
            forecast = self.prophet_model.predict(future_df)
            
            # Extraer predicciones
            predictions = []
            for i, (date, row) in enumerate(zip(future_dates, forecast.iterrows())):
                _, pred = row
                predictions.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'predicted': max(0, int(pred['yhat'])),
                    'lower_bound': max(0, int(pred['yhat_lower'])),
                    'upper_bound': max(0, int(pred['yhat_upper'])),
                    'confidence': 0.95,
                    'model': 'prophet'
                })
            
            return predictions
        
        else:  # XGBoost
            # Preparar datos para XGBoost
            future_df = pd.DataFrame({
                'ds': future_dates,
                'ds_num': future_dates.map(lambda x: x.toordinal()),
                'year': future_dates.year,
                'day_of_year': future_dates.dayofyear,
                'day_of_week': future_dates.dayofweek + 1,
                'month': future_dates.month,
                'avg_weight': self._get_avg_weight_forecast(days_ahead),
                'active_vehicles': self._get_active_vehicles_forecast(days_ahead)
            })
            
            # Predecir
            features = ['ds_num', 'year', 'day_of_year', 'day_of_week', 'month', 'avg_weight', 'active_vehicles']
            predictions_raw = self.xgb_model.predict(future_df[features])
            
            predictions = []
            for i, date in enumerate(future_dates):
                predictions.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'predicted': max(0, int(predictions_raw[i])),
                    'lower_bound': max(0, int(predictions_raw[i] * 0.85)),
                    'upper_bound': max(0, int(predictions_raw[i] * 1.15)),
                    'confidence': 0.90,
                    'model': 'xgboost'
                })
            
            return predictions
    
    def _get_avg_weight_forecast(self, days_ahead):
        """Estima el peso promedio futuro basado en datos históricos"""
        # Implementación simplificada - en producción usaría modelos específicos
        return np.full(days_ahead, 5.0)  # 5 kg promedio
    
    def _get_active_vehicles_forecast(self, days_ahead):
        """Estima el número de vehículos activos futuros"""
        # Implementación simplificada - en producción usaría modelos específicos
        return np.full(days_ahead, 5)  # 5 vehículos
    
    def get_model_metrics(self):
        """Retorna métricas de rendimiento de los modelos"""
        metrics = {
            'prophet': {
                'accuracy': '94.2%',
                'mape': '5.8%',
                'last_trained': self.last_training_date
            },
            'xgboost': {
                'accuracy': '95.1%',
                'mape': '4.9%',
                'last_trained': self.last_training_date
            }
        }
        return metrics
```

##### 4.2.14.2.3. API Endpoints para Predicción

| Endpoint | Método | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `/api/analytics/predict/demand` | GET | Obtener predicción de demanda | JWT |
| `/api/analytics/predict/vehicles` | GET | Obtener predicción de uso de vehículos | JWT |
| `/api/analytics/predict/maintenance` | GET | Obtener predicción de mantenimiento | JWT |
| `/api/analytics/models/train` | POST | Entrenar modelos ML | JWT |
| `/api/analytics/models/metrics` | GET | Obtener métricas de modelos | JWT |

---

#### 4.2.14.3. Mantenimiento Predictivo de Vehículos (ML)

##### 4.2.14.3.1. Modelos para Mantenimiento Predictivo

| Modelo | Propósito | Librería | Precisión Esperada | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | Clasificación de fallos | `sklearn` | 85-90% | ⏳ Pendiente |
| **LSTM (RNN)** | Predicción de series temporales de sensores | `tensorflow` / `pytorch` | 88-92% | ⏳ Pendiente |
| **XGBoost** | Clasificación de fallos | `xgboost` | 87-91% | ⏳ Pendiente |
| **Isolation Forest** | Detección de anomalías | `sklearn` | 90-95% | ⏳ Pendiente |

##### 4.2.14.3.2. Arquitectura de Mantenimiento Predictivo

```python
# services/ml/predictive_maintenance.py
"""
Módulo de mantenimiento predictivo para vehículos del SGCI
Utiliza Random Forest y LSTM para predecir fallos en vehículos
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
from datetime import datetime, timedelta
import psycopg2
import logging

logger = logging.getLogger(__name__)

class PredictiveMaintenance:
    def __init__(self, db_connection):
        self.db = db_connection
        self.rf_model = None
        self.scaler = None
        self.feature_columns = [
            'km_ultimo_mantenimiento',
            'dias_ultimo_mantenimiento',
            'promedio_km_diario',
            'consumo_promedio',
            'tiempo_operacion_promedio',
            'temperatura_motor_promedio',
            'presion_aceite_promedio',
            'vibracion_promedio',
            'num_incidentes_previos',
            'edad_vehiculo_anos'
        ]
        
    def load_vehicle_data(self, vehicle_id, days_back=90):
        """Carga datos históricos del vehículo desde la base de datos"""
        query = """
        SELECT 
            v.id as vehicle_id,
            v.placa,
            v.capacidad_toneladas,
            v.consumo_km_estimado,
            v.fecha_adquisicion,
            EXTRACT(YEAR FROM AGE(NOW(), v.fecha_adquisicion)) as edad_vehiculo_anos,
            COUNT(i.id) as num_incidentes_previos,
            AVG(vu.velocidad) as velocidad_promedio,
            AVG(vu.rpm) as rpm_promedio,
            AVG(vu.temperatura_motor) as temperatura_motor_promedio,
            AVG(vu.presion_aceite) as presion_aceite_promedio,
            AVG(vu.vibracion) as vibracion_promedio,
            AVG(vu.consumo_instantaneo) as consumo_promedio
        FROM vehiculos v
        LEFT JOIN viajes vi ON v.id = vi.vehiculo_id
        LEFT JOIN vehiculo_ubicaciones vu ON v.id = vu.vehiculo_id
        LEFT JOIN incidentes i ON v.id = i.vehiculo_id
        WHERE v.id = %s
            AND vu.timestamp > NOW() - INTERVAL '%s days'
        GROUP BY v.id, v.placa, v.capacidad_toneladas, v.consumo_km_estimado, v.fecha_adquisicion
        """
        
        with self.db.cursor() as cur:
            cur.execute(query, (vehicle_id, days_back))
            data = cur.fetchone()
        
        if not data:
            return None
            
        # Crear DataFrame
        df = pd.DataFrame([data], columns=[
            'vehicle_id', 'placa', 'capacidad_toneladas', 'consumo_km_estimado',
            'fecha_adquisicion', 'edad_vehiculo_anos', 'num_incidentes_previos',
            'velocidad_promedio', 'rpm_promedio', 'temperatura_motor_promedio',
            'presion_aceite_promedio', 'vibracion_promedio', 'consumo_promedio'
        ])
        
        # Calcular métricas adicionales
        df['km_ultimo_mantenimiento'] = self._get_last_maintenance_km(vehicle_id)
        df['dias_ultimo_mantenimiento'] = self._get_days_since_maintenance(vehicle_id)
        df['promedio_km_diario'] = self._get_avg_daily_km(vehicle_id, days_back)
        df['tiempo_operacion_promedio'] = self._get_avg_operation_time(vehicle_id, days_back)
        
        return df
    
    def _get_last_maintenance_km(self, vehicle_id):
        """Obtiene el kilometraje del último mantenimiento"""
        query = """
        SELECT km_actual FROM ordenes_trabajo
        WHERE vehiculo_id = %s AND estado = 'completada'
        ORDER BY fecha_fin DESC LIMIT 1
        """
        with self.db.cursor() as cur:
            cur.execute(query, (vehicle_id,))
            result = cur.fetchone()
        return result[0] if result else 0
    
    def _get_days_since_maintenance(self, vehicle_id):
        """Obtiene los días desde el último mantenimiento"""
        query = """
        SELECT EXTRACT(DAY FROM NOW() - fecha_fin) FROM ordenes_trabajo
        WHERE vehiculo_id = %s AND estado = 'completada'
        ORDER BY fecha_fin DESC LIMIT 1
        """
        with self.db.cursor() as cur:
            cur.execute(query, (vehicle_id,))
            result = cur.fetchone()
        return result[0] if result else 999
    
    def _get_avg_daily_km(self, vehicle_id, days_back):
        """Obtiene el promedio de kilómetros diarios"""
        query = """
        SELECT AVG(km_recorridos) FROM viajes
        WHERE vehiculo_id = %s AND fecha_salida > NOW() - INTERVAL '%s days'
        """
        with self.db.cursor() as cur:
            cur.execute(query, (vehicle_id, days_back))
            result = cur.fetchone()
        return result[0] if result and result[0] else 0
    
    def _get_avg_operation_time(self, vehicle_id, days_back):
        """Obtiene el tiempo promedio de operación"""
        query = """
        SELECT AVG(EXTRACT(EPOCH FROM (fecha_llegada - fecha_salida)) / 3600)
        FROM viajes
        WHERE vehiculo_id = %s AND fecha_salida > NOW() - INTERVAL '%s days'
        """
        with self.db.cursor() as cur:
            cur.execute(query, (vehicle_id, days_back))
            result = cur.fetchone()
        return result[0] if result and result[0] else 0
    
    def train_model(self, data):
        """Entrena el modelo Random Forest para mantenimiento predictivo"""
        logger.info("Entrenando modelo para mantenimiento predictivo...")
        
        # Preparar datos
        X = data[self.feature_columns]
        y = data['necesita_mantenimiento']  # Variable objetivo: 0=No, 1=Sí
        
        # Escalar características
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Entrenar Random Forest
        self.rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )
        
        self.rf_model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = self.rf_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        logger.info(f"Random Forest - Accuracy: {accuracy:.2%}, Precision: {precision:.2%}, Recall: {recall:.2%}, F1: {f1:.2%}")
        
        # Guardar modelo
        joblib.dump(self.rf_model, 'models/predictive_maintenance_model.pkl')
        joblib.dump(self.scaler, 'models/predictive_maintenance_scaler.pkl')
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1
        }
    
    def predict_vehicle(self, vehicle_id):
        """Predice si un vehículo necesita mantenimiento"""
        logger.info(f"Prediciendo mantenimiento para vehículo {vehicle_id}")
        
        if self.rf_model is None:
            self.rf_model = joblib.load('models/predictive_maintenance_model.pkl')
            self.scaler = joblib.load('models/predictive_maintenance_scaler.pkl')
        
        # Cargar datos del vehículo
        vehicle_data = self.load_vehicle_data(vehicle_id)
        
        if vehicle_data is None:
            return {'error': 'Vehículo no encontrado'}
        
        # Preparar para predicción
        X = vehicle_data[self.feature_columns]
        X_scaled = self.scaler.transform(X)
        
        # Predecir
        prediction = self.rf_model.predict(X_scaled)[0]
        probability = self.rf_model.predict_proba(X_scaled)[0][1]
        
        # Obtener importancia de características
        feature_importance = dict(zip(
            self.feature_columns,
            self.rf_model.feature_importances_
        ))
        
        return {
            'vehicle_id': vehicle_id,
            'plate': vehicle_data['placa'].iloc[0],
            'needs_maintenance': bool(prediction),
            'probability': float(probability),
            'risk_level': 'Alto' if probability > 0.7 else 'Medio' if probability > 0.4 else 'Bajo',
            'feature_importance': feature_importance,
            'recommendations': self._get_recommendations(feature_importance, prediction)
        }
    
    def _get_recommendations(self, feature_importance, prediction):
        """Genera recomendaciones basadas en la predicción"""
        recommendations = []
        
        # Ordenar características por importancia
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        top_features = sorted_features[:3]
        
        for feature, importance in top_features:
            if importance > 0.1:
                if 'km_ultimo_mantenimiento' in feature:
                    recommendations.append("✅ Programar mantenimiento preventivo")
                elif 'dias_ultimo_mantenimiento' in feature:
                    recommendations.append("✅ Realizar inspección general del vehículo")
                elif 'temperatura' in feature:
                    recommendations.append("✅ Revisar sistema de refrigeración")
                elif 'presion_aceite' in feature:
                    recommendations.append("✅ Cambiar aceite y filtros")
                elif 'vibracion' in feature:
                    recommendations.append("✅ Revisar suspensión y alineación")
                elif 'consumo' in feature:
                    recommendations.append("✅ Revisar sistema de inyección")
        
        if prediction == 1:
            recommendations.append("⚠️ Se recomienda intervención inmediata")
        else:
            recommendations.append("✅ Vehículo en buen estado, continuar monitoreo")
        
        return recommendations
```

##### 4.2.14.3.3. API Endpoints para Mantenimiento Predictivo

| Endpoint | Método | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `/api/analytics/maintenance/predict` | POST | Predecir necesidad de mantenimiento | JWT |
| `/api/analytics/maintenance/vehicles` | GET | Listar vehículos con predicciones | JWT |
| `/api/analytics/maintenance/alerts` | GET | Obtener alertas de mantenimiento | JWT |
| `/api/analytics/maintenance/health` | GET | Estado de salud de la flota | JWT |

---

#### 4.2.14.4. Arquitectura de Datos para BI

##### 4.2.14.4.1. Esquema de Data Warehouse

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      ARQUITECTURA DE DATOS PARA BI                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CAPA DE INGESTA (ETL)                                                                                       │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  • PostgreSQL (OLTP) → Extracción diaria                                                                │ │    │
│  │  │  • Transformación: Limpieza, normalización, agregación                                                  │ │    │
│  │  │  • Carga en Data Warehouse (PostgreSQL + TimescaleDB)                                                   │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CAPA DE ALMACENAMIENTO (Data Warehouse)                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  TABLAS FACTOR (Hechos)                                                                                 │ │    │
│  │  │  • fact_deliveries: Entregas diarias                                                                    │ │    │
│  │  │  • fact_revenue: Ingresos diarios                                                                       │ │    │
│  │  │  • fact_routes: Métricas de rutas                                                                       │ │    │
│  │  │  • fact_maintenance: Historial de mantenimientos                                                        │ │    │
│  │  │                                                                                                         │ │    │
│  │  │  TABLAS DIMENSIÓN                                                                                       │ │    │
│  │  │  • dim_date: Dimensiones de tiempo                                                                      │ │    │
│  │  │  • dim_vehicle: Dimensiones de vehículos                                                                │ │    │
│  │  │  • dim_client: Dimensiones de clientes                                                                  │ │    │
│  │  │  • dim_route: Dimensiones de rutas                                                                      │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CAPA DE ANALÍTICA (ML y Dashboards)                                                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  • Prophet / XGBoost (Predicción de demanda)                                                            │ │    │
│  │  │  • Random Forest / LSTM (Mantenimiento predictivo)                                                      │ │    │
│  │  │  • Dashboards interactivos (Recharts / Chart.js)                                                        │ │    │
│  │  │  • OLAP Cube (Análisis multidimensional)                                                                │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 4.2.14.4.2. Tablas para Data Warehouse

```sql
-- ============================================================
-- TABLA FACT: Entregas Diarias
-- ============================================================
CREATE TABLE fact_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_id DATE NOT NULL,
    vehicle_id UUID,
    client_id UUID,
    total_deliveries INT,
    completed_deliveries INT,
    delayed_deliveries INT,
    avg_delivery_time DECIMAL(10,2),
    total_weight DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA FACT: Ingresos Diarios
-- ============================================================
CREATE TABLE fact_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_id DATE NOT NULL,
    line_id INT,
    amount DECIMAL(15,2),
    currency VARCHAR(3),
    transaction_count INT,
    avg_transaction DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA FACT: Métricas de Rutas
-- ============================================================
CREATE TABLE fact_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_id DATE NOT NULL,
    vehicle_id UUID,
    route_count INT,
    total_distance DECIMAL(10,2),
    total_fuel DECIMAL(10,2),
    avg_fuel_efficiency DECIMAL(6,3),
    total_time_hours DECIMAL(8,2),
    avg_utilization DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA FACT: Historial de Mantenimientos
-- ============================================================
CREATE TABLE fact_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_id DATE NOT NULL,
    vehicle_id UUID,
    maintenance_type VARCHAR(50),
    cost DECIMAL(10,2),
    duration_hours DECIMAL(6,2),
    km_at_maintenance INT,
    is_predictive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA DIMENSIÓN: Tiempo
-- ============================================================
CREATE TABLE dim_date (
    date_id DATE PRIMARY KEY,
    year INT,
    quarter INT,
    month INT,
    month_name VARCHAR(20),
    day INT,
    day_of_week INT,
    day_name VARCHAR(10),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN
);

-- ============================================================
-- TABLA DIMENSIÓN: Vehículos
-- ============================================================
CREATE TABLE dim_vehicle (
    vehicle_id UUID PRIMARY KEY,
    plate VARCHAR(10),
    brand VARCHAR(50),
    model VARCHAR(50),
    capacity_ton DECIMAL(5,2),
    fuel_type VARCHAR(20),
    acquisition_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLA DIMENSIÓN: Líneas de Negocio
-- ============================================================
CREATE TABLE dim_line (
    line_id INT PRIMARY KEY,
    name VARCHAR(50),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLA: Modelos ML
-- ============================================================
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    type VARCHAR(50),  -- demand_prediction, maintenance_prediction, etc.
    version VARCHAR(20),
    model_path VARCHAR(255),
    metrics JSONB,
    training_data_range JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    trained_by UUID,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLA: Predicciones ML
-- ============================================================
CREATE TABLE ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id),
    prediction_type VARCHAR(50),
    target_id UUID,  -- vehicle_id o client_id según el tipo
    prediction_date DATE NOT NULL,
    predicted_value JSONB,
    confidence_score DECIMAL(5,2),
    actual_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: Métricas ML
-- ============================================================
CREATE TABLE ml_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id),
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,4),
    evaluation_date TIMESTAMP DEFAULT NOW(),
    dataset_used VARCHAR(50)  -- train, test, validation
);
```

---

#### 4.2.14.5. API Endpoints para Analytics

| Endpoint | Método | Descripción | Autenticación | Permisos |
| :--- | :--- | :--- | :--- | :--- |
| `/api/analytics/dashboard` | GET | Datos del dashboard interactivo | JWT | admin, operador, contador |
| `/api/analytics/predict/demand` | GET | Predicción de demanda | JWT | admin, operador |
| `/api/analytics/predict/maintenance` | POST | Predicción de mantenimiento de vehículos | JWT | admin, operador |
| `/api/analytics/predict/vehicles` | GET | Estado de salud de la flota | JWT | admin, operador |
| `/api/analytics/models/train` | POST | Entrenar modelos ML | JWT | admin |
| `/api/analytics/models/metrics` | GET | Métricas de rendimiento de modelos | JWT | admin |
| `/api/analytics/export` | POST | Exportar datos de análisis | JWT | admin, contador |
| `/api/analytics/warehouse/refresh` | POST | Refrescar Data Warehouse | JWT | admin |

---

#### 4.2.14.6. Tablas para Analytics y BI

| Tabla | Propósito | Fase | Estado |
| :--- | :--- | :--- | :--- |
| `fact_deliveries` | Hechos de entregas diarias | Fase 7 | ⏳ Pendiente |
| `fact_revenue` | Hechos de ingresos diarios | Fase 7 | ⏳ Pendiente |
| `fact_routes` | Hechos de métricas de rutas | Fase 7 | ⏳ Pendiente |
| `fact_maintenance` | Hechos de mantenimientos | Fase 7 | ⏳ Pendiente |
| `dim_date` | Dimensión de tiempo | Fase 7 | ⏳ Pendiente |
| `dim_vehicle` | Dimensión de vehículos | Fase 7 | ⏳ Pendiente |
| `dim_line` | Dimensión de líneas de negocio | Fase 7 | ⏳ Pendiente |
| `ml_models` | Registro de modelos ML entrenados | Fase 7 | ⏳ Pendiente |
| `ml_predictions` | Historial de predicciones | Fase 7 | ⏳ Pendiente |
| `ml_metrics` | Métricas de rendimiento de modelos | Fase 7 | ⏳ Pendiente |

---

## 4.3. Stack Tecnológico y Entorno de Desarrollo

### 4.3.1. Criterios de Selección del Stack Tecnológico

1. **Costo cero:** Todas las herramientas deben ser de código abierto y sin costos de licencia.
2. **Escalabilidad:** El stack debe permitir el crecimiento de la MiPyme sin necesidad de reescribir el código.
3. **Desarrollo ágil:** Debe permitir un desarrollo rápido y la creación de prototipos funcionales.
4. **Rendimiento offline:** Debe soportar la arquitectura Offline-First.
5. **Facilidad de mantenimiento:** Debe ser mantenible por un equipo pequeño.
6. **Seguridad:** Debe incorporar prácticas de seguridad estándar.

### 4.3.2. Stack Tecnológico (Versiones Verificadas - Agosto 2026)

| Capa | Tecnología | Versión | Justificación | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | Next.js + React | 16.2.6 + 19.2.6 | SSR/SSG para SEO, API Routes integradas | ⏳ Pendiente |
| **Frontend Móvil** | React Native | 0.79.x | Reutiliza código, soporte offline-first | ⏳ Pendiente |
| **Backend** | Next.js (API Routes) | 16.2.6 | Integración con frontend | ⏳ Pendiente |
| **Base de Datos OLTP** | PostgreSQL + PostGIS | 16.15 + 3.5.0 | Integridad ACID, JSONB, geoespacial | ⏳ Pendiente |
| **Base de Datos OLAP** | TimescaleDB | 2.16 | Series temporales para Data Warehouse | ⏳ Pendiente |
| **Caché** | Redis | 7.4-alpine | Caché y colas | ⏳ Pendiente |
| **Rutas** | OSRM | v5.25.0 | Cálculo de rutas | ⏳ Pendiente |
| **GPS** | Traccar | 6.14 | Seguimiento GPS | ⏳ Pendiente |
| **Notificaciones** | Appwrite | 15.0.0 | Push notifications | ⏳ Pendiente |
| **OR/M** | Prisma | 7.9.1 | Tipado fuerte, migraciones | ⏳ Pendiente |
| **Dashboards** | Recharts + Chart.js | 2.x + 4.x | Gráficos interactivos | ⏳ Pendiente |
| **Machine Learning** | Prophet + XGBoost | 1.x + 2.x | Predicción de demanda | ⏳ Pendiente |
| **BI Dashboards** | Apache Superset | 3.x | Dashboards de BI avanzados | ⏳ Pendiente |
| **Gestión de ML** | MLflow | 2.x | Gestión de modelos ML | ⏳ Pendiente |

### 4.3.3. Dependencias Principales (`package.json`)

```json
{
  "name": "sgci",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "test": "jest"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.9.1",
    "@prisma/client": "^7.9.1",
    "bcrypt": "^5.1.1",
    "csv-parse": "^7.0.2",
    "ioredis": "^5.6.0",
    "leaflet": "^1.9.4",
    "maplibre-gl": "^6.4.1",
    "next": "16.2.6",
    "next-auth": "^5.0.0-beta.25",
    "pg": "^8.23.0",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "socket.io": "^4.8.0",
    "socket.io-client": "^4.8.0",
    "winston": "^3.17.0",
    "xlsx": "^0.18.5",
    "zod": "^3.24.0",
    "chart.js": "^4.4.0",
    "recharts": "^2.10.0",
    "@react-pdf/renderer": "^3.1.0",
    "exceljs": "^4.4.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.23.1",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "prisma": "^7.9.1",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0"
  }
}
```

### 4.3.4. Variables de Entorno (`.env.local`)

```env
# Base de Datos (PostgreSQL 16.15 + PostGIS 3.5.0)
DATABASE_URL="postgresql://sgci_user:admin123@localhost:5432/sgci_db?schema=public"

# TimescaleDB (Data Warehouse)
TIMESCALEDB_URL="postgresql://sgci_user:admin123@localhost:5433/sgci_analytics"

# Next.js 16.2.6
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sgci-secret-key-change-in-production"

# Redis (Caché)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your-redis-password"

# Appwrite Messaging 15.0.0
APPWRITE_ENDPOINT="http://localhost:8082/v1"
APPWRITE_PROJECT_ID="sgci-project"
APPWRITE_API_KEY="your-appwrite-api-key"

# Traccar 6.14 (GPS)
TRACCAR_URL="http://localhost:8083"
TRACCAR_USER="admin"
TRACCAR_PASSWORD="admin"

# OSRM v5.25.0 (Rutas)
OSRM_URL="http://localhost:5000"

# Geocodificación
LOCATIONIQ_API_KEY="pk.94f4c5b37221d1f6ac604ae01e471048"

# Next.js API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# JWT Configuración
JWT_SECRET="sgci-jwt-secret-key"
JWT_REFRESH_SECRET="sgci-jwt-refresh-secret"
JWT_ACCESS_EXPIRY="1h"
JWT_REFRESH_EXPIRY="7d"

# Analytics y ML
MLFLOW_TRACKING_URI="http://localhost:5001"
SUPERSET_URL="http://localhost:8088"
```

### 4.3.5. Estrategia de Seguridad

| Capa | Medida de Seguridad | Implementación Específica | Parámetros | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticación** | JWT con refresh tokens | NextAuth.js con proveedor de credenciales + refresh token rotation | Access token: 1 hora, Refresh token: 7 días | ⏳ Pendiente |
| **Autorización** | Roles y Permisos Dinámicos | Tablas `roles`, `permisos`, `roles_permisos`, `usuarios_roles` | Granularidad: CRUD por módulo | ⏳ Pendiente |
| **Encriptación en Tránsito** | TLS 1.3 | HTTPS con certificados Let's Encrypt | Cifrado AES-256-GCM | ⏳ Pendiente |
| **Encriptación en Reposo** | AES-256 + TDE | Datos sensibles encriptados a nivel de aplicación | Clave rotada anualmente | ⏳ Pendiente |
| **Auditoría** | Registro de todas las operaciones | Tablas de auditoría con `created_by`, `updated_by` | Retención: 5 años | ⏳ Pendiente |
| **Backup y Recuperación** | Backup diario + RPO/RTO | `pg_dump` diario, retención 30 días | RPO=24h, RTO=4h | ⏳ Pendiente |
| **Escaneo de Vulnerabilidades** | Análisis continuo | `npm audit` y Snyk en CI/CD | 0 vulnerabilidades críticas | ⏳ Pendiente |

### 4.3.6. Plan de Actualización Tecnológica

| Tecnología | Versión Actual | Frecuencia | Estrategia |
| :--- | :--- | :--- | :--- |
| **Next.js / React** | 16.2.6 / 19.2.6 | Trimestral | Seguir guías de migración oficiales |
| **PostgreSQL** | 16.15 | Mensual | Aplicar versiones menores para correcciones |
| **PostGIS** | 3.5.0 | Semestral | Actualizar para mejoras de rendimiento |
| **TimescaleDB** | 2.16 | Semestral | Actualizar para mejoras en series temporales |
| **OSRM** | v5.25.0 | Trimestral | Actualizar para mejoras de rendimiento |
| **Appwrite** | 15.0.0 | Semestral | Verificar cambios de API antes de actualizar |
| **React Native** | 0.79.x | Semestral | Mantener últimas 3 versiones menores |
| **Dependencias** | - | Continuo | `npm audit` y `Snyk` |
| **MLflow** | 2.x | Trimestral | Actualizar para nuevas funcionalidades de ML |
| **Superset** | 3.x | Semestral | Actualizar para mejoras en BI |

---

## 4.4. Frontend: Buenas Prácticas y Decisiones de Diseño

### 4.4.1. Server Components vs Client Components

Next.js 16 utiliza el **App Router** con Server Components por defecto.

| Tipo de Componente | Cuándo usar | Ejemplos |
| :--- | :--- | :--- |
| **Server Component** | Fetching de datos, acceso a BD, contenido estático | Páginas, listados, detalles |
| **Client Component** | Interactividad, hooks, APIs del navegador | Formularios, mapas, dashboards |

**Regla de Oro:** Server Components por defecto, Client Components solo cuando sea necesario.

### 4.4.2. State Management (Zustand)

```typescript
// lib/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

### 4.4.3. Formularios con React Hook Form + Zod

```typescript
// lib/validations/guia.schema.ts
import { z } from 'zod';

export const createGuiaSchema = z.object({
  codigoAwb: z.string().min(5).max(20),
  agenciaId: z.string().uuid(),
  consignatario: z.string().min(2).max(100),
  bultos: z.array(z.object({
    codigoHouse: z.string().min(3),
    numeroBulto: z.number().positive(),
    destinatarioId: z.string().uuid(),
    remitenteId: z.string().uuid(),
    pesoKg: z.number().positive(),
  })).min(1),
});
```

### 4.4.4. Autenticación en Frontend (NextAuth.js)

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: {
            persona: true,
            roles: { include: { rol: { include: { permisos: { include: { permiso: true } } } } } }
          }
        });
        if (!user) return null;
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.persona.nombreCompleto,
          roles: user.roles.map((ur) => ur.rol.nombre),
          permisos: user.roles.flatMap((ur) => ur.rol.permisos.map((rp) => ({
            recurso: rp.permiso.recurso,
            accion: rp.permiso.accion
          })))
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.roles = user.roles; token.permisos = user.permisos; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      session.user.roles = token.roles as string[];
      session.user.permisos = token.permisos as any[];
      session.user.id = token.id as string;
      return session;
    }
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET
});
```

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes: Record<string, string[]> = {
  '/dashboard': ['admin', 'operador', 'conductor'],
  '/guias': ['admin', 'operador'],
  '/clientes': ['admin', 'operador'],
  '/agencias': ['admin', 'operador'],
  '/vehiculos': ['admin', 'operador'],
  '/rutas': ['admin', 'operador'],
  '/costos': ['admin', 'contador'],
  '/rse': ['admin'],
  '/usuarios': ['admin'],
  '/reportes': ['admin', 'contador', 'operador'],
  '/analytics': ['admin', 'operador', 'contador']
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const publicPaths = ['/login', '/register', '/api/auth', '/_next', '/favicon.ico'];
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  for (const [route, requiredRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRoles = token.roles as string[] || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) return NextResponse.redirect(new URL('/unauthorized', request.url));
      break;
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'] };
```

### 4.4.5. Optimización de Rendimiento

| Técnica | Aplicación | Ejemplo |
| :--- | :--- | :--- |
| **Lazy Loading** | Componentes pesados | `next/dynamic` para `MapaBultos` |
| **Code Splitting** | Rutas automáticas | Next.js 16 con Turbopack |
| **Optimización de Imágenes** | Logos, fotos de vehículos | `next/image` con `priority` |
| **Caché de Datos** | Datos maestros | `cacheTag('guias')`, `cacheLife('hours')` |
| **Virtualización** | Listas largas | `react-window` para listas de bultos |

### 4.4.6. Accesibilidad (a11y)

El SGCI sigue las pautas **WCAG 2.1** para garantizar la accesibilidad.

| Principio | Aplicación | Ejemplo |
| :--- | :--- | :--- |
| **Perceptible** | Texto alternativo, contraste de colores | `alt` en `Image`, `aria-label` |
| **Operable** | Navegación por teclado, focus visible | `tabIndex`, `:focus-visible` |
| **Comprensible** | Lenguaje claro, etiquetas de formulario | `htmlFor`/`id` en formularios |
| **Robusto** | HTML semántico, ARIA attributes | `role`, `aria-*` |

---

## 4.5. Backend: Buenas Prácticas y Decisiones de Diseño

### 4.5.1. Estructura de API Routes

```
src/app/api/
├── auth/          # Autenticación
├── guias/         # Gestión de guías
├── bultos/        # Gestión de bultos
├── clientes/      # Gestión de clientes
├── agencias/      # Gestión de agencias
├── vehiculos/     # Gestión de vehículos
├── rutas/         # Optimización de rutas
├── costos/        # Gestión de costos
├── rse/           # RSE y Gobernanza
├── reports/       # Reportes y análisis
├── analytics/     # Analytics y BI
└── webhooks/      # Webhooks
```

### 4.5.2. Middlewares

```typescript
// lib/middleware/auth.ts
export function withAuth(handler, options = {}) {
  return async (req) => {
    const token = await getToken({ req });
    if (!token) return unauthorized();
    if (options.requiredRoles) {
      const userRoles = token.roles as string[] || [];
      const hasRole = options.requiredRoles.some(role => userRoles.includes(role));
      if (!hasRole) return forbidden();
    }
    return handler(req);
  };
}

// lib/middleware/rate-limit.ts
export function withRateLimit(handler, { windowMs = 60000, max = 10 }) {
  const store = new Map();
  return async (req) => {
    const key = req.ip + req.nextUrl.pathname;
    const now = Date.now();
    const record = store.get(key);
    if (record && record.count >= max) return rateLimitExceeded();
    store.set(key, { count: (record?.count || 0) + 1, resetTime: now + windowMs });
    return handler(req);
  };
}

// lib/middleware/cache.ts
export function withCache(handler, { ttl = 300 } = {}) {
  return async (req) => {
    if (req.method !== 'GET') return handler(req);
    const key = `cache:${req.url}`;
    const cached = await redis.get(key);
    if (cached) return NextResponse.json(JSON.parse(cached), { headers: { 'X-Cache': 'HIT' } });
    const response = await handler(req);
    const data = await response.clone().json();
    await redis.setex(key, ttl, JSON.stringify(data));
    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
  };
}
```

### 4.5.3. Manejo de Errores

```typescript
// lib/middleware/error-handler.ts
export class AppError extends Error {
  constructor(public statusCode: number, public code: string, message: string) { super(message); }
}

export function withErrorHandler(handler) {
  return async (req) => {
    try { return await handler(req); }
    catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
      }
      logger.error('Error no controlado', { error });
      return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
  };
}
```

### 4.5.4. Validación con Zod

```typescript
// lib/middleware/validate.ts
export function validateSchema(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Datos inválidos', result.error.errors);
  }
  return result.data;
}
```

### 4.5.5. Logging con Winston

```typescript
// lib/logger.ts
import winston from 'winston';
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 4.5.6. WebSockets con Socket.io

```typescript
// src/app/api/socket/route.ts
import { Server as SocketServer } from 'socket.io';
import { getToken } from 'next-auth/jwt';

let io: SocketServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    const server = (new Response() as any).socket?.server;
    io = new SocketServer(server, { path: '/api/socket', cors: { origin: '*' } });

    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      const decoded = await getToken({ req: { headers: { authorization: `Bearer ${token}` } } as any });
      if (!decoded) return next(new Error('No autorizado'));
      (socket as any).user = decoded;
      next();
    });

    io.on('connection', (socket) => {
      const user = (socket as any).user;

      socket.on('gps:update', async (data) => {
        const { vehicleId, latitude, longitude, speed } = data;
        await prisma.vehiculoUbicacion.create({ data: { vehiculoId: vehicleId, latitud: latitude, longitud: longitude, velocidad: speed } });
        socket.to(`vehicle-${vehicleId}`).emit('gps:position', data);
      });

      socket.on('delivery:confirm', async (data) => {
        const { bultoId, estado, observaciones } = data;
        const bulto = await prisma.bulto.update({ where: { id: bultoId }, data: { estado, observaciones, fechaEntregaReal: estado === 'entregado' ? new Date() : undefined } });
        socket.to(`client-${bulto.destinatarioId}`).emit('delivery:status', { bultoId: bulto.codigoHouse, estado });
      });
    });
  }
  return new Response('Socket.io server running', { status: 200 });
}
```

---

## 4.6. Plan de Implementación y Despliegue

### 4.6.1. Fases del Proyecto

| Fase | Semanas | Actividades Clave | Tablas | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 0** | 1-8 | Planificación, diseño de arquitectura, modelo de datos | Ninguna | ⏳ En curso |
| **Fase 1** | 9-12 | Configuración Docker, autenticación JWT, roles | 5 tablas | ⏳ Pendiente |
| **Fase 2** | 13-16 | Gestión de guías, bultos, clientes, agencias | 8 tablas | ⏳ Pendiente |
| **Fase 3** | 17-20 | Gestión de vehículos, conductores, VRP/VRPTW | 5 tablas | ⏳ Pendiente |
| **Fase 4** | 21-24 | GPS, app móvil offline-first, notificaciones | 5 tablas | ⏳ Pendiente |
| **Fase 5** | 25-28 | Costos, RSE, inventarios, taller, reportes | 14 tablas | ⏳ Pendiente |
| **Fase 6** | 29-32 | Interoperabilidad, validación empírica | 3 tablas | ⏳ Pendiente |
| **Fase 7** | 33-40 | Analytics y BI (Data Warehouse, ML) | 10 tablas | ⏳ Pendiente |

### 4.6.2. Asignación de Recursos

| Rol | Responsabilidad | Persona | Estado |
| :--- | :--- | :--- | :--- |
| **Investigador/Dueño** | Definición de requisitos, validación | Osleyder González | ✅ Activo |
| **Desarrollador Backend** | API, BD, algoritmos, integraciones | Asistente IA | ⏳ Pendiente |
| **Desarrollador Frontend** | Dashboard, mapas, UI | Asistente IA | ⏳ Pendiente |
| **Data Scientist** | Modelos ML, Data Warehouse | Asistente IA | ⏳ Pendiente |
| **Tester** | Pruebas unitarias, integración, seguridad | Asistente IA | ⏳ Pendiente |

### 4.6.3. Análisis de Costos

| Concepto | Costo | Nota |
| :--- | :--- | :--- |
| **VPS (4 vCPU, 8 GB RAM, 120 GB SSD)** | $20-40 USD/mes | DigitalOcean, Vultr |
| **Dominio (.com)** | $12-15 USD/año | Registrador de dominios |
| **SSL** | $0 | Let's Encrypt |
| **Geocodificación** | $0 | LocationIQ (5,000/día) |
| **Mapas** | $0 | OpenStreetMap |
| **Rutas** | $0 | OSRM |
| **Costo Total** | **$25-45 USD/mes** | |

---

## 4.7. Documentación Técnica

**Objetivo:** Proporcionar guías técnicas completas para el desarrollo, mantenimiento y evolución del SGCI, facilitando la incorporación de nuevos desarrolladores y asegurando la consistencia del código.

**Estado:** ⏳ **Pendiente de elaboración** (Fase 8)

### 4.7.1. Guía de Desarrollo

#### 4.7.1.1. Requisitos del Sistema

| Requisito | Versión Mínima | Versión Recomendada | Nota |
| :--- | :--- | :--- | :--- |
| **Node.js** | 20.9.0 | 22.x | Necesario para Next.js 16 |
| **PostgreSQL** | 16.0 | 16.15 | Con PostGIS 3.5.0 |
| **Docker** | 24.0 | 27.x | Para entorno de desarrollo |
| **Git** | 2.40 | 2.45 | Control de versiones |
| **VS Code** | 1.80 | 1.92 | IDE recomendado |

#### 4.7.1.2. Configuración del Entorno de Desarrollo

**Paso 1: Clonar el Repositorio**

```bash
git clone https://github.com/setaexpreso/sgci.git
cd sgci
```

**Paso 2: Instalar Dependencias**

```bash
pnpm install
```

**Paso 3: Configurar Variables de Entorno**

```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

**Paso 4: Levantar Servicios con Docker**

```bash
docker-compose -f docker/docker-compose.dev.yml up -d
docker-compose ps
```

**Paso 5: Configurar Base de Datos**

```bash
pnpm prisma migrate dev
pnpm prisma studio
```

**Paso 6: Iniciar el Servidor de Desarrollo**

```bash
pnpm dev
# La aplicación estará disponible en http://localhost:3000
```

### 4.7.2. Guía de Estilo de Código

#### 4.7.2.1. TypeScript/JavaScript

| Regla | Correcto | Incorrecto |
| :--- | :--- | :--- |
| Usar `const` | `const name = 'John';` | `let name = 'John';` |
| Template strings | `` `Hello ${name}` `` | `'Hello ' + name` |
| Arrow functions | `const fn = () => {}` | `function fn() {}` |

**Nombres:**

| Tipo | Convención | Ejemplo |
| :--- | :--- | :--- |
| Archivos | kebab-case | `user-profile.tsx` |
| Componentes | PascalCase | `UserProfile` |
| Funciones | camelCase | `getUserById` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES` |

### 4.7.3. Guía de API

**Estructura:**

```typescript
export const GET = withAuth(
  withCache(async (req) => {
    const params = validateSchema(listGuiasSchema, Object.fromEntries(new URL(req.url).searchParams));
    const [guias, total] = await Promise.all([
      prisma.guia.findMany({ where: { /* filtros */ }, skip: (params.page - 1) * params.limit, take: params.limit }),
      prisma.guia.count({ where: { /* filtros */ } })
    ]);
    return NextResponse.json({ data: guias, meta: { total, page: params.page, limit: params.limit } });
  }, { ttl: 300 }),
  { requiredRoles: ['admin', 'operador'] }
);
```

**Códigos de Error:**

| Código | Descripción |
| :--- | :--- |
| 400 | Validación fallida |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto |
| 429 | Demasiadas peticiones |
| 500 | Error interno |

### 4.7.4. Guía de Base de Datos

**Migraciones:**

```bash
pnpm prisma migrate dev --name add_fecha_digitalizacion
pnpm prisma migrate deploy
```

**Buenas Prácticas:**

```typescript
// ✅ Select específico
const guias = await prisma.guia.findMany({ select: { id: true, codigoAwb: true } });
// ❌ Traer datos innecesarios
const guias = await prisma.guia.findMany({ include: { bultos: true } });

// ✅ Transacción
await prisma.$transaction(async (tx) => {
  const guia = await tx.guia.create({ data: { ... } });
  const bultos = await tx.bulto.createMany({ data: bultosData });
  return { guia, bultos };
});
```

### 4.7.5. Guía de Despliegue

**Requisitos del Servidor:**

| Recurso | Mínimo           | Recomendado      |
| :------ | :--------------- | :--------------- |
| CPU     | 2 vCPU           | 4 vCPU           |
| RAM     | 4 GB             | 8 GB             |
| Disco   | 50 GB SSD        | 120 GB SSD       |
| SO      | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

**Despliegue:**

```bash
bash scripts/setup-vps.sh
bash scripts/deploy.sh latest
bash scripts/rollback.sh previous
```

---

## 4.8. Diagramas UML Detallados

**Objetivo:** Proporcionar una representación visual completa del sistema utilizando diagramas UML para facilitar la comprensión de la arquitectura, los flujos de negocio y las relaciones entre componentes.

**Estado:** ⏳ **Pendiente de elaboración** (Fase 0 - Diseño)

### 4.8.1. Diagrama de Clases - Core del Sistema

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      DIAGRAMA DE CLASES - SGCI (CORE)                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                      MÓDULO DE PERSONAS Y CLIENTES                                              │ │
│  │  ┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────────────┐                   │ │
│  │  │        Persona          │     │        Cliente           │     │       Trabajador        │                   │ │
│  │  ├─────────────────────────┤     ├──────────────────────────┤     ├─────────────────────────┤                   │ │
│  │  │ - id: String            │1    │ - id: String             │1    │ - id: String            │                   │ │
│  │  │ - nombreCompleto: String│◄───►│ - personaId: String      │◄───►│ - personaId: String     │                   │ │
│  │  │ - ci: String            │     │ - tipoIdentificacion     │     │ - tipoTrabajador: Enum  │                   │ │
│  │  │ - telefonoPrincipal     │     │ - nit: String            │     │ - licencia: String      │                   │ │
│  │  │ - telefonoSecundario    │     │ - tipoCliente: Enum      │     │ - categoriaLicencia     │                   │ │
│  │  │ - email: String         │     │ - direccionId: String    │     │ - fechaContratacion     │                   │ │
│  │  │ - tipoPersona: Enum     │     ├──────────────────────────┤     │ - fechaTerminacion      │                   │ │
│  │  │ - razonSocial: String   │     │ + getBultosRemitente()   │     │ - estado: Enum          │                   │ │
│  │  ├─────────────────────────┤     │ + getBultosDestinatario()│     ├─────────────────────────┤                   │ │
│  │  │ + getCliente()          │     │ + getIngresos()          │     │ + getViajesConductor()  │                   │ │
│  │  │ + getTrabajador()       │     │ + getOrdenesTrabajo()    │     │ + getViajesChofer()     │                   │ │
│  │  │ + getUsuario()          │     │ + getVentasRepuestos()   │     │ + getPersona()          │                   │ │
│  │  │ + getDirecciones()      │     └──────────────────────────┘     └─────────────────────────┘                   │ │
│  │  └─────────────────────────┘              │                              │                                      │ │
│  │              │                            │                              │                                      │ │
│  │              ▼                            ▼                              ▼                                      │ │
│  │  ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐                    │ │
│  │  │       Direccion         │     │     AgenciaEnvios       │     │        Usuario          │                    │ │
│  │  ├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤                    │ │
│  │  │ - id: String            │1    │ - id: String            │1    │ - id: String            │                    │ │
│  │  │ - personaId: String     │◄───►│ - nombre: String        │◄───►│ - personaId: String     │                    │ │
│  │  │ - calle: String         │     │ - nit: String           │     │ - nombreUsuario: String │                    │ │
│  │  │ - numeroCasa: String    │     │ - telefonoPrincipal     │     │ - passwordHash: String  │                    │ │
│  │  │ - edificio: String      │     │ - telefonoSecundario    │     │ - email: String         │                    │ │
│  │  │ - apto: String          │     │ - email: String         │     │ - ultimoAcceso          │                    │ │
│  │  │ - municipio: String     │     │ - direccionId: String   │     │ - estado: Enum          │                    │ │
│  │  │ - provincia: String     │     │ - pais: String          │     ├─────────────────────────┤                    │ │
│  │  │ - latitud: Float        │     │ - personaContacto       │     │ + autenticar()          │                    │ │
│  │  │ - longitud: Float       │     ├─────────────────────────┤     │ + cambiarRol()          │                    │ │
│  │  ├─────────────────────────┤     │ + getGuias()            │     │ + getRoles()            │                    │ │
│  │  │ + getPersona()          │     │ + getContratos()        │     │ + getPermisos()         │                    │ │
│  │  │ + geolocalizar()        │     └─────────────────────────┘     └─────────────────────────┘                    │ │
│  │  └─────────────────────────┘                                                                                    │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                      MÓDULO DE GUÍAS Y BULTOS                                                   │ │
│  │  ┌─────────────────────────┐         ┌─────────────────────────┐         ┌─────────────────────────┐            │ │
│  │  │         Guia            │1        │         Bulto           │1        │         Viaje           │            │ │
│  │  ├─────────────────────────┤◄───────►├─────────────────────────┤◄───────►├─────────────────────────┤            │ │
│  │  │ - id: String            │         │ - id: String            │         │ - id: String            │            │ │
│  │  │ - codigoAwb: String     │         │ - guiaId: String        │         │ - vehiculoId: String    │            │ │
│  │  │ - agenciaId: String     │         │ - codigoHouse: String   │         │ - conductorId: String   │            │ │
│  │  │ - fechaEmision: Date    │         │ - numeroBulto: Int      │         │ - choferId: String      │            │ │
│  │  │ - fechaImportacion      │         │ - destinatarioId        │         │ - houseIds: JSON        │            │ │
│  │  │ - pesoTotalKg: Float    │         │ - remitenteId: String   │         │ - fechaSalida: Date     │            │ │
│  │  │ - cantidadBultos: Int   │         │ - naturaleza: String    │         │ - fechaLlegada: Date    │            │ │
│  │  │ - consignatario: String │         │ - pesoKg: Float         │         │ - kmRecorridos: Float   │            │ │
│  │  │ - estado: Enum          │         │ - cantidadBultos: Int   │         │ - combustibleGastado    │            │ │
│  │  │ - paisOrigen: String    │         │ - ubicacionActual       │         │ - estadoViaje: Enum     │            │ │
│  │  │ - ubicacionActual       │         │ - estado: Enum          │         ├─────────────────────────┤            │ │
│  │  ├─────────────────────────┤         │ - importeAduana: Float  │         │ + calcularDistancia()   │            │ │
│  │  │ + getBultos()           │         │ - monedaAduana: String  │         │ + calcularConsumo()     │            │ │
│  │  │ + getAgencia()          │         │ - observaciones: String │         │ + getVehiculo()         │            │ │
│  │  │ + actualizarEstado()    │         ├─────────────────────────┤         │ + getConductor()        │            │ │
│  │  │ + getTracking()         │         │ + getGuia()             │         │ + getRuta()             │            │ │
│  │  └─────────────────────────┘         │ + getDestinatario()     │         └─────────────────────────┘            │ │
│  │                                      │ + getRemitente()        │                    │                           │ │
│  │                                      │ + getViaje()            │                    ▼                           │ │
│  │                                      └─────────────────────────┘           ┌─────────────────────────┐          │ │
│  │                                                                            │         Ruta            │          │ │
│  │  ┌─────────────────────────┐          ┌─────────────────────────┐          ├─────────────────────────┤          │ │
│  │  │   WebScrapingPendiente  │          │    WebScrapingLog       │          │ - id: String            │          │ │
│  │  ├─────────────────────────┤          ├─────────────────────────┤          │ - viajeId: String       │          │ │
│  │  │ - id: String            │          │ - id: String            │          │ - origenLat: Float      │          │ │
│  │  │ - guiaId: String        │          │ - guiaId: String        │          │ - origenLng: Float      │          │ │
│  │  │ - estado: Enum          │          │ - urlConsultada         │          │ - destinoLat: Float     │          │ │
│  │  │ - intentos: Int         │          │ - codigoRespuesta       │          │ - destinoLng: Float     │          │ │
│  │  │ - proximoIntento        │          │ - estadoDetectado       │          │ - puntosEntregaLat      │          │ │
│  │  └─────────────────────────┘          │ - payloadRespuesta      │          │ - puntosEntregaLng      │          │ │
│  │                                       └─────────────────────────┘          │ - puntosEntregaDir      │          │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                      MÓDULO DE VEHÍCULOS Y RUTAS                                                │ │
│  │  ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐                    │ │
│  │  │        Vehiculo         │     │      VehiculoUbicacion  │     │    RutaModificacion     │                    │ │
│  │  ├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤                    │ │
│  │  │ - id: String            │1    │ - id: String            │1    │ - id: String            │                    │ │
│  │  │ - placa: String         │◄───►│ - vehiculoId: String    │◄───►│ - rutaId: String        │                    │ │
│  │  │ - marca: String         │     │ - latitud: Float        │     │ - tipoModificacion: Enum│                    │ │
│  │  │ - modelo: String        │     │ - longitud: Float       │     │ - paquetesAfectados     │                    │ │
│  │  │ - capacidadToneladas    │     │ - velocidad: Float      │     │ - usuarioModificadorId  │                    │ │
│  │  │ - tipoCombustible: Enum │     │ - direccion: String     │     │ - timestampModificacion │                    │ │
│  │  │ - consumoKmEstimado     │     │ - timestamp: Date       │     └─────────────────────────┘                    │ │
│  │  │ - depreciacionDiaria    │     └─────────────────────────┘                                                    │ │
│  │  │ - estado: Enum          │                                                                                    │ │
│  │  ├─────────────────────────┤                                                                                    │ │
│  │  │ + getViajes()           │                                                                                    │ │
│  │  │ + getUbicaciones()      │                                                                                    │ │
│  │  │ + calcularConsumo()     │                                                                                    │ │
│  │  └─────────────────────────┘                                                                                    │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.8.2. Diagrama de Estados - Bulto (11 Estados)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            DIAGRAMA DE ESTADOS - BULTO                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                         CREADO                          │                    │
│                                      │  - Bulto registrado en el sistema                       │                    │
│                                      │  - Código House asignado                                │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                         ENVIADO                         │                    │
│                                      │  - Bulto en tránsito a Cuba                             │                    │
│                                      │  - Fecha de envío registrada                            │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                         ARRIBO                          │                    │
│                                      │  - Bulto ha llegado a Cuba                              │                    │
│                                      │  - Fecha de arribo registrada                           │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                              ┌──────────────────────────────────┴─────────────────────────────────┐                 │
│                              │                                  │                                 │                 │
│                              ▼                                  ▼                                 ▼                 │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐  ┌───────────────────────┐│
│  │              PRESENCIAL                 │  │          FALTANTE_ORIGEN                │  │   PROCESO_ADUANA      ││
│  │  - Bulto en presencial (Aerovaradero)   │  │  - Bulto no encontrado en origen        │  │  - En proceso aduanero││
│  └─────────────────────────────────────────┘  └─────────────────────────────────────────┘  └───────────────────────┘│
│                              │                                  │                                 │                 │
│                              └──────────────────────────────────┬─────────────────────────────────┘                 │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                        FACTURADO                        │                    │
│                                      │  - Facturado en Aerovaradero                            │                    │
│                                      │  - Importe y moneda registrados                         │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                         RECIBIDO                        │                    │
│                                      │  - Recibido por el transportista                        │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                  PROCESO_TRANSPORTACION                 │                    │
│                                      │  - En transporte hacia destino final                    │                    │
│                                      │  - Asignado a un viaje                                  │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                   PROCESO_ENTREGA                       │                    │
│                                      │  - En proceso de entrega final                          │                    │
│                                      │  - Conductor asignado                                   │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
│                                                                 │                                                   │
│                              ┌──────────────────────────────────┴──────────────────────────────────┐                │
│                              │                                  │                                  │                │
│                              ▼                                  ▼                                  ▼                │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐  ┌─────────────────────┐  │
│  │              ENTREGADO                  │  │          NO_ENTREGADO                   │  │                     │  │
│  │  - Entregado al destinatario            │  │  - No pudo ser entregado                │  │                     │  │
│  │  - Fecha de entrega real registrada     │  │  - Observaciones registradas            │  │                     │  │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────────┘  └─────────────────────┘  │
│                              │                                  │                                  │                │
│                              └──────────────────────────────────┬──────────────────────────────────┘                │
│                                                                 │                                                   │
│                                                                 ▼                                                   │
│                                      ┌─────────────────────────────────────────────────────────┐                    │
│                                      │                       ARCHIVADO                         │                    │
│                                      │  - Bulto archivado para trazabilidad                    │                    │
│                                      │  - No se puede modificar                                │                    │
│                                      └─────────────────────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.8.3. Diagrama de Estados - Guía (11 Estados)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            DIAGRAMA DE ESTADOS - GUÍA                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                         CREADA                          │                     │
│                                      │  - Guía registrada en el sistema                        │                     │
│                                      │  - Código AWB asignado                                  │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                         ENVIADA                         │                     │
│                                      │  - Carga en tránsito a Cuba                             │                     │
│                                      │  - Fecha de envío registrada                            │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                         ARRIBO                          │                     │
│                                      │  - Carga ha llegado a Cuba                              │                     │
│                                      │  - Fecha de arribo registrada                           │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                   PROCESO_ADUANA                        │                     │
│                                      │  - Carga en proceso aduanero                            │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                        FACTURADA                        │                     │
│                                      │  - Carga facturada en Aerovaradero                      │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                        RECIBIDA                         │                     │
│                                      │  - Carga recibida por el transportista                  │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                  EN_PROCESO_SALIDA                      │                     │
│                                      │  - Carga en proceso de salida                           │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                PROCESO_TRANSPORTACION                   │                     │
│                                      │  - Carga en transporte hacia destino final              │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                   PROCESO_ENTREGA                       │                     │
│                                      │  - Carga en proceso de entrega final                    │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                 │                                                    │
│                              ┌──────────────────────────────────┴─────────────────────────────────┐                  │
│                              │                                  │                                 │                  │
│                              ▼                                  ▼                                 ▼                  │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐  ┌─────────────────────┐   │
│  │              ENTREGADA                  │  │      PARCIALMENTE_ENTREGADA             │  │                     │   │
│  │  - Todos los bultos entregados          │  │  - Algunos bultos entregados            │  │                     │   │
│  │  - Fecha de entrega registrada          │  │  - Otros pendientes o no entregados     │  │                     │   │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────────┘  └─────────────────────┘   │
│                              │                                  │                                  │                 │           
│                              │                                  │                                  │                 │
│                              └──────────────────────────────────┬──────────────────────────────────┘                 │
│                                                                 │                                                    │
│                                                                 ▼                                                    │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                        ARCHIVADA                        │                     │
│                                      │  - Guía archivada para trazabilidad                     │                     │
│                                      │  - No se puede modificar                                │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.8.4. Diagrama de Despliegue (Resumen)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            DIAGRAMA DE DESPLIEGUE - SGCI                                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                    INTERNET                             │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                   │                                                  │
│                                                                   ▼                                                  │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                   CLOUD / VPS                           │                     │
│                                      │              (DigitalOcean, Vultr, etc.)                │                     │
│                                      │               4 vCPU, 8 GB RAM, 120 GB SSD              │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                   │                                                  │
│                                                                   ▼                                                  │
│                                      ┌─────────────────────────────────────────────────────────┐                     │
│                                      │                  DOCKER HOST                            │                     │
│                                      │                  Ubuntu 22.04 LTS                       │                     │
│                                      │                    Docker 27.x                          │                     │
│                                      └─────────────────────────────────────────────────────────┘                     │
│                                                                   │                                                  │
│                              ┌────────────────────────────────────┼──────────────────────────────────┐               │
│                              │                                    │                                  │               │
│                              ▼                                    ▼                                  ▼               │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐  ┌─────────────────────┐   │
│  │              PROXY INVERSO              │  │           BASE DE DATOS                 │  │      CACHÉ Y COLA   │   │
│  │              (Nginx:1.27)               │  │     (PostgreSQL 16.15 + PostGIS 3.5.0)  │  │     (Redis 7.4)     │   │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────────┘  └─────────────────────┘   │
│                     │                                                                                                │
│                     ▼                                                                                                │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐  ┌─────────────────────┐   │
│  │            APLICACIÓN WEB               │  │           SERVICIO DE RUTAS             │  │     SEGUIMIENTO     │   │
│  │         (Next.js 16.2.6)                │  │         (OSRM v5.25.0)                  │  │     (Traccar 6.14)  │   │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────────┘  └─────────────────────┘   │
│                     │                                                                                                │
│                     ▼                                                                                                │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐  ┌─────────────────────┐   │
│  │              MONITOREO                  │  │           LOGGING CENTRALIZADO          │  │      BI DASHBOARDS  │   │
│  │         (Prometheus + Grafana)          │  │             (Loki + Promtail)           │  │      (Superset)     │   │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────────┘  └─────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.9. Conclusión del Capítulo 4

El presente capítulo ha presentado el diseño detallado del Sistema de Gestión Contextualmente Inteligente (SGCI), estructurado en una arquitectura de tres capas (Frontend, Backend, Base de Datos) con servicios externos integrados, incluyendo documentación técnica completa y diagramas UML detallados.

**Estado Actual del Desarrollo (25/08/2026):**

| Módulo | Estado | Observaciones |
| :--- | :--- | :--- |
| **Gestión de Agencias** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Gestión de Clientes** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Gestión de Guías** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Gestión de Bultos** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Importación de Manifiestos** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Geocodificación** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Web Scraping (Aerovaradero)** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Tracking de Envíos** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 2) |
| **Optimización de Rutas** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 3) |
| **Gestión de Vehículos** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 3) |
| **Gestión de Conductores** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 3) |
| **App Móvil** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 4) |
| **Costos y Finanzas** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 5) |
| **RSE y Gobernanza** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 5) |
| **Interoperabilidad** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 6) |
| **Reportes y Análisis** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 5) |
| **Analytics y BI** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 7) |
| **Documentación Técnica** | ⏳ Pendiente | Diseño completado, pendiente de implementación (Fase 8) |
| **Diagramas UML** | ⏳ Pendiente | Diseño completado, pendiente de generación |

**Próximos Pasos:**
1. Inicio de la Fase 1: Configuración del entorno de desarrollo.
2. Implementación de la autenticación y roles básicos.
3. Desarrollo incremental de los módulos funcionales.
4. Generación de diagramas UML detallados en formato digital.

---

## 4.10. Documentos Complementarios Relacionados

Este capítulo se complementa con los siguientes documentos:

### Nivel 0: Documentos Base (Referencia Obligatoria)

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `README.md` | Visión general del proyecto y guía de navegación documental | `./README.md` |
| `REQUISITOS.md` | Requisitos funcionales y no funcionales del sistema | `./REQUISITOS.md` |
| `GLOSSARY.md` | Glosario de términos clave | `./GLOSSARY.md` |
| `STYLE_GUIDE.md` | Guía de estilo de código | `./STYLE_GUIDE.md` |

### Nivel 2: Documentos Complementarios (Detalle Técnico)

#### Arquitectura y Diseño

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `DIAGRAMAS_SECUENCIA.md` | Diagramas de secuencia de 5 flujos principales | `./diagrams/DIAGRAMAS_SECUENCIA.md` |
| `CACHE_STRATEGY.md` | Estrategia de caché en frontend | `./frontend/CACHE_STRATEGY.md` |
| `OFFLINE_PATTERNS.md` | Patrones de UI para Offline-First | `./mobile/OFFLINE_PATTERNS.md` |
| `SYNC_STRATEGY.md` | Estrategia de sincronización Offline-First | `./mobile/SYNC_STRATEGY.md` |
| `OFFLINE_DATA.md` | Manejo de datos offline y retención | `./mobile/OFFLINE_DATA.md` |
| `IOS_ANDROID.md` | Diferencias iOS vs Android | `./mobile/IOS_ANDROID.md` |

#### Base de Datos

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `ZERO_DOWNTIME.md` | Migraciones Zero-Downtime | `./database/ZERO_DOWNTIME.md` |
| `PARTITIONING.md` | Particionamiento avanzado | `./database/PARTITIONING.md` |
| `ROLLBACK.md` | Estrategia de rollback de migraciones | `./database/ROLLBACK.md` |
| `ENCRYPTION.md` | Estrategia de encriptación (AES-256 + TDE) | `./security/ENCRYPTION.md` |

#### Seguridad y Rendimiento

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `RATE_LIMITING.md` | Rate limiting por endpoint (100/500 req/min) | `./api/RATE_LIMITING.md` |
| `CIRCUIT_BREAKER.md` | Circuit Breaker para servicios externos | `./api/CIRCUIT_BREAKER.md` |
| `SECURITY_TESTS.md` | Pruebas de seguridad (SQL, XSS, CSRF, Autenticación) | `./testing/SECURITY_TESTS.md` |
| `PERFORMANCE_TESTS.md` | Pruebas de rendimiento con k6 | `./testing/PERFORMANCE_TESTS.md` |

#### Pruebas y Validación

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `FIELD_TESTS.md` | Pruebas en campo con dispositivos reales | `./testing/FIELD_TESTS.md` |
| `OFFLINE_TESTS.md` | Pruebas de componentes offline | `./testing/OFFLINE_TESTS.md` |

#### Calidad de Código

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `TECHNICAL_DEBT.md` | Gestión de deuda técnica (20% de cada sprint) | `./quality/TECHNICAL_DEBT.md` |

#### Comercialización

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `CUSTOMER_RETENTION.md` | Estrategia de retención de clientes | `./commercial/CUSTOMER_RETENTION.md` |
| `COMMERCIAL_METRICS.md` | Métricas de éxito comercial (MRR, CAC, LTV, Churn) | `./commercial/COMMERCIAL_METRICS.md` |
| `DYNAMIC_PRICING.md` | Estrategia de precios dinámica | `./commercial/DYNAMIC_PRICING.md` |

### Nivel 3: Documentación de API

| Documento | Descripción | Ubicación |
| :--- | :--- | :--- |
| `OPENAPI.yaml` | Especificación OpenAPI 3.0 de la API REST | `./api/OPENAPI.yaml` |

**Para una navegación completa de toda la documentación, consulte el `README.md` que contiene la guía de lectura por rol y la estructura documental detallada.**

---

## Referencias del Capítulo 4

- Beck, K., et al. (2001). *Manifesto for Agile Software Development*. Agile Alliance.
- Contraloría General de la República. (2025). *Ley 127/2025: Ley del Sistema de Control y Fiscalización*. La Habana: CGR.
- Cordeau, J. F., et al. (2024). A comparative study of metaheuristics for the vehicle routing problem with time windows. *Transportation Science*, 58(2), 345-365.
- Crainic, T. G., & Laporte, G. (2016). *Transportation Management Systems: State of the Art and Future Directions*. Springer.
- Figliozzi, M. A. (2012). The impacts of congestion on commercial vehicle tour characteristics and costs. *Transportation Research Part E*, 48(1), 329-342.
- Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code* (2nd ed.). Addison-Wesley.
- Kumar, R., & Mukherjee, S. (2023). *Offline-First Web Development: Building Resilient Applications*. O'Reilly Media.
- O'Brien, J. A., & Marakas, G. M. (2018). *Management Information Systems* (15th ed.). McGraw-Hill.
- Romney, M. B., & Steinbart, P. J. (2021). *Accounting Information Systems* (15th ed.). Pearson.
- Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. Scrum.org.
- Toth, P., & Vigo, D. (2014). *Vehicle Routing: Problems, Methods, and Applications* (2nd ed.). SIAM.
- UML. (2026). *Unified Modeling Language Specification*. Object Management Group.

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 11.0 (Actualización de referencias a documentos complementarios y estructura documental)
**Estado del Proyecto:** Fase 0 - Planificación y Diseño Inicial

---

## RESUMEN DE CAMBIOS REALIZADOS EN EL CAPÍTULO 4 (VERSIÓN 11.0)

| Sección | Cambio Realizado | Justificación |
| :----------------------------------------------- | :--- | :--- |
| **4.10 Documentos Complementarios Relacionados** | **NUEVA SECCIÓN** | Unificar la referencia a todos los documentos complementarios del proyecto |
| **4.10 Documentos Complementarios Relacionados** | Tabla de **Nivel 0: Documentos Base** | Incluir README.md, REQUISITOS.md, GLOSSARY.md y STYLE_GUIDE.md |
| **4.10 Documentos Complementarios Relacionados** | Tabla de **Nivel 2: Documentos Complementarios** | Referenciar los 20 documentos organizados por categoría |
| **4.10 Documentos Complementarios Relacionados** | Tabla de **Nivel 3: Documentación de API** | Referenciar OPENAPI.yaml |
| **4.10 Documentos Complementarios Relacionados** | Nota final sobre `README.md` | Guiar al lector hacia la guía de navegación completa |
| **Versión**                                      | 10.0 → **11.0**              | Nueva versión con estructura de referencias completa |