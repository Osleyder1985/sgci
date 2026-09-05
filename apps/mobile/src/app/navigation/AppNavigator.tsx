import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { IncidenciasScreen } from '../../features/incidencias/screens/IncidenciasScreen';
import { InspeccionesScreen } from '../../features/inspecciones/screens/InspeccionesScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';

export type AppTabParamList = {
Dashboard: undefined;
Inspecciones: undefined;
Incidencias: undefined;
Perfil: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator() {
return (
<Tab.Navigator>
<Tab.Screen
name="Dashboard"
component={DashboardScreen}
options={{ title: 'Inicio' }}
/>
  <Tab.Screen
    name="Inspecciones"
    component={InspeccionesScreen}
  />

  <Tab.Screen
    name="Incidencias"
    component={IncidenciasScreen}
  />

  <Tab.Screen
    name="Perfil"
    component={ProfileScreen}
  />
</Tab.Navigator>

);
}
