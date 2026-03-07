'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-2 bg-base-200 flex justify-center items-center transition-all">
      <Link 
        href="/settings" 
        className="flex items-center gap-2 opacity-20 hover:opacity-60 transition-opacity duration-500 cursor-pointer group"
      >
        <Zap size={8} className="text-base-content group-hover:text-warning" />
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-base-content">
          HOMO Engine v{process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0'}
        </span>
      </Link>
    </footer>
  );
}
