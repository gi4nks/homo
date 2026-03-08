'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Wand2, 
  Save, 
  RotateCcw, 
  Info,
  Database,
  Layout,
  BookOpen,
  Sparkles,
  ShieldCheck,
  PenTool,
  ChevronRight,
  Target as LucideTarget,
  Zap,
  Cpu,
  Type,
  AlertCircle,
  Search
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { 
  getAppSettings, 
  updateAppSettings, 
  getPromptTemplates, 
  getAiProfiles 
} from '@/app/actions/ai.actions';

const TargetIcon = LucideTarget || Sparkles;

const INSPECTOR_FIELDS = [
  { id: 'globalSynopsis', label: '📖 Global Synopsis', tab: 'Book', icon: BookOpen, desc: 'Primary summary of the manuscript' },
  { id: 'tone', label: '🛡️ Tone & Style Guidelines', tab: 'Book', icon: ShieldCheck, desc: 'Stylistic rules and tonal constraints' },
  { id: 'styleReference', label: '✍️ Style Reference', tab: 'Book', icon: Wand2, desc: 'Anchor fragment for literary voice' },
  { id: 'authorialIntent', label: '✨ Authorial Intent', tab: 'Book', icon: Sparkles, desc: 'The emotional or narrative core goal' },
  { id: 'loreConstraints', label: '🗄️ Lore Constraints', tab: 'Book', icon: Database, desc: 'Static world rules and logic' },
  { id: 'existingLoreConstraints', label: '📚 Existing Lore Constraints', tab: 'Book', icon: Database, desc: 'V2: Dynamic worldbuilding data' },
  { id: 'chapterGoal', label: '🎯 Chapter Objective', tab: 'Chapter', icon: TargetIcon, desc: 'The primary arc of the chapter' },
  { id: 'auditReport', label: '🔍 Chapter Audit', tab: 'Chapter', icon: Search, desc: 'Chapter-level continuity analysis' },
  { id: 'promptGoals', label: 'Essential Beats', tab: 'Scene', icon: PenTool, desc: 'Chronological sequence of actions' },
  { id: 'auditReport', label: '🔍 Audit & Continuity Report', tab: 'Scene', icon: Search, desc: 'Structural and plot-hole analysis' },
];

export default function InspectorBindingsPage() {
  const [bindings, setBindings] = useState<Record<string, { templateId: string | null, personaId: string | null }>>({});
  const [templates, setPromptTemplates] = useState<any[]>([]);
  const [profiles, setAiProfiles] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const setSaveStatus = useWorkspaceStore(state => state.setSaveStatus);

  useEffect(() => {
    getAppSettings().then(settings => {
      setBindings(settings.inspectorBindingsParsed || {});
    });
    getPromptTemplates().then(setPromptTemplates);
    getAiProfiles().then(setAiProfiles);
  }, []);

  const handleBindingChange = (fieldId: string, key: 'templateId' | 'personaId', value: string | null) => {
    setBindings(prev => ({
      ...prev,
      [fieldId]: {
        ...(prev[fieldId] || { templateId: null, personaId: null }),
        [key]: value === "" ? null : value
      }
    }));
  };

  const handleSave = async () => {
    startTransition(async () => {
      setSaveStatus(true, "Saving Bindings...");
      const res = await updateAppSettings({ 
        inspectorBindings: JSON.stringify(bindings) 
      });
      if (res.success) {
        setSaveStatus(false, new Date().toLocaleTimeString());
      } else {
        setSaveStatus(false, "Error");
      }
    });
  };

  return (
    <div className="p-12 w-full space-y-12">
      
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-base-content uppercase">Inspector AI Bindings</h1>
          <p className="text-sm font-medium text-base-content/60 uppercase tracking-widest">Automation Configuration</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="btn btn-primary btn-sm rounded-md font-black uppercase tracking-widest text-[10px] px-8 shadow-md"
        >
          <Save size={14} className="mr-1" /> {isPending ? 'Saving...' : 'Save Bindings'}
        </button>
      </header>

      <div className="space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4 shadow-sm">
           <Zap className="text-primary shrink-0" size={20} />
           <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Dynamic Tooling</h4>
              <p className="text-xs text-base-content/70 font-medium leading-relaxed mt-1">
                 Map Inspector fields to specialized AI protocols. Only fields with an active **AI Template** will display the magic sparkle button (✨) in the sidebar.
              </p>
           </div>
        </div>

        <div className="bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden w-full">
          <table className="table table-sm w-full table-fixed">
            <thead className="bg-base-200/50 border-b border-base-300 text-base-content/50">
              <tr className="text-[10px] uppercase tracking-widest font-black">
                <th className="pl-8 py-5 w-[25%]">Field Identification</th>
                <th className="py-5 w-[35%]">AI Protocol (Template)</th>
                <th className="py-5 w-[30%]">Persona Overlay</th>
                <th className="text-right pr-8 py-5 w-[10%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {['Book', 'Chapter', 'Scene'].map(tab => (
                <React.Fragment key={tab}>
                  <tr className="bg-base-50/50">
                    <td colSpan={4} className="px-8 py-2 border-y border-base-200">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/30">{tab} Tab Infrastructure</span>
                    </td>
                  </tr>
                  {INSPECTOR_FIELDS.filter(f => f.tab === tab).map(field => {
                    const binding = bindings[field.id] || { templateId: null, personaId: null };
                    const Icon = field.icon;
                    const isActive = !!binding.templateId;

                    return (
                      <tr key={field.id} className="hover:bg-primary/5 group transition-colors">
                        <td className="pl-8 py-6 align-top">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-lg shrink-0 transition-all ${isActive ? 'bg-primary text-primary-content shadow-primary/20' : 'bg-base-200 text-base-content/30 shadow-none'}`}>
                               <Icon size={14} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-xs uppercase tracking-tight text-base-content truncate">{field.label}</span>
                              <span className="text-[9px] opacity-40 font-medium uppercase tracking-tighter truncate">{field.desc}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 align-top px-4">
                          <select 
                            className="select select-bordered select-sm w-full font-bold text-[11px] bg-base-50 border-base-300 focus:select-primary transition-all rounded-md h-10"
                            value={binding.templateId || ""}
                            onChange={(e) => handleBindingChange(field.id, 'templateId', e.target.value)}
                          >
                            <option value="">(Inactive / No Magic Button)</option>
                            {templates.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-6 align-top px-4">
                          <select 
                            className="select select-bordered select-sm w-full font-bold text-[11px] bg-base-50 border-base-300 focus:select-primary transition-all rounded-md h-10"
                            value={binding.personaId || ""}
                            onChange={(e) => handleBindingChange(field.id, 'personaId', e.target.value)}
                          >
                            <option value="">Default Persona Overlay</option>
                            {profiles.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-right pr-8 py-6 align-top">
                          <div className="flex justify-end">
                            {isActive ? (
                              <div className="badge badge-success badge-xs font-black uppercase tracking-tighter py-2 px-3 gap-1.5 shadow-sm">
                                <Sparkles size={8} /> Active
                              </div>
                            ) : (
                              <div className="badge badge-ghost badge-xs font-black uppercase tracking-tighter py-2 px-3 opacity-20">Idle</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex gap-4 shadow-inner">
        <AlertCircle className="text-indigo-500 shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600">Architectural Note</h4>
          <p className="text-xs text-indigo-950/60 font-medium leading-relaxed italic">
            Assigning a template to a field creates a direct bridge between your metadata and the AI CMS. This bypasses the main editor scratchpad, allowing for immediate structural refinement of your story architecture.
          </p>
        </div>
      </div>
    </div>
  );
}
