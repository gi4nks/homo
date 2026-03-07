'use client';

import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface FooterSelectorProps {
  label: string;
  value: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isOverridden?: boolean;
  isLoading?: boolean;
  dropdownWidth?: string;
  tooltip?: string;
}

export default function FooterSelector({ 
  label, 
  value, 
  icon: Icon, 
  children, 
  isOverridden = false,
  isLoading = false,
  dropdownWidth = "w-72",
  tooltip
}: FooterSelectorProps) {
  return (
    <div className="dropdown dropdown-top dropdown-end shrink-0">
      <div 
        tabIndex={0} 
        role="button"
        title={tooltip || value}
        className={`flex items-center gap-3 px-3 rounded-xl cursor-pointer transition-all border group shadow-sm outline-none focus:ring-2 focus:ring-primary/20 h-10 min-w-max shrink-0 ${
          isOverridden 
            ? 'bg-secondary/10 border-secondary/30' 
            : 'bg-base-100 border-base-300 hover:bg-base-200 hover:border-base-content/20 shadow-inner'
        }`}
      >
        {/* ICON BLOCK */}
        <div className={`p-1 rounded transition-transform group-hover:scale-110 shrink-0 ${
          isOverridden 
            ? 'bg-secondary text-secondary-content shadow-lg shadow-secondary/20' 
            : 'bg-base-content/10 text-base-content/50 group-hover:text-primary transition-colors'
        }`}>
          <Icon size={12} className={isOverridden ? "animate-pulse" : ""} />
        </div>

        {/* LABEL & VALUE STACK - REMOVED FIXED WIDTHS */}
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-opacity ${
            isOverridden ? 'text-secondary/60' : 'opacity-30 group-hover:opacity-60'
          }`}>
            {label}
          </span>
          <span className={`text-[11px] font-semibold uppercase tracking-tight ${
            isOverridden ? 'text-secondary' : 'text-base-content/80'
          }`}>
            {isLoading ? '...' : value}
          </span>
        </div>

        {/* CHEVRON */}
        <ChevronDown size={10} className="opacity-20 group-hover:opacity-50 transition-all ml-1 shrink-0 group-hover:translate-y-0.5" />
      </div>
      
      {/* DROPDOWN CONTENT */}
      <div tabIndex={0} className={`dropdown-content z-[100] mb-3 ${dropdownWidth}`}>
        <ul className="menu p-2 shadow-2xl bg-base-100 rounded-2xl border border-base-200 flex-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-y-auto custom-scrollbar max-h-[400px]">
          {children}
        </ul>
      </div>
    </div>
  );
}
