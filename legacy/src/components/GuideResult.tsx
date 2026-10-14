import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookmarkPlus, Loader2 } from "lucide-react";
import { LabMarkdown } from "./LabMarkdown";
import { LabButton, LabTextarea } from "./LabField";
import { ReferencePanel } from "./ReferencePanel";
import { ProfessorChat, type ChatMessage } from "./ProfessorChat";
import { saveSession, updateSession } from "@/lib/coffee.functions";
import { useAuth } from "@/hooks/useAuth";
import type { GuidePayload } from "@/lib/knowledge/types";

export function GuideResult({
  kind,
  title,
  inputs,
  payload,
}: {
  kind: "brew" | "roast";
  title: string;
  inputs: Record<string, string>;
  payload: GuidePayload;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const save = useServerFn(saveSession);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const update = useServerFn(updateSession);

  function handleChat(messages: ChatMessage[]) {
    setChat(messages);
    if (sessionId) update({ data: { id: sessionId, chat: messages } }).catch(() => {});
  }

  async function handleSave() {
    setSaving(true);
    try {
      const row = await save({
        data: {
          kind,
          title,
          inputs,
          recommendation: payload.guide,
          notes,
          scaCompliance: payload.scaCompliance,
          references: payload.references,
          chat,
        },
      });
      setSessionId(row.id);
      setSaved(true);
      toast.success("Session filed in your notebook");
    } catch {
      toast.error("Could not save this session");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="lab-card mt-6 p-5 sm:p-7">
      <div className="rule-ticks mb-5 opacity-40" />
      <LabMarkdown text={payload.guide} />
      <ReferencePanel
        references={payload.references}
        scaCompliance={payload.scaCompliance}
        researched={payload.researched}
        validation={payload.validation}
      />
      <ProfessorChat
        context={{
          kind,
          title,
          inputs,
          guide: payload.guide,
          scaCompliance: payload.scaCompliance,
          references: payload.references,
        }}
        onMessagesChange={handleChat}
      />


      <div className="mt-8 border-t border-border pt-5">
        <span className="label-mono">Session notes</span>
        <LabTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={8000}
          placeholder="What did you taste? What would you change?"
          className="mt-2"
        />
        {user ? (
          <LabButton onClick={handleSave} disabled={saving || saved} className="mt-3 w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
            {saved ? "Saved to notebook" : "Save session"}
          </LabButton>
        ) : (
          <LabButton
            variant="ghost"
            onClick={() => navigate({ to: "/auth" })}
            className="mt-3 w-full sm:w-auto"
          >
            Sign in to save this session
          </LabButton>
        )}
      </div>
    </section>
  );
}
