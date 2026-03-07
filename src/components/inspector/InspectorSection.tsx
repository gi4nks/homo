'use client';

import React, { useState } from 'react';

interface InspectorSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: any;
  defaultOpen?: boolean;
  collapsible?: boolean;
}

export default function InspectorSection({ 
  title, 
  children, 
  icon: Icon, 
  defaultOpen = false,
  collapsible = true
}: InspectorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className="card bg-base-100 shadow-sm mb-4 rounded-xl border border-base-300/50">
        <div className="card-body p-5 pb-2">
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={14} className="text-primary" />}
            <h3 className="card-title text-[10px] font-black uppercase tracking-[0.2em] text-base-content/70">
              {title}
            </h3>
          </div>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="collapse collapse-arrow bg-base-100 shadow-sm mb-4 rounded-xl border border-base-300/50">
      <input 
        type="checkbox" 
        checked={isOpen} 
        onChange={() => setIsOpen(!isOpen)} 
      /> 
      <div className="collapse-title flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-base-content/70">
        {Icon && <Icon size={14} className={isOpen ? 'text-primary' : 'opacity-40'} />}
        {title}
      </div>
      <div className="collapse-content flex flex-col gap-4">
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
