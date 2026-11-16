export type TrackId = "korean" | "english" | "gks" | "python";

export interface Milestone {
  id: string;
  track: TrackId;
  label: string;
  date?: string; // YYYY-MM-DD
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  track: TrackId;
  done: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface StudyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  track: TrackId;
  minutes: number;
}

export interface FundEntry {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  type: "income" | "expense";
  amount: number;
}

export interface FundGoal {
  id: string;
  label: string;
  target: number;
  note?: string;
}

export interface Track {
  id: TrackId;
  name: string;
  ko: string;
  colorClass: string;
  blurb: string;
}

export type ViewId = "today" | "roadmap" | "tasks" | "log" | "funds";

export interface AppState {
  version: number;
  projectStartDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  lastBackupDate: string | null; // ISO YYYY-MM-DD
  snoozedBackupUntil?: string | null; // ISO YYYY-MM-DD
  tasks: Task[];
  study: StudyEntry[];
  funds: FundEntry[];
  goals: FundGoal[];
  doneMilestones: string[];
}

export interface BackupFile {
  appName: string;
  version: number;
  exportedAt: string;
  summary: {
    tasksCount: number;
    studySessionsCount: number;
    totalStudyMinutes: number;
    fundsEntriesCount: number;
    milestonesCompleted: number;
  };
  state: AppState;
}
