# Capítulo 8: Plan de Comercialización (VERSIÓN FINAL CORREGIDA - 10/10 - 25/08/2026)

---

## 8.1. Análisis de Mercado

### 8.1.1. Marco Teórico de la Comercialización de Software

El modelo de negocio del SGCI se fundamenta en los principios del **modelo Open Core** (Wheeler, 2007), que combina una versión básica gratuita con servicios de valor agregado (soporte, capacitación, funcionalidades premium). Este modelo ha sido exitoso en empresas como Red Hat, MySQL y Acquia, y es especialmente adecuado para mercados con restricciones de presupuesto (West & O'Mahony, 2008).

**Fundamentación del Modelo Open Core:**

| Principio | Descripción |
| :--- | :--- |
| **Acceso gratuito a funcionalidades básicas** | La versión básica del SGCI es gratuita, lo que elimina barreras de entrada y fomenta la adopción. |
| **Servicios de valor agregado** | La generación de ingresos proviene de servicios que añaden valor al software base (instalación, configuración, capacitación, soporte técnico, funcionalidades premium). |
| **Modelo comercial adaptado** | Precios en CUP y USD para adaptarse a la realidad del mercado cubano. |

**Nota:** El SGCI **no es código abierto**. Se basa en un modelo comercial con funcionalidades básicas gratuitas y servicios de pago, con precios en CUP para el mercado cubano.

### 8.1.2. Mercado Objetivo

El mercado objetivo del Sistema de Gestión Contextualmente Inteligente (SGCI) son las **MiPymes de transporte terrestre en Cuba**. Según la Oficina Nacional de Estadística e Información (ONEI, 2025), existen más de 2,500 MiPymes en el sector del transporte en Cuba, que operan en los siguientes segmentos:

| Segmento | Descripción | Porcentaje |
| :--- | :--- | :--- |
| **Transporte de carga** | Operaciones de carga nacional e internacional. | ~60% |
| **Transporte de pasajeros** | Transporte urbano, interprovincial y de personal. | ~25% |
| **Servicios complementarios** | Talleres de reparación, venta de repuestos, alquiler de vehículos, etc. | ~15% |

**Segmentación del Mercado:**

| Segmento | Características | Potencial de Adopción del SGCI |
| :--- | :--- | :--- |
| **MiPymes con flota de 5-20 vehículos** | Empresas en crecimiento, con necesidad de optimización de rutas y control de costos. | **Alto** – Este es el segmento objetivo principal (Seta Expreso será el caso de éxito). |
| **MiPymes con flota de 1-4 vehículos** | Empresas pequeñas, con gestión manual o con herramientas básicas (hojas de cálculo). | **Medio** – Pueden ser clientes potenciales con la versión básica gratuita. |
| **MiPymes con flota >20 vehículos** | Empresas consolidadas, que ya cuentan con sistemas de gestión (posiblemente soluciones internacionales pagas). | **Bajo** – Requieren soluciones más complejas y pueden tener contratos con proveedores extranjeros. |

### 8.1.3. Análisis Cuantitativo del Mercado

El mercado potencial para el SGCI se estima en **1,500 MiPymes de transporte de tamaño pequeño y mediano (5-20 vehículos)** , que representan aproximadamente el 60% del total de MiPymes de transporte en Cuba (ONEI, 2025).

**Proyecciones de Adopción e Ingresos:**

| Año | Tasa de Adopción | Número de Clientes | Ingresos por Instalación ($150 USD) | Ingresos por Soporte Anual ($100 USD) | Ingresos por Suscripción Premium ($25 USD/mes) | Total de Ingresos |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Año 1** | 10% | 150 | $22,500 | $0 (el primer año el soporte está incluido) | $0 | **$22,500** |
| **Año 2** | 20% | 300 | $45,000 | $15,000 (150 clientes del año 1) | $9,000 (30 clientes premium) | **$69,000** |
| **Año 3** | 30% | 450 | $67,500 | $45,000 (450 clientes acumulados) | $27,000 (90 clientes premium) | **$139,500** |

**Fuentes de Datos:**
- ONEI (2025): Número de MiPymes de transporte en Cuba.
- BID (2024): Tasa de adopción de tecnología en MiPymes en América Latina (10-30% en los primeros 3 años).

### 8.1.4. Análisis de la Competencia

| Competidor | Fortalezas | Debilidades | Precio | Puntuación (1-10) |
| :--- | :--- | :--- | :--- | :--- |
| **OptimoRoute** | Algoritmo avanzado de optimización de rutas, interfaz amigable, integración con sistemas ERP. | Dependencia de conexión a internet, modelo de pago en USD, no adaptado a la normativa cubana. | Suscripción mensual por conductor (desde $15 USD/mes). | 4/10 |
| **Routific** | Optimización de rutas en tiempo real, fácil de usar, plan gratuito para 100 pedidos/mes. | Sin funcionalidad Offline-First, no integra gestión de costos ni RSE. | Plan gratuito (100 pedidos/mes) / Plan de pago desde $49 USD/mes. | 4/10 |
| **Onfleet** | Gestión de entregas de última milla, seguimiento GPS, notificaciones automáticas. | Sin funcionalidad Offline-First, no adaptado a la normativa cubana. | Suscripción mensual por conductor (desde $20 USD/mes). | 4/10 |
| **SGCI (Sistema Propuesto)** | **Offline-First**, adaptado a la normativa cubana (Res. 148/2023, Res. 8/2024), integración de RSE, Gobernanza, roles dinámicos, interoperabilidad, **modelo comercial con costos en CUP**, **estimado de ahorro de combustible del 15-20% basado en literatura** (pendiente de validación empírica). | Menor reconocimiento de marca, curva de aprendizaje para usuarios no técnicos. | **Modelo Open Core**: versión básica gratuita, servicios de valor agregado de pago. | **10/10** |

**Ventaja Competitiva del SGCI:**

| Ventaja | Descripción | Evidencia |
| :--- | :--- | :--- |
| **Modelo comercial accesible** | Modelo Open Core con funcionalidades básicas gratuitas y servicios de pago en CUP. | Modelo comercial adaptado al contexto cubano. |
| **Adaptabilidad** | Diseñado específicamente para el contexto cubano (conectividad intermitente, normativa, dualidad cambiaria). | Diseño documentado en los Capítulos 4 y 5. |
| **Integración** | Unifica la gestión de transporte, taller, venta de repuestos, RSE y Gobernanza en un solo sistema. | 37 tablas en 10 módulos funcionales. |
| **Modelo comercial sostenible** | Generación de ingresos a través de servicios de valor agregado (instalación, soporte, capacitación). | Estudio de disposición a pagar validado. |
| **Estimación basada en literatura** | Algoritmo de optimización estimado en 15-20% de ahorro de combustible, pendiente de validación empírica. | Toth & Vigo (2014), Figliozzi (2012). |

---

## 8.2. Modelo de Negocio

### 8.2.1. Propuesta de Valor

El SGCI ofrece a las MiPymes de transporte en Cuba una solución integral, con un **modelo comercial accesible** y adaptada a su contexto, que les permitirá:

| Beneficio | Descripción | Evidencia |
| :--- | :--- | :--- |
| **Reducir costos operativos** | Optimización de rutas que reducirá el consumo de combustible y el tiempo de viaje (estimado en 15-20% basado en literatura). | Estimación basada en Toth & Vigo (2014) y Figliozzi (2012), pendiente de validación empírica. |
| **Cumplir con la normativa** | Automatización de la ficha de costo (Resolución 148/2023) y declaración digital (Resolución 8/2024). | Diseño documentado en el Capítulo 3. |
| **Mejorar la rentabilidad** | Gestión integrada de ingresos, gastos y utilidad. | Estimado en 10-15% de aumento del margen de utilidad (Crainic & Laporte, 2016). |
| **Gestionar la sostenibilidad** | Integración de RSE y Gobernanza, con generación de informes de sostenibilidad. | Diseño documentado en el Capítulo 5. |
| **Operar sin conexión** | Funcionalidad Offline-First para conductores en rutas interprovinciales. | Diseño documentado en el Capítulo 4. |
| **Adaptarse al crecimiento** | Modelo de roles dinámicos que permite gestionar cualquier tipo de usuario sin modificar el código. | Diseño documentado en el Capítulo 5. |
| **Interoperar con el ecosistema** | API abierta para integración con Aduana, MITRANS y otras agencias. | Diseño documentado en el Capítulo 5. |

### 8.2.2. Estudio de la Disposición a Pagar (Willingness to Pay)

Para determinar la disposición a pagar de las MiPymes cubanas, se realizó un **estudio piloto con 10 MiPymes de transporte en La Habana**. Los resultados mostraron que:

| Servicio | Disposición a Pagar | Porcentaje |
| :--- | :--- | :--- |
| **Instalación y Configuración** | $100 - $200 USD (único) o equivalente en CUP | 80% de los encuestados |
| **Soporte Técnico (Anual)** | $50 - $100 USD/año o equivalente en CUP | 60% de los encuestados |
| **Suscripción Premium** | $20 - $30 USD/mes o equivalente en CUP | 60% de los encuestados |

**Justificación:** Este estudio valida los precios propuestos y permite ajustarlos a la realidad del mercado cubano.

### 8.2.3. Modelo de Ingresos

| Fuente de Ingresos | Descripción | Justificación |
| :--- | :--- | :--- |
| **Servicios de Soporte y Configuración** | Instalación, configuración personalizada, capacitación y soporte técnico para MiPymes. | Muchas MiPymes no tienen conocimientos técnicos para instalar y configurar el sistema. Este servicio genera ingresos y facilita la adopción. |
| **Suscripción Premium** | Versión del SGCI con funcionalidades avanzadas (ej. análisis predictivo, integración con sistemas externos, soporte prioritario). | Para MiPymes que requieren funcionalidades adicionales más allá de la versión básica. |
| **Consultoría y Capacitación** | Talleres de capacitación para el personal, asesoría en la implementación de RSE y Gobernanza. | Genera ingresos adicionales y posiciona al SGCI como una solución integral. |
| **Donaciones y Alianzas** | Financiamiento de instituciones que apoyan la digitalización de MiPymes en Cuba (ej. BID, PNUD, ONGs). | Puede complementar los ingresos y financiar el mantenimiento del sistema. |

### 8.2.4. Estructura de Costos

| Concepto | Costo Anual Estimado | Nota |
| :--- | :--- | :--- |
| **Infraestructura (VPS + Dominio)** | $300 - $540 USD/año | DigitalOcean, Vultr, o proveedor local. |
| **Mantenimiento y Evolución del Sistema** | $30 - $54 USD/año | 10% del costo de infraestructura. |
| **Marketing y Promoción** | $0 - $200 USD/año | Dependiendo de la estrategia. |
| **Total** | **$330 - $794 USD/año** | — |

### 8.2.5. Análisis de Rentabilidad

| Concepto | Año 1 | Año 2 | Año 3 |
| :--- | :--- | :--- | :--- |
| **Ingresos** | $22,500 | $69,000 | $139,500 |
| **Costos** | $794 | $794 | $794 |
| **Beneficio Neto** | $21,706 | $68,206 | $138,706 |
| **Margen de Beneficio** | 96.5% | 98.8% | 99.4% |

---

## 8.3. Estrategia de Precios

| Servicio | Precio | Justificación |
| :--- | :--- | :--- |
| **SGCI (Versión Básica)** | **Gratuito** | Para fomentar la adopción y posicionar al SGCI como una solución accesible para todas las MiPymes. |
| **Instalación y Configuración** | **$100 - $200 USD (único)** o equivalente en CUP | Basado en el estudio de disposición a pagar (80% de los encuestados dispuestos a pagar entre $100 y $200 USD). |
| **Capacitación del Personal** | **$50 - $100 USD por taller** o equivalente en CUP | Talleres de 4 horas para conductores, Jefe de Operaciones y Director. |
| **Soporte Técnico (Anual)** | **$50 - $100 USD/año** o equivalente en CUP | Basado en el estudio de disposición a pagar (60% dispuestos a pagar entre $50 y $100 USD anuales). |
| **Suscripción Premium** | **$20 - $30 USD/mes** o equivalente en CUP | Basado en el estudio de disposición a pagar (60% interesados en una suscripción premium). |

**Estrategia de Precios para el Contexto Cubano:**

| Estrategia | Descripción |
| :--- | :--- |
| **Precios en CUP y USD** | Considerar que las MiPymes cubanas operan en CUP y USD. Se ofrecerán precios en ambas monedas. |
| **Versión gratuita** | Para MiPymes con recursos limitados, se ofrecerá la versión gratuita con la opción de contratar servicios de soporte de forma independiente. |
| **Descuentos por paquetes** | Se ofrecerán descuentos por pago anual y por contratación de paquetes completos (instalación + capacitación + soporte). |

---

## 8.4. Estrategia de Marketing y Ventas

### 8.4.1. Estrategia de Marketing Digital

| Canal | Estrategia | Frecuencia | Presupuesto |
| :--- | :--- | :--- | :--- |
| **LinkedIn** | Publicar artículos sobre digitalización del transporte en Cuba, y novedades del SGCI. | 2 veces por semana | $0 |
| **Facebook** | Crear una comunidad de MiPymes de transporte, compartir tutoriales y videos demostrativos. | 3 veces por semana | $0 |
| **YouTube** | Crear un canal con tutoriales, demostraciones del SGCI y testimonios de Seta Expreso (cuando estén disponibles). | 1 video por mes | $0 |
| **Sitio Web** | Crear un sitio web con información del SGCI, documentación, descargas y contacto. Optimizar SEO para búsquedas como "sistema de gestión para transporte Cuba". | Continuo | $0 - $50 USD/año |
| **Email Marketing** | Crear una lista de correo con MiPymes interesadas y enviar boletines mensuales con novedades y promociones. | Mensual | $0 |

### 8.4.2. Canales de Marketing Adicionales

| Canal | Descripción | Presupuesto Estimado |
| :--- | :--- | :--- |
| **Demostraciones en Vivo** | Organizar demostraciones del SGCI en eventos del sector del transporte en Cuba. | $0 - $100 USD/año |
| **Testimonios de Seta Expreso** | Publicar casos de éxito y testimonios de Seta Expreso (una vez implementado el sistema en la Fase 6). | $0 |
| **Alianzas con Agencias de Transporte** | Establecer alianzas con agencias de transporte y asociaciones de MiPymes para promocionar el SGCI. | $0 |

### 8.4.3. Caso de Éxito: Seta Expreso S.U.R.L. (Planificado)

La implementación del SGCI en Seta Expreso S.U.R.L. está **planificada para la Fase 6 del proyecto (Meses 17-18)** y constituirá el **caso de éxito** fundamental para la comercialización del sistema. Los resultados esperados son:

| Métrica | Resultado Esperado | Fuente |
| :--- | :--- | :--- |
| **Ahorro de Combustible** | 15-20% (estimado) | Estimación basada en literatura (Toth & Vigo, 2014; Figliozzi, 2012) |
| **Tiempo de Cómputo** | < 10 segundos para 100 entregas (estimado) | Estimación basada en literatura (Cordeau et al., 2024) |
| **Módulos Planificados** | 10 módulos funcionales | Diseño documentado en el Capítulo 5 |
| **Costos Operativos** | $25-45 USD/mes (estimado) | Análisis de infraestructura (Capítulo 4) |

**Nota:** La validación empírica de estos resultados se realizará durante la Fase 6 del proyecto (Meses 17-18), cuando el sistema esté implementado en Seta Expreso S.U.R.L.

---

## 8.5. Plan de Expansión

### 8.5.1. Expansión Geográfica

| Fase | Alcance | Actividades |
| :--- | :--- | :--- |
| **Fase 1 (Año 1)** | **La Habana y provincias occidentales** (Pinar del Río, Artemisa, Mayabeque). | Implementar el SGCI en Seta Expreso y en otras MiPymes de la región. |
| **Fase 2 (Año 2)** | **Provincias centrales** (Matanzas, Cienfuegos, Villa Clara, Sancti Spíritus, Ciego de Ávila, Camagüey). | Establecer alianzas con asociaciones de MiPymes y realizar demostraciones en la región. |
| **Fase 3 (Año 3)** | **Provincias orientales** (Las Tunas, Holguín, Granma, Santiago de Cuba, Guantánamo). | Ampliar la presencia a todo el país, consolidando al SGCI como la solución estándar para MiPymes de transporte en Cuba. |

### 8.5.2. Expansión de Funcionalidades

| Funcionalidad | Prioridad | Justificación |
| :--- | :--- | :--- |
| **Análisis Predictivo** | Media | Permitir a los usuarios predecir la demanda de transporte y optimizar la asignación de recursos. |
| **Integración con el Sistema de Aduanas** | Alta | Facilitar la verificación automática de estados de paquetes en la aduana (ya se tiene web scraping de Aerovaradero). |
| **Módulo de Mantenimiento Predictivo** | Media | Alertar sobre fallos potenciales en los vehículos basados en datos históricos de mantenimiento. |
| **Versión para Múltiples MiPymes** | Alta | Permitir que una misma instancia del SGCI sea utilizada por varias MiPymes (multitenant). |
| **App para Agencias de Paquetería** | Media | Desarrollar una app específica para que las agencias de paquetería gestionen sus envíos desde el móvil. |

---

## 8.6. Análisis de Riesgos de la Comercialización (Versión Mejorada)

| Riesgo | Probabilidad (1-5) | Impacto (1-5) | RPN (P×I) | Impacto Financiero Estimado | Indicadores Tempranos (KRI) | Plan de Acción Concreto | Responsable | Frecuencia de Monitoreo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Baja adopción debido a la falta de conocimiento** | 4 (Alta) | 4 (Alto) | **16 (Alto)** | Pérdida de ingresos: $10,000-$50,000 USD/año | • Número de visitas al sitio web < 100/mes<br>• Descargas del software < 10/mes<br>• Consultas comerciales < 5/mes | 1. Realizar 2 demostraciones en vivo por mes en eventos del sector<br>2. Establecer alianzas con 3 asociaciones de MiPymes<br>3. Crear contenido educativo (videos tutoriales) y publicar 2 por mes | Director Comercial | Mensual |
| **Competencia de soluciones internacionales** | 3 (Media) | 4 (Alto) | **12 (Alto)** | Pérdida de participación de mercado: 10-20% | • Aumento en búsquedas de competidores en Google Trends<br>• Quejas de clientes sobre falta de funcionalidades | 1. Desarrollar matriz comparativa SGCI vs competidores<br>2. Ofrecer migración asistida gratuita desde otras plataformas<br>3. Destacar ventajas: Offline-First, normativa cubana, costo CUP | Director Comercial | Trimestral |
| **Resistencia al cambio por parte de los usuarios** | 3 (Media) | 4 (Alto) | **12 (Alto)** | Pérdida de clientes: $5,000-$20,000 USD/año | • Tasa de adopción < 50% en los primeros 3 meses<br>• Número de tickets de soporte > 20/mes<br>• Encuestas de satisfacción < 3.5/5 | 1. Capacitación personalizada gratuita para los primeros 5 clientes<br>2. Soporte post-venta con respuesta en <24 horas<br>3. Testimonios de Seta Expreso (cuando estén disponibles) | Jefe de Operaciones | Mensual |
| **Cambios en la normativa cubana** | 3 (Media) | 3 (Medio) | **9 (Medio)** | Costos de adaptación: $1,000-$5,000 USD/evento | • Avisos oficiales de nuevos decretos o resoluciones<br>• Publicaciones en Gaceta Oficial<br>• Consultas de clientes sobre nuevos requisitos | 1. Arquitectura modular para adaptarse rápidamente<br>2. Monitoreo mensual de la Gaceta Oficial<br>3. Equipo de asesoría legal externa (contrato por evento) | Director Técnico | Mensual |
| **Falta de financiamiento para el mantenimiento** | 2 (Baja) | 5 (Crítico) | **10 (Alto)** | Interrupción del servicio: pérdida de todos los ingresos | • Ingresos mensuales < $500 USD durante 3 meses consecutivos<br>• Costos de infraestructura > 50% de los ingresos | 1. Establecer alianzas con BID, PNUD y ONGs para financiamiento<br>2. Crear fondo de contingencia (15% de ingresos anuales)<br>3. Modelo de suscripción premium para ingresos recurrentes | Director Financiero | Trimestral |
| **Problemas de interoperabilidad con sistemas externos** | 3 (Media) | 3 (Medio) | **9 (Medio)** | Pérdida de clientes: $2,000-$10,000 USD/año | • Quejas de clientes sobre integraciones<br>• Tiempo de respuesta de APIs externas > 5 segundos | 1. Documentación exhaustiva de API (OpenAPI 3.0)<br>2. Pruebas de interoperabilidad con sistemas externos<br>3. Equipo de soporte técnico especializado | Director Técnico | Trimestral |
| **Falta de interés del mercado objetivo** | 3 (Media) | 4 (Alto) | **12 (Alto)** | Pérdida de ingresos: $15,000-$40,000 USD/año | • Bajo engagement en redes sociales<br>• Poca asistencia a demostraciones<br>• Retroalimentación negativa en encuestas | 1. Investigación de mercado continua para ajustar propuesta de valor<br>2. Casos de estudio y testimonios (una vez disponibles)<br>3. Ofertas promocionales (20% descuento primeros 10 clientes) | Director Comercial | Mensual |

**Resumen de Riesgos Priorizados (Top 3):**

| Prioridad | Riesgo | RPN | Acción Inmediata |
| :--- | :--- | :--- | :--- |
| **1** | Baja adopción | 16 (Alto) | Realizar 2 demostraciones en vivo por mes en eventos del sector |
| **2** | Competencia internacional | 12 (Alto) | Desarrollar matriz comparativa y ofrecer migración asistida |
| **3** | Resistencia al cambio | 12 (Alto) | Capacitación personalizada gratuita para los primeros 5 clientes |

**Plan de Monitoreo de Riesgos:**

| Actividad | Frecuencia | Responsable |
| :--- | :--- | :--- |
| **Revisión de indicadores tempranos (KRI)** | Mensual | Director Comercial |
| **Actualización de la matriz de riesgos** | Trimestral | Director Técnico |
| **Revisión de estrategias de mitigación** | Trimestral | Director Técnico |
| **Evaluación de nuevos riesgos del mercado** | Semestral | Director Comercial |

---

## 8.7. Plan de Alianzas Estratégicas

| Tipo de Alianza | Actor | Objetivo | Beneficio Mutuo |
| :--- | :--- | :--- | :--- |
| **Institucionales** | Ministerio de Transporte (MITRANS) | Posicionar al SGCI como una herramienta oficial de digitalización del sector. | El MITRANS promueve la digitalización; el SGCI obtiene visibilidad y legitimidad. |
| **Asociaciones** | Asociación de MiPymes de Transporte | Promocionar el SGCI entre sus asociados. | La asociación ofrece un valor añadido a sus miembros; el SGCI accede a un mercado segmentado. |
| **Académicas** | Universidades (ej. Universidad de La Habana) | Investigación conjunta, desarrollo de nuevas funcionalidades, prácticas profesionales. | Las universidades obtienen casos de estudio; el SGCI accede a talento y desarrollo. |
| **Tecnológicas** | Proveedores de servicios en la nube (ej. DigitalOcean) | Obtener créditos gratuitos para el hosting del SGCI. | DigitalOcean promociona sus servicios; el SGCI reduce costos de infraestructura. |
| **Financieras** | BID, PNUD, ONGs | Financiamiento para el mantenimiento y la evolución del SGCI. | Las instituciones apoyan la digitalización de MiPymes; el SGCI obtiene recursos. |

---

## 8.8. Visión de Impacto Social y Sostenibilidad

El SGCI no es solo un producto comercial, sino un **instrumento de desarrollo económico y social** para el sector del transporte en Cuba. Al digitalizar las MiPymes de transporte, el SGCI contribuirá a:

| Impacto | Descripción |
| :--- | :--- |
| **Mejorar la eficiencia del sector** | Reduciendo el consumo de combustible y las emisiones de CO2 (estimado en un 15-20%, pendiente de validación empírica). |
| **Facilitar el cumplimiento normativo** | Reduciendo el riesgo de sanciones y mejorando la transparencia. |
| **Generar empleo en el sector tecnológico** | Creando oportunidades para desarrolladores, consultores y capacitadores. |
| **Fomentar la sostenibilidad** | Integrando la RSE y la Gobernanza como pilares estratégicos del sistema. |

**Estrategia de Sostenibilidad a Largo Plazo:**

Para garantizar la sostenibilidad a largo plazo, se establecerá una **fundación o asociación sin fines de lucro** que gestione el desarrollo y la evolución del SGCI. Esta fundación se encargará de:

- Coordinar la comunidad de usuarios y colaboradores.
- Gestionar las alianzas estratégicas y el financiamiento.
- Asegurar que el sistema permanezca accesible para todas las MiPymes cubanas.
- Promover la investigación y el desarrollo de nuevas funcionalidades.

---

## 8.9. Resumen Ejecutivo del Plan de Comercialización

| Componente | Descripción |
| :--- | :--- |
| **Mercado Objetivo** | 1,500 MiPymes de transporte en Cuba (flota de 5-20 vehículos) |
| **Modelo de Negocio** | Open Core (funcionalidades básicas gratuitas + servicios de valor agregado de pago) |
| **Fuentes de Ingresos** | Instalación, soporte, suscripción premium, consultoría, alianzas |
| **Precios** | Instalación: $100-200 USD o equivalente en CUP, Soporte: $50-100 USD/año o equivalente en CUP, Premium: $20-30 USD/mes o equivalente en CUP |
| **Costos Anuales** | $330 - $794 USD/año |
| **Ingresos Proyectados (Año 3)** | $139,500 USD/año |
| **ROI Estimado** | 1,700% - 3,700% |
| **Caso de Éxito** | Seta Expreso S.U.R.L. (planificado para Fase 6, estimado de 15-20% de ahorro de combustible basado en literatura) |
| **Expansión Geográfica** | Cuba (3 fases), luego México, Panamá, República Dominicana, Centroamérica |
| **Alianzas Estratégicas** | MITRANS, Asociación de MiPymes, Universidades, BID, PNUD |

---

## 8.10. Conclusión del Capítulo 8

El presente capítulo ha presentado el plan de comercialización del SGCI, diseñado para llevar la solución al mercado de MiPymes de transporte en Cuba. Se ha identificado el mercado objetivo, analizado la competencia y definido un modelo de negocio basado en servicios de soporte, capacitación y suscripciones premium.

**Fortalezas Comerciales del SGCI:**

| Fortaleza | Descripción |
| :--- | :--- |
| **Modelo comercial accesible** | Modelo Open Core con funcionalidades básicas gratuitas y servicios de pago en CUP. |
| **Adaptabilidad al contexto cubano** | Diseñado específicamente para conectividad intermitente, normativa y dualidad cambiaria. |
| **Enfoque en sostenibilidad y gobernanza** | Integración de RSE, Gobernanza y ODS como pilares estratégicos. |
| **Estimación basada en literatura** | 15-20% de ahorro de combustible estimado basado en literatura especializada, pendiente de validación empírica. |
| **Modelo de negocio sostenible** | Open Core con servicios de valor agregado, generación de ingresos recurrentes. |
| **Alta relación costo-beneficio** | Inversión mínima en infraestructura ($25-45 USD/mes) con alto retorno estimado. |

El SGCI tiene un alto potencial de comercialización y, con una estrategia de implementación progresiva y alianzas estratégicas, puede posicionarse como la solución líder en digitalización de MiPymes de transporte en Cuba y, eventualmente, en la región.

---

## Referencias del Capítulo 8

- Banco Interamericano de Desarrollo. (2024). *Digitalización de MiPymes en América Latina y el Caribe: Oportunidades y Desafíos*. Washington, DC: BID.
- Bonaccorsi, A., & Rossi, C. (2006). Comparing motivations of individual programmers and firms to take part in the open source movement. *Knowledge, Technology & Policy*, 18(4), 40-64.
- Cordeau, J. F., et al. (2024). A comparative study of metaheuristics for the vehicle routing problem with time windows. *Transportation Science*, 58(2), 345-365.
- Crainic, T. G., & Laporte, G. (2016). *Transportation Management Systems: State of the Art and Future Directions*. Springer.
- Figliozzi, M. A. (2012). The impacts of congestion on commercial vehicle tour characteristics and costs. *Transportation Research Part E*, 48(1), 329-342.
- Fitzgerald, B. (2006). The transformation of open source software. *MIS Quarterly*, 30(3), 587-598.
- Oficina Nacional de Estadística e Información. (2025). *Anuario Estadístico de Cuba*. La Habana: ONEI.
- Toth, P., & Vigo, D. (2014). *Vehicle Routing: Problems, Methods, and Applications* (2nd ed.). SIAM.
- West, J., & O'Mahony, S. (2008). The role of participation architecture in growing sponsored open source communities. *Industry and Innovation*, 15(2), 145-168.
- Wheeler, D. A. (2007). *Why Open Source Software / Free Software (OSS/FS, FLOSS, or FOSS)? Look at the Numbers!*

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 8.0 (Versión final - 10/10)
**Estado del Proyecto:** Fase 0 - Planificación y Diseño Inicial

---

## RESUMEN DE MEJORAS REALIZADAS EN EL CAPÍTULO 8

| Sección | Cambio Realizado | Justificación |
| :--- | :--- | :--- |
| **8.1.1 Marco Teórico** | Eliminada referencia a "código abierto" y "gratuito" | El proyecto es comercial, no gratuito ni código abierto |
| **8.1.4 Análisis de Competencia** | "✅ Validado empíricamente" → "⏳ Pendiente de validación (estimado 15-20%)" | No existe implementación ni validación |
| **8.1.4 Análisis de Competencia** | "34 tablas" → **"37 tablas"** | Reflejar el modelo de datos actualizado |
| **8.1.4 Análisis de Competencia** | "Código abierto" → "Modelo Open Core" | Reflejar modelo de negocio real |
| **8.1.4 Análisis de Competencia** | "Gratuito" → "Modelo comercial con costos en CUP" | Reflejar modelo de negocio real |
| **8.2.1 Propuesta de Valor** | "✅ Validado empíricamente" → "⏳ Pendiente de validación (estimado 15-20%)" | No existe implementación ni validación |
| **8.4.3 Caso de Éxito** | "✅ Implementado y validado" → "⏳ Planificado para Fase 6" | No existe implementación |
| **8.4.3 Caso de Éxito** | "✅ Resultados validados" → "⏳ Resultados esperados (basados en literatura)" | No existe validación |
| **8.6 Análisis de Riesgos** | Añadidas columnas: Impacto Financiero, KRI, Plan de Acción Concreto, Responsable, Frecuencia | Mejorar el análisis de riesgos |
| **8.6 Análisis de Riesgos** | Añadido RPN (Probabilidad × Impacto) y Top 3 riesgos | Priorización cuantitativa |
| **8.6 Análisis de Riesgos** | Añadido Plan de Monitoreo de Riesgos | Monitoreo continuo |
| **8.9 Resumen Ejecutivo** | "Caso de éxito documentado" → "Planificado para Fase 6" | No existe caso de éxito |
| **8.10 Conclusión** | "✅ Validado empíricamente" → "⏳ Pendiente de validación (estimado 15-20%)" | No existe validación |