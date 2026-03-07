'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { 
  FileCode, 
  Terminal, 
  Save, 
  Trash2, 
  Plus, 
  Info,
  Code,
  Layout,
  MessageSquareQuote,
  CheckCircle2,
  Copy,
  Database,
  Type,
  RotateCcw,
  Files,
  ArrowRightCircle,
  Shapes,
  Map,
  PenTool,
  Sparkles as SparklesIcon,
  Wrench,
  Download
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { 
  getPromptTemplates, 
  createPromptTemplate, 
  updatePromptTemplate, 
  deletePromptTemplate,
  clonePromptTemplate 
} from '@/app/actions/ai.actions';

// --- SUB-COMPONENT: VARIABLE BADGE ---
const VariableBadge = ({ name, desc }: { name: string, desc: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="group relative flex flex-col gap-1 p-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-center">
        <code className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1.5">
          {name}
          <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </code>
        {copied && <span className="text-[8px] font-black uppercase text-success animate-bounce">Copied!</span>}
      </div>
      <p className="text-[9px] font-medium opacity-50 leading-tight pl-1">{desc}</p>
    </div>
  );
};

const PHASES = ['WORLDBUILDING', 'OUTLINING', 'DRAFTING', 'EDITING', 'UTILITY'] as const;

const PHASE_ICONS: Record<string, any> = {
  WORLDBUILDING: <Map size={10} />,
  OUTLINING: <Shapes size={10} />,
  DRAFTING: <PenTool size={10} />,
  EDITING: <SparklesIcon size={10} />,
  UTILITY: <Wrench size={10} />
};

export default function PromptSettingsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [originalTemplate, setOriginalTemplate] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const openConfirmModal = useWorkspaceStore(state => state.openConfirmModal);

  const refreshTemplates = useCallback(async () => {
    const data = await getPromptTemplates();
    setTemplates(data);
    if (data.length > 0) {
      const currentId = activeTemplate?.id;
      const updated = currentId ? data.find((t: any) => t.id === currentId) : (data.find((t: any) => t.isDefault) || data[0]);
      
      if (updated) {
        setActiveTemplate(updated);
        setOriginalTemplate(updated);
      }
    }
  }, [activeTemplate?.id]);

  useEffect(() => { 
    getPromptTemplates().then(data => {
      setTemplates(data);
      if (data.length > 0) {
        const def = data.find((t: any) => t.isDefault) || data[0];
        setActiveTemplate(def);
        setOriginalTemplate(def);
      }
    });
  }, []);

  const handleSelectTemplate = (t: any) => {
    setActiveTemplate(t);
    setOriginalTemplate(t);
  };

  const handleDiscard = () => {
    if (originalTemplate) {
      setActiveTemplate(JSON.parse(JSON.stringify(originalTemplate)));
    }
  };

  const handleClone = async () => {
    if (!activeTemplate?.id) return;
    startTransition(async () => {
      const res = await clonePromptTemplate(activeTemplate.id);
      if (res.success) {
        setActiveTemplate(res.data);
        setOriginalTemplate(res.data);
        await refreshTemplates();
      } else alert(res.error);
    });
  };

  const handleCreate = async () => {
    const res = await createPromptTemplate({
      name: `Template ${templates.length + 1}`,
      systemInstruction: "You are the HOMO writing engine.",
      contextTemplate: "<CONTEXT>\n{{bookSynopsis}}\n</CONTEXT>",
      taskDirective: "[TASK]: {{taskInstruction}}",
    });
    if (res.success) {
      setActiveTemplate(res.data);
      setOriginalTemplate(res.data);
      await refreshTemplates();
    }
  };

  const handleSave = async () => {
    if (!activeTemplate) return;
    startTransition(async () => {
      const res = await updatePromptTemplate(activeTemplate.id, activeTemplate);
      if (res.success) {
        setOriginalTemplate(JSON.parse(JSON.stringify(activeTemplate)));
        await refreshTemplates();
      } else alert(res.error);
    });
  };

  const handleDelete = async () => {
    if (!activeTemplate || activeTemplate.isDefault) return;
    openConfirmModal({
      title: "Destroy Template",
      message: `Are you sure? This action cannot be undone.`,
      confirmLabel: "Destroy",
      onConfirm: async () => {
        const res = await deletePromptTemplate(activeTemplate.id);
        if (res.success) {
          setActiveTemplate(null);
          setOriginalTemplate(null);
          await refreshTemplates();
        }
      }
    });
  };

  const handleExportMarkdown = async () => {
    try {
      const response = await fetch('/api/export-prompts');
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homo_prompts_export_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export prompts');
    }
  };

  const isDirty = JSON.stringify(activeTemplate) !== JSON.stringify(originalTemplate);

  return (
    <div className="p-12 w-full flex flex-col h-full space-y-8 overflow-hidden">
      
      {/* HARMONIZED PAGE HEADER */}
      <header className="flex justify-between items-center w-full shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase">Prompt CMS</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Intelligent Infrastructure Management</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-outline btn-sm rounded-md font-black uppercase tracking-widest text-[10px] px-6 border-base-300 hover:bg-base-200" 
            onClick={handleExportMarkdown}
          >
            <Download size={16} className="mr-1" /> Export Markdown
          </button>
          <button className="btn btn-primary btn-sm rounded-md font-black uppercase tracking-widest text-[10px] px-8 shadow-lg shadow-primary/20" onClick={handleCreate}>
            <Plus size={16} className="mr-1" /> New Template
          </button>
        </div>
      </header>

      {/* THREE-COLUMN WORKSTATION - flex-1 and min-h-0 are critical here */}
      <div className="flex-1 flex flex-row gap-8 w-full min-h-0">
        
        {/* PANEL 1: LIBRARY (Grouped by Phase) */}
        <aside className="w-72 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col h-full overflow-hidden shrink-0">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-50/50 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Writing Pipeline</span>
            <Database size={12} className="opacity-20" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar pb-20">
            {PHASES.map(phase => {
              const phaseTemplates = templates.filter(t => t.phase === phase);
              if (phaseTemplates.length === 0) return null;

              return (
                <div key={phase} className="space-y-2">
                  <div className="px-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-30">
                    {PHASE_ICONS[phase]}
                    {phase} ({phaseTemplates.length})
                  </div>
                  <div className="space-y-1">
                    {phaseTemplates.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        className={`btn btn-sm btn-block justify-start text-left normal-case border transition-all h-10 ${activeTemplate?.id === t.id ? 'btn-primary shadow-md border-primary' : 'btn-ghost border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <Terminal size={14} className="mr-2" />
                        <span className="truncate flex-grow font-bold text-[11px]">{t.name}</span>
                        {t.isDefault && <CheckCircle2 size={12} className="ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* PANEL 2: MAIN EDITOR (Standard Card) */}
        <main className="flex-1 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col h-full overflow-hidden min-w-0">
          {activeTemplate ? (
            <>
              <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4 flex-grow max-w-2xl">
                  <Type size={14} className="opacity-20" />
                  <input 
                    type="text" 
                    className="input input-ghost input-sm font-black uppercase tracking-tight text-base focus:bg-base-200 w-full p-0" 
                    value={activeTemplate.name}
                    onChange={(e) => setActiveTemplate({...activeTemplate, name: e.target.value})}
                  />
                  
                  {/* PHASE SELECTOR */}
                  <div className="flex items-center gap-1 bg-base-200/50 p-1 rounded-lg border border-base-300">
                    {PHASES.map(p => (
                      <button
                        key={p}
                        onClick={() => setActiveTemplate({...activeTemplate, phase: p})}
                        className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter transition-all ${activeTemplate.phase === p ? 'bg-primary text-primary-content shadow-sm scale-105' : 'opacity-30 hover:opacity-100'}`}
                        title={p}
                      >
                        {p.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  {activeTemplate.isDefault && (
                    <div className="badge badge-primary badge-xs font-black uppercase tracking-tighter py-2 px-3 shrink-0">Default</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-xs font-black uppercase tracking-widest text-[9px] px-4 opacity-40 hover:opacity-100 disabled:hidden transition-all"
                    onClick={handleDiscard}
                    disabled={!isDirty || isPending}
                  >
                    <RotateCcw size={12} className="mr-1" /> Discard
                  </button>
                  
                  <button 
                    className="btn btn-ghost btn-xs font-black uppercase tracking-widest text-[9px] px-4 opacity-40 hover:opacity-100 transition-all border border-base-200"
                    onClick={handleClone}
                    disabled={!activeTemplate?.id || isPending}
                    title="Clone template"
                  >
                    <Files size={12} className="mr-1" /> Clone
                  </button>

                  {!activeTemplate.isDefault && (
                    <button 
                      className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10 border border-base-200" 
                      onClick={handleDelete} 
                      disabled={isPending}
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button 
                    className={`btn btn-primary btn-xs rounded-md font-black uppercase tracking-widest text-[9px] gap-2 px-8 shadow-xl shadow-primary/20 ${isPending ? 'loading' : 'hover:scale-[1.02]'}`}
                    onClick={handleSave}
                    disabled={isPending || !isDirty}
                  >
                    <Save size={12} /> Commit Changes
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* SYSTEM INSTRUCTION */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                      <Terminal size={14} /> System Core Instruction
                    </h3>
                  </div>
                  <textarea 
                    className="textarea textarea-bordered w-full font-mono text-[11px] leading-relaxed h-32 bg-base-200/20 focus:bg-base-100 border-base-300 shadow-inner resize-none" 
                    value={activeTemplate.systemInstruction}
                    onChange={(e) => setActiveTemplate({...activeTemplate, systemInstruction: e.target.value})}
                  />
                </section>

                {/* CONTEXT TEMPLATE */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-secondary">
                      <Layout size={14} /> Contextual Structure (XML)
                    </h3>
                  </div>
                  <textarea 
                    className="textarea textarea-bordered w-full font-mono text-[11px] leading-relaxed h-72 bg-base-200/20 focus:bg-base-100 border-base-300 shadow-inner resize-none" 
                    value={activeTemplate.contextTemplate}
                    onChange={(e) => setActiveTemplate({...activeTemplate, contextTemplate: e.target.value})}
                  />
                </section>

                {/* TASK DIRECTIVE */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-accent">
                      <MessageSquareQuote size={14} /> Task Directive
                    </h3>
                  </div>
                  <textarea 
                    className="textarea textarea-bordered w-full font-mono text-[11px] leading-relaxed h-52 bg-base-200/20 focus:bg-base-100 border-base-300 shadow-inner resize-none" 
                    value={activeTemplate.taskDirective}
                    onChange={(e) => setActiveTemplate({...activeTemplate, taskDirective: e.target.value})}
                  />
                </section>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-20">
              <FileCode size={64} />
              <p className="text-xl font-black uppercase tracking-widest italic">Select a Template</p>
            </div>
          )}
        </main>

        {/* PANEL 3: VARIABLE REGISTRY (Standard Card) */}
        <aside className="w-80 bg-base-100 rounded-xl border border-base-200 shadow-sm flex flex-col h-full overflow-hidden shrink-0">
          <div className="px-6 py-4 border-b border-base-200 bg-base-50/50 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Variable Registry</span>
            <Code size={12} className="opacity-20" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 pb-20">
            {/* BOOK SECTION */}
            <section className="space-y-3">
              <h4 className="text-[9px] font-black uppercase opacity-30 flex items-center gap-2 border-b border-base-300 pb-1">
                <Database size={10} /> Book Context
              </h4>
              <div className="space-y-1">
                <VariableBadge name="{{bookStyle}}" desc="Global tone and writing style guide." />
                <VariableBadge name="{{bookSynopsis}}" desc="The high-level manuscript summary." />
                <VariableBadge name="{{styleReference}}" desc="Anchor text for your best writing style." />
                <VariableBadge name="{{authorialIntent}}" desc="Emotional or narrative goal of the work." />
                <VariableBadge name="{{loreConstraints}}" desc="Established rules and world consistency." />
              </div>
            </section>

            {/* SCENE SECTION */}
            <section className="space-y-3">
              <h4 className="text-[9px] font-black uppercase opacity-30 flex items-center gap-2 border-b border-base-300 pb-1">
                <Layout size={10} /> Scene & Chapter
              </h4>
              <div className="space-y-1">
                <VariableBadge name="{{sceneGoal}}" desc="Immediate chapter or section objective." />
                <VariableBadge name="{{sceneCast}}" desc="List of characters active in this scene." />
                <VariableBadge name="{{narrativePosition}}" desc="Inizio, Metà, Climax or Epilogo." />
                <VariableBadge name="{{previousSceneGoal}}" desc="The goal of the previous scene." />
                <VariableBadge name="{{previousContent}}" desc="Context context + current progress." />
              </div>
            </section>

            {/* ENGINE SECTION */}
            <section className="space-y-3">
              <h4 className="text-[9px] font-black uppercase opacity-30 flex items-center gap-2 border-b border-base-300 pb-1">
                <Terminal size={10} /> Engine Dynamics
              </h4>
              <div className="space-y-1">
                <VariableBadge name="{{taskType}}" desc="DRAFT or REWRITE indicator." />
                <VariableBadge name="{{taskGoal}}" desc="Current objective or selection." />
                <VariableBadge name="{{taskInstruction}}" desc="Dynamic directive (Fiction/Non-Fiction)." />
                <VariableBadge name="{{finalConstraint}}" desc="Stylistic rules (e.g. Sensory details)." />
                <VariableBadge name="{{pacingConstraints}}" desc="Genre-specific rules." />
                <VariableBadge name="{{aiPersonaPrompt}}" desc="Instruction from the selected AI Profile." />
              </div>
            </section>

            <div className="p-4 rounded-xl bg-info/5 border border-info/10 flex gap-3">
              <Info size={20} className="text-info shrink-0" />
              <p className="text-[9px] font-bold text-info/60 leading-normal uppercase">
                Use XML Tags to distinguish instructions from manuscript data.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
