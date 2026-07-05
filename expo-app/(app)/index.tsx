import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useProfile } from '../../hooks/useProfile';
import { useReflection, isReflectionLevel } from '../../hooks/useReflection';
import { StreakDisplay } from '../../components/streak/StreakDisplay';
import { xpRequired } from '../../lib/level';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { hasReflectionForLevel } = useReflection();

  const name = profile?.display_name || 'Warrior';
  const level = profile?.current_level ?? 1;
  const streak = profile?.streak_count ?? 0;
  const mentalScore = profile?.mental_score ?? 100;
  const totalXP = profile?.total_xp ?? 0;

  const xpNeeded = xpRequired(level);
  const xpCurrent = totalXP % xpNeeded;
  const xpProgress = xpNeeded > 0 ? xpCurrent / xpNeeded : 0;

  const today = new Date().toISOString().slice(0, 10);
  const sessionDoneToday = profile?.last_session_date === today;

  const reflectionLevel = Math.floor(level / 10) * 10;
  const needsReflection = isReflectionLevel(level) && !hasReflectionForLevel(reflectionLevel);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <StropheText variant="dim">SELAMAT DATANG KEMBALI</StropheText>
            <StropheText variant="h2">{loading ? '...' : name}</StropheText>
          </View>
          <View style={styles.levelBadge}>
            <StropheText style={styles.levelLabel}>LVL</StropheText>
            <StropheText style={styles.levelNum}>{level}</StropheText>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
          </View>
          <View style={styles.xpLabels}>
            <StropheText variant="dim">{xpCurrent} XP</StropheText>
            <StropheText variant="dim">Target: {xpNeeded} XP</StropheText>
          </View>
        </View>

        {/* Streak + Mental Score */}
        <Card style={styles.streakCard}>
          <StreakDisplay streak={streak} mentalScore={mentalScore} sessionDoneToday={sessionDoneToday} />
        </Card>

        {/* Misi Hari Ini */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/level')}
          activeOpacity={0.85}
        >
          <Card gold style={styles.missionCard}>
            <View style={styles.missionTop}>
              <StropheText variant="gold" style={styles.missionLabel}>MISI HARI INI</StropheText>
              {sessionDoneToday && (
                <View style={styles.doneBadge}>
                  <Icon name="check" size={12} color={Colors.success} />
                  <StropheText style={{ color: Colors.success, fontSize: 11, fontWeight: '700' }}>
                    SELESAI
                  </StropheText>
                </View>
              )}
            </View>
            <StropheText variant="h3" style={{ marginTop: Spacing.sm }}>
              Sesi Inti — Level {level}
            </StropheText>
            <StropheText variant="caption" style={{ marginTop: Spacing.xs }}>
              Disiplin · Insting · Ketelitian · Mental · Percaya Diri
            </StropheText>
            <View style={styles.missionFooter}>
              <StropheText variant="dim">±15 menit • +{50} XP</StropheText>
              {!sessionDoneToday && (
                <View style={styles.startPill}>
                  <StropheText style={{ color: Colors.bg, fontWeight: '700', fontSize: 12 }}>MULAI</StropheText>
                  <Icon name="arrow-right" size={12} color={Colors.bg} />
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Reflection Prompt */}
        {needsReflection && (
          <TouchableOpacity onPress={() => router.push('/(app)/reflection')} activeOpacity={0.85}>
            <Card gold style={styles.reflectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Icon name="brain" size={16} color={Colors.gold} />
                <StropheText variant="gold" style={{ fontWeight: '700', letterSpacing: 1 }}>
                  REFLECTION LEVEL {reflectionLevel}
                </StropheText>
              </View>
              <StropheText variant="body" style={{ marginTop: Spacing.sm }}>
                Kamu sudah sampai level {level}. Waktunya jeda dan refleksi.
              </StropheText>
              <View style={styles.reflectionFooter}>
                <StropheText variant="dim">Butuh ~5 menit</StropheText>
                <Icon name="arrow-right" size={14} color={Colors.gold} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Mental Score Warning */}
        {mentalScore < 60 && (
          <Card style={styles.warningCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Icon name="warning" size={16} color={Colors.danger} />
              <StropheText style={{ color: Colors.danger, fontWeight: '700' }}>Mental Score Rendah</StropheText>
            </View>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Kamu bolong beberapa hari. Selesaikan sesi hari ini untuk pulihkan skor.
            </StropheText>
          </Card>
        )}

        {/* Streak bonus info */}
        {streak >= 7 && (
          <Card style={styles.bonusCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Icon name="fire" size={16} color={Colors.gold} />
              <StropheText variant="gold" style={{ fontWeight: '700' }}>Streak Bonus Aktif</StropheText>
            </View>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Streak {streak} hari — setiap sesi dapat +{20} XP bonus.
            </StropheText>
          </Card>
        )}

        {/* Brutal Honesty Report */}
        <TouchableOpacity onPress={() => router.push('/(app)/brutal-report')} activeOpacity={0.85}>
          <Card style={[styles.journalCard, { borderColor: Colors.danger + '44' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2, flex: 1 }}>
                <StropheText style={{ fontSize: 10, letterSpacing: 2, fontWeight: '700', color: Colors.danger }}>
                  WEEKLY REPORT
                </StropheText>
                <StropheText variant="body" style={{ fontWeight: '700' }}>Brutal Honesty Report</StropheText>
                <StropheText variant="dim" style={{ fontSize: 11 }}>Laporan jujur berbasis data minggu ini</StropheText>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Kompas 5 Tahun */}
        <TouchableOpacity onPress={() => router.push('/(app)/compass')} activeOpacity={0.85}>
          <Card gold style={styles.mentorCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <StropheText variant="gold" style={{ fontSize: 10, letterSpacing: 2, fontWeight: '700' }}>
                  KOMPAS 5 TAHUN
                </StropheText>
                <StropheText variant="h3">Nilai · Future Self · Blueprint</StropheText>
                <StropheText variant="dim" style={{ fontSize: 11 }}>
                  Siapa kamu dalam 1, 5, 10 tahun?
                </StropheText>
              </View>
              <Icon name="target" size={22} color={Colors.gold} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Akademi Saham */}
        <TouchableOpacity onPress={() => router.push('/(app)/stock-academy')} activeOpacity={0.85}>
          <Card style={styles.journalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="trophy" size={18} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Akademi Analisis Saham</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 2 }}>Fundamental · Teknikal · Psikologi</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Global Mentor */}
        <TouchableOpacity onPress={() => router.push('/(app)/mentor')} activeOpacity={0.85}>
          <Card gold style={styles.mentorCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <StropheText variant="gold" style={{ fontSize: 10, letterSpacing: 2, fontWeight: '700' }}>
                  GLOBAL MENTOR
                </StropheText>
                <StropheText variant="h3">Wisdom Hari Ini</StropheText>
                <StropheText variant="dim" style={{ fontSize: 11 }}>
                  Marcus Aurelius · Musashi · Socrates · +5
                </StropheText>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.gold} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Ibadah & Finance */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <TouchableOpacity onPress={() => router.push('/(app)/ibadah')} activeOpacity={0.85} style={{ flex: 1 }}>
            <Card style={styles.miniCard}>
              <Icon name="book" size={16} color={Colors.whiteSecondary} />
              <StropheText variant="body" style={styles.miniCardTitle}>Ibadah</StropheText>
              <StropheText variant="dim" style={styles.miniCardSub}>Shalat · Quran</StropheText>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(app)/finance')} activeOpacity={0.85} style={{ flex: 1 }}>
            <Card style={styles.miniCard}>
              <Icon name="cursor" size={16} color={Colors.whiteSecondary} />
              <StropheText variant="body" style={styles.miniCardTitle}>Keuangan</StropheText>
              <StropheText variant="dim" style={styles.miniCardSub}>Catat · Analisis</StropheText>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Health Check-in */}
        <TouchableOpacity onPress={() => router.push('/(app)/health')} activeOpacity={0.85}>
          <Card style={styles.journalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="bolt" size={18} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Health Check-in</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 2 }}>Tidur, air, olahraga, kulit</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Decision Journal */}
        <TouchableOpacity onPress={() => router.push('/(app)/decision-journal')} activeOpacity={0.85}>
          <Card style={styles.journalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="target" size={18} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Decision Journal</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 2 }}>1 keputusan penting hari ini</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Skill Rotasi */}
        <StropheText variant="caption" style={styles.sectionTitle}>MODUL SKILL</StropheText>
        {sessionDoneToday ? (
          <TouchableOpacity
            onPress={() => router.push('/(app)/skill/memory')}
            activeOpacity={0.85}
          >
            <Card style={styles.skillCard}>
              <View style={styles.skillRow}>
                <View style={{ flex: 1 }}>
                  <StropheText variant="gold" style={{ fontSize: 11, letterSpacing: 2 }}>DAYA INGAT</StropheText>
                  <StropheText variant="h3" style={{ marginTop: 4 }}>Memory Vault</StropheText>
                  <StropheText variant="caption" style={{ marginTop: 4 }}>
                    Review kartu memori · Spaced Repetition
                  </StropheText>
                </View>
                <View style={styles.skillArrow}>
                  <Icon name="arrow-right" size={16} color={Colors.gold} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ) : (
          <Card style={styles.comingSoon}>
            <StropheText variant="dim" style={{ textAlign: 'center' }}>
              Selesaikan Sesi Inti dulu untuk unlock modul skill hari ini.
            </StropheText>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: Colors.borderGold,
    borderRadius: 12,
    padding: Spacing.sm,
    minWidth: 56,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  levelLabel: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 1 },
  levelNum: { fontSize: 24, fontWeight: '900', color: Colors.gold },

  xpContainer: { gap: 6 },
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
  xpLabels: { flexDirection: 'row', justifyContent: 'space-between' },

  streakCard: { padding: Spacing.lg },

  reflectionCard: { padding: Spacing.lg, gap: Spacing.xs },
  reflectionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },

  journalCard: { padding: Spacing.md },

  mentorCard: { padding: Spacing.lg },

  miniCard: { padding: Spacing.md, gap: Spacing.xs },
  miniCardTitle: { fontWeight: '700', marginTop: 2 },
  miniCardSub: { fontSize: 11 },

  missionCard: { padding: Spacing.lg },
  missionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionLabel: { letterSpacing: 2, fontSize: 11 },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F2A1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  startPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },

  warningCard: {
    borderColor: Colors.danger,
    borderWidth: 1,
    backgroundColor: '#1A0A0A',
  },
  bonusCard: {
    borderColor: Colors.goldDim,
    backgroundColor: '#0F0C06',
  },

  sectionTitle: { letterSpacing: 2, color: Colors.whiteDim, marginTop: Spacing.xs },
  comingSoon: { paddingVertical: Spacing.xl, alignItems: 'center' },
  skillCard: { padding: Spacing.lg },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  skillArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
});
