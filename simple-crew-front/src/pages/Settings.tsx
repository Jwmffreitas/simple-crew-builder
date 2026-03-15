import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Key, 
  Cpu, 
  Eye, 
  EyeOff, 
  Plus,
  Trash2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useStore } from '../store';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { 
    credentials, addCredential, deleteCredential, fetchCredentials,
    defaultModel, setDefaultModel
  } = useStore();

  React.useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const [activeTab, setActiveTab] = useState<'credentials' | 'environment'>('credentials');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCred, setNewCred] = useState({ name: '', description: '', key: '', provider: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCredential = () => {
    if (newCred.name && newCred.key) {
      addCredential(newCred);
      setNewCred({ name: '', description: '', key: '', provider: '' });
      setIsModalOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'openai' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo (OpenAI)', provider: 'openai' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (Anthropic)', provider: 'anthropic' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Anthropic)', provider: 'anthropic' },
  ];

  return (
    <div className="flex h-screen bg-brand-bg font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-card border-r border-brand-border flex flex-col transition-colors">
        <div className="p-6 border-b border-brand-border flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted hover:text-brand-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-brand-text">Settings</span>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('credentials')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'credentials' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'}`}
          >
            <div className="flex items-center gap-3 text-sm font-bold">
              <Key className="w-4 h-4" />
              Credentials
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'credentials' ? 'rotate-90' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('environment')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'environment' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'}`}
          >
            <div className="flex items-center gap-3 text-sm font-bold">
              <Cpu className="w-4 h-4" />
              Environment
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'environment' ? 'rotate-90' : ''}`} />
          </button>
        </nav>

        <div className="p-4 border-t border-brand-border">
          <div className="bg-brand-bg rounded-xl p-4 flex flex-col items-center gap-2 text-center text-[10px] text-brand-muted">
            <ShieldCheck className="w-8 h-8 text-indigo-500 opacity-80" />
            <p>Your credentials stay on your machine (LocalStorage).</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-brand-bg">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'credentials' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex items-center justify-between mb-10">
                <div>
                  <h1 className="text-3xl font-bold text-brand-text tracking-tight mb-2">Credentials</h1>
                  <p className="text-brand-muted text-sm">Manage your API keys for different LLM providers.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  New Credential
                </button>
              </header>

              <div className="space-y-4">
                {credentials.length === 0 ? (
                  <div className="py-20 text-center bg-brand-card border border-brand-border border-dashed rounded-3xl">
                    <Key className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-20" />
                    <p className="text-brand-muted">No credentials found. Create one to get started.</p>
                  </div>
                ) : (
                  credentials.map((cred) => (
                    <div key={cred.id} className="bg-brand-card border border-brand-border rounded-2xl p-6 flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                          <Key className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-brand-text">{cred.name}</h3>
                          <p className="text-xs text-brand-muted line-clamp-1">{cred.description || 'No description'}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-brand-muted bg-brand-bg px-2 py-0.5 rounded-md">
                              <Calendar className="w-3 h-3" />
                              {formatDate(cred.created_at)}
                            </span>
                            {cred.provider && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {cred.provider}
                              </span>
                            )}
                            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-500/70">
                              {showKeys[cred.id] ? cred.key : '••••••••••••••••'}
                              <button onClick={() => toggleShowKey(cred.id)} className="hover:text-indigo-600">
                                {showKeys[cred.id] ? <EyeOff className="w-3 w-3" /> : <Eye className="w-3 w-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => deleteCredential(cred.id)}
                        className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'environment' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-brand-text tracking-tight mb-2">Environment</h1>
                <p className="text-brand-muted text-sm">Global defaults and environment specific settings.</p>
              </header>

              <div className="bg-brand-card border border-brand-border rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                  </div>
                  <label className="text-sm font-bold text-brand-text uppercase tracking-wider">Default Model</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setDefaultModel(model.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${defaultModel === model.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-brand-border hover:border-slate-400 dark:hover:border-slate-500'}`}
                    >
                      <p className="font-bold text-brand-text">{model.name}</p>
                      <p className="text-[10px] text-brand-muted uppercase mt-1 tracking-widest">{model.provider}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal - New Credential */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-text">Add New Credential</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-bg rounded-full text-brand-muted transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Name</label>
                <input 
                  autoFocus
                  placeholder="e.g. OpenAI Production"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                  value={newCred.name}
                  onChange={(e) => setNewCred({...newCred, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Description</label>
                <input 
                  placeholder="Short description of this key"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                  value={newCred.description}
                  onChange={(e) => setNewCred({...newCred, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">API Key</label>
                <div className="relative">
                  <input 
                    type={showKeys['new'] ? 'text' : 'password'}
                    placeholder="sk-..."
                    className="w-full bg-brand-bg border border-brand-border rounded-xl pl-4 pr-16 py-3 text-brand-text outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-mono"
                    value={newCred.key}
                    onChange={(e) => setNewCred({...newCred, key: e.target.value})}
                  />
                  <button 
                    onClick={() => toggleShowKey('new')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
                  >
                    {showKeys['new'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Provider</label>
                <select 
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm font-medium appearance-none"
                  value={newCred.provider}
                  onChange={(e) => setNewCred({...newCred, provider: e.target.value})}
                >
                  <option value="">Select a provider...</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google Gemini</option>
                  <option value="groq">Groq</option>
                  <option value="cohere">Cohere</option>
                  <option value="mistral">Mistral AI</option>
                  <option value="local">Local (Ollama/LM Studio)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-brand-bg border border-brand-border text-brand-text rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!newCred.name || !newCred.key}
                  onClick={handleAddCredential}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Credential
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
