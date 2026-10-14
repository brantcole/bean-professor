import { createContext, useContext, useState, type ReactNode } from "react";
import {
  addTimerMarker,
  createMemoryJournalRepository,
  emptyTimer,
  starterEquipment,
  toggleTimer,
  type Equipment,
  type JournalSession,
  type LabKind,
  type TimerState,
} from "@bean-professor/domain";
import { sampleSessions } from "../data/fixtures";

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
export const clock = () => performance.now();

function useDemoStore() {
  const [repository] = useState(() =>
    createMemoryJournalRepository(sampleSessions),
  );
  const [sessions, setSessions] = useState<JournalSession[]>(sampleSessions);
  const [equipment, setEquipment] = useState<Equipment[]>(
    starterEquipment.map((e) => ({ ...e })),
  );
  const [timers, setTimers] = useState<Record<LabKind, TimerState>>({
    brew: emptyTimer(),
    roast: emptyTimer(),
  });
  async function refresh() {
    setSessions(await repository.list());
  }
  async function saveSession(session: JournalSession) {
    await repository.save(session);
    await refresh();
  }
  async function updateNotes(id: string, notes: string) {
    await repository.updateNotes(id, notes, new Date().toISOString());
    await refresh();
  }
  async function favoriteSession(id: string) {
    await repository.toggleFavorite(id, new Date().toISOString());
    await refresh();
  }
  function addEquipment(name: string, kind: LabKind) {
    setEquipment((rows) => [
      ...rows,
      { id: newId(), name: name.trim(), kind, favorite: false, custom: true },
    ]);
  }
  function favoriteEquipment(id: string) {
    setEquipment((rows) =>
      rows.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e)),
    );
  }
  function toggle(kind: LabKind) {
    const now = clock();
    setTimers((s) => ({ ...s, [kind]: toggleTimer(s[kind], now) }));
  }
  function mark(kind: LabKind, label: string) {
    const now = clock();
    const id = newId();
    setTimers((s) => ({
      ...s,
      [kind]: addTimerMarker(s[kind], now, id, label),
    }));
  }
  function resetTimer(kind: LabKind) {
    setTimers((s) => ({ ...s, [kind]: emptyTimer() }));
  }
  return {
    sessions,
    equipment,
    timers,
    saveSession,
    updateNotes,
    favoriteSession,
    addEquipment,
    favoriteEquipment,
    toggle,
    mark,
    resetTimer,
  };
}

const DemoContext = createContext<ReturnType<typeof useDemoStore> | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const store = useDemoStore();
  return <DemoContext.Provider value={store}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const store = useContext(DemoContext);
  if (!store) throw new Error("DemoProvider is required");
  return store;
}
