/**

* Ubicación:
* apps/mobile/App.tsx
*
* Descripción:
* Punto principal de composición de la aplicación SGCI Mobile.
*
* Responsabilidad:
* Cargar el navegador raíz de la aplicación.
  */

import { RootNavigator } from './src/navigation/RootNavigator';

/**

* Componente raíz de SGCI Mobile.
  */
  export default function App() {
  return <RootNavigator />;
  }
