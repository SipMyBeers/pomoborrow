"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimerRing, DayRing } from "@/components/timer-ring";
import { TaskList } from "@/components/task-list";
import {
  type TimerMode,
  type TimerState,
  type TimerSession,
  type Task,
  DEFAULT_CONFIG,
  getDurationForMode,
  getNextMode,
  formatTime,
  generateId,
  loadConfig,
  loadSessions,
  loadTasks,
  saveSessions,
  saveTasks,
  getTodaySessions,
  getTotalFocusTime,
  getStreak,
} from "@/lib/timer";
import { Play, Pause, SkipForward, RotateCcw, Flame, Timer, Target, TrendingUp } from "lucide-react";

export default function Home() {
  const [config] = useState(DEFAULT_CONFIG);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [state, setState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_CONFIG.focusDuration * 60);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  const [completedToday, setCompletedToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(0);

  // Load persisted data
  useEffect(() => {
    const savedConfig = loadConfig();
    const savedSessions = loadSessions();
    const savedTasks = loadTasks();
    setSessions(savedSessions);
    setTasks(savedTasks);
    setSecondsLeft(savedConfig.focusDuration * 60);
    setCompletedToday(getTodaySessions(savedSessions).length);
  }, []);

  // Save tasks when they change
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  // Timer tick
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(intervalRef.current!);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const completeSession = useCallback(() => {
    const duration = getDurationForMode(mode, config);
    const session: TimerSession = {
      id: generateId(),
      mode,
      startedAt: sessionStartRef.current,
      endedAt: Date.now(),
      duration,
      taskId: activeTaskId || undefined,
      completed: true,
    };

    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    saveSessions(newSessions);

    // Update task pomodoro count
    if (mode === "focus" && activeTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId
            ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
            : t
        )
      );
    }

    if (mode === "focus") {
      setCompletedToday((prev) => prev + 1);
    }

    // Play notification sound
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(
          mode === "focus" ? "Focus session complete!" : "Break is over!",
          { body: mode === "focus" ? "Time for a break." : "Ready to focus?" }
        );
      }
    }

    // Move to next mode
    const nextMode = getNextMode(mode, getTodaySessions(newSessions).length, config);
    setMode(nextMode);
    setSecondsLeft(getDurationForMode(nextMode, config));
    setState("idle");

    if (
      (nextMode !== "focus" && config.autoStartBreaks) ||
      (nextMode === "focus" && config.autoStartFocus)
    ) {
      setTimeout(() => startTimer(nextMode), 1000);
    }
  }, [mode, config, sessions, activeTaskId]);

  function startTimer(overrideMode?: TimerMode) {
    const m = overrideMode || mode;
    if (state === "idle") {
      setSecondsLeft(getDurationForMode(m, config));
      sessionStartRef.current = Date.now();
    }
    setState("running");
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function pauseTimer() {
    setState("paused");
  }

  function resetTimer() {
    setState("idle");
    setSecondsLeft(getDurationForMode(mode, config));
  }

  function skipToNext() {
    const nextMode = getNextMode(mode, completedToday, config);
    setMode(nextMode);
    setSecondsLeft(getDurationForMode(nextMode, config));
    setState("idle");
  }

  function switchMode(m: TimerMode) {
    if (state === "running") return;
    setMode(m);
    setSecondsLeft(getDurationForMode(m, config));
    setState("idle");
  }

  const totalDuration = getDurationForMode(mode, config);
  const progress = 1 - secondsLeft / totalDuration;
  const todayFocusMinutes = Math.round(getTotalFocusTime(getTodaySessions(sessions)) / 60);
  const streak = getStreak(sessions);

  const modeColors: Record<TimerMode, string> = {
    focus: "hsl(0 84.2% 60.2%)",
    "short-break": "hsl(142.1 76.2% 36.3%)",
    "long-break": "hsl(221.2 83.2% 53.3%)",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            Pomo<span className="text-primary">Borrow</span>
          </span>
          <Badge variant="secondary" className="text-[10px]">Beta</Badge>
        </div>
        <div className="flex items-center gap-4">
          {/* Quick stats in header */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="tabular-nums">{streak}d streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span className="tabular-nums">{completedToday} today</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left: Timer */}
          <div className="flex flex-col items-center gap-6">
            {/* Mode selector */}
            <Tabs value={mode} onValueChange={(v) => switchMode(v as TimerMode)}>
              <TabsList>
                <TabsTrigger value="focus" disabled={state === "running"}>
                  Focus
                </TabsTrigger>
                <TabsTrigger value="short-break" disabled={state === "running"}>
                  Short Break
                </TabsTrigger>
                <TabsTrigger value="long-break" disabled={state === "running"}>
                  Long Break
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Timer ring */}
            <div className="relative">
              <DayRing sessions={sessions} size={280} />
              <TimerRing
                progress={progress}
                size={280}
                strokeWidth={10}
                color={modeColors[mode]}
              >
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold tabular-nums tracking-tight">
                    {formatTime(secondsLeft)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {mode.replace("-", " ")}
                  </div>
                  {activeTaskId && (
                    <div className="text-xs text-muted-foreground mt-2 max-w-[160px] truncate text-center">
                      {tasks.find((t) => t.id === activeTaskId)?.title}
                    </div>
                  )}
                </div>
              </TimerRing>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={resetTimer}
                disabled={state === "idle"}
                className="h-10 w-10"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                onClick={state === "running" ? pauseTimer : () => startTimer()}
                className="h-14 w-14 rounded-full"
                style={{
                  backgroundColor: modeColors[mode],
                  borderColor: modeColors[mode],
                }}
              >
                {state === "running" ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={skipToNext}
                className="h-10 w-10"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Session counter */}
            <div className="flex gap-1.5">
              {Array.from({ length: config.longBreakInterval }, (_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < completedToday % config.longBreakInterval
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold tabular-nums">{completedToday}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold tabular-nums">{todayFocusMinutes}m</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Focus Time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold tabular-nums">{streak}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Tasks */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  onTasksChange={setTasks}
                  onSelectTask={setActiveTaskId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
