import React, { useEffect, useState } from 'react';
import { 
  X, 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  FileText, 
  Code, 
  Search,
  RefreshCw,
  Archive,
  Upload,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import type { WorkspaceFile } from '../types';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import { ConfirmationModal } from './ConfirmationModal';

interface FileTreeItemProps {
  item: WorkspaceFile;
  level: number;
  onFileSelect: (path: string) => void;
  onFolderZip: (path: string) => void;
  onDelete: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, item: WorkspaceFile) => void;
  selectedPath: string | null;
  searchTerm: string;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ item, level, onFileSelect, onFolderZip, onDelete, onContextMenu, selectedPath, searchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPath === item.path;
  
  // Auto-expand if searching
  useEffect(() => {
    if (item.is_dir && item.children && item.children.length > 0) {
      // In a real search implementation, we might want more complex logic, 
      // but for this recursive filter, if the item is in the list, it's because it or a child matched.
      // We can't easily know here if we should open, but we can check if searchTerm is active.
    }
  }, []);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.is_dir) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(item.path);
    }
  };

  const getIcon = () => {
    if (item.is_dir) {
      return isOpen ? <ChevronDown className="w-4 h-4 text-brand-muted" /> : <ChevronRight className="w-4 h-4 text-brand-muted" />;
    }
    const ext = item.name.split('.').pop()?.toLowerCase();
    if (['py', 'js', 'ts', 'json', 'html', 'css', 'md'].includes(ext || '')) {
      return <Code className="w-4 h-4 text-indigo-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="select-none">
      <div 
        onClick={toggleOpen}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200 group ${
          isSelected 
            ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' 
            : 'hover:bg-brand-bg/50 text-brand-muted hover:text-brand-text border border-transparent'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onContextMenu={(e) => onContextMenu(e, item)}
      >
        <span className="shrink-0">{getIcon()}</span>
        {item.is_dir && <Folder className="w-4 h-4 text-amber-500/80 shrink-0" />}
        <span className={`text-xs truncate flex-1 ${isSelected ? 'font-bold' : 'font-medium'}`}>
          {item.name}
        </span>
        
        {item.is_dir && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFolderZip(item.path);
            }}
            className="p-1 hover:bg-brand-bg rounded-md opacity-0 group-hover:opacity-100 transition-all text-brand-muted hover:text-indigo-500"
            title="Download folder as ZIP"
          >
            <Archive className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.path);
          }}
          className="p-1 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all text-brand-muted hover:text-red-500"
          title={`Delete ${item.is_dir ? 'folder' : 'file'}`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      
      {(isOpen || (searchTerm.trim() !== '' && item.is_dir && (item.children?.length ?? 0) > 0)) && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {(item.children || []).map((child, idx) => (
            <FileTreeItem 
              key={`${child.path}-${idx}`} 
              item={child} 
              level={level + 1} 
              onFileSelect={onFileSelect}
              onFolderZip={onFolderZip}
              onDelete={onDelete}
              onContextMenu={onContextMenu}
              selectedPath={selectedPath}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function WorkspaceExplorer() {
  const isExplorerOpen = useStore((state) => state.isExplorerOpen);
  const setIsExplorerOpen = useStore((state) => state.setIsExplorerOpen);
  const currentWsId = useStore((state) => state.currentExplorerWsId);
  const fetchFiles = useStore((state) => state.fetchWorkspaceFiles);
  const fetchContent = useStore((state) => state.fetchFileContent);
  const downloadZip = useStore((state) => state.downloadWorkspaceZip);
  const uploadFiles = useStore((state) => state.uploadWorkspaceFiles);
  const deleteFile = useStore((state) => state.deleteWorkspaceFile);
  const workspaces = useStore((state) => state.workspaces);

  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pathToExclude, setPathToExclude] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: WorkspaceFile } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const workspace = workspaces.find(w => w.id === currentWsId);

  useEffect(() => {
    if (isExplorerOpen && currentWsId) {
      loadFiles();
      setSelectedPath(null);
      setContent(null);
    }
  }, [isExplorerOpen, currentWsId]);

  useEffect(() => {
    if (content) {
      Prism.highlightAll();
    }
  }, [content]);

  const loadFiles = async () => {
    if (!currentWsId) return;
    setIsLoading(true);
    const data = await fetchFiles(currentWsId);
    setFiles(data);
    setIsLoading(false);
  };

  const handleFileSelect = async (path: string) => {
    if (!currentWsId) return;
    setSelectedPath(path);
    setIsContentLoading(true);
    const text = await fetchContent(currentWsId, path);
    setContent(text);
    setIsContentLoading(false);
  };

  const handleDownload = () => {
    if (!content || !selectedPath) return;
    const filename = selectedPath.split('/').pop() || 'file';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!currentWsId || !selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await uploadFiles(currentWsId, selectedFiles);
      await loadFiles();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      // Reset input
      if (event.target) event.target.value = '';
    }
  };

  const handleDelete = (path: string) => {
    setPathToExclude(path);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentWsId || !pathToExclude) return;

    try {
      await deleteFile(currentWsId, pathToExclude);
      if (selectedPath === pathToExclude) {
        setSelectedPath(null);
        setContent(null);
      }
      await loadFiles();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleteModalOpen(false);
      setPathToExclude(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: WorkspaceFile) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick, true);
    window.addEventListener('contextmenu', handleClick, true);
    return () => {
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('contextmenu', handleClick, true);
    };
  }, []);

  const copyRelativePath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success('Path copied to clipboard');
  };

  const filterFiles = (fileList: WorkspaceFile[]): WorkspaceFile[] => {
    if (!searchTerm.trim()) return fileList;
    
    return fileList
      .map(file => {
        // Se for diretório, filtra os filhos primeiro
        if (file.is_dir && file.children) {
          const filteredChildren = filterFiles(file.children);
          // Se tiver filhos que batem com a busca, mantém o diretório e seus filhos filtrados
          if (filteredChildren.length > 0) {
            return { ...file, children: filteredChildren };
          }
        }
        
        // Se o nome do arquivo/pasta bate com a busca, mantém
        if (file.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return file;
        }
        
        return null;
      })
      .filter((file): file is WorkspaceFile => file !== null);
  };

  const filteredDocs = filterFiles(files);

  if (!isExplorerOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => setIsExplorerOpen(false)}
      />
      
      {/* Modal Container */}
      <div className="relative w-full h-full max-w-6xl bg-brand-card border border-brand-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="h-16 border-b border-brand-border px-6 flex items-center justify-between bg-brand-bg/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Folder className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-text truncate">
                {workspace?.name || 'Workspace Explorer'}
              </h2>
              <p className="text-[10px] text-brand-muted italic truncate opacity-70">
                {workspace?.path}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => currentWsId && downloadZip(currentWsId, "")}
              className="p-2 hover:bg-indigo-500/10 rounded-xl text-brand-muted hover:text-indigo-400 transition-all active:scale-95"
              title="Download Full Workspace ZIP"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button 
              onClick={loadFiles}
              className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted transition-all active:scale-95"
              title="Refresh Files"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsExplorerOpen(false)}
              className="p-2 hover:bg-red-500/10 rounded-xl text-brand-muted hover:text-red-500 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar: File Tree */}
          <div className="w-72 border-r border-brand-border flex flex-col bg-brand-bg/10">
            <div className="p-4 border-b border-brand-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
                <input 
                  type="text" 
                  placeholder="Filter files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-brand-card border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-brand-text outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-brand-bg/50 hover:bg-brand-bg border border-brand-border rounded-xl text-[10px] font-bold text-brand-text transition-all active:scale-95 disabled:opacity-50"
                  title="Upload Files"
                >
                  <Plus className="w-3 h-3 text-indigo-500" />
                  Files
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-brand-bg/50 hover:bg-brand-bg border border-brand-border rounded-xl text-[10px] font-bold text-brand-text transition-all active:scale-95 disabled:opacity-50"
                  title="Upload Folder"
                >
                  <Upload className="w-3 h-3 text-indigo-500" />
                  Folder
                </button>
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                multiple
                className="hidden"
              />
              <input
                type="file"
                ref={folderInputRef}
                onChange={handleUpload}
                {...{ webkitdirectory: "", directory: "" } as any}
                className="hidden"
              />

              {isUploading && (
                <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                  <span className="text-[9px] font-bold text-indigo-400">Uploading...</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-3 opacity-50">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Loading Directory...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <p className="text-xs text-brand-muted italic">This workspace is empty.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredDocs.map((file, idx) => (
                    <FileTreeItem 
                      key={`${file.path}-${idx}`} 
                      item={file} 
                      level={0} 
                      onFileSelect={handleFileSelect}
                      onFolderZip={(path) => currentWsId && downloadZip(currentWsId, path)}
                      onDelete={handleDelete}
                      onContextMenu={handleContextMenu}
                      selectedPath={selectedPath}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content: File Viewer */}
          <div className="flex-1 bg-brand-bg/5 flex flex-col min-w-0">
            {selectedPath ? (
              <>
                {/* Viewer Header */}
                <div className="h-12 border-b border-brand-border px-4 flex items-center justify-between bg-brand-card/50">
                   <div className="flex items-center gap-2 truncate">
                     <FileText className="w-4 h-4 text-indigo-400" />
                     <span className="text-xs font-medium text-brand-text truncate">{selectedPath}</span>
                   </div>
                   <button 
                     onClick={handleDownload}
                     className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                   >
                     <Download className="w-3 h-3" />
                     Download
                   </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-[#1e1e1e] group relative">
                  {isContentLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10">
                      <RefreshCw className="w-8 h-8 animate-spin text-white/20" />
                    </div>
                  ) : null}
                  
                  <pre className="p-6 m-0 text-xs font-mono !bg-transparent">
                    <code className={`language-${selectedPath.split('.').pop() || 'text'}`}>
                      {content}
                    </code>
                  </pre>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
                <div className="w-20 h-20 rounded-3xl bg-brand-border/20 flex items-center justify-center mb-6 border-2 border-dashed border-brand-border">
                  <File className="w-10 h-10 text-brand-muted" />
                </div>
                <h3 className="text-lg font-bold text-brand-text mb-2">No file selected</h3>
                <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
                  Select a file from the sidebar to view its content and download it.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${pathToExclude}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[200] bg-brand-card border border-brand-border rounded-xl shadow-2xl py-1.5 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.item.is_dir && (
            <button 
              onClick={() => {
                currentWsId && downloadZip(currentWsId, contextMenu.item.path);
                closeContextMenu();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-brand-text hover:bg-brand-bg/80 transition-all text-left"
            >
              <Archive className="w-3.5 h-3.5 text-indigo-400" />
              Download ZIP
            </button>
          )}
          {!contextMenu.item.is_dir && (
            <button 
              onClick={async () => {
                await handleFileSelect(contextMenu.item.path);
                handleDownload();
                closeContextMenu();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-brand-text hover:bg-brand-bg/80 transition-all text-left"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Download File
            </button>
          )}
          <button 
            onClick={() => {
              copyRelativePath(contextMenu.item.path);
              closeContextMenu();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-brand-text hover:bg-brand-bg/80 transition-all text-left"
          >
            <Copy className="w-3.5 h-3.5 text-brand-muted" />
            Copy Relative Path
          </button>
          <div className="h-px bg-brand-border my-1" />
          <button 
            onClick={() => {
              handleDelete(contextMenu.item.path);
              closeContextMenu();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
