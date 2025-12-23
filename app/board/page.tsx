import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BoardPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">Board</p>
        <h2 className="text-3xl font-semibold">Daily decision board</h2>
        <p className="max-w-3xl text-muted-foreground">
          This is a placeholder for the upcoming decision graph. Expect a visual canvas where today&apos;s
          choice branches into outcomes, with gentle animations and keyboard-friendly navigation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Today&apos;s decision</h3>
          <p className="mt-2 text-muted-foreground">
            A compact module will summarize the prompt, your chosen path, and any constraints. For now,
            this keeps the space warm.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Future graph</h3>
          <p className="mt-2 text-muted-foreground">
            Here we&apos;ll render nodes, edges, and branching options. The design will emphasize clarity,
            with minimal chrome and calm color cues.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/60 p-6">
        <div>
          <p className="text-sm font-semibold">Need to adjust tone?</p>
          <p className="text-muted-foreground">Head back to onboarding to swap the guiding style.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/onboarding">Back to onboarding</Link>
        </Button>
      </div>
    </section>
  );
}
