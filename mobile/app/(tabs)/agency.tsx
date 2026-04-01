import { View, Text, StyleSheet } from "react-native";

export default function AgencyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏙️ Agence</Text>
      <Text style={styles.sub}>Notre agence & nos services</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e" },
  sub: { fontSize: 15, color: "#6b7280", marginTop: 8 },
});
