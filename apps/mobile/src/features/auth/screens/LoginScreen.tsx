import { StyleSheet, Text, View } from "react-native";

export function LoginScreen() {
  return (
    <View style={styles.container}>
      {" "}
      <Text style={styles.title}>SGCI</Text>{" "}
      <Text style={styles.subtitle}>Inicio de sesión</Text>{" "}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
  },
});
