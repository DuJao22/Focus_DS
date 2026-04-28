import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';
import Footer from './Footer';

interface AuthViewProps {
  onLogin: (user: User, token: string) => void;
  onBackToLanding?: () => void;
}

export default function AuthView({ onLogin, onBackToLanding }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { username: formData.username, password: formData.password }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Autenticação falhou');
      }

      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Branding Side - Technical/Minimal mood */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#4f46e5_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#9333ea_0%,transparent_50%)]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-900/40">
            <LayoutDashboard size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-2xl tracking-tighter">FocusOS</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-black mb-6 tracking-tighter leading-tight uppercase">
            Transforme seu caos em <span className="text-indigo-400">Fluxo</span>.
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            A ferramenta definitiva para gestão de projetos orientada por dados e produtividade extrema.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <span>v2.0.4</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Enterprise Edition</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">
              {isLogin ? 'Bem-vindo de volta' : 'Comece agora'}
            </h2>
            <p className="text-slate-400 font-medium italic">
              {isLogin ? 'Gerencie seus sistemas com precisão.' : 'Crie sua conta profissional hoje.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome de Usuário</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="admin_focus"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar no Sistema' : 'Criar minha conta'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 text-sm font-bold hover:text-indigo-600 transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui uma conta? Entre aqui'}
            </button>
            {onBackToLanding && (
               <button 
                 onClick={onBackToLanding}
                 className="text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-slate-500 transition-colors"
               >
                 Voltar para o início
               </button>
            )}
          </div>
          
          <div className="mt-20">
            <Footer />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
