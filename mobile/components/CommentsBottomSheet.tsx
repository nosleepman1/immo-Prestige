import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Feather, Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuthStore } from "@/store/auth.store";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useCreateReply,
  useDeleteReply,
} from "@/hooks/social/useComments";
import { useCreateReport } from "@/hooks/social/useCreateReport";
import type { Comment, CommentReply } from "@/types/social";

interface Props {
  postId: number | null;
  onClose: () => void;
}

/**
 * Instagram-style comments: a bottom sheet that opens from the bottom and can
 * be dragged up to roughly the middle of the screen (snapPoints below),
 * rather than a full-page navigation.
 */
const CommentsBottomSheet = forwardRef<BottomSheet, Props>(({ postId, onClose }, ref) => {
  const snapPoints = useMemo(() => ["55%", "90%"], []);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: comments, isLoading } = useComments(postId ?? NaN);
  const createComment = useCreateComment(postId ?? NaN);
  const deleteComment = useDeleteComment(postId ?? NaN);
  const createReply = useCreateReply(postId ?? NaN);
  const deleteReply = useDeleteReply(postId ?? NaN);
  const createReport = useCreateReport();

  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (replyingTo) {
      createReply.mutate({ commentId: replyingTo, content: text });
    } else {
      createComment.mutate(text);
    }
    setText("");
    setReplyingTo(null);
  };

  const confirmReport = (type: "comment" | "comment_reply", id: number) => {
    Alert.alert("Signaler", "Voulez-vous signaler ce contenu ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Signaler",
        style: "destructive",
        onPress: () =>
          createReport.mutate({ reportable_type: type, reportable_id: id, reason: "inappropriate" }),
      },
    ]);
  };

  const confirmDelete = (kind: "comment" | "reply", id: number) => {
    Alert.alert("Supprimer", "Supprimer ce message ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => (kind === "comment" ? deleteComment.mutate(id) : deleteReply.mutate(id)),
      },
    ]);
  };

  const renderReply = (reply: CommentReply) => (
    <View key={reply.id} style={styles.replyItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{reply.user?.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentUser}>{reply.user?.name}</Text>
          <Text style={styles.commentTime}>{formatDistanceToNow(new Date(reply.created_at), { locale: fr })}</Text>
        </View>
        <Text style={styles.commentContent}>{reply.content}</Text>
        <View style={styles.commentRow}>
          {reply.user?.id === userId ? (
            <TouchableOpacity onPress={() => confirmDelete("reply", reply.id)}>
              <Text style={styles.deleteBtn}>Supprimer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => confirmReport("comment_reply", reply.id)}>
              <Text style={styles.reportBtn}>Signaler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderComment = ({ item: comment }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{comment.user?.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentUser}>{comment.user?.name}</Text>
          <Text style={styles.commentTime}>{formatDistanceToNow(new Date(comment.created_at), { locale: fr })}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <View style={styles.commentRow}>
          <TouchableOpacity onPress={() => setReplyingTo(comment.id)}>
            <Text style={styles.replyBtn}>Répondre</Text>
          </TouchableOpacity>
          {comment.user?.id === userId ? (
            <TouchableOpacity onPress={() => confirmDelete("comment", comment.id)}>
              <Text style={styles.deleteBtn}>Supprimer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => confirmReport("comment", comment.id)}>
              <Text style={styles.reportBtn}>Signaler</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.replies.map(renderReply)}
      </View>
    </View>
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Commentaires</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <BottomSheetFlatList
          data={comments ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderComment}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}
          ListEmptyComponent={
            <Text style={styles.noComments}>Aucun commentaire.{"\n"}Soyez le premier à commenter !</Text>
          }
        />
      )}

      <View style={styles.inputWrap}>
        {replyingTo && (
          <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.cancelReply}>
            <Text style={styles.cancelReplyText}>Annuler la réponse ✕</Text>
          </TouchableOpacity>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={replyingTo ? "Écrire une réponse..." : "Ajouter un commentaire..."}
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={setText}
          />
          {text.trim().length > 0 && (
            <TouchableOpacity onPress={handleSubmit} style={styles.sendBtn}>
              <Feather name="send" size={20} color="#1a1a2e" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BottomSheet>
  );
});

CommentsBottomSheet.displayName = "CommentsBottomSheet";
export default CommentsBottomSheet;

const styles = StyleSheet.create({
  handle: { backgroundColor: "#d1d5db" },
  sheetHeader: {
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  sheetTitle: { fontWeight: "700", fontSize: 15, color: "#111827" },

  noComments: { textAlign: "center", color: "#9ca3af", marginTop: 40, lineHeight: 22, fontSize: 14 },
  commentItem: { flexDirection: "row", gap: 10, marginBottom: 20 },
  replyItem: { flexDirection: "row", gap: 10, marginTop: 14, marginLeft: 12 },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  commentAvatarText: { fontWeight: "700", fontSize: 13, color: "#374151" },
  commentBody: { flex: 1 },
  commentMeta: { flexDirection: "row", gap: 8, alignItems: "center" },
  commentUser: { fontWeight: "700", fontSize: 13, color: "#111827" },
  commentTime: { fontSize: 11, color: "#9ca3af" },
  commentContent: { fontSize: 13, color: "#374151", marginTop: 2, lineHeight: 18 },
  commentRow: { flexDirection: "row", gap: 14, marginTop: 6 },
  replyBtn: { fontSize: 12, fontWeight: "600", color: "#9ca3af" },
  deleteBtn: { fontSize: 12, fontWeight: "600", color: "#ef4444" },
  reportBtn: { fontSize: 12, fontWeight: "600", color: "#9ca3af" },

  inputWrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  cancelReply: { marginBottom: 6 },
  cancelReplyText: { fontSize: 12, color: "#6366f1" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sendBtn: { padding: 6 },
});
