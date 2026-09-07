# SGCI — Web Build Engineering Standard

## 1. Propósito

Este documento define el estándar para compilar, validar y producir el artefacto de producción de la aplicación Web de SGCI.

El build de Web no es un simple paso final: demuestra que el frontend puede resolverse, compilarse y empaquetarse de forma reproducible para el entorno de producción.

## 2. Principios fundamentales

1. El build debe ser reproducible.
2. Debe ejecutarse con dependencias fijadas por el lockfile.
3. Debe fallar ante errores reales de compilación.
4. No se deben ocultar errores para conseguir CI verde.
5. El artefacto debe corresponder al commit validado.
6. La configuración de desarrollo no debe ser un requisito implícito de producción.
7. Un build verde no sustituye TypeScript, ESLint, Prettier, tests ni revisión funcional.

## 3. Build oficial

El comando oficial de SGCI debe ser el script de build declarado por el workspace Web:

```bash
npm run build --workspace=@sgci/web
```

No se debe documentar ni utilizar un comando alternativo como sustituto del script oficial sin actualizar previamente la configuración del repositorio.

## 4. Qué debe garantizar el build

El build debe detectar, según la tecnología configurada:

- imports no resolubles;
- errores de compilación;
- referencias a módulos inexistentes;
- incompatibilidades de bundling;
- errores de transformación;
- referencias incorrectas a assets;
- problemas de generación del artefacto;
- errores de configuración de producción.

Un build exitoso no garantiza por sí mismo que la UI sea funcional o correcta.

## 5. Relación con TypeScript — Web

TypeScript y el build tienen responsabilidades distintas.

```text
TypeScript --noEmit
    ↓
Valida tipos
    ↓
Build Web
    ↓
Genera artefacto de producción
```

Un código puede superar parte del análisis de tipos y seguir fallando durante el bundling. Por eso ambas validaciones deben mantenerse.

## 6. Instalación reproducible

En CI se debe utilizar:

```bash
npm ci
```

Esto garantiza que las dependencias correspondan al lockfile.

No depender de:

- paquetes globales;
- node_modules locales;
- caches no verificadas;
- instalaciones manuales fuera del repositorio.

## 7. Node.js

La versión de Node.js debe mantenerse coherente entre desarrollo y CI.

Un cambio de versión requiere verificar:

1. compatibilidad de dependencias;
2. compatibilidad del framework/bundler;
3. TypeScript;
4. ESLint;
5. tests;
6. build;
7. CI completo.

No asumir que un build local con otra versión de Node representa el entorno de producción.

## 8. Entorno limpio

Un build confiable debe poder ejecutarse desde un entorno limpio.

Debe evitar dependencias accidentales de:

- archivos generados previamente;
- caches locales;
- variables privadas;
- extensiones del IDE;
- rutas absolutas;
- recursos fuera del repositorio.

Ante un fallo difícil de reproducir, repetir la validación con instalación limpia antes de cambiar código.

## 9. Variables de entorno

Distinguir claramente:

- variables necesarias durante build;
- variables necesarias en runtime;
- configuración pública del frontend;
- secretos del backend.

Un frontend no debe contener secretos privados.

Cualquier variable incorporada al bundle debe considerarse potencialmente visible al usuario final.

## 10. Regla crítica de seguridad

**Nunca incluir secretos reales en el código Web ni en variables expuestas al bundle.**

No incluir:

- claves privadas;
- passwords;
- tokens secretos;
- credenciales de base de datos;
- claves de servicios internos.

La existencia de una variable de entorno no convierte automáticamente su valor en secreto si el bundler la incorpora al artefacto público.

## 11. API URLs y configuración

Las URLs y configuraciones del backend deben gestionarse mediante el mecanismo oficial del framework Web.

No hardcodear:

- localhost;
- URLs de desarrollo;
- puertos personales;
- dominios temporales

dentro de componentes cuando puedan variar por entorno.

Los cambios de configuración deben probarse en el build correspondiente.

## 12. Imports y aliases

Los aliases deben funcionar tanto para:

- TypeScript;
- editor;
- linter;
- test runner cuando corresponda;
- bundler/build.

No aceptar una configuración donde el editor resuelve un alias pero el build falla.

## 13. Assets

Verificar que imágenes, fuentes y otros recursos requeridos estén disponibles en producción.

No depender de rutas que solo funcionan en desarrollo.

Especial cuidado con:

- rutas relativas;
- mayúsculas/minúsculas;
- diferencias Windows/Linux;
- assets importados dinámicamente;
- archivos públicos.

## 14. Code splitting y imports dinámicos

Los imports dinámicos deben probarse mediante build.

Verificar que:

- el módulo sea resoluble;
- los chunks se generen;
- las rutas funcionen;
- los errores de carga tengan tratamiento cuando corresponda.

No asumir que una ruta dinámica válida en desarrollo funcionará automáticamente en producción.

## 15. Dependencias

Agregar o actualizar una dependencia Web requiere revisar:

- compatibilidad con Node;
- compatibilidad con el framework;
- tamaño del artefacto;
- impacto en producción;
- vulnerabilidades;
- lockfile;
- tree-shaking cuando corresponda;
- build final.

No agregar librerías grandes para resolver problemas simples sin evaluar el impacto.

## 16. Bundle size

El tamaño del bundle debe vigilarse como propiedad de calidad, especialmente en pantallas críticas.

Antes de optimizar:

1. medir;
2. identificar la causa;
3. verificar que el cambio preserve funcionalidad;
4. volver a medir.

Evitar optimizaciones que reduzcan el tamaño a costa de romper mantenibilidad o funcionalidad.

## 17. Código muerto

El código no utilizado debe eliminarse mediante las herramientas adecuadas.

No confiar únicamente en el bundler para compensar una arquitectura con:

- imports innecesarios;
- dependencias muertas;
- componentes abandonados;
- lógica duplicada.

ESLint y TypeScript deben colaborar en la detección de problemas antes del build.

## 18. Build y ESLint/Prettier

El build no sustituye:

- TypeScript;
- ESLint;
- Prettier;
- tests;
- CodeQL;
- revisión funcional.

Cada Quality Gate protege una dimensión diferente.

## 19. Build y tests

Un build verde demuestra compilabilidad del frontend, no comportamiento correcto.

Los tests deben proteger:

- lógica;
- componentes;
- flujos;
- errores;
- integración;
- contratos relevantes.

No eliminar tests porque el build sea exitoso.

## 20. Errores de build

Ante un fallo:

1. identificar el primer error real;
2. separar errores secundarios;
3. localizar la causa raíz;
4. corregir el código o configuración fuente;
5. volver a ejecutar validaciones;
6. confirmar el resultado en CI.

No resolver errores:

- desactivando TypeScript;
- eliminando imports a ciegas;
- comentando código necesario;
- relajando configuración sin justificación.

## 21. Producción

Después de un cambio estructural relevante debe verificarse que el artefacto sea adecuado para el modo de despliegue de SGCI.

Comprobar:

- rutas;
- assets;
- variables públicas;
- configuración de API;
- routing;
- carga inicial;
- imports dinámicos.

Compilar correctamente no significa necesariamente que todas las rutas de producción funcionen.

## 22. SPA y routing

Si la Web utiliza routing del lado del cliente, el despliegue debe estar configurado para servir correctamente rutas directas.

El build debe revisarse junto con la configuración de hosting.

Un error frecuente es que la navegación interna funcione mientras una recarga directa en una ruta falle en producción.

## 23. Diferencias Windows/Linux

El equipo debe asumir que CI puede ejecutar sobre un sistema distinto al local.

Revisar especialmente:

- sensibilidad a mayúsculas;
- separadores de ruta;
- nombres de archivos;
- comandos de shell;
- paths hardcodeados.

El código debe funcionar en el entorno definido oficialmente por el proyecto.

## 24. Flakiness

Un build que pasa unas veces y falla otras es un defecto.

Investigar:

- caches;
- concurrencia;
- generación de archivos;
- dependencias;
- recursos;
- orden de pasos;
- condiciones de carrera.

No normalizar reintentos indefinidos.

## 25. Pull Requests

Cambios que requieren atención especial:

- configuración del bundler;
- TypeScript;
- aliases;
- package.json;
- lockfile;
- routing;
- variables de entorno;
- assets;
- imports dinámicos;
- dependencias;
- scripts de build.

El PR debe permitir entender claramente qué afecta al artefacto de producción.

## 26. CI / Quality Gate

El build Web forma parte del conjunto de validaciones automáticas de SGCI.

La condición mínima es:

```bash
npm run build --workspace=@sgci/web
```

debe finalizar correctamente en CI.

No considerar un PR listo mientras el build Web esté fallando.

## 27. Diagnóstico correcto

Antes de cambiar código por un fallo de CI:

1. leer el error exacto;
2. identificar herramienta y archivo;
3. comprobar el comando ejecutado;
4. reproducir localmente cuando sea posible;
5. aplicar una corrección mínima;
6. revisar el diff;
7. ejecutar nuevamente la validación.

No realizar múltiples cambios manuales a ciegas.

## 28. Reproducibilidad

Dos ejecuciones con:

- el mismo commit;
- la misma versión de Node;
- el mismo lockfile;
- la misma configuración

deben producir resultados equivalentes.

Evitar dependencia de:

- rutas personales;
- hora local;
- usuario;
- archivos externos;
- paquetes globales.

## 29. Definition of Done — Build Web

Un cambio está listo cuando:

- [ ] las dependencias están sincronizadas;
- [ ] TypeScript Web pasa;
- [ ] ESLint Web pasa;
- [ ] Prettier pasa;
- [ ] los tests relevantes pasan;
- [ ] el build Web pasa;
- [ ] no existen secretos en el bundle;
- [ ] assets y rutas funcionan según el contrato;
- [ ] no existen dependencias accidentales del entorno local;
- [ ] CI está verde;
- [ ] se realizó revisión funcional cuando el cambio afecta UI.

## 30. Reglas de oro

1. El build debe ser reproducible.
2. CI debe usar el lockfile.
3. No dependas de paquetes globales.
4. TypeScript y build son validaciones diferentes.
5. No expongas secretos en el frontend.
6. No hardcodees configuración de entorno innecesariamente.
7. Verifica aliases en el bundler.
8. Verifica assets en producción.
9. Revisa imports dinámicos.
10. Considera diferencias Windows/Linux.
11. Un build verde no sustituye tests.
12. Un build verde no garantiza UX correcta.
13. Corrige causas raíz.
14. No desactives validaciones para conseguir verde.
15. Un build flaky es un problema real.
16. Mide antes de optimizar bundle size.
17. Revisa dependencias nuevas.
18. No declares listo un PR con CI fallando.
19. El artefacto debe funcionar en el modelo real de despliegue.
20. La revisión funcional sigue siendo obligatoria.

## 31. Referencias oficiales

- TypeScript: https://www.typescriptlang.org/docs/
- npm CI: https://docs.npmjs.com/cli/commands/npm-ci
- Node.js: https://nodejs.org/docs/latest/api/
- MDN Web Performance: https://developer.mozilla.org/en-US/docs/Web/Performance
- OWASP: https://owasp.org/
