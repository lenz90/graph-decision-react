import DecisionBoard from "@/components/board/DecisionBoard";

export default function BoardPage() {
  return (
    <section className="relative -mx-4 rounded-2xl border bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted)),transparent_0)] bg-[length:44px_44px] px-4 pb-6 pt-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-background/40 via-background/70 to-background/90" />
      <div className="relative h-[calc(100vh-180px)] min-h-[560px] w-full overflow-hidden rounded-xl border bg-background/90 p-2 shadow-lg">
        <DecisionBoard />
      </div>
    </section>
  );
}
