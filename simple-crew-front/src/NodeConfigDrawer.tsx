import React, { useState, useEffect } from 'react';
import { X, Trash2, GripVertical } from 'lucide-react';
import { useStore } from './store';
import type { AppState, ProcessType, AppNode } from './types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, name }: { id: string; name: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2.5 bg-white border rounded-md mb-2 transition-shadow ${
        isDragging 
          ? 'opacity-90 ring-2 ring-blue-500 shadow-lg border-blue-200' 
          : 'border-gray-200 shadow-sm hover:border-gray-300'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-gray-700 truncate">{name}</span>
    </div>
  );
}

export function NodeConfigDrawer() {
  const activeNodeId = useStore((state: AppState) => state.activeNodeId);
  const nodes = useStore((state: AppState) => state.nodes);
  const edges = useStore((state: AppState) => state.edges);
  const setActiveNode = useStore((state: AppState) => state.setActiveNode);
  const updateNodeData = useStore((state: AppState) => state.updateNodeData);
  const deleteNode = useStore((state: AppState) => state.deleteNode);
  const updateCrewAgentOrder = useStore((state: AppState) => state.updateCrewAgentOrder);
  const updateAgentTaskOrder = useStore((state: AppState) => state.updateAgentTaskOrder);

  const [localName, setLocalName] = useState('');
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (activeNodeId) {
      const node = nodes.find((n) => n.id === activeNodeId);
      if (node) {
        setLocalName((node.data as any).name || '');
        setNameError(false);
      }
    }
  }, [activeNodeId, nodes]);

  // -- Sincronização e Ordenação Externa (Store) -- //
  const activeNode = nodes.find((n: AppNode) => n.id === activeNodeId);
  const isCrew = activeNode?.type === 'crew';
  const isAgent = activeNode?.type === 'agent';
  
  const connectedAgents = flexSearchAgents();
  const agentOrder = (activeNode?.data as any)?.agentOrder as string[] | undefined;
  
  const connectedTasks = flexSearchTasks();
  const taskOrder = (activeNode?.data as any)?.taskOrder as string[] | undefined;
  
  // Combina lista de ID's com os objetos de Node para render()
  let renderableAgents = [...connectedAgents];
  
  if (isCrew && agentOrder && agentOrder.length > 0) {
    // Sincroniza a visualização baseada na ordem gravada
    renderableAgents.sort((a, b) => {
      const idxA = agentOrder.indexOf(a.id);
      const idxB = agentOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  let renderableTasks = [...connectedTasks];

  if (isAgent && taskOrder && taskOrder.length > 0) {
    renderableTasks.sort((a, b) => {
      const idxA = taskOrder.indexOf(a.id);
      const idxB = taskOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  // Effect para sincronização inicial se não haver ordem ou houver inconsistência (Agents)
  useEffect(() => {
    if (isCrew && activeNodeId) {
      const currentIds = connectedAgents.map(a => a.id);
      const orderedIds = renderableAgents.map(a => a.id);
      
      const isMissing = currentIds.some(id => !agentOrder?.includes(id));
      const hasExtra = agentOrder?.some(id => !currentIds.includes(id));

      if (!agentOrder || isMissing || hasExtra) {
        // Corrige automaticamente gerando um AgentOrder fiel
        updateCrewAgentOrder(activeNodeId, orderedIds);
      }
    }
  }, [connectedAgents.length, isCrew, activeNodeId]);

  // Effect para sincronização inicial se não haver ordem ou houver inconsistência (Tasks)
  useEffect(() => {
    if (isAgent && activeNodeId) {
      const currentIds = connectedTasks.map(a => a.id);
      const orderedIds = renderableTasks.map(a => a.id);
      
      const isMissing = currentIds.some(id => !taskOrder?.includes(id));
      const hasExtra = taskOrder?.some(id => !currentIds.includes(id));

      if (!taskOrder || isMissing || hasExtra) {
        updateAgentTaskOrder(activeNodeId, orderedIds);
      }
    }
  }, [connectedTasks.length, isAgent, activeNodeId]);

  function flexSearchAgents() {
    if (!isCrew || !activeNodeId) return [];
    return edges
      .filter((e) => e.source === activeNodeId)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n) => n?.type === 'agent') as AppNode[];
  }

  function flexSearchTasks() {
    if (!isAgent || !activeNodeId) return [];
    return edges
      .filter((e) => e.source === activeNodeId)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n) => n?.type === 'task') as AppNode[];
  }

  // -- Handlers do Dnd-Kit -- //
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleAgentDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (activeNodeId && over && active.id !== over.id) {
      const oldIndex = renderableAgents.findIndex((a) => a.id === active.id);
      const newIndex = renderableAgents.findIndex((a) => a.id === over.id);

      const computedNewOrder = arrayMove(renderableAgents, oldIndex, newIndex);
      const newOrderIds = computedNewOrder.map((a) => a.id);
      
      updateCrewAgentOrder(activeNodeId, newOrderIds);
    }
  }

  function handleTaskDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (activeNodeId && over && active.id !== over.id) {
      const oldIndex = renderableTasks.findIndex((a) => a.id === active.id);
      const newIndex = renderableTasks.findIndex((a) => a.id === over.id);

      const computedNewOrder = arrayMove(renderableTasks, oldIndex, newIndex);
      const newOrderIds = computedNewOrder.map((a) => a.id);
      
      updateAgentTaskOrder(activeNodeId, newOrderIds);
    }
  }

  if (!activeNodeId || !activeNode) return null;

  const { type, data } = activeNode;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalName(value);

    const isDuplicate = nodes.some(
      (n) => n.id !== activeNode.id && n.type === activeNode.type && (n.data as any).name === value
    );

    setNameError(isDuplicate);

    if (!isDuplicate) {
      updateNodeData(activeNodeId, { name: value });
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {type} Configuration
        </h2>
        <button
          onClick={() => setActiveNode(null)}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {(type === 'agent' || type === 'task') && (
          <div className="flex flex-col gap-1.5 mb-6 pb-6 border-b border-gray-100">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                nameError
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 text-red-900'
                  : 'border-gray-300 focus:ring-blue-500 bg-white text-gray-800'
              }`}
              value={localName}
              onChange={handleNameChange}
              placeholder={type === 'agent' ? 'e.g. Senior Researcher' : 'e.g. SEO Writing Task'}
            />
            {nameError && (
              <span className="text-xs text-red-500 mt-1">
                This name is already in use. It must be unique.
              </span>
            )}
          </div>
        )}

        {type === 'agent' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <input
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                value={(data as any).role || ''}
                onChange={(e) => updateNodeData(activeNodeId, { role: e.target.value })}
                placeholder="e.g. Senior Researcher"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Goal</label>
              <textarea
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none transition-colors"
                value={(data as any).goal || ''}
                onChange={(e) => updateNodeData(activeNodeId, { goal: e.target.value })}
                placeholder="What does this agent need to achieve?"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Backstory</label>
              <textarea
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none transition-colors"
                value={(data as any).backstory || ''}
                onChange={(e) => updateNodeData(activeNodeId, { backstory: e.target.value })}
                placeholder="The agent's background and expertise..."
              />
            </div>

            {/* -- Tasks Execution Order Ranking -- */}
            <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Execution Order (Tasks)</h3>
              <p className="text-xs text-gray-500 mb-3">
                Drag and drop to rearrange the task priority.
              </p>
              
              {renderableTasks.length === 0 ? (
                <div className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-md text-center border border-gray-100 cursor-not-allowed">
                  Connect tasks to this Agent to see them here.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleTaskDragEnd}
                >
                  <SortableContext
                    items={renderableTasks.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {renderableTasks.map((taskVal) => (
                        <SortableItem 
                          key={taskVal.id} 
                          id={taskVal.id} 
                          name={(taskVal.data as any).name || 'Unnamed Task'} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}

        {type === 'task' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none transition-colors"
                value={(data as any).description || ''}
                onChange={(e) => updateNodeData(activeNodeId, { description: e.target.value })}
                placeholder="What exactly needs to be done?"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Expected Output</label>
              <textarea
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none transition-colors"
                value={(data as any).expected_output || ''}
                onChange={(e) => updateNodeData(activeNodeId, { expected_output: e.target.value })}
                placeholder="What should this task produce?"
              />
            </div>
          </div>
        )}

        {type === 'crew' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Process</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white transition-colors"
                value={(data as any).process || 'sequential'}
                onChange={(e) => updateNodeData(activeNodeId, { process: e.target.value as ProcessType })}
              >
                <option value="sequential">Sequential</option>
                <option value="hierarchical">Hierarchical</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sequential processes execute tasks in order. Hierarchical needs a Manager Agent.
              </p>
            </div>
            
            {/* -- Agents Execution Order Ranking -- */}
            <div className="flex flex-col gap-1.5 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Execution Order (Agents)</h3>
              <p className="text-xs text-gray-500 mb-3">
                Drag and drop to rearrange the execution priority.
              </p>
              
              {renderableAgents.length === 0 ? (
                <div className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-md text-center border border-gray-100 cursor-not-allowed">
                  Connect agents to this Crew to see them here.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleAgentDragEnd}
                >
                  <SortableContext
                    items={renderableAgents.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {renderableAgents.map((agentVal) => (
                        <SortableItem 
                          key={agentVal.id} 
                          id={agentVal.id} 
                          name={(agentVal.data as any).name || 'Unnamed Agent'} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-slate-50 flex gap-3">
        <button
          onClick={() => deleteNode(activeNodeId)}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        <button
          onClick={() => setActiveNode(null)}
          className="flex-1 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
