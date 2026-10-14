import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { formatDuration, type JournalSession } from "@bean-professor/domain";
import { useDemo } from "../../src/state/DemoProvider";
import {
  Button,
  Card,
  Field,
  Message,
  Screen,
  ui,
} from "../../src/components/ui";

function SessionEditor({ session }: { session: JournalSession }) {
  const { updateNotes } = useDemo();
  const [notes, setNotes] = useState(session.notes);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await updateNotes(session.id, notes);
      setError(false);
      setMessage("Notes saved for this preview session.");
    } catch {
      setError(true);
      setMessage("Could not save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <Card>
        <Text style={ui.eyebrow}>CAPTURED INPUTS</Text>
        {Object.entries(session.inputs).map(([key, value]) => (
          <View key={key}>
            <Text style={ui.muted}>{key.replace(/([A-Z])/g, " $1")}</Text>
            <Text style={ui.body}>{value || "Not recorded"}</Text>
          </View>
        ))}
      </Card>
      <Card>
        <Text style={ui.heading}>Saved plan</Text>
        {session.guide.parameters.map((p) => (
          <Text key={p.label} style={ui.body}>
            {p.label}: {p.value}
          </Text>
        ))}
        {session.guide.steps.map((step) => (
          <Text key={step} style={ui.body}>
            {step}
          </Text>
        ))}
        <Text style={ui.muted}>{session.guide.disclaimer}</Text>
      </Card>
      <Card>
        <Text style={ui.heading}>Timer markers</Text>
        <Text style={ui.muted}>
          Elapsed: {formatDuration(session.timer.elapsedMs)}
        </Text>
        {session.timer.markers.length ? (
          session.timer.markers.map((m) => (
            <View key={m.id} style={ui.between}>
              <Text style={ui.body}>{m.label}</Text>
              <Text style={ui.muted}>{formatDuration(m.elapsedMs)}</Text>
            </View>
          ))
        ) : (
          <Text style={ui.muted}>No markers recorded.</Text>
        )}
      </Card>
      <Card>
        <Field
          label="Edit session notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={8000}
        />
        <Button
          onPress={() => {
            void save();
          }}
          disabled={saving || notes === session.notes}
        >
          {saving ? "Saving…" : "Save notes"}
        </Button>
        {message && <Message error={error}>{message}</Message>}
      </Card>
    </>
  );
}
export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions } = useDemo();
  const session = sessions.find((row) => row.id === id);
  return (
    <Screen
      back
      title={session?.title ?? "Session not found"}
      eyebrow="THE EXPERIMENT RECORD"
      subtitle="Your plan, its original inputs, and what you noticed."
    >
      {session ? (
        <SessionEditor key={session.id} session={session} />
      ) : (
        <Card>
          <Text style={ui.body}>
            This sample may have reset when the app restarted. Go back to the
            journal to choose another session.
          </Text>
        </Card>
      )}
    </Screen>
  );
}
