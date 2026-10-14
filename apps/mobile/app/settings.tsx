import { useState } from "react";
import { Text, View } from "react-native";
import { validateEquipmentName, type LabKind } from "@bean-professor/domain";
import { useDemo } from "../src/state/DemoProvider";
import {
  Button,
  Card,
  Chip,
  colors,
  Field,
  Message,
  Screen,
  ui,
} from "../src/components/ui";

export default function Settings() {
  const { equipment, addEquipment, favoriteEquipment } = useDemo();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<LabKind>("brew");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  function add() {
    const problem = validateEquipmentName(name, equipment, kind);
    if (problem) {
      setError(true);
      setMessage(problem);
      return;
    }
    addEquipment(name, kind);
    setName("");
    setError(false);
    setMessage("Equipment added to this preview collection.");
  }
  return (
    <Screen
      back
      title="Settings & equipment"
      eyebrow="MAKE THE LAB YOURS"
      subtitle="Keep your favorite gear close. Leave room to experiment."
    >
      <Card>
        <Text style={ui.eyebrow}>PREVIEW MODE</Text>
        <Text style={ui.heading}>Your private practice bench</Text>
        <Text style={ui.body}>
          No account, database, or AI service is connected. Changes stay in this
          running preview and reset on a full reload.
        </Text>
        <Text style={ui.muted}>
          Accounts and durable offline journal access will arrive in a later
          phase. This preview uses your device’s text sizing and reduced-motion
          preferences; navigation has no animated transitions.
        </Text>
      </Card>
      <Card>
        <Text accessibilityRole="header" style={ui.heading}>
          Add your equipment
        </Text>
        <View style={ui.row}>
          <Chip
            label="Brewer"
            selected={kind === "brew"}
            onPress={() => setKind("brew")}
          />
          <Chip
            label="Roaster"
            selected={kind === "roast"}
            onPress={() => setKind("roast")}
          />
        </View>
        <Field
          label="Equipment name"
          value={name}
          onChangeText={setName}
          maxLength={80}
          placeholder="My V60, home roaster…"
        />
        <Button onPress={add}>Add equipment</Button>
        {message && <Message error={error}>{message}</Message>}
      </Card>
      {(["brew", "roast"] as const).map((group) => (
        <Card key={group}>
          <Text accessibilityRole="header" style={ui.heading}>
            {group === "brew" ? "Brewing collection" : "Roasting collection"}
          </Text>
          <Text style={ui.muted}>
            Favorites appear first in the lab’s equipment chooser.
          </Text>
          {equipment
            .filter((e) => e.kind === group)
            .map((e) => (
              <View
                key={e.id}
                style={{
                  gap: 8,
                  borderTopWidth: 1,
                  borderColor: colors.line,
                  paddingTop: 14,
                }}
              >
                <Text style={ui.body}>{e.name}</Text>
                <Text style={ui.muted}>
                  {e.custom ? "Your custom equipment" : "Starter equipment"}
                </Text>
                <Chip
                  label={`${e.favorite ? "Unfavorite" : "Favorite"} ${e.name}`}
                  selected={e.favorite}
                  onPress={() => favoriteEquipment(e.id)}
                />
              </View>
            ))}
        </Card>
      ))}
    </Screen>
  );
}
