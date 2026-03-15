import React, { useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Sparkles } from 'lucide-react';

import { useStore } from './store';
import { AgentNode } from './nodes/AgentNode';
import { TaskNode } from './nodes/TaskNode';
import { CrewNode } from './nodes/CrewNode';
import { Sidebar } from './Sidebar';

import { NodeConfigDrawer } from './NodeConfigDrawer';
import { DeletableEdge } from './nodes/DeletableEdge';
import { ExportDropdown } from './ExportDropdown';
import { Toast } from './Toast';
import { ConsoleDrawer } from './ConsoleDrawer';

const nodeTypes = {
  agent: AgentNode,
  task: TaskNode,
  crew: CrewNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

const getId = () => `dndnode_${crypto.randomUUID()}`;

function FlowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const setActiveNode = useStore((state) => state.setActiveNode);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const addNode = useStore((state) => state.addNode);
  
  const isExecuting = useStore((state) => state.isExecuting);
  const startRealExecution = useStore((state) => state.startRealExecution);
  const executionResult = useStore((state) => state.executionResult);
  const setIsConsoleExpanded = useStore((state) => state.setIsConsoleExpanded);
  const setIsConsoleOpen = useStore((state) => state.setIsConsoleOpen);
  const nodeStatuses = useStore((state) => state.nodeStatuses);

  const validateGraph = useStore((state) => state.validateGraph);
  const showNotification = useStore((state) => state.showNotification);

  const handleRunCrew = () => {
    if (!validateGraph()) {
      showNotification("Existem erros no seu fluxo. Corrija os nós marcados em vermelho antes de prosseguir.", "error");
      return;
    }
    showNotification("Simulação iniciada com sucesso. Acompanhe a execução.", "info");
    startRealExecution();
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate position of the drop
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Default data setup depending on the node type
      let data = {};
      const timestamp = Date.now().toString().slice(-4);
      if (type === 'agent') {
        data = { name: `Novo Agente ${timestamp}`, role: '', goal: '', backstory: '', isCollapsed: false };
      } else if (type === 'task') {
        data = { name: `Nova Tarefa ${timestamp}`, description: '', expected_output: '' };
      } else if (type === 'crew') {
        data = { process: 'sequential', isCollapsed: false };
      }

      const newNode = {
        id: getId(),
        type,
        position,
        data,
      };

      addNode(newNode as any);
      validateGraph(); // Valida instantaneamente nodes quebrados (como falta de conexão)
    },
    [screenToFlowPosition, addNode, validateGraph],
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setActiveNode(node.id);
    },
    [setActiveNode]
  );
  
  const edgesWithAnimation = edges.map(e => {
    const sourceStatus = nodeStatuses[e.source];
    const targetStatus = nodeStatuses[e.target];
    
    const isRunning = sourceStatus === 'running' || targetStatus === 'running';
    const isSuccess = sourceStatus === 'success' && targetStatus === 'success';

    let strokeColor = '#94a3b8'; // Default Idle (Gray)
    if (isRunning) strokeColor = '#3b82f6'; // Running (Blue)
    else if (isSuccess) strokeColor = '#10b981'; // Success (Green)

    return {
      ...e,
      animated: true,
      style: {
        ...e.style,
        stroke: strokeColor,
        strokeWidth: isRunning ? 3 : 2,
        transition: 'stroke 0.5s ease, stroke-width 0.5s ease'
      }
    };
  });

  return (
    <div className="w-screen h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">SimpleCrew <span className="text-gray-400 font-normal">Builder</span></h1>
        </div>
        <div className="flex items-center gap-3">
          {executionResult && (
            <button 
              onClick={() => {
                setIsConsoleOpen(true);
                setIsConsoleExpanded(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors shadow-sm border border-amber-200"
            >
              <Sparkles className="w-4 h-4" />
              View Last Result
            </button>
          )}
          <button 
            onClick={handleRunCrew}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
              isExecuting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {isExecuting ? 'Running...' : 'Run Crew'}
          </button>
          <ExportDropdown />
        </div>
      </header>
      
      <div className="flex-1 w-full h-full flex flex-row relative">
        <Sidebar />
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edgesWithAnimation}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            minZoom={0.2}
            maxZoom={4}
            defaultEdgeOptions={{ 
              type: 'deletable',
              style: { strokeWidth: 2, stroke: '#94a3b8' },
              animated: true
            }}
          >
            <Background gap={16} size={1} color="#cbd5e1" />
            <Controls className="bg-white border-gray-200 shadow-sm rounded-lg mb-4 ml-4" />
            <MiniMap 
              className="bg-white border-gray-200 shadow-sm rounded-lg overflow-hidden mb-4 mr-4"
              zoomable 
              pannable 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'agent': return '#3b82f6';
                  case 'task': return '#10b981';
                  case 'crew': return '#8b5cf6';
                  default: return '#e2e8f0';
                }
              }} 
            />
          </ReactFlow>
        </div>
        <NodeConfigDrawer />
        <ConsoleDrawer />
        <Toast />
      </div>
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}

export default App;
