"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { RootNode } from "./nodes/RootNode";

const initialNodes: Node[] = [
  {
    id: "root",
    type: "root",
    position: { x: 0, y: 0 },
    data: {},
  },
];

function DecisionBoardCanvas() {
  const nodes = useMemo(() => initialNodes, []);
  const edges = useMemo<Edge[]>(() => [], []);
  const nodeTypes = useMemo(() => ({ root: RootNode }), []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
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
