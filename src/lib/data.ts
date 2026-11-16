import type { FundGoal, Milestone, Task, Track } from "./types";

export const APP_NAME = "Seoulbound '28";
export const GKS_WINDOW_OPEN = "2027-09-15"; // expected embassy-track open (2027 cycle: Sep 15-30)

export const TRACKS: Track[] = [
  {
    id: "korean",
    name: "Korean",
    ko: "한국어",
    colorClass: "track-korean",
    blurb: "TOPIK is your scholarship weapon. Level 3-4 by autumn 2027 makes the application far stronger.",
  },
  {
    id: "english",
    name: "English / IELTS",
    ko: "영어",
    colorClass: "track-english",
    blurb: "IELTS Band 6.0+ supports the application. Free practice first; book it only when the funds goal is hit.",
  },
  {
    id: "gks",
    name: "GKS Application",
    ko: "장학금",
    colorClass: "track-gks",
    blurb: "Embassy Track expected to open mid-September 2027. Documents decide everything — start them early.",
  },
  {
    id: "python",
    name: "Python / ML",
    ko: "코딩",
    colorClass: "track-python",
    blurb: "You already think like an engineer. Two deployed portfolio projects make you a memorable applicant.",
  },
];

export const MILESTONES: Milestone[] = [
  // 한국어 → TOPIK
  { id: "k1", track: "korean", label: "Hangul down + survival phrases", date: "2026-12-31" },
  { id: "k2", track: "korean", label: "Finish beginner course (Sejong 1-2 / TTMIK 2)", date: "2027-03-31" },
  { id: "k3", track: "korean", label: "First TOPIK I attempt (IBT 18 · Mar 20 / PBT 111 · Apr 10-11)", date: "2027-04-11", note: "First overseas 2027 sessions" },
  { id: "k4", track: "korean", label: "TOPIK II first attempt (PBT 113 · Jul 3-4)", date: "2027-07-04" },
  { id: "k5", track: "korean", label: "Target TOPIK level 3-4 (PBT 114 · Oct 16-17)", date: "2027-10-17", note: "Last result before docs" },
  // 영어 → IELTS
  { id: "e1", track: "english", label: "Free IELTS diagnostic (British Council practice tests)", date: "2026-12-31" },
  { id: "e2", track: "english", label: "Hit the IELTS fee goal in Funds", date: "2027-06-30", note: "Only book when funded" },
  { id: "e3", track: "english", label: "Book IELTS Academic", date: "2027-06-30" },
  { id: "e4", track: "english", label: "Sit IELTS — target Band 6.0+", date: "2027-08-31" },
  { id: "e5", track: "english", label: "Draft personal statement in English", date: "2027-05-31" },
  // 장학금 → GKS
  { id: "g1", track: "gks", label: "Passport ready + civil documents gathered", date: "2027-02-28" },
  { id: "g2", track: "gks", label: "Request 2 recommendation letters", date: "2027-06-30" },
  { id: "g3", track: "gks", label: "Personal statement + study plan final draft", date: "2027-07-31" },
  { id: "g4", track: "gks", label: "Notarization / apostille + translations done", date: "2027-08-31" },
  { id: "g5", track: "gks", label: "Embassy Track window opens (expected ~Sep 15-30)", date: "2027-09-15", note: "Confirm on studyinkorea.go.kr" },
  { id: "g6", track: "gks", label: "Backup: University Track (Sep-Nov 2027)", date: "2027-09-01" },
  // 코딩 → Python/ML
  { id: "p1", track: "python", label: "Python fluency: pandas, numpy, matplotlib", date: "2027-01-31" },
  { id: "p2", track: "python", label: "Math for ML: linear algebra + statistics basics", date: "2027-04-30" },
  { id: "p3", track: "python", label: "Finish a classic ML course (e.g. Andrew Ng)", date: "2027-06-30" },
  { id: "p4", track: "python", label: "Portfolio project #1: ML model + backend API", date: "2027-05-31" },
  { id: "p5", track: "python", label: "Portfolio project #2: deployed AI app", date: "2027-08-31" },
  { id: "p6", track: "python", label: "GitHub + resume polished for the application", date: "2027-08-31" },
];

export const DEFAULT_TASKS: Omit<Task, "id" | "createdAt">[] = [
  { title: "한국어 vocabulary — 20 words (Anki / TTMIK)", track: "korean", done: false },
  { title: "One Korean grammar unit + 5 example sentences", track: "korean", done: false },
  { title: "Active listening — K-drama clip or TOPIK audio, 15 min", track: "korean", done: false },
  { title: "Python/ML study block — 1 hour", track: "python", done: false },
  { title: "Write 3 lines of Korean in a journal (any mistakes allowed)", track: "korean", done: false },
  { title: "IELTS vocab — 15 min (free apps until funded)", track: "english", done: false },
  { title: "Check studyinkorea.go.kr notice board (weekly habit)", track: "gks", done: false },
];

export const DEFAULT_GOALS: FundGoal[] = [
  { id: "ielts", label: "IELTS Academic fee", target: 250, note: "Typical range $215-310 depending on country" },
  { id: "topik", label: "TOPIK exam fee", target: 40, note: "Usually $20-40 depending on centre" },
];

export const PHRASES: { ko: string; en: string }[] = [
  { ko: "할 수 있어요", en: "You can do it." },
  { ko: "조금씩 매일", en: "A little, every day." },
  { ko: "꾸준함이 답이다", en: "Consistency is the answer." },
  { ko: "다시 시작하면 돼요", en: "You can always start again." },
  { ko: "포기하지 마세요", en: "Don't give up." },
  { ko: "천천히 가도 괜찮아요", en: "It's okay to go slowly." },
  { ko: "오늘도 한 걸음", en: "One more step today." },
  { ko: "노력은 배신하지 않아요", en: "Effort doesn't betray you." },
];

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function fmtMoney(n: number): string {
  return "$" + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
