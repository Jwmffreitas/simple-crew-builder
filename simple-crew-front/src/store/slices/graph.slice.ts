import type { StateCreator } from 'zustand';
import { 
  type Connection, 
  type EdgeChange, 
  type NodeChange, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges 
} from '@xyflow/react';
import type { AppNode, AppEdge } from '../../types/nodes.types';
import type { NodeStatus, AppState, GraphSlice } from '../../types/store.types';

// Helper functions for collapsing logic
function getDescendantsToHide(nodeId: string, edges: AppEdge[]): string[] {
  const descendants: string[] = [];
  const queue = [nodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const children = edges
      .filter((edge) => edge.source === currentId)
      .map((edge) => edge.target);

    for (const childId of children) {
      if (!visited.has(childId)) {
        descendants.push(childId);
        queue.push(childId);
      }
    }
  }
  return descendants;
}

function getDescendantsToShow(nodeId: string, nodes: AppNode[], edges: AppEdge[]): string[] {
  const descendants: string[] = [];
  const queue = [nodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const childrenIds = edges
      .filter((edge) => edge.source === currentId)
      .map((edge) => edge.target);

    for (const childId of childrenIds) {
      if (!visited.has(childId)) {
        descendants.push(childId);
        const childNode = nodes.find(n => n.id === childId);
        const isChildCollapsed = (childNode?.data as any)?.isCollapsed ?? false;
        if (!isChildCollapsed) {
          queue.push(childId);
        }
      }
    }
  }
  return descendants;
}

const initialNodes: AppNode[] = [
  {
    id: 'crew-1',
    type: 'crew',
    position: { x: 50, y: 50 },
    data: { process: 'sequential', isCollapsed: false },
  },
  {
    id: 'agent-1',
    type: 'agent',
    position: { x: 50, y: 200 },
    data: {
      name: 'Senior Writer',
      role: 'Senior Writer',
      goal: 'Write compelling copy',
      backstory: 'Expert in persuasive writing.',
      isCollapsed: false,
    },
  },
  {
    id: 'task-1',
    type: 'task',
    position: { x: 450, y: 200 },
    data: {
      name: 'SEO Writing Task',
      description: 'Escrever descrições persuasivas para os produtos da Glaad Store',
      expected_output: '3 parágrafos de texto otimizado para SEO'
    },
  }
];

const initialEdges: AppEdge[] = [
  { id: 'e1-2', source: 'agent-1', target: 'task-1', type: 'deletable', sourceHandle: 'right-source', targetHandle: 'left-target' }
];

export const INITIAL_CHAT_MESSAGES: AppState['messages'] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: 'Hello! I am connected to your Crew. How can we help you today?'
  }
];

export const createGraphSlice: StateCreator<AppState, [], [], GraphSlice> = (set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  nodeStatuses: {},
  nodeErrors: {},
  nodeWarnings: {},
  executionResult: null,
  messages: INITIAL_CHAT_MESSAGES,
  activeNodeId: null,

  onNodesChange: (changes: NodeChange<AppNode>[]) => {
    const { nodes } = get();
    const nextNodes = applyNodeChanges(changes, nodes);
    
    const removedTaskIds = changes
      .filter((c: NodeChange<AppNode>) => c.type === 'remove')
      .map((c: any) => c.id);

    if (removedTaskIds.length > 0) {
      set({
        nodes: nextNodes.map((node: AppNode) => {
          if (node.type === 'agent') {
            const taskOrder = (node.data as any).taskOrder || [];
            const newTaskOrder = taskOrder.filter((id: string) => !removedTaskIds.includes(id));
            if (newTaskOrder.length !== taskOrder.length) {
                return { ...node, data: { ...node.data, taskOrder: newTaskOrder } } as AppNode;
            }
          }
          return node;
        })
      });
    } else {
      set({ nodes: nextNodes });
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const { nodes, edges } = get();
    const nextEdges = applyEdgeChanges(changes, edges);

    const removedEdges = changes.filter((c: EdgeChange) => c.type === 'remove');
    if (removedEdges.length > 0) {
      let updatedNodes = [...nodes];
      removedEdges.forEach((change: EdgeChange) => {
        if (change.type === 'remove') {
          const edge = edges.find((e: AppEdge) => e.id === change.id);
          if (edge) {
            const sourceNode = nodes.find((n: AppNode) => n.id === edge.source);
            const targetNode = nodes.find((n: AppNode) => n.id === edge.target);
            if (sourceNode?.type === 'agent' && targetNode?.type === 'task') {
              updatedNodes = updatedNodes.map((node: AppNode) => {
                if (node.id === sourceNode.id) {
                  const taskOrder = (node.data as any).taskOrder || [];
                  return { ...node, data: { ...node.data, taskOrder: taskOrder.filter((id: string) => id !== targetNode.id) } } as AppNode;
                }
                return node;
              });
            }
          }
        }
      });
      set({ nodes: updatedNodes, edges: nextEdges });
    } else {
      set({ edges: nextEdges });
    }
  },

  onConnect: (connection: Connection) => {
    set((state) => {
      if (!connection.source || !connection.target) return state;

      const sourceNode = state.nodes.find((n) => n.id === connection.source);
      const targetNode = state.nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return state;

      const isCrewToAgent = sourceNode.type === 'crew' && targetNode.type === 'agent';
      const isAgentToTask = sourceNode.type === 'agent' && targetNode.type === 'task';
      const isChatToCrew = sourceNode.type === 'chat' && targetNode.type === 'crew';

      if (!isCrewToAgent && !isAgentToTask && !isChatToCrew) {
        console.warn(`[CrewAI Rules] Invalid connection blocked: ${sourceNode.type} -> ${targetNode.type}`);
        return state;
      }

      const isDuplicate = state.edges.some(
        (edge) => edge.source === connection.source && edge.target === connection.target
      );
      if (isDuplicate) return state;

      let newEdges = [...state.edges];

      if (targetNode.type === 'task' || targetNode.type === 'agent' || targetNode.type === 'crew') {
        newEdges = newEdges.filter((edge) => edge.target !== connection.target);
      }

      let newConnection: any = { ...connection, type: 'deletable' };

      if (isChatToCrew) {
        newConnection = {
          ...newConnection,
          animated: true,
          style: { stroke: '#22d3ee', strokeWidth: 2, strokeDasharray: '5 5' }
        };
        // This action triggers UI change:
        setTimeout(() => get().setIsChatVisible(true), 0);
      }

      let nextNodes = state.nodes;
      if (isAgentToTask) {
        nextNodes = state.nodes.map((node: AppNode) => {
          if (node.id === connection.source) {
            const taskOrder = (node.data as any).taskOrder || [];
            if (!taskOrder.includes(connection.target)) {
               return { 
                 ...node, 
                 data: { ...node.data, taskOrder: [...taskOrder, connection.target] } 
               } as AppNode;
            }
          }
          return node;
        });
      }

      return {
        nodes: nextNodes,
        edges: addEdge(newConnection, newEdges),
      };
    });
  },

  deleteEdge: (edgeId: string) => {
    set((state: AppState) => {
      const edge = state.edges.find((e: AppEdge) => e.id === edgeId);
      let updatedNodes = state.nodes;

      if (edge) {
        const sourceNode = state.nodes.find((n: AppNode) => n.id === edge.source);
        const targetNode = state.nodes.find((n: AppNode) => n.id === edge.target);
        if (sourceNode?.type === 'agent' && targetNode?.type === 'task') {
          updatedNodes = state.nodes.map((node: AppNode) => {
            if (node.id === sourceNode.id) {
              const taskOrder = (node.data as any).taskOrder || [];
              return { ...node, data: { ...node.data, taskOrder: taskOrder.filter((id: string) => id !== targetNode.id) } } as AppNode;
            }
            return node;
          });
        }
      }

      return {
        nodes: updatedNodes,
        edges: state.edges.filter((e: AppEdge) => e.id !== edgeId),
      };
    });
  },

  deleteNode: (nodeId: string) => {
    set((state: AppState) => {
      const nodeToDelete = state.nodes.find((n: AppNode) => n.id === nodeId);
      let updatedNodes = state.nodes.filter((node: AppNode) => node.id !== nodeId);

      if (nodeToDelete?.type === 'task') {
        updatedNodes = updatedNodes.map((node: AppNode) => {
          if (node.type === 'agent') {
            const taskOrder = (node.data as any).taskOrder || [];
            return { ...node, data: { ...node.data, taskOrder: taskOrder.filter((id: string) => id !== nodeId) } } as AppNode;
          }
          return node;
        });
      }

      return {
        nodes: updatedNodes,
        edges: state.edges.filter((edge: AppEdge) => edge.source !== nodeId && edge.target !== nodeId),
        activeNodeId: state.activeNodeId === nodeId ? null : state.activeNodeId,
      };
    });
  },

  updateNodeData: (nodeId: string, data: Partial<any>) => {
    set({
      nodes: get().nodes.map((node: AppNode) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } } as AppNode;
        }
        return node;
      }),
    });
  },

  addNode: (node: AppNode) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  addNodeWithAutoPosition: (type: 'agent' | 'task' | 'crew' | 'chat', data: any) => {
    const existingNodes = get().nodes;
    const startX = 600;
    const startY = 100;
    const spacingX = 350; 
    const spacingY = 220; 
    const nodesPerRow = 3;

    const gridIndex = existingNodes.length;
    const row = Math.floor(gridIndex / nodesPerRow);
    const col = gridIndex % nodesPerRow;

    const position = {
      x: startX + (col * spacingX),
      y: startY + (row * spacingY),
    };

    const newNode: AppNode = {
      id: `dndnode_${crypto.randomUUID()}`,
      type,
      position,
      data,
    } as AppNode;

    set({
      nodes: [...existingNodes, newNode],
    });
    
    get().validateGraph();
  },

  setNodeStatus: (id: string, status: NodeStatus) => {
    // ... (existing implementation)
    set((state: AppState) => {
      const newStatuses = { ...state.nodeStatuses, [id]: status };
      const node = state.nodes.find((n: AppNode) => n.id === id);

      if (node?.type === 'task') {
        const edgeToTask = state.edges.find((e: AppEdge) => e.target === id);
        if (edgeToTask) {
          const parentAgentId = edgeToTask.source;
          if (status === 'running') {
            newStatuses[parentAgentId] = 'running';
          }
          else if (status === 'success') {
            const allSiblingTasks = state.edges
              .filter((e: AppEdge) => e.source === parentAgentId)
              .map((e: AppEdge) => e.target);

            const allSuccess = allSiblingTasks.every((taskId: string) =>
              taskId === id ? true : newStatuses[taskId] === 'success'
            );

            if (allSuccess) {
              newStatuses[parentAgentId] = 'success';
            }
          }
        }
      }
      return { nodeStatuses: newStatuses };
    });
  },

  setNodeWarnings: (warnings: Record<string, string[]>) => {
    set({ nodeWarnings: warnings });
  },

  setActiveNode: (id: string | null) => {
    set({ activeNodeId: id });
  },

  toggleCollapse: (nodeId: string) => {
    set((state: AppState) => {
      const node = state.nodes.find((n: AppNode) => n.id === nodeId);
      if (!node) return {};

      const currentlyCollapsed = (node.data as any).isCollapsed ?? false;
      const willCollapse = !currentlyCollapsed;

      let descendantIds: string[] = [];

      if (willCollapse) {
        descendantIds = getDescendantsToHide(nodeId, state.edges);
      } else {
        descendantIds = getDescendantsToShow(nodeId, state.nodes, state.edges);
      }

      const descendantSet = new Set(descendantIds);

      const updatedNodes = state.nodes.map((n: AppNode) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, isCollapsed: willCollapse } } as AppNode;
        }
        if (descendantSet.has(n.id)) {
          return { ...n, hidden: willCollapse } as AppNode;
        }
        return n;
      });

      const updatedEdges = state.edges.map((edge: AppEdge) => {
        const isAffectedEdge = edge.source === nodeId || descendantSet.has(edge.source) || descendantSet.has(edge.target);
        if (isAffectedEdge) {
          return { ...edge, hidden: willCollapse };
        }
        return edge;
      });

      return { nodes: updatedNodes, edges: updatedEdges };
    });
  },

  updateCrewAgentOrder: (crewId: string, newOrder: string[]) => {
    set((state: AppState) => ({
      nodes: state.nodes.map((node: AppNode) => {
        if (node.id === crewId && node.type === 'crew') {
          return { ...node, data: { ...node.data, agentOrder: newOrder } } as AppNode;
        }
        return node;
      }),
    }));
  },

  updateCrewTaskOrder: (crewId: string, newOrder: string[]) => {
    set((state: AppState) => ({
      nodes: state.nodes.map((node: AppNode) => {
        if (node.id === crewId && node.type === 'crew') {
          return { ...node, data: { ...node.data, taskOrder: newOrder } } as AppNode;
        }
        return node;
      }),
    }));
  },
  
  updateAgentTaskOrder: (agentId: string, newOrder: string[]) => {
    set((state: AppState) => ({
      nodes: state.nodes.map((node: AppNode) => {
        if (node.id === agentId && node.type === 'agent') {
          return { ...node, data: { ...node.data, taskOrder: newOrder } } as AppNode;
        }
        return node;
      }),
    }));
  },

  validateGraph: () => {
    const state = get();
    const errors: Record<string, string[]> = {};
    let isValid = true;

    for (const node of state.nodes) {
      const currentErrors: string[] = [];
      const data = node.data as any;

      if (node.type === 'crew') {
        const hasAgents = state.edges.some((e) => e.source === node.id);
        if (!hasAgents) currentErrors.push('Missing connected Agent');
      } else if (node.type === 'agent') {
        if (!data.name?.trim()) currentErrors.push('Missing Name');
        if (!data.role?.trim()) currentErrors.push('Missing Role');
        if (!data.goal?.trim()) currentErrors.push('Missing Goal');
        if (!data.backstory?.trim()) currentErrors.push('Missing Backstory');
        const hasTasks = state.edges.some((e) => e.source === node.id);
        if (!hasTasks) currentErrors.push('Missing connected Task');
      } else if (node.type === 'task') {
        if (!data.name?.trim()) currentErrors.push('Missing Name');
        if (!data.description?.trim()) currentErrors.push('Missing Description');
        if (!data.expected_output?.trim()) currentErrors.push('Missing Expected Output');
      }

      if (currentErrors.length > 0) {
        errors[node.id] = currentErrors;
        isValid = false;
      }
    }

    set({ nodeErrors: errors });
    return isValid;
  },

  setExecutionResult: (result: string | null) => set({ executionResult: result }),

  resetProject: () => {
    set({
      nodes: [],
      edges: [],
      currentProjectId: null,
      currentProjectName: null,
      currentProjectDescription: null,
      currentProjectWorkspaceId: null,
      nodeStatuses: {},
      nodeErrors: {},
      nodeWarnings: {},
      executionResult: null,
      messages: INITIAL_CHAT_MESSAGES,
      isConsoleOpen: false,
      isConsoleExpanded: false,
      isChatVisible: false
    });
  },

  setMessages: (messagesOrFn) => {
    if (typeof messagesOrFn === 'function') {
      set((state) => ({ messages: messagesOrFn(state.messages) }));
    } else {
      set({ messages: messagesOrFn });
    }
  },

  clearChat: () => {
    set({ messages: INITIAL_CHAT_MESSAGES });
  },
});
