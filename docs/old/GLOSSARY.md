# GLOSSARY.md
## Glosario Centralizado del SGCI (Sistema de Gestión Contextualmente Inteligente)

**Versión:** 1.0
**Fecha:** 25 de agosto de 2026
**Estado:** Documento de referencia para toda la documentación del SGCI
**Propósito:** Unificar y centralizar las definiciones de todos los términos clave utilizados en la documentación del proyecto, facilitando la comprensión y asegurando la consistencia terminológica.

---

## Índice de Términos

- [A](#a)
- [B](#b)
- [C](#c)
- [D](#d)
- [E](#e)
- [F](#f)
- [G](#g)
- [H](#h)
- [I](#i)
- [J](#j)
- [K](#k)
- [L](#l)
- [M](#m)
- [N](#n)
- [O](#o)
- [P](#p)
- [Q](#q)
- [R](#r)
- [S](#s)
- [T](#t)
- [U](#u)
- [V](#v)
- [W](#w)
- [X](#x)
- [Y](#y)
- [Z](#z)

---

## A

### Actividad Prohibida

**Definición:** Actividad económica que, según el **Decreto 107/2024**, no está permitida para el sector privado en Cuba. El decreto establece 125 actividades prohibidas para MiPymes.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.5.2
**Términos Relacionados:** Decreto 107/2024, MiPyme, Cumplimiento Normativo

---

### AES-256

**Definición:** Algoritmo de encriptación Advanced Encryption Standard con clave de 256 bits. Utilizado en el SGCI para encriptar datos sensibles (CI, NIT, teléfonos, emails) a nivel de aplicación, complementado con TDE (Transparent Data Encryption) a nivel de disco.

**Referencias:** Capítulo 4 (Diseño del Sistema), Capítulo 5 (Modelo de Datos)
**Términos Relacionados:** Encriptación, Seguridad, TDE, Cumplimiento Normativo

---

### Agencia de Envíos (AgenciaEnvios)

**Definición:** Entidad que gestiona envíos de paquetería internacional, actuando como intermediario entre el transportista (Seta Expreso) y los clientes remitentes/destinatarios. En el SGCI, se representa mediante la tabla `agencias_envios`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `AgenciaEnvios`
**Términos Relacionados:** Guía, Bulto, Cliente, Seta Expreso

---

### Agile

**Definición:** Conjunto de metodologías de desarrollo de software basadas en el **Manifiesto Ágil**, que priorizan la entrega incremental de valor, la colaboración con el cliente y la adaptación al cambio. En el SGCI se utiliza **Scrum** como marco de trabajo ágil.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.1.1
**Términos Relacionados:** Scrum, Sprint, YAGNI, MVP

---

### API (Application Programming Interface)

**Definición:** Conjunto de definiciones y protocolos que permiten la comunicación entre diferentes sistemas de software. En el SGCI, se implementa una API RESTful con documentación **OpenAPI 3.0** que permite la interoperabilidad con otros sistemas del ecosistema logístico cubano.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.12
**Términos Relacionados:** REST, OpenAPI, Interoperabilidad, Endpoint

---

### API Abierta (Open API)

**Definición:** API diseñada para ser consumida por sistemas externos, con documentación pública estándar (OpenAPI 3.0) y mecanismos de autenticación (API Key/JWT). Permite la interoperabilidad del SGCI con otros actores del ecosistema logístico cubano (Aduana, MITRANS, otras agencias).

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.12
**Términos Relacionados:** API, Interoperabilidad, OpenAPI, Webhook

---

### Appwrite Messaging

**Definición:** Servicio de notificaciones push de Appwrite utilizado en el SGCI para enviar notificaciones a los usuarios (conductores, clientes). Versión: 15.0.0.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Notificaciones, Push Notifications, Appwrite

---

### Auditoría (Auditoria)

**Definición:** Mecanismo de trazabilidad que registra todas las operaciones realizadas en el sistema, incluyendo quién (created_by, updated_by), cuándo (timestamps) y qué datos fueron modificados (datos anteriores/nuevos en formato JSONB). Es un requisito legal según la **Ley 127/2025**.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Auditoria`
**Términos Relacionados:** Trazabilidad, Cumplimiento Normativo, Ley 127/2025

---

## B

### Backend

**Definición:** Capa del sistema responsable del procesamiento de datos, lógica de negocio y comunicación con la base de datos. En el SGCI, está implementado mediante **Next.js API Routes**, **Prisma** como ORM, y **PostgreSQL** como base de datos.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.5
**Términos Relacionados:** Frontend, API, Base de Datos, Next.js, Prisma

---

### Backup

**Definición:** Copia de seguridad de los datos del sistema para garantizar la recuperación ante fallos. En el SGCI se implementa una estrategia de backup diario (full backup) y WAL archiving para recuperación point-in-time.

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.10
**Términos Relacionados:** RPO, RTO, Recuperación ante Desastres, WAL

---

### BCC (Banco Central de Cuba)

**Definición:** Institución responsable de la regulación monetaria y cambiaria en Cuba. Emite resoluciones (117/2024, 23/2025) que establecen las tasas de cambio y los segmentos cambiarios.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.3
**Términos Relacionados:** Dualidad Cambiaria, Tasa de Cambio, Segmento Cambiario

---

### Bulto

**Definición:** Unidad básica de envío. Representa un paquete individual con su propio código House, peso, destinatario y remitente. En el SGCI, se representa mediante la tabla `bultos`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Bulto`
**Términos Relacionados:** Guía, House, Destinatario, Remitente

---

## C

### CI (Carnet de Identidad)

**Definición:** Documento de identidad de los ciudadanos cubanos. En el SGCI se almacena encriptado (AES-256) y normalizado a 11 dígitos.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Persona`
**Términos Relacionados:** Persona, Encriptación, NIT

---

### CI/CD (Continuous Integration / Continuous Deployment)

**Definición:** Prácticas de desarrollo de software que automatizan la integración de código (CI) y el despliegue (CD) a través de pipelines automatizados. En el SGCI se implementa con **GitHub Actions**.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.8.3
**Términos Relacionados:** DevOps, GitHub Actions, Pipeline, Despliegue

---

### Clarke-Wright Savings

**Definición:** Algoritmo heurístico para el Problema de Ruteo de Vehículos (VRP), propuesto por Clarke y Wright en 1964. Genera una solución inicial rápida calculando el "ahorro" de combinar dos rutas en una. En el SGCI es la primera fase del algoritmo híbrido de optimización.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1.3
**Términos Relacionados:** VRP, VRPTW, 2-Opt, Tabu Search, Algoritmo Híbrido

---

### Cliente

**Definición:** En el contexto del SGCI, persona o entidad que recibe (destinatario) o envía (remitente) paquetes. Puede ser de tipo `destinatario`, `remitente` o `ambos`. Se representa mediante la tabla `clientes`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Cliente`
**Términos Relacionados:** Persona, Destinatario, Remitente, AgenciaEnvios

---

### Conflicto Offline

**Definición:** Situación que ocurre cuando dos o más dispositivos modifican los mismos datos sin conexión a internet, generando versiones divergentes que deben ser reconciliadas. En el SGCI se maneja mediante asignación exclusiva de paquetes, bloqueo optimista y registro de auditoría.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.6, Capítulo 5 - Tabla `conflictos_offline`
**Términos Relacionados:** Offline-First, Sincronización, Resolución de Conflictos

---

### Contrato

**Definición:** Acuerdo formal entre Seta Expreso y una Agencia de Envíos, que establece las tarifas (en CUP, USD y MXN) y condiciones para la prestación de servicios de transporte. En el SGCI, se representa mediante la tabla `contratos`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Contrato`
**Términos Relacionados:** AgenciaEnvios, Tarifa, Seta Expreso

---

### CUP (Peso Cubano)

**Definición:** Moneda oficial de la República de Cuba. En el SGCI, una de las monedas soportadas para transacciones, junto con USD y MXN.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.3
**Términos Relacionados:** USD, MXN, Moneda, Dualidad Cambiaria

---

### CVRP (Capacitated Vehicle Routing Problem)

**Definición:** Variante del VRP donde los vehículos tienen una capacidad de carga limitada. Es la base del modelo de optimización del SGCI.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1
**Términos Relacionados:** VRP, VRPTW, Vehículo, Capacidad

---

## D

### Decreto 107/2024

**Definición:** Normativa cubana que establece las **125 actividades prohibidas** para el sector privado en Cuba. El SGCI incluye un módulo de verificación para consultar automáticamente esta lista al registrar nuevas actividades.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.5.2
**Términos Relacionados:** Actividad Prohibida, Cumplimiento Normativo, MiPyme

---

### Decreto Ley 88/2024

**Definición:** Normativa cubana que establece el marco legal para la creación y operación de **Micro, Pequeñas y Medianas Empresas (MiPymes)** en Cuba, incluyendo su constitución, objeto social y obligaciones fiscales.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.1
**Términos Relacionados:** MiPyme, S.U.R.L., Cumplimiento Normativo

---

### Destinatario

**Definición:** Persona o entidad que recibe un paquete (bulto). En el SGCI, es un tipo de cliente (tipoCliente: 'destinatario').

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Bulto`
**Términos Relacionados:** Cliente, Bulto, Remitente

---

### DevOps

**Definición:** Conjunto de prácticas que combinan el desarrollo de software (Development) y las operaciones de TI (Operations) para acortar el ciclo de vida del desarrollo y proporcionar entregas continuas. En el SGCI se implementa con Docker, GitHub Actions, y monitoreo con Prometheus/Grafana.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.8
**Términos Relacionados:** CI/CD, Docker, GitHub Actions, Monitoreo

---

### Diagrama de Despliegue

**Definición:** Diagrama UML que muestra la distribución física de los componentes del sistema en los nodos de infraestructura (servidores, contenedores, servicios). En el SGCI, muestra la arquitectura de despliegue con Docker, Nginx, y los servicios externos.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.8.4
**Términos Relacionados:** UML, Docker, Infraestructura, Despliegue

---

### Docker

**Definición:** Plataforma de contenedores que permite empaquetar aplicaciones y sus dependencias en contenedores aislados. En el SGCI se utiliza Docker para el desarrollo y producción, con **Docker Compose** para orquestar los servicios.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.9.1
**Términos Relacionados:** Contenedor, Docker Compose, Kubernetes

---

### DRP (Disaster Recovery Plan)

**Definición:** Plan de recuperación ante desastres que establece los procedimientos para restaurar los sistemas y datos en caso de fallo catastrófico. En el SGCI, define RPO (15 minutos) y RTO (4 horas).

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.10.4
**Términos Relacionados:** Backup, RPO, RTO, Recuperación

---

### Dualidad Cambiaria

**Definición:** Situación en la que coexisten múltiples tasas de cambio entre el peso cubano (CUP) y el dólar estadounidense (USD), reguladas por el **Banco Central de Cuba**. El SGCI gestiona esta dualidad mediante el registro histórico de tasas y la selección dinámica del tipo de tasa en cada documento.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.3
**Términos Relacionados:** Tasa de Cambio, Segmento Cambiario, BCC, USD/CUP

---

## E

### EnZona

**Definición:** Plataforma de pagos digitales del Banco Central de Cuba (BCC) que permite pagos con código QR, transferencias y comercio electrónico. El SGCI se integra con EnZona para gestionar pagos digitales.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1.8
**Términos Relacionados:** Transfermóvil, Pago Digital, Sistema de Pagos

---

### ESLint

**Definición:** Herramienta de análisis de código estático (linting) para JavaScript y TypeScript que identifica y reporta patrones problemáticos. En el SGCI se usa para mantener la calidad del código.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.10.3
**Términos Relacionados:** Linting, Prettier, Calidad de Código, Husky

---

### Estado de Bulto

**Definición:** Conjunto de 11 estados que describen el ciclo de vida de un bulto: `creado`, `enviado`, `arribo`, `presencial`, `faltante_origen`, `facturado`, `recibido`, `proceso_transportacion`, `proceso_entrega`, `entregado`, `no_entregado`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Enum `EstadoBulto`
**Términos Relacionados:** Bulto, EstadoGuia, Ciclo de Vida

---

### Estado de Guía

**Definición:** Conjunto de 11 estados que describen el ciclo de vida de una guía: `creada`, `enviada`, `arribo`, `proceso_aduana`, `facturada`, `recibida`, `proceso_transportacion`, `proceso_entrega`, `parcialmente_entregada`, `entregada`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Enum `EstadoGuia`
**Términos Relacionados:** Guía, EstadoBulto, Ciclo de Vida

---

## F

### Ficha de Costo

**Definición:** Instrumento contable que desglosa los elementos que integran el costo de un producto o servicio, según lo establecido por la **Resolución 148/2023** del Ministerio de Finanzas y Precios. Incluye: Gasto Material, Salario Directo, Otros Gastos Directos, Gastos Indirectos y Utilidad.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.2
**Términos Relacionados:** Resolución 148/2023, Costo, Contabilidad

---

### Frontend

**Definición:** Capa del sistema responsable de la interfaz de usuario (UI) y la interacción con los usuarios. En el SGCI, está implementado mediante **Next.js 16.2.6 + React 19.2.6** para la web y **React Native 0.79.x** para las aplicaciones móviles.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.4
**Términos Relacionados:** Backend, UI, Next.js, React, React Native

---

## G

### Geocodificación

**Definición:** Proceso de convertir direcciones de texto en coordenadas geográficas (latitud, longitud). En el SGCI, se utiliza LocationIQ como servicio primario y Nominatim como fallback.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.7
**Términos Relacionados:** Geocodificación, LocationIQ, Nominatim, Coordenadas

---

### Gobernanza Corporativa

**Definición:** Sistema de principios, políticas y procedimientos que garantizan la transparencia, la trazabilidad y la rendición de cuentas en la gestión de la MiPyme. En el SGCI, se integra como un pilar estratégico, con trazabilidad de operaciones y reportes para entes reguladores.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.7
**Términos Relacionados:** RSE, Transparencia, Trazabilidad, Auditoría

---

### Grafana

**Definición:** Plataforma de análisis y visualización de métricas que se integra con Prometheus. En el SGCI, se utiliza para mostrar dashboards de monitoreo del sistema (API, base de datos, GPS, etc.).

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.9.2
**Términos Relacionados:** Prometheus, Monitoreo, Dashboards, Alertas

---

### Guía

**Definición:** Documento de envío que agrupa uno o más bultos con un código AWB (Air Waybill) único. Representa una carga de paquetería internacional. En el SGCI, se representa mediante la tabla `guias`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Guia`
**Términos Relacionados:** Bulto, AWB, AgenciaEnvios

---

## H

### House (Código House)

**Definición:** Código único que identifica a un bulto dentro de una guía. Es el número de tracking que recibe el destinatario para seguir su paquete. En el SGCI, el campo `codigo_house` en la tabla `bultos`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Bulto`
**Términos Relacionados:** Bulto, AWB, Tracking

---

### Husky

**Definición:** Herramienta de Git hooks que permite ejecutar scripts (como linting y pruebas) antes de commits o pushes. En el SGCI, se utiliza con lint-staged para mantener la calidad del código.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.10.5
**Términos Relacionados:** Git, Pre-commit, lint-staged, Calidad de Código

---

## I

### Interoperabilidad

**Definición:** Capacidad de un sistema para comunicarse e intercambiar información con otros sistemas de manera efectiva. El SGCI está diseñado con una arquitectura de API abierta para interoperar con la Aduana, MITRANS y otras agencias del ecosistema logístico cubano.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.12
**Términos Relacionados:** API, OpenAPI, Integración, Ecosistema Logístico

---

### J

### JSONB (JSON Binary)

**Definición:** Tipo de datos de PostgreSQL que almacena JSON en un formato binario optimizado para consultas y manipulación. En el SGCI se utiliza para campos flexibles como `puntosEntregaLat/Lng`, `houseIds` y `datos_anteriores/nuevos` en auditoría.

**Referencias:** Capítulo 5 (Modelo de Datos)
**Términos Relacionados:** PostgreSQL, Datos Semiestructurados, Auditoría

---

### JWT (JSON Web Token)

**Definición:** Estándar abierto para la creación de tokens de acceso que permiten la autenticación y autorización entre partes. En el SGCI se utiliza JWT con refresh tokens para la autenticación de usuarios.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.5
**Términos Relacionados:** Autenticación, Autorización, Token, Refresh Token

---

## L

### Ley 127/2025

**Definición:** Ley del Sistema de Control y Fiscalización de la República de Cuba, que establece los requisitos de auditoría y trazabilidad para todas las entidades económicas.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.1
**Términos Relacionados:** Auditoría, Trazabilidad, Cumplimiento Normativo, Contraloría General

---

### LocationIQ

**Definición:** Servicio de geocodificación utilizado como primario en el SGCI (5,000 solicitudes/día en su plan gratuito). Convierte direcciones en coordenadas geográficas.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.7
**Términos Relacionados:** Geocodificación, Nominatim, Coordenadas

---

### Loki

**Definición:** Sistema de agregación de logs (logging) desarrollado por Grafana. En el SGCI se utiliza para el logging centralizado y la agregación de logs de todos los servicios.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.9.3
**Términos Relacionados:** Logging, Promtail, Observabilidad

---

## M

### MapLibre GL

**Definición:** Biblioteca de mapas interactivos de código abierto, fork de Mapbox GL. En el SGCI se utiliza (versión 6.4.1) para la visualización de mapas en el dashboard web.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Mapa, OpenStreetMap, Visualización Geoespacial

---

### MFP (Ministerio de Finanzas y Precios)

**Definición:** Organismo del gobierno cubano responsable de la política fiscal, financiera y de precios. Emite resoluciones clave como la **Resolución 148/2023** (Ficha de Costo) y la **Resolución 8/2024** (Declaración Digital).

**Referencias:** Capítulo 3 (Marco Legal)
**Términos Relacionados:** Resolución 148/2023, Resolución 8/2024, ONAT

---

### MiPyme (Micro, Pequeña y Mediana Empresa)

**Definición:** Clasificación de empresas según el número de trabajadores y volumen de ingresos anuales, establecida por el **Decreto Ley 88/2024**. El SGCI está diseñado específicamente para MiPymes de transporte terrestre en Cuba.

**Referencias:** Capítulo 1 (Introducción), Capítulo 3 (Marco Legal)
**Términos Relacionados:** Decreto Ley 88/2024, S.U.R.L., Seta Expreso

---

### MITRANS (Ministerio de Transporte)

**Definición:** Organismo del gobierno cubano responsable de la regulación del sector del transporte. Emite resoluciones como la 120/2023 (transporte de carga) y 135/2024 (transporte de pasajeros). El SGCI integra los requisitos del MITRANS en sus módulos de vehículos y viajes.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.5
**Términos Relacionados:** Transporte, Vehículo, Licencia, Cumplimiento Normativo

---

### Monitoreo

**Definición:** Conjunto de prácticas y herramientas para observar el estado y rendimiento del sistema en tiempo real. En el SGCI se implementa con **Prometheus** (métricas), **Grafana** (visualización) y **Loki** (logging).

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.9
**Términos Relacionados:** Prometheus, Grafana, Alertas, Observabilidad

---

### MVP (Minimum Viable Product)

**Definición:** Versión de un producto con las funcionalidades mínimas necesarias para ser usable y comenzar a obtener retroalimentación de los usuarios. En el SGCI, el MVP incluye: autenticación, gestión de guías/bultos, importación de manifiestos y mapas.

**Referencias:** Capítulo 7 (Plan de Implementación)
**Términos Relacionados:** Agile, YAGNI, Producto, Iteración

---

### MXN (Peso Mexicano)

**Definición:** Moneda oficial de México. En el SGCI, una de las monedas soportadas para contratos con agencias de envíos, junto con CUP y USD.

**Referencias:** Capítulo 5 (Modelo de Datos) - Enum `Moneda`
**Términos Relacionados:** CUP, USD, Moneda, Contrato

---

## N

### Next.js

**Definición:** Framework de React para aplicaciones web con renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG). En el SGCI se utiliza la versión 16.2.6 con App Router y Turbopack.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** React, SSR, App Router, Turbopack

---

### NIT (Número de Identificación Tributaria)

**Definición:** Identificador fiscal de personas jurídicas en Cuba. En el SGCI se almacena encriptado (AES-256) en las tablas `clientes` y `agencias_envios`.

**Referencias:** Capítulo 5 (Modelo de Datos)
**Términos Relacionados:** CI, Persona, Encriptación

---

### Nominatim

**Definición:** Servicio de geocodificación basado en OpenStreetMap. En el SGCI se utiliza como fallback cuando LocationIQ no está disponible.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.7
**Términos Relacionados:** Geocodificación, LocationIQ, OpenStreetMap

---

### Notificación

**Definición:** Mensaje enviado a los usuarios para informarles sobre eventos importantes (entregas, cambios de estado, alertas). En el SGCI, se gestiona mediante la tabla `notificaciones` y Appwrite Messaging para notificaciones push.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Notificacion`
**Términos Relacionados:** Appwrite, Push Notifications, Alerta

---

## O

### ODS (Objetivos de Desarrollo Sostenible)

**Definición:** Conjunto de 17 objetivos establecidos por la ONU en 2015 para el desarrollo sostenible. El SGCI contribuye directamente a los ODS 1 (Fin de la Pobreza), 8 (Trabajo Decente), 9 (Industria e Innovación) y 12 (Consumo Responsable).

**Referencias:** Capítulo 1 (Introducción), Capítulo 2 (Marco Teórico)
**Términos Relacionados:** RSE, Sostenibilidad, Agenda 2030, ONU

---

### Offline-First

**Definición:** Filosofía de diseño de aplicaciones que prioriza la funcionalidad sin conexión a internet, considerando la conectividad como una mejora y no como un requisito. El SGCI implementa esta arquitectura para los conductores en rutas interprovinciales.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.1.1
**Términos Relacionados:** Sincronización, Resolución de Conflictos, Mobile, Conectividad

---

### ONAT (Oficina Nacional de Administración Tributaria)

**Definición:** Organismo cubano encargado de la gestión y control de los tributos en Cuba. Las MiPymes deben presentar declaraciones juradas ante la ONAT, y el SGCI facilita este cumplimiento con la **Resolución 8/2024**.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.4
**Términos Relacionados:** Impuesto, Declaración Jurada, Resolución 8/2024, MFP

---

### OpenAPI

**Definición:** Especificación estándar para describir APIs RESTful. En el SGCI, la API abierta está documentada con OpenAPI 3.0, facilitando la integración con otros sistemas.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.12
**Términos Relacionados:** API, Interoperabilidad, Swagger, Documentación

---

### Open Core

**Definición:** Modelo de negocio que combina una versión básica gratuita con funcionalidades avanzadas de pago. El SGCI utiliza este modelo, ofreciendo funcionalidades básicas gratuitas y servicios de valor agregado de pago (instalación, soporte, suscripción premium).

**Referencias:** Capítulo 8 (Plan de Comercialización) - Sección 8.1.1
**Términos Relacionados:** Modelo de Negocio, Comercialización, SaaS

---

### OpenStreetMap (OSM)

**Definición:** Proyecto colaborativo de mapas libres y editables. En el SGCI, se utiliza como fuente de datos de mapas a través de MapLibre GL.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Mapas, MapLibre, Geocodificación

---

### OSRM (Open Source Routing Machine)

**Definición:** Motor de cálculo de rutas de código abierto. En el SGCI, se utiliza (versión v5.25.0) para calcular distancias, tiempos y generar rutas optimizadas.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Rutas, VRP, VRPTW, Optimización

---

## P

### Pagos Digitales

**Definición:** Sistema de pagos electrónicos que permite transacciones sin efectivo. En el SGCI, se integra con **Transfermóvil** y **EnZona** para gestionar cobros a clientes.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1.8
**Términos Relacionados:** Transfermóvil, EnZona, Sistema de Pagos

---

### Particionamiento

**Definición:** Técnica de base de datos que divide una tabla grande en partes más pequeñas (particiones) para mejorar el rendimiento y la gestión. En el SGCI, `vehiculo_ubicaciones` está particionada por mes.

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.5
**Términos Relacionados:** PostgreSQL, Rendimiento, Escalabilidad

---

### Persona

**Definición:** Entidad base que representa a cualquier individuo en el sistema. Puede ser extendida como `Cliente`, `Trabajador` o `Usuario`. En el SGCI, se representa mediante la tabla `personas`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Persona`
**Términos Relacionados:** Cliente, Trabajador, Usuario, CI

---

### PostGIS

**Definición:** Extensión de PostgreSQL que añade soporte para datos geoespaciales. En el SGCI se utiliza la versión 3.5.0 para consultas espaciales y manejo de ubicaciones.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** PostgreSQL, Geoespacial, Ubicaciones, Rutas

---

### PostgreSQL

**Definición:** Sistema de gestión de bases de datos relacionales de código abierto. En el SGCI se utiliza la versión 16.15 con las extensiones PostGIS 3.5.0, JSONB, pg_trgm y pg_cron.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** PostGIS, JSONB, Base de Datos, Prisma

---

### Prisma

**Definición:** ORM (Object-Relational Mapper) de código abierto para Node.js y TypeScript. En el SGCI se utiliza la versión 7.9.1 con adapter-pg para manejar las consultas a PostgreSQL.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** PostgreSQL, ORM, Migraciones, TypeScript

---

### Prometheus

**Definición:** Sistema de monitoreo y alertas de código abierto que recopila métricas de los servicios. En el SGCI, se utiliza para el monitoreo de la infraestructura.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.9.2
**Términos Relacionados:** Grafana, Monitoreo, Alertas, Métricas

---

### Promtail

**Definición:** Agente de recolección de logs que envía datos a Loki. En el SGCI, se utiliza como parte del sistema de logging centralizado.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.9.3
**Términos Relacionados:** Loki, Logging, Observabilidad

---

## R

### React

**Definición:** Biblioteca de JavaScript para construir interfaces de usuario. En el SGCI se utiliza la versión 19.2.6 con Next.js 16.2.6.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Next.js, Componentes, Hooks, JSX

---

### React Native

**Definición:** Framework para desarrollar aplicaciones móviles nativas utilizando React. En el SGCI se utiliza la versión 0.79.x para la aplicación de conductores y clientes.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Mobile, Offline-First, Android, iOS

---

### Refresh Token

**Definición:** Token de autenticación que permite obtener un nuevo token de acceso sin que el usuario tenga que volver a iniciar sesión. En el SGCI, los refresh tokens tienen una validez de 7 días y rotan en cada uso.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.5
**Términos Relacionados:** JWT, Autenticación, Token de Acceso

---

### Remitente

**Definición:** Persona o entidad que envía un paquete (bulto). En el SGCI, es un tipo de cliente (tipoCliente: 'remitente').

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Bulto`
**Términos Relacionados:** Cliente, Bulto, Destinatario

---

### Resolución 8/2024

**Definición:** Normativa del Ministerio de Finanzas y Precios que obliga a las entidades a presentar la Declaración Jurada del Impuesto sobre las Utilidades exclusivamente en formato digital con firma digital certificada. El SGCI automatiza este cumplimiento.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.4.3
**Términos Relacionados:** MFP, ONAT, Declaración Digital, Firma Digital

---

### Resolución 148/2023

**Definición:** Normativa del Ministerio de Finanzas y Precios que establece la "Metodología para la elaboración de la ficha de costos y gastos de productos y servicios". El SGCI automatiza la generación de esta ficha.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.2
**Términos Relacionados:** Ficha de Costo, MFP, Contabilidad, Cumplimiento Normativo

---

### RLS (Row Level Security)

**Definición:** Funcionalidad de PostgreSQL que permite restringir el acceso a filas específicas de una tabla según el rol del usuario. En el SGCI, se implementa para garantizar que los conductores solo vean sus propios viajes y los clientes solo sus propios bultos.

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.8
**Términos Relacionados:** Seguridad, PostgreSQL, Roles, Permisos

---

### Roles Dinámicos

**Definición:** Modelo de gestión de usuarios donde los roles y permisos se definen en la base de datos (tablas `roles`, `permisos`, `roles_permisos`) y pueden ser modificados sin necesidad de cambiar el código. Permite adaptar el sistema al crecimiento de la MiPyme.

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.7
**Términos Relacionados:** Usuario, Permiso, Seguridad, Flexibilidad Organizativa

---

### RPO (Recovery Point Objective)

**Definición:** Objetivo de punto de recuperación, que define la cantidad máxima de datos que se pueden perder en caso de desastre. En el SGCI, el RPO es de 15 minutos mediante WAL archiving continuo.

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.10.4
**Términos Relacionados:** RTO, Backup, DRP, WAL

---

### RSE (Responsabilidad Social Empresarial)

**Definición:** Conjunto de compromisos voluntarios de la MiPyme con sus trabajadores, la sociedad y el medio ambiente. En el SGCI, se integra como un pilar estratégico, con gestión de reservas voluntarias, proyectos de RSE e informes de sostenibilidad.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.7
**Términos Relacionados:** Gobernanza, ODS, Sostenibilidad, Proyectos RSE

---

### RTO (Recovery Time Objective)

**Definición:** Objetivo de tiempo de recuperación, que define el tiempo máximo permitido para restaurar el sistema en caso de desastre. En el SGCI, el RTO es de 4 horas.

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.10.4
**Términos Relacionados:** RPO, Backup, DRP, Recuperación

---

### Ruta

**Definición:** Conjunto de puntos de entrega en un orden optimizado para un viaje específico. Incluye origen, destino, puntos de entrega en orden de visita, y métricas de rendimiento (distancia, tiempo, costo). En el SGCI, se representa mediante la tabla `rutas`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Ruta`
**Términos Relacionados:** Viaje, VRP, VRPTW, Optimización

---

### RutaModificacion

**Definición:** Registro de modificaciones dinámicas realizadas a una ruta (añadir/eliminar puntos de entrega, cancelación, reoptimización). En el SGCI, se representa mediante la tabla `rutas_modificaciones`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `RutaModificacion`
**Términos Relacionados:** Ruta, Gestión Dinámica, Modificación

---

## S

### S.U.R.L. (Sociedad Unipersonal de Responsabilidad Limitada)

**Definición:** Forma jurídica de empresa privada en Cuba, donde un único socio tiene responsabilidad limitada. Seta Expreso S.U.R.L. es el caso de estudio de esta investigación.

**Referencias:** Capítulo 1 (Introducción), Capítulo 3 (Marco Legal)
**Términos Relacionados:** MiPyme, Decreto Ley 88/2024, Seta Expreso

---

### Scrum

**Definición:** Marco de trabajo ágil para el desarrollo de software, basado en sprints de duración fija (2 semanas en el SGCI), con roles definidos (Product Owner, Scrum Master, Development Team) y ceremonias (planificación, daily, review, retrospectiva).

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.1.1
**Términos Relacionados:** Agile, Sprint, Product Backlog, Desarrollo

---

### Segmento Cambiario

**Definición:** Categoría de operaciones de cambio con una tasa específica, regulada por el Banco Central de Cuba (Segmentos I, II, III). El SGCI permite seleccionar el tipo de segmento en cada documento financiero.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.3
**Términos Relacionados:** Tasa de Cambio, Dualidad Cambiaria, BCC

---

### SemVer (Semantic Versioning)

**Definición:** Sistema de versionado semántico que utiliza el formato `MAYOR.MENOR.PARCHE`. En el SGCI, se utiliza para gestionar las versiones del sistema.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.8.2
**Términos Relacionados:** Versionado, Releases, Changelog

---

### Seta Expreso S.U.R.L.

**Definición:** MiPyme de transporte terrestre en Cuba, caso de estudio de esta investigación. Opera en La Habana y rutas interprovinciales, con flota de 5 vehículos (3 Gazelle, 1 Howo, 1 Changai).

**Referencias:** Capítulo 1 (Introducción)
**Términos Relacionados:** MiPyme, S.U.R.L., Flota, Transporte

---

### SGCI (Sistema de Gestión Contextualmente Inteligente)

**Definición:** Sistema de gestión integral diseñado para MiPymes de transporte terrestre en Cuba, que integra optimización de rutas (VRP/VRPTW), automatización de la ficha de costo (Res. 148/2023), gestión de inventarios, arquitectura offline-first, RSE, Gobernanza, roles dinámicos e interoperabilidad. Es el objeto central de esta investigación.

**Referencias:** Todo el documento
**Términos Relacionados:** Sistema, Gestión, Optimización, Cuba

---

### Sincronización Offline

**Definición:** Proceso de sincronización de datos entre dispositivos móviles y el servidor central cuando se recupera la conectividad. En el SGCI, se utiliza un modelo híbrido (pull + push) con frecuencia de 10 segundos y backoff exponencial.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.6
**Términos Relacionados:** Offline-First, Conflicto Offline, Mobile

---

### SonarQube

**Definición:** Plataforma de análisis de calidad de código que detecta bugs, vulnerabilidades y code smells. En el SGCI, se utiliza con Quality Gates que deben cumplirse para aprobar un PR.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.10.6
**Términos Relacionados:** Calidad de Código, Quality Gate, Code Smells

---

### Sprint

**Definición:** Período de tiempo fijo (2 semanas en el SGCI) durante el cual el equipo de desarrollo completa un conjunto de tareas del Product Backlog para crear un incremento de producto potencialmente entregable.

**Referencias:** Capítulo 7 (Plan de Implementación) - Sección 7.1.1
**Términos Relacionados:** Scrum, Agile, Incremento, Desarrollo

---

### Stack Tecnológico

**Definición:** Conjunto de tecnologías utilizadas en el desarrollo del SGCI: **Next.js 16.2.6 + React 19.2.6** (frontend web), **React Native 0.79.x** (mobile), **PostgreSQL 16.15 + PostGIS 3.5.0** (base de datos), **OSRM v5.25.0** (rutas), **Traccar 6.14** (GPS), **Appwrite 15.0.0** (notificaciones), **Prisma 7.9.1** (ORM), **Docker** (contenedores), **Prometheus/Grafana** (monitoreo).

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** Tecnología, Frontend, Backend, Base de Datos

---

## T

### Tabu Search

**Definición:** Metaheurística de optimización que utiliza una lista de soluciones recientes (lista tabú) para evitar mínimos locales. En el SGCI, es la tercera fase del algoritmo híbrido de optimización de rutas.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1.3
**Términos Relacionados:** VRP, VRPTW, Clarke-Wright, 2-Opt, Algoritmo Híbrido

---

### TAM (Technology Acceptance Model)

**Definición:** Modelo teórico desarrollado por Davis (1989) que explica los factores que determinan la aceptación de tecnologías por parte de los usuarios. El SGCI extiende este modelo incorporando la "robustez offline" como factor crítico de aceptación.

**Referencias:** Capítulo 1 (Introducción), Capítulo 2 (Marco Teórico)
**Términos Relacionados:** Aceptación Tecnológica, Usabilidad, Robustez Offline

---

### Tasa de Cambio

**Definición:** Relación de valor entre dos monedas (ej. USD/CUP). En el SGCI, se registra históricamente (con fecha y hora) y se puede seleccionar entre diferentes tipos (oficial, segmento I, II, III, informal) para cada documento financiero.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `tasas_cambio`
**Términos Relacionados:** Dualidad Cambiaria, Segmento Cambiario, BCC, Moneda

---

### TDE (Transparent Data Encryption)

**Definición:** Tecnología de encriptación a nivel de base de datos que cifra los archivos de datos en reposo. En el SGCI, se complementa con encriptación AES-256 a nivel de aplicación para datos sensibles.

**Referencias:** Capítulo 4 (Diseño del Sistema), Capítulo 5 (Modelo de Datos)
**Términos Relacionados:** Encriptación, AES-256, Seguridad

---

### Traccar

**Definición:** Sistema de seguimiento GPS de código abierto. En el SGCI se utiliza la versión 6.14 para monitorear la ubicación de los vehículos en tiempo real.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.3.2
**Términos Relacionados:** GPS, Seguimiento, Vehículo, Ubicaciones

---

### Tracking de Envíos

**Definición:** Funcionalidad del SGCI que permite a los clientes seguir el estado de sus guías y bultos a través del portal web, con información detallada de la línea de tiempo del envío.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.9
**Términos Relacionados:** Guía, Bulto, Cliente, Seguimiento

---

### Trabajador

**Definición:** Empleado de Seta Expreso, que puede ser conductor, chofer, mecánico o administrativo. En el SGCI, se representa mediante la tabla `trabajadores`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Trabajador`
**Términos Relacionados:** Persona, Conductor, Chofer

---

### Transfermóvil

**Definición:** Billetera móvil del Banco Metropolitano de Cuba, que permite transferencias entre cuentas bancarias cubanas y pagos de servicios. El SGCI se integra con Transfermóvil para gestionar pagos digitales.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1.8
**Términos Relacionados:** EnZona, Pago Digital, Sistema de Pagos

---

### Trazabilidad

**Definición:** Capacidad de rastrear el historial completo de una operación o dato en el sistema. En el SGCI, se garantiza mediante los campos `created_by`, `updated_by` y las tablas de auditoría, cumpliendo con la Ley 127/2025.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Auditoria`
**Términos Relacionados:** Auditoría, Gobernanza, Cumplimiento Normativo

---

### 2-Opt

**Definición:** Algoritmo de mejora local para problemas de ruteo que intercambia dos arcos de la ruta para eliminar cruces y reducir la distancia total. En el SGCI, es la segunda fase del algoritmo híbrido de optimización.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1.3
**Términos Relacionados:** VRP, VRPTW, Clarke-Wright, Tabu Search, Algoritmo Híbrido

---

## U

### USD (Dólar Estadounidense)

**Definición:** Moneda de referencia internacional. En el SGCI, una de las monedas soportadas para transacciones y contratos, junto con CUP y MXN.

**Referencias:** Capítulo 3 (Marco Legal) - Sección 3.3
**Términos Relacionados:** CUP, MXN, Moneda, Dualidad Cambiaria

---

### Usabilidad

**Definición:** Grado en que un sistema puede ser utilizado por usuarios específicos para alcanzar objetivos con efectividad, eficiencia y satisfacción. En el SGCI, se evalúa mediante encuestas TAM adaptadas.

**Referencias:** Capítulo 6 (Metodología de Validación) - Sección 6.4
**Términos Relacionados:** TAM, UX, Aceptación Tecnológica

---

### Usuario

**Definición:** Persona que accede al sistema con credenciales de autenticación. Puede tener uno o más roles (admin, operador, conductor, cliente, etc.). En el SGCI, se representa mediante la tabla `usuarios`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Usuario`
**Términos Relacionados:** Persona, Roles, Autenticación, Permisos

---

## V

### Vehículo

**Definición:** Unidad de transporte que forma parte de la flota de Seta Expreso. Puede ser Gazelle (3 unidades, diésel, 0.10 L/km), Howo (1 unidad, diésel, 0.17 L/km) o Changai (1 unidad, gasolina, 0.10 L/km). En el SGCI, se representa mediante la tabla `vehiculos`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Vehiculo`
**Términos Relacionados:** Flota, Gazelle, Howo, Changai, Consumo de Combustible

---

### Viaje

**Definición:** Desplazamiento de un vehículo desde el depósito hasta los puntos de entrega y vuelta. Incluye un conductor, chofer, lista de bultos (houseIds en JSONB), fechas de salida/llegada y métricas de rendimiento. En el SGCI, se representa mediante la tabla `viajes`.

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Viaje`
**Términos Relacionados:** Ruta, Vehículo, Trabajador, Bulto

---

### VRP (Vehicle Routing Problem)

**Definición:** Problema de optimización combinatoria que consiste en determinar el conjunto de rutas de costo mínimo que satisfaga todas las demandas de los clientes, respetando las restricciones de capacidad de los vehículos. Es el núcleo del módulo de optimización del SGCI.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1
**Términos Relacionados:** VRPTW, Clarke-Wright, 2-Opt, Tabu Search

---

### VRPTW (Vehicle Routing Problem with Time Windows)

**Definición:** Variante del VRP donde cada cliente tiene una ventana de tiempo en la que debe ser visitado. En el SGCI, se modelan ventanas de tiempo individuales por cliente, sin restricción global de horario.

**Referencias:** Capítulo 2 (Marco Teórico) - Sección 2.1.1
**Términos Relacionados:** VRP, Ventana de Tiempo, Optimización

---

## W

### WAL (Write-Ahead Log)

**Definición:** Mecanismo de PostgreSQL que registra todos los cambios antes de aplicarlos a los datos. En el SGCI, se utiliza WAL archiving para la recuperación point-in-time (PITR).

**Referencias:** Capítulo 5 (Modelo de Datos) - Sección 5.12.10
**Términos Relacionados:** PostgreSQL, Backup, PITR, Recuperación

---

### Web Scraping

**Definición:** Técnica de extracción de datos de páginas web. En el SGCI, se utiliza para consultar automáticamente el estado de facturación de bultos en el sistema Aerovaradero.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.2.8
**Términos Relacionados:** Aerovaradero, Aduana, Integración

---

### Webhook

**Definición:** Mecanismo de comunicación entre sistemas donde un servidor envía una solicitud HTTP a otro servidor cuando ocurre un evento. En el SGCI, se utiliza para notificar a sistemas externos sobre cambios de estado (guía creada, bulto entregado, etc.).

**Referencias:** Capítulo 5 (Modelo de Datos) - Tabla `Webhook`
**Términos Relacionados:** API, Integración, Evento, Notificación

---

### WCAG 2.1 (Web Content Accessibility Guidelines)

**Definición:** Conjunto de pautas para hacer el contenido web más accesible para personas con discapacidades. El SGCI sigue las pautas WCAG 2.1 para garantizar la accesibilidad de la interfaz web.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.4.6
**Términos Relacionados:** Accesibilidad, a11y, Inclusión

---

## Y

### YAGNI (You Aren't Gonna Need It)

**Definición:** Principio de desarrollo de software que establece que no se debe añadir funcionalidad hasta que sea necesaria. En el SGCI, se aplica implementando las tablas solo cuando la funcionalidad correspondiente se desarrolla.

**Referencias:** Capítulo 1 (Introducción), Capítulo 4 (Diseño del Sistema), Capítulo 7 (Plan de Implementación)
**Términos Relacionados:** Agile, MVP, Desarrollo Incremental, Deuda Técnica

---

## Z

### Zod

**Definición:** Biblioteca de validación de esquemas para TypeScript que permite definir y validar estructuras de datos. En el SGCI, se utiliza para validar los datos de entrada en las API Routes.

**Referencias:** Capítulo 4 (Diseño del Sistema) - Sección 4.5.4
**Términos Relacionados:** Validación, TypeScript, Esquema, API

---

## Matriz de Referencias Cruzadas por Capítulo

| Capítulo | Términos Relevantes |
| :--- | :--- |
| **Capítulo 1 (Introducción)** | SGCI, MiPyme, TAM, ODS, YAGNI, Seta Expreso, VRP, VRPTW |
| **Capítulo 2 (Marco Teórico)** | VRP, VRPTW, Clarke-Wright, 2-Opt, Tabu Search, TAM, Offline-First, API |
| **Capítulo 3 (Marco Legal)** | Decreto Ley 88/2024, Decreto 107/2024, Resolución 148/2023, Resolución 8/2024, BCC, ONAT, MITRANS, MFP, Dualidad Cambiaria, Tasa de Cambio |
| **Capítulo 4 (Diseño del Sistema)** | Offline-First, API, Next.js, React, React Native, PostgreSQL, PostGIS, OSRM, Traccar, Appwrite, Prisma, Docker, MapLibre, JSONB, Zod |
| **Capítulo 5 (Modelo de Datos)** | Auditoría, Trazabilidad, JSONB, Particionamiento, RLS, TDE, AES-256, Backup, WAL, RPO, RTO |
| **Capítulo 6 (Metodología de Validación)** | TAM, Usabilidad, Validación, Cuasiexperimental, KPI |
| **Capítulo 7 (Plan de Implementación)** | Scrum, Agile, YAGNI, MVP, DevOps, CI/CD, Docker, GitHub Actions, ESLint, Prettier, SonarQube, SemVer, Husky, Prometheus, Grafana, Loki |
| **Capítulo 8 (Plan de Comercialización)** | Open Core, Comercialización, ROI, Marketing, Expansión |
| **Conclusiones** | SGCI, Contribuciones, ODS, Sostenibilidad, Trabajo Futuro |

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 1.0
**Estado:** Activo - Documento de referencia para toda la documentación del SGCI

---

## Instrucciones para el Uso del Glosario

1. **Referencia Obligatoria:** Todos los capítulos deben referenciar este glosario en su sección de introducción o en la sección de términos.

2. **Nuevos Términos:** Cuando se añada un nuevo término en cualquier capítulo, debe ser incluido en este glosario con su definición y referencias cruzadas.

3. **Actualización:** Este glosario debe mantenerse actualizado con cada nueva versión de la documentación.

4. **Enlaces:** En la documentación, los términos clave deben tener un enlace a este glosario o al menos una referencia clara (ej. "según se define en el Glosario").