import { useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePropertiesSearch } from "@/hooks/properties/usePropertiesSearch";
import type { Property } from "@/types/property";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

export default function PropertiesScreen() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePropertiesSearch(
    city ? { city } : {}
  );

  const properties = data?.pages.flatMap((page) => page.data) ?? [];

  const renderItem = ({ item }: { item: Property }) => {
    const cover = item.images.find((img) => img.is_cover)?.url ?? item.images[0]?.url;
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/properties/${item.id}`)} activeOpacity={0.9}>
        {cover ? <Image source={{ uri: cover }} style={styles.image} /> : <View style={styles.imagePlaceholder} />}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardSubtitle}>
            {item.city}, {item.country}
          </Text>
          <Text style={styles.cardPrice}>
            {formatPrice(item.price)} {item.devise?.code}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une ville..."
          placeholderTextColor="#9ca3af"
          value={city}
          onChangeText={setCity}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={<Text style={styles.empty}>Aucun bien trouvé.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  image: { width: "100%", height: 160 },
  imagePlaceholder: { width: "100%", height: 160, backgroundColor: "#e5e7eb" },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardSubtitle: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: "800", color: "#4f46e5", marginTop: 6 },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 40 },
});
