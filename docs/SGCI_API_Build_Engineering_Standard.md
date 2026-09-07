# SGCI — API Build Engineering Standard

## 1. Propósito

Este documento define el estándar para compilar, validar y producir el artefacto ejecutable de la API de SGCI.

El build no debe considerarse un trámite. Es una garantía de que el código fuente puede transformarse de forma reproducible en una aplicación ejecutable y desplegable.

## 2. Principios fundamentales

1. El build debe ser reproducible.
2. El build debe fallar ante errores reales de compilación.
3. No ocultar errores para conseguir un build verde.
4. El artefacto generado debe corresponder exactamente al código validado.
5. Las dependencias deben instalarse de forma reproducible mediante el lockfile.
6. La configuración de desarrollo no debe ser necesaria para ejecutar el artefacto de producción.
7. CI es una autoridad independiente de la máquina local.
8. Un build verde no sustituye tests, lint, seguridad ni revisión funcional.

## 3. Build oficial de la API

La API de SGCI utiliza el script `build` del workspace:

```bash
npm run build --workspace=@sgci/api
```

Actualmente este script ejecuta `nest build`. fileciteturn52file0L2-L2

El comando oficial debe permanecer alineado con la configuración real del proyecto y no debe documentarse un comando alternativo como sustituto sin actualizar primero el proyecto.

## 4. Relación con TypeScript

El build debe estar acompañado por validación explícita de tipos cuando el Quality Gate la requiera.

En SGCI, la validación TypeScript y el build tienen responsabilidades diferentes:

- `tsc --noEmit` comprueba el sistema de tipos sin producir artefactos;
- `nest build` produce el resultado compilado de la aplicación.

Que uno pase no implica automáticamente que el otro pueda omitirse.

## 5. Dependencias reproducibles

Las instalaciones de CI deben utilizar:

```bash
npm ci
```

No utilizar `npm install` como mecanismo normal de instalación en CI cuando existe un lockfile válido.

Los cambios de dependencias deben incluir la actualización coherente del lockfile y revisarse como parte del mismo cambio.

No depender de paquetes instalados globalmente.

## 6. Node.js y entorno

La versión de Node.js utilizada por el build debe estar fijada de forma coherente entre desarrollo y CI.

El workflow actual de calidad utiliza Node.js 22. El estándar del proyecto debe evitar diferencias silenciosas entre la versión local y la utilizada por CI.

Si se cambia la versión de Node.js:

1. evaluar compatibilidad;
2. actualizar la configuración correspondiente;
3. regenerar/validar dependencias si procede;
4. ejecutar tests;
5. ejecutar build;
6. verificar CI.

## 7. Prisma antes del build

La API utiliza Prisma. Cuando el código compilado depende del cliente generado, el pipeline debe garantizar que Prisma Client haya sido generado antes de compilar.

El orden recomendado es:

1. instalar dependencias;
2. generar Prisma Client;
3. validar schema;
4. validar TypeScript;
5. lint;
6. tests;
7. build.

No asumir que una carpeta generada existente en la máquina local representa correctamente un entorno limpio.

## 8. Artefacto de salida

El directorio de salida generado por Nest debe considerarse un artefacto de build, no código fuente.

No editar manualmente archivos compilados para solucionar errores del código fuente.

Si el artefacto contiene un error:

1. localizar el problema en el código/configuración fuente;
2. corregir la fuente;
3. limpiar el artefacto si es necesario;
4. recompilar;
5. verificar nuevamente.

## 9. Build limpio

Un build confiable debe poder ejecutarse desde un entorno limpio.

La validación debe detectar dependencias accidentales de:

- archivos generados previamente;
- módulos instalados manualmente;
- variables locales no documentadas;
- configuraciones personales del IDE;
- artefactos antiguos;
- caches corruptas.

Cuando exista sospecha de contaminación del entorno, repetir la instalación desde cero antes de diagnosticar el código como defectuoso.

## 10. Variables de entorno

El build debe distinguir entre:

- variables necesarias para compilar;
- variables necesarias para arrancar;
- secretos necesarios en runtime;
- configuración opcional.

No introducir secretos reales en archivos de configuración, código fuente, fixtures o artefactos.

Una variable que solo necesita el runtime no debe convertirse artificialmente en requisito del build si no existe una razón técnica.

## 11. Configuración de producción

El artefacto debe poder ejecutarse mediante el flujo de producción definido por el proyecto.

La API dispone del script:

```bash
npm run start:prod --workspace=@sgci/api
```

que ejecuta `node dist/main`. fileciteturn52file0L2-L2

Por tanto, el build debe producir el artefacto requerido por ese flujo.

## 12. Dependencias runtime vs desarrollo

Toda dependencia utilizada por el código que llega a producción debe estar declarada como dependencia runtime cuando corresponda.

No depender accidentalmente de `devDependencies` para ejecutar `dist`.

Las herramientas de compilación, lint y test pueden permanecer como dependencias de desarrollo si no son necesarias para runtime.

## 13. Integridad del artefacto

El artefacto debe contener únicamente lo necesario para ejecutar la aplicación según el modelo de despliegue de SGCI.

Revisar especialmente:

- imports dinámicos;
- archivos estáticos requeridos;
- templates;
- migraciones;
- configuración;
- Prisma Client;
- paths relativos;
- aliases de TypeScript;
- módulos ESM/CommonJS.

No asumir que una ruta válida en `src` seguirá siendo válida después de compilar.

## 14. ESM y módulos

La API declara actualmente `"type": "module"`. fileciteturn52file0L2-L2

Los cambios relacionados con imports, exports, resolución de módulos o configuración de TypeScript deben verificarse tanto en compilación como en ejecución del artefacto cuando puedan afectar runtime.

No mezclar patrones ESM y CommonJS sin una razón técnica y configuración explícita.

## 15. Errores de build

Ante un fallo:

1. identificar el primer error real;
2. no perseguir únicamente los errores secundarios;
3. localizar el archivo fuente responsable;
4. corregir la causa raíz;
5. ejecutar nuevamente validaciones relevantes;
6. confirmar el build desde cero cuando el cambio sea estructural.

No comentar código, relajar TypeScript, eliminar imports o cambiar configuración arbitrariamente para ocultar un error.

## 16. Build y tests

Build y tests protegen propiedades distintas.

El build demuestra que la aplicación puede compilarse.

Los tests demuestran que determinados comportamientos funcionan.

Para cambios funcionales relevantes, ambos deben pasar.

Un build exitoso nunca justifica eliminar o debilitar un test.

## 17. Build y lint/format

Lint y Prettier deben mantenerse separados del build.

El build no debe utilizarse para sustituir:

- lint;
- format check;
- type check;
- tests;
- análisis de seguridad.

Cada validación debe conservar una responsabilidad clara dentro del Quality Gate.

## 18. CI / Quality Gate

El workflow de calidad de SGCI incluye explícitamente:

- generación de Prisma Client;
- validación del schema;
- TypeScript API;
- lint API;
- tests API;
- build API.

El build de API debe ejecutarse en CI con el mismo repositorio y dependencias que las demás validaciones.

No considerar un PR listo si el build de API está fallando.

## 19. Pull Requests

Todo cambio que pueda afectar la compilación debe revisarse especialmente cuando modifica:

- `tsconfig`;
- `nest-cli`;
- `package.json`;
- lockfile;
- Prisma;
- aliases/imports;
- módulos;
- dependencias;
- configuración de build;
- estructura de `src`;
- scripts npm.

El PR debe permitir identificar claramente si el artefacto de API sigue siendo construible.

## 20. Cambios de dependencias

Agregar o actualizar una dependencia requiere revisar:

- compatibilidad con Node.js;
- compatibilidad con NestJS/TypeScript;
- impacto en bundle/artefacto;
- dependencia runtime o dev;
- vulnerabilidades conocidas;
- lockfile;
- comportamiento en CI;
- impacto en producción.

No actualizar paquetes sin comprobar el build completo.

## 21. Reproducibilidad

Dos ejecuciones sobre el mismo commit, con el mismo entorno y lockfile, deben producir resultados equivalentes.

Evitar que el resultado dependa de:

- hora local;
- usuario local;
- rutas absolutas;
- archivos fuera del repositorio;
- paquetes globales;
- configuración privada no documentada.

## 22. Performance del build

No optimizar prematuramente.

Primero garantizar corrección y reproducibilidad.

Cuando el build sea lento, medir antes de modificarlo.

Las optimizaciones deben preservar:

- determinismo;
- trazabilidad;
- diagnósticos claros;
- compatibilidad con CI.

## 23. Diagnóstico de fallos intermitentes

Si el build pasa unas veces y falla otras, tratarlo como defecto del proceso hasta demostrar lo contrario.

Investigar:

- concurrencia;
- caches;
- generación de archivos;
- condiciones de carrera;
- dependencias externas;
- orden de pasos;
- filesystem;
- configuración del entorno.

No resolver un build flaky mediante reintentos indefinidos.

## 24. Seguridad del artefacto

Antes del despliegue, comprobar que el artefacto no contiene:

- API keys;
- tokens;
- passwords;
- certificados privados;
- datos personales innecesarios;
- archivos de desarrollo no requeridos.

Los secretos deben proporcionarse mediante mecanismos seguros de configuración del entorno.

## 25. Regla crítica de SGCI

**Nunca declarar que la API está lista porque `nest build` terminó correctamente.**

La condición correcta es que el cambio supere el conjunto de validaciones aplicables:

- Prisma;
- TypeScript;
- lint;
- Prettier;
- tests;
- seguridad;
- build;
- y las validaciones funcionales específicas del cambio.

## 26. Definition of Done

Un cambio de API está listo para revisión cuando:

- las dependencias están sincronizadas con el lockfile;
- Prisma está generado y validado cuando corresponde;
- TypeScript pasa;
- lint pasa;
- formato pasa;
- tests relevantes pasan;
- `npm run build --workspace=@sgci/api` pasa;
- el artefacto de salida es coherente;
- no se requieren paquetes globales;
- no hay secretos en el artefacto ni en el código;
- CI está verde;
- `main` no recibe cambios directos fuera del flujo aprobado de PR.

## 27. Reglas de oro

1. El build debe ser reproducible.
2. Usa `npm ci` en CI.
3. Respeta el lockfile.
4. No dependas de instalaciones globales.
5. Genera Prisma antes de compilar cuando corresponda.
6. Separa type-check, lint, tests y build.
7. No edites manualmente `dist` para corregir código fuente.
8. Corrige la causa raíz de los errores.
9. No ocultes errores relajando TypeScript.
10. No conviertas secretos de runtime en secretos de repositorio.
11. Verifica imports y rutas después de compilar.
12. Revisa dependencias runtime frente a devDependencies.
13. Valida cambios de módulos ESM/CommonJS.
14. Un build verde no sustituye los tests.
15. Un build flaky debe investigarse.
16. No confíes en artefactos generados previamente.
17. Prueba desde entorno limpio cuando sea necesario.
18. CI debe validar el mismo código que se pretende desplegar.
19. No declares listo un PR con build fallando.
20. El artefacto debe ser ejecutable, no solo compilable.

## 28. Referencias oficiales

- NestJS CLI: https://docs.nestjs.com/cli/overview
- NestJS Deployment: https://docs.nestjs.com/deployment
- TypeScript: https://www.typescriptlang.org/docs/
- npm CI: https://docs.npmjs.com/cli/commands/npm-ci
- Prisma: https://www.prisma.io/docs/
- Node.js: https://nodejs.org/docs/latest/api/
