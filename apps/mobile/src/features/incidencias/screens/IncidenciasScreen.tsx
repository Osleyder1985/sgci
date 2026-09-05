/**
 * Ubicación:
 * apps/mobile/src/features/incidencias/screens/IncidenciasScreen.tsx
 *
 * Descripción:
 * Pantalla principal del módulo de incidencias.
 *
 * Responsabilidad:
 * Proporcionar el punto de entrada al registro y gestión
 * de incidencias en SGCI Mobile.
 */

import { StyleSheet, Text, View } from 'react-native';

/**
 * Pantalla principal del módulo de incidencias.
 */
export function IncidenciasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Incidencias
      </Text>

      <Text>
        Módulo de incidencias SGCI
      </Text>
    </View>
  );
}

/**
 * Estilos locales de la pantalla de incidencias.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
});