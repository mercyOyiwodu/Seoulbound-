import {
  Coffee,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { type AmbientController, type AmbientSoundType, playChime, startAmbientSound } from "@/lib/audio";
import { cheerStudyLogged } from "@/lib/cheer";
import { TRACKS } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { TrackId } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type TimerMode = "focus" | "break";

const TRACK_COLORS: Record<TrackId, string> = {
  korean: "#d9464e",
  english: "#3b73a6",
  gks: "#548277",
  python: "#7e5a9b",
};

export function FocusView() {
  const { addStudy, study } = useStore();

  const [mode, setMode] = useState<TimerMode>("focus");
  const [track, setTrack] = useState<TrackId>("korean");
  const [subject, setSubject] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<string>("30");

  // Ambient sound state
  const [ambientType, setAmbientType] = useState<AmbientSoundType | "none">("none");
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const ambientRef = useRef<AmbientController | null>(null);

  // Fullscreen mode state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTrack = useMemo(() => TRACKS.find((t) => t.id === track)!, [track]);
  const activeColor = mode === "break" ? "#84a59d" : TRACK_COLORS[track];

  // Set duration when switching presets
  const handleSelectPreset = (minutes: number) => {
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  // Switch between Focus and Break
  const handleSwitchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === "break") {
      setSelectedDuration(5);
      setTimeLeft(5 * 60);
    } else {
      setSelectedDuration(25);
      setTimeLeft(25 * 60);
    }
  };

  // Ambient sound lifecycle management
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }

    if (ambientType !== "none" && isRunning) {
      ambientRef.current = startAmbientSound(ambientType, ambientVolume);
    }

    return () => {
      if (ambientRef.current) {
        ambientRef.current.stop();
        ambientRef.current = null;
      }
    };
  }, [ambientType, isRunning, ambientVolume]);

  // Adjust ambient volume dynamically
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.setVolume(ambientVolume);
    }
  }, [ambientVolume]);

  // Timer completion handler
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    playChime();

    if (mode === "focus") {
      const loggedSubject = subject.trim() || `${selectedTrack.name} Focus Session`;
      addStudy(loggedSubject, track, selectedDuration);
      cheerStudyLogged(selectedDuration, selectedTrack.name, selectedTrack.ko);

      // Offer short break
      toast("집중 시간 완료! (Focus Block Finished)", {
        description: "5-minute short break recommended. Rest your eyes and stay hydrated.",
        action: {
          label: "Start 5m Break",
          onClick: () => handleSwitchMode("break"),
        },
      });
    } else {
      toast.success("휴식 완료! (Break Finished)", {
        description: "Ready for your next study sprint? Let's keep moving towards Seoul.",
      });
      handleSwitchMode("focus");
    }
  }, [mode, subject, selectedTrack, addStudy, track, selectedDuration]);

  // Timer countdown loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, handleTimerComplete]);

  // Update document title with remaining time for multitasking applicants
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (isRunning) {
      document.title = `(${timeStr}) ${mode === "focus" ? selectedTrack.name : "Break"} | Seoulbound '28`;
    } else {
      document.title = "Seoulbound '28 — GKS Study Command Center";
    }

    return () => {
      document.title = "Seoulbound '28 — GKS Study Command Center";
    };
  }, [timeLeft, isRunning, mode, selectedTrack]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const handleFinishEarly = () => {
    const elapsedMinutes = Math.round((selectedDuration * 60 - timeLeft) / 60);
    if (elapsedMinutes >= 5 && mode === "focus") {
      const loggedSubject = subject.trim() || `${selectedTrack.name} Focus Session (Partial)`;
      addStudy(loggedSubject, track, elapsedMinutes);
      cheerStudyLogged(elapsedMinutes, selectedTrack.name, selectedTrack.ko);
      toast.info(`Early finish: Logged ${elapsedMinutes}m to your study record.`);
    }
    handleReset();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Circle progress calculation
  const totalSeconds = Math.max(1, selectedDuration * 60);
  const progressRatio = timeLeft / totalSeconds;
  const R = 90;
  const C = 2 * Math.PI * R;
  const strokeDashoffset = C * (1 - progressRatio);

  const minutesDisplay = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secondsDisplay = String(timeLeft % 60).padStart(2, "0");

  // Today's total logged minutes
  const todayISOStr = new Date().toISOString().split("T")[0];
  const todayTotalMinutes = study
    .filter((s) => s.date === todayISOStr)
    .reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div ref={containerRef} className="space-y-6 bg-background">
      {/* Top Controls: Mode Switcher & Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-xs">
          <button
            onClick={() => handleSwitchMode("focus")}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mode === "focus"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Focus Room (집중)
            </span>
          </button>
          <button
            onClick={() => handleSwitchMode("break")}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mode === "break"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Coffee className="h-3.5 w-3.5" /> Break (휴식)
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Today: <strong>{todayTotalMinutes}m</strong> logged
          </span>
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="cursor-pointer rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Focus Console Card */}
      <section className="paper-card relative overflow-hidden p-6 sm:p-10 text-center">
        {/* Track selector (visible in focus mode) */}
        {mode === "focus" && (
          <div className="mx-auto mb-8 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Track</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRACKS.map((t) => {
                const active = track === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTrack(t.id);
                      if (isRunning) toast.info(`Switched focus track to ${t.name}`);
                    }}
                    className={`cursor-pointer rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                      active
                        ? "border-transparent text-white shadow-xs"
                        : "border-border bg-background/60 text-muted-foreground hover:border-foreground/30"
                    }`}
                    style={{
                      backgroundColor: active ? TRACK_COLORS[t.id] : undefined,
                    }}
                  >
                    <span>{t.name}</span>
                    <span className="block text-[10px] opacity-80">{t.ko}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What are you studying right now? (e.g. TOPIK reading practice)"
              className="mt-4 w-full rounded-2xl border border-input bg-background/80 px-4 py-2.5 text-center text-xs font-semibold outline-none placeholder:text-muted-foreground/60 focus:border-primary"
            />
          </div>
        )}

        {/* Circular Countdown Gauge */}
        <div className="relative mx-auto my-4 flex h-60 w-60 items-center justify-center sm:h-72 sm:w-72">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={activeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Display Inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-5xl tracking-tight sm:text-6xl text-foreground">
              {minutesDisplay}:{secondsDisplay}
            </span>
            <span className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {mode === "focus" ? `${selectedTrack.name} · ${selectedTrack.ko}` : "Recharge Break"}
            </span>
          </div>
        </div>

        {/* Timer Presets */}
        <div className="my-6 flex flex-wrap items-center justify-center gap-2">
          {mode === "focus" ? (
            <>
              {[25, 50].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectPreset(mins)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    selectedDuration === mins && !isRunning
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {mins} min
                </button>
              ))}
              <div className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-12 text-center text-xs font-bold outline-none"
                  aria-label="Custom minutes"
                />
                <button
                  onClick={() => {
                    const m = parseInt(customMinutes, 10);
                    if (m && m > 0) handleSelectPreset(m);
                  }}
                  className="cursor-pointer text-[10px] font-bold text-primary hover:underline"
                >
                  Set Custom
                </button>
              </div>
            </>
          ) : (
            [5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectPreset(mins)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedDuration === mins && !isRunning
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {mins} min break
              </button>
            ))
          )}
        </div>

        {/* Primary Controls (Play, Pause, Reset, Finish Early) */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="inline-flex min-h-14 min-w-36 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: activeColor }}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" /> Start Focus
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset Timer"
            className="cursor-pointer rounded-full border border-border bg-background p-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {isRunning && mode === "focus" && (
            <button
              onClick={handleFinishEarly}
              title="Finish & Log Time Studied"
              className="cursor-pointer rounded-full border border-border bg-background px-4 py-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Finish Early
            </button>
          )}
        </div>

        {/* Ambient Sound Controller */}
        <div className="mt-10 border-t border-border/70 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Ambient Sound:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "none", label: "Mute" },
                  { id: "rain", label: "🌧️ Rain" },
                  { id: "whitenoise", label: "💨 White Noise" },
                  { id: "brownnoise", label: "☕ Brown Noise" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setAmbientType(s.id as AmbientSoundType | "none")}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      ambientType === s.id
                        ? "bg-foreground text-background"
                        : "border border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {ambientType !== "none" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAmbientVolume((v) => (v > 0 ? 0 : 0.5))}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {ambientVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="h-1.5 w-24 cursor-pointer accent-primary"
                  aria-label="Ambient volume"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Motivational Bottom Quote */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-center">
        <p className="font-display text-sm text-foreground">
          &ldquo;몰입(沒入)은 천재들의 비밀이 아니라 꾸준한 사람들의 습관이다.&rdquo;
        </p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          Deep immersion is not the secret of geniuses, but the habit of consistent people.
        </p>
      </div>
    </div>
  );
}
