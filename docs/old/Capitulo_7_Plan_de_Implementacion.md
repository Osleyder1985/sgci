# Capítulo 7: Plan de Implementación (VERSIÓN FINAL COMPLETA CON DEVOPS, INFRAESTRUCTURA, CALIDAD DE CÓDIGO, GUÍA DE ESTILO Y GUÍA DE DESPLIEGUE - 10/10 - 25/08/2026)

---

## 7.1. Metodología de Desarrollo y Gobernanza del Proyecto

### 7.1.1. Metodología de Desarrollo: Scrum

El desarrollo del SGCI se regirá por la metodología **Scrum**, con **sprints de 2 semanas de duración**. Esta metodología ágil es la más adecuada para un proyecto de esta naturaleza, ya que permite una entrega incremental de valor, una adaptación rápida a los cambios y una comunicación fluida entre los miembros del equipo (Schwaber & Sutherland, 2020).

**Estructura del Equipo Scrum:**

| Rol | Responsable | Responsabilidades |
| :--- | :--- | :--- |
| **Product Owner** | Director de Seta Expreso (Osleyder González Acosta) | Definir y priorizar el backlog del producto |
| **Scrum Master** | Jefe de Operaciones | Facilitar el proceso Scrum, eliminar impedimentos |
| **Development Team** | **Asistente IA** (bajo supervisión del Investigador) | Implementación técnica del sistema |

**Ciclo de Desarrollo:**

1. **Sprint Planning:** Al inicio de cada sprint, el equipo define los objetivos del sprint y selecciona las tareas del backlog a desarrollar.
2. **Daily Stand-ups:** Reuniones diarias de 15 minutos para sincronizar el trabajo y eliminar bloqueos.
3. **Sprint Review:** Al final de cada sprint, se presenta el trabajo completado al Product Owner y se recogen sugerencias.
4. **Sprint Retrospective:** El equipo reflexiona sobre el sprint y propone mejoras para el siguiente.

### 7.1.2. Estrategia de Implementación Incremental (YAGNI)

El SGCI se desarrollará siguiendo un enfoque **incremental y por funcionalidades completas**, tal como se definió en el Capítulo 4 (Sección 4.1.2). Esto significa que:

1. **No se implementa nada que no se vaya a utilizar inmediatamente.**
2. **No se crean tablas en la base de datos hasta que el código que las necesita está listo.**
3. **Cada iteración entrega una funcionalidad completa y operativa.**

**Principio YAGNI (You Aren't Gonna Need It):** Este principio establece que no se debe añadir funcionalidad hasta que sea necesaria. En el contexto del SGCI, esto significa que no se crearán tablas, endpoints o componentes de interfaz de usuario hasta que la funcionalidad que los requiere esté siendo implementada en esa iteración específica.

**Tabla 7.0: Matriz de Trazabilidad - Tablas por Fase de Implementación (37 tablas)**

| Fase | Período | Funcionalidad | Tablas a Crear |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Meses 3-5 | Autenticación, roles, permisos, auditoría | `usuarios`, `roles`, `permisos`, `roles_permisos`, `auditoria` |
| **Fase 2** | Meses 6-8 | Gestión de guías, bultos, clientes, agencias, importación de manifiestos, geocodificación, web scraping | `personas`, `clientes`, `direcciones`, `agencias_envios`, `guias`, `bultos`, `web_scraping_pendiente`, `web_scraping_log` |
| **Fase 3** | Meses 9-11 | Gestión de vehículos, conductores, optimización de rutas (VRP/VRPTW) | `vehiculos`, `trabajadores`, `viajes`, `rutas`, `rutas_modificaciones` |
| **Fase 4** | Meses 12-14 | Seguimiento GPS (Traccar 6.14), app móvil offline-first, notificaciones | `vehiculo_ubicaciones`, `geocercas`, `sincronizacion_pendiente`, `conflictos_offline`, `notificaciones` |
| **Fase 5** | Meses 15-16 | Costos, fichas de costo, tasas de cambio, RSE, roles dinámicos, inventarios, taller | `fichas_costo`, `fichas_costo_partidas`, `ingresos`, `gastos`, `tasas_cambio`, `proveedores`, `contratos`, `reservas_voluntarias`, `proyectos_rse`, `actividades_prohibidas`, `repuestos`, `movimientos_inventario`, `ordenes_trabajo`, `ventas_repuestos` |
| **Fase 6** | Meses 17-18 | Interoperabilidad (API abierta), integración con sistemas externos (Aduana, MITRANS, agencias), validación empírica | `integraciones`, `logs_api`, `webhooks` |

---

## 7.2. Fases del Proyecto

El proyecto de implementación del Sistema de Gestión Contextualmente Inteligente (SGCI) se ha estructurado en **10 fases**, con una duración total estimada de **52 semanas** (aproximadamente 1 año).

**ESTADO ACTUAL DEL PROYECTO (25/08/2026):** El proyecto se encuentra en **Fase 0: Planificación y Diseño Inicial**. No existe implementación previa. Todas las fases de implementación (Fases 1-10) están pendientes de ejecución.

| Fase | Semanas | Actividades Clave | Tablas a Crear | Entregables | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fase 0: Planificación y Diseño Inicial** | 1-8 | • Definición de requisitos<br>• Diseño de arquitectura<br>• Diseño de modelo de datos (37 tablas - blueprint) | Ninguna (diseño) | Documento de diseño aprobado (Capítulos 1-8) | ⏳ **En curso** |
| **Fase 1: Configuración del Entorno** | 9-12 | • Instalación y configuración del servidor (VPS o local)<br>• Instalación de PostgreSQL 16.15 + PostGIS 3.5.0<br>• Configuración del repositorio Git y del entorno de desarrollo (VS Code, Docker)<br>• Instalación de dependencias del proyecto (Next.js 16.2.6, Prisma 7.9.1, etc.)<br>• **Configuración de herramientas de calidad de código (ESLint, Prettier, Husky)** | Ninguna | Entorno de desarrollo funcional<br>Repositorio configurado<br>Base de datos creada<br>Calidad de código configurada | ⏳ **Pendiente** |
| **Fase 2: Modelo de Datos y Migraciones** | 13-16 | • Implementación del modelo de datos (37 tablas) en Prisma<br>• Creación de migraciones y aplicación a la base de datos<br>• Inserción de datos maestros (roles, permisos, actividades prohibidas, etc.) | `usuarios`, `roles`, `permisos`, `roles_permisos`, `auditoria` | Modelo de datos implementado<br>Base de datos poblada con datos maestros | ⏳ **Pendiente** |
| **Fase 3: API de Gestión de Guías y Manifiestos** | 17-20 | • Desarrollo de la API para importar manifiestos (Excel/CSV)<br>• Desarrollo de la API para gestionar guías (CRUD)<br>• Desarrollo de la API para gestionar bultos (house)<br>• Desarrollo de la API para gestionar clientes (remitentes, destinatarios, agencias)<br>• Desarrollo de geocodificación (LocationIQ + Nominatim)<br>• Desarrollo de web scraping (Aerovaradero) | `personas`, `clientes`, `direcciones`, `agencias_envios`, `guias`, `bultos`, `web_scraping_pendiente`, `web_scraping_log` | API de importación de manifiestos<br>API de gestión de guías y bultos<br>Geocodificación funcional<br>Web scraping funcional | ⏳ **Pendiente** |
| **Fase 4: API de Optimización de Rutas** | 21-24 | • Implementación del algoritmo híbrido (Clarke-Wright + 2-Opt + Tabu Search)<br>• Desarrollo de la API para generar, modificar y cancelar rutas<br>• Integración con OSRM v5.25.0 para el cálculo de rutas<br>• Desarrollo de la lógica de gestión dinámica de rutas | `vehiculos`, `trabajadores`, `viajes`, `rutas`, `rutas_modificaciones` | API de generación de rutas<br>API de modificación y cancelación de rutas<br>Algoritmo implementado | ⏳ **Pendiente** |
| **Fase 5: Aplicación Web (Dashboard)** | 25-28 | • Desarrollo del dashboard del Director/Jefe de Operaciones<br>• Desarrollo del portal de la Agencia de Paquetería<br>• Desarrollo del módulo de seguimiento de paquetes para clientes<br>• Desarrollo de la interfaz de importación de manifiestos<br>• Desarrollo del mapa interactivo de bultos (MapLibre GL 6.4.1)<br>• Desarrollo del módulo de tracking de envíos<br>• Desarrollo de la gestión de vehículos y conductores | Ninguna (usa tablas existentes) | Dashboard web funcional<br>Portal de agencia funcional<br>Módulo de seguimiento de clientes<br>Tracking funcional | ⏳ **Pendiente** |
| **Fase 6: App Móvil y GPS** | 29-32 | • Desarrollo de la app para conductores (React Native 0.79.x - Android primero)<br>• Implementación de la arquitectura Offline-First (WatermelonDB/RxDB)<br>• Integración con Traccar 6.14 Client para envío de GPS<br>• Desarrollo de la app para clientes (remitentes y destinatarios) | `vehiculo_ubicaciones`, `geocercas`, `sincronizacion_pendiente`, `conflictos_offline`, `notificaciones` | App móvil para conductores funcional (Android)<br>App móvil para clientes funcional<br>Sincronización offline funcional | ⏳ **Pendiente** |
| **Fase 7: Costos, Finanzas y RSE** | 33-36 | • Desarrollo del módulo de costos y fichas de costo (Res. 148/2023)<br>• Desarrollo del módulo de tasas de cambio y análisis de sensibilidad<br>• Desarrollo del módulo de RSE y Gobernanza<br>• Desarrollo del módulo de inventarios y taller | `fichas_costo`, `fichas_costo_partidas`, `ingresos`, `gastos`, `tasas_cambio`, `proveedores`, `contratos`, `reservas_voluntarias`, `proyectos_rse`, `actividades_prohibidas`, `repuestos`, `movimientos_inventario`, `ordenes_trabajo`, `ventas_repuestos` | Módulo de costos funcional<br>Módulo de RSE funcional<br>Módulo de inventarios funcional | ⏳ **Pendiente** |
| **Fase 8: Interoperabilidad** | 37-40 | • Desarrollo de la API abierta (OpenAPI 3.0)<br>• Gestión de integraciones con sistemas externos (Aduana, MITRANS, agencias)<br>• Desarrollo de logs de integraciones y webhooks | `integraciones`, `logs_api`, `webhooks` | API documentada (OpenAPI 3.0)<br>Integraciones funcionales<br>Logs de integraciones | ⏳ **Pendiente** |
| **Fase 9: Despliegue y Capacitación** | 41-44 | • Despliegue en el servidor de producción (VPS)<br>• Configuración de SSL/TLS y dominio<br>• Capacitación del personal (conductores, Jefe de Operaciones, Director)<br>• Elaboración de manuales de usuario | Ninguna | Sistema en producción<br>Personal capacitado<br>Manuales de usuario | ⏳ **Pendiente** |
| **Fase 10: Monitoreo y Validación** | 45-52 | • Recolección de datos para la validación (Post-Test)<br>• Monitoreo del rendimiento del sistema<br>• Corrección de errores y mejoras<br>• Generación de reportes de validación | Ninguna | Datos de validación<br>Reportes de rendimiento<br>Mejoras implementadas | ⏳ **Pendiente** |

**Leyenda de Estado:**
- ⏳ **Pendiente**
- 🚀 **En desarrollo**
- ✅ **Completada**

---

## 7.3. Cronograma Detallado (Diagrama de Gantt)

A continuación, se presenta el cronograma detallado del proyecto con el estado actualizado:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             CRONOGRAMA DEL PROYECTO (52 SEMANAS)                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  Fase 0: Planificación y Diseño Inicial (Semanas 1-8)     EN CURSO                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 1-4: Definición de requisitos y diseño de arquitectura.                                                 │ │
│  │  Semana 5-8: Diseño del modelo de datos (37 tablas - blueprint).                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 1: Configuración del Entorno (Semanas 9-12)     PENDIENTE                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 9:  Instalación de PostgreSQL 16.15 + PostGIS 3.5.0.                                                    │ │
│  │  Semana 10: Configuración del repositorio Git y entorno de desarrollo (VS Code).                                │ │
│  │  Semana 11: Instalación de dependencias del proyecto (Next.js 16.2.6, Prisma 7.9.1, etc.).                      │ │
│  │  Semana 12: Configuración de Docker y servicios esenciales (Redis, OSRM v5.25.0, Nginx, PgBouncer).             │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 2: Modelo de Datos y Migraciones (Semanas 13-16)     PENDIENTE                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 13-14: Implementación del modelo de datos (37 tablas) en Prisma.                                        │ │
│  │  Semana 15: Creación de migraciones y aplicación a la base de datos.                                            │ │
│  │  Semana 16: Inserción de datos maestros (roles, permisos, actividades prohibidas).                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 3: API de Gestión de Guías y Manifiestos (Semanas 17-20)   PENDIENTE                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 17: Desarrollo de la API de importación de manifiestos (Excel/CSV).                                     │ │
│  │  Semana 18: Desarrollo de la API de gestión de guías (CRUD).                                                    │ │
│  │  Semana 19: Desarrollo de la API de gestión de bultos (house) y clientes.                                       │ │
│  │  Semana 20: Desarrollo de geocodificación (LocationIQ + Nominatim) y web scraping (Aerovaradero).               │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 4: API de Optimización de Rutas (Semanas 21-24)     PENDIENTE                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 21: Implementación del algoritmo Clarke-Wright.                                                         │ │
│  │  Semana 22: Implementación del algoritmo 2-Opt y Tabu Search.                                                   │ │
│  │  Semana 23: Desarrollo de la API de generación de rutas e integración con OSRM v5.25.0.                         │ │
│  │  Semana 24: Desarrollo de la API de modificación y cancelación de rutas.                                        │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 5: Aplicación Web (Dashboard) (Semanas 25-28)     PENDIENTE                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 25: Desarrollo del dashboard, gestión de agencias y clientes.                                           │ │
│  │  Semana 26: Desarrollo de gestión de guías, importación y bultos.                                               │ │
│  │  Semana 27: Desarrollo de mapa interactivo (MapLibre GL 6.4.1), geocodificación y web scraping.                 │ │
│  │  Semana 28: Desarrollo de tracking, vehículos, conductores y generación de rutas.                               │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 6: App Móvil y GPS (Semanas 29-32)   PENDIENTE                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 29: Configuración del proyecto React Native 0.79.x y estructura de la app.                              │ │
│  │  Semana 30: Desarrollo de la app para conductores (Offline-First, GPS con Traccar 6.14).                        │ │
│  │  Semana 31: Desarrollo de la app para clientes (remitentes/destinatarios).                                      │ │
│  │  Semana 32: Pruebas de la app móvil y ajustes.                                                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 7: Costos, Finanzas y RSE (Semanas 33-36)   PENDIENTE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 33: Desarrollo del módulo de costos y fichas de costo (Res. 148/2023).                                  │ │
│  │  Semana 34: Desarrollo del módulo de tasas de cambio y análisis de sensibilidad.                                │ │
│  │  Semana 35: Desarrollo del módulo de RSE y Gobernanza.                                                          │ │
│  │  Semana 36: Desarrollo del módulo de inventarios y taller.                                                      │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 8: Interoperabilidad (Semanas 37-40)   PENDIENTE                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 37: Desarrollo de la API abierta (OpenAPI 3.0).                                                         │ │
│  │  Semana 38: Gestión de integraciones con sistemas externos (Aduana, MITRANS).                                   │ │
│  │  Semana 39: Desarrollo de logs de integraciones y webhooks.                                                     │ │
│  │  Semana 40: Pruebas de interoperabilidad.                                                                       │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 9: Despliegue y Capacitación (Semanas 41-44)   PENDIENTE                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semana 41: Despliegue en el servidor de producción (VPS).                                                      │ │
│  │  Semana 42: Configuración de SSL/TLS y dominio.                                                                 │ │
│  │  Semana 43: Capacitación del personal (conductores, Jefe de Operaciones, Director).                             │ │
│  │  Semana 44: Elaboración de manuales de usuario y documentación final.                                           │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  Fase 10: Monitoreo y Validación (Semanas 45-52)   PENDIENTE                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  Semanas 45-48: Recolección de datos para la validación (Post-Test).                                            │ │
│  │  Semanas 49-50: Monitoreo del rendimiento del sistema y corrección de errores.                                  │ │
│  │  Semanas 51-52: Generación de reportes de validación y análisis de resultados.                                  │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Leyenda del Cronograma:**
- ⏳ **Pendiente**
- 🚀 **En desarrollo**
- ✅ **Completado**

---

## 7.4. Plan de Pruebas Detallado

| Tipo de Prueba | Descripción | Criterios de Aceptación | Responsable | Herramientas | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pruebas Unitarias** | Pruebas de cada función y componente del sistema (backend y frontend) | 100% de cobertura de código. Todas las pruebas pasan | Asistente IA (bajo supervisión) | Jest, React Testing Library | ⏳ Pendiente |
| **Pruebas de Integración** | Pruebas de la interacción entre módulos (API, base de datos, servicios externos) | Todas las integraciones funcionan correctamente | Asistente IA (bajo supervisión) | Supertest, Prisma Client | ⏳ Pendiente |
| **Pruebas de Aceptación** | Pruebas end-to-end de los flujos de negocio (importación, rutas, seguimiento) | Todos los flujos de negocio funcionan según lo especificado | Jefe de Operaciones + Asistente IA | Playwright, Cypress | ⏳ Pendiente |
| **Pruebas de Rendimiento** | Pruebas de carga y estrés del sistema (simulación de 100 usuarios concurrentes) | Tiempo de respuesta < 2 segundos para el 95% de las peticiones | Asistente IA (bajo supervisión) | k6, Artillery | ⏳ Pendiente |
| **Pruebas de Seguridad** | Pruebas de vulnerabilidades (inyección SQL, XSS, autenticación) | Sin vulnerabilidades críticas | Asistente IA (bajo supervisión) | OWASP ZAP, Snyk | ⏳ Pendiente |
| **Pruebas Offline-First** | Pruebas de sincronización y resolución de conflictos en escenarios sin conexión | Sincronización correcta y resolución de conflictos | Asistente IA (bajo supervisión) | Simulador de red, WatermelonDB | ⏳ Pendiente |
| **Pruebas de Roles y Permisos** | Verificación de que los roles dinámicos y permisos funcionan correctamente | Acceso restringido según los roles asignados | Asistente IA (bajo supervisión) | Pruebas de integración con JWT | ⏳ Pendiente |

---

## 7.5. Análisis de Riesgos y Plan de Contingencia

| Riesgo | Probabilidad (1-5) | Impacto (1-5) | Nivel de Riesgo | Plan de Contingencia | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Retrasos en la conectividad a internet** | 4 | 5 | 20 (Alto) | Implementar la arquitectura Offline-First desde el inicio | ⏳ Planificado |
| **Fallos en la sincronización de datos** | 3 | 5 | 15 (Alto) | Implementar un sistema de colas de sincronización (RxDB) | ⏳ Planificado |
| **Resistencia al cambio por parte del personal** | 3 | 3 | 9 (Medio) | Involucrar al personal en el proceso de diseño y pruebas | 🟡 En monitoreo |
| **Errores en la importación de manifiestos** | 3 | 3 | 9 (Medio) | Implementar validaciones exhaustivas en la API de importación | ⏳ Planificado |
| **Problemas de rendimiento del algoritmo de optimización** | 2 | 4 | 8 (Medio) | Validación empírica con datos reales durante el desarrollo | ⏳ Planificado |
| **Caída del servidor VPS** | 2 | 5 | 10 (Medio) | Implementar copias de seguridad diarias de la base de datos | ⏳ Planificado |
| **Cambios en la normativa cubana** | 3 | 4 | 12 (Medio) | Arquitectura modular que permite adaptarse a cambios | ⏳ Planificado |
| **Falta de adopción por parte de los clientes** | 3 | 4 | 12 (Medio) | Demostraciones y soporte personalizado durante los primeros meses | 🟡 En monitoreo |
| **Problemas de interoperabilidad con sistemas externos** | 3 | 3 | 9 (Medio) | API abierta y documentación exhaustiva de endpoints | ⏳ Planificado |

---

## 7.6. Presupuesto del Proyecto

### 7.6.1. Costos de Infraestructura (Mensuales) - Planificados

| Concepto | Costo | Nota | Estado |
| :--- | :--- | :--- | :--- |
| **VPS (4 vCPU, 8 GB RAM, 120 GB SSD)** | $20-40 USD/mes | DigitalOcean, Vultr, o proveedor local | ⏳ Pendiente de contratación |
| **Dominio (.com)** | $12-15 USD/año (~$1.25/mes) | Registrador de dominios (ej. Namecheap, GoDaddy) | ⏳ Pendiente de registro |
| **Certificado SSL** | $0 | Gratuito (Let's Encrypt) | ⏳ Pendiente de configuración |
| **Servicio de Geocodificación** | $0 | Gratuito (LocationIQ - 5,000 solicitudes/día) | ⏳ Pendiente de configuración |
| **Servicio de Mapas** | $0 | Gratuito (OpenStreetMap + MapLibre GL 6.4.1) | ⏳ Pendiente de configuración |
| **Servicio de Rutas** | $0 | Gratuito (OSRM v5.25.0 – servicio propio) | ⏳ Pendiente de configuración |
| **Costo Total Estimado** | **$25-45 USD/mes** | — | — |

### 7.6.2. Resumen de Costos

| Concepto | Costo Anual Estimado |
| :--- | :--- |
| **Infraestructura (VPS + Dominio)** | $300 - $540 USD/año |
| **Fondo de Contingencia (15%)** | $45 - $81 USD/año |
| **Desarrollo y Operación** | $0 (Tiempo del investigador + Asistente IA) |
| **Total** | **$345 - $621 USD/año** |

### 7.6.3. Análisis de Costo-Beneficio

| Concepto | Valor Estimado |
| :--- | :--- |
| **Inversión Anual en Infraestructura** | $345 - $621 USD/año |
| **Ahorro Anual en Combustible (15-20% estimado)** | $2,500 - $5,000 USD/año |
| **Ahorro Anual en Tiempo de Viaje (20-25% estimado)** | $1,000 - $2,500 USD/año |
| **Aumento Anual en Margen de Utilidad (10-15% estimado)** | $3,000 - $6,000 USD/año |
| **Beneficio Neto Estimado** | **$5,879 - $12,879 USD/año** |
| **ROI Estimado** | **1,700% - 3,700%** |

---

## 7.7. Resumen de Entregables por Fase

| Fase | Entregables Principales | Estado |
| :--- | :--- | :--- |
| **Fase 0** | Documento de diseño aprobado (Capítulos 1-8) | ⏳ **En curso** |
| **Fase 1** | Entorno de desarrollo funcional, repositorio configurado, base de datos creada, calidad de código configurada | ⏳ **Pendiente** |
| **Fase 2** | Modelo de datos implementado (37 tablas), base de datos poblada con datos maestros | ⏳ **Pendiente** |
| **Fase 3** | API de importación de manifiestos, API de gestión de guías, bultos, clientes y agencias. Geocodificación y web scraping funcionales | ⏳ **Pendiente** |
| **Fase 4** | API de generación, modificación y cancelación de rutas. Algoritmo VRP/VRPTW implementado | ⏳ **Pendiente** |
| **Fase 5** | Dashboard web funcional, mapa interactivo, tracking, gestión de vehículos y conductores | ⏳ **Pendiente** |
| **Fase 6** | App móvil para conductores y clientes (Android). Sincronización offline funcional | ⏳ **Pendiente** |
| **Fase 7** | Módulo de costos, RSE, inventarios y taller funcionales | ⏳ **Pendiente** |
| **Fase 8** | API documentada (OpenAPI 3.0), integraciones funcionales, logs de integraciones | ⏳ **Pendiente** |
| **Fase 9** | Sistema en producción, personal capacitado, manuales de usuario | ⏳ **Pendiente** |
| **Fase 10** | Datos de validación, reportes de rendimiento, mejoras implementadas | ⏳ **Pendiente** |

---

## 7.8. DevOps y Estrategia de Despliegue (AMPLIADO)

### 7.8.1. Estrategia de Branches (Git Flow)

El proyecto SGCI utiliza **Git Flow** como estrategia de branching, adaptada para un equipo pequeño con desarrollo continuo. Esta estrategia es especialmente adecuada para proyectos con ciclos de release definidos y versionado semántico.

**Estructura de Branches:**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      ESTRATEGIA DE BRANCHES (GIT FLOW)                                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                     main (producción)                                                           │ │
│  │                                   ●───────────────────────────────────────────────────────────────────────────● │ │
│  │                                  ╱                                                                            ╱ │ │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                   develop (integración)                                                    │ │ │
│  │  │                                 ●────────────────────────────────────────────────────────────────────────● │ │ │
│  │  │                                ╱                                                                         ╱ │ │ │
│  │  │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │                                   feature/* (nuevas funcionalidades)                                  │ │ │ │
│  │  │  │                                 ●───────────────────────────────────────────────────────────────────● │ │ │ │
│  │  │  │                                ╱                                                                    ╱ │ │
│  │  │  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  │                                   hotfix/* (correcciones urgentes)                             │ │ │ │
│  │  │  │  │                                 ●──────────────────────────────────────────────────────────────● │ │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                      │
│  Flujo:                                                                                                              │
│  1. feature/* → develop (Pull Request)                                                                               │
│  2. develop → main (Release)                                                                                         │
│  3. hotfix/* → main → develop (Corrección urgente)                                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Reglas del Git Flow:**

| Rama | Propósito | Reglas |
| :--- | :--- | :--- |
| **`main`** | Código en producción | Solo se actualiza desde `develop` (releases) o `hotfix/*`. Protegida con reglas de branch protection. |
| **`develop`** | Integración continua | Todas las `feature/*` se fusionan aquí. Es la rama de desarrollo activo. |
| **`feature/*`** | Nuevas funcionalidades | Se crea desde `develop`, se fusiona a `develop` mediante Pull Request. Vida útil: < 1 semana. |
| **`hotfix/*`** | Correcciones urgentes | Se crea desde `main`, se fusiona a `main` y `develop`. Vida útil: < 24 horas. |
| **`release/*`** | Preparación de versiones | Se crea desde `develop`, se fusiona a `main`. Solo para ajustes finales. |

**Nomenclatura de Branches:**

```
# Features (nuevas funcionalidades)
feature/sgci-001-login
feature/sgci-002-guias
feature/sgci-003-importacion

# Hotfixes (correcciones urgentes)
hotfix/security-patch
hotfix/critical-data-loss

# Releases (versiones)
release/v1.0.0
release/v1.1.0
```

**Convención de Commits (Conventional Commits):**

| Tipo       | Propósito           | Ejemplo                                                |
| :--------- | :------------------ | :----------------------------------------------------- |
| `feat`     | Nueva funcionalidad | `feat(auth): agregar autenticación con JWT`            |
| `fix`      | Corrección de error | `fix(guias): corregir importación de manifiestos`      |
| `docs`     | Documentación       | `docs(api): actualizar documentación OpenAPI`          |
| `refactor` | Refactorización     | `refactor(rutas): optimizar algoritmo de optimización` |
| `test`     | Pruebas             | `test(bultos): agregar pruebas unitarias`              |
| `chore`    | Mantenimiento       | `chore(deps): actualizar dependencias`                 |

### 7.8.2. Versionado Semántico (SemVer)

El proyecto utiliza **Semantic Versioning (SemVer) 2.0** para gestionar las versiones del sistema.

**Formato:** `MAYOR.MENOR.PARCHE-prerelease+buildmetadata`

| Componente | Incremento cuando...             | Ejemplo           |
| :--------- | :------------------------------- | :---------------- |
| **MAYOR**  | Cambios incompatibles en la API  | `1.0.0` → `2.0.0` |
| **MENOR**  | Nueva funcionalidad compatible   | `1.0.0` → `1.1.0` |
| **PARCHE** | Corrección de errores compatible | `1.0.0` → `1.0.1` |

**Etiquetas de Pre-release:**

| Etiqueta   | Propósito                          | Ejemplo         | Criterio de Promoción                          |
| :--------- | :--------------------------------- | :-------------- | :--------------------------------------------- |
| `-alpha.X` | Desarrollo temprano, inestable     | `1.0.0-alpha.1` | Todos los tests pasan en entorno de desarrollo |
| `-beta.X`  | Feature complete, pruebas en curso | `1.0.0-beta.1`  | QA aprueba en entorno de testing               |
| `-rc.X`    | Release Candidate, prueba final    | `1.0.0-rc.1`    | Security scan completado                       |

**Historial de Versiones Propuesto:**

| Versión          | Fecha  | Cambios                              | Estado        |
| :--------------- | :----- | :----------------------------------- | :------------ |
| `v0.1.0-alpha.1` | Mes 3  | Autenticación y roles básicos        | ⏳ Pendiente |
| `v0.2.0-alpha.1` | Mes 5  | Gestión de guías y bultos            | ⏳ Pendiente |
| `v0.3.0-beta.1`  | Mes 7  | Optimización de rutas (VRP/VRPTW)    | ⏳ Pendiente |
| `v0.4.0-beta.1`  | Mes 9  | Dashboard web y mapa                 | ⏳ Pendiente |
| `v0.5.0-rc.1`    | Mes 11 | App móvil y GPS                      | ⏳ Pendiente |
| `v1.0.0`         | Mes 13 | **Primera versión estable**          | ⏳ Pendiente |

### 7.8.3. Pipeline CI/CD con GitHub Actions

El pipeline de CI/CD automatiza las pruebas, el linting, el build y el despliegue del SGCI.

**Arquitectura del Pipeline:**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     PIPELINE CI/CD (GitHub Actions)                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  JOB 1: LINTING & FORMATEO                                                                                   │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  ESLint → Prettier → TypeScript                                                                         │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  JOB 2: PRUEBAS UNITARIAS                                                                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  Jest → Cobertura de código → Codecov                                                                   │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  JOB 3: PRUEBAS DE INTEGRACIÓN                                                                               │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  PostgreSQL (PostGIS) → Redis → Supertest                                                               │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  JOB 4: BUILD                                                                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  next build → Docker build (multi-stage) → Push a Registry                                              │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  JOB 5: DESPLIEGUE (solo en main)                                                                            │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  SSH → docker pull → docker-compose up -d                                                               │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Workflow CI/CD (Resumen):**

| Job | Dependencias | Ejecución en | Propósito |
| :--- | :--- | :--- | :--- |
| **Lint** | — | Todos los PR y pushes | Verificar calidad de código |
| **Test** | Lint | Todos los PR y pushes | Ejecutar pruebas unitarias |
| **Integration** | Lint | Todos los PR y pushes | Ejecutar pruebas de integración |
| **Build** | Test + Integration | Todos los PR y pushes | Construir la aplicación |
| **Docker Build** | Build | Solo `main` y `develop` | Construir y subir imagen Docker |
| **Deploy Staging** | Docker Build | Solo `develop` | Desplegar en entorno de staging |
| **Deploy Production** | Docker Build | Solo `main` (con aprobación manual) | Desplegar en producción |

### 7.8.4. Dockerfile Multi-Stage

El SGCI utiliza un **Dockerfile multi-stage** para optimizar el tamaño de la imagen y el tiempo de construcción.

**Estructura del Dockerfile:**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     DOCKERFILE MULTI-STAGE                                                           │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 1: BUILDER                                                                                            │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  node:20-alpine                                                                                         │ │    │
│  │  │  ├── Instalar PNPM                                                                                      │ │    │
│  │  │  ├── Copiar package.json y pnpm-lock.yaml                                                               │ │    │
│  │  │  ├── pnpm install --frozen-lockfile                                                                     │ │    │
│  │  │  ├── Copiar código fuente                                                                               │ │    │
│  │  │  ├── pnpm prisma generate                                                                               │ │    │
│  │  │  └── pnpm build (standalone)                                                                            │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                   │                                                                  │
│                                                   ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 2: PRODUCTION                                                                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  node:20-alpine                                                                                         │ │    │
│  │  │  ├── Crear usuario no-root (nextjs)                                                                     │ │    │
│  │  │  ├── pnpm install --prod                                                                                │ │    │
│  │  │  ├── Copiar .next/standalone desde builder                                                              │ │    │
│  │  │  ├── Copiar .next/static desde builder                                                                  │ │    │
│  │  │  ├── Copiar public desde builder                                                                        │ │    │
│  │  │  ├── Copiar prisma desde builder                                                                        │ │    │
│  │  │  ├── EXPOSE 3000                                                                                        │ │    │
│  │  │  ├── HEALTHCHECK                                                                                        │ │    │
│  │  │  └── CMD ["node", "server.js"]                                                                          │ │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Optimizaciones del Dockerfile:**

| Optimización | Descripción | Beneficio |
| :--- | :--- | :--- |
| **Multi-stage** | Dos etapas: builder y production | Reduce tamaño de imagen (~60% más pequeña) |
| **Caché de dependencias** | Copiar `package.json` antes del código | Acelera builds (~40% más rápido) |
| **Usuario no-root** | Ejecutar como `nextjs` | Mejora seguridad |
| **Alpine base** | Usar `node:20-alpine` | Reduce tamaño de imagen (~80MB vs ~200MB) |
| **Standalone mode** | `next build` con output standalone | Reduce archivos innecesarios |

### 7.8.5. Guía de Despliegue (NUEVA SECCIÓN AMPLIADA)

#### 7.8.5.1. Despliegue en VPS

**Requisitos del Servidor:**

| Recurso | Mínimo | Recomendado |
| :--- | :--- | :--- |
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disco | 50 GB SSD | 120 GB SSD |
| SO | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

**Paso 1: Configurar el Servidor**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y
```

**Paso 2: Configurar SSL**

```bash
# Obtener certificado SSL
sudo certbot --nginx -d api.setaexpreso.cu -d www.api.setaexpreso.cu
```

**Paso 3: Desplegar la Aplicación**

```bash
# Clonar repositorio
git clone https://github.com/setaexpreso/sgci.git /opt/sgci
cd /opt/sgci

# Configurar variables de entorno
cp .env.production .env
# Editar .env con valores de producción

# Levantar servicios
docker-compose -f docker/docker-compose.prod.yml up -d

# Verificar estado
docker-compose ps
```

**Paso 4: Monitoreo**

```bash
# Ver logs
docker-compose logs -f app
docker-compose logs -f postgres

# Ver métricas
curl http://localhost:9090/metrics
```

#### 7.8.5.2. Script de Despliegue Automático

```bash
#!/bin/bash
# scripts/deploy.sh
# Script de despliegue automatizado

set -e

APP_DIR="/opt/sgci"
TAG="${1:-latest}"
BACKUP_DIR="/var/backups/sgci"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

log "🚀 Iniciando despliegue del SGCI (tag: $TAG)"

cd "$APP_DIR"

# Backup de la base de datos
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T postgres pg_dump -U sgci_user sgci_db > "$BACKUP_FILE" 2>/dev/null || true

# Descargar imagen y desplegar
docker pull "ghcr.io/setaexpreso/sgci:$TAG"
docker-compose down
docker-compose up -d

# Limpiar imágenes antiguas
docker image prune -f

# Verificar
sleep 10
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    log "✅ ¡Despliegue exitoso!"
else
    log "❌ El servicio no responde correctamente"
    exit 1
fi
```

#### 7.8.5.3. Rollback

```bash
#!/bin/bash
# scripts/rollback.sh
# Script de rollback

set -e

APP_DIR="/opt/sgci"
TAG="${1:-previous}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

log "🔄 Iniciando rollback a tag: $TAG"

cd "$APP_DIR"

docker pull "ghcr.io/setaexpreso/sgci:$TAG" || {
    log "❌ Tag $TAG no existe"
    exit 1
}

docker-compose down
TAG=$TAG docker-compose up -d

sleep 10
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    log "✅ ¡Rollback exitoso a $TAG!"
else
    log "❌ Rollback fallido"
    exit 1
fi
```

#### 7.8.5.4. Variables de Entorno para Producción

```env
# .env.production

# Base de Datos
DATABASE_URL="postgresql://sgci_user:${POSTGRES_PASSWORD}@postgres:5432/sgci_db?schema=public"
POSTGRES_USER="sgci_user"
POSTGRES_PASSWORD="[GENERATED_SECURE_PASSWORD]"
POSTGRES_DB="sgci_db"

# Redis
REDIS_URL="redis://redis:6379"

# Next.js
NEXTAUTH_URL="https://api.setaexpreso.cu"
NEXTAUTH_SECRET="[GENERATED_SECURE_SECRET]"

# JWT
JWT_SECRET="[GENERATED_SECURE_SECRET]"
JWT_REFRESH_SECRET="[GENERATED_SECURE_SECRET]"
JWT_ACCESS_EXPIRY="1h"
JWT_REFRESH_EXPIRY="7d"

# OSRM
OSRM_URL="http://osrm:5000"

# Traccar
TRACCAR_URL="http://traccar:8083"
TRACCAR_USER="admin"
TRACCAR_PASSWORD="[GENERATED_SECURE_PASSWORD]"

# Appwrite
APPWRITE_ENDPOINT="http://appwrite:8082/v1"
APPWRITE_PROJECT_ID="sgci-project"
APPWRITE_API_KEY="[GENERATED_SECURE_API_KEY]"

# Geocodificación
LOCATIONIQ_API_KEY="[GENERATED_API_KEY]"
```

#### 7.8.5.5. Secretos Requeridos en GitHub

| Secreto              | Propósito                | Entorno    |
| :------------------- | :----------------------- | :--------- |
| `STAGING_HOST`       | IP del VPS de staging    | Staging    |
| `STAGING_USER`       | Usuario SSH              | Staging    |
| `STAGING_SSH_KEY`    | Clave SSH                | Staging    |
| `PRODUCTION_HOST`    | IP del VPS de producción | Producción |
| `PRODUCTION_USER`    | Usuario SSH              | Producción |
| `PRODUCTION_SSH_KEY` | Clave SSH                | Producción |
| `CODECOV_TOKEN`      | Token de Codecov         | Todos      |
| `SNYK_TOKEN`         | Token de Snyk            | Todos      |
| `APPROVERS`          | Lista de aprobadores     | Producción |

---

## 7.9. Infraestructura y Monitoreo

### 7.9.1. Docker Compose (Completo)

El archivo `docker-compose.production.yml` incluye todos los servicios necesarios para la operación del SGCI en producción.

**Tabla 7.1: Servicios de Infraestructura**

| Servicio       | Imagen                            | Puerto  | Propósito                 | Estado       |
| :------------- | :-------------------------------- | :------ | :------------------------ | :----------- |
| **App**        | `ghcr.io/setaexpreso/sgci:latest` | 3000    | Aplicación Next.js        | ⏳ Pendiente |
| **PostgreSQL** | `postgis/postgis:16-3.5`          | 5432    | Base de datos con PostGIS | ⏳ Pendiente |
| **Redis**      | `redis:7.4-alpine`                | 6379    | Caché y colas             | ⏳ Pendiente |
| **OSRM**       | `osrm/osrm-backend:v5.25.0`       | 5000    | Motor de rutas            | ⏳ Pendiente |
| **Nginx**      | `nginx:1.27-alpine`               | 80, 443 | Proxy inverso             | ⏳ Pendiente |
| **Traccar**    | `traccar/traccar:6.14`            | 8083    | Seguimiento GPS           | ⏳ Pendiente |
| **Appwrite**   | `appwrite/appwrite:15.0.0`        | 8082    | Notificaciones push       | ⏳ Pendiente |
| **Prometheus** | `prom/prometheus:latest`          | 9090    | Monitoreo de métricas     | ⏳ Pendiente |
| **Grafana**    | `grafana/grafana:latest`          | 3001    | Dashboards de monitoreo   | ⏳ Pendiente |
| **Loki**       | `grafana/loki:latest`             | 3100    | Logging centralizado      | ⏳ Pendiente |
| **Promtail**   | `grafana/promtail:latest`         | —       | Colector de logs          | ⏳ Pendiente |

**Archivo `docker-compose.production.yml` (Completo):**

```yaml
# docker/docker-compose.production.yml
version: '3.8'

services:
  # ============================================================
  # APLICACIÓN PRINCIPAL
  # ============================================================
  app:
    image: ghcr.io/setaexpreso/sgci:latest
    container_name: sgci-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OSRM_URL=${OSRM_URL}
      - TRACCAR_URL=${TRACCAR_URL}
      - APPWRITE_ENDPOINT=${APPWRITE_ENDPOINT}
      - LOCATIONIQ_API_KEY=${LOCATIONIQ_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sgci-network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'
        reservations:
          memory: 512M
          cpus: '0.5'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # BASE DE DATOS (PostgreSQL + PostGIS)
  # ============================================================
  postgres:
    image: postgis/postgis:16-3.5
    container_name: sgci-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - sgci-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # CACHÉ (Redis)
  # ============================================================
  redis:
    image: redis:7.4-alpine
    container_name: sgci-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - sgci-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # MOTOR DE RUTAS (OSRM)
  # ============================================================
  osrm:
    image: osrm/osrm-backend:v5.25.0
    container_name: sgci-osrm
    restart: unless-stopped
    volumes:
      - osrm_data:/data
    ports:
      - "5000:5000"
    networks:
      - sgci-network
    command: osrm-routed --algorithm mld /data/cuba-260817.osrm
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # PROXY INVERSO (Nginx)
  # ============================================================
  nginx:
    image: nginx:1.27-alpine
    container_name: sgci-nginx
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    networks:
      - sgci-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # SEGUIMIENTO GPS (Traccar)
  # ============================================================
  traccar:
    image: traccar/traccar:6.14
    container_name: sgci-traccar
    restart: unless-stopped
    volumes:
      - traccar_data:/opt/traccar/data
    ports:
      - "8083:8082"
    networks:
      - sgci-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # NOTIFICACIONES (Appwrite)
  # ============================================================
  appwrite:
    image: appwrite/appwrite:15.0.0
    container_name: sgci-appwrite
    restart: unless-stopped
    volumes:
      - appwrite_data:/storage
    environment:
      APPWRITE_ENDPOINT: http://localhost:8082/v1
      APPWRITE_PROJECT_ID: sgci-project
    ports:
      - "8082:80"
    networks:
      - sgci-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # MONITOREO (Prometheus)
  # ============================================================
  prometheus:
    image: prom/prometheus:latest
    container_name: sgci-prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - sgci-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # DASHBOARDS (Grafana)
  # ============================================================
  grafana:
    image: grafana/grafana:latest
    container_name: sgci-grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/datasources:/etc/grafana/provisioning/datasources:ro
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    ports:
      - "3001:3000"
    networks:
      - sgci-network
    depends_on:
      - prometheus
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # LOGGING CENTRALIZADO (Loki)
  # ============================================================
  loki:
    image: grafana/loki:latest
    container_name: sgci-loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./loki/loki-config.yaml:/etc/loki/loki-config.yaml:ro
      - loki_data:/loki
    networks:
      - sgci-network
    command: -config.file=/etc/loki/loki-config.yaml
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # COLECTOR DE LOGS (Promtail)
  # ============================================================
  promtail:
    image: grafana/promtail:latest
    container_name: sgci-promtail
    restart: unless-stopped
    volumes:
      - ./promtail/promtail-config.yaml:/etc/promtail/promtail-config.yaml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - sgci-network
    command: -config.file=/etc/promtail/promtail-config.yaml
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  osrm_data:
    driver: local
  traccar_data:
    driver: local
  appwrite_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
  loki_data:
    driver: local

networks:
  sgci-network:
    driver: bridge
```

### 7.9.2. Monitoreo con Prometheus + Grafana

**Configuración de Prometheus (`prometheus/prometheus.yml`):**

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: production

scrape_configs:
  - job_name: 'sgci-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'osrm'
    static_configs:
      - targets: ['osrm:5000']

  - job_name: 'traccar'
    static_configs:
      - targets: ['traccar:8083']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

**Dashboards de Grafana (Principales):**

| Dashboard                | Propósito                  | Métricas Clave                                      |
| :----------------------- | :------------------------- | :-------------------------------------------------- |
| **SGCI - General**       | Visión general del sistema | Uso de CPU, memoria, requests, errores              |
| **SGCI - API**           | Rendimiento de la API      | Tiempo de respuesta, tasa de error, throughput      |
| **SGCI - Base de Datos** | Rendimiento de PostgreSQL  | Conexiones activas, tiempo de query, cache hit rate |
| **SGCI - Redis**         | Rendimiento de caché       | Hit rate, memoria, conexiones                       |
| **SGCI - GPS**           | Seguimiento de vehículos   | Posiciones activas, latencia, cobertura             |
| **SGCI - Rutas**         | Optimización de rutas      | Tiempo de cómputo, ahorro de combustible            |

### 7.9.3. Logging Centralizado con Loki

**Configuración de Loki (`loki/loki-config.yaml`):**

```yaml
# loki/loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s
  max_transfer_retries: 0

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  max_entries_limit_per_query: 5000
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 336h  # 14 días
```

**Configuración de Promtail (`promtail/promtail-config.yaml`):**

```yaml
# promtail/promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'stream'
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: 'service'

  - job_name: app-logs
    static_configs:
      - targets: [localhost]
        labels:
          job: sgci-app
          __path__: /var/lib/docker/containers/*/*.log
```

### 7.9.4. Alerting y Notificaciones

**Configuración de Alertas en Prometheus (`prometheus/alerts.yml`):**

```yaml
# prometheus/alerts.yml
groups:
  # ============================================================
  # ALERTAS DE INFRAESTRUCTURA
  # ============================================================
  - name: infrastructure
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alto uso de CPU"
          description: "El uso de CPU es del {{ $value }}% en el VPS"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alto uso de memoria"
          description: "El uso de memoria es del {{ $value }}% en el VPS"

      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes{fstype="ext4"} - node_filesystem_free_bytes{fstype="ext4"}) / node_filesystem_size_bytes{fstype="ext4"} * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alto uso de disco"
          description: "El uso de disco es del {{ $value }}% en el VPS"

      - alert: ServiceDown
        expr: up{job="sgci-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Servicio caído"
          description: "El servicio SGCI no está disponible"

  # ============================================================
  # ALERTAS DE APLICACIÓN
  # ============================================================
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(sgci_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alta tasa de errores"
          description: "La tasa de errores 5xx es del {{ $value }}% en la API"

      - alert: SlowAPI
        expr: histogram_quantile(0.95, rate(sgci_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API lenta"
          description: "El 95% de las peticiones tardan más de 2 segundos"

      - alert: HighDatabaseConnections
        expr: pg_stat_database_numbackends > 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Muchas conexiones a la base de datos"
          description: "Hay {{ $value }} conexiones activas a PostgreSQL"

      - alert: LowCacheHitRate
        expr: redis_connected_clients < 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis no disponible"
          description: "No hay conexiones activas a Redis"

      - alert: GPSDisconnected
        expr: count(sgci_gps_positions_active) < 1
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "GPS inactivo"
          description: "No hay vehículos con GPS activo"

  # ============================================================
  # ALERTAS DE NEGOCIO
  # ============================================================
  - name: business
    rules:
      - alert: LowFuelSavings
        expr: avg(sgci_route_fuel_savings_percentage) < 10
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Bajo ahorro de combustible"
          description: "El ahorro de combustible promedio es del {{ $value }}%"

      - alert: SlowRouteOptimization
        expr: histogram_quantile(0.95, rate(sgci_route_optimization_duration_seconds_bucket[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Optimización de rutas lenta"
          description: "El 95% de las optimizaciones tardan más de 10 segundos"
```

**Configuración de Alertmanager (`alertmanager/alertmanager.yml`):**

```yaml
# alertmanager/alertmanager.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@sgci.com'
  smtp_auth_username: 'alerts@sgci.com'
  smtp_auth_password: 'your-password'

route:
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: '🚨 {{ .GroupLabels.alertname }}'
        text: |
          {{ range .Alerts }}
          *Severity:* {{ .Labels.severity }}
          *Summary:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          {{ end }}

  - name: 'email-notifications'
    email_configs:
      - to: 'admin@sgci.com'
        subject: '🚨 Alerta SGCI: {{ .GroupLabels.alertname }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster']
```

---

## 7.10. Calidad de Código y Estándares (AMPLIADO CON GUÍA DE ESTILO)

### 7.10.1. Herramientas de Calidad de Código (100% Gratuitas)

| Herramienta | Propósito | Licencia | Estado |
| :--- | :--- | :--- | :--- |
| **ESLint** | Linting y reglas de código | MIT | ⏳ Pendiente |
| **Prettier** | Formateo de código | MIT | ⏳ Pendiente |
| **Husky** | Pre-commit hooks | MIT | ⏳ Pendiente |
| **lint-staged** | Verificación en staged files | MIT | ⏳ Pendiente |
| **Commitlint** | Validación de commits | MIT | ⏳ Pendiente |
| **Jest** | Pruebas unitarias | MIT | ⏳ Pendiente |
| **Playwright** | Pruebas E2E | Apache 2.0 | ⏳ Pendiente |
| **SonarQube Community Build** | Análisis de calidad | LGPL v3.0 | ⏳ Pendiente |
| **Codecov** | Cobertura de código | Gratuito (público) | ⏳ Pendiente |
| **Snyk** | Escaneo de seguridad | Gratuito (open source) | ⏳ Pendiente |

### 7.10.2. Guía de Estilo de Código (NUEVA SECCIÓN AMPLIADA)

#### 7.10.2.1. TypeScript/JavaScript

**Reglas Generales:**

| Regla | Correcto | Incorrecto |
| :--- | :--- | :--- |
| Usar `const` sobre `let` | `const name = 'John';` | `let name = 'John';` |
| Usar template strings | `` `Hello ${name}` `` | `'Hello ' + name` |
| Usar arrow functions | `const fn = () => {}` | `function fn() {}` |
| Usar destructuring | `const { name } = props;` | `const name = props.name;` |
| Usar spread operator | `{ ...obj, newProp }` | `Object.assign({}, obj, { newProp })` |

**Tipado:**

```typescript
// ✅ Correcto - Interfaces y tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

type UserRole = 'admin' | 'operador' | 'conductor';

// ✅ Correcto - Props con tipos
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  onClick?: () => void;
}

// ❌ Incorrecto - Uso de any
const user: any = { name: 'John' };

// ✅ Correcto - Uso de unknown cuando es necesario
const data: unknown = await fetchData();
if (isUser(data)) {
  // data es User aquí
}
```

**Nombres:**

| Tipo | Convención | Ejemplo |
| :--- | :--- | :--- |
| Archivos | kebab-case | `user-profile.tsx` |
| Componentes | PascalCase | `UserProfile` |
| Funciones | camelCase | `getUserById` |
| Variables | camelCase | `userName` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Tipos/Interfaces | PascalCase | `UserProfileProps` |
| Enums | PascalCase | `UserRole` |

**Ejemplo de Componente:**

```tsx
// ✅ Correcto - Componente con tipos y props
import { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  const fetchUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-muted-foreground">{user.email}</p>
      <div className="mt-2">
        {user.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>
    </div>
  );
}
```

#### 7.10.2.2. React/Next.js

**Server vs Client Components:**

```tsx
// ✅ Correcto - Server Component (por defecto)
// app/users/page.tsx
import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  const users = await prisma.user.findMany();
  return <UserList users={users} />;
}

// ✅ Correcto - Client Component (cuando se necesita interactividad)
// components/UserList.tsx
'use client';

import { useState } from 'react';

export function UserList({ users }: { users: User[] }) {
  const [search, setSearch] = useState('');
  // ...
}
```

**Hooks:**

```typescript
// ✅ Correcto - useEffect con dependencias correctas
useEffect(() => {
  fetchUser(userId);
}, [userId]); // userId es la dependencia correcta

// ❌ Incorrecto - useEffect sin dependencias
useEffect(() => {
  fetchUser(userId);
}); // Se ejecuta en cada render

// ✅ Correcto - useMemo para valores computados
const filteredUsers = useMemo(() => {
  return users.filter(user => user.name.includes(search));
}, [users, search]);

// ✅ Correcto - useCallback para funciones
const handleUpdate = useCallback((user: User) => {
  updateUser(user);
}, []);
```

#### 7.10.2.3. Python (para ML)

```python
# ✅ Correcto - Docstring y tipos
from typing import List, Dict, Optional
import pandas as pd
import numpy as np

class DemandPredictor:
    """
    Predictor de demanda utilizando Prophet y XGBoost.
    
    Attributes:
        prophet_model: Modelo Prophet entrenado
        xgb_model: Modelo XGBoost entrenado
    """
    
    def __init__(self, config: Dict[str, any]):
        """
        Inicializa el predictor con configuración.
        
        Args:
            config: Diccionario con configuración del modelo
        """
        self.config = config
        self.prophet_model = None
        self.xgb_model = None
    
    def train(self, data: pd.DataFrame) -> Dict[str, float]:
        """
        Entrena los modelos con los datos proporcionados.
        
        Args:
            data: DataFrame con datos históricos
            
        Returns:
            Diccionario con métricas de rendimiento
        """
        # ...
        return {'accuracy': 0.95, 'mape': 0.05}
```

#### 7.10.2.4. SQL

```sql
-- ✅ Correcto - Nombres en snake_case
CREATE TABLE guias (
    id UUID PRIMARY KEY,
    codigo_awb VARCHAR(50) UNIQUE,
    fecha_emision TIMESTAMP
);

-- ✅ Correcto - Índices con prefijo
CREATE INDEX idx_guias_estado ON guias(estado);
CREATE INDEX idx_guias_agencia_fecha ON guias(agencia_id, fecha_emision);

-- ❌ Incorrecto - Nombres en PascalCase
CREATE TABLE Guias (
    Id UUID PRIMARY KEY,
    CodigoAwb VARCHAR(50) UNIQUE,
    FechaEmision TIMESTAMP
);
```

### 7.10.3. ESLint Config

**Instalación:**

```bash
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-next eslint-config-prettier eslint-plugin-react-hooks
```

**Configuración de ESLint (`eslint.config.mjs`):**

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Configuración base
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Plugins
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // ============================================================
  // REGLAS PERSONALIZADAS
  // ============================================================
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-undef': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/no-array-index-key': 'warn',
      'react/no-danger': 'warn',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-fragments': ['error', 'syntax'],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-css-tags': 'error',
      '@next/next/no-script-in-head': 'warn',
      '@next/next/no-page-custom-font': 'error',
      '@next/next/google-font-display': 'error',

      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'dot-notation': 'error',
      'no-unused-expressions': 'error',
      'require-await': 'error',
      'prefer-template': 'warn',
      'object-shorthand': ['error', 'always'],

      // Accesibilidad
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
    },
  },

  // ============================================================
  // IGNORAR ARCHIVOS
  // ============================================================
  {
    ignores: [
      '.next/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },

  // Aplicar Prettier (debe ser el último)
  prettierConfig,
);
```

### 7.10.4. Prettier Config

**Instalación:**

```bash
pnpm add -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports
```

**Configuración de Prettier (`.prettierrc`):**

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports"
  ],
  "tailwindConfig": "./tailwind.config.ts",
  "importOrder": [
    "^react$",
    "^next(/.*)?$",
    "^@/app/(.*)$",
    "^@/components/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/types/(.*)$",
    "^@/styles/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### 7.10.5. Husky + lint-staged

**Instalación:**

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

**Configuración de lint-staged (`.lintstagedrc.js`):**

```javascript
// .lintstagedrc.js
import { ESLint } from 'eslint';

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const isIgnored = await Promise.all(
    files.map((file) => eslint.isPathIgnored(file))
  );
  return files.filter((_, i) => !isIgnored[i]);
};

export default {
  '*.{js,jsx,ts,tsx}': async (files) => {
    const filteredFiles = await removeIgnoredFiles(files);
    if (filteredFiles.length === 0) return [];

    return [
      `prettier --write ${filteredFiles.join(' ')}`,
      `eslint --max-warnings 0 ${filteredFiles.join(' ')}`,
      `tsc --noEmit`,
    ];
  },
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
```

### 7.10.6. SonarQube

**Quality Gate (Criterios de Aprobación):**

| Métrica | Umbral | Consecuencia |
| :--- | :--- | :--- |
| **Bugs** | 0 | **Bloquea el PR** |
| **Vulnerabilidades** | 0 | **Bloquea el PR** |
| **Code Smells** | ≤ 50 | **Requiere revisión** |
| **Duplicación** | ≤ 3% | **Requiere refactorización** |
| **Cobertura de Tests** | ≥ 80% | **Requiere más pruebas** |
| **Complejidad Ciclomática** | ≤ 10 | **Requiere refactorización** |
| **Nuevos Issues** | 0 | **Bloquea el PR** |
| **Seguridad Hotspots** | 100% revisados | **Requiere revisión** |

### 7.10.7. Cobertura de Código (Jest)

**Estrategia de Cobertura por Capa:**

| Capa | Cobertura Mínima | Estrategia |
| :--- | :--- | :--- |
| **Domain (Entidades)** | ≥ 90% | Pruebas unitarias exhaustivas |
| **Application (Use Cases)** | ≥ 85% | Pruebas de integración |
| **Infrastructure (Repositorios)** | ≥ 80% | Pruebas de integración con BD real |
| **Presentation (Componentes)** | ≥ 70% | Pruebas con React Testing Library |

---

## 7.11. Conclusión del Capítulo 7

El presente capítulo ha presentado el plan de implementación del SGCI, estructurado en **10 fases** con una duración total estimada de **52 semanas**, incluyendo:

1. **Metodología de desarrollo** (Scrum con Asistente IA)
2. **Estrategia incremental** (YAGNI con matriz de trazabilidad de 37 tablas)
3. **Cronograma detallado** (Diagrama de Gantt)
4. **Plan de pruebas** (7 tipos de pruebas)
5. **Análisis de riesgos** (9 riesgos con planes de contingencia)
6. **Presupuesto** ($25-45 USD/mes, ROI estimado 1,700%-3,700%)
7. **DevOps completo** (Git Flow, SemVer, CI/CD, Docker multi-stage, despliegue automático)
8. **Guía de Despliegue** (Configuración VPS, SSL, scripts de despliegue y rollback)
9. **Infraestructura completa** (11 servicios con Docker Compose, Prometheus, Grafana, Loki)
10. **Calidad de código** (ESLint, Prettier, Husky, SonarQube, Jest, Playwright - 100% gratuitos)
11. **Guía de Estilo de Código** (TypeScript, React, Python, SQL con ejemplos)

**Estado Actual del Proyecto (25/08/2026):**

| Fase                                       | Estado            | Observaciones                           |
| :----------------------------------------- | :---------------- | :-------------------------------------- |
| **Fase 0: Planificación y Diseño Inicial** | ⏳ **En curso**  | Documentación completada (Capítulos 1-8) |
| **Fase 1-10**                              | ⏳ **Pendiente** | —                                        |

**Próximos Pasos:**
1. Iniciar la **Fase 1**: Configuración del entorno de desarrollo (Docker, repositorios, base de datos, calidad de código).
2. Configurar el **pipeline CI/CD** con GitHub Actions.
3. Desarrollo incremental de los módulos funcionales según la **matriz de trazabilidad** (Tabla 7.0).
4. Aplicar la **Guía de Estilo de Código** en todo el desarrollo.
5. Seguir la **Guía de Despliegue** para la puesta en producción.

---

## Referencias del Capítulo 7

- Beck, K., et al. (2001). *Manifesto for Agile Software Development*. Agile Alliance.
- Docker Documentation. (2026). *Docker Compose Overview*. Recuperado de https://docs.docker.com/compose/
- DigitalOcean. (2026). *Droplet Pricing*. Recuperado de https://www.digitalocean.com/pricing/droplets
- Prometheus Documentation. (2026). *Prometheus Overview*. Recuperado de https://prometheus.io/docs/
- Grafana Documentation. (2026). *Grafana Overview*. Recuperado de https://grafana.com/docs/
- Loki Documentation. (2026). *Loki Overview*. Recuperado de https://grafana.com/docs/loki/
- Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. Scrum.org.
- SonarQube Documentation. (2026). *SonarQube Community Build*. Recuperado de https://docs.sonarqube.org/
- Vercel. (2026). *Next.js Documentation*. Recuperado de https://nextjs.org/docs
- Playwright Documentation. (2026). *Playwright Overview*. Recuperado de https://playwright.dev/

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 7.4 (Versión final con Guía de Estilo y Guía de Despliegue - 10/10)
**Estado del Proyecto:** Fase 0 - Planificación y Diseño Inicial

---

## RESUMEN DE MEJORAS REALIZADAS EN EL CAPÍTULO 7

| Sección | Cambio Realizado | Justificación |
| :--- | :--- | :--- |
| **7.1.1 Estructura del Equipo** | Development Team: "Desarrollador (Osleyder)" → **"Asistente IA (bajo supervisión del Investigador)"** | Reflejar el rol del Asistente IA |
| **7.1.2 Estrategia YAGNI** | Nueva sección con matriz de trazabilidad de 37 tablas | Reflejar estrategia incremental |
| **7.2 Fases del Proyecto** | Fases 1-5: "✅ Completada" → "⏳ Pendiente" | Alinear con estado real (Fase 0) |
| **7.2 Fases del Proyecto** | Número de tablas: 34 → **37** | Reflejar nuevas tablas |
| **7.2 Fases del Proyecto** | Añadida columna "Tablas a Crear" | Reflejar estrategia incremental |
| **7.2 Fases del Proyecto** | Añadida configuración de calidad de código en Fase 1 | Reflejar nuevas herramientas |
| **7.3 Cronograma** | Fase 0 añadida, Fases 1-10: "PENDIENTE" | Alinear con estado real |
| **7.4 Plan de Pruebas** | Responsable: **"Asistente IA (bajo supervisión)"** | Reflejar el rol del Asistente IA |
| **7.5 Análisis de Riesgos** | "✅ Mitigado" → "⏳ Planificado" | No hay implementación previa |
| **7.6 Presupuesto** | "✅ Activo" → "⏳ Pendiente" | No hay servicios contratados |
| **7.8 DevOps** | Sección completa con Git Flow, SemVer, CI/CD, Dockerfile, despliegue | Estrategia DevOps completa |
| **7.8.5 Guía de Despliegue** | **NUEVA SECCIÓN** con configuración VPS, SSL, scripts | Guía paso a paso para producción |
| **7.9 Infraestructura** | **NUEVA SECCIÓN** con 11 servicios, monitoreo, logging y alerting | Infraestructura completa de producción |
| **7.10 Calidad de Código** | **NUEVA SECCIÓN** con ESLint, Prettier, Husky, SonarQube, Jest, Playwright | Calidad de código (100% gratuito) |
| **7.10.2 Guía de Estilo** | **NUEVA SECCIÓN** con TypeScript, React, Python, SQL con ejemplos | Estándares de código |
| **7.10.1 Herramientas** | Tabla de herramientas de calidad de código con licencias | Documentación de herramientas gratuitas |
| **7.10.6 Quality Gate** | Criterios de aprobación de SonarQube | Estándares de calidad |
| **7.11 Conclusión** | Estado del proyecto actualizado | Reflejar estado real |