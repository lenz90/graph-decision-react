"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type RootNodeData = {
  situation: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isLocked: boolean;
  isFrozen?: boolean;
};

export default function RootNode(props: NodeProps) {
  const data = props.data as RootNodeData;
  return (
    <div className="relative w-[360px] max-w-[90vw]">
      <Card
        className={cn(
          "root-card border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/30 shadow-2xl shadow-primary/10 transition-all",
          data.isFrozen && "opacity-75 grayscale-[0.2] saturate-50",
        )}
      >
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Your Situation</CardTitle>
              <CardDescription className="text-muted-foreground">
                The adventure starts here.
              </CardDescription>
            </div>
            {data.isFrozen ? (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Locked
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Describe the initial situation</span>
            <textarea
              value={data.situation}
              onChange={(event) => data.onChange(event.target.value)}
              className="min-h-[160px] w-full resize-none rounded-lg border border-primary/30 bg-background/90 p-3 text-sm leading-relaxed text-foreground shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              maxLength={2000}
              placeholder="Write the starting point for your decision journey..."
              readOnly={data.isLocked || data.isFrozen}
            />
            <span className="self-end text-xs text-muted-foreground/80">
              {data.situation.length}/2000
            </span>
          </label>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!data.canGenerate}
            onClick={data.onGenerate}
            variant="secondary"
          >
            Generate 4 options
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
