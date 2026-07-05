import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useProfile } from '../../hooks/useProfile';
import { useLevel } from '../../hooks/useLevel';
import { useCoach } from '../../hooks/useCoach';
import { useDictionary } from '../../hooks/useDictionary';
import { CoachChat } from '../../components/coach/CoachChat';
import { AutoSimplifier } from '../../components/coach/AutoSimplifier';
import { DiamondCheckpoint } from '../../components/diamond/DiamondCheckpoint';
import { Icon } from '../../components/ui/Icon';
import { chatCompletion } from '../../lib/openrouter';
import { buildPanicChallengePrompt, COACH_MODEL } from '../../lib/ai-coach';
import { xpRequired } from '../../lib/level';
import { diamondNumber, calcXPMultiplier } from '../../lib/diamond';
import { useDiamond } from '../../hooks/useDiamond';

// Konten Sesi Inti Level 1-5 (akan berkembang di modul konten)
const CORE_SESSIONS: Record<number, { title: string; description: string; tasks: string[] }> = {
  1: {
    title: 'Pondasi Disiplin',
    description: 'Disiplin bukan soal motivasi — ini soal kebiasaan yang dibangun satu langkah kecil per hari.',
    tasks: [
      'Tulis 1 hal yang WAJIB kamu selesaikan hari ini (bukan "ingin" — tapi HARUS).',
      'Set timer 10 menit. Fokus hanya pada 1 tugas itu. Tidak boleh multitasking.',
      'Setelah selesai, catat: apakah kamu tergoda buka HP/melenceng? Berapa kali?',
    ],
  },
  2: {
    title: 'Insting Pertama',
    description: 'Insting yang baik dilatih, bukan dilahirkan. Hari ini kamu mulai melatihnya.',
    tasks: [
      'Ambil 1 keputusan kecil hari ini dalam 5 detik (misalnya: menu makan, rute jalan, urutan tugas). Jangan pikir panjang — langsung putuskan.',
      'Setelah 1 jam, evaluasi: apakah keputusan itu buruk? Biasanya tidak sepayah yang kamu bayangkan.',
      'Tulis hasilnya: "Saya putuskan ___, hasilnya ___."',
    ],
  },
  3: {
    title: 'Latihan Ketelitian',
    description: 'Ketelitian adalah insting yang diperlambat. Orang teliti melihat apa yang orang lain lewatkan.',
    tasks: [
      'Ambil teks apa saja (artikel, pesan, tulisanmu sendiri). Baca ulang dengan tujuan mencari 3 hal yang bisa diperbaiki atau tidak akurat.',
      'Catat 3 hal yang kamu temukan.',
      'Tanyakan: "Kalau saya tidak teliti tadi, apa yang bisa salah?"',
    ],
  },
  4: {
    title: 'Mental Tangguh — Sesi 1',
    description: 'Mental tangguh bukan berarti tidak pernah merasa lelah. Artinya: kamu tetap melangkah meski lelah.',
    tasks: [
      'Ingat 1 momen minggu ini kamu hampir menyerah atau menunda. Tuliskan.',
      'Tanyakan ke dirimu: "Apa yang paling buruk bisa terjadi kalau aku tetap melanjutkan?" Biasanya, jawabannya tidak seburuk yang dibayangkan.',
      'Hari ini, lakukan 1 hal kecil yang sudah kamu tunda minimal 2 hari.',
    ],
  },
  5: {
    title: 'Percaya Diri — Dasar',
    description: 'Percaya diri sejati bukan dari penampilan — tapi dari bukti bahwa kamu bisa diandalkan oleh dirimu sendiri.',
    tasks: [
      'Tulis 3 hal yang kamu lakukan dengan baik minggu ini (sekecil apapun).',
      'Berdiri tegak selama 2 menit (postur tegak, bahu ke belakang, kepala lurus). Ini bukan trik — riset menunjukkan postur mempengaruhi rasa percaya diri.',
      'Berkomitmen ke 1 janji kecil ke dirimu sendiri untuk besok. Catat.',
    ],
  },
};

function getCoreSession(level: number) {
  // Siklus setiap 5 level dengan variasi progresif
  const base = ((level - 1) % 5) + 1;
  const cycle = Math.floor((level - 1) / 5) + 1;
  const session = CORE_SESSIONS[base];
  return {
    ...session,
    title: cycle > 1 ? `${session.title} (Siklus ${cycle})` : session.title,
  };
}

export default function LevelScreen() {
  const { profile, loading, refetch } = useProfile();
  const { completeSession, completing, sessionDoneToday, diamondTriggered, clearDiamondTrigger } = useLevel(profile, refetch);
  const { claimDiamond, saveCheckpointResult, hasBadge } = useDiamond();
  const [tasksDone, setTasksDone] = useState<boolean[]>([false, false, false]);
  const [coachVisible, setCoachVisible] = useState(false);
  const [panicChallenge, setPanicChallenge] = useState('');
  const [panicVisible, setPanicVisible] = useState(false);

  const level = profile?.current_level ?? 1;
  const session = getCoreSession(level);
  const allDone = tasksDone.every(Boolean);
  const multiplier = profile?.xp_multiplier ?? 1.0;
  const isCheckpointPending = diamondTriggered && !hasBadge(diamondNumber(level));

  const { messages, thinking, sendMessage } = useCoach(profile, session.title);
  const { explainTerm } = useDictionary();

  const handlePanicButton = async () => {
    if (!profile) return;
    setPanicVisible(true);
    setPanicChallenge('');
    const msgs = buildPanicChallengePrompt(profile.display_name || 'Warrior', level);
    const result = await chatCompletion(msgs, COACH_MODEL);
    setPanicChallenge(result);
  };

  const toggleTask = (i: number) => {
    setTasksDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const handleComplete = async () => {
    if (!allDone) {
      Alert.alert('Selesaikan semua tugas dulu', 'Tandai semua tugas sebelum selesai.');
      return;
    }
    const result = await completeSession('core', undefined, true);
    if (result) {
      const { leveledUp, xpEarned, isMultiplied } = result as { leveledUp: boolean; xpEarned: number; newLevel: number; isMultiplied: boolean };
      const multiplierNote = isMultiplied ? ` (sudah dikalikan x${multiplier.toFixed(1)})` : '';
      if (leveledUp) {
        Alert.alert('LEVEL NAIK!', `Kamu naik ke Level ${(profile?.current_level ?? 1) + 1}.\n+${xpEarned} XP${multiplierNote}.`);
      } else {
        Alert.alert('Sesi Selesai', `+${xpEarned} XP${multiplierNote}. Konsisten terus!`);
      }
      setTasksDone([false, false, false]);
    }
  };

  const handleDiamondComplete = async (passed: boolean, score: number, reflection: string) => {
    await saveCheckpointResult(diamondNumber(level), score, passed);
    if (passed) {
      await claimDiamond(level, reflection);
    }
    clearDiamondTrigger();
  };

  const xpNeeded = xpRequired(level);
  const xpCurrent = (profile?.total_xp ?? 0) % xpNeeded;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Level Badge */}
        <View style={styles.levelHeader}>
          <View>
            <StropheText variant="dim">SESI INTI</StropheText>
            <StropheText variant="h2">Level {level}</StropheText>
          </View>
          <View style={styles.xpBadge}>
            <StropheText variant="dim" style={{ fontSize: 11 }}>XP</StropheText>
            <StropheText style={{ color: Colors.gold, fontWeight: '800', fontSize: 18 }}>
              {xpCurrent}/{xpNeeded}
            </StropheText>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${Math.round((xpCurrent / xpNeeded) * 100)}%` }]} />
        </View>

        {sessionDoneToday ? (
          <Card gold style={styles.doneCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm }}>
              <Icon name="check" size={16} color={Colors.gold} />
              <StropheText variant="gold" style={{ fontWeight: '700', fontSize: FontSize.md }}>
                Sesi Hari Ini Selesai
              </StropheText>
            </View>
            <StropheText variant="dim" style={{ textAlign: 'center', marginTop: 8 }}>
              Kembali besok untuk Level {level + 1}. Jangan putus streakmu!
            </StropheText>
          </Card>
        ) : (
          <>
            {/* XP Multiplier badge jika aktif */}
            {multiplier > 1.0 && (
              <View style={styles.multiplierBanner}>
                <Icon name="target" size={14} color={Colors.gold} />
                <StropheText style={{ color: Colors.gold, fontWeight: '700', fontSize: 12 }}>
                  XP Multiplier x{multiplier.toFixed(1)} Aktif
                </StropheText>
              </View>
            )}

            {/* Session Card */}
            <Card gold style={styles.sessionCard}>
              <StropheText variant="gold" style={{ letterSpacing: 2, fontSize: 11 }}>
                TEMA HARI INI
              </StropheText>
              <StropheText variant="h3" style={{ marginTop: Spacing.sm }}>
                {session.title}
              </StropheText>
              <StropheText variant="caption" style={{ marginTop: Spacing.sm, lineHeight: 22 }}>
                {session.description}
              </StropheText>
            </Card>

            {/* Tasks */}
            <StropheText variant="caption" style={styles.sectionTitle}>TUGAS HARI INI</StropheText>
            {session.tasks.map((task, i) => (
              <TouchableOpacity key={i} onPress={() => toggleTask(i)} activeOpacity={0.7}>
                <Card style={tasksDone[i] ? [styles.taskCard, styles.taskCardDone] : styles.taskCard}>
                  <View style={styles.taskRow}>
                    <View style={[styles.checkbox, tasksDone[i] && styles.checkboxDone]}>
                      {tasksDone[i] && <Icon name="check" size={12} color={Colors.bg} />}
                    </View>
                    <StropheText
                      variant="body"
                      style={[styles.taskText, tasksDone[i] && styles.taskTextDone]}
                    >
                      {task}
                    </StropheText>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}

            {/* Complete Button */}
            <Button
              label={completing ? 'Menyimpan...' : 'Selesai — Klaim XP'}
              onPress={handleComplete}
              loading={completing || loading}
              disabled={!allDone}
              style={{ marginTop: Spacing.sm }}
            />

            {!allDone && (
              <StropheText variant="dim" style={{ textAlign: 'center', marginTop: Spacing.xs }}>
                Tandai semua tugas untuk selesai.
              </StropheText>
            )}
          </>
        )}

        {/* Contoh Auto-Simplifier */}
        {!sessionDoneToday && (
          <Card style={styles.simplifierDemo}>
            <StropheText variant="dim" style={{ letterSpacing: 1, fontSize: 11, marginBottom: Spacing.sm }}>
              ISTILAH DALAM SESI INI
            </StropheText>
            <View style={styles.termRow}>
              <AutoSimplifier
                term="Spaced Repetition"
                context="teknik belajar pengulangan terjadwal"
                sourceLevel={level}
                onExplain={explainTerm}
              />
              <StropheText variant="dim">  ·  </StropheText>
              <AutoSimplifier
                term="Self-Efficacy"
                context="kepercayaan diri spesifik per kemampuan"
                sourceLevel={level}
                onExplain={explainTerm}
              />
            </View>
            <StropheText variant="dim" style={{ marginTop: Spacing.sm, fontSize: 11 }}>
              Ketuk istilah emas untuk penjelasan sederhana → tersimpan di Kamus Pribadi
            </StropheText>
          </Card>
        )}

        {/* Panic Button */}
        {!sessionDoneToday && (
          <TouchableOpacity onPress={handlePanicButton} style={styles.panicBtn} activeOpacity={0.8}>
            <Icon name="bolt" size={14} color={Colors.danger} />
            <StropheText style={styles.panicText}>Hampir Menyerah? Tekan ini.</StropheText>
          </TouchableOpacity>
        )}

        {/* Panic Modal */}
        {panicVisible && (
          <View style={styles.panicModal}>
            <Card gold style={styles.panicCard}>
              <StropheText variant="gold" style={{ letterSpacing: 2, fontSize: 11, marginBottom: Spacing.sm }}>
                MICRO-CHALLENGE 60 DETIK
              </StropheText>
              <StropheText variant="body" style={{ lineHeight: 24 }}>
                {panicChallenge || 'Coach sedang menyiapkan tantangan...'}
              </StropheText>
              <Button
                label="Oke, saya lanjut!"
                onPress={() => setPanicVisible(false)}
                style={{ marginTop: Spacing.lg }}
              />
            </Card>
          </View>
        )}

        {/* Next Level Preview */}
        <StropheText variant="caption" style={styles.sectionTitle}>LEVEL BERIKUTNYA</StropheText>
        <Card style={styles.nextCard}>
          <StropheText variant="body">Level {level + 1}: {getCoreSession(level + 1).title}</StropheText>
          <StropheText variant="dim" style={{ marginTop: 4 }}>
            Butuh {xpNeeded - xpCurrent} XP lagi untuk naik level.
          </StropheText>
        </Card>

      </ScrollView>

      {/* Floating Coach Button */}
      {!sessionDoneToday && (
        <TouchableOpacity
          onPress={() => setCoachVisible(true)}
          style={styles.coachFab}
          activeOpacity={0.85}
        >
          <Icon name="brain" size={18} color={Colors.bg} />
        </TouchableOpacity>
      )}

      {/* Coach Chat Modal */}
      <CoachChat
        visible={coachVisible}
        onClose={() => setCoachVisible(false)}
        messages={messages}
        thinking={thinking}
        onSend={sendMessage}
        sessionTheme={session.title}
      />

      {/* Diamond Checkpoint Modal */}
      <DiamondCheckpoint
        visible={isCheckpointPending}
        level={level}
        onComplete={handleDiamondComplete}
        onDismiss={clearDiamondTrigger}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: Colors.borderGold,
    borderRadius: 12,
    padding: Spacing.sm,
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  xpBarBg: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  doneCard: { padding: Spacing.xl, alignItems: 'center' },
  multiplierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.borderGold,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sessionCard: { padding: Spacing.lg },
  sectionTitle: { letterSpacing: 2, color: Colors.whiteDim },
  taskCard: { padding: Spacing.md },
  taskCardDone: { borderColor: Colors.goldDim, backgroundColor: '#0F0C06' },
  taskRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.whiteDim,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxDone: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  taskText: { flex: 1, lineHeight: 22, color: Colors.whiteSecondary },
  taskTextDone: { color: Colors.whiteDim, textDecorationLine: 'line-through' },
  nextCard: { marginBottom: Spacing.md },

  simplifierDemo: { gap: Spacing.xs },
  termRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs },

  panicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#1A0A0A',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  panicText: { color: Colors.danger, fontWeight: '700', fontSize: FontSize.sm, letterSpacing: 0.5 },
  panicModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  panicCard: { padding: Spacing.lg },

  coachFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  coachFabText: { fontSize: 24 },
});
