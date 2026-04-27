"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ─── Custom node types ────────────────────────────────────────────────────────

type NodeData = {
  label: string;
  type: "trigger" | "integration" | "output";
};

const colorMap = {
  trigger: {
    border: "border-l-purple-500",
    bg: "bg-purple-50",
    dot: "bg-purple-400",
    text: "text-purple-700",
  },
  integration: {
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    dot: "bg-blue-400",
    text: "text-blue-700",
  },
  output: {
    border: "border-l-green-500",
    bg: "bg-green-50",
    dot: "bg-green-400",
    text: "text-green-700",
  },
};

function PipelineNode({ data }: NodeProps) {
  const nodeData = data as NodeData;
  const c = colorMap[nodeData.type];
  return (
    <div
      className={`border border-neutral-200 border-l-4 ${c.border} ${c.bg} rounded-xl px-4 py-3 shadow-sm min-w-[160px] bg-white`}
      style={{
        borderLeftWidth: 4,
        borderRadius: 12,
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        minWidth: 160,
        padding: "10px 16px",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "#cbd5e1" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e293b",
            lineHeight: 1.3,
          }}
        >
          {nodeData.label}
        </span>
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color:
            nodeData.type === "trigger"
              ? "#7c3aed"
              : nodeData.type === "integration"
              ? "#2563eb"
              : "#16a34a",
        }}
      >
        {nodeData.type}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "#cbd5e1" }} />
    </div>
  );
}

const nodeTypes = { pipeline: PipelineNode };

// ─── Initial nodes ────────────────────────────────────────────────────────────

const initialNodes = [
  // Triggers
  { id: "t1", type: "pipeline", position: { x: 0, y: 60 }, data: { label: "New Client Signup", type: "trigger" } },
  { id: "t2", type: "pipeline", position: { x: 0, y: 200 }, data: { label: "Monthly Cron (1st)", type: "trigger" } },

  // Integrations — wave 1
  { id: "i1", type: "pipeline", position: { x: 280, y: 20 }, data: { label: "VAPI Interview Call", type: "integration" } },
  { id: "i2", type: "pipeline", position: { x: 280, y: 140 }, data: { label: "OpenAI Analysis", type: "integration" } },
  { id: "i3", type: "pipeline", position: { x: 280, y: 260 }, data: { label: "Twilio SMS", type: "integration" } },
  { id: "i4", type: "pipeline", position: { x: 280, y: 370 }, data: { label: "Resend Email", type: "integration" } },

  // Integrations — wave 2
  { id: "i5", type: "pipeline", position: { x: 560, y: 20 }, data: { label: "Predis Social Posts", type: "integration" } },
  { id: "i6", type: "pipeline", position: { x: 560, y: 140 }, data: { label: "ElevenLabs Audio", type: "integration" } },
  { id: "i7", type: "pipeline", position: { x: 560, y: 260 }, data: { label: "HeyGen Video", type: "integration" } },
  { id: "i8", type: "pipeline", position: { x: 560, y: 380 }, data: { label: "Headliner Audiogram", type: "integration" } },
  { id: "i9", type: "pipeline", position: { x: 560, y: 490 }, data: { label: "GitHub+Vercel Pages", type: "integration" } },
  { id: "i10", type: "pipeline", position: { x: 560, y: 600 }, data: { label: "Ayrshare Publishing", type: "integration" } },
  { id: "i11", type: "pipeline", position: { x: 560, y: 710 }, data: { label: "Stripe Webhook", type: "integration" } },

  // Outputs
  { id: "o1", type: "pipeline", position: { x: 860, y: 20 }, data: { label: "Social Posts Live", type: "output" } },
  { id: "o2", type: "pipeline", position: { x: 860, y: 140 }, data: { label: "Audio Episode Live", type: "output" } },
  { id: "o3", type: "pipeline", position: { x: 860, y: 260 }, data: { label: "Video Live", type: "output" } },
  { id: "o4", type: "pipeline", position: { x: 860, y: 380 }, data: { label: "Landing Pages Live", type: "output" } },
  { id: "o5", type: "pipeline", position: { x: 860, y: 500 }, data: { label: "Monthly Report", type: "output" } },
];

// ─── Initial edges ────────────────────────────────────────────────────────────

const initialEdges = [
  // Triggers → wave 1
  { id: "e-t1-i1", source: "t1", target: "i1", animated: true },
  { id: "e-t1-i3", source: "t1", target: "i3" },
  { id: "e-t1-i4", source: "t1", target: "i4" },
  { id: "e-t2-i2", source: "t2", target: "i2", animated: true },
  { id: "e-t2-i11", source: "t2", target: "i11" },

  // Wave 1 → wave 2
  { id: "e-i1-i2", source: "i1", target: "i2", animated: true },
  { id: "e-i2-i5", source: "i2", target: "i5", animated: true },
  { id: "e-i2-i6", source: "i2", target: "i6" },
  { id: "e-i2-i7", source: "i2", target: "i7" },
  { id: "e-i2-i8", source: "i2", target: "i8" },
  { id: "e-i2-i9", source: "i2", target: "i9" },
  { id: "e-i5-i10", source: "i5", target: "i10" },

  // Wave 2 → outputs
  { id: "e-i10-o1", source: "i10", target: "o1", animated: true },
  { id: "e-i6-o2", source: "i6", target: "o2" },
  { id: "e-i7-o3", source: "i7", target: "o3" },
  { id: "e-i9-o4", source: "i9", target: "o4" },
  { id: "e-i11-o5", source: "i11", target: "o5" },
  { id: "e-i8-o2", source: "i8", target: "o2" },
];

// ─── Inner canvas component ───────────────────────────────────────────────────

function PipelineCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Master Pipeline</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visual automation map — all client pipelines inherit this template
          </p>
        </div>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
            editMode
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          {editMode ? "✓ Edit Mode On" : "Edit Mode"}
        </button>
      </div>

      {/* React Flow canvas */}
      <div style={{ flex: 1, height: "calc(100vh - 176px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={editMode}
          nodesConnectable={editMode}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          defaultEdgeOptions={{
            style: { strokeWidth: 2, stroke: "#94a3b8" },
          }}
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const d = node.data as NodeData;
              return d.type === "trigger" ? "#a78bfa" : d.type === "output" ? "#4ade80" : "#60a5fa";
            }}
            style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// ─── Default export wrapped in provider ──────────────────────────────────────

export default function PipelinePage() {
  return (
    <div style={{ margin: "-2rem", height: "calc(100vh - 72px)" }}>
      <ReactFlowProvider>
        <PipelineCanvas />
      </ReactFlowProvider>
    </div>
  );
}
