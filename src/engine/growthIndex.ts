import type { GrowthIndexSnapshot } from '../types';

/**
 * Growth Index Engine
 *
 * Answers "did the user actually change", independent of Level (which only
 * measures showing up — see level.ts). A weighted composite of six signals
 * that are each tracked independently elsewhere in the app. Weights sum to
 * 1.0 and are named constants so design can retune them without touching
 * the aggregation math.
 */
export const GROWTH_INDEX_WEIGHTS = {
  instingSpeedAccuracy: 0.2,
  ketelitianAccuracy: 0.15,
  memoryRecallTrend: 0.15,
  decisionJournalQuality: 0.2,
  honestyReportShrinkage: 0.15,
  visionAlignmentPct: 0.15,
} as const;

const WEIGHT_SUM = Object.values(GROWTH_INDEX_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(WEIGHT_SUM - 1) > 1e-9) {
  // Fails fast at module load time if someone edits the weights and forgets to rebalance.
  throw new Error(`GROWTH_INDEX_WEIGHTS must sum to 1.0, got ${WEIGHT_SUM}`);
}

export type GrowthIndexInputs = Omit<GrowthIndexSnapshot, 'composite' | 'date'>;

export function computeComposite(inputs: GrowthIndexInputs): number {
  const w = GROWTH_INDEX_WEIGHTS;
  const composite =
    inputs.instingSpeedAccuracy * w.instingSpeedAccuracy +
    inputs.ketelitianAccuracy * w.ketelitianAccuracy +
    inputs.memoryRecallTrend * w.memoryRecallTrend +
    inputs.decisionJournalQuality * w.decisionJournalQuality +
    inputs.honestyReportShrinkage * w.honestyReportShrinkage +
    inputs.visionAlignmentPct * w.visionAlignmentPct;
  return Math.round(composite * 100) / 100;
}

/**
 * Detects the "Level naik terus, Growth Index stagnan" gap called out in
 * the design doc (A6) — used to decide whether the dashboard should show
 * the honest callout message. Pure + independently testable so the coach
 * prompt templates can reuse it without duplicating the threshold logic.
 */
export function detectStagnationGap(
  levelTrendUp: boolean,
  growthIndexHistory: GrowthIndexSnapshot[],
  weeksToCheck = 3,
  flatnessThreshold = 3
): boolean {
  if (!levelTrendUp) return false;
  if (growthIndexHistory.length < weeksToCheck) return false;
  const recent = growthIndexHistory.slice(-weeksToCheck);
  const values = recent.map((s) => s.composite);
  const variance = Math.max(...values) - Math.min(...values);
  return variance < flatnessThreshold;
}
