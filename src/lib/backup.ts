import { APP_NAME, todayISO } from "./data";
import type { AppState, BackupFile, FundEntry, StudyEntry } from "./types";

/**
 * Triggers a native browser file download from an in-memory string.
 */
export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Creates and downloads a complete JSON backup file with metadata.
 */
export function exportJsonBackup(state: AppState): void {
  const backup: BackupFile = {
    appName: APP_NAME,
    version: state.version || 1,
    exportedAt: new Date().toISOString(),
    summary: {
      tasksCount: state.tasks.length,
      studySessionsCount: state.study.length,
      totalStudyMinutes: state.study.reduce((n, s) => n + s.minutes, 0),
      fundsEntriesCount: state.funds.length,
      milestonesCompleted: state.doneMilestones.length,
    },
    state: {
      ...state,
      lastBackupDate: todayISO(),
    },
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const dateStr = todayISO();
  downloadBlob(jsonStr, `seoulbound28-backup-${dateStr}.json`, "application/json");
}

/**
 * Exports all Study Log entries to a CSV file.
 */
export function exportStudyCsv(study: StudyEntry[]): void {
  const headers = ["ID", "Date", "Track", "Subject", "Minutes", "Hours"];
  const rows = study.map((s) => [
    escapeCsv(s.id),
    escapeCsv(s.date),
    escapeCsv(s.track),
    escapeCsv(s.subject),
    s.minutes.toString(),
    (s.minutes / 60).toFixed(2),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  downloadBlob(csvContent, `seoulbound-study-log-${todayISO()}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Exports all Funds Ledger entries to a CSV file.
 */
export function exportFundsCsv(funds: FundEntry[]): void {
  const headers = ["ID", "Date", "Label", "Type", "Amount"];
  const rows = funds.map((f) => [
    escapeCsv(f.id),
    escapeCsv(f.date),
    escapeCsv(f.label),
    escapeCsv(f.type),
    f.amount.toFixed(2),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  downloadBlob(csvContent, `seoulbound-funds-ledger-${todayISO()}.csv`, "text/csv;charset=utf-8;");
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Validates any JSON input (supports both full BackupFile envelopes or raw AppState objects).
 */
export function validateBackupJson(rawText: string): { valid: boolean; state?: AppState; error?: string } {
  try {
    const parsed = JSON.parse(rawText);
    const candidate: Partial<AppState> = parsed && typeof parsed === "object" && "state" in parsed
      ? (parsed.state as Partial<AppState>)
      : (parsed as Partial<AppState>);

    if (!candidate || typeof candidate !== "object") {
      return { valid: false, error: "Invalid backup format: root must be an object." };
    }

    if (!Array.isArray(candidate.tasks)) {
      return { valid: false, error: "Invalid backup: 'tasks' array is missing." };
    }
    if (!Array.isArray(candidate.study)) {
      return { valid: false, error: "Invalid backup: 'study' array is missing." };
    }
    if (!Array.isArray(candidate.funds)) {
      return { valid: false, error: "Invalid backup: 'funds' array is missing." };
    }
    if (!Array.isArray(candidate.goals)) {
      return { valid: false, error: "Invalid backup: 'goals' array is missing." };
    }
    if (!Array.isArray(candidate.doneMilestones)) {
      return { valid: false, error: "Invalid backup: 'doneMilestones' array is missing." };
    }

    const sanitizedState: AppState = {
      version: typeof candidate.version === "number" ? candidate.version : 1,
      currency: candidate.currency === "USD" || candidate.currency === "KRW" ? candidate.currency : "NGN",
      projectStartDate: typeof candidate.projectStartDate === "string" ? candidate.projectStartDate : todayISO(),
      targetDate: typeof candidate.targetDate === "string" ? candidate.targetDate : "2027-09-15",
      lastBackupDate: todayISO(),
      snoozedBackupUntil: null,
      tasks: candidate.tasks.map((t) => ({
        id: String(t.id || Math.random().toString(36).slice(2)),
        title: String(t.title || "Untitled task"),
        track: t.track || "korean",
        done: Boolean(t.done),
        createdAt: String(t.createdAt || todayISO()),
        completedAt: t.completedAt ? String(t.completedAt) : undefined,
      })),
      study: candidate.study.map((s) => ({
        id: String(s.id || Math.random().toString(36).slice(2)),
        date: String(s.date || todayISO()),
        subject: String(s.subject || "Study session"),
        track: s.track || "korean",
        minutes: Number(s.minutes) || 15,
      })),
      funds: candidate.funds.map((f) => ({
        id: String(f.id || Math.random().toString(36).slice(2)),
        date: String(f.date || todayISO()),
        label: String(f.label || "Transaction"),
        type: f.type === "expense" ? "expense" : "income",
        amount: Number(f.amount) || 0,
      })),
      goals: candidate.goals.map((g) => ({
        id: String(g.id || Math.random().toString(36).slice(2)),
        label: String(g.label || "Goal"),
        target: Number(g.target) || 100,
        note: g.note ? String(g.note) : undefined,
      })),
      doneMilestones: candidate.doneMilestones.map(String),
    };

    return { valid: true, state: sanitizedState };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Failed to parse JSON file." };
  }
}

/**
 * Calculates days passed since a given ISO date.
 */
export function daysSince(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  return Math.max(0, diff);
}

/**
 * Determines whether a backup is urgently recommended.
 * Fires if:
 * 1. User has NEVER backed up and has recorded any custom data (study entries, funds, completed tasks).
 * 2. It has been 30+ days since the last backup.
 * Returns false if user recently snoozed the reminder.
 */
export function isBackupOverdue(state: AppState): boolean {
  const today = todayISO();
  if (state.snoozedBackupUntil && state.snoozedBackupUntil >= today) {
    return false;
  }

  const hasActivity =
    state.study.length > 0 ||
    state.funds.length > 0 ||
    state.doneMilestones.length > 0 ||
    state.tasks.some((t) => t.done);

  if (!state.lastBackupDate) {
    return hasActivity;
  }

  const days = daysSince(state.lastBackupDate);
  return days !== null && days >= 30;
}
