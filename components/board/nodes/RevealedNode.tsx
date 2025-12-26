"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type RevealedNodeData = {
  finalText: string;
  onGenerateNext?: () => void;
  canGenerateNext?: boolean;
  lockExpiredLabel?: string;
};

export default function RevealedNode(props: NodeProps) {
  const data = props.data as RevealedNodeData;
  return (
    <div className="relative w-[320px] max-w-[92vw]">
      <Handle type="target" position={Position.Left} className="node-handle node-handle-target" />
      <Handle type="source" position={Position.Right} className="node-handle node-handle-source" />
      <Card
        className={cn(
          "border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/20 shadow-2xl shadow-primary/25",
          "transition-all duration-300",
        )}
      >
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl font-semibold text-primary">
              Revealed decision
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Locked in
            </Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            {data.lockExpiredLabel ?? "Your choice is unlocked. Continue when ready."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm font-medium text-foreground shadow-inner">
            {data.finalText}
          </div>
          {data.onGenerateNext && (
            <Button
              className="w-full"
              variant="secondary"
              disabled={!data.canGenerateNext}
              onClick={data.onGenerateNext}
            >
              Generate next 4 options
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
