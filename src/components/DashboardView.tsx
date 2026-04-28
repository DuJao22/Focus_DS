import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { Project, Task } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectSelect?: (projectId: string) => void;
}

const data = [
  { name: 'Mon', hours: 4, efficiency: 85 },
  { name: 'Tue', hours: 6, efficiency: 70 },
  { name: 'Wed', hours: 5, efficiency: 95 },
  { name: 'Thu', hours: 8, efficiency: 90 },
  { name: 'Fri', hours: 3, efficiency: 60 },
];

export default function DashboardView({ projects, tasks, onProjectSelect }: DashboardViewProps) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Foco Semanal', value: '26h 30m', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Eficiência', value: '88%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tarefas Concluídas', value: `${completedTasks}/${totalTasks}`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Trabalho Focado', value: '14.2h', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 sm:p-6 rounded-[2rem] flex flex-col gap-2">
            <div className={stat.bg + " w-10 h-10 rounded-xl flex items-center justify-center " + stat.color}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Chart */}
        <div className="lg:col-span-2 glass p-5 sm:p-8 rounded-[2rem] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 tracking-tight">Pulso de Produtividade</h3>
              <p className="text-xs text-slate-400 font-medium">Eficiência semanal e horas de foco</p>
            </div>
            <select className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight focus:ring-0 w-fit">
              <Option value="week">Últimos 7 dias</Option>
              <Option value="month">Último Mês</Option>
            </select>
          </div>
          
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="glass p-8 rounded-[2rem]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Execução por Sistema</h3>
          <div className="space-y-6">
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const done = projectTasks.filter(t => t.status === 'completed').length;
              const progress = projectTasks.length > 0 ? (done / projectTasks.length) * 100 : 0;
              
              return (
                <div 
                  key={project.id} 
                  onClick={() => onProjectSelect?.(project.id)}
                  className="space-y-2 cursor-pointer group/item"
                >
                  <div className="flex justify-between items-center px-1">
                    <span className="font-bold text-xs text-slate-700 group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">{project.name}</span>
                    <span className="text-slate-400 text-[10px] font-mono font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
             <div className="ai-accent text-white p-6 rounded-2xl relative overflow-hidden group shadow-xl shadow-indigo-200">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                  <Zap size={60} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">Meta Diária</p>
                <p className="text-lg font-bold">5 Horas de Foco Restantes</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/10" />)}
                  </div>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">+2 projetos</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Option({ children, value }: { children: React.ReactNode, value: string }) {
  return <option value={value}>{children}</option>;
}
