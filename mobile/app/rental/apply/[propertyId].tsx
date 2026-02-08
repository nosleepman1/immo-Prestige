import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProperty } from "@/hooks/properties/useProperty";
import { useSubmitApplication } from "@/hooks/rental/useRental";
import { apiErrorMessage } from "@/lib/apiError";

const formatPrice = (amount: number) => new Intl.NumberFormat("fr-FR").format(amount);

/** Today + one month, the earliest date most agencies will accept anyway. */
function defaultStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export default function ApplyScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const id = Number(propertyId);
  const router = useRouter();

  const { data: property, isLoading } = useProperty(id);
  const submit = useSubmitApplication();

  const [startDate, setStartDate] = useState(defaultStartDate());
  const [months, setMonths] = useState("");
  const [message, setMessage] = useState("");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!property?.rental) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Ce bien n'est pas proposé à la location.</Text>
      </View>
    );
  }

  const minimum = property.rental.min_lease_months;
  const duration = Number(months || minimum);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "Demande de location" }} />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.propertyCard}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyCity}>
            {property.city}, {property.region}
          </Text>
          <Text style={styles.propertyPrice}>
            {formatPrice(property.rental.monthly_total)} {property.devise?.code} / mois
          </Text>
          <Text style={styles.propertyHint}>
            À prévoir pour entrer : {formatPrice(property.rental.move_in_cost)}{" "}
            {property.devise?.code}
          </Text>
        </View>

        <Text style={styles.label}>Date d'entrée souhaitée</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Durée souhaitée (mois)</Text>
        <TextInput
          style={styles.input}
          value={months}
          onChangeText={setMonths}
          keyboardType="number-pad"
          placeholder={String(minimum)}
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.hint}>
          L'agence demande {minimum} mois au minimum pour ce logement.
        </Text>

        <Text style={styles.label}>Message à l'agence (facultatif)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          placeholder="Présentez-vous en quelques mots : situation, garanties..."
          placeholderTextColor="#9ca3af"
        />

        {submit.isError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#991b1b" />
            <Text style={styles.errorText}>
              {apiErrorMessage(submit.error, "La demande n'a pas pu être déposée.")}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, submit.isPending && styles.submitBtnDisabled]}
          activeOpacity={0.9}
          disabled={submit.isPending}
          onPress={() =>
            submit.mutate(
              {
                property_id: id,
                desired_start_date: startDate,
                desired_duration_months: duration,
                message: message.trim() || undefined,
              },
              { onSuccess: (application) => router.replace(`/rental/applications/${application.id}`) }
            )
          }
        >
          {submit.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Déposer ma demande</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Vous pourrez joindre vos pièces justificatives juste après, et retirer votre demande tant
          que l'agence ne l'a pas tranchée.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  propertyCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
  },
  propertyName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  propertyCity: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  propertyPrice: { fontSize: 18, fontWeight: "800", color: "#4f46e5", marginTop: 8 },
  propertyHint: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  textarea: { height: 100, textAlignVertical: "top" },
  hint: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  errorText: { flex: 1, fontSize: 12, color: "#991b1b" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4f46e5",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  footnote: { fontSize: 11, color: "#9ca3af", marginTop: 12, lineHeight: 16 },
});
