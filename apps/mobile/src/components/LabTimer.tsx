import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  elapsedTime,
  formatDuration,
  type LabKind,
} from "@bean-professor/domain";
import { clock, useDemo } from "../state/DemoProvider";
import { Button, Card, Chip, colors, Field, ui } from "./ui";

export function LabTimer({ kind }: { kind: LabKind }) {
  const { timers, toggle, mark, resetTimer } = useDemo();
  const timer = timers[kind];
  const [now, setNow] = useState(clock);
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => setNow(clock());
    tick();
    if (timer.startedAtMs === null) return;
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timer.startedAtMs]);
  const elapsed = elapsedTime(timer, now);
  return (
    <Card>
      <Text style={ui.eyebrow}>OBSERVATION CLOCK</Text>
      <Text accessibilityRole="header" style={ui.heading}>
        Keep a moment, not just a time.
      </Text>
      <Text
        accessibilityLabel={`Elapsed time ${formatDuration(elapsed)}`}
        style={{
          fontSize: 48,
          fontVariant: ["tabular-nums"],
          color: colors.ink,
        }}
      >
        {formatDuration(elapsed)}
      </Text>
      <View style={ui.row}>
        <Button onPress={() => toggle(kind)}>
          {timer.startedAtMs === null ? "Start timer" : "Pause timer"}
        </Button>
        <Button secondary onPress={() => resetTimer(kind)}>
          Reset timer
        </Button>
      </View>
      <Field
        label="Marker name"
        value={label}
        onChangeText={setLabel}
        maxLength={80}
        placeholder={
          kind === "brew"
            ? "Bloom, first pour, finish…"
            : "First crack, cooling…"
        }
      />
      <View style={ui.row}>
        <Chip
          label="Add marker"
          onPress={() => {
            mark(kind, label || (kind === "brew" ? "Pour" : "Observation"));
            setLabel("");
          }}
        />
        {kind === "roast" && (
          <Chip
            label="Mark first crack"
            onPress={() => mark(kind, "First crack")}
          />
        )}
      </View>
      {timer.markers.map((marker) => (
        <View key={marker.id} style={ui.between}>
          <Text style={ui.body}>{marker.label}</Text>
          <Text style={ui.muted}>{formatDuration(marker.elapsedMs)}</Text>
        </View>
      ))}
      <Text style={ui.muted}>
        Markers are included when you save a session. Demo timers survive tab
        changes, but reset when the app closes.
      </Text>
    </Card>
  );
}
