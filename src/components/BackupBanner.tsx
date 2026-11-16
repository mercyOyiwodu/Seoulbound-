import { Download, ShieldAlert, Sliders, X } from "lucide-react";
import { daysSince, isBackupOverdue } from "@/lib/backup";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function BackupBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const store = useStore();
  const { lastBackupDate, exportBackup, snoozeBackupReminder } = store;

  const overdue = isBackupOverdue(store);
  if (!overdue) return null;

  const days = daysSince(lastBackupDate);

  const handleDownload = () => {
    exportBackup();
    toast.success("JSON backup downloaded! Your study records are safe.", {
      description: "Store this file in Google Drive or safe offline storage.",
    });
  };

  const handleSnooze = () => {
    snoozeBackupReminder(7);
    toast.info("Backup reminder snoozed for 7 days.");
  };

  return (
    <div
      role="alert"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      style={{ borderLeftWidth: "6px", borderLeftColor: "hsl(var(--destructive))" }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-destructive/15 p-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="leading-snug">
          <p className="text-sm font-bold text-foreground">
            {lastBackupDate === null
              ? "Crucial: Your study data is only stored in this browser."
              : `Monthly Backup Reminder (${days} days since last backup)`}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            A single browser cache clear or Safari cleanup will erase all your logged sessions, tasks, and exam funds.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
        <button
          onClick={handleDownload}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-all duration-200 hover:scale-105"
        >
          <Download className="h-3.5 w-3.5" /> Backup Now
        </button>
        <button
          onClick={onOpenSettings}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Sliders className="h-3.5 w-3.5" /> Manage
        </button>
        <button
          onClick={handleSnooze}
          title="Snooze for 7 days"
          className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
