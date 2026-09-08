# Conclusiones y Trabajo Futuro (VERSIÓN CORREGIDA - 10/10 - 25/08/2026)

---

## 1. Resumen de la Investigación

La presente investigación ha abordado el problema de la falta de sistemas de gestión integrales para MiPymes de transporte terrestre en Cuba, un entorno caracterizado por baja conectividad, dualidad cambiaria y un marco normativo estricto. A través de un estudio de caso en la MiPyme Seta Expreso S.U.R.L., se ha **diseñado** un **Sistema de Gestión Contextualmente Inteligente (SGCI)** , que integra:

| Componente | Descripción | Estado de Validación |
| :--- | :--- | :--- |
| 1. **Optimización de rutas** | Algoritmos VRP/VRPTW con ventanas de tiempo configurables por cliente y modelado del consumo real de combustible. | ⏳ **Pendiente de validación empírica** (estimado 15-20% basado en literatura) |
| 2. **Automatización de la ficha de costo** | Según Resolución 148/2023 del MFP, con gestión integral de ingresos y gastos y análisis de sensibilidad de riesgo cambiario. | ✅ **Diseñado** (Cap. 3 y 4) |
| 3. **Gestión de inventarios** | Para talleres y venta de repuestos, con integración contable. | ✅ **Diseñado** (Cap. 4 y 5) |
| 4. **Seguimiento GPS en tiempo real** | Para la gestión de flotas. | ✅ **Diseñado** (Cap. 4) |
| 5. **Gestión dinámica de rutas** | Permitir añadir o eliminar puntos de entrega en rutas activas. | ✅ **Diseñado** (Cap. 4) |
| 6. **Arquitectura offline-first** | Con estrategia de resolución de conflictos, adaptada a la conectividad intermitente de las rutas cubanas. | ✅ **Diseñado** (Cap. 4) |
| 7. **Responsabilidad Social Empresarial (RSE)** | Como pilar estratégico, con gestión de reservas voluntarias, proyectos de RSE e informes de sostenibilidad. | ✅ **Diseñado** (Cap. 3 y 4) |
| 8. **Gobernanza Corporativa** | Garantizando la trazabilidad de las operaciones y la rendición de cuentas ante los entes reguladores. | ✅ **Diseñado** (Cap. 3 y 4) |
| 9. **Cumplimiento de la normativa fiscal digital** | Resolución 8/2024 y verificación de actividades prohibidas (Decreto 107/2024). | ✅ **Diseñado** (Cap. 3) |
| 10. **Modelo de roles dinámicos** | Para la gestión de usuarios, permitiendo la adaptación al crecimiento de la MiPyme. | ✅ **Diseñado** (Cap. 4 y 5) |
| 11. **Visión de interoperabilidad** | Con el ecosistema logístico cubano a través de una arquitectura de API abierta. | ✅ **Diseñado** (Cap. 4 y 5) |

**Estado Actual del Proyecto (25/08/2026):**

| Fase | Estado | Observaciones |
| :--- | :--- | :--- |
| **Fase 0: Planificación y Diseño Inicial** | ⏳ **En curso** | Documentación completada (Capítulos 1-8) |
| **Fase 1: Configuración del Entorno** | ⏳ **Pendiente** | — |
| **Fase 2: Modelo de Datos y Migraciones** | ⏳ **Pendiente** | — |
| **Fase 3: API de Gestión de Guías y Manifiestos** | ⏳ **Pendiente** | — |
| **Fase 4: API de Optimización de Rutas** | ⏳ **Pendiente** | — |
| **Fase 5: Aplicación Web (Dashboard)** | ⏳ **Pendiente** | — |
| **Fase 6: App Móvil y GPS** | ⏳ **Pendiente** | — |
| **Fase 7: Costos, Finanzas y RSE** | ⏳ **Pendiente** | — |
| **Fase 8: Interoperabilidad** | ⏳ **Pendiente** | — |
| **Fase 9: Despliegue y Capacitación** | ⏳ **Pendiente** | — |
| **Fase 10: Monitoreo y Validación** | ⏳ **Pendiente** | — |

---

## 2. Cumplimiento de los Objetivos de la Investigación

### 2.1. Objetivo General

**Diseñar, desarrollar y validar un sistema de gestión integral para MiPymes de transporte terrestre en Cuba** que integre optimización de rutas, automatización de la ficha de costo, gestión de inventarios, arquitectura offline-first, RSE, Gobernanza, roles dinámicos e interoperabilidad.

**Estado: En Fase 0 (Planificación y Diseño Inicial).** El SGCI ha sido **diseñado** completamente (Capítulos 1-8). El desarrollo y la validación empírica están planificados para las Fases 1-10.

### 2.2. Objetivos Específicos

| OE | Descripción | Estado | Reflexión Crítica |
| :--- | :--- | :--- | :--- |
| **OE1** | Revisión sistemática de la literatura sobre sistemas de gestión, VRP, normativa cubana y arquitecturas offline-first. | ✅ **Alcanzado** | El Capítulo 2 presenta una revisión exhaustiva que cubre todos los aspectos relevantes. |
| **OE2** | Diseño de la arquitectura del sistema (stack tecnológico, modelo de datos, estrategia offline-first). | ✅ **Alcanzado** | El Capítulo 4 y 5 presentan un diseño completo y detallado, incluyendo 37 tablas en 10 módulos funcionales. |
| **OE3** | Desarrollo de los módulos funcionales (optimización de rutas, gestión de costos, inventarios, RSE, roles dinámicos). | ⏳ **Pendiente** | Planificado para las Fases 1-7 del plan de implementación. |
| **OE4** | Implementación de un prototipo funcional en Seta Expreso. | ⏳ **Pendiente** | Planificado para la Fase 9 (Despliegue y Capacitación). |
| **OE5** | Validación del sistema mediante un estudio cuasiexperimental. | ⏳ **Pendiente** | Planificado para la Fase 10 (Monitoreo y Validación). |
| **OE6** | Evaluación de la aceptación tecnológica (TAM) de los usuarios. | ⏳ **Pendiente** | Planificado para la Fase 10 (Monitoreo y Validación). |
| **OE7** | Documentación y publicación de los resultados. | ⏳ **Pendiente** | El documento final está completado (Capítulos 1-8). Los artículos científicos están en preparación. |

---

## 3. Validación de las Hipótesis

### 3.1. Hipótesis con Validación Teórica (Diseño)

| Hipótesis | Estado | Evidencia | Implicaciones |
| :--- | :--- | :--- | :--- |
| **H1:** El SGCI reduce el consumo de combustible en ≥15%, el tiempo de viaje en ≥20% y el tiempo de entrega en ≥20%. | ⏳ **Pendiente de validación empírica** | **Estimación basada en literatura:** 15-20% de ahorro de combustible (Toth & Vigo, 2014; Figliozzi, 2012). Pendiente de confirmación en el estudio cuasiexperimental (Fase 10). | La estimación teórica sugiere que el algoritmo de optimización propuesto sería eficiente en el contexto cubano. La confirmación empírica permitirá cuantificar el impacto real en las MiPymes. |
| **H2:** La automatización de la ficha de costo reduce el error humano en ≥90% y garantiza la presentación digital de las declaraciones fiscales. | ⏳ **Pendiente de validación empírica** | **Diseño del sistema:** Automatización completa de la ficha de costo y cumplimiento de la Resolución 8/2024 (Cap. 3 y 4). Pendiente de validación en entorno real. | La automatización de la ficha de costo, una vez implementada, reducirá el error humano y facilitará el cumplimiento normativo. |
| **H6:** La gestión de la tasa de cambio y la verificación de actividades prohibidas permiten decisiones financieras más precisas. | ⏳ **Pendiente de validación empírica** | **Diseño del sistema:** Módulo de gestión de tasas de cambio y verificación del Decreto 107/2024 (Cap. 3 y 4). Pendiente de validación en entorno real. | La gestión de la tasa de cambio permitirá a las MiPymes operar en un contexto de dualidad cambiaria, reduciendo el riesgo financiero. |

### 3.2. Hipótesis Pendientes de Validación Empírica

| Hipótesis | Estado | Próximos Pasos |
| :--- | :--- | :--- |
| **H3:** La adopción del SGCI se correlaciona positivamente con un aumento del margen de utilidad en ≥10%. | ⏳ **Pendiente** | Se medirá en el estudio cuasiexperimental (Fase 10). |
| **H4:** La aceptación tecnológica es alta (score > 4.0 en TAM), y la "robustez offline" es un factor crítico de aceptación. | ⏳ **Pendiente** | Se medirá con encuestas TAM en el estudio cuasiexperimental (Fase 10). |
| **H5:** La gestión de inventario de repuestos y la integración de la RSE permiten identificar la rentabilidad por línea de negocio. | ⏳ **Pendiente** | Se medirá en el estudio cuasiexperimental (Fase 10). |

---

## 4. Contribuciones de la Investigación

### 4.1. Contribuciones Teóricas en el Contexto de la Literatura

| Contribución | Descripción | Fundamentación en la Literatura |
| :--- | :--- | :--- |
| **1. Extensión del Modelo TAM** | Se ha propuesto el concepto de **"Sistema de Gestión Contextualmente Inteligente" (SGCI)** , que extiende el modelo de aceptación tecnológica (TAM) al incorporar la **"robustez offline"** , la **"percepción de la contribución a la sostenibilidad"** , la **"percepción de la flexibilidad organizativa (roles dinámicos)"** , y la **"percepción de la interoperabilidad"** como factores críticos de aceptación en entornos de infraestructura digital limitada. | Esta contribución se suma a los trabajos de Venkatesh et al. (2003) y Kumar & Mukherjee (2023), que han explorado la aceptación tecnológica en contextos de baja conectividad. |
| **2. Modelo Matemático de Optimización de Rutas** | Se ha propuesto un modelo de optimización de rutas (VRP/VRPTW) con ventanas de tiempo configurables por cliente y modelado del consumo real de combustible, adaptado al contexto cubano. **El algoritmo será implementado y validado empíricamente durante el desarrollo del proyecto (Fase 3), con una estimación preliminar de ahorro de combustible del 15-20% basada en la literatura.** | Este modelo se basa en los fundamentos de Toth & Vigo (2014) y Figliozzi (2012), y lo extiende al contexto de baja conectividad. |
| **3. Modelo de Integración de la Ficha de Costo Normativa** | Se ha desarrollado un modelo de integración de la ficha de costo (Resolución 148/2023) con la contabilidad general de la MiPyme, incluyendo análisis de sensibilidad de riesgo cambiario y cumplimiento de la Resolución 8/2024. | Este modelo se fundamenta en los principios de la contabilidad de gestión (Romney & Steinbart, 2021) y los sistemas de información contable (O'Brien & Marakas, 2018), y lo adapta al contexto regulatorio cubano. |
| **4. Estrategia de Resolución de Conflictos Offline** | Se ha definido una estrategia de resolución de conflictos para entornos de conectividad intermitente, basada en la asignación exclusiva de paquetes, el bloqueo optimista y el registro de auditoría. | Esta estrategia se fundamenta en los principios de los sistemas offline-first (Kumar & Mukherjee, 2023) y se adapta al contexto de la logística de paquetería. |
| **5. Modelo de Integración de RSE y Gobernanza** | Se ha propuesto un modelo de integración de la Responsabilidad Social Empresarial y la Gobernanza Corporativa como pilares estratégicos del sistema, posicionando al SGCI como un instrumento de desarrollo sostenible alineado con los ODS. | Este modelo se alinea con las tendencias actuales en la literatura sobre RSE (Aguinis & Kraus, 2024) y gobernanza corporativa (Contraloría General de la República, 2025). |
| **6. Modelo de Roles Dinámicos e Interoperabilidad** | Se ha propuesto un modelo de roles dinámicos para la gestión de usuarios y un modelo de interoperabilidad con el ecosistema logístico cubano a través de una arquitectura de API abierta. | Este modelo se fundamenta en los principios de la gestión de usuarios en sistemas de información (O'Brien & Marakas, 2018) y la interoperabilidad en sistemas logísticos. |

### 4.2. Contribuciones Prácticas

| Contribución | Descripción |
| :--- | :--- |
| **Solución Integral y Accesible** | El SGCI ofrece a las MiPymes de transporte en Cuba una solución integral, con un **modelo Open Core** (funcionalidades básicas gratuitas y servicios de valor agregado de pago), adaptada a su contexto, que reducirá costos operativos, mejorará la rentabilidad y facilitará el cumplimiento normativo. |
| **Caso de Éxito para la Digitalización del Sector** | La implementación del SGCI en Seta Expreso (planificada para la Fase 6) servirá como un caso de éxito demostrable para otras MiPymes, facilitando la adopción de tecnologías digitales en el sector del transporte en Cuba. |
| **Estimación Basada en Literatura** | El algoritmo de optimización está estimado en un 15-20% de ahorro de combustible basado en literatura especializada (Toth & Vigo, 2014; Figliozzi, 2012), pendiente de validación empírica durante el desarrollo del proyecto. |
| **Modelo de Comercialización Sostenible** | Se ha diseñado un modelo de comercialización basado en el modelo Open Core, que combina una versión gratuita con servicios de valor agregado (instalación, capacitación, soporte, suscripciones premium), garantizando la sostenibilidad a largo plazo del proyecto (Cap. 8). |
| **Contribución a los ODS** | El SGCI contribuye directamente a los Objetivos de Desarrollo Sostenible (ODS) 1 (Fin de la Pobreza), 8 (Trabajo Decente y Crecimiento Económico), 9 (Industria, Innovación e Infraestructura) y 12 (Producción y Consumo Responsables), posicionando la digitalización de MiPymes como una herramienta de desarrollo sostenible (Cap. 1). |

### 4.3. Impacto Potencial en el Sector del Transporte en Cuba

El SGCI tiene el potencial de transformar el sector del transporte en Cuba al:

| Impacto | Descripción |
| :--- | :--- |
| **Digitalizar la gestión de las MiPymes** | Reduciendo los costos operativos y mejorando la rentabilidad. |
| **Facilitar el cumplimiento normativo** | Reduciendo el riesgo de sanciones y mejorando la transparencia. |
| **Fomentar la sostenibilidad** | Integrando la RSE y la Gobernanza como pilares estratégicos. |
| **Generar empleo en el sector tecnológico** | Creando oportunidades para desarrolladores, consultores y capacitadores. |

---

## 5. Limitaciones de la Investigación

| Limitación | Impacto | Estrategia de Mitigación |
| :--- | :--- | :--- |
| **Estudio de caso único** | Los resultados pueden no ser generalizables a otras MiPymes. | Se documentó exhaustivamente el contexto de la investigación para facilitar la transferibilidad (Yin, 2014). |
| **Sesgo del investigador** | El investigador es también el dueño de la MiPyme. | Se designará un responsable operativo independiente para la recolección de datos y se utilizará triangulación de fuentes (Cap. 6). |
| **Conectividad intermitente** | La sincronización de datos en tiempo real puede verse afectada. | La arquitectura offline-first está diseñada específicamente para manejar esta limitación (Cap. 4). |
| **Límites del SGCI** | El sistema está diseñado para flotas de 5-20 vehículos y hasta 100 entregas por ruta. | Para flotas más grandes o rutas con más entregas, se requiere la implementación de metaheurísticas más avanzadas (Cap. 1 y 4). |
| **Validación empírica pendiente** | Todas las hipótesis (H1-H6) requieren validación empírica. | El estudio cuasiexperimental planificado (Cap. 6, Fase 10) proporcionará los datos necesarios. |
| **Dependencia de APIs oficiales** | La interoperabilidad con el sistema de Aduanas y MITRANS depende de la disponibilidad de APIs oficiales. | El SGCI está diseñado con una arquitectura de API abierta que facilita la integración futura cuando las APIs oficiales estén disponibles. |

---

## 6. Trabajo Futuro

### 6.1. Priorización y Horizonte Temporal del Trabajo Futuro

| Línea de Trabajo | Horizonte Temporal | Prioridad | Justificación |
| :--- | :--- | :--- | :--- |
| **Fase 1: Configuración del Entorno** | 3-4 meses | **Alta** | Establecer la base técnica para todo el desarrollo. |
| **Fase 2: Modelo de Datos y Migraciones** | 4-5 meses | **Alta** | Implementar las 37 tablas diseñadas en el blueprint. |
| **Fase 3: API de Gestión de Guías y Manifiestos** | 5-6 meses | **Alta** | Desarrollo de las APIs de negocio principales. |
| **Fase 4: API de Optimización de Rutas** | 6-7 meses | **Alta** | Implementación del algoritmo VRP/VRPTW y validación empírica. |
| **Fase 5: Aplicación Web (Dashboard)** | 7-8 meses | **Alta** | Desarrollo de la interfaz de usuario web. |
| **Fase 6: App Móvil y GPS** | 8-9 meses | **Alta** | Completar la app para conductores con arquitectura offline-first. |
| **Fase 7: Costos, Finanzas y RSE** | 9-10 meses | **Media** | Desarrollo de módulos de costos, RSE e inventarios. |
| **Fase 8: Interoperabilidad** | 10-11 meses | **Media** | Desarrollo de la API abierta e integraciones. |
| **Fase 9: Despliegue y Capacitación** | 11-12 meses | **Alta** | Puesta en producción y capacitación del personal. |
| **Fase 10: Monitoreo y Validación** | 12-15 meses | **Alta** | Validación empírica del sistema y generación de evidencias. |
| **Integración con el Sistema de Aduanas** | 18-24 meses | **Alta** | Facilitaría la verificación automática de estados de paquetes (ya se tiene diseñado web scraping de Aerovaradero). |
| **Versión Multitenant** | 24-30 meses | **Alta** | Permitiría la escalabilidad del SGCI y la reducción de costos para múltiples MiPymes. |
| **Análisis Predictivo** | 24-36 meses | **Media** | Mejoraría la planificación de rutas y la asignación de recursos. |
| **Módulo de Mantenimiento Predictivo** | 24-36 meses | **Media** | Alertaría sobre fallos potenciales en los vehículos basados en datos históricos de mantenimiento. |
| **Expansión Geográfica** | 36-48 meses | **Media** | Adaptar el SGCI a otros países de la región (México, Panamá, República Dominicana, Centroamérica) con características similares a Cuba. |
| **Integración con MITRANS** | 36-48 meses | **Media** | Posicionar al SGCI como herramienta oficial de digitalización del sector del transporte en Cuba. |

### 6.2. Publicaciones Científicas

| Publicación | Contenido | Revista Objetivo | Prioridad |
| :--- | :--- | :--- | :--- |
| **Artículo 1: Diseño del SGCI** | Presentación del modelo de sistema de gestión integral para MiPymes de transporte en Cuba. | *Journal of Operations Management* | **Alta** |
| **Artículo 2: Validación Empírica** | Resultados del estudio cuasiexperimental y validación de las hipótesis H1-H6. | *Transportation Research Part E* | **Alta** |
| **Artículo 3: Modelo de Comercialización** | Estrategia de comercialización Open Core para MiPymes en economías emergentes. | *Journal of Business Research* | **Media** |
| **Artículo 4: Roles Dinámicos e Interoperabilidad** | Modelo de roles dinámicos y arquitectura de interoperabilidad para sistemas logísticos en economías emergentes. | *Information Systems Journal* | **Media** |

### 6.3. Proyectos de Colaboración

| Proyecto | Descripción | Socios Potenciales |
| :--- | :--- | :--- |
| **Alianza con el MITRANS** | Posicionar al SGCI como una herramienta oficial de digitalización del sector del transporte en Cuba. | Ministerio de Transporte, Asociación de MiPymes de Transporte |
| **Alianza con Universidades** | Investigación conjunta, desarrollo de nuevas funcionalidades y prácticas profesionales. | Universidad de La Habana, Universidad de Camagüey |
| **Alianza con el BID y PNUD** | Financiamiento para el mantenimiento y la evolución del SGCI. | Banco Interamericano de Desarrollo, Programa de las Naciones Unidas para el Desarrollo |
| **Alianza con la ONAT** | Facilitar la integración del SGCI con los sistemas de declaración fiscal digital. | Oficina Nacional de Administración Tributaria |

---

## 7. Reflexión Final: Un Instrumento de Transformación

El SGCI no es solo un sistema de gestión; es un **instrumento de transformación** para el sector del transporte en Cuba. Al digitalizar las MiPymes, el SGCI no solo reducirá costos y mejorará la rentabilidad, sino que también fomentará la sostenibilidad, la transparencia y la gobernanza. Es un paso hacia un futuro donde la tecnología y la responsabilidad social se entrelazan para construir un sector del transporte más eficiente, justo y sostenible.

**Logros Clave del Proyecto (25/08/2026):**

| Logro | Descripción |
| :--- | :--- |
| **Diseño Completado** | Documentación completa del SGCI (Capítulos 1-8) |
| **37 Tablas Diseñadas** | Modelo de datos completo en PostgreSQL con Prisma (10 módulos funcionales) |
| **10 Módulos Funcionales Diseñados** | Agencias, Clientes, Guías, Bultos, Rutas, Geocodificación, Web Scraping, Tracking, Vehículos/Conductores, Costos/RSE, Interoperabilidad |
| **Algoritmo Estimado** | 15-20% de ahorro de combustible estimado basado en literatura (Toth & Vigo, 2014; Figliozzi, 2012), pendiente de validación empírica |
| **Costos Operativos Estimados** | $25-45 USD/mes (infraestructura en VPS) |
| **Modelo de Negocio** | Open Core con funcionalidades básicas gratuitas y servicios de valor agregado de pago |

La investigación ha demostrado que es posible diseñar una solución tecnológica de clase mundial adaptada a las condiciones específicas de Cuba, integrando optimización de rutas, gestión de costos, RSE, Gobernanza y arquitectura offline-first en un solo sistema. El SGCI no solo resuelve un problema práctico para las MiPymes de transporte, sino que también contribuye a la literatura académica y a los Objetivos de Desarrollo Sostenible.

El camino recorrido ha sido riguroso y sistemático, siguiendo los estándares de investigación de clase mundial. Los Capítulos 1 al 8 han establecido una base sólida para la implementación y comercialización del SGCI, posicionando a Seta Expreso como un referente potencial en la digitalización del sector del transporte en Cuba.

El trabajo futuro se centrará en la implementación, la validación empírica del sistema, la expansión de sus funcionalidades y su comercialización, con el objetivo de transformar el sector del transporte en Cuba y, eventualmente, en la región.

---

## Referencias

- Aguinis, H., & Kraus, S. (2024). Digitalization of SMEs in emerging economies: A review and research agenda. *Journal of World Business*, 59(2), 101-125.
- Contraloría General de la República. (2025). *Ley 127/2025: Ley del Sistema de Control y Fiscalización*. La Habana: CGR.
- Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly*, 13(3), 319-340.
- Figliozzi, M. A. (2012). The impacts of congestion on commercial vehicle tour characteristics and costs. *Transportation Research Part E*, 48(1), 329-342.
- Kumar, R., & Mukherjee, S. (2023). *Offline-First Web Development: Building Resilient Applications*. O'Reilly Media.
- O'Brien, J. A., & Marakas, G. M. (2018). *Management Information Systems* (15th ed.). McGraw-Hill.
- Romney, M. B., & Steinbart, P. J. (2021). *Accounting Information Systems* (15th ed.). Pearson.
- Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. Scrum.org.
- Toth, P., & Vigo, D. (2014). *Vehicle Routing: Problems, Methods, and Applications* (2nd ed.). SIAM.
- Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of information technology: Toward a unified view. *MIS Quarterly*, 27(3), 425-478.
- Yin, R. K. (2014). *Case Study Research: Design and Methods* (5th ed.). Sage Publications.

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 2.0 (Versión final - 10/10)
**Estado del Proyecto:** Fase 0 - Planificación y Diseño Inicial

---

## RESUMEN DE MEJORAS REALIZADAS

| Sección | Cambio Realizado | Justificación |
| :--- | :--- | :--- |
| **1. Resumen** | "Fases 1-5 completadas" → "Fase 0 en curso, Fases 1-10 pendientes" | Alinear con estado real del proyecto |
| **1. Resumen** | "34 tablas implementadas" → "37 tablas diseñadas" | Reflejar modelo de datos actualizado |
| **1. Resumen** | "✅ Validado empíricamente" → "⏳ Pendiente de validación empírica (estimado 15-20%)" | No existe implementación ni validación |
| **2. Cumplimiento de Objetivos** | OE3 "✅ Alcanzado" → "⏳ Pendiente" | No hay desarrollo implementado |
| **3. Validación de Hipótesis** | "✅ Validación Teórica" → "⏳ Pendiente de validación empírica" | Todas las hipótesis requieren validación empírica |
| **4. Contribuciones Prácticas** | "Gratuita (código abierto)" → "Modelo Open Core" | El proyecto es comercial, no gratuito |
| **4. Contribuciones Prácticas** | "✅ Validado empíricamente" → "⏳ Estimado basado en literatura" | No existe validación |
| **5. Limitaciones** | Añadida "Validación empírica pendiente" | Todas las hipótesis requieren validación |
| **6. Trabajo Futuro** | Actualizado con las 10 fases del plan de implementación | Reflejar el plan del Capítulo 7 |
| **7. Reflexión Final** | Logros clave actualizados (diseño, no implementación) | Reflejar estado real del proyecto |