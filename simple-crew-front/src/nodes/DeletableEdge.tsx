import { useState, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useStore } from '../store';
import type { NodeStatus } from '../types';

export function DeletableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const deleteEdge = useStore((state) => state.deleteEdge);
  const [hovered, setHovered] = useState(false);

  // Seletor granular para os status dos nós conectados
  const { sourceStatus, targetStatus } = useStore(
    useShallow((state) => ({
      sourceStatus: (state.nodeStatuses[source] as NodeStatus) || 'idle',
      targetStatus: (state.nodeStatuses[target] as NodeStatus) || 'idle',
    }))
  );

  // Lógica de estilização otimizada dentro do componente
  const edgeStyle = useMemo(() => {
    const isRunning = sourceStatus === 'running' || targetStatus === 'running';
    const isSuccess = sourceStatus === 'success' && targetStatus === 'success';

    let strokeColor = '#94a3b8';
    if (isRunning) strokeColor = '#3b82f6';
    else if (isSuccess) strokeColor = '#10b981';

    return {
      ...style,
      stroke: strokeColor,
      strokeWidth: isRunning ? 3 : 2,
      transition: 'stroke 0.5s ease, stroke-width 0.5s ease',
    };
  }, [sourceStatus, targetStatus, style]);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="transition-all cursor-pointer"
      />
      <EdgeLabelRenderer>
        {hovered && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <button
              onClick={(event) => {
                event.stopPropagation();
                deleteEdge(id);
              }}
              className="bg-white border border-gray-200 shadow-sm rounded p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center pointer-events-auto"
              title="Delete connection"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
