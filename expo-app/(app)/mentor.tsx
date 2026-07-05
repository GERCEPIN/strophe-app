import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useMentor } from '../../hooks/useMentor';
import { MentorId, Mentor } from '../../lib/mentors';

// ── Warna aksen per archetype ──────────────────────────────────────
function archetypeColor(archetype: string): string {
  switch (archetype) {
    case 'Stoik': return '#8B9BB4';
    case 'Pejuang': return '#C0392B';
    case 'Strategis': return '#E67E22';
    case 'Sokrates': return '#27AE60';
    case 'Modern': return '#3498DB';
    case 'Sosiolog': return '#8E44AD';
    default: return Colors.gold;
  }
}

// ── Mentor card ────────────────────────────────────────────────────
function MentorCard({
  mentor,
  active,
  onSelect,
}: {
  mentor: Mentor;
  active: boolean;
  onSelect: () => void;
}) {
  const color = archetypeColor(mentor.archetype);
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
      <View
        style={[
          cardStyles.card,
          active && { borderColor: color, borderWidth: 2 },
        ]}
      >
        {/* Accent line */}
        <View style={[cardStyles.accent, { backgroundColor: color }]} />
        <View style={cardStyles.body}>
          <View style={cardStyles.top}>
            <View style={{ flex: 1 }}>
              <View style={cardStyles.nameRow}>
                <StropheText style={cardStyles.name}>{mentor.name}</StropheText>
                {active && (
                  <View style={[cardStyles.activePill, { borderColor: color }]}>
                    <StropheText style={[cardStyles.activePillText, { color }]}>AKTIF</StropheText>
                  </View>
                )}
              </View>
              <StropheText variant="dim" style={cardStyles.meta}>
                {mentor.era} · {mentor.origin}
              </StropheText>
            </View>
            <View style={[cardStyles.archPill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
              <StropheText style={[cardStyles.archText, { color }]}>{mentor.archetype}</StropheText>
            </View>
          </View>
          <StropheText variant="body" style={cardStyles.tagline}>"{mentor.tagline}"</StropheText>
          <StropheText variant="dim" style={cardStyles.desc}>{mentor.description}</StropheText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accent: { width: 4 },
  body: { flex: 1, padding: Spacing.md, gap: Spacing.xs },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  name: { fontSize: FontSize.base, fontWeight: '800', color: Colors.white },
  meta: { fontSize: 10, marginTop: 2 },
  activePill: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1,
  },
  activePillText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  archPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1,
    alignSelf: 'flex-start', flexShrink: 0,
  },
  archText: { fontSize: 10, fontWeight: '700' },
  tagline: { fontStyle: 'italic', color: Colors.whiteSecondary, lineHeight: 20 },
  desc: { fontSize: 11, lineHeight: 18 },
});

// ── Main screen ────────────────────────────────────────────────────
export default function MentorScreen() {
  const router = useRouter();
  const {
    activeMentor,
    activeMentorId,
    todayWisdom,
    savedWisdoms,
    loading,
    generatingWisdom,
    allMentors,
    selectMentor,
    generateDailyWisdom,
    saveToVault,
    deleteFromVault,
    isWisdomSaved,
    dailyTheme,
  } = useMentor();

  const [tab, setTab] = useState<'wisdom' | 'select' | 'vault'>('wisdom');
  const [wisdomContent, setWisdomContent] = useState(todayWisdom?.content ?? '');

  useEffect(() => {
    if (todayWisdom?.content) setWisdomContent(todayWisdom.content);
  }, [todayWisdom]);

  const handleGenerate = async () => {
    const content = await generateDailyWisdom();
    if (content) setWisdomContent(content);
  };

  const handleSave = () => {
    if (!wisdomContent) return;
    if (isWisdomSaved(wisdomContent)) {
      Alert.alert('Sudah tersimpan', 'Wisdom ini sudah ada di vault-mu.');
      return;
    }
    saveToVault(wisdomContent, activeMentorId, todayWisdom?.theme ?? undefined);
    Alert.alert('Tersimpan', 'Wisdom disimpan ke Wisdom Vault.');
  };

  const color = archetypeColor(activeMentor.archetype);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={16} color={Colors.gold} />
          <StropheText variant="gold">Kembali</StropheText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.goldLine} />
          <StropheText variant="h2">Global Mentor</StropheText>
          <StropheText variant="caption" style={{ marginTop: 4 }}>
            Belajar dari 8 mentor terbaik lintas peradaban
          </StropheText>
        </View>

        {/* Active mentor summary */}
        <Card style={[styles.activeMentorCard, { borderColor: color + '88' }]}>
          <View style={styles.activeMentorTop}>
            <View style={{ flex: 1 }}>
              <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1.5 }}>MENTOR AKTIF</StropheText>
              <StropheText variant="h3" style={{ marginTop: 4, color }}>{activeMentor.name}</StropheText>
              <StropheText variant="dim" style={{ marginTop: 2, fontSize: 11 }}>
                {activeMentor.era} · {activeMentor.origin}
              </StropheText>
            </View>
            <View style={[styles.archBadge, { borderColor: color, backgroundColor: color + '22' }]}>
              <StropheText style={[styles.archBadgeText, { color }]}>{activeMentor.archetype}</StropheText>
            </View>
          </View>
          <View style={[styles.themePill, { borderColor: color + '55' }]}>
            <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1 }}>TEMA HARI INI</StropheText>
            <StropheText style={[styles.themeText, { color }]}>{dailyTheme}</StropheText>
          </View>
        </Card>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['wisdom', 'select', 'vault'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <StropheText style={[styles.tabLabel, tab === t && { color: Colors.gold }]}>
                {t === 'wisdom' ? 'Wisdom' : t === 'select' ? 'Pilih Mentor' : 'Vault'}
              </StropheText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── WISDOM TAB ── */}
        {tab === 'wisdom' && (
          <>
            {wisdomContent ? (
              <Card gold style={styles.wisdomCard}>
                <View style={styles.wisdomHeader}>
                  <StropheText variant="gold" style={styles.wisdomFrom}>
                    {activeMentor.name.toUpperCase()}
                  </StropheText>
                  <StropheText variant="dim" style={{ fontSize: 10 }}>{dailyTheme}</StropheText>
                </View>
                <StropheText variant="body" style={styles.wisdomText}>{wisdomContent}</StropheText>
                <View style={styles.wisdomActions}>
                  <TouchableOpacity
                    onPress={handleSave}
                    style={[
                      styles.wisdomBtn,
                      isWisdomSaved(wisdomContent) && { borderColor: Colors.success },
                    ]}
                  >
                    <Icon
                      name={isWisdomSaved(wisdomContent) ? 'check' : 'book'}
                      size={12}
                      color={isWisdomSaved(wisdomContent) ? Colors.success : Colors.gold}
                    />
                    <StropheText
                      style={[
                        styles.wisdomBtnText,
                        isWisdomSaved(wisdomContent) && { color: Colors.success },
                      ]}
                    >
                      {isWisdomSaved(wisdomContent) ? 'Tersimpan' : 'Simpan ke Vault'}
                    </StropheText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleGenerate} style={styles.wisdomBtn} disabled={generatingWisdom}>
                    {generatingWisdom ? (
                      <ActivityIndicator size="small" color={Colors.gold} />
                    ) : (
                      <>
                        <Icon name="bolt" size={12} color={Colors.gold} />
                        <StropheText style={styles.wisdomBtnText}>Refresh</StropheText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <Card style={styles.emptyWisdom}>
                {generatingWisdom ? (
                  <View style={{ alignItems: 'center', gap: Spacing.md }}>
                    <ActivityIndicator size="large" color={Colors.gold} />
                    <StropheText variant="dim">Membangkitkan wisdom dari {activeMentor.name}...</StropheText>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: Spacing.md }}>
                    <StropheText variant="dim" style={{ textAlign: 'center' }}>
                      Wisdom harian dari {activeMentor.name} belum dibuat.
                    </StropheText>
                    <TouchableOpacity
                      onPress={handleGenerate}
                      style={styles.generateBtn}
                    >
                      <Icon name="bolt" size={14} color={Colors.bg} />
                      <StropheText style={styles.generateBtnText}>Dapatkan Wisdom Hari Ini</StropheText>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            )}

            {/* Tagline mentor aktif */}
            <Card style={styles.mentorQuoteCard}>
              <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1.5, marginBottom: Spacing.sm }}>
                PRINSIP {activeMentor.name.toUpperCase()}
              </StropheText>
              <StropheText variant="body" style={{ fontStyle: 'italic', color: Colors.whiteSecondary, lineHeight: 22 }}>
                "{activeMentor.tagline}"
              </StropheText>
              <StropheText variant="dim" style={{ marginTop: Spacing.sm, fontSize: 11 }}>
                {activeMentor.description}
              </StropheText>
            </Card>
          </>
        )}

        {/* ── SELECT TAB ── */}
        {tab === 'select' && (
          <>
            <StropheText variant="dim" style={styles.selectHint}>
              Pilih satu mentor untuk menemanimu hari ini. Ganti kapan saja.
            </StropheText>
            {loading ? (
              <ActivityIndicator color={Colors.gold} style={{ marginTop: Spacing.xl }} />
            ) : (
              allMentors.map((m) => (
                <MentorCard
                  key={m.id}
                  mentor={m}
                  active={m.id === activeMentorId}
                  onSelect={() => {
                    selectMentor(m.id as MentorId);
                    setWisdomContent('');
                    setTab('wisdom');
                  }}
                />
              ))
            )}
          </>
        )}

        {/* ── VAULT TAB ── */}
        {tab === 'vault' && (
          <>
            {savedWisdoms.length === 0 ? (
              <Card style={styles.emptyVault}>
                <StropheText variant="dim" style={{ textAlign: 'center' }}>
                  Vault masih kosong. Simpan wisdom yang berkesan dari tab Wisdom.
                </StropheText>
              </Card>
            ) : (
              savedWisdoms.map((w) => {
                const mentor = allMentors.find((m) => m.id === w.mentor_id);
                const wColor = mentor ? archetypeColor(mentor.archetype) : Colors.gold;
                return (
                  <Card key={w.id} style={[styles.vaultCard, { borderLeftColor: wColor, borderLeftWidth: 3 }]}>
                    <View style={styles.vaultTop}>
                      <View style={{ flex: 1 }}>
                        <StropheText style={[styles.vaultMentor, { color: wColor }]}>
                          {mentor?.name ?? w.mentor_id}
                        </StropheText>
                        {w.theme && (
                          <StropheText variant="dim" style={{ fontSize: 10, marginTop: 2 }}>{w.theme}</StropheText>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Hapus?', '', [
                            { text: 'Batal', style: 'cancel' },
                            { text: 'Hapus', style: 'destructive', onPress: () => deleteFromVault(w.id) },
                          ])
                        }
                        style={{ padding: Spacing.xs }}
                      >
                        <Icon name="close" size={12} color={Colors.whiteDim} />
                      </TouchableOpacity>
                    </View>
                    <StropheText variant="body" style={styles.vaultContent}>{w.content}</StropheText>
                    <StropheText variant="dim" style={{ fontSize: 10, marginTop: Spacing.sm }}>
                      {new Date(w.saved_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </StropheText>
                  </Card>
                );
              })
            )}
          </>
        )}

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

  activeMentorCard: { padding: Spacing.lg, gap: Spacing.md, borderWidth: 1 },
  activeMentorTop: { flexDirection: 'row', alignItems: 'flex-start' },
  archBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1,
  },
  archBadgeText: { fontSize: 11, fontWeight: '700' },
  themePill: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  themeText: { fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1 },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  tabLabel: { fontSize: 12, fontWeight: '700', color: Colors.whiteDim },

  wisdomCard: { padding: Spacing.lg, gap: Spacing.md },
  wisdomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wisdomFrom: { fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  wisdomText: { color: Colors.whiteSecondary, lineHeight: 26, fontStyle: 'italic', fontSize: FontSize.md },
  wisdomActions: { flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  wisdomBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.goldDim, backgroundColor: Colors.borderGold,
  },
  wisdomBtnText: { color: Colors.gold, fontSize: 11, fontWeight: '700' },

  emptyWisdom: { paddingVertical: Spacing.xxl, alignItems: 'center' },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.gold, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  generateBtnText: { color: Colors.bg, fontWeight: '800', fontSize: FontSize.sm },

  mentorQuoteCard: { gap: Spacing.xs },

  selectHint: { fontSize: 12, lineHeight: 18 },

  emptyVault: { paddingVertical: Spacing.xxl, alignItems: 'center' },
  vaultCard: { padding: Spacing.md, gap: Spacing.xs, borderRadius: Radius.md, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  vaultTop: { flexDirection: 'row', alignItems: 'flex-start' },
  vaultMentor: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  vaultContent: { color: Colors.whiteSecondary, lineHeight: 22, fontStyle: 'italic' },
});
