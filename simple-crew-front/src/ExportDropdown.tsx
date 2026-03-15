import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FileJson, Code2 } from 'lucide-react';
import { useStore } from './store';

export function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exportProjectJson = useStore((state) => state.exportProjectJson);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
      >
        Export Code
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="py-1">
            <button
              onClick={() => {
                exportProjectJson();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
            >
              <FileJson className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">SimpleCrew Config</span>
                <span className="text-xs text-gray-400">Download config JSON</span>
              </div>
            </button>
            <button
              disabled
              className="w-full text-left px-4 py-3 text-sm text-gray-400 flex items-center gap-3 opacity-60 cursor-not-allowed border-t border-gray-50"
            >
              <Code2 className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">Python Code</span>
                <span className="text-xs bg-gray-100 px-1 inline-block rounded w-fit mt-0.5">Coming Soon</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
