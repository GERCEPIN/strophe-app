import { useState } from 'react';
import type { ProgressState, SessionStationResult, DailyCoreSession } from '../types';
import { getLevelContent } from '../content/coreSessionLevels';
import { completeTodaysSession } from '../engine/dailyTransition';
import { progressStore, sessionStore } from '../storage/db';

interface SessionRunnerProps {
  progress: ProgressState;
  onFinish: (next: ProgressState) => void;
  onCancel: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SessionRunner({ progress, onFinish, onCancel }: SessionRunnerProps) {
  const level = progress.currentLevel + 1;
  const content = getLevelContent(level);
  const [stationIndex, setStationIndex] = useState(0);
  const [responses, setResponses] = useState<SessionStationResult[]>([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const station = content.stations[stationIndex];
  const isLast = stationIndex === content.stations.length - 1;

  function recordAndAdvance(partial: Partial<SessionStationResult>) {
    const result: SessionStationResult = {
      station: station.station,
      completedAt: new Date().toISOString(),
      ...partial,
    };
    const nextResponses = [...responses, result];
    setResponses(nextResponses);
    setDraft('');
    if (isLast) {
      void finish(nextResponses);
    } else {
      setStationIndex((i) => i + 1);
    }
  }

  async function finish(finalResponses: SessionStationResult[]) {
    setSaving(true);
    const today = todayStr();
    const { state: nextProgress } = completeTodaysSession(progress, today);
    await progressStore.set(nextProgress);
    const session: DailyCoreSession = {
      date: today,
      level,
      stations: finalResponses,
      completed: true,
    };
    await sessionStore.put(session);
    setSaving(false);
    onFinish(nextProgress);
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="eyebrow">
          Putaran {level} · {content.title}
        </p>
        <button className="btn-secondary" onClick={onCancel}>
          Nanti dulu
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
        {content.stations.map((s, i) => (
          <div
            key={s.station}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= stationIndex ? 'var(--gold)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>
            {station.title}
            {station.timeLimitSeconds ? ` · ${station.timeLimitSeconds} detik` : ''}
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: 15.5, lineHeight: 1.55 }}>
            {station.instruction}
          </p>
        </div>

        {station.inputType === 'checklist' && (
          <button
            className="btn-primary"
            onClick={() => recordAndAdvance({ freeTextResponse: 'done' })}
            disabled={saving}
          >
            Sudah, lanjut
          </button>
        )}

        {station.inputType === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {station.choices?.map((choice) => (
              <button
                key={choice}
                className="btn-secondary"
                onClick={() => recordAndAdvance({ freeTextResponse: choice })}
                disabled={saving}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {(station.inputType === 'text' || station.inputType === 'findIssues') && (
          <>
            <textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tulis di sini..."
            />
            <button
              className="btn-primary"
              onClick={() => recordAndAdvance({ freeTextResponse: draft })}
              disabled={saving || !draft.trim()}
            >
              {isLast ? 'Selesaikan Sesi' : 'Lanjut'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
