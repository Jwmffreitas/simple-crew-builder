import { type Node, type Edge } from '@xyflow/react';

export type ProcessType = 'sequential' | 'hierarchical';

export interface AgentNodeData extends Record<string, unknown> {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  isCollapsed?: boolean;
}

export interface TaskNodeData extends Record<string, unknown> {
  name: string;
  description: string;
  expected_output: string;
}

export interface CrewNodeData extends Record<string, unknown> {
  process: ProcessType;
  isCollapsed?: boolean;
  agentOrder?: string[];
}

export type AppNode = 
  | Node<AgentNodeData, 'agent'>
  | Node<TaskNodeData, 'task'>
  | Node<CrewNodeData, 'crew'>;

export type AppEdge = Edge;

export type NodeStatus = 'idle' | 'running' | 'success';

export interface SavedCrew {
  id: string;
  name: string;
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface AppNotification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
}

export interface AppState {
  nodes: AppNode[];
  edges: AppEdge[];
  savedCrews: SavedCrew[];
  activeNodeId: string | null;
  isExecuting: boolean;
  nodeStatuses: Record<string, NodeStatus>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  deleteEdge: (edgeId: string) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<any>) => void;
  addNode: (node: AppNode) => void;
  saveCurrentCrew: (name: string) => void;
  loadCrew: (id: string) => void;
  setActiveNode: (id: string | null) => void;
  toggleCollapse: (nodeId: string) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;
  startRealExecution: () => Promise<void>;
  updateCrewAgentOrder: (crewId: string, newOrder: string[]) => void;
  updateAgentTaskOrder: (agentId: string, newOrder: string[]) => void;
  nodeErrors: Record<string, string[]>;
  validateGraph: () => boolean;
  notification: AppNotification | null;
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  clearNotification: () => void;
  exportProjectJson: () => void;
  loadProjectJson: (data: any) => boolean;
  executionResult: string | null;
  setExecutionResult: (result: string | null) => void;
  isConsoleOpen: boolean;
  isConsoleExpanded: boolean;
  setIsConsoleOpen: (isOpen: boolean) => void;
  setIsConsoleExpanded: (isExpanded: boolean) => void;
}
