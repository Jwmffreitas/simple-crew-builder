import React, { useState, useRef } from 'react';
import { User, CheckSquare, Users, Save, FolderOpen, Upload } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useStore } from './store';
import type { AppState } from './types';

export function Sidebar() {
  const [crewName, setCrewName] = useState('');
  const savedCrews = useStore((state: AppState) => state.savedCrews);
  const saveCurrentCrew = useStore((state: AppState) => state.saveCurrentCrew);
  const loadCrew = useStore((state: AppState) => state.loadCrew);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();
  const loadProjectJson = useStore((state: AppState) => state.loadProjectJson);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = () => {
    if (crewName.trim()) {
      saveCurrentCrew(crewName);
      setCrewName('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const json = JSON.parse(content);
        const success = loadProjectJson(json);
        if (success) {
          setTimeout(() => fitView({ duration: 800 }), 100);
        }
      } catch (err) {
        console.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-64 bg-slate-50 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Components Palette
        </h2>
        <div className="flex flex-col gap-3">
          <div
            className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-grab hover:shadow-md hover:border-blue-400 transition-all active:cursor-grabbing"
            onDragStart={(event) => onDragStart(event, 'agent')}
            draggable
          >
            <div className="bg-blue-100 p-2 rounded-md">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Agent</span>
          </div>

          <div
            className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-grab hover:shadow-md hover:border-emerald-400 transition-all active:cursor-grabbing"
            onDragStart={(event) => onDragStart(event, 'task')}
            draggable
          >
            <div className="bg-emerald-100 p-2 rounded-md">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Task</span>
          </div>

          <div
            className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-grab hover:shadow-md hover:border-violet-400 transition-all active:cursor-grabbing"
            onDragStart={(event) => onDragStart(event, 'crew')}
            draggable
          >
            <div className="bg-violet-100 p-2 rounded-md">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Crew</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          My Crews
        </h2>
        
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Crew name..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={!crewName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Current Crew
            </button>
            <div className="relative mt-2 pt-4 border-t border-gray-200">
              <input 
                type="file" 
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Import Config
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {savedCrews.length === 0 ? (
            <div className="text-center py-4 bg-white border border-dashed border-gray-300 rounded-lg">
              <p className="text-xs text-gray-400">No saved crews yet</p>
            </div>
          ) : (
            savedCrews.map((crew) => (
              <div 
                key={crew.id}
                className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 truncate" title={crew.name}>
                    {crew.name}
                  </span>
                  <button
                    onClick={() => loadCrew(crew.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                    title="Load Crew"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>{crew.nodes.length} nodes</span>
                  <span>&bull;</span>
                  <span>{crew.edges.length} edges</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">Drag items to the canvas to start building.</p>
      </div>
    </div>
  );
}
