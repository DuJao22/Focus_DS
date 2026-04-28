import React from 'react';
import { Task, Project, Priority, TaskStatus } from '../types';
import { motion } from 'motion/react';
import { 
  MoreVertical, 
  Plus, 
  Circle, 
  Clock, 
  GripVertical,
  ArrowUpRight,
  CheckCircle2,
  Tag,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onProjectSelect?: (projectId: string) => void;
  onAddTask?: () => void;
  onDeleteTask?: (taskId: string) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'text-red-500 bg-red-50 border-red-100', 
  high: 'text-orange-500 bg-orange-50 border-orange-100', 
  medium: 'text-blue-500 bg-blue-50 border-blue-100', 
  low: 'text-neutral-500 bg-neutral-50 border-neutral-100', 
};

const STATUS_FLOW: Record<TaskStatus, TaskStatus> = {
  'backlog': 'todo',
  'todo': 'in-progress',
  'in-progress': 'completed',
  'blocked': 'todo',
  'completed': 'backlog'
};

export default function TasksView({ tasks, projects, setTasks, onProjectSelect, onAddTask, onDeleteTask }: TasksViewProps) {
  const [viewType, setViewType] = React.useState<'board' | 'list'>('board');
  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'backlog', label: 'Estoque / Backlog' },
    { id: 'todo', label: 'A Fazer' },
    { id: 'in-progress', label: 'Em Execução' },
    { id: 'completed', label: 'Concluído' },
  ];

  const updateStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex -space-x-3">
            {projects.map(p => (
              <button 
                key={p.id} 
                onClick={() => onProjectSelect?.(p.id)}
                className="w-9 h-9 rounded-xl border-4 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 hover:scale-110 hover:z-10 transition-transform active:scale-90"
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {p.name.charAt(0)}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Filtrando em {projects.length} sistemas</span>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
           <button 
            onClick={() => setViewType('board')}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-tight rounded-lg shadow-sm transition-all",
              viewType === 'board' ? "bg-white text-slate-900" : "text-slate-400 hover:text-slate-900"
            )}
           >
             Quadro
           </button>
           <button 
            onClick={() => setViewType('list')}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all",
              viewType === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
            )}
           >
             Lista
           </button>
        </div>
      </div>

      {viewType === 'board' ? (
        <div className="flex flex-1 gap-6 overflow-x-auto pb-24 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible custom-scrollbar">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col gap-4 min-w-[85vw] sm:min-w-[300px] lg:min-w-0 snap-center px-1">
              <div className="flex items-center justify-between px-2 bg-slate-50/90 backdrop-blur-md py-3 sticky top-0 z-10 rounded-2xl border border-slate-100 shadow-sm md:static md:bg-transparent md:border-none md:shadow-none md:py-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-500">{column.label}</h3>
                  <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-black shadow-sm shadow-indigo-100">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <button 
                  onClick={onAddTask}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="flex-1 bg-slate-100/40 rounded-[2.5rem] p-3 sm:p-4 space-y-4 min-h-[400px] border border-slate-200/30 shadow-inner">
                {tasks
                  .filter(t => t.status === column.id)
                  .map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    const subtasksCount = task.subtasks?.length || 0;
                    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                    
                    return (
                      <motion.div
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={task.id}
                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing hover:border-indigo-100"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span 
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm",
                              PRIORITY_COLORS[task.priority]
                            )}
                          >
                            {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                          <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => onDeleteTask?.(task.id)}
                               className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                               title="Excluir"
                             >
                               <X size={16} />
                             </button>
                             <button className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg"><MoreVertical size={16} /></button>
                             <div className="hidden lg:flex w-8 h-8 items-center justify-center text-slate-300"><GripVertical size={16} /></div>
                          </div>
                        </div>

                        <h4 className="font-bold text-[15px] mb-1.5 text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                        <p className="text-[12px] text-slate-400 font-medium line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                        
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {task.tags.map(tag => (
                              <span key={tag} className="flex items-center gap-1 text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Subtasks Progress */}
                        {subtasksCount > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-indigo-500" />
                                Subtarefas
                              </span>
                              <span>{completedSubtasks}/{subtasksCount}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedSubtasks / subtasksCount) * 100}%` }}
                                className="h-full bg-indigo-500"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: project?.color }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{project?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <div className="flex items-center gap-1.5 text-[11px] font-black">
                               <Clock size={14} className="text-slate-300" />
                               {task.estimatedMinutes}m
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => updateStatus(task.id, STATUS_FLOW[task.status])}
                          className={cn(
                            "absolute bottom-4 right-4 p-2 rounded-xl text-white shadow-lg shadow-indigo-100 active:scale-95 transition-all lg:opacity-0 lg:group-hover:opacity-100 bg-indigo-600 hover:bg-indigo-700"
                          )}
                        >
                          <ArrowUpRight size={16} strokeWidth={3} />
                        </button>
                      </motion.div>
                    );
                  })}
                
                {tasks.filter(t => t.status === column.id).length === 0 && (
                  <div className="h-full flex items-center justify-center flex-col opacity-20 py-12">
                     <Circle size={40} strokeWidth={1} />
                     <p className="text-xs mt-2 font-medium italic">Espaço vazio</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-24 space-y-4">
          {columns.map(column => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center gap-3 px-4">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">{column.label}</h3>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-400">{tasks.filter(t => t.status === column.id).length}</span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === column.id).map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <motion.div 
                      key={task.id}
                      layout
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all"
                    >
                      <button 
                        onClick={() => updateStatus(task.id, STATUS_FLOW[task.status])}
                        className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center text-transparent hover:border-indigo-400 hover:text-indigo-400 transition-all shrink-0"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                           <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight truncate">{task.title}</h4>
                           <span className={cn(
                             "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                             PRIORITY_COLORS[task.priority]
                           )}>{task.priority}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project?.color }} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">{project?.name}</span>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center text-slate-300 group-hover:text-slate-500 cursor-pointer">
                          <MoreVertical size={16} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
