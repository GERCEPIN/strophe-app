import { useEffect, useState } from 'react';
import type { ProgressState, UserProfile } from './types';
import { profileStore, progressStore } from './storage/db';
import { createInitialProgressState } from './engine/level';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { SessionRunner } from './components/SessionRunner';
import { Settings } from './components/Settings';

type Screen = 'loading' | 'onboarding' | 'dashboard' | 'session' | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    const p = await profileStore.get();
    if (!p) {
      setScreen('onboarding');
      return;
    }
    setProfile(p);
    let prog = await progressStore.get();
    if (!prog) {
      prog = createInitialProgressState();
      await progressStore.set(prog);
    }
    setProgress(prog);
    setScreen('dashboard');
  }

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => void bootstrap()} />;
  }

  if (screen === 'settings') {
    return <Settings onBack={() => setScreen('dashboard')} />;
  }

  if (screen === 'session' && progress) {
    return (
      <SessionRunner
        progress={progress}
        onFinish={(next) => {
          setProgress(next);
          setScreen('dashboard');
        }}
        onCancel={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'dashboard' && profile && progress) {
    return (
      <Dashboard
        profile={profile}
        progress={progress}
        onStartSession={() => setScreen('session')}
        onOpenSettings={() => setScreen('settings')}
      />
    );
  }

  // 'loading', or dashboard/session before profile+progress have resolved
  return (
    <div className="screen">
      <p className="eyebrow">STROPHE</p>
    </div>
  );
}

export default App;
