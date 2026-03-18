"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Task, generateId } from "@/lib/timer";
import { Plus, Check, Trash2 } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  activeTaskId?: string;
  onTasksChange: (tasks: Task[]) => void;
  onSelectTask: (taskId: string) => void;
}

export function TaskList({ tasks, activeTaskId, onTasksChange, onSelectTask }: TaskListProps) {
  const [newTask, setNewTask] = useState("");

  function addTask() {
    if (!newTask.trim()) return;
    const task: Task = {
      id: generateId(),
      title: newTask.trim(),
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      completed: false,
      createdAt: Date.now(),
    };
    onTasksChange([task, ...tasks]);
    setNewTask("");
  }

  function toggleComplete(id: string) {
    onTasksChange(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  function deleteTask(id: string) {
    onTasksChange(tasks.filter((t) => t.id !== id));
  }

  const active = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="w-full">
      {/* Add task */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="What are you working on?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="bg-background"
        />
        <Button size="icon" variant="outline" onClick={addTask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Active tasks */}
      <div className="space-y-1">
        {active.map((task) => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
              ${activeTaskId === task.id
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50"
              }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }}
              className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors flex-shrink-0"
            >
            </button>
            <span className="flex-1 text-sm">{task.title}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {task.completedPomodoros}/{task.estimatedPomodoros}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
              className="text-muted-foreground/30 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Completed ({done.length})
          </div>
          <div className="space-y-1">
            {done.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50"
              >
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="w-5 h-5 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center flex-shrink-0"
                >
                  <Check className="h-3 w-3 text-primary" />
                </button>
                <span className="flex-1 text-sm line-through">{task.title}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground/30 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          Add a task to get started
        </div>
      )}
    </div>
  );
}
