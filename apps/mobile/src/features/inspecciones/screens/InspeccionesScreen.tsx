import { StyleSheet, Text, View } from 'react-native';

export function InspeccionesScreen() {
return ( <View style={styles.container}> <Text style={styles.title}>Inspecciones</Text> <Text>Módulo de inspecciones SGCI</Text> </View>
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
