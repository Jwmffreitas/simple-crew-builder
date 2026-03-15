import { X, Moon, Sun, Bell, Shield, Info } from 'lucide-react';
import { useStore } from '../store';

export function SettingsDrawer() {
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setIsSettingsOpen = useStore((state) => state.setIsSettingsOpen);
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsSettingsOpen(false)}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-brand-card shadow-2xl border-l border-brand-border flex flex-col transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-bg/50 transition-colors">
          <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
            Settings
          </h2>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Appearance Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
              Appearance
            </h3>
            <div className="bg-brand-bg rounded-2xl border border-brand-border p-5 transition-colors">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-brand-card rounded-xl border border-brand-border text-brand-text transition-all shadow-sm">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-text">System Theme</p>
                    <p className="text-[11px] text-brand-muted">Switch between light and dark mode</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border transition-all duration-300 ${
                    theme === 'light' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95' 
                      : 'bg-brand-card border-brand-border text-brand-muted hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95' 
                      : 'bg-brand-card border-brand-border text-brand-muted hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>
          </section>

          {/* General Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
              General
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-brand-bg transition-all text-brand-muted hover:text-brand-text group">
                <div className="flex items-center gap-4">
                  <Bell className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                  <span className="text-sm font-bold">Notifications</span>
                </div>
                <Info className="w-4 h-4 opacity-30" />
              </button>
              <button className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-brand-bg transition-all text-brand-muted hover:text-brand-text group">
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                  <span className="text-sm font-bold">Privacy & Security</span>
                </div>
                <Info className="w-4 h-4 opacity-30" />
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-border bg-brand-bg/50 flex flex-col items-center gap-3 transition-colors">
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">SimpleCrew Builder v1.0.0</p>
          <div className="flex gap-6">
             <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Support</button>
             <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Documentation</button>
          </div>
        </div>
      </div>
    </div>
  );
}
