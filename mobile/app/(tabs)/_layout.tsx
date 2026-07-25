import { Tabs, Redirect } from "expo-router";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth.store";

const ACTIVE_COLOR = "#1a1a2e";
const INACTIVE_COLOR = "#9ca3af";
const BAR_BG = "#ffffff";

function HomeIcon({ color }: { color: string }) {
  return <Ionicons name="home" size={26} color={color} />;
}

function PropertiesIcon({ color }: { color: string }) {
  return <MaterialCommunityIcons name="office-building" size={26} color={color} />;
}

function SendIcon({ color }: { color: string }) {
  return <Feather name="send" size={24} color={color} />;
}

function SettingsIcon({ color }: { color: string }) {
  return <Ionicons name="settings-outline" size={26} color={color} />;
}

export default function TabLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: BAR_BG,
          borderTopWidth: 0.5,
          borderTopColor: "#e5e7eb",
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          tabBarIcon: ({ color }) => <PropertiesIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.sendWrap, focused && styles.sendWrapActive]}>
              <SendIcon color={focused ? "#fff" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sendWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  sendWrapActive: {
    backgroundColor: "#1a1a2e",
  },
});
