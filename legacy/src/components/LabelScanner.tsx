import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ImageUp, Loader2, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import { LabButton } from "@/components/LabField";
import { scanCoffeeLabel } from "@/lib/coffee.functions";

export type LabelReading = {
  coffeeName: string;
  origin: string;
  region: string;
  producer: string;
  variety: string;
  process: string;
  roastLevel: string;
  elevation: string;
  flavorNotes: string;
  roastDate: string;
  isGreen: boolean;
  summary: string;
  confidence: "high" | "medium" | "low";
};

const MAX_EDGE = 1400;

/** Downscale + re-encode in the browser so phone photos upload fast. */
async function toCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function LabelScanner({
  mode,
  onRead,
}: {
  mode: "brew" | "roast";
  onRead: (reading: LabelReading) => void;
}) {
  const scan = useServerFn(scanCoffeeLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState<LabelReading | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image");
      return;
    }
    setLoading(true);
    setReading(null);
    try {
      const dataUrl = await toCompressedDataUrl(file);
      setPreview(dataUrl);
      const result = (await scan({ data: { imageDataUrl: dataUrl } })) as LabelReading;
      setReading(result);
      onRead(result);
      toast.success(
        result.confidence === "low"
          ? "Read it, but the image was hard to see — check the fields"
          : "Label read — the bench is pre-filled",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The Professor could not read that image");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  function clear() {
    setPreview(null);
    setReading(null);
  }

  const rows = reading
    ? ([
        ["Coffee", reading.coffeeName],
        ["Origin", reading.origin],
        ["Producer", reading.producer],
        ["Variety", reading.variety],
        ["Process", reading.process],
        ["Roast level", reading.roastLevel],
        ["Elevation", reading.elevation],
        ["Notes on bag", reading.flavorNotes],
        ["Roast date", reading.roastDate],
      ].filter(([, value]) => value) as Array<[string, string]>)
    : [];

  return (
    <section className="lab-card mt-6 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="label-mono">Specimen intake</span>
          <h2 className="mt-1 font-display text-xl">Scan the bag</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Photograph the {mode === "roast" ? "green coffee" : "coffee"} bag — or upload a screenshot of
            the roaster's description — and the Professor reads the origin, process
            {mode === "roast" ? ", variety" : ", roast level"} and tasting notes into the bench below.
          </p>
        </div>
        {preview ? (
          <button
            onClick={clear}
            aria-label="Clear scanned label"
            className="rounded-md border border-border p-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <LabButton
          variant="ghost"
          disabled={loading}
          onClick={() => cameraRef.current?.click()}
          className="w-full sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {loading ? "Reading the label…" : "Take a photo"}
        </LabButton>
        <LabButton
          variant="ghost"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          <ImageUp className="h-4 w-4" />
          Upload a photo
        </LabButton>
        {preview ? (
          <img
            src={preview}
            alt="Scanned coffee label"
            className="h-20 w-20 rounded-md border border-border object-cover"
          />
        ) : null}
      </div>


      {rows.length ? (
        <dl className="mt-4 grid gap-x-4 gap-y-2 border-t border-border pt-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="label-mono text-muted-foreground/70">{label}</dt>
              <dd className="text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {reading?.summary ? (
        <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
          <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {reading.summary}
        </p>
      ) : null}
    </section>
  );
}
