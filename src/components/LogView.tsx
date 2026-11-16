import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Plus, Trash2 } from "lucide-react";
import { TRACKS, todayISO } from "@/lib/data";
import { cheerStudyLogged } from "@/lib/cheer";
import { useStore } from "@/lib/store";
import type { StudyEntry, TrackId, ViewId } from "@/lib/types";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface DayData {
  iso: string;
  label: string;
  korean: number;
  english: number;
  gks: number;
  python: number;
  total: number;
}

const TRACK_COLORS: Record<TrackId, string> = {
  korean: "#d9464e",
  english: "#3b73a6",
  gks: "#548277",
  python: "#7e5a9b",
};

function buildChartData(study: StudyEntry[], daysCount: number): DayData[] {
  const result: DayData[] = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
    const dayMonth = `${d.getMonth() + 1}/${d.getDate()}`;

    const dayEntries = study.filter((s) => s.date === iso);
    const korean = dayEntries.filter((s) => s.track === "korean").reduce((n, s) => n + s.minutes, 0);
    const english = dayEntries.filter((s) => s.track === "english").reduce((n, s) => n + s.minutes, 0);
    const gks = dayEntries.filter((s) => s.track === "gks").reduce((n, s) => n + s.minutes, 0);
    const python = dayEntries.filter((s) => s.track === "python").reduce((n, s) => n + s.minutes, 0);

    result.push({
      iso,
      label: daysCount > 7 ? dayMonth : `${weekday} ${dayMonth}`,
      korean,
      english,
      gks,
      python,
      total: korean + english + gks + python,
    });
  }

  return result;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <div className="paper-card rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="font-display text-xs text-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-primary">
        Total: {total}m ({(total / 60).toFixed(1)} hrs)
      </p>
      <div className="mt-2 space-y-1 text-[11px]">
        {payload
          .filter((p) => p.value > 0)
          .map((p) => {
            const tr = TRACKS.find((t) => t.id === p.dataKey);
            return (
              <div key={p.dataKey} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-semibold text-muted-foreground">{tr?.name || p.name}:</span>
                <span className="ml-auto font-bold text-foreground">{p.value}m</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function LogView({ go }: { go?: (v: ViewId) => void }) {
  const { study, addStudy, deleteStudy, exportStudyLog } = useStore();
  const [subject, setSubject] = useState("");
  const [track, setTrack] = useState<TrackId>("korean");
  const [minutes, setMinutes] = useState("30");
  const [rangeDays, setRangeDays] = useState<7 | 14>(7);

  const chartData = useMemo(() => buildChartData(study, rangeDays), [study, rangeDays]);

  const totalMinutes = useMemo(() => chartData.reduce((n, d) => n + d.total, 0), [chartData]);
  const dailyAverage = useMemo(() => Math.round(totalMinutes / rangeDays), [totalMinutes, rangeDays]);

  // Find top track
  const topTrack = useMemo(() => {
    const sums: Record<TrackId, number> = { korean: 0, english: 0, gks: 0, python: 0 };
    chartData.forEach((d) => {
      sums.korean += d.korean;
      sums.english += d.english;
      sums.gks += d.gks;
      sums.python += d.python;
    });
    const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    const topId = sorted[0]?.[0] as TrackId | undefined;
    if (!topId || sorted[0][1] === 0) return null;
    return TRACKS.find((t) => t.id === topId);
  }, [chartData]);

  const submit = () => {
    const parsedMin = parseInt(minutes, 10);
    if (!parsedMin || parsedMin <= 0) return;
    addStudy(subject, track, parsedMin);

    const tr = TRACKS.find((t) => t.id === track);
    if (tr) {
      cheerStudyLogged(parsedMin, tr.name, tr.ko);
    }
    setSubject("");
  };

  const handleDelete = (id: string, name: string) => {
    deleteStudy(id);
    toast.info(`Deleted session: ${name}`);
  };

  return (
    <div className="space-y-6">
      {go && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
          <p className="text-xs font-semibold text-foreground">
            Prefer real-time focus with ambient rain or white noise?
          </p>
          <button
            onClick={() => go("focus")}
            className="cursor-pointer text-xs font-bold text-primary hover:underline whitespace-nowrap ml-3"
          >
            Launch Focus Room (집중실) →
          </button>
        </div>
      )}

      {/* Study Session Input Form */}
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
          placeholder="What did you study? e.g. TOPIK grammar past paper"
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
              {t.name} ({t.ko})
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
          <Plus className="h-4 w-4" strokeWidth={3} /> Log Study
        </button>
      </form>

      {/* Analytics Card with Recharts */}
      <section className="paper-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg">Study Analytics & Track Breakdown</h2>
            <p className="text-xs font-semibold text-muted-foreground">
              Total: {totalMinutes}m ({(totalMinutes / 60).toFixed(1)} hrs) · Avg: {dailyAverage}m/day
              {topTrack ? ` · Focus: ${topTrack.name} (${topTrack.ko})` : ""}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setRangeDays(7)}
              className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                rangeDays === 7 ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRangeDays(14)}
              className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                rangeDays === 14 ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              14 Days
            </button>
          </div>
        </div>

        {/* Recharts Stacked Bar Chart */}
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                unit="m"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val) => {
                  const tr = TRACKS.find((t) => t.id === val);
                  return (
                    <span className="text-xs font-bold text-foreground">
                      {tr?.name || val} ({tr?.ko})
                    </span>
                  );
                }}
              />
              <Bar dataKey="korean" name="korean" stackId="study" fill={TRACK_COLORS.korean} radius={[0, 0, 0, 0]} />
              <Bar dataKey="english" name="english" stackId="study" fill={TRACK_COLORS.english} radius={[0, 0, 0, 0]} />
              <Bar dataKey="gks" name="gks" stackId="study" fill={TRACK_COLORS.gks} radius={[0, 0, 0, 0]} />
              <Bar
                dataKey="python"
                name="python"
                stackId="study"
                fill={TRACK_COLORS.python}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Sessions List */}
      <section className="paper-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Logged Study Blocks</p>
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
              No sessions logged yet. Log your first study block above — it feeds your streak and analytics.
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
                        {e.date === todayISO() ? "Today" : e.date} · {tr.name} ({tr.ko})
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
