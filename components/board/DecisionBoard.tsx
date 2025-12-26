"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
} from "@xyflow/react";
import type { Edge, Node, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import OptionNode, { type OptionNodeData } from "./nodes/OptionNode";
import RevealedNode, { type RevealedNodeData } from "./nodes/RevealedNode";
import RootNode, { type RootNodeData } from "./nodes/RootNode";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MockOption = Pick<OptionNodeData, "label" | "philosophyLine">;

const mockOptions: MockOption[] = [
  {
    label: "Bold Quest",
    philosophyLine: "Charge ahead with daring confidence",
  },
  {
    label: "Careful Path",
    philosophyLine: "Proceed step by step while guarding resources",
  },
  {
    label: "Allies First",
    philosophyLine: "Build support before taking your next move",
  },
  {
    label: "Quiet Study",
    philosophyLine: "Pause to learn and map the unknowns ahead",
  },
];

const STORAGE_KEY = "decision-board-state-v3";
const LOCK_DURATION_MS = 5 * 60 * 1000;
const CHANGE_WINDOW_MS = 2 * 60 * 1000;

type BoardPhase = "draft" | "generated" | "selected" | "locked" | "revealed";

type SelectionState = {
  choiceId: string;
  text: string;
  type: "option" | "custom";
};

type PersistedState = {
  rootText: string;
  phase: BoardPhase;
  options: MockOption[];
  customText: string;
  selection: SelectionState | null;
  lockStartedAt: number | null;
  revealDisplayed: boolean;
  nextOptionsGenerated: boolean;
};

function generateMockOptions(): MockOption[] {
  return mockOptions;
}

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  root: RootNode as ComponentType<NodeProps>,
  option: OptionNode as ComponentType<NodeProps>,
  revealed: RevealedNode as ComponentType<NodeProps>,
};

const ROOT_POSITION = { x: 0, y: 0 };
const OPTION_POSITIONS = [
  { x: 420, y: -180 },
  { x: 420, y: -60 },
  { x: 420, y: 60 },
  { x: 420, y: 180 },
];
const CUSTOM_POSITION = { x: 420, y: 300 };

type OptionNodeLayout = {
  id: string;
  label: string;
  position: { x: number; y: number };
  appearanceOrder: number;
};

const OPTION_NODE_LAYOUTS: OptionNodeLayout[] = [
  { id: "option-a", label: "Option A", position: OPTION_POSITIONS[0], appearanceOrder: 0 },
  { id: "option-b", label: "Option B", position: OPTION_POSITIONS[1], appearanceOrder: 1 },
  { id: "option-c", label: "Option C", position: OPTION_POSITIONS[2], appearanceOrder: 2 },
  { id: "option-d", label: "Option D", position: OPTION_POSITIONS[3], appearanceOrder: 3 },
];

const CUSTOM_NODE_LAYOUT: OptionNodeLayout = {
  id: "custom-decision",
  label: "Custom Decision",
  position: CUSTOM_POSITION,
  appearanceOrder: 4,
};

const BRANCH_EDGE_STYLE = { strokeWidth: 2.6, stroke: "rgba(59, 130, 246, 0.7)" };
const BRANCH_EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 22,
  height: 22,
  color: "rgba(59, 130, 246, 0.7)",
};

function normalizeSelection(selection: SelectionState | null): SelectionState | null {
  if (!selection) return null;

  const legacyMatch = selection.choiceId.match(/^option-(\d+)$/);
  if (legacyMatch) {
    const index = Number.parseInt(legacyMatch[1], 10) - 1;
    const layout = OPTION_NODE_LAYOUTS[index];
    if (layout) {
      return { ...selection, choiceId: layout.id };
    }
  }

  if (selection.choiceId === "custom") {
    return { ...selection, choiceId: CUSTOM_NODE_LAYOUT.id };
  }

  return selection;
}

function formatDuration(ms: number) {
  const clamped = Math.max(0, ms);
  const minutes = Math.floor(clamped / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function derivePhaseFromPersisted(
  parsed: Partial<PersistedState> & { optionsGenerated?: boolean; selection?: SelectionState | null },
): BoardPhase {
  const selection = parsed.selection ?? null;
  if (parsed.phase) return parsed.phase;
  if (parsed.revealDisplayed && selection) return "revealed";
  if (selection) {
    const elapsedSinceLock = parsed.lockStartedAt ? Date.now() - parsed.lockStartedAt : 0;
    if (elapsedSinceLock >= LOCK_DURATION_MS) return "revealed";
    if (elapsedSinceLock >= CHANGE_WINDOW_MS) return "locked";
    return "selected";
  }
  if (parsed.optionsGenerated) return "generated";
  return "draft";
}

function DecisionBoardCanvas() {
  const reactFlow = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const [phase, setPhase] = useState<BoardPhase>("draft");
  const [rootText, setRootText] = useState("");
  const [rootHighlight, setRootHighlight] = useState(false);
  const [options, setOptions] = useState<MockOption[]>([]);
  const [customText, setCustomText] = useState("");
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [lockStartedAt, setLockStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [revealDisplayed, setRevealDisplayed] = useState(false);
  const [nextOptionsGenerated, setNextOptionsGenerated] = useState(false);

  const hasSelection = Boolean(selection && lockStartedAt);
  const elapsedSinceLock = hasSelection && lockStartedAt ? now - lockStartedAt : 0;
  const changeRemaining = hasSelection ? Math.max(0, CHANGE_WINDOW_MS - elapsedSinceLock) : 0;
  const lockRemaining = hasSelection ? Math.max(0, LOCK_DURATION_MS - elapsedSinceLock) : 0;
  const changeWindowClosed = hasSelection && elapsedSinceLock >= CHANGE_WINDOW_MS;
  const lockExpired = hasSelection && elapsedSinceLock >= LOCK_DURATION_MS;

  useEffect(() => {
    const savedRaw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!savedRaw) return;

    try {
      const parsed = JSON.parse(savedRaw) as Partial<PersistedState> & { optionsGenerated?: boolean };
      const normalizedSelection = normalizeSelection(parsed.selection ?? null);
      setRootText(parsed.rootText ?? "");
      setOptions(parsed.options?.length ? parsed.options : mockOptions);
      setCustomText(parsed.customText ?? "");
      setSelection(normalizedSelection);
      setLockStartedAt(parsed.lockStartedAt ?? null);
      setRevealDisplayed(parsed.revealDisplayed ?? false);
      setNextOptionsGenerated(parsed.nextOptionsGenerated ?? false);
      setPhase(
        derivePhaseFromPersisted({
          ...parsed,
          selection: normalizedSelection,
        }),
      );
    } catch (error) {
      console.error("Failed to restore board state", error);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const state: PersistedState = {
      rootText,
      phase,
      options,
      customText,
      selection,
      lockStartedAt,
      revealDisplayed,
      nextOptionsGenerated,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [customText, lockStartedAt, nextOptionsGenerated, options, phase, revealDisplayed, rootText, selection]);

  useEffect(() => {
    if (!rootHighlight) return;
    const timeout = window.setTimeout(() => setRootHighlight(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [rootHighlight]);

  useEffect(() => {
    if (revealDisplayed && selection) {
      if (phase !== "revealed") {
        setPhase("revealed");
      }
      return;
    }

    if (selection) {
      const targetPhase = changeWindowClosed ? "locked" : "selected";
      if (phase !== targetPhase) {
        setPhase(targetPhase);
      }
      return;
    }

    if (phase !== "draft" && phase !== "generated") {
      setPhase("generated");
    }
  }, [changeWindowClosed, phase, revealDisplayed, selection]);

  useEffect(() => {
    if (lockExpired && selection) {
      setRevealDisplayed(true);
      setPhase("revealed");
    }
  }, [lockExpired, phase, selection]);

  const handleRootChange = useCallback((value: string) => {
    setRootText(value);
  }, []);

  const handleGenerateOptions = useCallback(() => {
    if (phase !== "draft" || rootText.trim().length === 0) {
      return;
    }

    const generated = generateMockOptions();
    setOptions(generated);
    setPhase("generated");
    setRootHighlight(true);
    setSelection(null);
    setLockStartedAt(null);
    setRevealDisplayed(false);
    setNextOptionsGenerated(false);
  }, [phase, rootText]);

  const handleSelect = useCallback(
    (choiceId: string, text: string, type: SelectionState["type"]) => {
      if (type === "custom" && text.trim().length === 0) return;
      if (changeWindowClosed) return;
      if (phase === "draft") return;

      const startedAt = lockStartedAt ?? Date.now();
      setLockStartedAt(startedAt);
      setSelection({ choiceId, text, type });
      setRevealDisplayed(false);
      setNextOptionsGenerated(false);
      setPhase("selected");

      if (nodesInitialized) {
        const node = reactFlow.getNode(choiceId);
        if (node) {
          reactFlow.setCenter(node.position.x + 120, node.position.y + 40, {
            zoom: 0.95,
            duration: 640,
          });
        }
      }
    },
    [changeWindowClosed, lockStartedAt, nodesInitialized, phase, reactFlow],
  );

  const handleGenerateNext = useCallback(() => {
    if (!revealDisplayed || !selection) return;
    setNextOptionsGenerated(true);
    setRevealDisplayed(true);
  }, [revealDisplayed, selection]);

  const rootNodeData: RootNodeData = useMemo(
    () => ({
      situation: rootText,
      onChange: handleRootChange,
      onGenerate: handleGenerateOptions,
      canGenerate: phase === "draft" && rootText.trim().length > 0,
      isLocked: phase !== "draft",
      isFrozen: Boolean(selection),
    }),
    [handleGenerateOptions, handleRootChange, phase, rootText, selection],
  );

  const nodes: Node<OptionNodeData | RootNodeData | RevealedNodeData>[] = useMemo(() => {
    const list: Node<OptionNodeData | RootNodeData | RevealedNodeData>[] = [
      {
        id: "root",
        type: "root",
        position: ROOT_POSITION,
        className: rootHighlight ? "root-node root-node-emphasis" : "root-node",
        sourcePosition: Position.Right,
        data: rootNodeData,
      },
    ];

    if (phase !== "draft") {
      OPTION_NODE_LAYOUTS.forEach((layout, index) => {
        const option = options[index];
        if (!option) return;
        list.push({
          id: layout.id,
          type: "option",
          position: layout.position,
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
          data: {
            label: `${layout.label}: ${option.label}`,
            philosophyLine: option.philosophyLine,
            isSelected: selection?.choiceId === layout.id,
            isDisabled: Boolean(selection && changeWindowClosed && selection.choiceId !== layout.id),
            onSelect: () => handleSelect(layout.id, option.label, "option"),
            lockLabel: changeWindowClosed ? "Change window closed" : undefined,
            isLocked: changeWindowClosed,
            isMuted: Boolean(selection && selection.choiceId !== layout.id),
            appearanceOrder: layout.appearanceOrder,
          },
        });
      });

      list.push({
        id: CUSTOM_NODE_LAYOUT.id,
        type: "option",
        position: CUSTOM_NODE_LAYOUT.position,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: CUSTOM_NODE_LAYOUT.label,
          isCustom: true,
          isSelected: selection?.choiceId === CUSTOM_NODE_LAYOUT.id,
          isDisabled: Boolean(selection && changeWindowClosed),
          onSelect: () => handleSelect(CUSTOM_NODE_LAYOUT.id, customText.trim(), "custom"),
          customText,
          onCustomChange: setCustomText,
          lockLabel: changeWindowClosed ? "Change window closed" : undefined,
          isLocked: changeWindowClosed,
          isMuted: Boolean(selection && selection.choiceId !== CUSTOM_NODE_LAYOUT.id),
          appearanceOrder: CUSTOM_NODE_LAYOUT.appearanceOrder,
        },
      });
    }

    if (revealDisplayed && selection) {
      list.push({
        id: "revealed",
        type: "revealed",
        position: { x: 900, y: 60 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          finalText: selection.text,
          onGenerateNext: handleGenerateNext,
          canGenerateNext: !nextOptionsGenerated,
          lockExpiredLabel: "Lock expired (mock 5 min). Continue to the next level.",
        },
      });
    }

    if (nextOptionsGenerated && revealDisplayed) {
      generateMockOptions().forEach((option, index) => {
        const nodeId = `next-option-${index + 1}`;
        list.push({
          id: nodeId,
          type: "option",
          position: { x: 1320, y: -140 + index * 120 },
          targetPosition: Position.Left,
          data: {
            label: `${option.label} (next)`,
            philosophyLine: option.philosophyLine,
            isDisabled: true,
            lockLabel: "Next day preview",
            appearanceOrder: index,
          },
        });
      });
    }

    return list;
  }, [
    changeWindowClosed,
    customText,
    handleSelect,
    handleGenerateNext,
    nextOptionsGenerated,
    options,
    phase,
    revealDisplayed,
    rootHighlight,
    rootNodeData,
    selection,
  ]);

  const edges: Edge[] = useMemo(() => {
    const generatedEdges: Edge[] = [];
    if (phase !== "draft") {
      OPTION_NODE_LAYOUTS.forEach((layout, index) => {
        if (!options[index]) return;
        generatedEdges.push({
          id: `edge-root-${layout.id}`,
          source: "root",
          target: layout.id,
          type: "smoothstep",
          markerEnd: { ...BRANCH_EDGE_MARKER },
          style: BRANCH_EDGE_STYLE,
        });
      });
      generatedEdges.push({
        id: `edge-root-${CUSTOM_NODE_LAYOUT.id}`,
        source: "root",
        target: CUSTOM_NODE_LAYOUT.id,
        type: "smoothstep",
        markerEnd: { ...BRANCH_EDGE_MARKER },
        style: BRANCH_EDGE_STYLE,
      });
    }

    if (revealDisplayed && selection) {
      generatedEdges.push({
        id: "edge-selection-reveal",
        source: selection.choiceId,
        target: "revealed",
        animated: true,
        type: "smoothstep",
      });
    }

    if (nextOptionsGenerated && revealDisplayed) {
      generateMockOptions().forEach((_, index) => {
        const nodeId = `next-option-${index + 1}`;
        generatedEdges.push({
          id: `edge-reveal-${nodeId}`,
          source: "revealed",
          target: nodeId,
        });
      });
    }

    return generatedEdges;
  }, [nextOptionsGenerated, options, phase, revealDisplayed, selection]);

  const showGuidance = phase !== "draft";

  useEffect(() => {
    if (nodes.length <= 1) return;
    const timeout = window.setTimeout(
      () =>
        reactFlow.fitView({
          padding: 0.28,
          includeHiddenNodes: true,
          duration: 820,
        }),
      140,
    );

    return () => window.clearTimeout(timeout);
  }, [nodes.length, reactFlow]);

  return (
    <div className="relative h-full w-full">
      {showGuidance ? (
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-primary/20 bg-background/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow">
          Choose 1 of 4 options, or write your own.
        </div>
      ) : null}

      {selection && !lockExpired ? (
        <div className="pointer-events-none absolute left-1/2 bottom-3 z-10 -translate-x-1/2 rounded-full border border-primary/15 bg-background/90 px-4 py-2 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
          Decision locked. Take time to reflect.
        </div>
      ) : null}

      {selection && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col gap-2 text-xs">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm backdrop-blur",
              lockExpired ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100" : "border-primary/30 bg-background/85 text-muted-foreground",
            )}
          >
            <Badge variant="secondary" className="pointer-events-auto bg-primary/10 text-primary">
              Lock
            </Badge>
            {lockExpired ? "Lock expired — reveal unlocked" : `Locked for ${formatDuration(lockRemaining)}`}
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm backdrop-blur",
              changeWindowClosed
                ? "border-amber-400/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
                : "border-primary/25 bg-background/80 text-muted-foreground",
            )}
          >
            <Badge variant="outline" className="pointer-events-auto border-muted-foreground/30 text-muted-foreground">
              Change window
            </Badge>
            {changeWindowClosed ? "Change window closed" : `You can switch for ${formatDuration(changeRemaining)}`}
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.28 }}
        minZoom={0.4}
        maxZoom={1.75}
        panOnScroll
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        translateExtent={[
          [-5000, -5000],
          [5000, 5000],
        ]}
        defaultEdgeOptions={{
          animated: false,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 22,
            height: 22,
            color: "rgba(59, 130, 246, 0.7)",
          },
          style: { strokeWidth: 2.6, stroke: "rgba(59, 130, 246, 0.7)" },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={2} color="rgba(148, 163, 184, 0.45)" />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function DecisionBoard() {
  return (
    <ReactFlowProvider>
      <DecisionBoardCanvas />
    </ReactFlowProvider>
  );
}

export default DecisionBoard;
