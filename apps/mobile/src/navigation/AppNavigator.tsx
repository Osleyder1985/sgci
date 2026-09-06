/**
 * Ubicación:
 * apps/mobile/src/navigation/AppNavigator.tsx
 *
 * Descripción:
 * Navegador principal de la aplicación SGCI Mobile.
 *
 * Responsabilidad:
 * Gestionar la navegación principal mediante pestañas inferiores
 * entre los módulos principales de la aplicación.
 */

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { IncidenciasScreen } from "../features/incidencias/screens/IncidenciasScreen";
import { InspeccionesScreen } from "../features/inspecciones/screens/InspeccionesScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";

/**
 * Definición tipada de las rutas disponibles
 * en la navegación principal.
 */
export type AppTabParamList = {
  Dashboard: undefined;
  Inspecciones: undefined;
  Incidencias: undefined;
  Perfil: undefined;
};

/**
 * Instancia del navegador de pestañas inferiores.
 */
const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Navegador principal de SGCI Mobile.
 *
 * Gestiona el acceso a los módulos principales mediante
 * una barra de navegación inferior.
 */
export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        /**
         * Muestra el encabezado superior de cada pantalla.
         */
        headerShown: true,

        /**
         * Color del icono y texto de la pestaña activa.
         */
        tabBarActiveTintColor: "#2563EB",

        /**
         * Color del icono y texto de las pestañas inactivas.
         */
        tabBarInactiveTintColor: "#6B7280",

        /**
         * Configuración visual de la barra inferior.
         */
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },

        /**
         * Configuración visual de las etiquetas.
         */
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        /**
         * Selecciona dinámicamente el icono correspondiente
         * a cada módulo de SGCI Mobile.
         */
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = "home";
              break;

            case "Inspecciones":
              iconName = "clipboard";
              break;

            case "Incidencias":
              iconName = "warning";
              break;

            case "Perfil":
              iconName = "person";
              break;

            default:
              iconName = "home";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Inicio",
        }}
      />

      <Tab.Screen name="Inspecciones" component={InspeccionesScreen} />

      <Tab.Screen name="Incidencias" component={IncidenciasScreen} />

      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
