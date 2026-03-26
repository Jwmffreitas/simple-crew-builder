import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useShallow } from 'zustand/shallow';
import { Webhook, Trash2, Settings, Copy } from 'lucide-react';
import { useStore } from '../store';
import type { WebhookNodeData } from '../types';

export const WebhookNode = memo(({ id, data }: NodeProps<Node<WebhookNodeData, 'webhook'>>) => {
  const { deleteNode, setActiveNode, webhookConfig } = useStore(
    useShallow((state) => ({
      deleteNode: state.deleteNode,
      setActiveNode: state.setActiveNode,
      webhookConfig: state.webhookConfig,
    }))
  );

  const isActive = webhookConfig?.is_active ?? false;
  const webhookUrl = webhookConfig?.url ?? null;

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
    }
  };

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md dark:shadow-none border border-slate-200 dark:border-slate-700 w-48 overflow-visible transition-colors transition-shadow duration-300 cursor-pointer hover:ring-2 hover:ring-orange-400"
      onClick={() => setActiveNode(id)}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 flex items-center gap-2 rounded-t-xl relative">
        <Webhook className="w-4 h-4 text-white" />
        <h3 className="text-white text-sm font-medium truncate flex-1 cursor-text">
          {data.name || 'Webhook Trigger'}
        </h3>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
            className="p-1 rounded hover:bg-white/20 transition-colors text-white/70 hover:text-white nodrag"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setActiveNode(id); }}
            className="p-1 rounded hover:bg-white/20 transition-colors text-white/70 hover:text-white nodrag"
            title="Config Node"
            aria-label="Config Node"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2 line-clamp-2">
          {data.description || 'Trigger this Crew via HTTP POST.'}
        </p>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className={`w-2 h-2 rounded-full ${webhookUrl ? (isActive ? 'bg-green-500' : 'bg-slate-400') : 'bg-slate-300'}`}
          />
          <span className="text-[10px] text-slate-400 font-mono truncate">
            {webhookUrl
              ? `…/trigger/${webhookConfig?.webhook_id?.slice(0, 8)}…`
              : 'URL pending save'}
          </span>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-lg transition-colors nodrag"
          onClick={handleCopyUrl}
          disabled={!webhookUrl}
          title={webhookUrl ? 'Copy webhook URL' : 'Save project to generate URL'}
        >
          <Copy className="w-3.5 h-3.5" />
          {webhookUrl ? 'Copy URL' : 'Save to get URL'}
        </button>
      </div>

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-2 h-2 bg-gray-400 border-none hover:bg-orange-500 transition-colors"
      />
    </div>
  );
});
