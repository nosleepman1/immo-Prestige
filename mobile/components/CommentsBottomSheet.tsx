import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  FlatList,
  Keyboard,
} from "react-native";
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
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Comment, CommentReply } from "@/types/social";

interface Props {
  postId: number | null;
  onClose: () => void;
}

export interface CommentsBottomSheetHandle {
  snapToIndex: (index: number) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const MID_RATIO = 0.55;
const EXPANDED_TRANSLATE = 0;
const MID_TRANSLATE = SHEET_HEIGHT - SCREEN_HEIGHT * MID_RATIO;
const CLOSED_TRANSLATE = SHEET_HEIGHT;
const CLOSE_DRAG_THRESHOLD = SHEET_HEIGHT * 0.3;

/**
 * Instagram-style comments: a bottom sheet that slides up from the bottom and
 * can be dragged to snap between a mid position and an expanded one, or
 * dragged down past a threshold to close. Built on RN's core Animated +
 * PanResponder (no reanimated/@gorhom/bottom-sheet) because reanimated's
 * useAnimatedRef currently crashes under New Architecture on Expo Go 54 —
 * see software-mansion/react-native-reanimated#9172 and
 * gorhom/react-native-bottom-sheet#2528 (both unresolved upstream).
 */
const CommentsBottomSheet = forwardRef<CommentsBottomSheetHandle, Props>(({ postId, onClose }, ref) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(CLOSED_TRANSLATE)).current;
  const lastTranslate = useRef(CLOSED_TRANSLATE);

  const userId = useAuthStore((s) => s.user?.id);
  const { data: comments, isLoading } = useComments(postId ?? NaN);
  const createComment = useCreateComment(postId ?? NaN);
  const deleteComment = useDeleteComment(postId ?? NaN);
  const createReply = useCreateReply(postId ?? NaN);
  const deleteReply = useDeleteReply(postId ?? NaN);
  const createReport = useCreateReport();
  const requireAuth = useRequireAuth();

  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const animateTo = useCallback(
    (value: number, onDone?: () => void) => {
      lastTranslate.current = value;
      Animated.spring(translateY, {
        toValue: value,
        useNativeDriver: true,
        bounciness: 4,
      }).start(() => onDone?.());
    },
    [translateY]
  );

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    animateTo(CLOSED_TRANSLATE, () => {
      setVisible(false);
      onClose();
    });
  }, [animateTo, onClose]);

  useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => {
      setVisible(true);
      const target = index >= 1 ? EXPANDED_TRANSLATE : MID_TRANSLATE;
      // Start off-screen the first time this becomes visible.
      translateY.setValue(CLOSED_TRANSLATE);
      requestAnimationFrame(() => animateTo(target));
    },
  }));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => {
          translateY.setOffset(lastTranslate.current);
          translateY.setValue(0);
        },
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy < 0 && lastTranslate.current + gesture.dy < EXPANDED_TRANSLATE) return;
          translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_, gesture) => {
          translateY.flattenOffset();
          const current = lastTranslate.current + gesture.dy;

          if (current > CLOSE_DRAG_THRESHOLD + MID_TRANSLATE || gesture.vy > 1.2) {
            handleClose();
            return;
          }
          if (current < MID_TRANSLATE / 2 || gesture.vy < -1.2) {
            animateTo(EXPANDED_TRANSLATE);
            return;
          }
          animateTo(MID_TRANSLATE);
        },
      }),
    [animateTo, handleClose, translateY]
  );

  const backdropOpacity = translateY.interpolate({
    inputRange: [EXPANDED_TRANSLATE, CLOSED_TRANSLATE],
    outputRange: [0.5, 0],
    extrapolate: "clamp",
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (!requireAuth()) return;
    if (replyingTo) {
      createReply.mutate({ commentId: replyingTo, content: text });
    } else {
      createComment.mutate(text);
    }
    setText("");
    setReplyingTo(null);
  };

  const confirmReport = (type: "comment" | "comment_reply", id: number) => {
    if (!requireAuth()) return;
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
          <TouchableOpacity onPress={() => requireAuth() && setReplyingTo(comment.id)}>
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

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={StyleSheet.absoluteFill}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableOpacity>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Commentaires</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <FlatList
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
        </Animated.View>
      </View>
    </Modal>
  );
});

CommentsBottomSheet.displayName = "CommentsBottomSheet";
export default CommentsBottomSheet;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  handleWrap: { alignItems: "center", paddingTop: 8, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#d1d5db" },
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
