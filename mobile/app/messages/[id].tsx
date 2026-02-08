import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useMessages } from "@/hooks/messaging/useMessages";
import { useSendMessage } from "@/hooks/messaging/useSendMessage";
import { useMarkConversationRead } from "@/hooks/messaging/useMarkConversationRead";
import { useAuthStore } from "@/store/auth.store";
import type { Message } from "@/types/messaging";

export default function ConversationThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);
  const { data: messagesPage, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead(conversationId);
  const userId = useAuthStore((s) => s.user?.id);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (Number.isFinite(conversationId)) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const messages = messagesPage?.data ?? [];

  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage.mutate(content, { onSuccess: () => setContent("") });
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.sender?.id === userId;
    return (
      <View style={[styles.bubbleRow, isMine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          inverted
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn} disabled={sendMessage.isPending}>
          <Feather name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  bubbleRow: { marginBottom: 8, flexDirection: "row" },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "75%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: "#1a1a2e" },
  bubbleTheirs: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  bubbleTextMine: { color: "#fff", fontSize: 14 },
  bubbleTextTheirs: { color: "#111827", fontSize: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
});
