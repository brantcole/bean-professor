import backdropAsset from "@/assets/cafe-backdrop.jpg.asset.json";

/** Blurred coffee-shop photograph sitting behind the lab benches. */
export function CafeBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={backdropAsset.url}
        alt=""
        loading="lazy"
        width={1536}
        height={1024}
        className="h-full w-full scale-110 object-cover opacity-100 blur-md brightness-110"
      />
      <div className="absolute inset-0 bg-background/35" />
    </div>
  );
}
