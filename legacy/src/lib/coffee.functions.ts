import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const brewSchema = z.object({
  device: z.string().min(1).max(80),
  origin: z.string().min(1).max(120),
  process: z.string().max(60),
  roastLevel: z.string().max(60),
  grinder: z.string().max(80),
  waterProfile: z.string().max(120),
  doseGrams: z.string().max(20),
  goal: z.string().max(400),
  labelNotes: z.string().max(1200).default(""),
});

const roastSchema = z.object({
  roaster: z.string().min(1).max(80),
  origin: z.string().min(1).max(120),
  variety: z.string().max(80),
  process: z.string().max(60),
  density: z.string().max(80),
  batchSize: z.string().max(40),
  targetProfile: z.string().max(120),
  goal: z.string().max(400),
  labelNotes: z.string().max(1200).default(""),
});

// ~8 MB of base64 keeps a phone photo comfortably inside the request budget.
const labelSchema = z.object({
  imageDataUrl: z
    .string()
    .max(8_000_000)
    .regex(/^data:image\/(jpeg|jpg|png|webp|heic|heif);base64,/, "Please upload a JPEG, PNG or WebP image"),
});


const chatSchema = z
  .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(12000) }))
  .max(200);

const saveSchema = z.object({
  kind: z.enum(["brew", "roast"]),
  title: z.string().min(1).max(160),
  inputs: z.record(z.string(), z.string()),
  recommendation: z.string().max(20000),
  notes: z.string().max(8000).optional(),
  scaCompliance: z.string().max(4000).optional(),
  references: z
    .array(
      z.object({
        name: z.string().max(300),
        author: z.string().max(200),
        type: z.string().max(40),
        year: z.string().max(20).nullable(),
        url: z.string().max(600).nullable(),
        contribution: z.string().max(2000),
      }),
    )
    .max(40)
    .default([]),
  chat: chatSchema.default([]),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(8000).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  title: z.string().min(1).max(160).optional(),
  chat: chatSchema.optional(),
});

export const generateBrewGuide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => brewSchema.parse(input))
  .handler(async ({ data }) => {
    const { buildBrewGuide } = await import("./coffee.server");
    return await buildBrewGuide(data);
  });

export const generateRoastGuide = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => roastSchema.parse(input))
  .handler(async ({ data }) => {
    const { buildRoastGuide } = await import("./coffee.server");
    return await buildRoastGuide(data);
  });

export const scanCoffeeLabel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => labelSchema.parse(input))
  .handler(async ({ data }) => {
    const { readCoffeeLabel } = await import("./vision.server");
    return await readCoffeeLabel(data.imageDataUrl);
  });


export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sessions")
      .select("id, kind, title, inputs, recommendation, notes, rating, created_at, sca_compliance, references_json, chat_json")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("sessions")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        title: data.title,
        inputs: data.inputs,
        recommendation: data.recommendation,
        notes: data.notes ?? null,
        sca_compliance: data.scaCompliance ?? null,
        references_json: data.references ?? [],
        chat_json: data.chat ?? [],
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: { notes?: string; rating?: number | null; title?: string; chat_json?: { role: string; content: string }[] } = {};
    if (data.chat !== undefined) patch.chat_json = data.chat;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.rating !== undefined) patch.rating = data.rating;
    if (data.title !== undefined) patch.title = data.title;
    const { error } = await context.supabase.from("sessions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sessions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
