import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProperty } from "@/hooks/properties/useProperty";
import { useStartConversation } from "@/hooks/messaging/useStartConversation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AVAILABILITY_LABELS, headlinePrice, isRentable } from "@/types/property";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

function RentalLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.rentalLine}>
      <Text style={styles.rentalLabel}>{label}</Text>
      <Text style={[styles.rentalValue, strong && styles.rentalValueStrong]}>{value}</Text>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property, isLoading } = useProperty(propertyId);
  const startConversation = useStartConversation();
  const requireAuth = useRequireAuth();
  const router = useRouter();

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
  const headline = headlinePrice(property);
  const currency = property.devise?.code ?? "XOF";
  // Only an available rental listing takes an application — RG-L04, mirrored
  // here so the button never invites a request the server will refuse.
  const canApply = isRentable(property) && property.availability === "available";

  return (
    <ScrollView style={styles.container}>
      {cover ? <Image source={{ uri: cover }} style={styles.image} /> : <View style={styles.imagePlaceholder} />}

      <View style={styles.body}>
        <Text style={styles.title}>{property.name}</Text>
        <Text style={styles.subtitle}>
          {property.city}, {property.region}, {property.country}
        </Text>
        {headline ? (
          <Text style={styles.price}>
            {formatPrice(headline.amount)} {property.devise?.code}
            <Text style={styles.priceSuffix}>{headline.suffix}</Text>
          </Text>
        ) : null}

        {property.availability !== "available" && (
          <View style={styles.unavailableBanner}>
            <Ionicons name="information-circle-outline" size={16} color="#92400e" />
            <Text style={styles.unavailableText}>
              Ce bien est {AVAILABILITY_LABELS[property.availability].toLowerCase()}.
            </Text>
          </View>
        )}

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

        {property.rental && (
          <View style={styles.rentalCard}>
            <Text style={styles.rentalTitle}>Conditions de location</Text>
            <RentalLine label="Loyer" value={`${formatPrice(property.rental.rent_amount)} ${currency}`} />
            <RentalLine label="Charges" value={`${formatPrice(property.rental.charges_amount)} ${currency}`} />
            <RentalLine
              label="Total mensuel"
              value={`${formatPrice(property.rental.monthly_total)} ${currency}`}
              strong
            />
            <RentalLine
              label="Dépôt de garantie"
              value={`${formatPrice(property.rental.deposit_amount)} ${currency}`}
            />
            <RentalLine label="Mois d'avance" value={String(property.rental.advance_months)} />
            <RentalLine label="Durée minimale" value={`${property.rental.min_lease_months} mois`} />
            <View style={styles.moveInBox}>
              <Text style={styles.moveInLabel}>À prévoir pour entrer</Text>
              <Text style={styles.moveInValue}>
                {formatPrice(property.rental.move_in_cost)} {currency}
              </Text>
              <Text style={styles.moveInHint}>
                Dépôt de garantie et {property.rental.advance_months} mois d'avance.
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.description}>{property.description}</Text>

        {canApply && (
          <TouchableOpacity
            style={styles.applyBtn}
            activeOpacity={0.9}
            onPress={() => requireAuth() && router.push(`/rental/apply/${property.id}`)}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text style={styles.applyBtnText}>Déposer une demande de location</Text>
          </TouchableOpacity>
        )}

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
              requireAuth() &&
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
  priceSuffix: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  unavailableBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  unavailableText: { fontSize: 12, color: "#92400e", fontWeight: "600" },
  rentalCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rentalTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  rentalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  rentalLabel: { fontSize: 13, color: "#6b7280" },
  rentalValue: { fontSize: 13, color: "#374151", fontWeight: "600" },
  rentalValueStrong: { color: "#111827", fontWeight: "800" },
  moveInBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  moveInLabel: { fontSize: 12, color: "#6b7280" },
  moveInValue: { fontSize: 18, fontWeight: "800", color: "#4f46e5", marginTop: 2 },
  moveInHint: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  applyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
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
