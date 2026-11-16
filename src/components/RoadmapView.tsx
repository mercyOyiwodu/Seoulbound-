import { RoundCheck } from "@/components/RoundCheck";
import { celebrateMilestone } from "@/lib/confetti";
import { cheerMilestone } from "@/lib/cheer";
import { MILESTONES, TRACKS, fmtDate } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Track } from "@/lib/types";

// Key GKS milestones that warrant grand celebration
const MAJOR_MILESTONES = new Set([
  "k3", // First TOPIK I attempt
  "k4", // TOPIK II first attempt
  "k5", // Target TOPIK 3-4
  "e4", // Sit IELTS Band 6.0+
  "g3", // Personal statement & study plan final draft
  "g4", // Legalization: MoE, MFA & Embassy Abuja
  "g5", // Embassy Track window opens
  "p4", // Portfolio project #1
  "p5", // Portfolio project #2
  "p6", // GitHub & resume polished
]);

function TrackCard({ track }: { track: Track }) {
  const { doneMilestones, toggleMilestone } = useStore();
  const ms = MILESTONES.filter((m) => m.track === track.id);
  const done = ms.filter((m) => doneMilestones.includes(m.id)).length;
  const pct = Math.round((done / ms.length) * 100);

  const handleToggle = (id: string, label: string, isDone: boolean) => {
    toggleMilestone(id);
    if (!isDone) {
      const isMajor = MAJOR_MILESTONES.has(id);
      celebrateMilestone(id, isMajor);
      cheerMilestone(label, track.name);
    }
  };

  return (
    <section id={`track-${track.id}`} className="paper-card scroll-mt-24 p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl">{track.name}</h2>
        <span className="font-display text-sm text-muted-foreground">{track.ko}</span>
        <span className="ml-auto font-display text-sm text-muted-foreground">
          {done}/{ms.length}
        </span>
      </div>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">{track.blurb}</p>
      <div className={`mt-4 h-2.5 overflow-hidden rounded-full ${track.colorClass}`} style={{ background: "hsl(var(--track-soft))" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "hsl(var(--track))" }}
        />
      </div>
      <ul className="mt-5 space-y-1">
        {ms.map((m) => {
          const checked = doneMilestones.includes(m.id);
          const isMajor = MAJOR_MILESTONES.has(m.id);
          return (
            <li
              key={m.id}
              className={`flex items-start gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-muted/60 ${
                isMajor ? "border-l-2 border-primary/40 pl-3" : ""
              }`}
            >
              <div className="pt-0.5">
                <RoundCheck checked={checked} onToggle={() => handleToggle(m.id, m.label, checked)} label={m.label} />
              </div>
              <div className={checked ? "opacity-50" : ""}>
                <p className={`text-sm font-semibold leading-snug ${checked ? "line-through" : ""}`}>
                  {m.label}
                  {isMajor && !checked && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      Major
                    </span>
                  )}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {m.date ? fmtDate(m.date) : ""}
                  {m.note ? ` · ${m.note}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function RoadmapView() {
  const jump = (id: string) => {
    document.getElementById(`track-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <p className="max-w-prose text-sm text-muted-foreground">
        Four tracks, one destination. Check milestones off as you go — progress is saved securely on this device.
      </p>
      <div className="flex flex-wrap gap-2">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => jump(t.id)}
            className={`${t.colorClass} track-chip cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-transform duration-200 hover:scale-105`}
          >
            {t.name}
          </button>
        ))}
      </div>
      {TRACKS.map((t) => (
        <TrackCard key={t.id} track={t} />
      ))}
    </div>
  );
}
