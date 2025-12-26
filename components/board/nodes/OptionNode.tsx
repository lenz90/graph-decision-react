"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type OptionNodeData = {
  label: string;
  philosophyLine?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  isCustom?: boolean;
  isLocked?: boolean;
  customText?: string;
  onSelect?: () => void;
  // eslint-disable-next-line no-unused-vars
  onCustomChange?: (value: string) => void;
  lockLabel?: string;
  isMuted?: boolean;
};

export default function OptionNode(props: NodeProps) {
  const data = props.data as OptionNodeData;
  const appearanceDelay = useMemo(() => {
    const match = props.id?.match(/option-(\d+)/);
    const index = match ? Number.parseInt(match[1], 10) - 1 : 0;
    return `${Math.max(0, Math.min(index, 3)) * 140}ms`;
  }, [props.id]);

  const selectable = Boolean(data.onSelect) && !data.isDisabled && (!data.isCustom || Boolean(data.customText));

  return (
    <div className="relative w-[260px] max-w-[92vw] option-card-shell">
      <Handle type="target" position={Position.Left} className="node-handle node-handle-target" />
      <Handle type="source" position={Position.Right} className="node-handle node-handle-source" />
      <Card
        className={cn(
          "group h-full border-primary/15 bg-gradient-to-br from-secondary/10 via-background to-primary/10 shadow-xl transition-all",
          "option-card option-card-appear",
          data.isSelected && "border-primary/50 ring-2 ring-primary/50 shadow-primary/30",
          data.isMuted && !data.isSelected && "opacity-40 grayscale",
          selectable && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-primary/20",
          data.isDisabled && !data.isSelected && "opacity-75 grayscale",
        )}
        onClick={selectable ? data.onSelect : undefined}
        style={{ ["--option-delay" as string]: appearanceDelay }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold leading-tight text-primary-foreground/80">
                {data.label}
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
                {data.isCustom ? "Custom decision" : "Option unlocked"}
              </CardDescription>
            </div>
            {data.isSelected && (
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.isCustom ? (
            <label className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Write your decision
              </span>
              <input
                type="text"
                maxLength={120}
                value={data.customText ?? ""}
                onChange={(event) => data.onCustomChange?.(event.target.value)}
                className="w-full rounded-md border border-primary/30 bg-background/95 px-3 py-2 text-sm text-foreground shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed"
                placeholder="Describe your own option"
                disabled={data.isDisabled}
              />
              <span className="self-end text-xs text-muted-foreground/70">
                {(data.customText ?? "").length}/120
              </span>
            </label>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">{data.philosophyLine}</p>
          )}

          {data.lockLabel ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{data.lockLabel}</span>
              {data.isLocked && <Badge variant="outline">Locked</Badge>}
            </div>
          ) : null}

          {selectable && (
            <Button
              className="w-full"
              size="sm"
              disabled={data.isDisabled || (data.isCustom && !data.customText)}
              onClick={(event) => {
                event.stopPropagation();
                data.onSelect?.();
              }}
              variant={data.isSelected ? "default" : "secondary"}
            >
              {data.isSelected ? "Selected" : data.isCustom ? "Select custom decision" : "Select option"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
