/**
 * Ubicación:
 * apps/mobile/src/features/profile/screens/ProfileScreen.tsx
 *
 * Descripción:
 * Pantalla principal del módulo de perfil.
 *
 * Responsabilidad:
 * Mostrar la información y las futuras opciones de configuración
 * del usuario autenticado en SGCI Mobile.
 */

import { StyleSheet, Text, View } from 'react-native';

/**
 * Pantalla principal del perfil del usuario.
 */
export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Perfil
      </Text>

      <Text>
        Configuración del usuario
      </Text>
    </View>
  );
}

/**
 * Estilos locales de la pantalla de perfil.
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