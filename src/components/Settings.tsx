import { useEffect, useState } from 'react';
import { apiKeyStore, ibadahStore } from '../storage/db';
import { callCoach, CoachClientError } from '../coach/client';
import { requestNotificationPermission } from '../notifications';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [city, setCity] = useState('');
  const [citySaved, setCitySaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    void (async () => {
      const key = await apiKeyStore.get();
      if (key) setApiKey(key);
      const ibadah = await ibadahStore.get();
      if (ibadah) setCity(ibadah.city);
    })();
  }, []);

  async function saveCity() {
    const existing = await ibadahStore.get();
    await ibadahStore.set({
      city: city.trim(),
      calculationMethod: existing?.calculationMethod ?? 'kemenag',
      remindersEnabled: existing?.remindersEnabled ?? {
        sholat: true,
        dzikirPagiPetang: false,
        puasaSunnah: false,
      },
    });
    setCitySaved(true);
    setTimeout(() => setCitySaved(false), 1500);
  }

  async function testCoach() {
    setTesting(true);
    setTestResult(null);
    try {
      await apiKeyStore.set(apiKey.trim());
      const reply = await callCoach(
        {
          system:
            'Kamu AI Coach STROPHE. Balas HANYA dengan satu kalimat pendek konfirmasi bahwa koneksi berhasil, dalam Bahasa Indonesia.',
          user: 'Tes koneksi.',
        },
        100
      );
      setTestResult(reply);
    } catch (err) {
      setTestResult(err instanceof CoachClientError ? err.message : 'Gagal menghubungi AI Coach.');
    } finally {
      setTesting(false);
    }
  }

  async function enableNotifications() {
    const status = await requestNotificationPermission();
    setNotifStatus(status);
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="eyebrow">Pengaturan</p>
        <button className="btn-secondary" onClick={onBack}>
          Kembali
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 16 }}>AI Coach</h2>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          Butuh Anthropic API key dari console.anthropic.com. Tersimpan hanya di HP ini, tidak
          dikirim ke mana pun selain api.anthropic.com.
        </p>
        <div className="field">
          <label htmlFor="apikey">API key</label>
          <input
            id="apikey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
          />
        </div>
        <button className="btn-secondary" onClick={testCoach} disabled={testing || !apiKey.trim()}>
          {testing ? 'Menghubungi...' : 'Simpan & Tes Koneksi'}
        </button>
        {testResult && <p style={{ fontSize: 13 }}>{testResult}</p>}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 16 }}>Ibadah</h2>
        <div className="field">
          <label htmlFor="city">Kota domisili</label>
          <input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="mis. Jakarta"
          />
        </div>
        <button className="btn-secondary" onClick={saveCity}>
          {citySaved ? 'Tersimpan ✓' : 'Simpan'}
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 16 }}>Notifikasi</h2>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          Pengingat di Android bersifat usaha terbaik, bukan jaminan — lihat README bagian
          Keterbatasan. Matikan battery optimization untuk aplikasi ini di pengaturan Android
          supaya lebih andal.
        </p>
        <button className="btn-secondary" onClick={enableNotifications}>
          Aktifkan Notifikasi
        </button>
        {notifStatus && <p style={{ fontSize: 13 }}>Status: {notifStatus}</p>}
      </div>
    </div>
  );
}
