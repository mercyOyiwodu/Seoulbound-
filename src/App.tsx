import { ListChecks, PiggyBank, Route as RouteIcon, ScrollText, Settings, Sun, Timer } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import { BackupBanner } from "@/components/BackupBanner";
import { FocusView } from "@/components/FocusView";
import { FundsView } from "@/components/FundsView";
import { LogView } from "@/components/LogView";
import { RoadmapView } from "@/components/RoadmapView";
import { SettingsModal } from "@/components/SettingsModal";
import { Taegeuk } from "@/components/Taegeuk";
import { TasksView } from "@/components/TasksView";
import { TodayView } from "@/components/TodayView";
import type { ViewId } from "@/lib/types";

const VIEWS: { id: ViewId; num: string; label: string; icon: typeof Sun }[] = [
  { id: "today", num: "01", label: "Today", icon: Sun },
  { id: "focus", num: "02", label: "Focus", icon: Timer },
  { id: "roadmap", num: "03", label: "Roadmap", icon: RouteIcon },
  { id: "tasks", num: "04", label: "Tasks", icon: ListChecks },
  { id: "log", num: "05", label: "Study log", icon: ScrollText },
  { id: "funds", num: "06", label: "Funds", icon: PiggyBank },
];

export default function App() {
  const [view, setView] = useState<ViewId>("today");
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-100dvh pb-24 md:pb-0">
      <Toaster position="top-center" richColors closeButton />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <Taegeuk size={34} />
          <div className="leading-none">
            <p className="font-display text-base tracking-wide">SEOULBOUND &rsquo;28</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              GKS study command center
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <nav className="hidden gap-1 md:flex" aria-label="Main">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  aria-current={view === v.id ? "page" : undefined}
                  className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-bold transition-colors duration-200 ${
                    view === v.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="mr-1.5 text-[10px] opacity-60">{v.num}</span>
                  {v.label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setSettingsOpen(true)}
              title="Settings & Data Protection"
              aria-label="Settings and Data Protection"
              className="inline-flex cursor-pointer items-center justify-center rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <BackupBanner onOpenSettings={() => setSettingsOpen(true)} />

        {view === "today" && <TodayView go={setView} />}
        {view === "focus" && <FocusView />}
        {view === "roadmap" && <RoadmapView />}
        {view === "tasks" && <TasksView />}
        {view === "log" && <LogView go={setView} />}
        {view === "funds" && <FundsView />}
      </main>

      <footer className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="max-w-prose text-xs font-semibold leading-relaxed text-muted-foreground">
            Dates follow published GKS and TOPIK cycles. Your study progress and financial records are stored securely in
            this browser. Remember to export regular backups.
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer text-xs font-bold text-primary hover:underline self-start sm:self-auto"
          >
            Backup & Settings
          </button>
        </div>
      </footer>

      {/* mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Main mobile"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 min-w-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1.5 text-[9px] font-bold uppercase tracking-tight transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2} />
                <span className="truncate">{v.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
