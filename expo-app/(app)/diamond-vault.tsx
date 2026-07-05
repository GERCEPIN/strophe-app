import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { DiamondBadge } from '../../components/diamond/DiamondBadge';
import { useDiamond } from '../../hooks/useDiamond';
import { useProfile } from '../../hooks/useProfile';
import { diamondTierColor, levelsTillNextDiamond, calcXPMultiplier } from '../../lib/diamond';

export default function DiamondVaultScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { badges, vaultEntries, loading } = useDiamond();

  const currentLevel = profile?.current_level ?? 1;
  const diamondCount = profile?.diamond_count ?? 0;
  const multiplier = profile?.xp_multiplier ?? 1.0;
  const tillNext = levelsTillNextDiamond(currentLevel);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={16} color={Colors.gold} />
          <StropheText variant="gold">Kembali</StropheText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.goldLine} />
          <StropheText variant="h2">Diamond Vault</StropheText>
          <StropheText variant="caption" style={{ marginTop: 4 }}>
            Galeri transformasi diri — dari Level 1 hingga sekarang
          </StropheText>
        </View>

        {/* Status saat ini */}
        <Card gold style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <StropheText variant="dim" style={styles.statusLabel}>STATUS SEKARANG</StropheText>
              <StropheText variant="h3" style={{ marginTop: 4 }}>
                Level {currentLevel}
              </StropheText>
              {diamondCount > 0 && (
                <StropheText style={{ color: diamondTierColor(diamondCount), marginTop: 4, fontWeight: '700', fontSize: FontSize.sm }}>
                  Diamond {diamondCount} — XP x{multiplier.toFixed(1)}
                </StropheText>
              )}
            </View>
            {diamondCount > 0 ? (
              <DiamondBadge diamondNumber={diamondCount} size="md" showLabel={false} />
            ) : (
              <View style={styles.noBadge}>
                <StropheText variant="dim" style={{ fontSize: 11, textAlign: 'center' }}>
                  {tillNext} level{'\n'}menuju{'\n'}Diamond 1
                </StropheText>
              </View>
            )}
          </View>

          {/* Progress bar menuju Diamond berikutnya */}
          <View style={styles.nextDiamondRow}>
            <StropheText variant="dim" style={{ fontSize: 11 }}>
              {tillNext} level menuju Diamond {diamondCount + 1}
            </StropheText>
            <StropheText style={{ color: Colors.gold, fontSize: 11, fontWeight: '700' }}>
              x{calcXPMultiplier(diamondCount + 1).toFixed(1)} XP
            </StropheText>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(((50 - tillNext) / 50) * 100)}%`,
                  backgroundColor: diamondTierColor(diamondCount + 1),
                },
              ]}
            />
          </View>
        </Card>

        {/* Badge Collection */}
        {badges.length > 0 && (
          <>
            <StropheText variant="caption" style={styles.sectionTitle}>BADGE DIRAIH</StropheText>
            <View style={styles.badgeGrid}>
              {badges.map((badge) => (
                <Card key={badge.id} style={styles.badgeCard}>
                  <DiamondBadge diamondNumber={badge.diamond_number} size="sm" />
                  <StropheText variant="dim" style={styles.badgeLevel}>
                    Level {badge.level_reached}
                  </StropheText>
                  <StropheText style={styles.badgeDate}>
                    {new Date(badge.earned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </StropheText>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* Vault Entries (refleksi tiap Diamond) */}
        <StropheText variant="caption" style={styles.sectionTitle}>
          {vaultEntries.length > 0 ? 'REKAP PERUBAHAN DIRI' : 'REKAP PERUBAHAN DIRI'}
        </StropheText>

        {loading ? (
          <Card style={styles.emptyCard}>
            <StropheText variant="dim" style={{ textAlign: 'center' }}>Memuat vault...</StropheText>
          </Card>
        ) : vaultEntries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon name="target" size={36} color={Colors.whiteDim} />
            </View>
            <StropheText variant="body" style={styles.emptyTitle}>Vault masih kosong</StropheText>
            <StropheText variant="dim" style={styles.emptyDesc}>
              Setiap kali kamu meraih Diamond Checkpoint (tiap 50 level), refleksimu akan tersimpan di sini dan dibandingkan dari waktu ke waktu.
            </StropheText>
          </Card>
        ) : (
          vaultEntries.map((entry, idx) => (
            <Card
              key={entry.id}
              gold={idx === vaultEntries.length - 1}
              style={styles.vaultEntry}
            >
              {/* Header entry */}
              <View style={styles.vaultEntryHeader}>
                <DiamondBadge diamondNumber={entry.diamond_number} size="sm" showLabel={false} />
                <View style={{ flex: 1 }}>
                  <StropheText variant="gold" style={styles.vaultEntryTitle}>
                    Diamond {entry.diamond_number}
                  </StropheText>
                  <StropheText variant="dim">
                    Level {entry.level_at_time} ·{' '}
                    {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </StropheText>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Refleksi user */}
              <StropheText variant="caption" style={styles.vaultLabel}>REFLEKSIMU</StropheText>
              <StropheText variant="body" style={styles.vaultText}>{entry.reflection}</StropheText>

              {/* AI Analysis */}
              {entry.ai_analysis && (
                <>
                  <View style={styles.divider} />
                  <StropheText variant="caption" style={[styles.vaultLabel, { color: Colors.gold }]}>
                    ANALISIS COACH
                  </StropheText>
                  <StropheText variant="body" style={styles.vaultText}>{entry.ai_analysis}</StropheText>
                </>
              )}
            </Card>
          ))
        )}

        {/* Info Diamond Multiplier */}
        <Card style={styles.infoCard}>
          <StropheText variant="caption" style={styles.sectionTitle}>XP MULTIPLIER PER TIER</StropheText>
          {[
            { tier: 'Sebelum Diamond', mult: 'x1.0', color: Colors.whiteDim },
            { tier: 'Diamond 1 (Level 50)', mult: 'x1.5', color: '#4FC3F7' },
            { tier: 'Diamond 2 (Level 100)', mult: 'x2.0', color: '#CE93D8' },
            { tier: 'Diamond 3 (Level 150)', mult: 'x3.0', color: '#EF9A9A' },
            { tier: 'Diamond 4+ (Level 200+)', mult: 'x4.0+', color: Colors.white },
          ].map((row) => (
            <View key={row.tier} style={styles.multRow}>
              <View style={[styles.multDot, { backgroundColor: row.color }]} />
              <StropheText variant="caption" style={{ flex: 1 }}>{row.tier}</StropheText>
              <StropheText style={{ color: row.color, fontWeight: '800', fontSize: FontSize.sm }}>
                {row.mult}
              </StropheText>
            </View>
          ))}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  header: { gap: Spacing.xs },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2 },

  statusCard: { padding: Spacing.lg, gap: Spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLeft: { flex: 1 },
  statusLabel: { letterSpacing: 1, fontSize: 11 },
  noBadge: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  nextDiamondRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressBarBg: { height: 5, backgroundColor: Colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  sectionTitle: { letterSpacing: 2, color: Colors.whiteDim, marginTop: Spacing.xs },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  badgeCard: { alignItems: 'center', gap: Spacing.xs, minWidth: 80, flex: 1 },
  badgeLevel: { fontSize: 10, textAlign: 'center' },
  badgeDate: { fontSize: 10, color: Colors.whiteDim, textAlign: 'center' },

  emptyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emptyIcon: { opacity: 0.4 },
  emptyTitle: { textAlign: 'center', fontWeight: '600' },
  emptyDesc: { textAlign: 'center', lineHeight: 22 },

  vaultEntry: { gap: Spacing.md },
  vaultEntryHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  vaultEntryTitle: { fontWeight: '700', fontSize: FontSize.md },
  divider: { height: 1, backgroundColor: Colors.border },
  vaultLabel: { letterSpacing: 1, fontSize: 11, color: Colors.whiteDim },
  vaultText: { color: Colors.whiteSecondary, lineHeight: 24 },

  infoCard: { gap: Spacing.sm, marginBottom: Spacing.lg },
  multRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  multDot: { width: 8, height: 8, borderRadius: 4 },
});
