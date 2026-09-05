import { StyleSheet, Text, View } from 'react-native';

export function DashboardScreen() {
return ( <View style={styles.container}> <Text style={styles.title}>Dashboard</Text> <Text>Bienvenido a SGCI Mobile</Text> </View>
);
}

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
