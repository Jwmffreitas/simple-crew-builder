import React, { useState, useRef } from 'react';
import { User, CheckSquare, Users, Save, FolderOpen, Upload, Trash2, Loader2, Settings } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useStore } from './store';

export function Sidebar() {
  const [crewName, setCrewName] = useState('');
  const savedProjects = useStore((state) => state.savedProjects);
  const saveProject = useStore((state) => state.saveProject);
  const loadProject = useStore((state) => state.loadProject);
  const deleteProject = useStore((state) => state.deleteProject);
  const isSaving = useStore((state) => state.isSaving);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();
  const loadProjectJson = useStore((state) => state.loadProjectJson);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = async () => {
    if (crewName.trim()) {
      await saveProject(crewName);
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
    <div className="w-64 bg-brand-card border-r border-brand-border h-full flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-brand-border h-16 flex items-center">
        <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
          Components
        </h2>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-3">
          <div
            className="bg-brand-card border border-brand-border rounded-lg p-3 flex items-center gap-3 cursor-grab hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all active:cursor-grabbing"
            onDragStart={(event) => onDragStart(event, 'agent')}
            draggable
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-brand-text">Agent</span>
          </div>

          <div
            className="bg-brand-card border border-brand-border rounded-lg p-3 flex items-center gap-3 cursor-grab hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all active:cursor-grabbing"
            onDragStart={(event) => onDragStart(event, 'task')}
            draggable
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-md">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-brand-text">Task</span>
          </div>

          <div
            className="bg-brand-card border border-brand-border rounded-lg p-3 flex items-center gap-3 cursor-grab hover:shadow-md hover:border-violet-400 dark:hover:border-violet-500 transition-all active:cursor-grabbing"
            onDragStart={(event) => onDragStart(event, 'crew')}
            draggable
          >
            <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-md">
              <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-sm font-medium text-brand-text">Crew</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 border-t border-brand-border">
        <h2 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-4">
          Library
        </h2>

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Crew name..."
              className="w-full border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !crewName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 duration-75"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Current Crew'}
            </button>
            <div className="relative mt-2 pt-4 border-t border-brand-border">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-brand-card hover:bg-brand-bg text-brand-text border border-brand-border px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                Import Config
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {savedProjects.length === 0 ? (
            <div className="text-center py-4 bg-white border border-dashed border-gray-300 rounded-lg">
              <p className="text-xs text-gray-400">No saved projects yet</p>
            </div>
          ) : (
            savedProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-brand-card border border-brand-border rounded-lg p-3 flex flex-col gap-2 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-text truncate max-w-[120px]" title={project.name}>
                    {project.name}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => loadProject(project.id)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Load Project"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deletar projeto "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center justify-between">
                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">{project.canvas_data.nodes.length} nodes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-brand-border bg-brand-bg/50">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-brand-muted hover:bg-brand-card hover:text-brand-text transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <p className="text-[10px] text-brand-muted mt-3 text-center opacity-60">Drag items to the canvas to start building.</p>
      </div>
    </div>
  );
}
