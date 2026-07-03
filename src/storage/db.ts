import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  UserProfile,
  ProgressState,
  DailyCoreSession,
  SkillTrackProgress,
  MemoryVaultItem,
  DecisionJournalEntry,
  KompasVisi,
  Blueprint,
  DiamondState,
  IbadahSettings,
  FinanceSettings,
} from '../types';

/**
 * All STROPHE data lives on-device in IndexedDB. Nothing is synced to a
 * server (there is no server). The only network calls this app makes are
 * explicit AI Coach requests — see src/coach/client.ts — which send only
 * the specific context needed for that one request, never the whole
 * database. See TECHNICAL_SPEC.md §5.
 */

const DB_NAME = 'strophe-db';
const DB_VERSION = 1;

interface StropheDB extends DBSchema {
  singletons: {
    key: string;
    value: unknown;
  };
  sessions: {
    key: string; // date
    value: DailyCoreSession;
  };
  skillTracks: {
    key: string; // trackId
    value: SkillTrackProgress;
  };
  memoryVault: {
    key: string; // item id
    value: MemoryVaultItem;
    indexes: { 'by-dueDate': string };
  };
  decisionJournal: {
    key: string; // entry id
    value: DecisionJournalEntry;
  };
}

let dbPromise: Promise<IDBPDatabase<StropheDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<StropheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('singletons')) db.createObjectStore('singletons');
        if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions');
        if (!db.objectStoreNames.contains('skillTracks')) db.createObjectStore('skillTracks');
        if (!db.objectStoreNames.contains('memoryVault')) {
          const store = db.createObjectStore('memoryVault', { keyPath: 'id' });
          store.createIndex('by-dueDate', 'dueDate');
        }
        if (!db.objectStoreNames.contains('decisionJournal')) {
          db.createObjectStore('decisionJournal', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

async function getSingleton<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return (await db.get('singletons', key)) as T | undefined;
}
async function setSingleton<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('singletons', value, key);
}

export const profileStore = {
  get: () => getSingleton<UserProfile>('profile'),
  set: (v: UserProfile) => setSingleton('profile', v),
};
export const progressStore = {
  get: () => getSingleton<ProgressState>('progress'),
  set: (v: ProgressState) => setSingleton('progress', v),
};
export const kompasStore = {
  get: () => getSingleton<KompasVisi>('kompas'),
  set: (v: KompasVisi) => setSingleton('kompas', v),
};
export const blueprintStore = {
  get: () => getSingleton<Blueprint>('blueprint'),
  set: (v: Blueprint) => setSingleton('blueprint', v),
};
export const diamondStore = {
  get: () => getSingleton<DiamondState>('diamond'),
  set: (v: DiamondState) => setSingleton('diamond', v),
};
export const ibadahStore = {
  get: () => getSingleton<IbadahSettings>('ibadah'),
  set: (v: IbadahSettings) => setSingleton('ibadah', v),
};
export const financeStore = {
  get: () => getSingleton<FinanceSettings>('finance'),
  set: (v: FinanceSettings) => setSingleton('finance', v),
};

/**
 * The user's own Anthropic API key (from console.anthropic.com), entered
 * once in Settings. Stored locally only — see coach/client.ts for how
 * it's used and TECHNICAL_SPEC.md §4.2 for the security tradeoffs.
 */
export const apiKeyStore = {
  get: () => getSingleton<string>('anthropicApiKey'),
  set: (v: string) => setSingleton('anthropicApiKey', v),
};

export const sessionStore = {
  async get(date: string) {
    const db = await getDB();
    return db.get('sessions', date);
  },
  async put(session: DailyCoreSession) {
    const db = await getDB();
    await db.put('sessions', session, session.date);
  },
  async all() {
    const db = await getDB();
    return db.getAll('sessions');
  },
};

export const skillTrackStore = {
  async get(trackId: string) {
    const db = await getDB();
    return db.get('skillTracks', trackId);
  },
  async put(track: SkillTrackProgress) {
    const db = await getDB();
    await db.put('skillTracks', track, track.trackId);
  },
  async all() {
    const db = await getDB();
    return db.getAll('skillTracks');
  },
};

export const memoryVaultStore = {
  async put(item: MemoryVaultItem) {
    const db = await getDB();
    await db.put('memoryVault', item);
  },
  async all() {
    const db = await getDB();
    return db.getAll('memoryVault');
  },
  /** Items due on or before `date` — feeds engine/memoryVault.ts#itemsDueToday. */
  async dueBy(date: string) {
    const db = await getDB();
    const range = IDBKeyRange.upperBound(date);
    return db.getAllFromIndex('memoryVault', 'by-dueDate', range);
  },
};

export const decisionJournalStore = {
  async put(entry: DecisionJournalEntry) {
    const db = await getDB();
    await db.put('decisionJournal', entry);
  },
  async all() {
    const db = await getDB();
    return db.getAll('decisionJournal');
  },
};

/** Dev-tools / test-only helper. Not wired to any UI button on purpose. */
export async function resetAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('singletons'),
    db.clear('sessions'),
    db.clear('skillTracks'),
    db.clear('memoryVault'),
    db.clear('decisionJournal'),
  ]);
}
