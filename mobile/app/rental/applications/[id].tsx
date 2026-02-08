import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCancelApplication,
  useMyApplication,
  useUploadApplicationDocument,
} from "@/hooks/rental/useRental";
import { useDocumentPicker } from "@/hooks/rental/useDocumentPicker";
import { apiErrorMessage } from "@/lib/apiError";
import {
  APPLICATION_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type RentalApplicationStatus,
  type RentalDocumentType,
} from "@/types/rental";

const STATUS_COLOR: Record<RentalApplicationStatus, string> = {
  submitted: "#d97706",
  under_review: "#0284c7",
  documents_requested: "#0284c7",
  accepted: "#059669",
  rejected: "#dc2626",
  cancelled: "#9ca3af",
};

const shortDate = (value: string) => new Date(value).toLocaleDateString("fr-FR");

/** The four states in which the candidate can still withdraw. */
const CANCELLABLE: RentalApplicationStatus[] = [
  "submitted",
  "under_review",
  "documents_requested",
  "accepted",
];

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const applicationId = Number(id);
  const router = useRouter();

  const { data: application, isLoading, isError, refetch } = useMyApplication(applicationId);
  const cancel = useCancelApplication();
  const upload = useUploadApplicationDocument(applicationId);
  const pickDocument = useDocumentPicker();
  const [documentType, setDocumentType] = useState<RentalDocumentType>("identity_document");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !application) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#d1d5db" />
        <Text style={styles.emptyText}>Cette demande est introuvable.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => refetch()}>
          <Text style={styles.primaryBtnText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancel = CANCELLABLE.includes(application.status);
  // The server refuses a document on a decided application; do not offer it.
  const canAttach = CANCELLABLE.includes(application.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: "Ma demande" }} />

      <Text style={styles.propertyName}>{application.property?.name}</Text>
      <Text style={styles.propertyCity}>{application.property?.city}</Text>
      <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLOR[application.status]}18` }]}>
        <Text style={[styles.statusText, { color: STATUS_COLOR[application.status] }]}>
          {APPLICATION_STATUS_LABELS[application.status]}
        </Text>
      </View>

      {application.status === "documents_requested" && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>L'agence attend des pièces</Text>
          <Text style={styles.alertText}>{application.requested_documents}</Text>
        </View>
      )}

      {application.status === "rejected" && application.rejection_reason && (
        <View style={[styles.alertBox, styles.alertBoxRejected]}>
          <Text style={styles.alertTitle}>Demande non retenue</Text>
          <Text style={styles.alertText}>{application.rejection_reason}</Text>
        </View>
      )}

      {application.status === "accepted" && (
        <View style={[styles.alertBox, styles.alertBoxAccepted]}>
          <Text style={styles.alertTitle}>Demande acceptée</Text>
          <Text style={styles.alertText}>
            L'agence prépare votre bail. Vous serez prévenu dès qu'il sera disponible à la lecture.
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ma demande</Text>
        <Line label="Entrée souhaitée" value={shortDate(application.desired_start_date)} />
        <Line label="Durée" value={`${application.desired_duration_months} mois`} />
        <Line label="Déposée le" value={shortDate(application.created_at)} />
        {application.message && (
          <>
            <Text style={styles.lineLabel}>Mon message</Text>
            <Text style={styles.message}>{application.message}</Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mes pièces justificatives</Text>
        {!application.documents?.length ? (
          <Text style={styles.hint}>
            Aucune pièce jointe. Ajoutez votre pièce d'identité et vos justificatifs de revenus pour
            appuyer votre dossier.
          </Text>
        ) : (
          application.documents.map((document) => (
            <View key={document.id} style={styles.documentRow}>
              <Ionicons name="document-outline" size={18} color="#6b7280" />
              <View style={{ flex: 1 }}>
                <Text style={styles.documentType}>{document.type_label}</Text>
                <Text style={styles.documentName}>{document.original_name}</Text>
              </View>
              <Text style={styles.documentSize}>{Math.round(document.size_bytes / 1024)} Ko</Text>
            </View>
          ))
        )}

        {canAttach && (
          <>
            <View style={styles.typeRow}>
              {(Object.keys(DOCUMENT_TYPE_LABELS) as RentalDocumentType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, documentType === type && styles.typeChipActive]}
                  onPress={() => setDocumentType(type)}
                >
                  <Text
                    style={[styles.typeChipText, documentType === type && styles.typeChipTextActive]}
                  >
                    {DOCUMENT_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.attachBtn}
              disabled={upload.isPending}
              onPress={async () => {
                const file = await pickDocument()
                // A cancelled picker is not a failure: say nothing.
                if (file) upload.mutate({ file, type: documentType })
              }}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#4f46e5" />
              <Text style={styles.attachBtnText}>
                {upload.isPending ? "Envoi..." : "Joindre un document (PDF ou photo)"}
              </Text>
            </TouchableOpacity>

            {upload.isError && (
              <Text style={styles.uploadError}>
                {apiErrorMessage(upload.error, "Ce document n'a pas pu être envoyé.")}
              </Text>
            )}
          </>
        )}
      </View>

      {canCancel && (
        <TouchableOpacity
          style={styles.cancelBtn}
          disabled={cancel.isPending}
          onPress={() =>
            Alert.alert(
              "Retirer ma demande ?",
              "L'agence ne pourra plus l'instruire. Vous pourrez en déposer une nouvelle plus tard.",
              [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Retirer",
                  style: "destructive",
                  onPress: () =>
                    cancel.mutate(applicationId, { onSuccess: () => router.replace("/rental") }),
                },
              ]
            )
          }
        >
          <Text style={styles.cancelBtnText}>
            {cancel.isPending ? "Retrait..." : "Retirer ma demande"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 10 },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center" },
  propertyName: { fontSize: 20, fontWeight: "800", color: "#111827" },
  propertyCity: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  alertBox: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  alertBoxRejected: { backgroundColor: "#fee2e2" },
  alertBoxAccepted: { backgroundColor: "#d1fae5" },
  alertTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  alertText: { fontSize: 12, color: "#374151", marginTop: 4, lineHeight: 18 },
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
  message: { fontSize: 13, color: "#374151", lineHeight: 19, marginTop: 4 },
  hint: { fontSize: 12, color: "#9ca3af", lineHeight: 18 },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  documentType: { fontSize: 13, fontWeight: "600", color: "#374151" },
  documentName: { fontSize: 11, color: "#9ca3af" },
  documentSize: { fontSize: 11, color: "#9ca3af" },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  cancelBtnText: { color: "#dc2626", fontSize: 14, fontWeight: "600" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  typeChipActive: { backgroundColor: "#4f46e5" },
  typeChipText: { fontSize: 11, fontWeight: "600", color: "#6b7280" },
  typeChipTextActive: { color: "#fff" },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderStyle: "dashed",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  attachBtnText: { color: "#4f46e5", fontSize: 13, fontWeight: "600" },
  uploadError: { fontSize: 12, color: "#dc2626", marginTop: 8 },
});
