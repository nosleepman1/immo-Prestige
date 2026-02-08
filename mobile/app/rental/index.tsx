import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyApplications, useMyLeases } from "@/hooks/rental/useRental";
import { APPLICATION_STATUS_LABELS, type RentalApplicationStatus } from "@/types/rental";

const STATUS_COLOR: Record<RentalApplicationStatus, string> = {
  submitted: "#d97706",
  under_review: "#0284c7",
  documents_requested: "#0284c7",
  accepted: "#059669",
  rejected: "#dc2626",
  cancelled: "#9ca3af",
};

const money = (amount: number) => `${new Intl.NumberFormat("fr-FR").format(amount)} XOF`
const shortDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");

/**
 * The tenant's rental space: what they applied for, and what they now rent.
 *
 * Both lists live on one screen because a tenant has few of each — two tabs
 * would be more chrome than content.
 */
export default function RentalHomeScreen() {
  const router = useRouter();
  const applications = useMyApplications();
  const leases = useMyLeases();

  const isLoading = applications.isLoading || leases.isLoading;
  const isError = applications.isError || leases.isError;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#d1d5db" />
        <Text style={styles.emptyText}>Impossible de charger vos locations.</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            applications.refetch();
            leases.refetch();
          }}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasNothing = !applications.data?.length && !leases.data?.length;

  if (hasNothing) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "Mes locations" }} />
        <Ionicons name="home-outline" size={40} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Aucune location</Text>
        <Text style={styles.emptyText}>
          Trouvez un logement dans l'onglet Biens, puis déposez une demande depuis sa fiche.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.push("/(tabs)/properties")}>
          <Text style={styles.retryText}>Chercher un logement</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Mes locations" }} />
      <FlatList
        data={leases.data ?? []}
        keyExtractor={(item) => `lease-${item.id}`}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          leases.data?.length ? <Text style={styles.sectionTitle}>Mes baux</Text> : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(`/rental/leases/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.reference}>{item.reference}</Text>
              <View style={[styles.badge, { backgroundColor: "#ecfdf5" }]}>
                <Text style={[styles.badgeText, { color: "#059669" }]}>{item.status_label}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{item.property?.name}</Text>
            <Text style={styles.cardMeta}>
              {shortDate(item.start_date)} → {shortDate(item.end_date)}
            </Text>
            <Text style={styles.cardAmount}>{money(item.monthly_total)} / mois</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          applications.data?.length ? (
            <View style={{ marginTop: leases.data?.length ? 24 : 0 }}>
              <Text style={styles.sectionTitle}>Mes demandes</Text>
              {applications.data.map((application) => (
                <TouchableOpacity
                  key={application.id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/rental/applications/${application.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{application.property?.name}</Text>
                    <View style={styles.badge}>
                      <Text style={[styles.badgeText, { color: STATUS_COLOR[application.status] }]}>
                        {APPLICATION_STATUS_LABELS[application.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    Entrée le {shortDate(application.desired_start_date)} —{" "}
                    {application.desired_duration_months} mois
                  </Text>
                  {application.status === "documents_requested" && (
                    <Text style={styles.actionNeeded}>
                      L'agence attend des pièces complémentaires.
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center", lineHeight: 19 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  reference: { fontSize: 12, fontWeight: "700", color: "#6b7280" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1 },
  cardMeta: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  cardAmount: { fontSize: 16, fontWeight: "800", color: "#4f46e5", marginTop: 8 },
  badge: { backgroundColor: "#f3f4f6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  actionNeeded: { fontSize: 12, color: "#d97706", fontWeight: "600", marginTop: 6 },
});
