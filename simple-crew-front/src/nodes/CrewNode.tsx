import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Users, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import type { CrewNodeData } from '../types';

export function CrewNode({ id, data }: NodeProps<Node<CrewNodeData, 'crew'>>) {
  const deleteNode = useStore((state) => state.deleteNode);
  const toggleCollapse = useStore((state) => state.toggleCollapse);
  const edges = useStore((state) => state.edges);
  const status = useStore((state) => state.nodeStatuses[id] || 'idle');
  const errors = useStore((state) => state.nodeErrors[id]);

  const childCount = edges.filter((edge) => edge.source === id).length;

  const statusClasses = errors?.length
    ? 'ring-2 ring-red-400 ring-offset-2'
    : status === 'running'
    ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse'
    : status === 'success'
    ? 'ring-2 ring-green-500 ring-offset-2'
    : 'hover:ring-2 hover:ring-violet-400';

  return (
    <div className={`group relative bg-white rounded-xl shadow-md border border-gray-200 w-48 overflow-visible transition-all cursor-pointer ${statusClasses}`}>
      
      {status === 'running' && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md z-20">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      )}
      {status === 'success' && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md z-20">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      )}

      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-2 flex items-center gap-2 rounded-t-xl">
        <Users className="w-4 h-4 text-white" />
        <h3 className="text-white text-sm font-medium truncate flex-1">
          Crew
        </h3>

        {errors?.length > 0 && (
          <div title={errors.join('\n')} className="text-red-200 hover:text-white cursor-help transition-colors">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white/70 hover:text-white"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-center bg-gray-50 border border-gray-100 px-2 py-1.5 rounded-md">
          <span className="text-xs font-semibold text-gray-500 uppercase">Process:</span>
          <span className="text-xs text-gray-700 capitalize font-medium">
            {data.process}
          </span>
        </div>
        
        {/* Container flexível para os Metadados (Escalável) */}
        {childCount > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-200/60 shadow-sm">
              <Users className="w-3.5 h-3.5 text-violet-500" />
              <span className="font-medium">
                {childCount} {childCount === 1 ? 'Agent' : 'Agents'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse/Expand toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
        className="absolute -bottom-3 right-4 bg-white border border-gray-200 rounded-full p-0.5 cursor-pointer hover:bg-gray-50 shadow-sm z-10 transition-colors text-gray-400 hover:text-violet-500"
        title={data.isCollapsed ? 'Expand children' : 'Collapse children'}
      >
        {data.isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      <Handle type="source" position={Position.Top} id="top" className="w-2 h-2 bg-gray-400 border-none hover:bg-violet-500 transition-colors" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 bg-gray-400 border-none hover:bg-violet-500 transition-colors" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 bg-gray-400 border-none hover:bg-violet-500 transition-colors" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 bg-gray-400 border-none hover:bg-violet-500 transition-colors" />
    </div>
  );
}
