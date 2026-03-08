'use client';

import React, { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
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
  Download,
  Search,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { 
  getPromptTemplates, 
  createPromptTemplate, 
  updatePromptTemplate, 
  deletePromptTemplate,
  clonePromptTemplate 
} from '@/app/actions/ai.actions';
import HighlightedPromptEditor from '@/components/cms/HighlightedPromptEditor';

// --- SUB-COMPONENT: VARIABLE DOC ITEM ---
const VariableDocItem = ({ name, desc }: { name: string, desc: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="group relative flex flex-col gap-1 p-2 rounded-lg hover:bg-indigo-500/5 border border-transparent hover:border-indigo-500/10 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-center">
        <code className="text-[10px] font-black text-indigo-600 bg-indigo-500/10 px-1.5 py-0.5 rounded flex items-center gap-1.5">
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
  const [searchQuery, setSearchQuery] = useState("");
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
      }
    });
  };

  const handleCreate = async () => {
    const res = await createPromptTemplate({
      name: `New Protocol ${templates.length + 1}`,
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
      }
    });
  };

  const handleDelete = async () => {
    if (!activeTemplate || activeTemplate.isDefault) return;
    openConfirmModal({
      title: "Decommission Protocol",
      message: `Permanently delete "${activeTemplate.name}"? This cannot be reversed.`,
      confirmLabel: "Delete Forever",
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

  const handleExportMarkdown = () => {
    if (templates.length === 0) return;

    let markdown = `# HOMO - AI Prompt CMS Export\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n\n---\n\n`;

    templates.forEach(t => {
      markdown += `## ${t.name}\n`;
      markdown += `**Phase:** ${t.phase}\n`;
      if (t.description) markdown += `**Description:** ${t.description}\n`;
      markdown += `**Is Default:** ${t.isDefault ? 'Yes' : 'No'}\n\n`;

      markdown += `### SYSTEM CORE INSTRUCTION\n`;
      markdown += `\`\`\`text\n${t.systemInstruction}\n\`\`\`\n\n`;

      markdown += `### CONTEXTUAL STRUCTURE (XML)\n`;
      markdown += `\`\`\`xml\n${t.contextTemplate}\n\`\`\`\n\n`;

      markdown += `### TASK DIRECTIVE\n`;
      markdown += `\`\`\`text\n${t.taskDirective}\n\`\`\`\n\n`;
      
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homo_prompts_backup_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const isDirty = useMemo(() => 
    JSON.stringify(activeTemplate) !== JSON.stringify(originalTemplate),
    [activeTemplate, originalTemplate]
  );

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-base-200/40 overflow-hidden font-sans">
      
      {/* 1. LEFT EXPLORER: SOURCE TREE */}
      <aside className="w-72 border-r border-base-300 bg-base-100/50 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-primary-content font-black text-xs shadow-lg">H</div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Infrastructure</h2>
            </div>
            <div className="flex gap-1">
              <button onClick={handleExportMarkdown} title="Export Markdown" className="btn btn-ghost btn-xs btn-square hover:bg-base-200 transition-all border border-base-300">
                <Download size={14} />
              </button>
              <button onClick={handleCreate} title="New Template" className="btn btn-ghost btn-xs btn-square hover:bg-primary hover:text-primary-content transition-all shadow-sm border border-base-300">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text" 
              placeholder="Search Protocols..."
              className="input input-sm w-full bg-base-200/50 border-base-300 pl-10 text-[11px] font-bold focus:bg-base-100 transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-8 pb-32">
          {PHASES.map(phase => {
            const phaseTemplates = filteredTemplates.filter(t => t.phase === phase);
            if (phaseTemplates.length === 0) return null;

            return (
              <div key={phase} className="space-y-1">
                <div className="px-3 py-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-30">
                  {PHASE_ICONS[phase]}
                  {phase}
                </div>
                {phaseTemplates.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`group flex items-center w-full px-3 py-2.5 rounded-xl transition-all relative ${activeTemplate?.id === t.id ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 ring-1 ring-primary/50' : 'hover:bg-base-200 text-base-content/60 hover:text-base-content'}`}
                  >
                    <Terminal size={14} className={`mr-3 shrink-0 ${activeTemplate?.id === t.id ? 'opacity-100' : 'opacity-20'}`} />
                    <span className="truncate flex-grow text-[11px] font-bold tracking-tight">{t.name}</span>
                    {t.isDefault && <CheckCircle2 size={12} className={`ml-2 shrink-0 ${activeTemplate?.id === t.id ? 'text-primary-content' : 'text-success opacity-40'}`} />}
                    {isDirty && activeTemplate?.id === t.id && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--p),0.5)]"></div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </aside>

      {/* 2. CENTER CANVAS: THE FORGE */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {activeTemplate ? (
          <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-hidden">
            {/* TOOLBAR INSIDE CANVAS */}
            <div className="bg-base-100 rounded-2xl border border-base-300 shadow-2xl flex flex-col h-full overflow-hidden">
              <header className="px-8 py-5 border-b border-base-200 flex items-center justify-between bg-base-50/50 shrink-0">
                <div className="flex items-center gap-4 flex-grow max-w-xl">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                    <Activity size={18} />
                  </div>
                  <div className="flex flex-col flex-grow min-w-0">
                    <input 
                      type="text" 
                      className="bg-transparent border-none outline-none font-black uppercase tracking-tight text-lg text-base-content focus:text-primary transition-colors w-full" 
                      value={activeTemplate.name}
                      onChange={(e) => setActiveTemplate({...activeTemplate, name: e.target.value})}
                    />
                    <div className="flex items-center gap-2 group/status relative">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Pipeline:</span>
                      
                      {/* INTERACTIVE PHASE SELECTOR DROPDOWN */}
                      <div className="dropdown dropdown-bottom">
                        <div 
                          tabIndex={0} 
                          role="button" 
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-2 py-0.5 rounded transition-colors cursor-pointer border border-primary/10"
                        >
                          <Zap size={10} fill="currentColor" /> {activeTemplate.phase}
                          <ChevronDown size={10} className="opacity-40" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[100] menu p-1.5 shadow-2xl bg-base-100 rounded-xl border border-base-300 w-48 mt-1 animate-in slide-in-from-top-1 duration-200">
                          <li className="menu-title px-3 py-1.5 text-[8px] font-black uppercase tracking-widest opacity-30">Select Target Pipeline</li>
                          {PHASES.map(p => (
                            <li key={p}>
                              <button 
                                onClick={() => setActiveTemplate({...activeTemplate, phase: p})}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight ${activeTemplate.phase === p ? 'bg-primary text-primary-content shadow-sm' : 'hover:bg-base-200'}`}
                              >
                                <div className="flex items-center gap-2">
                                  {PHASE_ICONS[p]}
                                  {p}
                                </div>
                                {activeTemplate.phase === p && <CheckCircle2 size={12} />}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isDirty && (
                    <button onClick={handleDiscard} className="btn btn-ghost btn-sm px-4 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">
                      <RotateCcw size={14} className="mr-1.5" /> Discard
                    </button>
                  )}
                  <button onClick={handleClone} className="btn btn-ghost btn-sm border border-base-200 px-4 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">
                    <Files size={14} className="mr-1.5" /> Clone
                  </button>
                  {!activeTemplate.isDefault && (
                    <button onClick={handleDelete} className="btn btn-ghost btn-sm border border-base-200 px-2 text-error/60 hover:text-error hover:bg-error/10">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="divider divider-horizontal mx-1 h-6 opacity-10"></div>
                  <button 
                    onClick={handleSave}
                    disabled={!isDirty || isPending}
                    className={`btn btn-primary btn-sm px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 ${isPending ? 'loading' : 'hover:scale-105 transition-all'}`}
                  >
                    <Save size={14} className="mr-1.5" /> Commit Protocol
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32">
                {/* SYSTEM CORE */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Engine Core Instruction</h3>
                  </div>
                  <HighlightedPromptEditor 
                    value={activeTemplate.systemInstruction}
                    onChange={(val) => setActiveTemplate({...activeTemplate, systemInstruction: val})}
                    minHeight="140px"
                    className="shadow-inner"
                  />
                </section>

                {/* CONTEXT XML */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Contextual Structure (XML)</h3>
                  </div>
                  <HighlightedPromptEditor 
                    value={activeTemplate.contextTemplate}
                    onChange={(val) => setActiveTemplate({...activeTemplate, contextTemplate: val})}
                    minHeight="350px"
                    className="shadow-inner"
                  />
                </section>

                {/* TASK DIRECTIVE */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Target Task Directive</h3>
                  </div>
                  <HighlightedPromptEditor 
                    value={activeTemplate.taskDirective}
                    onChange={(val) => setActiveTemplate({...activeTemplate, taskDirective: val})}
                    minHeight="220px"
                    className="shadow-inner"
                  />
                </section>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-10">
            <PenTool size={120} strokeWidth={1} />
            <p className="text-2xl font-black uppercase tracking-[0.4em]">Select Protocol</p>
          </div>
        )}
      </main>

      {/* 3. RIGHT PANEL: VARIABLE DOCS */}
      <aside className="w-80 border-l border-base-300 bg-base-100/50 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-6 border-b border-base-200 flex items-center justify-between bg-base-50/50 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-indigo-600">Variable Registry</span>
          <Code size={12} className="opacity-20 text-indigo-600" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-10 pb-32">
          {/* SECTIONS */}
          <section className="space-y-2">
            <h4 className="px-2 text-[9px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
              <Database size={10} /> Project Schema
            </h4>
            <div className="space-y-0.5">
              <VariableDocItem name="{{bookStyle}}" desc="Global tone and manuscript styling guide." />
              <VariableDocItem name="{{bookSynopsis}}" desc="The high-level plot summary." />
              <VariableDocItem name="{{styleReference}}" desc="Anchor text for literary style." />
              <VariableDocItem name="{{authorialIntent}}" desc="Emotional or narrative core goal." />
              <VariableDocItem name="{{loreConstraints}}" desc="Unshakable world rules and logic." />
              <VariableDocItem name="{{existingLoreConstraints}}" desc="V2: Real-time worldbuilding limits." />
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="px-2 text-[9px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
              <Layout size={10} /> Scope Context
            </h4>
            <div className="space-y-0.5">
              <VariableDocItem name="{{sceneGoal}}" desc="Immediate chapter/section objective." />
              <VariableDocItem name="{{sceneCast}}" desc="Active characters in this specific range." />
              <VariableDocItem name="{{sceneText}}" desc="The active selection OR full scene text." />
              <VariableDocItem name="{{narrativePosition}}" desc="Dynamic arc position (OPENING, etc)." />
              <VariableDocItem name="{{previousSceneGoal}}" desc="Goal tracking from previous sequence." />
              <VariableDocItem name="{{previousContent}}" desc="Synchronous previous text snippet." />
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="px-2 text-[9px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
              <Terminal size={10} /> Runtime Logic
            </h4>
            <div className="space-y-0.5">
              <VariableDocItem name="{{taskType}}" desc="Current pipeline operation (DRAFT/REWRITE)." />
              <VariableDocItem name="{{taskGoal}}" desc="User-defined specific drafting target." />
              <VariableDocItem name="{{taskInstruction}}" desc="High-level engineering directive." />
              <VariableDocItem name="{{finalConstraint}}" desc="Stylistic and technical enforcement." />
              <VariableDocItem name="{{aiPersonaPrompt}}" desc="Instruction from the selected AI Profile." />
              <VariableDocItem name="{{originalVersion}}" desc="Diff: Baseline for analysis." />
              <VariableDocItem name="{{revisedVersion}}" desc="Diff: Target for comparison." />
            </div>
          </section>

          <div className="mx-2 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-indigo-600">
              <Info size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Protocol Rules</span>
            </div>
            <p className="text-[10px] font-medium text-indigo-950/50 leading-relaxed italic">
              Encapsulate manuscript data in XML tags to prevent prompt injection and improve LLM parsing.
            </p>
          </div>
        </div>
      </aside>

    </div>
  );
}
