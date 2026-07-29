import { useCallback, useRef, useState, useMemo } from "react";
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import PostCard from "@/components/PostCard";
import CommentsBottomSheet, { CommentsBottomSheetHandle } from "@/components/CommentsBottomSheet";
import { usePostsFeed } from "@/hooks/social/usePostsFeed";

const FILTER_CHIPS = [
  { id: "all", label: "Tous", icon: "sparkles-outline" },
  { id: "dakar", label: "📍 Dakar", city: "Dakar" },
  { id: "almadies", label: "📍 Almadies", city: "Almadies" },
  { id: "mermoz", label: "📍 Mermoz", city: "Mermoz" },
  { id: "saly", label: "📍 Saly", city: "Saly" },
  { id: "rent", label: "🔑 À Louer", transaction: "rent" },
  { id: "sale", label: "🏷️ À Vendre", transaction: "sale" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePostsFeed();
  const sheetRef = useRef<CommentsBottomSheetHandle>(null);
  const [activePostId, setActivePostId] = useState<number | null>(null);

  // Top Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChip, setSelectedChip] = useState("all");
  const [showSearchInput, setShowSearchInput] = useState(true);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  // Filter posts based on search query or selected chip
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.content?.toLowerCase().includes(q) ||
        post.agency?.company_name?.toLowerCase().includes(q) ||
        post.agency?.city?.toLowerCase().includes(q) ||
        post.property?.name?.toLowerCase().includes(q) ||
        post.property?.city?.toLowerCase().includes(q) ||
        post.property?.region?.toLowerCase().includes(q);

      const chipObj = FILTER_CHIPS.find((c) => c.id === selectedChip);
      let matchesChip = true;
      if (chipObj?.city) {
        matchesChip =
          post.property?.city?.toLowerCase().includes(chipObj.city.toLowerCase()) ||
          post.agency?.city?.toLowerCase().includes(chipObj.city.toLowerCase()) ||
          post.content?.toLowerCase().includes(chipObj.city.toLowerCase());
      } else if (chipObj?.transaction) {
        matchesChip = post.property?.transaction_type === chipObj.transaction;
      }

      return matchesQuery && matchesChip;
    });
  }, [posts, searchQuery, selectedChip]);

  const openComments = useCallback((postId: number) => {
    setActivePostId(postId);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleChipPress = (chipId: string) => {
    setSelectedChip(chipId);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="office-building" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>IMMO PRESTIGE</Text>
            <View style={styles.locationWrap}>
              <Ionicons name="location-sharp" size={10} color="#059669" />
              <Text style={styles.locationText}>Sénégal</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, showSearchInput && styles.iconBtnActive]}
            onPress={() => setShowSearchInput((prev) => !prev)}
          >
            <Ionicons name="search" size={18} color={showSearchInput ? "#059669" : "#374151"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/rental")}>
            <Ionicons name="notifications-outline" size={19} color="#374151" />
            <View style={styles.dotBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Search Input Box */}
      {showSearchInput && (
        <View style={styles.searchSection}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher ville, quartier, annonce..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Quick Filter Horizontal Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {FILTER_CHIPS.map((chip) => {
              const active = selectedChip === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => handleChipPress(chip.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Feed List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} onOpenComments={openComments} />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} color="#059669" /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Aucune publication trouvée</Text>
            <Text style={styles.emptySubtitle}>Essayez de modifier votre recherche ou vos filtres.</Text>
            {(searchQuery || selectedChip !== "all") && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedChip("all");
                }}
              >
                <Text style={styles.resetBtnText}>Réinitialiser la recherche</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <CommentsBottomSheet ref={sheetRef} postId={activePostId} onClose={() => setActivePostId(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  brandTitle: { fontSize: 15, fontWeight: "900", color: "#0f172a", letterSpacing: 0.8 },
  locationWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  locationText: { fontSize: 10, fontWeight: "600", color: "#059669" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconBtnActive: { backgroundColor: "#d1fae5" },
  dotBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ef4444",
  },
  searchSection: {
    backgroundColor: "#ffffff",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#0f172a" },
  chipsScroll: { paddingHorizontal: 16, gap: 6, alignItems: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipActive: { backgroundColor: "#059669", borderColor: "#059669" },
  chipText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  chipTextActive: { color: "#ffffff" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#334155", marginTop: 10 },
  emptySubtitle: { fontSize: 12, color: "#64748b", marginTop: 4, textAlign: "center" },
  resetBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: "#e0e7ff" },
  resetBtnText: { fontSize: 12, fontWeight: "700", color: "#4338ca" },
});
