import { View, Text, StyleSheet, Button } from "react-native";

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✉️ Messages</Text>
      <Text style={styles.sub}>Vos conversations avec les agents</Text>
      <Button title="Messages" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e" },
  sub: { fontSize: 15, color: "#6b7280", marginTop: 8 },
});
