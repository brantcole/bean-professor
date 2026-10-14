import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DemoProvider } from "../src/state/DemoProvider";
import { colors } from "../src/components/ui";

export default function RootLayout() {
  return (
    <DemoProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
          animation: "none",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="session/[id]" />
      </Stack>
    </DemoProvider>
  );
}
