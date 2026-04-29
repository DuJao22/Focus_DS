import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Shield, 
  Layers, 
  Trello, 
  ArrowRight, 
  LayoutDashboard, 
  CheckCircle2,
  Cpu,
  Globe
} from 'lucide-react';
import Footer from './Footer';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      {/* Header/Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">FocusOS</span>
          </div>
          <button 
            onClick={onGetStarted}
            className="ai-accent text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
          >
            Acessar Sistema
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100"
          >
            <Zap size={14} className="animate-pulse" />
            Nova Geração de Produtividade
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-8"
          >
            Sincronize sua <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Velocidade Estratégica</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Transforme o caos operacional em um fluxo contínuo de resultados. O FocusOS foi projetado para CEOs e times de alta performance que exigem precisão absoluta.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 group"
            >
              Começar Agora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:border-slate-900 transition-all">
              Agendar Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Disponível para instalação via PWA
          </motion.div>
        </div>
      </section>

      {/* App Preview Mockup */}
      <section className="px-6 py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video bg-white/5 backdrop-blur-lg border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden flex items-center justify-center group"
          >
            <div className="text-center p-12">
               <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                  <Cpu size={40} className="group-hover:rotate-180 transition-transform duration-1000" />
               </div>
               <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">Engine de Produtividade</h3>
               <p className="text-slate-400 font-medium">Interface otimizada para foco profundo e carga cognitiva reduzida.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">Recursos de Elite</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Tudo o que você precisa para dominar sua agenda e escalar seus sistemas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Layers, 
                title: "Gestão por Sistemas", 
                desc: "Organização modular que permite isolar e otimizar diferentes áreas do seu negócio ou vida.",
                color: "bg-indigo-50 text-indigo-600"
              },
              { 
                icon: Trello, 
                title: "Quadro Dinâmico", 
                desc: "Visualize o fluxo de valor em tempo real com nosso quadro de tarefas sincronizado em nuvem.",
                color: "bg-purple-50 text-purple-600"
              },
              { 
                icon: Shield, 
                title: "Segurança de Dados", 
                desc: "Infraestrutura SQLite Cloud com criptografia de ponta para total privacidade dos seus planos.",
                color: "bg-emerald-50 text-emerald-600"
              },
              { 
                icon: Globe, 
                title: "Acesso Global", 
                desc: "Seus sistemas sincronizados em qualquer lugar do mundo, com carregamento ultra-rápido.",
                color: "bg-amber-50 text-amber-600"
              },
              { 
                icon: CheckCircle2, 
                title: "Pesagem Estratégica", 
                desc: "Identifique as tarefas que realmente movem o ponteiro com nosso algoritmo de peso estratégico.",
                color: "bg-blue-50 text-blue-600"
              },
              { 
                icon: Zap, 
                title: "Performance Extrema", 
                desc: "Interface construída para zero latência, permitindo fluidez total no seu dia a dia.",
                color: "bg-rose-50 text-rose-600"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] -translate-y-1/2 translate-x-1/2 rounded-full" />
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8 relative z-10 uppercase tracking-tight">
            Pronto para o Próximo <br/> Nível de Operação?
          </h2>
          <button 
            onClick={onGetStarted}
            className="px-12 py-6 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10"
          >
            Assumir Controle Agora
          </button>
        </div>
      </section>

      <div className="px-6 pb-12">
        <Footer />
      </div>
    </div>
  );
}
