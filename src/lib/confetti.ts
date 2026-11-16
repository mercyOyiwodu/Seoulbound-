import confetti from "canvas-confetti";
import { playFanfare } from "./audio";

// Korean Taegeuk & Scholarship Palette
const SCHOLARSHIP_COLORS = ["#c8393f", "#2e5e8c", "#84a59d", "#f59e0b", "#f28482"];
const GOLD_COIN_COLORS = ["#ffd700", "#f59e0b", "#d97706", "#10b981", "#84a59d"];

/**
 * Fires celebratory confetti and audio fanfare when completing a scholarship roadmap milestone.
 * Major milestones (sitting exams, finishing ML apps, submitting docs) trigger a dual-cannon grand celebration!
 */
export function celebrateMilestone(_milestoneId?: string, isMajor = false): void {
  playFanfare();

  if (isMajor) {
    // Grand celebration: dual cannons
    const end = Date.now() + 1200;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: SCHOLARSHIP_COLORS,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: SCHOLARSHIP_COLORS,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  } else {
    // Elegant center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: SCHOLARSHIP_COLORS,
      disableForReducedMotion: true,
    });
  }
}

/**
 * Fires celebratory golden fireworks when an exam fee goal is 100% funded!
 */
export function celebrateGoalFunded(): void {
  playFanfare();

  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors: GOLD_COIN_COLORS,
    ticks: 200,
    gravity: 0.9,
    scalar: 1.1,
    disableForReducedMotion: true,
  });
}

/**
 * Gentle celebration shower when finishing a deep focus study block.
 */
export function celebrateFocusDone(): void {
  confetti({
    particleCount: 50,
    angle: 90,
    spread: 60,
    origin: { y: 0.8 },
    colors: SCHOLARSHIP_COLORS,
    disableForReducedMotion: true,
  });
}
