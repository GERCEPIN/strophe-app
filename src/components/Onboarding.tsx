import { useState, type FormEvent } from 'react';
import type { UserProfile, IbadahSettings } from '../types';
import { profileStore, progressStore, ibadahStore } from '../storage/db';
import { createInitialProgressState } from '../engine/level';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);

    const today = new Date().toISOString().slice(0, 10);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      displayName: name.trim(),
      originLanguage: 'id',
      timezone,
      onboardedAt: today,
      modulesEnabled: { kesehatan: false, keuangan: false },
    };
    const ibadah: IbadahSettings = {
      city: city.trim(),
      calculationMethod: 'kemenag',
      remindersEnabled: {
        sholat: Boolean(city.trim()),
        dzikirPagiPetang: false,
        puasaSunnah: false,
      },
    };

    await profileStore.set(profile);
    await ibadahStore.set(ibadah);
    await progressStore.set(createInitialProgressState());

    setSubmitting(false);
    onComplete();
  }

  return (
    <div className="screen">
      <div>
        <img
          src="/icons/icon-any-512.png"
          alt="STROPHE"
          width={56}
          height={56}
          style={{ display: 'block', marginBottom: 14 }}
        />
        <p className="eyebrow">STROPHE · The Turning Point</p>
        <h1 style={{ fontSize: 28, marginTop: 8 }}>Titik balik dimulai hari ini.</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 10, fontSize: 15 }}>
          Bukan game. Sistem harian untuk membentuk ulang caramu berpikir, memutuskan, dan
          bertindak — bertahap, terukur.
        </p>
      </div>

      <form
        className="card"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div className="field">
          <label htmlFor="name">Nama panggilan</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sjupa"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="city">Kota domisili (untuk jadwal sholat &amp; arah kiblat)</label>
          <input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="mis. Jakarta"
          />
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
            Boleh dikosongkan dulu dan diisi nanti di Pengaturan.
          </p>
        </div>
        <button className="btn-primary" type="submit" disabled={!name.trim() || submitting}>
          Mulai Putaran 1
        </button>
      </form>
    </div>
  );
}
