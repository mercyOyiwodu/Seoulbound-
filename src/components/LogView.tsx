import { Download, Plus, Trash2 } from "lucide-react";
import { TRACKS, todayISO } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { TrackId } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

function last7(): { iso: string; label: string; minutes: number }[] {
  const out: { iso: string; label: string; minutes: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ iso, label: d.toLocaleDateString(undefined, { weekday: "short" }), minutes: 0 });
  }
  return out;
}

export function LogView() {
  const { study, addStudy, deleteStudy, exportStudyLog } = useStore();
  const [subject, setSubject] = useState("");
  const [track, setTrack] = useState<TrackId>("korean");
  const [minutes, setMinutes] = useState("30");

  const days = last7();
  study.forEach((e) => {
    const slot = days.find((d) => d.iso === e.date);
    if (slot) slot.minutes += e.minutes;
  });
  const max = Math.max(60, ...days.map((d) => d.minutes));
  const weekTotal = days.reduce((n, d) => n + d.minutes, 0);

  const submit = () => {
    const parsedMin = parseInt(minutes, 10);
    addStudy(subject, track, parsedMin);
    const tr = TRACKS.find((t) => t.id === track);
    toast.success(`Logged ${parsedMin}m: ${subject}`, {
      description: `Track: ${tr?.name || track} · Streak updated!`,
    });
    setSubject("");
  };

  const handleDelete = (id: string, name: string) => {
    deleteStudy(id);
    toast.info(`Deleted session: ${name}`);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="paper-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
      >
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What did you study? e.g. TTMIK lesson 7"
          className="min-h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-sm font-semibold outline-none placeholder:text-muted-foreground/70 focus:border-primary"
        />
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value as TrackId)}
          className="min-h-11 cursor-pointer rounded-2xl border border-input bg-background px-4 text-sm font-bold outline-none focus:border-primary"
          aria-label="Track"
        >
          {TRACKS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={5}
            max={600}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="min-h-11 w-24 rounded-2xl border border-input bg-background px-4 text-sm font-bold outline-none focus:border-primary"
            aria-label="Minutes"
          />
          <span className="text-sm font-bold text-muted-foreground">min</span>
        </div>
        <button
          type="submit"
          disabled={!subject.trim() || !parseInt(minutes, 10)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> Log
        </button>
      </form>

      <section className="paper-card p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last 7 days</p>
          <p className="font-display text-sm">{weekTotal} min total</p>
        </div>
        <div className="mt-5 flex h-36 items-end gap-2 sm:gap-3">
          {days.map((d) => (
            <div key={d.iso} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">{d.minutes || ""}</span>
              <div
                className="w-full rounded-t-xl bg-primary transition-all duration-500"
                style={{ height: `${Math.max(4, (d.minutes / max) * 100)}%`, opacity: d.minutes ? 1 : 0.25 }}
              />
              <span className="text-[11px] font-bold uppercase text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="paper-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Study Sessions</p>
          {study.length > 0 && (
            <button
              onClick={() => {
                exportStudyLog();
                toast.success("Study log exported as CSV!");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          {study.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No sessions logged yet. Log your first study block above — it feeds your streak.
            </p>
          ) : (
            [...study]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 30)
              .map((e) => {
                const tr = TRACKS.find((t) => t.id === e.track)!;
                return (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tr.colorClass} track-dot`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{e.subject}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {e.date === todayISO() ? "Today" : e.date} · {tr.name}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 font-display text-sm">{e.minutes}m</span>
                    <button
                      onClick={() => handleDelete(e.id, e.subject)}
                      aria-label={`Delete ${e.subject}`}
                      className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/25 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </section>
    </div>
  );
}
