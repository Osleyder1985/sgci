/**
 * Ubicación:
 * apps/mobile/src/features/inspecciones/screens/InspeccionesScreen.tsx
 *
 * Descripción:
 * Pantalla principal del módulo de inspecciones.
 *
 * Responsabilidad:
 * Proporcionar el punto de entrada al módulo de gestión
 * de inspecciones de SGCI Mobile.
 */

import { StyleSheet, Text, View } from "react-native";

/**
 * Pantalla principal del módulo de inspecciones.
 */
export function InspeccionesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspecciones</Text>

      <Text>Módulo de inspecciones SGCI</Text>
    </View>
  );
}

/**
 * Estilos locales de la pantalla de inspecciones.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
});
