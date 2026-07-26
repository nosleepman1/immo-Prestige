import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProperty } from "@/hooks/properties/useProperty";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property, isLoading } = useProperty(propertyId);
  const startConversation = useStartConversation();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Bien introuvable.</Text>
      </View>
    );
  }

  const cover = property.images.find((img) => img.is_cover)?.url ?? property.images[0]?.url;

  return (
    <ScrollView style={styles.container}>
      {cover ? <Image source={{ uri: cover }} style={styles.image} /> : <View style={styles.imagePlaceholder} />}

      <View style={styles.body}>
        <Text style={styles.title}>{property.name}</Text>
        <Text style={styles.subtitle}>
          {property.city}, {property.region}, {property.country}
        </Text>
        <Text style={styles.price}>
          {formatPrice(property.price)} {property.devise?.code}
        </Text>

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Ionicons name="resize-outline" size={14} color="#6b7280" />
            <Text style={styles.chipText}>{property.surface} m²</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="bed-outline" size={14} color="#6b7280" />
            <Text style={styles.chipText}>{property.rooms} pièces</Text>
          </View>
          {property.bedrooms != null && (
            <View style={styles.chip}>
              <Ionicons name="moon-outline" size={14} color="#6b7280" />
              <Text style={styles.chipText}>{property.bedrooms} chambres</Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>{property.description}</Text>

        <View style={styles.agencyRow}>
          <View>
            <Text style={styles.agencyName}>{property.agency?.company_name}</Text>
            {property.agency?.is_verified && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
                <Text style={styles.verifiedText}>Agence vérifiée</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() =>
              property.agency &&
              startConversation.mutate({ agencyId: property.agency.id, propertyId: property.id })
            }
            disabled={startConversation.isPending}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
            <Text style={styles.contactBtnText}>Contacter l'agence</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 260 },
  imagePlaceholder: { width: "100%", height: 260, backgroundColor: "#e5e7eb" },
  body: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  price: { fontSize: 20, fontWeight: "800", color: "#4f46e5", marginTop: 10 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { fontSize: 12, color: "#6b7280" },
  description: { fontSize: 14, color: "#374151", lineHeight: 20, marginTop: 16 },
  agencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  agencyName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  verifiedText: { fontSize: 12, color: "#3b82f6" },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
