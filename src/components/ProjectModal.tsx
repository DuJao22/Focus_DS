import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Palette, AlignLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => void;
}

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
];

export default function ProjectModal({ isOpen, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      lastAccessed: new Date().toISOString()
    });

    // Reset fields
    setName('');
    setDescription('');
    setColor(COLORS[0]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[210] overflow-hidden border border-slate-100"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Novo Sistema</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuração Modular</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                    <Layers size={14} /> Nome do Sistema
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Marketing, Infra, Finanças..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                    <AlignLeft size={14} /> Descrição Estratégica
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Qual o objetivo central deste sistema?"
                    rows={3}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                    <Palette size={14} /> Identidade Visual
                  </label>
                  <div className="flex flex-wrap gap-3 p-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all relative group",
                          color === c ? "scale-110 shadow-lg" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && (
                          <motion.div 
                            layoutId="selectedColor"
                            className="absolute inset-0 border-4 border-white rounded-xl shadow-inner" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-4 rounded-2xl border border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  Criar Sistema
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
