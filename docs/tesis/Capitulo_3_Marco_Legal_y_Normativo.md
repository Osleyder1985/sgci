# ⚖️ CAPÍTULO 3
# MARCO LEGAL Y NORMATIVO DEL SISTEMA DE GESTIÓN Y CONTROL INTEGRADO (SGCI)

---

## 📑 Índice del capítulo

- [3.1 Introducción](#31-introducción)
- [3.2 Fundamentación jurídica y normativa del SGCI](#32-fundamentación-jurídica-y-normativa-del-sgci)
- [3.3 Protección de datos personales](#33-protección-de-datos-personales)
- [3.4 Documentos electrónicos](#34-documentos-electrónicos)
- [3.5 Firma digital](#35-firma-digital)
- [3.6 Comercio electrónico](#36-comercio-electrónico)
- [3.7 Actualización del marco del comercio interior](#37-actualización-del-marco-del-comercio-interior)
- [3.8 Seguridad de la información](#38-seguridad-de-la-información)
- [3.9 Conservación documental y evidencias digitales](#39-conservación-documental-y-evidencias-digitales)
- [3.10 Trazabilidad y auditoría](#310-trazabilidad-y-auditoría)
- [3.11 Intercambio electrónico de información e interoperabilidad](#311-intercambio-electrónico-de-información-e-interoperabilidad)
- [3.12 La normativa como conocimiento operativo](#312-la-normativa-como-conocimiento-operativo)
- [3.13 Matriz de requisitos legales y normativos](#313-matriz-de-requisitos-legales-y-normativos)
- [3.14 Arquitectura conceptual de cumplimiento normativo](#314-arquitectura-conceptual-de-cumplimiento-normativo)
- [3.15 Requisitos legales funcionales del SGCI](#315-requisitos-legales-funcionales-del-sgci)
- [3.16 Requisitos no funcionales derivados](#316-requisitos-no-funcionales-derivados)
- [3.17 Conclusiones del capítulo](#317-conclusiones-del-capítulo)
- [Referencias normativas y documentales](#referencias-normativas-y-documentales)

---

# 3.1 Introducción

El desarrollo de sistemas informáticos destinados a apoyar procesos de gestión, control, cumplimiento, auditoría y toma de decisiones requiere considerar no solamente aspectos tecnológicos y funcionales, sino también el conjunto de disposiciones jurídicas y normativas que regulan la información, los documentos, las operaciones institucionales y las responsabilidades de los actores involucrados.

El **Sistema de Gestión y Control Integrado (SGCI)** se concibe como una plataforma informática orientada a integrar mecanismos de gestión normativa, control de procesos, gestión documental, administración de evidencias, seguimiento de riesgos, auditoría y supervisión institucional.

Debido a su naturaleza, el sistema puede procesar información relacionada con:

- 👤 Usuarios y trabajadores.
- 🏢 Estructuras organizacionales.
- 📄 Documentos institucionales.
- ✍️ Documentos firmados digitalmente.
- ⚖️ Disposiciones legales y normativas.
- 📋 Requisitos regulatorios.
- ⚙️ Controles institucionales.
- 🚚 Procesos y operaciones.
- 📁 Evidencias digitales.
- ⚠️ Riesgos.
- 🔎 Auditorías.
- 🔔 Alertas.
- 🔌 Intercambio electrónico de información.

Por tanto, el marco legal y normativo constituye un componente fundamental para la definición de los requisitos del sistema.

El objetivo de este capítulo es analizar los principales elementos jurídicos y regulatorios relacionados con el funcionamiento del SGCI y determinar cómo dichos elementos pueden transformarse en requisitos funcionales, requisitos no funcionales, mecanismos de control y evidencias verificables.

---

# 3.2 Fundamentación jurídica y normativa del SGCI

El cumplimiento de una disposición jurídica no debe depender únicamente del conocimiento individual de los responsables de una organización.

En un sistema de gestión moderno, las obligaciones aplicables deben poder identificarse, estructurarse, asignarse y verificarse.

El SGCI adopta el siguiente modelo conceptual:

```text
⚖️ NORMA JURÍDICA
        ↓
📌 DISPOSICIÓN APLICABLE
        ↓
📋 OBLIGACIÓN
        ↓
🎯 REQUISITO
        ↓
⚙️ CONTROL
        ↓
📁 EVIDENCIA
        ↓
🔎 VERIFICACIÓN
        ↓
📊 ESTADO DE CUMPLIMIENTO
```

Este modelo permite transformar disposiciones jurídicas y normativas en elementos gestionables dentro del sistema.

La normativa deja de ser solamente un documento archivado para convertirse en **conocimiento operativo**, capaz de generar requisitos, controles, responsabilidades y mecanismos de verificación.

## 🎯 Principios aplicables al diseño

La arquitectura funcional y tecnológica del SGCI debe orientarse por los siguientes principios:

- 🔐 Protección de la información.
- 👤 Protección de datos personales.
- 🛡️ Confidencialidad.
- 🔒 Integridad.
- ⚡ Disponibilidad.
- 📜 Trazabilidad.
- 🔎 Auditabilidad.
- 📄 Conservación documental.
- ✍️ Autenticidad.
- 🔌 Interoperabilidad.
- 🔄 Adaptabilidad normativa.

---

# 3.3 Protección de datos personales

La protección de los datos personales constituye uno de los elementos fundamentales que deben considerarse durante el diseño del SGCI.

La **Ley No. 149 de 2022, De Protección de Datos Personales**, establece un marco jurídico para la protección de los datos personales tratados mediante registros, archivos, bases de datos y otros medios, incluyendo aquellos soportados por tecnologías digitales.

## 👤 Información potencialmente tratada

El SGCI puede gestionar:

- 👤 Nombre y apellidos.
- 🆔 Identificadores institucionales.
- 📧 Información de contacto.
- 🏢 Cargo o responsabilidad.
- 🔐 Credenciales y mecanismos de acceso.
- 📜 Historial de acciones.
- ✍️ Información asociada a firmas.
- 🔎 Responsabilidades en auditorías.
- 📋 Responsabilidades en procesos.
- ⚙️ Acciones realizadas dentro del sistema.

## 🔐 Implicaciones para el SGCI

### 🔑 Control de acceso

```text
👤 Usuario
    ↓
🔐 Autenticación
    ↓
🪪 Identidad verificada
    ↓
🔑 Autorización
    ↓
📊 Información permitida
```

### 🏷️ Clasificación de la información

```text
🟢 PÚBLICA
🔵 INTERNA
🟠 RESTRINGIDA
🔴 CONFIDENCIAL
```

La clasificación debe influir sobre la consulta, modificación, descarga, exportación, compartición y conservación de la información.

### 📜 Trazabilidad del tratamiento

Las acciones relevantes deben registrar:

- 👤 Usuario.
- ⚙️ Acción realizada.
- 📄 Recurso afectado.
- 🕒 Fecha y hora.
- 📍 Contexto.
- 📊 Resultado.

---

# 3.4 Documentos electrónicos

Para el SGCI, un documento electrónico no debe interpretarse únicamente como un archivo almacenado.

```text
📄 DOCUMENTO ELECTRÓNICO
│
├── 🆔 Identificador
├── 📝 Contenido
├── 👤 Autor
├── 📅 Fecha
├── 🔢 Versión
├── 🔐 Integridad
├── ✍️ Firma
├── 📜 Estado
└── 🔎 Historial
```

## 📋 Requisitos documentales

El sistema deberá permitir:

- 📄 Crear documentos.
- 📥 Incorporar documentos externos.
- 🔢 Gestionar versiones.
- 🔐 Verificar integridad.
- ✍️ Relacionar firmas digitales.
- 🏷️ Clasificar información.
- 📜 Mantener historial.
- 📁 Gestionar evidencias.
- 📅 Aplicar políticas de conservación.

## 🔢 Versionado documental

```text
📄 Documento
│
├── Versión 1
├── Versión 2
├── Versión 3
└── Versión vigente
```

El sistema debe evitar sobrescribir permanentemente las versiones históricas cuando estas sean necesarias como evidencia.

---

# 3.5 Firma digital

La utilización de mecanismos de firma digital constituye un elemento relevante dentro de los procesos de transformación digital institucional.

El SGCI debe estar preparado para gestionar la relación entre documentos, firmantes, versiones y estados de validación.

```text
📄 DOCUMENTO
        ↓
✍️ FIRMA DIGITAL
        ↓
👤 IDENTIDAD DEL FIRMANTE
        ↓
📜 INFORMACIÓN DE VALIDACIÓN
        ↓
🔐 ESTADO
        ↓
📁 EVIDENCIA
```

## 🧩 Información asociada

El sistema debe poder responder:

- ❓ ¿Quién firmó?
- ❓ ¿Qué documento firmó?
- ❓ ¿Qué versión fue firmada?
- ❓ ¿Cuándo se realizó la firma?
- ❓ ¿Cuál es el estado de validación?
- ❓ ¿Qué evidencia existe?

```text
DigitalSignature
│
├── Id
├── DocumentId
├── DocumentVersionId
├── SignerId
├── SignedAt
├── CertificateReference
├── ValidationStatus
├── SignatureReference
└── VerificationEvidence
```

---

# 3.6 Comercio electrónico

El desarrollo del comercio electrónico exige mecanismos tecnológicos capaces de registrar operaciones, intercambiar información y garantizar seguridad y trazabilidad.

```text
🌐 OPERACIÓN ELECTRÓNICA
│
├── 🆔 Identificación
├── 👤 Responsable
├── 🕒 Registro temporal
├── 📍 Estado
├── 🔐 Integridad
├── 🔄 Trazabilidad
└── 📁 Evidencias
```

El SGCI debe estar preparado para:

- Registrar operaciones.
- Identificar responsables.
- Mantener historial de estados.
- Relacionar documentos y evidencias.
- Registrar intercambios electrónicos.
- Proteger información.
- Garantizar trazabilidad.

---

# 3.7 Actualización del marco del comercio interior

La evolución normativa exige que el SGCI pueda gestionar cambios regulatorios y analizar su impacto.

```text
⚖️ NORMA
    │
    ▼
🆕 NUEVA VERSIÓN
    │
    ▼
🔍 ANÁLISIS DEL CAMBIO
    │
    ▼
📋 REQUISITOS AFECTADOS
    │
    ▼
⚙️ CONTROLES AFECTADOS
    │
    ▼
🚚 PROCESOS AFECTADOS
    │
    ▼
👤 RESPONSABLES
    │
    ▼
🔔 ALERTAS
```

## 🧩 Principio fundamental

El sistema debe evitar eliminar la historia normativa y adoptar un modelo de **versionado normativo**.

---

# 3.8 Seguridad de la información

La seguridad constituye un requisito transversal del SGCI.

## 🔐 Confidencialidad

La información debe ser accesible únicamente por personas o sistemas autorizados.

## 🛡️ Integridad

La información debe mantenerse protegida contra modificaciones no autorizadas.

## ⚡ Disponibilidad

Los servicios y la información deben encontrarse disponibles cuando sean necesarios.

Para ello deben considerarse:

- 💾 Copias de seguridad.
- 🔄 Recuperación.
- 🏗️ Arquitectura resiliente.
- 📊 Monitorización.
- 🚨 Gestión de incidentes.

---

# 3.9 Conservación documental y evidencias digitales

El SGCI debe gestionar el ciclo completo de los documentos y evidencias.

```text
📄 CREACIÓN
     ↓
🔐 CLASIFICACIÓN
     ↓
📦 CONSERVACIÓN
     ↓
🔎 CONSULTA
     ↓
📜 TRAZABILIDAD
     ↓
📅 RETENCIÓN
     ↓
🗃️ ARCHIVO / DISPOSICIÓN
```

## 📁 Modelo conceptual

```text
Evidence
│
├── Id
├── Type
├── RelatedEntity
├── RelatedEntityId
├── CreatedAt
├── CreatedBy
├── Classification
├── Version
├── Hash
├── StorageReference
└── AuditHistory
```

## 🔐 Integridad documental

```text
📄 DOCUMENTO
      ↓
🔐 HASH
      ↓
📜 REGISTRO
      ↓
🔎 VERIFICACIÓN
```

---

# 3.10 Trazabilidad y auditoría

El SGCI debe permitir reconstruir las acciones relevantes.

Debe responder:

- ❓ ¿Qué ocurrió?
- ❓ ¿Quién realizó la acción?
- ❓ ¿Cuándo ocurrió?
- ❓ ¿Sobre qué recurso?
- ❓ ¿Qué cambió?
- ❓ ¿Cuál fue el resultado?

## 📜 Audit Trail

```text
AuditEvent
│
├── Id
├── Timestamp
├── ActorId
├── Action
├── Module
├── EntityType
├── EntityId
├── PreviousState
├── NewState
├── Result
└── CorrelationId
```

## 🔎 Eventos relevantes

- 🔐 LOGIN
- 🔓 LOGOUT
- 📄 DOCUMENT_CREATED
- ✏️ DOCUMENT_UPDATED
- 🗑️ DOCUMENT_DELETED
- 📥 DOCUMENT_DOWNLOADED
- ✍️ DOCUMENT_SIGNED
- ⚖️ NORMATIVE_UPDATED
- ⚠️ RISK_CREATED
- 🚨 ALERT_TRIGGERED
- 🔑 PERMISSION_CHANGED
- 🔌 INTEGRATION_EXECUTED

---

# 3.11 Intercambio electrónico de información e interoperabilidad

El SGCI debe estar preparado para interoperar mediante:

- 🌐 APIs.
- 📡 Eventos.
- 📥 Importaciones.
- 📤 Exportaciones.
- 📄 Documentos electrónicos.
- 🔄 Procesos de sincronización.

## 📡 Registro de integraciones

```text
IntegrationLog
│
├── Id
├── SourceSystem
├── TargetSystem
├── Operation
├── Timestamp
├── Actor
├── Status
├── IntegrityReference
└── Result
```

El sistema debe poder determinar qué información se envió o recibió, quién inició la operación, cuándo ocurrió, qué mecanismos de seguridad se utilizaron y cuál fue el resultado.

---

# 3.12 La normativa como conocimiento operativo

La normativa no debe gestionarse únicamente como un conjunto de documentos.

Debe convertirse en una estructura operativa:

```text
⚖️ NORMA
      ↓
📋 OBLIGACIÓN
      ↓
🎯 REQUISITO
      ↓
⚙️ CONTROL
      ↓
🚚 PROCESO
      ↓
📁 EVIDENCIA
      ↓
🔎 AUDITORÍA
      ↓
📊 CUMPLIMIENTO
```

---

# 3.13 Matriz de requisitos legales y normativos

## 🔐 Protección de datos personales

| Área | Necesidad | Requisito SGCI | Mecanismo | Evidencia |
|---|---|---|---|---|
| 🔐 Datos personales | Identificación | Autenticación | Gestión de identidad | Registro de acceso |
| 🔑 Acceso | Control de permisos | Autorización | Roles y permisos | Log de autorización |
| 🏷️ Información | Clasificación | Etiquetado | Security Labels | Clasificación registrada |
| 📜 Acciones | Trazabilidad | Audit Trail | Registro de eventos | Historial |
| 🛡️ Protección | Restricción | Control de acceso | RBAC/ABAC | Eventos de autorización |
| 👤 Responsabilidad | Identificación | Gestión de responsables | Asignación | Registro institucional |

## ✍️ Documentos electrónicos y firma digital

| Área | Necesidad | Requisito SGCI | Función |
|---|---|---|---|
| ✍️ Firma | Identificar firmante | Gestión de identidad | 👤 Signer |
| 📄 Documento | Relacionar firma | Vínculo documental | 🆔 DocumentId |
| 🔢 Versión | Identificar contenido firmado | Versionado | DocumentVersion |
| 📜 Evidencia | Conservar información | Registro de firma | Signature Log |
| 🔍 Validación | Verificar estado | Estado de validación | ValidationStatus |
| 🔐 Integridad | Detectar modificaciones | Hash documental | Integrity Check |

## 🌐 Comercio electrónico

| Principio | Requisito | Implementación |
|---|---|---|
| 📄 Gestión documental | Documentos electrónicos | Gestión documental |
| ✍️ Identificación | Firma o validación | Integración |
| 🔐 Seguridad | Protección tecnológica | Controles de acceso |
| 🔎 Trazabilidad | Registro de operaciones | Audit Trail |
| 👁️ Transparencia | Consulta verificable | Historial |
| 🛡️ Privacidad | Protección de información | Clasificación |
| 🔄 Evolución | Actualización | Versionado |

## 🏢 Comercio interior y cambios normativos

| Necesidad | Requisito SGCI | Función |
|---|---|---|
| 🆕 Nueva norma | Registro | Gestión normativa |
| 🔄 Cambio | Versionado | Historial |
| 🔍 Impacto | Análisis | Matriz de impacto |
| 📋 Obligación | Requisito | Gestión de requisitos |
| ⚙️ Control | Seguimiento | Gestión de controles |
| 🚚 Proceso | Relación | Trazabilidad |
| 🔔 Cambio relevante | Notificación | Sistema de alertas |

---

# 3.14 Arquitectura conceptual de cumplimiento normativo

```text
                    ⚖️ MARCO LEGAL
                          │
                          ▼
                    📚 NORMATIVA
                          │
                          ▼
                    📋 REQUISITOS
                          │
                          ▼
                     ⚙️ CONTROLES
                          │
                          ▼
                    🚚 PROCESOS
                          │
                          ▼
                     📁 EVIDENCIAS
                          │
                          ▼
                    🔎 AUDITORÍA
                          │
                          ▼
                  📊 CUMPLIMIENTO
```

Este modelo integra el marco jurídico con los procesos institucionales y tecnológicos.

---

# 3.15 Requisitos legales funcionales del SGCI

## 🔐 RF-L01 — Autenticación

El sistema debe permitir identificar a los usuarios antes de acceder a funciones protegidas.

## 🔑 RF-L02 — Gestión de permisos

El sistema debe permitir controlar las acciones autorizadas para cada usuario o grupo.

## 🏷️ RF-L03 — Clasificación de información

El sistema debe permitir asignar niveles de clasificación a documentos, evidencias y otros recursos.

## 📜 RF-L04 — Auditoría de acciones

El sistema debe registrar acciones relevantes realizadas por usuarios y componentes.

## 📄 RF-L05 — Gestión de documentos electrónicos

El sistema debe permitir crear, almacenar, consultar y relacionar documentos electrónicos.

## 🔢 RF-L06 — Versionado documental

El sistema debe conservar versiones relevantes de los documentos.

## 🔐 RF-L07 — Verificación de integridad

El sistema debe permitir registrar mecanismos que faciliten la verificación de integridad.

## ✍️ RF-L08 — Gestión de firmas digitales

El sistema debe estar preparado para registrar y relacionar información asociada a firmas digitales y sus procesos de validación.

## ⚖️ RF-L09 — Gestión normativa

El sistema debe permitir registrar normas, disposiciones y requisitos aplicables.

## 🔄 RF-L10 — Versionado normativo

El sistema debe permitir conservar versiones y cambios de las disposiciones registradas.

## 🔎 RF-L11 — Trazabilidad normativa

El sistema debe relacionar normas, requisitos, controles, procesos y evidencias.

## 📁 RF-L12 — Gestión de evidencias

El sistema debe permitir almacenar y relacionar evidencias con controles y procesos.

## 🔔 RF-L13 — Alertas normativas

El sistema debe permitir generar alertas relacionadas con cambios, incumplimientos o vencimientos.

## 🔌 RF-L14 — Registro de integraciones

El sistema debe registrar información relevante sobre intercambios electrónicos con otros sistemas.

## 📊 RF-L15 — Seguimiento de cumplimiento

El sistema debe permitir visualizar y evaluar el estado de cumplimiento de requisitos y controles.

---

# 3.16 Requisitos no funcionales derivados

| Código | Requisito |
|---|---|
| RNF-L01 | 🔐 Confidencialidad |
| RNF-L02 | 🛡️ Integridad |
| RNF-L03 | ⚡ Disponibilidad |
| RNF-L04 | 📜 Trazabilidad |
| RNF-L05 | 🔄 Recuperabilidad |
| RNF-L06 | 📈 Escalabilidad |
| RNF-L07 | 🔌 Interoperabilidad |
| RNF-L08 | 🧩 Mantenibilidad |
| RNF-L09 | 🔍 Auditabilidad |
| RNF-L10 | 📦 Conservación de evidencias |

El sistema debe garantizar mecanismos adecuados para proteger la información, detectar modificaciones relevantes, mantener disponibilidad, reconstruir acciones, recuperar información crítica e interoperar de forma controlada.

---

# 3.17 Conclusiones del capítulo

El análisis del marco legal y normativo demuestra que el SGCI debe ser concebido como una plataforma de gestión y control capaz de integrar requisitos jurídicos, organizacionales y tecnológicos.

La protección de datos personales exige mecanismos adecuados de identificación, autorización, clasificación y trazabilidad.

La utilización creciente de documentos electrónicos requiere mecanismos para gestionar versiones, integridad, conservación y evidencia documental.

La firma digital exige relacionar documentos, firmantes, versiones y estados de validación.

La evolución del comercio electrónico y del comercio interior refuerza la necesidad de que el sistema pueda adaptarse a cambios normativos y gestionar su impacto sobre requisitos, procesos y controles.

La seguridad de la información debe considerarse como un elemento transversal:

```text
🔐 CONFIDENCIALIDAD
🛡️ INTEGRIDAD
⚡ DISPONIBILIDAD
📜 TRAZABILIDAD
🔎 AUDITABILIDAD
```

## 🏆 Principio rector

> **Toda obligación relevante debe poder relacionarse con un requisito, un control, una evidencia y un mecanismo de verificación.**

```text
⚖️ OBLIGACIÓN
       ↓
📋 REQUISITO
       ↓
⚙️ CONTROL
       ↓
📁 EVIDENCIA
       ↓
🔎 VERIFICACIÓN
       ↓
📊 ESTADO DE CUMPLIMIENTO
```

La aplicación de este modelo permitirá que el SGCI no se limite a almacenar información normativa, sino que transforme las disposiciones aplicables en elementos operativos y verificables.

---

# 📚 Referencias normativas y documentales

Entre las disposiciones y fuentes que deben considerarse para la versión académica definitiva y la implementación del SGCI se encuentran:

- ⚖️ **Ley No. 149 de 2022, De Protección de Datos Personales.**
- ✍️ Disposiciones cubanas relacionadas con la utilización y los servicios de firma digital de documentos electrónicos.
- 🏢 Disposiciones del Ministerio del Comercio Interior relacionadas con documentos firmados digitalmente y procesos institucionales.
- 🌐 Regulaciones cubanas relacionadas con el comercio electrónico.
- 🏪 Disposiciones vigentes relacionadas con la organización y desarrollo del comercio interior.
- 📡 Normativa aplicable al intercambio electrónico de información en los procesos institucionales donde opere el sistema.
- 🔐 Disposiciones relacionadas con la seguridad, integridad, disponibilidad y confidencialidad de la información.
- 📄 Normativa aplicable a la conservación documental y a la gestión de evidencias electrónicas.

> ⚠️ **Nota metodológica:** antes de la entrega académica final o de la implantación productiva del SGCI, cada disposición normativa debe verificarse directamente en su versión oficial vigente y analizarse según el ámbito específico de aplicación de la organización.

---

# 🏁 Estado del capítulo

```text
📖 CAPÍTULO 3
══════════════════════════════════════

⚖️ Marco legal y normativo
🔐 Protección de datos personales
📄 Documentos electrónicos
✍️ Firma digital
🌐 Comercio electrónico
🏢 Comercio interior
🔒 Seguridad de la información
📁 Conservación documental
🔎 Auditoría y trazabilidad
🔌 Interoperabilidad
📋 Requisitos legales del SGCI
🏗️ Arquitectura conceptual de cumplimiento
📊 Matrices de trazabilidad

══════════════════════════════════════

✅ CAPÍTULO ESTRUCTURADO Y CONSOLIDADO
```
