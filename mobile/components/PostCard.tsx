import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useToggleLike } from "@/hooks/social/useToggleLike";
import type { Post } from "@/types/social";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

export default function PostCard({
  post,
  onOpenComments,
}: {
  post: Post;
  onOpenComments: (postId: number) => void;
}) {
  const router = useRouter();
  const toggleLike = useToggleLike();
  const property = post.property;

  const coverImage =
    property?.images?.find((img) => img.is_cover)?.url ||
    property?.images?.[0]?.url ||
    "https://placehold.co/600x400?text=No+Image";

  const formattedDate = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { locale: fr, addSuffix: false })
    : "";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {property?.agency?.company_name ? property.agency.company_name.charAt(0).toUpperCase() : "A"}
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.userName}>{property?.agency?.company_name ?? "Agence"}</Text>
              {property?.agency?.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
              )}
            </View>
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

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => property && router.push(`/properties/${property.id}`)}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: coverImage }} style={styles.image} resizeMode="cover" />
          {property?.sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>VENDU</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={() => toggleLike.mutate(post.id)} style={styles.actionBtn}>
            <Ionicons
              name={post.is_liked_by_user ? "heart" : "heart-outline"}
              size={26}
              color={post.is_liked_by_user ? "#ef4444" : "#374151"}
            />
            <Text style={styles.actionCount}>{post.likes_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onOpenComments(post.id)} style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={24} color="#374151" />
            <Text style={styles.actionCount}>{post.comments_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="send" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>
          {property ? formatPrice(property.price) : ""} {property?.devise?.code}
        </Text>
      </View>

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
          <Text style={styles.descriptionBold}>{property?.agency?.company_name} </Text>
          {property?.name} — {property?.description}
        </Text>

        {post.comments_count > 0 && (
          <TouchableOpacity onPress={() => onOpenComments(post.id)}>
            <Text style={styles.viewComments}>Voir les {post.comments_count} commentaires</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 8,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  avatarText: { fontWeight: "700", color: "#4f46e5", fontSize: 16 },
  userName: { fontWeight: "600", fontSize: 13, color: "#111827" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 2 },
  locationText: { fontSize: 11, color: "#9ca3af" },
  timeText: { fontSize: 11, color: "#9ca3af" },

  imageWrap: { width: "100%", aspectRatio: 1, position: "relative" },
  image: { width: "100%", height: "100%" },
  soldBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  soldText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 1 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionsLeft: { flexDirection: "row", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionCount: { fontSize: 13, fontWeight: "600", color: "#374151" },
  price: { fontSize: 16, fontWeight: "800", color: "#4f46e5" },

  details: { paddingHorizontal: 12, paddingBottom: 14 },
  detailsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailText: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  description: { fontSize: 13, color: "#374151", lineHeight: 19 },
  descriptionBold: { fontWeight: "700" },
  viewComments: { fontSize: 13, color: "#9ca3af", marginTop: 6 },
});
