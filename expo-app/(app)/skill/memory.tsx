import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../../constants/theme';
import { StropheText } from '../../../components/ui/StropheText';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { FlashCard } from '../../../components/memory/FlashCard';
import { useMemory } from '../../../hooks/useMemory';

type Screen = 'intro' | 'session' | 'done';

export default function MemoryScreen() {
  const router = useRouter();
  const { cards, loading, totalXPEarned, reviewCard, dueCount } = useMemory();
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [reviewed, setReviewed] = useState(0);

  const currentCard = cards[currentIdx];
  const totalCards = cards.length;

  const handleRate = async (quality: number) => {
    if (!currentCard) return;
    const xp = await reviewCard(currentCard.id, quality);
    setSessionXP((prev) => prev + (xp ?? 0));
    setReviewed((prev) => prev + 1);

    if (currentIdx >= totalCards - 1) {
      setScreen('done');
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleStart = () => {
    if (cards.length === 0) {
      Alert.alert('Tidak ada kartu hari ini', 'Semua kartu sudah direview. Kembali besok!');
      return;
    }
    setCurrentIdx(0);
    setSessionXP(0);
    setReviewed(0);
    setScreen('session');
  };

  if (screen === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={16} color={Colors.gold} />
            <StropheText variant="gold">Kembali</StropheText>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.goldLine} />
            <StropheText variant="h2">Memory Vault</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Daya Ingat & Spaced Repetition
            </StropheText>
          </View>

          <Card gold style={styles.explainCard}>
            <StropheText variant="gold" style={styles.explainTitle}>Cara Kerja Memory Vault</StropheText>
            <StropheText variant="body" style={styles.explainText}>
              Kartu materi dari Sesi Inti muncul kembali secara otomatis di sini — tapi tidak setiap hari.
              {'\n\n'}
              Sistem ini pakai metode <StropheText variant="gold">Spaced Repetition</StropheText>: kartu yang mudah kamu ingat muncul lebih jarang (misal 10 hari sekali). Kartu yang sulit muncul lebih sering (misal besok lagi).
              {'\n\n'}
              Ini bukan hafalan paksa — ini cara otak belajar secara alami. Seperti mengulang pelajaran tepat sebelum kamu mulai lupa.
            </StropheText>
          </Card>

          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <StropheText style={styles.statNum}>{loading ? '...' : dueCount}</StropheText>
                <StropheText variant="dim">Kartu hari ini</StropheText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <StropheText style={styles.statNum}>{loading ? '...' : dueCount * 10}</StropheText>
                <StropheText variant="dim">Estimasi XP</StropheText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <StropheText style={styles.statNum}>{loading ? '...' : `~${Math.ceil(dueCount * 0.5)} mnt`}</StropheText>
                <StropheText variant="dim">Estimasi waktu</StropheText>
              </View>
            </View>
          </Card>

          <Card style={styles.ratingGuide}>
            <StropheText variant="caption" style={{ letterSpacing: 1, color: Colors.whiteDim, marginBottom: Spacing.sm }}>
              PANDUAN RATING
            </StropheText>
            {[
              { score: '5–4', label: 'Ingat dengan mudah → kartu muncul lebih jarang' },
              { score: '3', label: 'Ingat tapi susah → interval sedang' },
              { score: '2–0', label: 'Lupa/salah → muncul lagi besok' },
            ].map((item) => (
              <View key={item.score} style={styles.guideRow}>
                <StropheText variant="gold" style={{ fontWeight: '700', minWidth: 30 }}>{item.score}</StropheText>
                <StropheText variant="caption" style={{ flex: 1 }}>{item.label}</StropheText>
              </View>
            ))}
          </Card>

          <Button
            label={dueCount === 0 ? 'Tidak ada kartu hari ini' : `Mulai Review (${dueCount} kartu)`}
            onPress={handleStart}
            disabled={dueCount === 0 || loading}
            loading={loading}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'session' && currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.sessionContainer}>
          {/* Progress bar */}
          <View style={styles.sessionHeader}>
            <TouchableOpacity onPress={() => setScreen('intro')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="close" size={14} color={Colors.whiteDim} />
              <StropheText variant="dim">Keluar</StropheText>
            </TouchableOpacity>
            <StropheText variant="gold">+{sessionXP} XP</StropheText>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((reviewed) / totalCards) * 100}%` },
              ]}
            />
          </View>

          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            category={currentCard.category}
            cardNumber={reviewed + 1}
            totalCards={totalCards}
            onRate={handleRate}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.doneScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.doneIcon}>
            <Icon name="target" size={48} color={Colors.gold} />
          </View>
          <StropheText variant="h2" style={styles.doneTitle}>Sesi Selesai!</StropheText>
          <StropheText variant="caption" style={styles.doneSub}>
            Memory Vault hari ini tuntas.
          </StropheText>

          <Card gold style={styles.doneCard}>
            <View style={styles.doneStats}>
              <View style={styles.doneStat}>
                <StropheText style={styles.doneStatNum}>{reviewed}</StropheText>
                <StropheText variant="dim">Kartu direview</StropheText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.doneStat}>
                <StropheText style={[styles.doneStatNum, { color: Colors.gold }]}>+{sessionXP}</StropheText>
                <StropheText variant="dim">XP diperoleh</StropheText>
              </View>
            </View>
          </Card>

          <Card style={styles.nextCard}>
            <StropheText variant="caption" style={{ color: Colors.whiteDim, letterSpacing: 1 }}>
              SELANJUTNYA
            </StropheText>
            <StropheText variant="body" style={{ marginTop: Spacing.xs }}>
              Kartu yang kamu ingat dengan mudah akan muncul kembali dalam beberapa hari.
              Kartu yang susah akan muncul besok.
            </StropheText>
          </Card>

          <Button label="Kembali ke Home" onPress={() => router.replace('/(app)')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingBottom: Spacing.sm },
  header: { marginBottom: Spacing.xs },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2, marginBottom: Spacing.md },

  explainCard: { padding: Spacing.lg, gap: Spacing.sm },
  explainTitle: { fontWeight: '700', fontSize: FontSize.md, letterSpacing: 0.5 },
  explainText: { color: Colors.whiteSecondary, lineHeight: 24 },

  statsCard: { padding: Spacing.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },

  ratingGuide: { gap: Spacing.sm },
  guideRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },

  // Session
  sessionContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },

  // Done
  doneScroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  doneIcon: { alignItems: 'center', marginBottom: Spacing.sm },
  doneTitle: { textAlign: 'center' },
  doneSub: { textAlign: 'center', color: Colors.whiteSecondary },
  doneCard: { width: '100%', padding: Spacing.lg },
  doneStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  doneStat: { alignItems: 'center', gap: 4 },
  doneStatNum: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.white },
  nextCard: { width: '100%', gap: Spacing.xs },
});
