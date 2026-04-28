import React, { useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Menu,
  X,
  Layers, 
  BrainCircuit,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  Trello
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Project, Task, TimeBlock, TaskStatus, User } from './types';

// Components
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import TaskModal from './components/TaskModal';
import AuthView from './components/AuthView';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'projects'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Initial Fetch
  React.useEffect(() => {
    if (token) {
      fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(setProjects);

      fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()).then(setTasks);
    }
  }, [token]);

  const handleLogin = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Monitor window resize
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 1024;

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'tasks', label: 'Quadro de Tarefas', icon: CheckSquare },
    { id: 'projects', label: 'Sistemas', icon: Layers },
  ];

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (tab !== 'projects') setSelectedProjectId(null);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('projects');
    
    // Update lastAccessed
    const now = new Date().toISOString();
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, lastAccessed: now } : p
    ));

    fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lastAccessed: now })
    });

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const updateTaskStatus = (taskId: string, currentStatus: TaskStatus) => {
    const statusFlow: Record<TaskStatus, TaskStatus> = {
      'backlog': 'todo',
      'todo': 'in-progress',
      'in-progress': 'completed',
      'blocked': 'todo',
      'completed': 'backlog'
    };
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: statusFlow[currentStatus] } : t
    ));

    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: statusFlow[currentStatus] })
    });
  };

  const handleSaveTask = async (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setTasks(prev => [newTask, ...prev]);
    setIsTaskModalOpen(false);

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
    } catch (err) {
      console.error("Failed to sync task", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const isProjectInactive = (project: Project) => {
    if (!project.lastAccessed) return false;
    const diff = differenceInMinutes(new Date(), new Date(project.lastAccessed));
    return diff >= 15;
  };

  if (!token || !user) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-800 border-none">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? 280 : (isSidebarOpen ? 260 : 80),
          x: isMobile ? (isMobileMenuOpen ? 0 : -280) : 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "h-full bg-slate-900 text-slate-300 flex flex-col z-[110] border-r border-slate-800 shadow-2xl lg:shadow-none",
          isMobile ? "fixed left-0 top-0" : "relative shrink-0"
        )}
      >
        <div className="p-6 flex items-center justify-between overflow-hidden whitespace-nowrap border-b border-slate-800/50 lg:border-none">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-900/40">
              <LayoutDashboard size={20} strokeWidth={2.5} />
            </div>
            {(isSidebarOpen || isMobile) && (
              <span className="font-bold text-lg tracking-tight text-white">FocusOS</span>
            )}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <div className={cn(
            "text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-3", 
            !isSidebarOpen && "hidden lg:block"
          )}>
            Sistema
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "bg-indigo-500/10 text-white" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <item.icon 
                size={20} 
                strokeWidth={activeTab === item.id ? 2.5 : 2}
                className={cn(
                  "shrink-0 transition-colors duration-300", 
                  activeTab === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )} 
              />
              {(isSidebarOpen || isMobile) && (
                <span className={cn(
                  "font-medium text-sm transition-all duration-300",
                  activeTab === item.id ? "translate-x-1" : "translate-x-0"
                )}>
                  {item.label}
                </span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          ))}
          
          {(isSidebarOpen || isMobile) && (
            <div className="pt-6">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-3">
                Projetos Ativos
              </div>
              <div className="space-y-1">
                {projects.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handleProjectSelect(p.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all group overflow-hidden",
                      selectedProjectId === p.id ? "bg-indigo-500/10 text-white" : "hover:bg-slate-800/30"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
                      <span className={cn(
                        "transition-colors truncate",
                        selectedProjectId === p.id || isProjectInactive(p) ? "text-white" : "text-slate-400 group-hover:text-white"
                      )}>{p.name}</span>
                      {isProjectInactive(p) && (
                        <div className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-bold">
                          <AlertTriangle size={8} />
                          <span>+15m</span>
                        </div>
                      )}
                    </div>
                    <ArrowUpRight size={14} className={cn("transition-opacity text-white shrink-0", selectedProjectId === p.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-2xl border border-slate-700/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-lg shrink-0 uppercase">
              {user.username.substring(0, 2)}
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white leading-none mb-1 truncate">{user.username}</div>
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider truncate">Membro Pro</div>
              </div>
            )}
            {(isSidebarOpen || isMobile) && (
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Sair"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-24 bg-slate-900 border border-slate-700 text-slate-400 rounded-full p-1.5 hover:text-white hover:border-slate-500 shadow-xl z-[60] transition-all active:scale-90"
        >
          {isSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
               <Calendar size={12} />
               <span className="capitalize">{format(new Date(), "EEEE, d 'de' MMM", { locale: ptBR })}</span>
            </div>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 ai-accent text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden xs:inline">Nova Tarefa</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto w-full min-h-full"
            >
              {activeTab === 'dashboard' && <DashboardView projects={projects} tasks={tasks} onProjectSelect={handleProjectSelect} />}
              {activeTab === 'tasks' && <TasksView tasks={tasks} projects={projects} setTasks={setTasks} onProjectSelect={handleProjectSelect} onAddTask={() => setIsTaskModalOpen(true)} onDeleteTask={deleteTask} />}
              {activeTab === 'projects' && (
                <div className="space-y-8">
                  {selectedProjectId ? (
                    <div className="space-y-6">
                      <button 
                        onClick={() => setSelectedProjectId(null)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <ChevronLeft size={16} /> Voltar para sistemas
                      </button>
                      
                      {(() => {
                        const project = projects.find(p => p.id === selectedProjectId);
                        if (!project) return null;
                        return (
                          <div className="glass p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
                            <div 
                              className="absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-8 -translate-y-8" 
                              style={{ backgroundColor: project.color }} 
                            />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                              <div className="flex items-center gap-4">
                                <div 
                                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl"
                                  style={{ backgroundColor: project.color }}
                                >
                                  {project.name.charAt(0)}
                                </div>
                                <div>
                                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                    {project.name}
                                  </h2>
                                  <p className="text-slate-400 font-medium">{project.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                 <button 
                                   onClick={() => setActiveTab('tasks')}
                                   className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                                 >
                                   <Trello size={14} />
                                   Ver no Quadro
                                 </button>
                                 <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-indigo-100">
                                   {tasks.filter(t => t.projectId === selectedProjectId).length} Tarefas
                                 </div>
                                 <button 
                                   onClick={() => setIsTaskModalOpen(true)}
                                   className="ai-accent text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"
                                 >
                                   <Plus size={20} strokeWidth={3} />
                                 </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {(['backlog', 'todo', 'in-progress', 'completed'] as const).map(status => (
                                <div key={status} className="bg-slate-50/50 rounded-[2rem] p-4 border border-slate-100/50">
                                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">
                                    {status === 'backlog' ? 'Estoque' : status === 'todo' ? 'A Fazer' : status === 'in-progress' ? 'Em Progresso' : 'Concluído'}
                                  </h3>
                                  <div className="space-y-3">
                                    {tasks.filter(t => t.projectId === selectedProjectId && t.status === status).map(task => (
                                      <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group relative">
                                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight pr-12">{task.title}</h4>
                                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{task.description}</p>
                                        
                                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-50">
                                          {(['backlog', 'todo', 'in-progress', 'completed'] as TaskStatus[]).map(s => (
                                            <button
                                              key={s}
                                              onClick={() => {
                                                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: s } : t));
                                              }}
                                              className={cn(
                                                "w-2 h-2 rounded-full transition-all hover:scale-150",
                                                task.status === s ? "ring-2 ring-offset-2 ring-indigo-500 scale-125" : "bg-slate-200",
                                                s === 'backlog' && task.status === s && "bg-slate-400",
                                                s === 'todo' && task.status === s && "bg-blue-400",
                                                s === 'in-progress' && task.status === s && "bg-amber-400",
                                                s === 'completed' && task.status === s && "bg-emerald-400"
                                              )}
                                              title={`Mover para ${s}`}
                                            />
                                          ))}
                                        </div>

                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(task.id);
                                          }}
                                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                                          title="Excluir"
                                        >
                                          <X size={14} strokeWidth={3} />
                                        </button>
                                      </div>
                                    ))}
                                    {tasks.filter(t => t.projectId === selectedProjectId && t.status === status).length === 0 && (
                                      <div className="text-center py-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Vazio</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-20">
                      {projects.map(project => (
                        <div 
                          key={project.id} 
                          onClick={() => handleProjectSelect(project.id)}
                          className="glass p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer active:scale-95"
                        >
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                             <Layers size={80} />
                          </div>
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: project.color }}>
                              {project.name.charAt(0)}
                            </div>
                            {isProjectInactive(project) && (
                              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-600 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest animate-bounce">
                                <AlertTriangle size={10} />
                                Inativo
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-xl mb-2 text-slate-900 uppercase tracking-tight">{project.name}</h3>
                          <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                               {tasks.filter(t => t.projectId === project.id).length} Tarefas Ativas
                             </span>
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('tasks');
                                  }}
                                  className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                                  title="Ver no Quadro"
                                >
                                  <Trello size={14} />
                                </button>
                                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                             </div>
                          </div>
                        </div>
                      ))}
                      
                      <button className="border-4 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all group min-h-[260px]">
                        <Plus size={32} />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-center">Conectar Novo Sistema</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask}
        projects={projects}
        initialProjectId={selectedProjectId}
      />
    </div>
  );
}
