/**
 * Ubicación:
 * apps/mobile/src/features/dashboard/screens/DashboardScreen.tsx
 *
 * Descripción:
 * Pantalla principal del Dashboard de SGCI Mobile.
 *
 * Responsabilidad:
 * Mostrar la información principal y el acceso inicial
 * a los módulos del sistema.
 */

import { StyleSheet, Text, View } from "react-native";

/**
 * Pantalla principal del Dashboard.
 */
export function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text>Bienvenido a SGCI Mobile</Text>
    </View>
  );
}

/**
 * Estilos locales de la pantalla Dashboard.
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
