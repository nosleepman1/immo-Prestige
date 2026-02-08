import { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { usePropertiesSearch } from "@/hooks/properties/usePropertiesSearch";
import { headlinePrice, type Property, type TransactionType } from "@/types/property";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

const CITY_PILLS = ["Toutes villes", "Dakar", "Almadies", "Mermoz", "Saly", "Somone"];

export default function PropertiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [selectedCityPill, setSelectedCityPill] = useState("Toutes villes");
  const [transactionType, setTransactionType] = useState<TransactionType | "all">("all");

  const effectiveCity = selectedCityPill !== "Toutes villes" ? selectedCityPill : city;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (effectiveCity) f.city = effectiveCity;
    if (transactionType !== "all") f.transaction_type = transactionType;
    return f;
  }, [effectiveCity, transactionType]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePropertiesSearch(filters);

  const properties = data?.pages.flatMap((page) => page.data) ?? [];

  const handleResetFilters = () => {
    setCity("");
    setSelectedCityPill("Toutes villes");
    setTransactionType("all");
  };

  const renderItem = ({ item }: { item: Property }) => {
    const cover = item.images.find((img) => img.is_cover)?.url ?? item.images[0]?.url;
    const headline = headlinePrice(item);
    const isRent = item.transaction_type === "rent";
    const isBoth = item.transaction_type === "both";

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/properties/${item.id}`)} activeOpacity={0.92}>
        <View style={styles.imageContainer}>
          {cover ? <Image source={{ uri: cover }} style={styles.image} /> : <View style={styles.imagePlaceholder} />}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, isRent ? styles.badgeRent : isBoth ? styles.badgeBoth : styles.badgeSale]}>
              <Text style={styles.badgeText}>
                {isRent ? "À LOUER" : isBoth ? "VENTE & LOCATION" : "À VENDRE"}
              </Text>
            </View>

            {item.agency?.is_verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.verifiedText}>Vérifié</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color="#64748b" />
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.city}, {item.country}
            </Text>
          </View>

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Feather name="maximize-2" size={12} color="#64748b" />
              <Text style={styles.specText}>{item.surface} m²</Text>
            </View>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="door-open" size={13} color="#64748b" />
              <Text style={styles.specText}>{item.rooms} p.</Text>
            </View>
            {item.bedrooms ? (
              <View style={styles.specItem}>
                <Ionicons name="bed-outline" size={13} color="#64748b" />
                <Text style={styles.specText}>{item.bedrooms} ch.</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.priceRow}>
            {headline ? (
              <Text style={styles.cardPrice}>
                {formatPrice(headline.amount)} <Text style={styles.currencyText}>{item.devise?.code}</Text>
                <Text style={styles.cardPriceSuffix}>{headline.suffix}</Text>
              </Text>
            ) : (
              <Text style={styles.cardPrice}>Sur demande</Text>
            )}

            <View style={styles.detailLinkBtn}>
              <Text style={styles.detailLinkText}>Voir</Text>
              <Ionicons name="chevron-forward" size={12} color="#059669" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Section Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Catalogue ImmoPrestige</Text>
            <Text style={styles.pageSubtitle}>Biens d'exception & opportunités au Sénégal</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{properties.length}</Text>
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par ville, quartier..."
            placeholderTextColor="#9ca3af"
            value={city}
            onChangeText={(txt) => {
              setCity(txt);
              if (selectedCityPill !== "Toutes villes") setSelectedCityPill("Toutes villes");
            }}
          />
          {city || selectedCityPill !== "Toutes villes" || transactionType !== "all" ? (
            <TouchableOpacity onPress={handleResetFilters} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Transaction Type Filters */}
        <View style={styles.typeFilterRow}>
          <TouchableOpacity
            style={[styles.typeBtn, transactionType === "all" && styles.typeBtnActive]}
            onPress={() => setTransactionType("all")}
          >
            <Text style={[styles.typeBtnText, transactionType === "all" && styles.typeBtnTextActive]}>Tous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, transactionType === "sale" && styles.typeBtnActive]}
            onPress={() => setTransactionType("sale")}
          >
            <Text style={[styles.typeBtnText, transactionType === "sale" && styles.typeBtnTextActive]}>🏷️ À Vendre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, transactionType === "rent" && styles.typeBtnActive]}
            onPress={() => setTransactionType("rent")}
          >
            <Text style={[styles.typeBtnText, transactionType === "rent" && styles.typeBtnTextActive]}>🔑 À Louer</Text>
          </TouchableOpacity>
        </View>

        {/* City Pills ScrollView */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
          {CITY_PILLS.map((c) => {
            const active = selectedCityPill === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.cityPill, active && styles.cityPillActive]}
                onPress={() => {
                  setSelectedCityPill(c);
                  setCity("");
                }}
              >
                <Text style={[styles.cityPillText, active && styles.cityPillTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} color="#059669" /> : null}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="home-outline" size={42} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Aucun bien ne correspond à ces critères</Text>
              <Text style={styles.emptySubtitle}>Essayez de réinitialiser la recherche ou les filtres de ville.</Text>
              <TouchableOpacity style={styles.resetSearchBtn} onPress={handleResetFilters}>
                <Text style={styles.resetSearchBtnText}>Voir tous les biens</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  topHeader: {
    backgroundColor: "#ffffff",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 10,
  },
  pageTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  pageSubtitle: { fontSize: 11, color: "#64748b", marginTop: 1 },
  countBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { fontSize: 12, fontWeight: "800", color: "#047857" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#0f172a" },
  clearBtn: { padding: 2 },
  typeFilterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  typeBtnActive: { backgroundColor: "#059669", borderColor: "#059669" },
  typeBtnText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  typeBtnTextActive: { color: "#ffffff" },
  cityScroll: { paddingHorizontal: 16, gap: 6, marginTop: 10 },
  cityPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  cityPillActive: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  cityPillText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  cityPillTextActive: { color: "#ffffff" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imageContainer: { position: "relative", width: "100%", height: 175 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { width: "100%", height: "100%", backgroundColor: "#e2e8f0" },
  badgeRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeSale: { backgroundColor: "#2563eb" },
  badgeRent: { backgroundColor: "#059669" },
  badgeBoth: { backgroundColor: "#d97706" },
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: { fontSize: 10, fontWeight: "700", color: "#047857" },

  cardBody: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  cardSubtitle: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  specsRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  specItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  specText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 6 },
  cardPrice: { flex: 1, fontSize: 16, fontWeight: "900", color: "#059669" },
  currencyText: { fontSize: 12, fontWeight: "700", color: "#059669" },
  cardPriceSuffix: { fontSize: 11, fontWeight: "600", color: "#64748b" },
  detailLinkBtn: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#ecfdf5", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailLinkText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: "#334155", marginTop: 12, textAlign: "center" },
  emptySubtitle: { fontSize: 12, color: "#64748b", marginTop: 4, textAlign: "center" },
  resetSearchBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: "#059669" },
  resetSearchBtnText: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
});
