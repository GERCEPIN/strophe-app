/**
 * Diamond Tier System (feature #34):
 *   - Diamond Checkpoint: every 50 levels.
 *   - Diamond Badge Permanen: earned badges never get revoked.
 *   - Diamond Multiplier: XP earned above the last checkpoint counts 3-5x.
 *   - Diamond Reset Protection: an already-passed checkpoint never
 *     "un-passes" just because the user misses days later.
 */

export const CHECKPOINT_INTERVAL = 50;
export const DIAMOND_MULTIPLIER = 3; // 3x baseline; see multiplierForLevel for the 3-5x curve

export function nextCheckpointLevel(currentLevel: number): number {
  return (Math.floor(currentLevel / CHECKPOINT_INTERVAL) + 1) * CHECKPOINT_INTERVAL;
}

export function isCheckpointLevel(level: number): boolean {
  return level > 0 && level % CHECKPOINT_INTERVAL === 0;
}

export function highestPassedCheckpoint(highestLevelReached: number): number {
  return Math.floor(highestLevelReached / CHECKPOINT_INTERVAL) * CHECKPOINT_INTERVAL;
}

/**
 * XP multiplier for progress above the user's last passed Diamond
 * checkpoint. Scales from 3x right after a checkpoint up to 5x as they
 * approach the next one, rewarding sustained post-Diamond effort more than
 * the level right after a checkpoint.
 */
export function multiplierForLevel(level: number, lastPassedCheckpoint: number): number {
  // lastPassedCheckpoint < CHECKPOINT_INTERVAL means no Diamond checkpoint
  // has actually been passed yet (0 is the "none passed" sentinel) — no
  // multiplier applies until the user clears the first real checkpoint.
  if (lastPassedCheckpoint < CHECKPOINT_INTERVAL || level <= lastPassedCheckpoint) return 1;
  const progressIntoTier = level - lastPassedCheckpoint;
  const ratio = Math.min(1, progressIntoTier / CHECKPOINT_INTERVAL);
  return 3 + ratio * 2; // 3x -> 5x
}

/**
 * Diamond Reset Protection: a checkpoint that was already passed stays
 * passed forever. This function only ever returns a state that is >= the
 * previous one — it never downgrades badgePassed from true to false.
 */
export function applyResetProtection(
  previouslyPassed: boolean,
  computedPassed: boolean
): boolean {
  return previouslyPassed || computedPassed;
}
