/**
 * Ubicación:
 * apps/mobile/src/navigation/RootNavigator.tsx
 *
 * Descripción:
 * Define el contenedor raíz de navegación de SGCI Mobile.
 *
 * Responsabilidad:
 * Proporcionar el NavigationContainer requerido por React Navigation
 * y cargar el navegador principal de la aplicación.
 */

import { NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './AppNavigator';

/**
 * Navegador raíz de SGCI Mobile.
 *
 * NavigationContainer administra el estado global de navegación.
 * AppNavigator contiene la navegación principal mediante pestañas.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}