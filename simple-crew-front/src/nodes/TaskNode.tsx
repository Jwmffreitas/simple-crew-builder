import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { CheckSquare, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import type { TaskNodeData } from '../types';

export function TaskNode({ id, data }: NodeProps<Node<TaskNodeData, 'task'>>) {
  const deleteNode = useStore((state) => state.deleteNode);
  const status = useStore((state) => state.nodeStatuses[id] || 'idle');
  const errors = useStore((state) => state.nodeErrors[id]);

  const statusClasses = errors?.length
    ? 'ring-2 ring-red-400 ring-offset-2'
    : status === 'running'
    ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse'
    : status === 'success'
    ? 'ring-2 ring-green-500 ring-offset-2'
    : 'hover:ring-2 hover:ring-emerald-400';

  return (
    <div className={`group relative bg-white rounded-xl shadow-md border border-gray-200 w-56 overflow-visible transition-all cursor-pointer ${statusClasses}`}>
      
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

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 flex items-center gap-2 rounded-t-xl">
        <CheckSquare className="w-4 h-4 text-white" />
        <h3 className="text-white text-sm font-medium truncate flex-1">
          {data.name || 'New Task'}
        </h3>

        {errors?.length > 0 && (
          <div title={errors.join('\n')} className="text-red-200 hover:text-white cursor-help transition-colors">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white/70 hover:text-white"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3">
        <p className="text-xs text-gray-500 line-clamp-2" title={data.description}>
          {data.description || 'No description defined'}
        </p>
      </div>

      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 bg-gray-400 border-none hover:bg-emerald-500 transition-colors" />
      <Handle type="target" position={Position.Right} id="right" className="w-2 h-2 bg-gray-400 border-none hover:bg-emerald-500 transition-colors" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="w-2 h-2 bg-gray-400 border-none hover:bg-emerald-500 transition-colors" />
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 bg-gray-400 border-none hover:bg-emerald-500 transition-colors" />
    </div>
  );
}
