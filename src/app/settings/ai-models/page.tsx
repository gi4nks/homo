'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAppSettings, updateAppSettings } from '@/app/actions/ai.actions';
import { AIProvider } from '@prisma/client';
import {
  Save, Server, Cpu, CheckCircle2, ArrowLeft, Terminal,
  ShieldCheck, Info, Zap, Brain, Sparkles, Network, Activity,
  Globe, Lock, Layers, Code, Timer
} from 'lucide-react';
import Link from 'next/link';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

const PROVIDERS = [
  { 
    id: 'GOOGLE', 
    name: 'Google Gemini', 
    icon: <Zap size={16} />,
    description: 'Ultra-fast, massive context windows.',
    vibe: 'Speed & Logic',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', context: '1M tokens', strength: 'Speed' },
      { id: 'gemini-2.5.flash-lite', name: 'Gemini 2.5 Flash Lite', context: '1M tokens', strength: 'Efficiency' },
      { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', context: '2M tokens', strength: 'State-of-the-art' }
    ], 
    placeholder: 'gemini-2.5-flash' 
  },
  { 
    id: 'OPENAI', 
    name: 'OpenAI GPT', 
    icon: <Brain size={16} />,
    description: 'Industry standard reasoning.',
    vibe: 'Intelligence & Consistency',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', context: '128k tokens', strength: 'Multimodal' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context: '128k tokens', strength: 'Fast & Cheap' },
      { id: 'o1-preview', name: 'O1 Preview', context: '128k tokens', strength: 'Deep Reasoning' }
    ], 
    placeholder: 'gpt-4o' 
  },
  { 
    id: 'ANTHROPIC', 
    name: 'Anthropic Claude', 
    icon: <Sparkles size={16} />,
    description: 'Superior literary nuance and safety.',
    vibe: 'Prose & Nuance',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', context: '200k tokens', strength: 'Writing Expert' },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', context: '200k tokens', strength: 'Pure IQ' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', context: '200k tokens', strength: 'Instant' }
    ], 
    placeholder: 'claude-sonnet-4-6' 
  }
];

export default function AiModelsSettings() {
  const [activeProvider, setActiveProvider] = useState<AIProvider>('GOOGLE');
  const [activeModelName, setActiveModelName] = useState('gemini-2.5-flash');
  const [rateLimitGenerate, setRateLimitGenerate] = useState(20);
  const [rateLimitRewrite, setRateLimitRewrite] = useState(30);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveStatus] = useState(false);
  const setAiEngine = useWorkspaceStore(state => state.setAiEngine);

  useEffect(() => {
    getAppSettings().then(settings => {
      setActiveProvider(settings.activeProvider as AIProvider);
      setActiveModelName(settings.activeModelName);
      setRateLimitGenerate(settings.rateLimitGenerate || 20);
      setRateLimitRewrite(settings.rateLimitRewrite || 30);
    });
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateAppSettings({
        activeProvider,
        activeModelName,
        rateLimitGenerate,
        rateLimitRewrite
      });
      if (res.success) {
        setSaveStatus(true);
        setAiEngine(activeProvider, activeModelName);
        setTimeout(() => setSaveStatus(false), 3000);
      } else {
        alert(res.error);
      }
    });
  };

  const selectedProvider = PROVIDERS.find(p => p.id === activeProvider) || PROVIDERS[0];
  const selectedModel = selectedProvider.models.find(m => m.id === activeModelName);

  return (
    <div className="p-12 w-full flex flex-col h-full space-y-8 overflow-hidden">
      
      {/* HARMONIZED PAGE HEADER */}
      <header className="flex justify-between items-center w-full shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase leading-none">AI Engine Config</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Routing & Infrastructure Management</p>
        </div>
      </header>

      <div className="flex-1 flex flex-row gap-8 w-full min-h-0">
        
        {/* MAIN PANEL (Mirrors Prompt Editor) */}
        <main className="flex-1 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col h-full overflow-hidden min-w-0">
          
          {/* ACTION BAR (Mirrors Prompt Editor Header) */}
          <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} className="text-primary opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Engine Protocol</span>
            </div>
            
            <div className="flex items-center gap-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-success animate-in fade-in duration-300">
                  <CheckCircle2 size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                </div>
              )}
              <button 
                className={`btn btn-primary btn-xs rounded-md font-black uppercase tracking-widest text-[9px] gap-2 px-8 shadow-xl shadow-primary/20 ${isPending ? 'loading' : 'hover:scale-[1.02]'}`}
                onClick={handleSave}
                disabled={isPending}
              >
                <Save size={12} /> Commit AI Profile
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
            
            {/* PROVIDER SECTION */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <Terminal size={14} /> &gt;_ ACTIVE PROVIDER SETTINGS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProvider(p.id as AIProvider);
                      setActiveModelName(p.models[0].id);
                    }}
                    className={`group relative flex flex-col items-start text-left p-5 rounded-xl border transition-all duration-300 ${
                      activeProvider === p.id 
                        ? `bg-base-100 border-primary shadow-md ring-4 ring-primary/5` 
                        : 'bg-base-200/20 border-base-300 hover:border-base-content/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mb-3 ${p.bgColor} ${p.color}`}>
                      {p.icon}
                    </div>
                    <h4 className="font-bold uppercase tracking-tight text-xs mb-1">{p.name}</h4>
                    <p className="text-[9px] font-medium opacity-40 uppercase tracking-tighter leading-tight mb-4">{p.description}</p>
                    
                    <div className={`mt-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      activeProvider === p.id ? 'bg-primary text-primary-content' : 'bg-base-300 opacity-40'
                    }`}>
                      {activeProvider === p.id ? 'Active' : 'Select'}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* MODEL SECTION */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
                <Cpu size={14} /> CONTEXTUAL INTELLIGENCE (MODEL)
              </h3>
              
              <div className="bg-base-200/20 border border-base-300 rounded-xl p-8 shadow-inner space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Predefined Model Clusters</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.models.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setActiveModelName(m.id)}
                        className={`px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest border transition-all ${
                          activeModelName === m.id 
                            ? 'bg-secondary text-secondary-content border-secondary shadow-md' 
                            : 'bg-base-100 border-base-300 opacity-60 hover:opacity-100 hover:border-secondary/40'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveModelName('custom')}
                      className={`px-4 py-2 rounded-md font-black text-[10px] uppercase tracking-widest border border-dashed transition-all ${
                        activeModelName === 'custom'
                          ? 'bg-base-content text-base-100 border-base-content shadow-md'
                          : 'bg-base-100 border-base-300 opacity-40 hover:opacity-100'
                      }`}
                    >
                      Custom String
                    </button>
                  </div>
                </div>

                {(activeModelName === 'custom' || !selectedProvider.models.some(m => m.id === activeModelName)) && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200 pt-4 border-t border-base-300/50">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary">Technical Identifier (Slug)</label>
                    <input 
                      autoFocus
                      type="text"
                      className="input input-bordered input-sm w-full font-mono text-[11px] font-bold bg-base-100 rounded-md border-base-300 focus:border-primary shadow-inner"
                      placeholder="e.g. gpt-4-turbo-preview"
                      value={activeModelName === 'custom' ? '' : activeModelName}
                      onChange={(e) => setActiveModelName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* RATE LIMITING SECTION */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-warning">
                <Timer size={14} /> DoS PROTECTION (RATE LIMITS)
              </h3>

              <div className="bg-base-200/20 border border-base-300 rounded-xl p-8 shadow-inner space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Generation Rate Limit */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60">AI Generation (Draft/Continue)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="input input-bordered input-sm w-24 font-mono text-sm font-bold bg-base-100 rounded-md border-base-300 focus:border-warning"
                        value={rateLimitGenerate}
                        onChange={(e) => setRateLimitGenerate(Number(e.target.value))}
                      />
                      <span className="text-[10px] font-bold opacity-40 uppercase">requests / minute</span>
                    </div>
                    <p className="text-[9px] font-medium opacity-40 uppercase tracking-tighter leading-relaxed">
                      Applied to <code className="text-warning">/api/generate</code> endpoint
                    </p>
                  </div>

                  {/* AI Rewrite Rate Limit */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-60">AI Rewrite (Inline Edits)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="input input-bordered input-sm w-24 font-mono text-sm font-bold bg-base-100 rounded-md border-base-300 focus:border-warning"
                        value={rateLimitRewrite}
                        onChange={(e) => setRateLimitRewrite(Number(e.target.value))}
                      />
                      <span className="text-[10px] font-bold opacity-40 uppercase">requests / minute</span>
                    </div>
                    <p className="text-[9px] font-medium opacity-40 uppercase tracking-tighter leading-relaxed">
                      Applied to <code className="text-warning">/api/rewrite</code> endpoint
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 flex gap-3">
                  <ShieldCheck size={16} className="text-warning shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-warning/80">Security Notice</h4>
                    <p className="text-[9px] font-medium leading-relaxed opacity-60 uppercase tracking-tighter">
                      Rate limits prevent API abuse and protect against accidental infinite loops. Limits are enforced per IP address.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* INFO BANNER */}
            <div className="p-4 rounded-xl bg-info/5 border border-info/10 flex gap-3 max-w-2xl">
              <Info size={18} className="text-info shrink-0" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-info/80">Infrastructure Requirement</h4>
                <p className="text-[9px] font-medium leading-relaxed opacity-60 uppercase tracking-tighter">
                  Changing the provider requires corresponding environment variables (<code className="text-info font-bold">ANTHROPIC_API_KEY</code>, etc.) to be present in your runtime environment.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* SIDEBAR (Mirrors Variable Registry) */}
        <aside className="w-80 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col h-full overflow-hidden shrink-0 hidden xl:flex">
          <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Intelligence Node</span>
            <Code size={12} className="opacity-20" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
            <section className="space-y-3">
              <h4 className="text-[9px] font-black uppercase opacity-30 flex items-center gap-2 border-b border-base-300 pb-1">
                <Layers size={10} /> Active Profile
              </h4>
              <div className="p-3 bg-base-200/30 rounded-lg border border-base-300/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Cpu size={16} />
                  </div>
                  <div className="leading-none">
                    <div className="text-[10px] font-black uppercase tracking-tight">{selectedModel?.name || 'Manual'}</div>
                    <div className="text-[8px] font-bold text-primary/60 uppercase">{selectedProvider.name}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-[9px] font-black uppercase opacity-30 flex items-center gap-2 border-b border-base-300 pb-1">
                <Activity size={10} /> Model Capacity
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold opacity-40 uppercase">Vibe</span>
                  <span className="font-black uppercase tracking-tighter">{selectedProvider.vibe}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold opacity-40 uppercase">Context</span>
                  <span className="font-mono font-black text-secondary">{selectedModel?.context || '---'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold opacity-40 uppercase">Best For</span>
                  <span className="font-black uppercase text-primary">{selectedModel?.strength || 'Custom Logic'}</span>
                </div>
              </div>
            </section>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Lock size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Encrypted</span>
              </div>
              <p className="text-[9px] font-medium leading-relaxed opacity-50 uppercase">
                Keys are strictly server-side. No client-side exposure risk.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
