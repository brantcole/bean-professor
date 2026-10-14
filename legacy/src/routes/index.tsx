import { createFileRoute, Link } from "@tanstack/react-router";
import { FlaskConical, Flame, NotebookPen, Microscope, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProfessorChat } from "@/components/ProfessorChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Bean Professor — Champion Coffee Brewing & Roasting Lab" },
      {
        name: "description",
        content:
          "Get brewing recipes drawn from world barista champions and roast profiles from top roasters, tailored to your gear, your beans, and their origin.",
      },
      { property: "og:title", content: "The Bean Professor — Champion Coffee Brewing & Roasting Lab" },
      {
        property: "og:description",
        content:
          "Get brewing recipes drawn from world barista champions and roast profiles from top roasters, tailored to your gear, your beans, and their origin.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <section className="pt-4 sm:pt-10">
        <span className="label-mono">Est. in a lab · Brewed at the bar</span>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-6xl">
          Coffee, studied
          <span className="block text-primary">until it tastes right.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The Bean Professor reads your equipment, your single-origin or blend, and its regional
          chemistry — then writes a recipe in the method of world barista champions, and a roast
          profile in the method of the world's best roasters.
        </p>
        <div className="rule-ticks mt-8 opacity-30" />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/brew" className="lab-card group block p-6 transition hover:border-primary/60">
          <FlaskConical className="h-6 w-6 text-primary" />
          <h2 className="mt-4 font-display text-2xl">Brew Lab</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick your device and your bean. Get dose, ratio, temperature, grind guidance, a timed
            pour schedule, and dial-in corrections adapted from championship recipes.
          </p>
          <span className="label-mono mt-5 block text-primary">Open the brew bench →</span>
        </Link>

        <Link to="/roast" className="lab-card group block p-6 transition hover:border-copper/60">
          <Flame className="h-6 w-6 text-copper" />
          <h2 className="mt-4 font-display text-2xl">Roast Lab</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a target profile. Get charge temperature, phase timings, development ratio, and
            heat and airflow moves built around your origin's density and terroir.
          </p>
          <span className="label-mono mt-5 block text-copper">Open the roast bench →</span>
        </Link>
      </section>

      <section className="lab-card mt-4 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <NotebookPen className="mt-1 h-5 w-5 text-accent" />
          <div>
            <h2 className="font-display text-xl">Your lab notebook</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Save every session, write tasting notes, rate the result, and compare experiments.
            </p>
          </div>
        </div>
        <Link
          to="/notebook"
          className="rounded-md bg-secondary px-4 py-3 text-center text-sm font-semibold text-secondary-foreground"
        >
          Open notebook
        </Link>
      </section>

      <section className="lab-card mt-4 p-6">
        <div className="flex items-start gap-4">
          <GraduationCap className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-xl">Coffee school</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Curious about origins, history, processing, or the science in the cup? Ask — every
              answer is grounded in the same SCA and expert library the labs use.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ProfessorChat
            context={{
              kind: "learn",
              title: "Coffee school",
              inputs: {},
              guide: "",
              scaCompliance: "",
              references: [],
            }}
          />
        </div>
      </section>

      <section className="mt-10 flex items-start gap-3 text-xs text-muted-foreground">
        <Microscope className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Every recommendation names the champion or roaster whose technique it adapts, so you know
          the provenance of each variable you change.
        </p>
      </section>
    </AppShell>
  );
}
