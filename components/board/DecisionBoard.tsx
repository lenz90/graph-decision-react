"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import type { Edge, Node, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import OptionNode, { type OptionNodeData } from "./nodes/OptionNode";
import RootNode, { type RootNodeData } from "./nodes/RootNode";

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

function generateMockOptions(): MockOption[] {
  return mockOptions;
}

const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  root: RootNode as ComponentType<NodeProps>,
  option: OptionNode as ComponentType<NodeProps>,
};

function DecisionBoardCanvas() {
  const reactFlow = useReactFlow();
  const [rootText, setRootText] = useState("");
  const [optionsGenerated, setOptionsGenerated] = useState(false);
  const [rootHighlight, setRootHighlight] = useState(false);
  const [nodes, setNodes] = useState<Node<OptionNodeData | RootNodeData>[]>([
    {
      id: "root",
      type: "root",
      position: { x: 0, y: 0 },
      className: "root-node",
      data: {
        situation: "",
        onChange: () => {},
        onGenerate: () => {},
        canGenerate: false,
        isLocked: false,
      },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleRootChange = useCallback((value: string) => {
    setRootText(value);
  }, []);

  const handleGenerateOptions = useCallback(() => {
    if (optionsGenerated || rootText.length === 0) {
      return;
    }

    const generated = generateMockOptions();

    const optionNodes: Node<OptionNodeData>[] = generated.map((option, index) => ({
      id: `option-${index + 1}`,
      type: "option",
      position: { x: 420 + index * 260, y: -180 + index * 120 },
      className: "option-node option-node-enter",
      data: {
        label: option.label,
        philosophyLine: option.philosophyLine,
      },
    }));

    const optionEdges: Edge[] = generated.map((_, index) => ({
      id: `edge-root-${index + 1}`,
      source: "root",
      target: `option-${index + 1}`,
      animated: false,
    }));

    setNodes((current) => [...current.filter((node) => node.id === "root"), ...optionNodes]);
    setEdges(optionEdges);
    setOptionsGenerated(true);
    setRootHighlight(true);
  }, [optionsGenerated, rootText]);

  const rootNodeData: RootNodeData = useMemo(
    () => ({
      situation: rootText,
      onChange: handleRootChange,
      onGenerate: handleGenerateOptions,
      canGenerate: !optionsGenerated && rootText.length > 0,
      isLocked: optionsGenerated,
    }),
    [handleGenerateOptions, handleRootChange, optionsGenerated, rootText],
  );

  const nodesWithData = useMemo(() => {
    return nodes.map((node) =>
      node.id === "root"
        ? {
            ...node,
            data: rootNodeData,
            className: rootHighlight ? "root-node root-node-emphasis" : "root-node",
          }
        : node,
    );
  }, [nodes, rootHighlight, rootNodeData]);

  useEffect(() => {
    if (!optionsGenerated || nodes.length <= 1) return;

    const timeout = window.setTimeout(() => {
      reactFlow.fitView({
        padding: 0.24,
        includeHiddenNodes: true,
        duration: 900,
      });
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [nodes, optionsGenerated, reactFlow]);

  useEffect(() => {
    if (!rootHighlight) return;

    const timeout = window.setTimeout(() => setRootHighlight(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [rootHighlight]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodesWithData}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
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
        defaultEdgeOptions={{ animated: false }}
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
