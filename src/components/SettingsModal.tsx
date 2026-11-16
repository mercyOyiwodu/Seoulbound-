import {
  Calendar,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import { daysSince } from "@/lib/backup";
import { fmtDate } from "@/lib/data";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useStore } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const {
    tasks,
    study,
    funds,
    doneMilestones,
    lastBackupDate,
    projectStartDate,
    targetDate,
    currency,
    setCurrency,
    exportBackup,
    exportStudyLog,
    exportFundsLedger,
    importBackup,
    updateProjectStartDate,
    updateTargetDate,
    resetAllData,
  } = useStore();

  const { isInstallable, isInstalled, isIOS, promptInstall } = useInstallPrompt();

  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileSummary, setFileSummary] = useState<{
    tasks: number;
    study: number;
    funds: number;
    goals: number;
    milestones: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [newStartDate, setNewStartDate] = useState(projectStartDate);
  const [newTargetDate, setNewTargetDate] = useState(targetDate);

  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showResetZone, setShowResetZone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNewStartDate(projectStartDate);
    setNewTargetDate(targetDate);
  }, [projectStartDate, targetDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setFileSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);

      try {
        const parsed = JSON.parse(text);
        const stateCandidate = parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : parsed;
        if (!stateCandidate || typeof stateCandidate !== "object") {
          throw new Error("Invalid structure");
        }
        setFileSummary({
          tasks: Array.isArray(stateCandidate.tasks) ? stateCandidate.tasks.length : 0,
          study: Array.isArray(stateCandidate.study) ? stateCandidate.study.length : 0,
          funds: Array.isArray(stateCandidate.funds) ? stateCandidate.funds.length : 0,
          goals: Array.isArray(stateCandidate.goals) ? stateCandidate.goals.length : 0,
          milestones: Array.isArray(stateCandidate.doneMilestones) ? stateCandidate.doneMilestones.length : 0,
        });
      } catch {
        setImportError("File is not a valid Seoulbound JSON backup.");
        setFileContent(null);
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const executeImport = () => {
    if (!fileContent) return;
    const res = importBackup(fileContent, importMode);
    if (res.success) {
      toast.success(
        importMode === "replace"
          ? "Data successfully restored from backup!"
          : "Backup data successfully merged with current records!"
      );
      setFileContent(null);
      setFileSummary(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } else {
      setImportError(res.error || "Import failed.");
      toast.error("Import failed: " + res.error);
    }
  };

  const handleSaveTimeline = () => {
    updateProjectStartDate(newStartDate);
    updateTargetDate(newTargetDate);
    toast.success("Timeline settings updated.");
  };

  const handleExecuteReset = () => {
    if (resetConfirmText.trim() !== "RESET") {
      toast.error("Type 'RESET' to confirm wiping data.");
      return;
    }
    resetAllData();
    toast.info("Application data reset to default.");
    setResetConfirmText("");
    setShowResetZone(false);
    onClose();
  };

  const totalStudyMinutes = study.reduce((n, s) => n + s.minutes, 0);
  const daysAgo = daysSince(lastBackupDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="paper-card relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/15 p-2.5 text-primary">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl leading-none">Settings & Data Protection</h2>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Backup, export, restore, and timeline calibration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Section 1: Backup & Export */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                1. Safe Backup & Exports
              </h3>
              <span className="text-xs font-bold text-muted-foreground">
                Last backup: {lastBackupDate ? `${fmtDate(lastBackupDate)} (${daysAgo}d ago)` : "Never"}
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-xs font-semibold text-muted-foreground">
              <p>
                <strong>Current stored data:</strong> {tasks.length} tasks · {study.length} study sessions (
                {(totalStudyMinutes / 60).toFixed(1)} hrs) · {funds.length} fund records · {doneMilestones.length} of 23
                milestones.
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <button
                onClick={() => {
                  exportBackup();
                  toast.success("Complete JSON backup saved!");
                }}
                className="inline-flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-center text-xs font-bold text-primary-foreground transition-all duration-200 hover:scale-[1.02]"
              >
                <Download className="h-5 w-5" />
                <span>JSON Full Backup</span>
                <span className="text-[10px] opacity-80">(Recommended)</span>
              </button>

              <button
                onClick={() => {
                  exportStudyLog();
                  toast.success("Study log exported as CSV!");
                }}
                className="inline-flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-3 text-center text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span>Study Log (CSV)</span>
                <span className="text-[10px] text-muted-foreground">Spreadsheet format</span>
              </button>

              <button
                onClick={() => {
                  exportFundsLedger();
                  toast.success("Funds ledger exported as CSV!");
                }}
                className="inline-flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-3 text-center text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span>Funds Ledger (CSV)</span>
                <span className="text-[10px] text-muted-foreground">Accounting format</span>
              </button>
            </div>
          </section>

          {/* Section 2: PWA Installation & Offline Mode */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                2. Install App to Device (PWA)
              </h3>
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              Install Seoulbound &rsquo;28 on your phone or computer to use it offline like a native app, right from your home screen.
            </p>

            {isInstalled ? (
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-bold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>App is installed and running in standalone offline mode!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={async () => {
                  const accepted = await promptInstall();
                  if (accepted) toast.success("App installed successfully!");
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-105"
              >
                <Smartphone className="h-4 w-4" /> Install to Home Screen
              </button>
            ) : isIOS ? (
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs font-semibold text-muted-foreground">
                <p className="font-bold text-foreground">To install on iPhone or iPad:</p>
                <p className="mt-1">
                  1. Tap the <strong>Share</strong> button (box with upward arrow ⎋) at the bottom of Safari.
                </p>
                <p>2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (➕).</p>
              </div>
            ) : (
              <p className="text-xs font-semibold text-muted-foreground">
                To install on your browser, click the install icon in your address bar or browser menu (<strong>&ldquo;Install Seoulbound &rsquo;28&rdquo;</strong>).
              </p>
            )}
          </section>

          {/* Section 3: Import & Restore */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              3. Restore / Import Data
            </h3>
            <p className="text-xs font-semibold text-muted-foreground">
              Upload a previously downloaded <code>.json</code> backup to restore or transfer records to this device.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="min-h-11 flex-1 cursor-pointer rounded-2xl border border-input bg-background px-3 py-2 text-xs font-semibold file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-bold file:text-primary-foreground hover:file:opacity-90"
              />
            </div>

            {importError && (
              <p className="rounded-xl bg-destructive/15 p-3 text-xs font-bold text-destructive">
                {importError}
              </p>
            )}

            {fileSummary && (
              <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Valid Backup Detected</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Contains: <strong>{fileSummary.tasks}</strong> tasks, <strong>{fileSummary.study}</strong> study sessions,{" "}
                  <strong>{fileSummary.funds}</strong> fund entries, and <strong>{fileSummary.milestones}</strong> completed
                  milestones.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === "merge"}
                      onChange={() => setImportMode("merge")}
                    />
                    <span>Merge (Combine without losing current data)</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                    />
                    <span className="text-destructive">Replace (Overwrite current data completely)</span>
                  </label>
                </div>

                <button
                  onClick={executeImport}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all duration-200 hover:scale-105"
                >
                  <Upload className="h-4 w-4" /> Confirm & Import Data
                </button>
              </div>
            )}
          </section>

          {/* Section 4: Timeline & Dates Settings */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              4. Runway & Timeline Settings
            </h3>
            <p className="text-xs font-semibold text-muted-foreground">
              Configure your preparation runway start and the target GKS Embassy Track opening date.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground">
                  Currency Format
                </label>
                <select
                  value={currency}
                  onChange={(e) => {
                    const c = e.target.value as "NGN" | "USD" | "KRW";
                    setCurrency(c);
                    toast.success(
                      `Currency set to ${c === "NGN" ? "Nigerian Naira (₦)" : c === "KRW" ? "Korean Won (₩)" : "US Dollar ($)"}`
                    );
                  }}
                  className="mt-1 min-h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-primary"
                >
                  <option value="NGN">₦ NGN (Nigerian Naira)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="KRW">₩ KRW (Korean Won)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground">
                  Runway Start Date
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground">
                  Target GKS Window Opening
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={handleSaveTimeline}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition-colors hover:bg-muted"
            >
              <Calendar className="h-4 w-4 text-primary" /> Save Timeline Dates
            </button>
          </section>

          {/* Section 5: Danger Zone */}
          <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-destructive">5. Danger Zone: Reset Application Data</h3>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  Reset tasks, logs, and funds back to initial factory setup.
                </p>
              </div>
              <button
                onClick={() => setShowResetZone(!showResetZone)}
                className="cursor-pointer text-xs font-bold text-destructive hover:underline"
              >
                {showResetZone ? "Hide" : "Show Options"}
              </button>
            </div>

            {showResetZone && (
              <div className="mt-4 space-y-3 border-t border-destructive/20 pt-4">
                <p className="text-xs font-semibold text-destructive">
                  ⚠️ This action cannot be undone unless you have a JSON backup file!
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Type RESET to confirm"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="min-h-10 flex-1 rounded-xl border border-destructive/40 bg-background px-3 text-xs font-bold outline-none focus:border-destructive"
                  />
                  <button
                    onClick={handleExecuteReset}
                    disabled={resetConfirmText.trim() !== "RESET"}
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-destructive px-4 text-xs font-bold text-destructive-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset All Data
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
