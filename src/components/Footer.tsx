import React from 'react';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-slate-100 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h3 className="text-slate-900 font-black text-sm tracking-tight uppercase">FocusOS Professional</h3>
          <p className="text-slate-500 text-xs font-medium">
            © 2026 Desenvolvido por <span className="text-indigo-600 font-bold">João Layon</span>, CEO DS Company.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a 
            href="https://instagram.com/dscompany1_" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Instagram size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">DS Company</span>
              <span className="text-[11px] font-medium opacity-60">@dscompany1_</span>
            </div>
          </a>

          <a 
            href="https://instagram.com/layon.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Instagram size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">CEO João Layon</span>
              <span className="text-[11px] font-medium opacity-60">@layon.dev</span>
            </div>
          </a>

          <a 
            href="https://instagram.com/davi.ai1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <Instagram size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">CEO Paulo Davi</span>
              <span className="text-[11px] font-medium opacity-60">@davi.ai1</span>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}
