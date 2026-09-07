# SGCI — API Tests Engineering Standard

## 1. Propósito

Este documento define el estándar obligatorio para diseñar, implementar, mantener y revisar pruebas automatizadas de la API de SGCI.

El objetivo no es maximizar el número de tests, sino garantizar que el comportamiento real de la API quede protegido frente a regresiones funcionales, errores de persistencia, cambios de contrato y fallos de integración.

Una prueba API válida debe demostrar una propiedad observable del sistema y fallar cuando esa propiedad deja de cumplirse.

## 2. Principios fundamentales

1. Probar comportamiento, no implementación interna.
2. Priorizar contratos funcionales y reglas de negocio.
3. Cada test debe tener una razón clara para existir.
4. Los tests deben ser deterministas y aislados.
5. No modificar un test únicamente para que vuelva a pasar después de romper el comportamiento que protegía.
6. Los errores importantes deben estar representados explícitamente en pruebas.
7. Las operaciones críticas deben probar tanto éxito como fallo y recuperación.
8. La persistencia debe verificarse en la base de datos cuando forme parte del contrato.
9. Los tests deben ser reproducibles localmente y en CI.
10. Un test verde no sustituye la revisión del comportamiento que realmente se pretendía proteger.

## 3. Pirámide de pruebas de API

SGCI debe combinar varios niveles:

- **Unitarias:** reglas puras, transformaciones, validaciones y casos aislados.
- **Integración:** servicios conectados con Prisma, base de datos u otras dependencias reales controladas.
- **HTTP/API:** endpoints completos, incluyendo request, autenticación/autorización cuando corresponda, respuesta y efectos persistidos.
- **End-to-end:** flujos completos de negocio cuando una operación atraviesa varios módulos y contratos.

No convertir todos los casos en pruebas end-to-end. Las pruebas deben ejecutarse en el nivel más bajo que demuestre correctamente el comportamiento.

## 4. Estructura de un test

Cada prueba debe seguir una estructura clara:

1. **Arrange:** preparar datos, dependencias y contexto.
2. **Act:** ejecutar la operación bajo prueba.
3. **Assert:** verificar resultado y efectos secundarios relevantes.
4. **Cleanup:** restaurar el estado cuando el entorno no sea transaccional o aislado.

El nombre debe describir el comportamiento esperado, no el nombre del método privado.

Ejemplo conceptual:

```ts
describe('POST /manifiestos/importar', () => {
  it('crea el job y devuelve su identificador cuando el manifiesto es válido', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 5. Contrato HTTP

Los tests de API deben comprobar como mínimo, cuando aplique:

- método HTTP;
- ruta;
- parámetros de ruta;
- query parameters;
- headers relevantes;
- body;
- código HTTP;
- estructura de respuesta;
- campos obligatorios;
- tipos y valores importantes;
- errores esperados;
- efectos persistidos.

No validar únicamente que la respuesta sea `200`. Un endpoint puede responder correctamente a nivel HTTP y haber producido datos incorrectos.

## 6. Códigos HTTP y errores

Cada endpoint debe tener pruebas para sus resultados relevantes:

- éxito;
- entrada inválida;
- recurso inexistente;
- conflicto/duplicado;
- falta de autenticación;
- falta de autorización;
- error de dependencia;
- error de persistencia;
- estado no permitido.

Los tests deben verificar que un error no produzca accidentalmente una respuesta de éxito ni deje datos parcialmente persistidos.

## 7. Validación de entrada

Probar límites y entradas representativas:

- campos obligatorios ausentes;
- `null` cuando no está permitido;
- cadenas vacías;
- espacios innecesarios;
- tipos incorrectos;
- valores fuera de rango;
- identificadores inválidos;
- payloads incompletos;
- payloads con campos desconocidos cuando la política los rechace.

La prueba debe comprobar el contrato público y no depender de detalles internos de la librería de validación.

## 8. Persistencia con Prisma

Cuando una operación API escribe datos, el test debe verificar el resultado persistido cuando sea relevante.

Ejemplos:

- registro creado;
- relación creada;
- actualización aplicada;
- duplicado rechazado;
- transacción revertida;
- registros secundarios eliminados o conservados según el contrato.

No basta con comprobar que el servicio devolvió un objeto aparentemente correcto si el objetivo real de la operación es persistirlo.

## 9. Transacciones y rollback

Toda operación crítica que utilice transacciones debe tener pruebas de fallo.

Debe demostrarse que, ante un error intermedio:

- los cambios transaccionales se revierten;
- no quedan registros parciales;
- no quedan relaciones huérfanas;
- no se contabilizan operaciones como completadas cuando no lo están;
- el estado del proceso queda correctamente persistido;
- los errores no son ocultados.

Para importaciones de manifiestos, las pruebas deben cubrir específicamente el fallo después de haber creado o modificado datos parciales.

## 10. Idempotencia y duplicados

Cuando una operación pueda repetirse, probar:

- primera ejecución;
- segunda ejecución con los mismos datos;
- duplicados concurrentes cuando sean relevantes;
- resultado final esperado.

Las pruebas deben reflejar las garantías reales de la base de datos. La lógica de aplicación por sí sola no debe considerarse suficiente cuando existe una restricción de unicidad que debe protegerse.

## 11. Importación de manifiestos

La importación es una operación de alto riesgo y requiere cobertura específica.

Como mínimo deben probarse:

- manifiesto válido;
- XLSX vacío o inválido;
- filas incompletas;
- House válido;
- House duplicado;
- personas nuevas y existentes;
- documentos nuevos y existentes;
- direcciones nuevas y existentes;
- geocodificación encontrada;
- geocodificación pendiente/no encontrada;
- errores de geocodificación;
- fallo durante persistencia;
- rollback completo;
- métricas finales reales;
- `jobId` asociado inequívocamente a la operación correcta.

Una prueba no debe considerar suficiente que la interfaz muestre `Operación completada`; debe verificarse el resultado real de la operación.

## 12. Jobs y operaciones asíncronas

Para procesos en segundo plano, los tests deben distinguir claramente:

- job creado;
- job en ejecución;
- progreso persistido;
- job completado;
- job fallido;
- error registrado;
- procesamiento detenido cuando corresponde.

No debe existir un test que acepte un estado `FAILED` mientras el proceso continúa ejecutándose.

El resultado final debe estar vinculado al identificador de la operación y no reconstruirse mediante consultas ambiguas.

## 13. Datos de prueba

Los fixtures deben ser:

- pequeños;
- explícitos;
- reproducibles;
- relevantes para el caso;
- fáciles de entender.

Evitar datasets gigantes cuando unos pocos registros demuestren el comportamiento.

No reutilizar datos mutables entre tests sin aislamiento explícito.

## 14. Aislamiento

Un test nunca debe depender del orden de ejecución de otro.

Cada test debe poder ejecutarse individualmente.

Evitar:

- estado global mutable;
- fechas actuales no controladas;
- números aleatorios no deterministas;
- dependencias externas inestables;
- datos creados por otro test;
- servicios externos reales cuando no formen parte de la integración que se quiere verificar.

Cuando se utilicen mocks, deben representar contratos reales y no ocultar accidentalmente errores de integración.

## 15. Dependencias externas

Servicios como geocodificación, APIs externas o proveedores remotos deben probarse en niveles separados.

Los tests de negocio pueden utilizar mocks o adaptadores controlados.

Las pruebas de integración externa deben ser explícitas, limitadas y no bloquear la suite principal por disponibilidad de terceros.

Nunca incluir claves reales, tokens, credenciales ni datos sensibles en tests o fixtures.

## 16. Fechas, tiempo y concurrencia

Los tests sensibles al tiempo deben controlar el reloj cuando sea posible.

No depender de `Date.now()` o ventanas temporales reales si eso puede hacer que una prueba sea intermitente.

Para concurrencia, probar explícitamente las condiciones de carrera importantes y verificar que las restricciones de persistencia proporcionen la garantía esperada.

## 17. Mocks y spies

Mockear únicamente dependencias cuyo aislamiento aporte valor.

Un mock no debe reproducir una implementación completa de la dependencia bajo prueba.

Después de cada test deben restaurarse mocks, spies y estados temporales.

Un exceso de mocks puede producir una suite verde que no detecte errores reales de integración.

## 18. Tests negativos

Los casos de error tienen el mismo valor que los casos felices.

Para cada regla crítica debe existir al menos un caso que demuestre que una entrada o estado inválido es rechazado correctamente.

Los tests negativos deben verificar también que no existan efectos secundarios indebidos.

## 19. Regresión

Todo bug funcional importante que se descubra debe convertirse, cuando sea apropiado, en un test de regresión permanente.

El objetivo es que el mismo fallo no pueda reaparecer silenciosamente.

El test debe reproducir la condición que causó el problema, no solamente comprobar una versión simplificada que podría pasar aunque el bug vuelva a existir.

## 20. Calidad de los assertions

Preferir assertions específicas y significativas.

Evitar:

```ts
expect(response).toBeTruthy();
```

cuando el contrato permite verificar exactamente qué debe ocurrir.

Preferir comprobar:

- status;
- campos concretos;
- cantidades;
- identificadores;
- estados;
- relaciones;
- efectos en persistencia.

No convertir objetos completos en snapshots enormes cuando unas pocas propiedades representan mejor el contrato.

## 21. Tests frágiles

Un test debe considerarse sospechoso cuando:

- falla de manera intermitente;
- depende del orden;
- necesita reintentos para pasar;
- usa sleeps arbitrarios;
- depende de datos externos cambiantes;
- valida detalles internos irrelevantes;
- requiere modificaciones constantes ante refactors sin cambio funcional.

Los flaky tests deben investigarse y corregirse, no ocultarse mediante reintentos indiscriminados.

## 22. Cobertura

La cobertura de código es una señal auxiliar, no el objetivo principal.

100 % de cobertura no garantiza que el contrato sea correcto.

Priorizar cobertura de:

- reglas de negocio;
- caminos de error;
- persistencia;
- transacciones;
- autorización;
- importaciones;
- estados de jobs;
- transformaciones de datos;
- integraciones críticas.

## 23. Organización de archivos

Los tests deben mantenerse cerca del código que protegen cuando la estructura del proyecto lo favorezca.

Usar nombres consistentes, por ejemplo:

- `*.spec.ts` para pruebas unitarias/integración según la convención del proyecto;
- nombres que permitan identificar claramente el módulo probado.

La organización debe facilitar localizar rápidamente el test correspondiente a un servicio, controlador o flujo.

## 24. Ejecución local

Antes de abrir un PR, ejecutar como mínimo la suite de API correspondiente al cambio.

Para cambios críticos, ejecutar también las pruebas relacionadas con:

- Prisma;
- persistencia;
- importaciones;
- geocodificación;
- jobs;
- rollback;
- contratos HTTP afectados.

Un cambio no debe considerarse terminado porque compile si modifica comportamiento cubierto por tests.

## 25. CI / Quality Gate

La suite de tests de API forma parte del Quality Gate del repositorio.

El resultado de CI es la autoridad para determinar si la revisión automática está verde.

No marcar un cambio como listo mientras los tests relevantes estén fallando.

Un test omitido temporalmente debe tener una razón explícita y una solución planificada; no debe eliminarse simplemente para desbloquear CI.

## 26. Revisión de Pull Requests

El revisor debe comprobar:

- que el cambio incluye tests cuando modifica comportamiento;
- que los tests prueban el contrato correcto;
- que existen casos de éxito y error;
- que la persistencia se verifica cuando corresponde;
- que las transacciones tienen cobertura de rollback;
- que no existen mocks excesivos;
- que los tests son deterministas;
- que no se han debilitado assertions para hacer pasar CI;
- que los tests no exponen secretos ni datos sensibles.

## 27. Regla crítica de SGCI

**Nunca modificar un test únicamente para que pase después de cambiar el código si el test estaba protegiendo un comportamiento válido.**

Primero determinar qué cambió:

1. ¿Cambió el requisito?
2. ¿Cambió el contrato legítimamente?
3. ¿El código introdujo una regresión?
4. ¿El test estaba equivocado o era demasiado específico?

Solo después debe modificarse el test.

## 28. Definition of Done para API

Un cambio de API se considera terminado cuando:

- el comportamiento está cubierto al nivel adecuado;
- los casos de éxito relevantes pasan;
- los casos de error relevantes pasan;
- la persistencia está verificada cuando corresponde;
- rollback está probado para operaciones transaccionales críticas;
- duplicados/idempotencia están cubiertos cuando aplican;
- los tests son deterministas;
- no existen secretos en fixtures;
- la suite API pasa localmente cuando es posible;
- CI está verde;
- no se han debilitado tests existentes para ocultar una regresión.

## 29. Reglas de oro

1. Testea comportamiento, no implementación.
2. Un test debe fallar por una razón real.
3. Los errores también son parte del contrato.
4. Verifica persistencia cuando la operación persiste.
5. Prueba rollback en operaciones críticas.
6. No ocultes errores de persistencia.
7. Protege los bugs corregidos con tests de regresión.
8. No dependas del orden de los tests.
9. No aceptes flaky tests como normales.
10. No uses sleeps arbitrarios para sincronización.
11. Mockea con criterio.
12. No pongas credenciales reales en tests.
13. No confundas cobertura con calidad.
14. Prueba duplicados cuando sean relevantes.
15. Prueba estados intermedios de procesos asíncronos.
16. Verifica el resultado real, no solo el mensaje de éxito.
17. Mantén los fixtures pequeños y explícitos.
18. Haz que cada test pueda ejecutarse aisladamente.
19. No debilites assertions para conseguir CI verde.
20. Si un bug importante aparece, añade protección permanente.

## 30. Referencias oficiales

- Jest: https://jestjs.io/docs/getting-started
- NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- Supertest: https://github.com/ladjs/supertest
- Prisma Testing: https://www.prisma.io/docs/orm/prisma-client/testing
- OWASP API Security: https://owasp.org/API-Security/
