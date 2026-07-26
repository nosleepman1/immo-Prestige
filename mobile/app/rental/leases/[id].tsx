import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLeaseActions, useLeaseInstallments, useMyLease } from "@/hooks/rental/useRental";
import { apiErrorMessage } from "@/lib/apiError";
import type { InstallmentStatus } from "@/types/rental";

const STATUS_COLOR: Record<InstallmentStatus, string> = {
  pending: "#6b7280",
  partially_paid: "#0284c7",
  paid: "#059669",
  late: "#dc2626",
  cancelled: "#9ca3af",
};

const money = (amount: number) => `${new Intl.NumberFormat("fr-FR").format(amount)} XOF`;
const shortDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");

export default function LeaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const leaseId = Number(id);

  const { data: lease, isLoading, isError, refetch } = useMyLease(leaseId);
  const installments = useLeaseInstallments(leaseId);
  const actions = useLeaseActions(leaseId);
  const [selected, setSelected] = useState<number[]>([]);

  const selectedTotal = useMemo(
    () =>
      (installments.data ?? [])
        .filter((item) => selected.includes(item.id))
        .reduce((sum, item) => sum + item.remaining_due, 0),
    [installments.data, selected]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !lease) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#d1d5db" />
        <Text style={styles.emptyText}>Ce bail est introuvable.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => refetch()}>
          <Text style={styles.primaryBtnText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggle = (installmentId: number) =>
    setSelected((current) =>
      current.includes(installmentId)
        ? current.filter((value) => value !== installmentId)
        : [...current, installmentId]
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: lease.reference }} />

      <View style={styles.header}>
        <Text style={styles.propertyName}>{lease.property?.name}</Text>
        <Text style={styles.reference}>{lease.reference}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{lease.status_label}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Conditions</Text>
        <Line label="Période" value={`${shortDate(lease.start_date)} → ${shortDate(lease.end_date)}`} />
        <Line label="Loyer" value={money(lease.rent_amount)} />
        <Line label="Charges" value={money(lease.charges_amount)} />
        <Line label="Total mensuel" value={money(lease.monthly_total)} strong />
        <Line label="Dépôt de garantie" value={money(lease.deposit_amount)} />
        <Line label="Échéance" value={`le ${lease.payment_day} de chaque mois`} />
      </View>

      {lease.status === "pending_validation" && (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Lisez et validez votre contrat</Text>
          <Text style={styles.actionHint}>
            Prenez le temps de lire le document. En validant, vous acceptez les conditions
            ci-dessus ; le paiement sera ensuite ouvert.
          </Text>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL}/leases/${lease.id}/contract`)}
          >
            <Ionicons name="document-text-outline" size={16} color="#4f46e5" />
            <Text style={styles.secondaryBtnText}>Ouvrir le contrat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={actions.validateTerms.isPending}
            onPress={() => actions.validateTerms.mutate()}
          >
            <Text style={styles.primaryBtnText}>
              {actions.validateTerms.isPending ? "Validation..." : "J'accepte les conditions"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {lease.status === "pending_signature" && (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Signez et renvoyez le contrat</Text>
          <Text style={styles.actionHint}>
            Imprimez le contrat, signez-le, puis photographiez-le ou scannez-le pour le renvoyer à
            l'agence.
          </Text>
          {lease.signature_rejection_reason && (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                L'agence a refusé votre envoi : {lease.signature_rejection_reason}
              </Text>
            </View>
          )}
          {lease.has_signed_contract && !lease.signature_rejection_reason && (
            <Text style={styles.waitingText}>
              Document reçu — l'agence le contrôle, vous serez prévenu.
            </Text>
          )}
        </View>
      )}

      {lease.status === "pending_payment" && (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Versement initial</Text>
          <Text style={styles.bigAmount}>{money(lease.initial_payment)}</Text>
          <Text style={styles.actionHint}>
            Dépôt de garantie et {lease.advance_months} mois d'avance. Votre bail démarre dès
            réception.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={actions.checkoutInitial.isPending}
            onPress={() =>
              actions.checkoutInitial.mutate(undefined, {
                onSuccess: (result) => Linking.openURL(result.redirect_url),
              })
            }
          >
            <Text style={styles.primaryBtnText}>
              {actions.checkoutInitial.isPending ? "Ouverture..." : "Payer maintenant"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footnote}>
            Vous pouvez aussi régler en espèces auprès de votre agence.
          </Text>
        </View>
      )}

      {lease.status === "active" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mes échéances</Text>

          {installments.isLoading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : installments.isError ? (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => installments.refetch()}>
              <Text style={styles.secondaryBtnText}>Réessayer</Text>
            </TouchableOpacity>
          ) : !installments.data?.length ? (
            <Text style={styles.actionHint}>
              Vos échéances apparaîtront ici dès qu'elles seront émises.
            </Text>
          ) : (
            installments.data.map((installment) => {
              const isSelected = selected.includes(installment.id);
              const payable = installment.remaining_due > 0;

              return (
                <TouchableOpacity
                  key={installment.id}
                  style={[styles.installment, isSelected && styles.installmentSelected]}
                  activeOpacity={payable ? 0.7 : 1}
                  onPress={() => payable && toggle(installment.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.installmentPeriod}>
                      {shortDate(installment.period_start)} → {shortDate(installment.period_end)}
                    </Text>
                    <Text style={[styles.installmentStatus, { color: STATUS_COLOR[installment.status] }]}>
                      {installment.status_label}
                      {payable ? ` — reste ${money(installment.remaining_due)}` : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.installmentAmount}>{money(installment.total_amount)}</Text>
                    {payable && (
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={isSelected ? "#4f46e5" : "#d1d5db"}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {selected.length > 0 && (
            <View style={styles.payBar}>
              <View>
                <Text style={styles.payBarLabel}>
                  {selected.length} mois sélectionné{selected.length > 1 ? "s" : ""}
                </Text>
                <Text style={styles.payBarAmount}>{money(selectedTotal)}</Text>
              </View>
              <TouchableOpacity
                style={styles.payBtn}
                disabled={actions.checkoutMonths.isPending}
                onPress={() =>
                  actions.checkoutMonths.mutate(selected, {
                    onSuccess: (result) => Linking.openURL(result.redirect_url),
                  })
                }
              >
                <Text style={styles.primaryBtnText}>
                  {actions.checkoutMonths.isPending ? "..." : "Payer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {actions.checkoutMonths.isError && (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                {apiErrorMessage(actions.checkoutMonths.error, "Le paiement n'a pas pu être ouvert.")}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={[styles.lineValue, strong && styles.lineValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 10 },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center" },
  header: { marginBottom: 16 },
  propertyName: { fontSize: 20, fontWeight: "800", color: "#111827" },
  reference: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: { fontSize: 12, fontWeight: "700", color: "#4f46e5" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  lineLabel: { fontSize: 13, color: "#6b7280" },
  lineValue: { fontSize: 13, color: "#374151", fontWeight: "600" },
  lineValueStrong: { color: "#111827", fontWeight: "800" },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  actionTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  actionHint: { fontSize: 12, color: "#6b7280", lineHeight: 18, marginTop: 6 },
  bigAmount: { fontSize: 26, fontWeight: "800", color: "#4f46e5", marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryBtnText: { color: "#4f46e5", fontSize: 13, fontWeight: "600" },
  warnBox: { backgroundColor: "#fef3c7", borderRadius: 10, padding: 10, marginTop: 10 },
  warnText: { fontSize: 12, color: "#92400e" },
  waitingText: { fontSize: 12, color: "#059669", fontWeight: "600", marginTop: 10 },
  footnote: { fontSize: 11, color: "#9ca3af", marginTop: 8, textAlign: "center" },
  installment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  installmentSelected: { backgroundColor: "#f5f3ff", marginHorizontal: -14, paddingHorizontal: 14 },
  installmentPeriod: { fontSize: 13, fontWeight: "600", color: "#374151" },
  installmentStatus: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  installmentAmount: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 2 },
  payBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  payBarLabel: { fontSize: 11, color: "#6b7280" },
  payBarAmount: { fontSize: 17, fontWeight: "800", color: "#4f46e5" },
  payBtn: { backgroundColor: "#4f46e5", paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
});
