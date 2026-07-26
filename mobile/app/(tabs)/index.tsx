import { useCallback, useRef, useState } from "react";
import { FlatList, ActivityIndicator, View } from "react-native";
import PostCard from "@/components/PostCard";
import CommentsBottomSheet, { CommentsBottomSheetHandle } from "@/components/CommentsBottomSheet";
import { usePostsFeed } from "@/hooks/social/usePostsFeed";

export default function HomeScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePostsFeed();
  const sheetRef = useRef<CommentsBottomSheetHandle>(null);
  const [activePostId, setActivePostId] = useState<number | null>(null);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  const openComments = useCallback((postId: number) => {
    setActivePostId(postId);
    sheetRef.current?.snapToIndex(0);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} onOpenComments={openComments} />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
      />

      <CommentsBottomSheet ref={sheetRef} postId={activePostId} onClose={() => setActivePostId(null)} />
    </View>
  );
}
