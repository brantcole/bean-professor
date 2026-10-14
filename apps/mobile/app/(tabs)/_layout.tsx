import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/components/ui";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.copper,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 70 + bottom,
          paddingBottom: bottom,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarLabel: ({ children, color }) => (
          <Text
            style={{
              color,
              fontSize: 11,
              lineHeight: 14,
              fontWeight: "600",
              maxWidth: 64,
              minHeight: 28,
              textAlign: "center",
            }}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Coffee School",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="brew"
        options={{
          title: "Brew Lab",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Lab Journal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roast"
        options={{
          title: "Roast Lab",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
