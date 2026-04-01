import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const { width, height } = Dimensions.get("window");

// ─── MOCK DATA ────────────────────────────────────────────────
const MOCK_POSTS = [
  {
    id: "1",
    user: { name: "Prestige Immobilier", avatar: null },
    property: {
      name: "Villa Moderne Almadies",
      description: "Magnifique villa avec piscine, 4 chambres, garage double. Vue mer imprenable.",
      city: "Dakar",
      country: "Sénégal",
      price: 150000000,
      devise: { code: "FCFA" },
      surface: 320,
      rooms: 6,
      sold: false,
      images: [{ image_path: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800", is_cover: true }],
    },
    likes_count: 142,
    comments_count: 18,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    is_liked_by_user: false,
  },
  {
    id: "2",
    user: { name: "Dakar Realty", avatar: null },
    property: {
      name: "Appartement Plateau",
      description: "Superbe appartement rénové au cœur du Plateau, lumineux et moderne.",
      city: "Dakar",
      country: "Sénégal",
      price: 45000000,
      devise: { code: "FCFA" },
      surface: 110,
      rooms: 3,
      sold: false,
      images: [{ image_path: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", is_cover: true }],
    },
    likes_count: 87,
    comments_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    is_liked_by_user: true,
  },
  {
    id: "3",
    user: { name: "Elite Properties", avatar: null },
    property: {
      name: "Duplex Mermoz",
      description: "Beau duplex dans une résidence sécurisée avec jardin privatif.",
      city: "Dakar",
      country: "Sénégal",
      price: 95000000,
      devise: { code: "FCFA" },
      surface: 200,
      rooms: 5,
      sold: true,
      images: [{ image_path: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", is_cover: true }],
    },
    likes_count: 203,
    comments_count: 31,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    is_liked_by_user: false,
  },
];

const MOCK_COMMENTS = [
  { id: "c1", user: { name: "Aminata Diallo" }, content: "Très belle propriété, j'adore l'emplacement !", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "c2", user: { name: "Moussa Ndiaye" }, content: "Le prix est-il négociable ?", created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "c3", user: { name: "Fatou Seck" }, content: "Magnifique ! Je voudrais une visite 🙏", created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: "c4", user: { name: "Ibrahim Ba" }, content: "Est-ce que la piscine est incluse dans le prix ?", created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
];
// ─────────────────────────────────────────────────────────────

function PostCard({ post }: { post: any }) {
  const { id: postId, property, user, likes_count, comments_count, created_at, is_liked_by_user } = post;

  const [localLiked, setLocalLiked] = useState(is_liked_by_user || false);
  const [localLikesCount, setLocalLikesCount] = useState(likes_count || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(comments_count || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const likeScale = useRef(new Animated.Value(1)).current;

  const coverImage =
    property?.images?.find((img) => img.is_cover)?.image_path ||
    property?.images?.[0]?.image_path ||
    "https://placehold.co/600x400?text=No+Image";

  const formattedDate = created_at
    ? formatDistanceToNow(new Date(created_at), { locale: fr, addSuffix: false })
    : "";

  const handleLike = () => {
    // Animate heart
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();

    setLocalLiked((prev) => !prev);
    setLocalLikesCount((prev) => (localLiked ? prev - 1 : prev + 1));
  };

  const openComments = () => {
    if (!commentsLoaded) {
      // Simulate fetch
      setTimeout(() => setComments(MOCK_COMMENTS), 300);
      setCommentsLoaded(true);
    }
    setIsCommentsOpen(true);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      user: { name: "Moi" },
      content: commentText,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    setLocalCommentsCount((prev) => prev + 1);
    setCommentText("");
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR").format(price);

  return (
    <>
      <View style={styles.card}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || "Agence Immobilière"}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                <Text style={styles.locationText}>
                  {property?.city}, {property?.country}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.timeText}>{formattedDate}</Text>
        </View>

        {/* ── Image ── */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: coverImage }} style={styles.image} resizeMode="cover" />
          {property?.sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>VENDU</Text>
            </View>
          )}
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <View style={styles.actionsLeft}>
            {/* Like */}
            <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Ionicons
                  name={localLiked ? "heart" : "heart-outline"}
                  size={26}
                  color={localLiked ? "#ef4444" : "#374151"}
                />
              </Animated.View>
              <Text style={styles.actionCount}>{localLikesCount}</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity onPress={openComments} style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={24} color="#374151" />
              <Text style={styles.actionCount}>{localCommentsCount}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="send" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <Text style={styles.price}>
            {formatPrice(property?.price)} {property?.devise?.code}
          </Text>
        </View>

        {/* ── Details ── */}
        <View style={styles.details}>
          <View style={styles.detailsRow}>
            <View style={styles.detailChip}>
              <MaterialCommunityIcons name="ruler-square" size={14} color="#6b7280" />
              <Text style={styles.detailText}>{property?.surface} m²</Text>
            </View>
            <View style={styles.detailChip}>
              <Ionicons name="bed-outline" size={14} color="#6b7280" />
              <Text style={styles.detailText}>{property?.rooms} Pièces</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            <Text style={styles.descriptionBold}>{user?.name} </Text>
            {property?.name} — {property?.description}
          </Text>

          {localCommentsCount > 0 && (
            <TouchableOpacity onPress={openComments}>
              <Text style={styles.viewComments}>
                Voir les {localCommentsCount} commentaires
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Comments Bottom Sheet ── */}
      <Modal
        visible={isCommentsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCommentsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setIsCommentsOpen(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.sheet}
          >
            {/* Handle */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Commentaires</Text>
            </View>

            {/* Comments List */}
            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {comments.length === 0 ? (
                <Text style={styles.noComments}>
                  Aucun commentaire.{"\n"}Soyez le premier à commenter !
                </Text>
              ) : (
                comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {c.user?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentBody}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentUser}>{c.user?.name}</Text>
                        <Text style={styles.commentTime}>
                          {formatDistanceToNow(new Date(c.created_at), { locale: fr })}
                        </Text>
                      </View>
                      <Text style={styles.commentContent}>{c.content}</Text>
                      <TouchableOpacity>
                        <Text style={styles.replyBtn}>Répondre</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="heart-outline" size={14} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.commentInputWrap}>
              <TextInput
                style={styles.commentInput}
                placeholder="Ajouter un commentaire..."
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
                multiline={false}
              />
              {commentText.trim().length > 0 && (
                <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendBtn}>
                  <Feather name="send" size={20} color="#1a1a2e" />
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

// ─── FEED (export principal) ───────────────────────────────────
export default function PostFeed() {
  return (
    <ScrollView
      style={styles.feed}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {MOCK_POSTS.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </ScrollView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  feed: { flex: 1, backgroundColor: "#f9fafb" },

  // Card
  card: {
    backgroundColor: "#fff",
    marginBottom: 8,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#e0e7ff", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#c7d2fe",
  },
  avatarText: { fontWeight: "700", color: "#4f46e5", fontSize: 16 },
  userName: { fontWeight: "600", fontSize: 13, color: "#111827" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 2 },
  locationText: { fontSize: 11, color: "#9ca3af" },
  timeText: { fontSize: 11, color: "#9ca3af" },

  // Image
  imageWrap: { width: "100%", aspectRatio: 1, position: "relative" },
  image: { width: "100%", height: "100%" },
  soldBadge: {
    position: "absolute", top: 12, right: 12,
    backgroundColor: "#ef4444", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  soldText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 1 },

  // Actions
  actions: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 12, paddingVertical: 10,
  },
  actionsLeft: { flexDirection: "row", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionCount: { fontSize: 13, fontWeight: "600", color: "#374151" },
  price: { fontSize: 16, fontWeight: "800", color: "#4f46e5" },

  // Details
  details: { paddingHorizontal: 12, paddingBottom: 14 },
  detailsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  detailChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#f3f4f6", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  detailText: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  description: { fontSize: 13, color: "#374151", lineHeight: 19 },
  descriptionBold: { fontWeight: "700" },
  viewComments: { fontSize: 13, color: "#9ca3af", marginTop: 6 },

  // Modal / Bottom Sheet
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    height: height * 0.72,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  sheetHeader: {
    alignItems: "center", paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb",
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: "#d1d5db", borderRadius: 2, marginBottom: 10 },
  sheetTitle: { fontWeight: "700", fontSize: 15, color: "#111827" },

  // Comments
  commentsList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  noComments: { textAlign: "center", color: "#9ca3af", marginTop: 40, lineHeight: 22, fontSize: 14 },
  commentItem: { flexDirection: "row", gap: 10, marginBottom: 22 },
  commentAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  commentAvatarText: { fontWeight: "700", fontSize: 13, color: "#374151" },
  commentBody: { flex: 1 },
  commentMeta: { flexDirection: "row", gap: 8, alignItems: "center" },
  commentUser: { fontWeight: "700", fontSize: 13, color: "#111827" },
  commentTime: { fontSize: 11, color: "#9ca3af" },
  commentContent: { fontSize: 13, color: "#374151", marginTop: 2, lineHeight: 18 },
  replyBtn: { fontSize: 12, fontWeight: "600", color: "#9ca3af", marginTop: 6 },

  // Comment Input
  commentInputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 0.5, borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1, height: 40, backgroundColor: "#f3f4f6",
    borderRadius: 20, paddingHorizontal: 16,
    fontSize: 14, color: "#111827",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  sendBtn: { padding: 6 },
});