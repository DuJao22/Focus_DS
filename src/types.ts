/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'completed';

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
  lastAccessed?: string; // ISO string
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: number;
  deadline: string;
  status: TaskStatus;
  strategicWeight: number; // 1-10
  tags?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export interface Routine {
  id: string;
  title: string;
  daysOfWeek: number[]; // 0-6
  startTime: string; // "HH:mm"
  durationMinutes: number;
}
