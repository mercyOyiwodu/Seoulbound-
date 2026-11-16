import { ArrowRight, Flame, PiggyBank, Route, Sparkles, Timer } from "lucide-react";
import { RoundCheck } from "@/components/RoundCheck";
import { MILESTONES, PHRASES, TRACKS, daysUntil, fmtDate, fmtMoney } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { ViewId } from "@/lib/types";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function isoDayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function minutesThisWeek(study: { date: string; minutes: number }[]): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  const iso = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return study.filter((e) => e.date >= iso(monday)).reduce((n, e) => n + e.minutes, 0);
}

export function TodayView({ go }: { go: (v: ViewId) => void }) {
  const { tasks, toggleTask, streak, study, funds, doneMilestones, projectStartDate, targetDate, currency } = useStore();

  const days = daysUntil(targetDate);

  // Dynamic runway math based on user-configured or initialized start date
  const startMs = new Date(projectStartDate + "T00:00:00").getTime();
  const targetMs = new Date(targetDate + "T00:00:00").getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowMs = now.getTime();

  const totalDays = Math.max(1, Math.round((targetMs - startMs) / 86400000));
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.round((nowMs - startMs) / 86400000)));
  const pct = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  const phrase = PHRASES[isoDayIndex() % PHRASES.length];
  const pending = tasks.filter((t) => !t.done).slice(0, 5);
  const balance = funds.reduce((n, e) => n + (e.type === "income" ? e.amount : -e.amount), 0);
  const msPct = Math.round((doneMilestones.length / MILESTONES.length) * 100);
  const nextUp = MILESTONES.filter((m) => !doneMilestones.includes(m.id) && m.date).sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? "")
  )[0];

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-6">
      {/* hero card */}
      <section className="paper-card overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct / 100)}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl leading-none">{days}</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">days</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              {greeting()}, future GKS scholar
            </p>
            <h1 className="mt-2 text-2xl leading-snug sm:text-3xl">
              GKS Embassy Window — {fmtDate(targetDate)}
            </h1>
            <p className="mt-2 text-muted-foreground">
              You failed the 2027 round. That was rehearsal. {pct}% of your runway is behind you ({elapsedDays} of{" "}
              {totalDays} days) — keep walking.
            </p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
              <button
                onClick={() => go("focus")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform duration-200 hover:scale-105"
              >
                <Sparkles className="h-4 w-4" /> Enter Focus Room (집중실)
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-secondary/60 px-6 py-5 sm:px-8">
          <p className="font-display text-xl text-foreground">{phrase.ko}</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{phrase.en}</p>
        </div>
      </section>

      {/* stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { icon: Flame, label: "Day streak", value: `${streak}`, cls: "track-korean" },
          { icon: Timer, label: "Study this week", value: `${minutesThisWeek(study)} min`, cls: "track-english" },
          { icon: PiggyBank, label: "Funds balance", value: fmtMoney(balance, currency), cls: "track-gks" },
          { icon: Route, label: "Milestones", value: `${msPct}%`, cls: "track-python" },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className={`paper-card ${cls} p-4`}>
            <Icon className="h-5 w-5" style={{ color: "hsl(var(--track))" }} />
            <p className="mt-2 font-display text-xl leading-none">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      {/* next up + today */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="paper-card p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Next milestone</p>
          {nextUp ? (
            <>
              <p className="mt-2 font-display text-lg leading-snug">{nextUp.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Due{" "}
                {new Date((nextUp.date ?? "") + "T00:00:00").toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {nextUp.note ? ` · ${nextUp.note}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-2 font-display text-lg">Everything checked. Rest well.</p>
          )}
          <button
            onClick={() => go("roadmap")}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            See the full roadmap <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <section className="paper-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Up next today</p>
            <button
              onClick={() => go("tasks")}
              className="cursor-pointer text-sm font-bold text-primary hover:underline"
            >
              All tasks
            </button>
          </div>
          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing pending. Add a task or enjoy the win.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {pending.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <RoundCheck checked={t.done} onToggle={() => toggleTask(t.id)} label={t.title} />
                  <span className="text-sm font-semibold">{t.title}</span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      TRACKS.find((tr) => tr.id === t.track)?.colorClass
                    } track-chip whitespace-nowrap`}
                  >
                    {TRACKS.find((tr) => tr.id === t.track)?.ko}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
