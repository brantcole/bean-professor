import { useState } from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { mockLesson } from "@bean-professor/domain";
import {
  Button,
  Card,
  Chip,
  colors,
  Field,
  Screen,
  ui,
} from "../../src/components/ui";

export default function CoffeeSchool() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const lesson = asked ? mockLesson(asked) : null;
  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAsked(trimmed);
    setQuestion("");
    setHistory((rows) =>
      [trimmed, ...rows.filter((q) => q !== trimmed)].slice(0, 5),
    );
  }
  return (
    <Screen
      title="Coffee School"
      eyebrow="CURIOSITY, FRESHLY BREWED"
      subtitle="Bring your questions. Leave with an experiment."
    >
      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: 24,
          padding: 24,
          gap: 18,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: "absolute",
            right: -12,
            top: 0,
            width: 170,
            height: 220,
            opacity: 0.14,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <View
              key={line}
              style={{
                position: "absolute",
                left: line * 30,
                height: 220,
                borderLeftWidth: 1,
                borderColor: colors.paper,
              }}
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((line) => (
            <View
              key={line}
              style={{
                position: "absolute",
                top: line * 30,
                width: 170,
                borderTopWidth: 1,
                borderColor: colors.paper,
              }}
            />
          ))}
        </View>
        <Ionicons name="beaker-outline" color="#E5BE92" size={34} />
        <Text style={[ui.eyebrow, { color: "#E5BE92" }]}>
          YOUR DAILY OFFICE HOURS
        </Text>
        <Text
          style={[
            ui.heading,
            { color: colors.paper, fontSize: 30, lineHeight: 38 },
          ]}
        >
          Good coffee starts{"\n"}with a good question.
        </Text>
        <Text style={[ui.body, { color: "#E6D6C3" }]}>
          Explore the beans, the brew, and the small details worth noticing.
        </Text>
      </View>
      <Card>
        <Text accessibilityRole="header" style={ui.heading}>
          Ask the Professor
        </Text>
        <Text style={ui.muted}>
          Try the conversation with sample lessons. Live research and AI will
          come in a later phase.
        </Text>
        <Field
          label="Your coffee question"
          placeholder="Teach me something new about coffee"
          value={question}
          onChangeText={setQuestion}
          multiline
          maxLength={1000}
        />
        <Button onPress={() => ask(question)} disabled={!question.trim()}>
          Explore this question
        </Button>
        <View style={ui.row}>
          {[
            "Where should I start?",
            "How do I compare water?",
            "Washed vs natural?",
          ].map((prompt) => (
            <Chip key={prompt} label={prompt} onPress={() => ask(prompt)} />
          ))}
        </View>
      </Card>
      {lesson && (
        <Card>
          <Text style={ui.eyebrow}>SAMPLE LESSON · NOT A RESEARCH ANSWER</Text>
          <Text style={ui.muted}>{asked}</Text>
          <Text accessibilityRole="header" style={ui.heading}>
            {lesson.title}
          </Text>
          <Text style={ui.body}>{lesson.answer}</Text>
          <View
            style={[ui.card, { backgroundColor: colors.paleSage, padding: 16 }]}
          >
            <Text style={[ui.eyebrow, { color: colors.sage }]}>TRY THIS</Text>
            <Text style={ui.body}>{lesson.experiment}</Text>
          </View>
          <Text style={ui.muted}>
            Evidence status: demo. No verified citations are attached to this
            sample.
          </Text>
          <Button secondary onPress={() => router.push("/brew")}>
            Take it to Brew Lab
          </Button>
        </Card>
      )}
      {history.length > 1 && (
        <Card>
          <Text style={ui.heading}>Recent questions</Text>
          {history.slice(1).map((q) => (
            <Chip key={q} label={q} onPress={() => ask(q)} />
          ))}
        </Card>
      )}
      <View style={ui.row}>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Button secondary onPress={() => router.push("/journal")}>
            Open your journal
          </Button>
        </View>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Button secondary onPress={() => router.push("/settings")}>
            Your equipment
          </Button>
        </View>
      </View>
    </Screen>
  );
}
