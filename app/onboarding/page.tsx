import Link from "next/link";
import { Button } from "@/components/ui/button";

const philosophies = [
  {
    title: "Playful minimalism",
    description:
      "A lighthearted tone that treats each decision as a small experiment. Great for creative days."
  },
  {
    title: "Stoic clarity",
    description:
      "Matter-of-fact prompts with calm language. Keeps focus on what matters without extra noise."
  },
  {
    title: "Narrative adventure",
    description: "Story-forward framing that makes branching choices feel like a gentle adventure."
  }
];

export default function OnboardingPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Onboarding</p>
        <h2 className="text-3xl font-semibold">Choose today&apos;s framing</h2>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Decision Graph will invite you to make one meaningful choice per day. Pick a philosophy and
          tone that sets the vibe. You can adjust this later as the visual board evolves.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {philosophies.map((item) => (
          <div
            key={item.title}
            className="flex h-full flex-col justify-between rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
            <Button variant="outline" className="mt-6">Choose</Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-muted/60 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Ready to view the board?</p>
          <p className="text-muted-foreground">
            Jump into the placeholder board layout. The graph will live there once we add the game
            layer.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/board">Open the board</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Back to start</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
