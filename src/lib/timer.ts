// PomoBorrow Timer Engine

export type TimerMode = 'focus' | 'short-break' | 'long-break';
export type TimerState = 'idle' | 'running' | 'paused';

export interface TimerConfig {
  focusDuration: number;      // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number;  // minutes
  longBreakInterval: number;  // sessions before long break
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface TimerSession {
  id: string;
  mode: TimerMode;
  startedAt: number;
  endedAt?: number;
  duration: number;  // seconds completed
  taskId?: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: number;
}

export const DEFAULT_CONFIG: TimerConfig = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

export function getDurationForMode(mode: TimerMode, config: TimerConfig): number {
  switch (mode) {
    case 'focus': return config.focusDuration * 60;
    case 'short-break': return config.shortBreakDuration * 60;
    case 'long-break': return config.longBreakDuration * 60;
  }
}

export function getNextMode(
  currentMode: TimerMode,
  completedSessions: number,
  config: TimerConfig
): TimerMode {
  if (currentMode === 'focus') {
    return (completedSessions + 1) % config.longBreakInterval === 0
      ? 'long-break'
      : 'short-break';
  }
  return 'focus';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// 24-hour ring calculation
export function get24HourAngle(): number {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  return (totalMinutes / 1440) * 360; // 1440 = 24*60
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Persistence
const STORAGE_KEYS = {
  config: 'pomoborrow-config',
  sessions: 'pomoborrow-sessions',
  tasks: 'pomoborrow-tasks',
  stats: 'pomoborrow-stats',
};

export function saveConfig(config: TimerConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  }
}

export function loadConfig(): TimerConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const stored = localStorage.getItem(STORAGE_KEYS.config);
  return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
}

export function saveSessions(sessions: TimerSession[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }
}

export function loadSessions(): TimerSession[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.sessions);
  return stored ? JSON.parse(stored) : [];
}

export function saveTasks(tasks: Task[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }
}

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.tasks);
  return stored ? JSON.parse(stored) : [];
}

// Stats helpers
export function getTodaySessions(sessions: TimerSession[]): TimerSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime();
  return sessions.filter(s => s.startedAt >= start && s.mode === 'focus' && s.completed);
}

export function getTotalFocusTime(sessions: TimerSession[]): number {
  return sessions
    .filter(s => s.mode === 'focus' && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getStreak(sessions: TimerSession[]): number {
  const days = new Set<string>();
  sessions
    .filter(s => s.mode === 'focus' && s.completed)
    .forEach(s => {
      const d = new Date(s.startedAt);
      days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}
