import { Project, Task } from './types';

export const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'Barber Network', color: '#3b82f6', description: 'Plataforma de gestão para barbearias', lastAccessed: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: '2', name: 'Leads Engine', color: '#10b981', description: 'Sistema de captura e nutrição de leads', lastAccessed: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '3', name: 'WorkOS SaaS', color: '#8b5cf6', description: 'Plataforma de produtividade principal', lastAccessed: new Date().toISOString() },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    projectId: '1',
    title: 'Finalizar API de agendamento',
    description: 'Implementar lógica de conflito de horários',
    priority: 'high',
    estimatedMinutes: 60,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: 'in-progress',
    strategicWeight: 9,
    tags: ['Backend', 'API'],
    subtasks: [
      { id: 's1', title: 'Validar horários', completed: true },
      { id: 's2', title: 'Notificação Push', completed: false }
    ]
  },
  {
    id: 't2',
    projectId: '2',
    title: 'Newsletter semanal',
    description: 'Redigir e disparar para base de teste',
    priority: 'medium',
    estimatedMinutes: 30,
    deadline: new Date(Date.now() + 172800000).toISOString(),
    status: 'backlog',
    strategicWeight: 5,
    tags: ['Marketing'],
    subtasks: []
  },
  {
    id: 't3',
    projectId: '3',
    title: 'Arquitetura do Core',
    description: 'Definição dos módulos principais do WorkOS',
    priority: 'urgent',
    estimatedMinutes: 120,
    deadline: new Date().toISOString(),
    status: 'todo',
    strategicWeight: 10,
    tags: ['SaaS', 'Core'],
    subtasks: []
  }
];
