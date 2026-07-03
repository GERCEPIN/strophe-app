import type { ProgressState, UserProfile } from '../types';
import { checkDay } from '../engine/level';
import { LevelSpiral } from './LevelSpiral';

interface DashboardProps {
  profile: UserProfile;
  progress: ProgressState;
  onStartSession: () => void;
  onOpenSettings: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Dashboard({ profile, progress, onStartSession, onOpenSettings }: DashboardProps) {
  const today = todayStr();
  const { missedDaysSinceLastActive } = checkDay(progress, today);
  const alreadyDoneToday = progress.lastAdvancedDate === today;
  const latestGrowth = progress.growthIndexHistory.at(-1);

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/icons/icon-any-192.png" alt="" width={28} height={28} />
          <div>
            <p className="eyebrow">STROPHE</p>
            <h1 style={{ fontSize: 20 }}>Halo, {profile.displayName}.</h1>
          </div>
        </div>
        <button className="btn-secondary" onClick={onOpenSettings}>
          Pengaturan
        </button>
      </div>

      {missedDaysSinceLastActive > 0 && (
        <div className="banner-warning">
          Kamu bolong {missedDaysSinceLastActive} hari. Putaran tidak reset — tapi Skor Mental
          turun. Yuk lanjut hari ini.
        </div>
      )}

      <div
        className="card"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        <LevelSpiral level={progress.currentLevel} mentalScore={progress.mentalScore} />
        <div style={{ display: 'flex', gap: 32 }}>
          <Stat label="Skor Mental" value={`${progress.mentalScore}`} />
          <Stat label="Growth Index" value={latestGrowth ? `${latestGrowth.composite}` : '—'} />
        </div>
      </div>

      <button className="btn-primary" onClick={onStartSession} disabled={alreadyDoneToday}>
        {alreadyDoneToday
          ? 'Sesi hari ini sudah selesai'
          : `Mulai Sesi Inti — Putaran ${progress.currentLevel + 1}`}
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 22 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{label}</div>
    </div>
  );
}
