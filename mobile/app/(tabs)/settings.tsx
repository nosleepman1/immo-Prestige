import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/auth/useLogout";
import { useExportAccount } from "@/hooks/account/useExportAccount";

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const exportAccount = useExportAccount();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name ?? "Mon compte"}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données personnelles</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => exportAccount.mutate()}
            disabled={exportAccount.isPending}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="download-outline" size={18} color="#6366f1" />
              </View>
              <Text style={styles.rowLabel}>Exporter mes données</Text>
            </View>
            {exportAccount.isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={() => logout.mutate()}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 28,
    backgroundColor: "#1a1a2e",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  userEmail: { fontSize: 13, color: "#94a3b8", marginTop: 4 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowLabel: { fontSize: 15, color: "#1a1a2e" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#ef4444" },
});
