import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  exportFundsCsv,
  exportJsonBackup,
  exportStudyCsv,
  validateBackupJson,
} from "./backup";
import { DEFAULT_GOALS, DEFAULT_TASKS, GKS_WINDOW_OPEN, todayISO, uid } from "./data";
import type { AppState, FundEntry, StudyEntry, Task } from "./types";

interface Store extends AppState {
  addTask: (title: string, track: Task["track"]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addStudy: (subject: string, track: StudyEntry["track"], minutes: number) => void;
  deleteStudy: (id: string) => void;
  addFund: (label: string, type: FundEntry["type"], amount: number) => void;
  deleteFund: (id: string) => void;
  updateGoalTarget: (id: string, target: number) => void;
  toggleMilestone: (id: string) => void;
  exportBackup: () => void;
  exportStudyLog: () => void;
  exportFundsLedger: () => void;
  importBackup: (jsonText: string, mode: "replace" | "merge") => { success: boolean; error?: string };
  updateProjectStartDate: (date: string) => void;
  updateTargetDate: (date: string) => void;
  snoozeBackupReminder: (days?: number) => void;
  resetAllData: () => void;
  activityDates: Set<string>;
  streak: number;
}

const STORAGE_KEY = "seoulbound28.v1";
const SNAPSHOT_KEY = "seoulbound28.snapshot";

function seed(): AppState {
  const created = todayISO();
  return {
    version: 1,
    projectStartDate: created,
    targetDate: GKS_WINDOW_OPEN,
    lastBackupDate: null,
    snoozedBackupUntil: null,
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, id: uid(), createdAt: created })),
    study: [],
    funds: [],
    goals: DEFAULT_GOALS,
    doneMilestones: [],
  };
}

function sanitizeLoadedState(raw: unknown): AppState {
  if (!raw || typeof raw !== "object") return seed();
  const obj = raw as Partial<AppState>;
  const base = seed();

  return {
    version: typeof obj.version === "number" ? obj.version : 1,
    projectStartDate: typeof obj.projectStartDate === "string" && obj.projectStartDate ? obj.projectStartDate : base.projectStartDate,
    targetDate: typeof obj.targetDate === "string" && obj.targetDate ? obj.targetDate : base.targetDate,
    lastBackupDate: typeof obj.lastBackupDate === "string" ? obj.lastBackupDate : null,
    snoozedBackupUntil: typeof obj.snoozedBackupUntil === "string" ? obj.snoozedBackupUntil : null,
    tasks: Array.isArray(obj.tasks) ? obj.tasks : base.tasks,
    study: Array.isArray(obj.study) ? obj.study : [],
    funds: Array.isArray(obj.funds) ? obj.funds : [],
    goals: Array.isArray(obj.goals) && obj.goals.length ? obj.goals : base.goals,
    doneMilestones: Array.isArray(obj.doneMilestones) ? obj.doneMilestones : [],
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if fallback snapshot exists before assuming empty state
      const snapshot = localStorage.getItem(SNAPSHOT_KEY);
      if (snapshot) {
        try {
          return sanitizeLoadedState(JSON.parse(snapshot));
        } catch {
          // ignore
        }
      }
      return seed();
    }
    const parsed = JSON.parse(raw);
    return sanitizeLoadedState(parsed);
  } catch (err) {
    console.error("Failed to load primary storage, checking snapshot fallback...", err);
    try {
      const snapshot = localStorage.getItem(SNAPSHOT_KEY);
      if (snapshot) {
        return sanitizeLoadedState(JSON.parse(snapshot));
      }
    } catch {
      // ignore
    }
    return seed();
  }
}

function computeStreak(dates: Set<string>): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const iso = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  if (!dates.has(iso(d))) d.setDate(d.getDate() - 1); // today still young
  let n = 0;
  while (dates.has(iso(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);

  // Synchronize state and maintain rolling snapshot for disaster recovery
  useEffect(() => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(SNAPSHOT_KEY, serialized);
    } catch (err) {
      console.warn("localStorage write failed (quota exceeded or storage blocked):", err);
    }
  }, [state]);

  const addTask = useCallback((title: string, track: Task["track"]) => {
    const t = title.trim();
    if (!t) return;
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { id: uid(), title: t, track, done: false, createdAt: todayISO() }],
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? todayISO() : undefined }
          : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const addStudy = useCallback((subject: string, track: StudyEntry["track"], minutes: number) => {
    const sub = subject.trim();
    if (!sub || !minutes || minutes <= 0) return;
    setState((s) => ({
      ...s,
      study: [...s.study, { id: uid(), date: todayISO(), subject: sub, track, minutes }],
    }));
  }, []);

  const deleteStudy = useCallback((id: string) => {
    setState((s) => ({ ...s, study: s.study.filter((e) => e.id !== id) }));
  }, []);

  const addFund = useCallback((label: string, type: FundEntry["type"], amount: number) => {
    const l = label.trim();
    if (!l || !amount || amount <= 0) return;
    setState((s) => ({
      ...s,
      funds: [...s.funds, { id: uid(), date: todayISO(), label: l, type, amount }],
    }));
  }, []);

  const deleteFund = useCallback((id: string) => {
    setState((s) => ({ ...s, funds: s.funds.filter((e) => e.id !== id) }));
  }, []);

  const updateGoalTarget = useCallback((id: string, target: number) => {
    if (!target || target <= 0) return;
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, target } : g)),
    }));
  }, []);

  const toggleMilestone = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      doneMilestones: s.doneMilestones.includes(id)
        ? s.doneMilestones.filter((m) => m !== id)
        : [...s.doneMilestones, id],
    }));
  }, []);

  const exportBackup = useCallback(() => {
    exportJsonBackup(state);
    setState((s) => ({
      ...s,
      lastBackupDate: todayISO(),
      snoozedBackupUntil: null,
    }));
  }, [state]);

  const exportStudyLog = useCallback(() => {
    exportStudyCsv(state.study);
  }, [state.study]);

  const exportFundsLedger = useCallback(() => {
    exportFundsCsv(state.funds);
  }, [state.funds]);

  const importBackup = useCallback((jsonText: string, mode: "replace" | "merge") => {
    const res = validateBackupJson(jsonText);
    if (!res.valid || !res.state) {
      return { success: false, error: res.error || "Unknown validation error" };
    }

    const imported = res.state;

    if (mode === "replace") {
      setState(imported);
      return { success: true };
    }

    // Merge mode: deduplicate by ID while preserving new items
    setState((curr) => {
      const taskIds = new Set(curr.tasks.map((t) => t.id));
      const studyIds = new Set(curr.study.map((s) => s.id));
      const fundIds = new Set(curr.funds.map((f) => f.id));
      const milestoneSet = new Set([...curr.doneMilestones, ...imported.doneMilestones]);

      const mergedTasks = [...curr.tasks];
      imported.tasks.forEach((t) => {
        if (!taskIds.has(t.id)) mergedTasks.push(t);
      });

      const mergedStudy = [...curr.study];
      imported.study.forEach((s) => {
        if (!studyIds.has(s.id)) mergedStudy.push(s);
      });

      const mergedFunds = [...curr.funds];
      imported.funds.forEach((f) => {
        if (!fundIds.has(f.id)) mergedFunds.push(f);
      });

      return {
        ...curr,
        lastBackupDate: todayISO(),
        tasks: mergedTasks,
        study: mergedStudy,
        funds: mergedFunds,
        doneMilestones: Array.from(milestoneSet),
      };
    });

    return { success: true };
  }, []);

  const updateProjectStartDate = useCallback((date: string) => {
    if (!date) return;
    setState((s) => ({ ...s, projectStartDate: date }));
  }, []);

  const updateTargetDate = useCallback((date: string) => {
    if (!date) return;
    setState((s) => ({ ...s, targetDate: date }));
  }, []);

  const snoozeBackupReminder = useCallback((days = 7) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setState((s) => ({ ...s, snoozedBackupUntil: iso }));
  }, []);

  const resetAllData = useCallback(() => {
    const s = seed();
    setState(s);
  }, []);

  const activityDates = useMemo(() => {
    const set = new Set<string>();
    state.tasks.forEach((t) => t.completedAt && set.add(t.completedAt));
    state.study.forEach((e) => set.add(e.date));
    return set;
  }, [state.tasks, state.study]);

  const streak = useMemo(() => computeStreak(activityDates), [activityDates]);

  const value = useMemo<Store>(
    () => ({
      ...state,
      addTask,
      toggleTask,
      deleteTask,
      addStudy,
      deleteStudy,
      addFund,
      deleteFund,
      updateGoalTarget,
      toggleMilestone,
      exportBackup,
      exportStudyLog,
      exportFundsLedger,
      importBackup,
      updateProjectStartDate,
      updateTargetDate,
      snoozeBackupReminder,
      resetAllData,
      activityDates,
      streak,
    }),
    [
      state,
      addTask,
      toggleTask,
      deleteTask,
      addStudy,
      deleteStudy,
      addFund,
      deleteFund,
      updateGoalTarget,
      toggleMilestone,
      exportBackup,
      exportStudyLog,
      exportFundsLedger,
      importBackup,
      updateProjectStartDate,
      updateTargetDate,
      snoozeBackupReminder,
      resetAllData,
      activityDates,
      streak,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside AppProvider");
  return ctx;
}
