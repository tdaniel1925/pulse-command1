"use client";

import "@xyflow/react/dist/style.css";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";

type NodeData = {
  label: string;
  sublabel?: string;
  status: "running" | "idle";
  color: string;
};

function PipelineNode({ data }: { data: NodeData }) {
  return (
    <div
      className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
      style={{ minWidth: 160 }}
    >
      <div className="flex items-stretch">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: data.color }} />
        <div className="px-4 py-3 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-neutral-800 leading-tight">
              {data.label}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: data.status === "running" ? "#16a34a" : "#d1d5db",
                boxShadow:
                  data.status === "running"
                    ? "0 0 0 3px rgba(22,163,74,0.2)"
                    : undefined,
              }}
            />
          </div>
          {data.sublabel && (
            <p className="text-xs text-neutral-400 mt-0.5">{data.sublabel}</p>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { pipeline: PipelineNode };

const initialNodes = [
  {
    id: "1",
    type: "pipeline",
    position: { x: 0, y: 160 },
    data: { label: "Your Onboarding", sublabel: "Trigger", status: "idle", color: "#6366f1" },
  },
  {
    id: "2",
    type: "pipeline",
    position: { x: 220, y: 160 },
    data: { label: "Brand Profile Built", sublabel: "Auto-generated", status: "idle", color: "#0ea5e9" },
  },
  {
    id: "3",
    type: "pipeline",
    position: { x: 440, y: 160 },
    data: { label: "Content Generation", sublabel: "Started", status: "running", color: "#2563eb" },
  },
  // Parallel branches
  {
    id: "4",
    type: "pipeline",
    position: { x: 680, y: 20 },
    data: { label: "Social Posts", sublabel: "via Ayrshare", status: "running", color: "#16a34a" },
  },
  {
    id: "5",
    type: "pipeline",
    position: { x: 680, y: 120 },
    data: { label: "AI Videos", sublabel: "via HeyGen", status: "running", color: "#d97706" },
  },
  {
    id: "6",
    type: "pipeline",
    position: { x: 680, y: 220 },
    data: { label: "Audio Episodes", sublabel: "via ElevenLabs", status: "running", color: "#7c3aed" },
  },
  {
    id: "7",
    type: "pipeline",
    position: { x: 680, y: 320 },
    data: { label: "Landing Pages", sublabel: "via Vercel", status: "running", color: "#0891b2" },
  },
  // Merge
  {
    id: "8",
    type: "pipeline",
    position: { x: 920, y: 160 },
    data: { label: "Monthly Report", sublabel: "Delivered to you", status: "idle", color: "#2563eb" },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e3-4", source: "3", target: "4", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e3-5", source: "3", target: "5", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e3-6", source: "3", target: "6", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e3-7", source: "3", target: "7", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e4-8", source: "4", target: "8", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e5-8", source: "5", target: "8", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e6-8", source: "6", target: "8", animated: true, style: { stroke: "#cbd5e1" } },
  { id: "e7-8", source: "7", target: "8", animated: true, style: { stroke: "#cbd5e1" } },
];

function WorkflowCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#e2e8f0" gap={20} />
      <Controls showInteractive={false} />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
    </ReactFlow>
  );
}

export default function WorkflowPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Your Content Pipeline</h2>
        <p className="text-neutral-500 mt-1 text-sm">
          This shows how your content is created and delivered each month.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
          Running
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
          Idle
        </span>
      </div>

      <div className="flex-1 rounded-2xl border border-neutral-200 shadow-sm overflow-hidden bg-neutral-50" style={{ minHeight: 480 }}>
        <ReactFlowProvider>
          <WorkflowCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
