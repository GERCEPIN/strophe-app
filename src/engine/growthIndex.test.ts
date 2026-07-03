import { describe, it, expect } from 'vitest';
import { computeComposite, detectStagnationGap, GROWTH_INDEX_WEIGHTS } from './growthIndex';
import type { GrowthIndexSnapshot } from '../types';

describe('GROWTH_INDEX_WEIGHTS', () => {
  it('sums to exactly 1.0', () => {
    const sum = Object.values(GROWTH_INDEX_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 9);
  });
});

describe('computeComposite', () => {
  it('returns 100 when every input is maxed out', () => {
    const composite = computeComposite({
      instingSpeedAccuracy: 100,
      ketelitianAccuracy: 100,
      memoryRecallTrend: 100,
      decisionJournalQuality: 100,
      honestyReportShrinkage: 100,
      visionAlignmentPct: 100,
    });
    expect(composite).toBe(100);
  });

  it('returns 0 when every input is 0', () => {
    const composite = computeComposite({
      instingSpeedAccuracy: 0,
      ketelitianAccuracy: 0,
      memoryRecallTrend: 0,
      decisionJournalQuality: 0,
      honestyReportShrinkage: 0,
      visionAlignmentPct: 0,
    });
    expect(composite).toBe(0);
  });

  it('weights instingSpeedAccuracy and decisionJournalQuality more heavily than ketelitian', () => {
    const baseline = computeComposite({
      instingSpeedAccuracy: 0,
      ketelitianAccuracy: 0,
      memoryRecallTrend: 0,
      decisionJournalQuality: 0,
      honestyReportShrinkage: 0,
      visionAlignmentPct: 0,
    });
    const boostInsting = computeComposite({
      instingSpeedAccuracy: 100,
      ketelitianAccuracy: 0,
      memoryRecallTrend: 0,
      decisionJournalQuality: 0,
      honestyReportShrinkage: 0,
      visionAlignmentPct: 0,
    });
    const boostKetelitian = computeComposite({
      instingSpeedAccuracy: 0,
      ketelitianAccuracy: 100,
      memoryRecallTrend: 0,
      decisionJournalQuality: 0,
      honestyReportShrinkage: 0,
      visionAlignmentPct: 0,
    });
    expect(boostInsting - baseline).toBeGreaterThan(boostKetelitian - baseline);
  });
});

describe('detectStagnationGap', () => {
  function snap(date: string, composite: number): GrowthIndexSnapshot {
    return {
      date,
      instingSpeedAccuracy: 0,
      ketelitianAccuracy: 0,
      memoryRecallTrend: 0,
      decisionJournalQuality: 0,
      honestyReportShrinkage: 0,
      visionAlignmentPct: 0,
      composite,
    };
  }

  it('flags the gap when level is trending up but growth index is flat for 3 weeks', () => {
    const history = [snap('2026-06-01', 40), snap('2026-06-08', 41), snap('2026-06-15', 40.5)];
    expect(detectStagnationGap(true, history)).toBe(true);
  });

  it('does not flag the gap when growth index is moving meaningfully', () => {
    const history = [snap('2026-06-01', 30), snap('2026-06-08', 40), snap('2026-06-15', 52)];
    expect(detectStagnationGap(true, history)).toBe(false);
  });

  it('does not flag the gap when level itself is not trending up', () => {
    const history = [snap('2026-06-01', 40), snap('2026-06-08', 41), snap('2026-06-15', 40.5)];
    expect(detectStagnationGap(false, history)).toBe(false);
  });

  it('does not flag the gap when there is not enough history yet', () => {
    const history = [snap('2026-06-01', 40)];
    expect(detectStagnationGap(true, history)).toBe(false);
  });
});
