import type { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIsFocused, useRouter } from "expo-router";

export const colors = {
  paper: "#F7F1E7",
  card: "#FFFDF8",
  ink: "#33271F",
  muted: "#746152",
  line: "#DDD1C0",
  copper: "#925333",
  sage: "#42614E",
  paleSage: "#EAF0E6",
  paleCopper: "#F1E1D3",
  white: "#FFFFFF",
  danger: "#9B352D",
};
const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  content: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 36,
    gap: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { fontFamily: serif, fontSize: 34, lineHeight: 42, color: colors.ink },
  heading: {
    fontFamily: serif,
    fontSize: 24,
    lineHeight: 31,
    color: colors.ink,
  },
  body: { fontSize: 16, lineHeight: 25, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 22, color: colors.muted },
  eyebrow: {
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 2,
    fontWeight: "700",
    color: colors.copper,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 16,
  },
  button: {
    minHeight: 50,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    lineHeight: 22,
  },
  chip: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  selectedChip: { backgroundColor: colors.paleSage, borderColor: colors.sage },
  divider: { height: 1, backgroundColor: colors.line },
});

export function Screen({
  children,
  title,
  eyebrow,
  subtitle,
  back = false,
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  subtitle: string;
  back?: boolean;
}) {
  const router = useRouter();
  const focused = useIsFocused();
  return (
    <SafeAreaView
      accessibilityElementsHidden={!focused}
      importantForAccessibility={focused ? "auto" : "no-hide-descendants"}
      style={[ui.page, !focused && { display: "none" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={ui.content}
        >
          <View style={ui.between}>
            <View style={[ui.row, { flex: 1, flexWrap: "nowrap" }]}>
              <Image
                source={require("../../assets/logo.png")}
                accessibilityLabel="The Bean Professor logo"
                style={{ width: 48, height: 48, borderRadius: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[ui.body, { fontWeight: "700", fontSize: 14 }]}>
                  THE BEAN PROFESSOR
                </Text>
                <Text style={ui.muted}>A little curiosity. A better cup.</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                if (back) {
                  if (router.canGoBack()) router.back();
                  else router.replace("/");
                } else router.push("/settings");
              }}
              accessibilityRole="button"
              accessibilityLabel={back ? "Go back" : "Open settings"}
              style={({ pressed }) => ({
                minWidth: 48,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 24,
                backgroundColor: colors.card,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={back ? "arrow-back" : "options-outline"}
                size={22}
                color={colors.ink}
              />
            </Pressable>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={ui.eyebrow}>{eyebrow}</Text>
            <Text accessibilityRole="header" style={ui.title}>
              {title}
            </Text>
            <Text style={ui.muted}>{subtitle}</Text>
          </View>
          {children}
          <Text style={[ui.muted, { textAlign: "center", fontSize: 12 }]}>
            Phase 1 preview · Sample content · No connected services
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={ui.card}>{children}</View>;
}
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
}: {
  children: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        secondary && { backgroundColor: colors.paleCopper },
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[ui.buttonText, secondary && { color: colors.ink }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        ui.chip,
        selected && ui.selectedChip,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text
        style={[
          ui.muted,
          {
            color: selected ? colors.sage : colors.ink,
            fontWeight: selected ? "700" : "400",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={[ui.muted, { fontWeight: "700" }]}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          ui.input,
          props.multiline && { minHeight: 100, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Message({
  children,
  error = false,
}: {
  children: string;
  error?: boolean;
}) {
  return (
    <Text
      accessibilityLiveRegion="polite"
      style={[ui.muted, { color: error ? colors.danger : colors.sage }]}
    >
      {children}
    </Text>
  );
}
