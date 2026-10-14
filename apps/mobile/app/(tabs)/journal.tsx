import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  formatDuration,
  searchSessions,
  type LabKind,
} from "@bean-professor/domain";
import { useDemo } from "../../src/state/DemoProvider";
import {
  Button,
  Card,
  Chip,
  colors,
  Field,
  Message,
  Screen,
  ui,
} from "../../src/components/ui";

export default function Journal() {
  const router = useRouter();
  const { sessions, favoriteSession } = useDemo();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | LabKind | "favorites">("all");
  const [error, setError] = useState("");
  const results = searchSessions(sessions, query, filter);
  return (
    <Screen
      title="Lab Journal"
      eyebrow="YOUR OBSERVATIONS, TOGETHER"
      subtitle="Small experiments. Useful notes. A story in every cup."
    >
      <Field
        label="Search sessions"
        placeholder="Coffee, equipment, origin, or notes…"
        value={query}
        onChangeText={setQuery}
      />
      <View style={ui.row}>
        {(
          [
            ["all", "All"],
            ["brew", "Brews"],
            ["roast", "Roasts"],
            ["favorites", "Favorites"],
          ] as const
        ).map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>
      <Text style={ui.muted}>
        {results.length} {results.length === 1 ? "session" : "sessions"} ·
        Preview data stays in memory
      </Text>
      {error && <Message error>{error}</Message>}
      {!results.length && (
        <Card>
          <Text style={ui.heading}>No matching experiments yet</Text>
          <Text style={ui.muted}>
            Try a different search, or start a sample brew.
          </Text>
          <Button
            secondary
            onPress={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear search and filters
          </Button>
          <Button onPress={() => router.push("/brew")}>Start a brew</Button>
        </Card>
      )}
      {results.map((session) => (
        <Card key={session.id}>
          <Text style={ui.eyebrow}>
            {session.kind === "brew" ? "BREW SESSION" : "ROAST SESSION"} ·{" "}
            {new Date(session.createdAt).toLocaleDateString()}
          </Text>
          <Text accessibilityRole="header" style={ui.heading}>
            {session.title}
          </Text>
          <Text style={ui.muted}>
            {session.equipmentName} · {formatDuration(session.timer.elapsedMs)}{" "}
            · {session.timer.markers.length} saved markers
          </Text>
          <Text numberOfLines={3} style={ui.body}>
            {session.notes || "No notes yet. Make this record your own."}
          </Text>
          <View style={ui.divider} />
          <View style={ui.row}>
            <View style={{ flex: 1, minWidth: 130 }}>
              <Button onPress={() => router.push(`/session/${session.id}`)}>
                Open session
              </Button>
            </View>
            <Chip
              label={session.favorite ? "Remove favorite" : "Add favorite"}
              selected={session.favorite}
              onPress={() => {
                favoriteSession(session.id).catch(() =>
                  setError("Could not update favorite."),
                );
              }}
            />
          </View>
          <Text style={[ui.muted, { color: colors.copper }]}>
            Demo content · Not verified guidance
          </Text>
        </Card>
      ))}
    </Screen>
  );
}
