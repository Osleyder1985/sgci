import { StyleSheet, Text, View } from 'react-native';

export function ProfileScreen() {
return ( <View style={styles.container}> <Text style={styles.title}>Perfil</Text> <Text>Configuración del usuario</Text> </View>
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
