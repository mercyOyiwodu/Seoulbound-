import { Plus, Trash2 } from "lucide-react";
import { RoundCheck } from "@/components/RoundCheck";
import { cheerTaskDone } from "@/lib/cheer";
import { TRACKS } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { TrackId } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

export function TasksView() {
  const { tasks, addTask } = useStore();
  const [title, setTitle] = useState("");
  const [track, setTrack] = useState<TrackId>("korean");
  const [filter, setFilter] = useState<TrackId | "all">("all");

  const shown = tasks.filter((t) => filter === "all" || t.track === filter);
  const pending = shown.filter((t) => !t.done);
  const finished = shown.filter((t) => t.done);

  const submit = () => {
    addTask(title, track);
    toast.success(`할 일 추가: ${title}`);
    setTitle("");
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task — e.g. TOPIK grammar past paper, section 1"
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
        <button
          type="submit"
          disabled={!title.trim()}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> Add Task
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${
            filter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          All ({tasks.length})
        </button>
        {TRACKS.map((t) => {
          const count = tasks.filter((task) => task.track === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`${t.colorClass} cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                filter === t.id ? "track-dot text-white" : "track-chip hover:opacity-85"
              }`}
            >
              {t.name} ({count})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="paper-card p-8 text-center text-sm text-muted-foreground">
          No tasks here yet. Add your first task above.
        </div>
      ) : (
        <div className="paper-card divide-y divide-border">
          {pending.map((t) => (
            <TaskRow key={t.id} id={t.id} title={t.title} track={t.track} done={false} />
          ))}
          {finished.map((t) => (
            <TaskRow key={t.id} id={t.id} title={t.title} track={t.track} done />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ id, title, track, done }: { id: string; title: string; track: TrackId; done: boolean }) {
  const { toggleTask, deleteTask } = useStore();
  const tr = TRACKS.find((t) => t.id === track)!;

  const handleToggle = () => {
    toggleTask(id);
    if (!done) {
      cheerTaskDone(title);
    }
  };

  const handleDelete = () => {
    deleteTask(id);
    toast.info(`Deleted task: ${title}`);
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 sm:px-6 ${done ? "opacity-55" : ""}`}>
      <RoundCheck checked={done} onToggle={handleToggle} label={title} />
      <span className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : ""}`}>{title}</span>
      <span
        className={`ml-auto shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tr.colorClass} track-chip`}
      >
        {tr.ko}
      </span>
      <button
        onClick={handleDelete}
        aria-label={`Delete ${title}`}
        className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/25 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
