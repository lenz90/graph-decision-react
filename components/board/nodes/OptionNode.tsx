"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type OptionNodeData = {
  label: string;
  philosophyLine: string;
};

export default function OptionNode(props: NodeProps) {
  const data = props.data as OptionNodeData;
  const appearanceDelay = useMemo(() => {
    const match = props.id?.match(/option-(\\d+)/);
    const index = match ? Number.parseInt(match[1], 10) - 1 : 0;
    return `${Math.max(0, Math.min(index, 3)) * 140}ms`;
  }, [props.id]);

  return (
    <div className="relative w-[260px] max-w-[90vw] option-card-shell">
      <Card
        className={cn(
          "h-full border-primary/15 bg-gradient-to-br from-secondary/10 via-background to-primary/10 shadow-xl",
          "option-card option-card-appear",
        )}
        style={{ ["--option-delay" as string]: appearanceDelay }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold leading-tight text-primary-foreground/80">
            {data.label}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Option unlocked</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.philosophyLine}</p>
        </CardContent>
      </Card>
    </div>
  );
}
