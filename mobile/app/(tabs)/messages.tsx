import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useConversations } from "@/hooks/messaging/useConversations";
import type { Conversation } from "@/types/messaging";

export default function MessagesScreen() {
  const router = useRouter();
  const { data: conversations, isLoading } = useConversations();

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/messages/${item.id}`)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.agency?.company_name?.charAt(0).toUpperCase() ?? "A"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.agency?.company_name ?? "Agence"}</Text>
        {item.property && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.property.name}
          </Text>
        )}
      </View>
      {!!item.unread_count && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>Aucune conversation pour le moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "700", color: "#4f46e5" },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  badge: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: 80, gap: 10 },
  emptyText: { color: "#9ca3af", fontSize: 14 },
});
