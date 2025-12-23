"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeProps } from "@xyflow/react";

export type OptionNodeData = {
  label: string;
  philosophyLine: string;
};

export default function OptionNode(props: NodeProps) {
  const data = props.data as OptionNodeData;
  return (
    <div className="relative w-[260px] max-w-[90vw]">
      <Card className="h-full border-primary/15 bg-gradient-to-br from-secondary/10 via-background to-primary/10 shadow-xl">
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
