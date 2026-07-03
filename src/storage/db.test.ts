import { describe, it, expect, beforeEach } from 'vitest';
import { progressStore, memoryVaultStore, resetAllData } from './db';
import { createInitialProgressState } from '../engine/level';
import { createMemoryVaultItem } from '../engine/memoryVault';

describe('storage/db', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  it('round-trips a ProgressState through IndexedDB', async () => {
    const state = { ...createInitialProgressState(), currentLevel: 5, mentalScore: 82 };
    await progressStore.set(state);
    const loaded = await progressStore.get();
    expect(loaded).toEqual(state);
  });

  it('returns undefined when nothing has been stored yet', async () => {
    const loaded = await progressStore.get();
    expect(loaded).toBeUndefined();
  });

  it('overwrites the previous value when set is called again (singleton semantics)', async () => {
    await progressStore.set({ ...createInitialProgressState(), currentLevel: 1 });
    await progressStore.set({ ...createInitialProgressState(), currentLevel: 2 });
    const loaded = await progressStore.get();
    expect(loaded?.currentLevel).toBe(2);
  });

  it('stores memory vault items and queries only those due on or before a given date', async () => {
    const dueSoon = createMemoryVaultItem('a', 'payung', '2026-07-01');
    const dueLater = { ...createMemoryVaultItem('b', 'sendok', '2026-07-01'), dueDate: '2026-07-20' };
    await memoryVaultStore.put(dueSoon);
    await memoryVaultStore.put(dueLater);

    const due = await memoryVaultStore.dueBy('2026-07-05');
    expect(due.map((i) => i.id)).toEqual(['a']);

    const all = await memoryVaultStore.all();
    expect(all).toHaveLength(2);
  });
});
