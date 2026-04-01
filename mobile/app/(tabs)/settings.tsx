import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isToggle?: boolean;
  toggleKey?: string;
};

const SECTIONS: { title: string; items: SettingItem[] }[] = [
  {
    title: "Compte",
    items: [
      { icon: "person-outline", label: "Informations personnelles", value: "Modifier" },
      { icon: "mail-outline", label: "Adresse email", value: "Modifier" },
      { icon: "lock-closed-outline", label: "Mot de passe", value: "Modifier" },
    ],
  },
  {
    title: "Préférences",
    items: [
      { icon: "moon-outline", label: "Thème sombre", isToggle: true, toggleKey: "darkMode" },
      { icon: "language-outline", label: "Langue", value: "Français" },
      { icon: "notifications-outline", label: "Notifications Push", isToggle: true, toggleKey: "notifications" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Centre d'aide", value: "" },
      { icon: "document-text-outline", label: "Conditions d'utilisation", value: "" },
      { icon: "shield-checkmark-outline", label: "Confidentialité", value: "" },
    ],
  },
];

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    darkMode: false,
    notifications: true,
  });

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text style={styles.userName}>Mon Compte</Text>
        <Text style={styles.userEmail}>Gérez votre profil</Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.card}>
            {section.items.map((item, idx) => (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={item.isToggle ? 1 : 0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={item.icon} size={18} color="#6366f1" />
                    </View>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  {item.isToggle && item.toggleKey ? (
                    <Switch
                      value={toggles[item.toggleKey]}
                      onValueChange={() => toggle(item.toggleKey!)}
                      trackColor={{ false: "#e5e7eb", true: "#6366f1" }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <View style={styles.rowRight}>
                      {item.value ? (
                        <Text style={styles.rowValue}>{item.value}</Text>
                      ) : null}
                      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                    </View>
                  )}
                </TouchableOpacity>
                {idx < section.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
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
    fontWeight: "600" as const,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowValue: { fontSize: 13, color: "#9ca3af" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginLeft: 60 },

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
  logoutText: { fontSize: 15, fontWeight: "600" as const, color: "#ef4444" },
});
