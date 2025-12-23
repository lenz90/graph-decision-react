"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RootNode() {
  return (
    <div className="relative w-[360px] max-w-[90vw]">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/30 shadow-2xl shadow-primary/10">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-xl font-semibold">Your Situation</CardTitle>
          <CardDescription className="text-muted-foreground">
            The adventure starts here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-primary/20 bg-background/90 p-4 text-sm leading-relaxed text-muted-foreground shadow-inner">
            <p>This is where your decision journey begins.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled title="Coming next" variant="secondary">
            Generate 4 options
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RootNode;
