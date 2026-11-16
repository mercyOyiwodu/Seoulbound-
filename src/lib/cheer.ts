import { toast } from "sonner";
import { fmtMoney } from "./data";

const STUDY_CHEERS = [
  { ko: "대단해요! 오늘도 한 걸음 더 전진했습니다.", en: "Amazing! Another step forward today." },
  { ko: "조금씩 매일, 서울이 가까워집니다.", en: "A little every day, Seoul gets closer." },
  { ko: "꾸준함이 답이다. 오늘의 노력이 미래를 만듭니다.", en: "Consistency is the answer. Today's effort shapes tomorrow." },
  { ko: "노력은 배신하지 않아요. 집중 완료!", en: "Effort never betrays you. Focus completed!" },
  { ko: "천천히 가도 괜찮아요. 멈추지 않는 것이 중요합니다.", en: "Going slow is okay. What matters is never stopping." },
];

const TASK_CHEERS = [
  { ko: "수고하셨습니다! 완료 항목 추가.", en: "Well done! Task completed." },
  { ko: "할 수 있어요! 하나씩 해치우는 중.", en: "You can do it! Clearing them one by one." },
  { ko: "완벽해요! 오늘의 체크리스트가 줄어듭니다.", en: "Perfect! Today's checklist is shrinking." },
  { ko: "오늘도 한 걸음. 고생 많았어요!", en: "Another step today. Great work!" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function cheerTaskDone(title: string) {
  const c = pickRandom(TASK_CHEERS);
  toast.success(c.ko, {
    description: `${c.en} · "${title}"`,
  });
}

export function cheerStudyLogged(minutes: number, trackName: string, trackKo: string) {
  const c = pickRandom(STUDY_CHEERS);
  toast.success(`+${minutes}분 ${trackKo} 집중 완료!`, {
    description: `${c.ko} (${trackName})`,
  });
}

export function cheerMilestone(label: string, trackName: string) {
  toast.success(`🎉 장학금 이정표 달성: ${label}`, {
    description: `축하합니다! ${trackName} 트랙 목표를 향해 큰 산을 넘었습니다.`,
  });
}

export function cheerFund(type: "income" | "expense", amount: number, label: string) {
  if (type === "income") {
    toast.success(`티끌 모아 태산! +${fmtMoney(amount)} 적립`, {
      description: `시험 응시료 목표를 향해 전진 중 (${label})`,
    });
  } else {
    toast.info(`지출 기록: −${fmtMoney(amount)}`, {
      description: label,
    });
  }
}
