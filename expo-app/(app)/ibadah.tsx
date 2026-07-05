import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useIbadah, PRAYERS } from '../../hooks/useIbadah';

function PrayerDot({ done }: { done: boolean }) {
  return (
    <View
      style={[
        dotStyles.dot,
        done
          ? { backgroundColor: Colors.gold, borderColor: Colors.gold }
          : { backgroundColor: Colors.bgElevated, borderColor: Colors.border },
      ]}
    />
  );
}
const dotStyles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
});

export default function IbadahScreen() {
  const router = useRouter();
  const {
    todayLog,
    logs,
    saving,
    perfectStreak,
    togglePrayer,
    toggleBonus,
    setQuranPages,
    saveNotes,
  } = useIbadah();

  const [notesInput, setNotesInput] = useState(todayLog?.notes ?? '');
  const [showNotes, setShowNotes] = useState(false);

  const prayerCount = todayLog?.prayer_count ?? 0;
  const completionColor =
    prayerCount === 5 ? Colors.success : prayerCount >= 3 ? Colors.gold : Colors.danger;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={16} color={Colors.gold} />
            <StropheText variant="gold">Kembali</StropheText>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.goldLine} />
            <StropheText variant="h2">Ibadah Harian</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Konsistensi spiritual sebagai fondasi self-mastery
            </StropheText>
          </View>

          {/* Status hari ini */}
          <Card gold style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View>
                <StropheText variant="gold" style={styles.statusLabel}>SHALAT HARI INI</StropheText>
                <View style={styles.statusCount}>
                  <StropheText style={[styles.countNum, { color: completionColor }]}>
                    {prayerCount}
                  </StropheText>
                  <StropheText style={styles.countOf}>/5</StropheText>
                </View>
              </View>
              {perfectStreak > 0 && (
                <View style={styles.streakPill}>
                  <Icon name="fire" size={12} color={Colors.gold} />
                  <StropheText variant="gold" style={styles.streakText}>
                    {perfectStreak} hari penuh
                  </StropheText>
                </View>
              )}
            </View>

            {/* 5 Dot preview */}
            <View style={styles.dotRow}>
              {PRAYERS.map((p) => (
                <PrayerDot key={p.key} done={todayLog?.[p.key] ?? false} />
              ))}
            </View>
          </Card>

          {/* Checklist shalat */}
          <Card style={styles.prayerCard}>
            <StropheText variant="caption" style={styles.sectionLabel}>SHALAT 5 WAKTU</StropheText>
            {PRAYERS.map((p) => {
              const done = todayLog?.[p.key] ?? false;
              return (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => togglePrayer(p.key)}
                  style={styles.prayerRow}
                  activeOpacity={0.75}
                  disabled={saving}
                >
                  <View style={[styles.prayerCheck, done && styles.prayerCheckDone]}>
                    {done && <Icon name="check" size={10} color={Colors.bg} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <StropheText style={[styles.prayerName, done && { color: Colors.gold }]}>
                      {p.label}
                    </StropheText>
                    <StropheText variant="dim" style={{ fontSize: 11 }}>{p.time}</StropheText>
                  </View>
                  {done && (
                    <View style={styles.donePill}>
                      <StropheText style={styles.donePillText}>Sudah</StropheText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Bonus ibadah */}
          <Card style={styles.bonusCard}>
            <StropheText variant="caption" style={styles.sectionLabel}>IBADAH SUNNAH</StropheText>

            <TouchableOpacity
              onPress={() => toggleBonus('tahajud')}
              style={styles.bonusRow}
              activeOpacity={0.75}
              disabled={saving}
            >
              <View style={[styles.prayerCheck, (todayLog?.tahajud ?? false) && styles.prayerCheckDone]}>
                {todayLog?.tahajud && <Icon name="check" size={10} color={Colors.bg} />}
              </View>
              <StropheText style={styles.prayerName}>Tahajud</StropheText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleBonus('dzikir')}
              style={styles.bonusRow}
              activeOpacity={0.75}
              disabled={saving}
            >
              <View style={[styles.prayerCheck, (todayLog?.dzikir ?? false) && styles.prayerCheckDone]}>
                {todayLog?.dzikir && <Icon name="check" size={10} color={Colors.bg} />}
              </View>
              <StropheText style={styles.prayerName}>Dzikir pagi & petang</StropheText>
            </TouchableOpacity>

            {/* Quran pages */}
            <View style={styles.quranRow}>
              <StropheText style={styles.prayerName}>Baca Quran</StropheText>
              <View style={styles.quranCounter}>
                <TouchableOpacity
                  onPress={() => setQuranPages(Math.max(0, (todayLog?.quran_pages ?? 0) - 1))}
                  style={styles.counterBtn}
                >
                  <StropheText style={styles.counterBtnText}>−</StropheText>
                </TouchableOpacity>
                <StropheText style={styles.quranPages}>
                  {todayLog?.quran_pages ?? 0} hal
                </StropheText>
                <TouchableOpacity
                  onPress={() => setQuranPages((todayLog?.quran_pages ?? 0) + 1)}
                  style={styles.counterBtn}
                >
                  <StropheText style={styles.counterBtnText}>+</StropheText>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Catatan */}
          {showNotes ? (
            <Card style={styles.notesCard}>
              <StropheText variant="caption" style={styles.sectionLabel}>CATATAN REFLEKSI</StropheText>
              <TextInput
                style={styles.textInput}
                value={notesInput}
                onChangeText={setNotesInput}
                placeholder="Apa yang kamu rasakan dalam ibadah hari ini?"
                placeholderTextColor={Colors.whiteDim}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Button
                label="Simpan Catatan"
                onPress={() => { saveNotes(notesInput); setShowNotes(false); }}
                style={{ marginTop: Spacing.sm }}
              />
            </Card>
          ) : (
            <TouchableOpacity
              onPress={() => setShowNotes(true)}
              style={styles.addNoteBtn}
            >
              <StropheText style={styles.addNoteText}>
                + {todayLog?.notes ? 'Edit' : 'Tambah'} catatan refleksi
              </StropheText>
            </TouchableOpacity>
          )}

          {/* Riwayat 7 hari */}
          {logs.filter((l) => l.log_date !== new Date().toISOString().slice(0, 10)).length > 0 && (
            <>
              <StropheText variant="caption" style={styles.historyTitle}>RIWAYAT 7 HARI</StropheText>
              <Card style={styles.weekCard}>
                {logs
                  .filter((l) => l.log_date !== new Date().toISOString().slice(0, 10))
                  .slice(0, 7)
                  .reverse()
                  .map((log) => {
                    const color =
                      log.prayer_count === 5
                        ? Colors.success
                        : log.prayer_count >= 3
                        ? Colors.gold
                        : Colors.danger;
                    return (
                      <View key={log.id} style={styles.weekRow}>
                        <StropheText variant="dim" style={{ fontSize: 11, flex: 1 }}>
                          {new Date(log.log_date).toLocaleDateString('id-ID', {
                            weekday: 'short', day: 'numeric', month: 'short',
                          })}
                        </StropheText>
                        <View style={styles.weekDots}>
                          {PRAYERS.map((p) => (
                            <PrayerDot key={p.key} done={log[p.key]} />
                          ))}
                        </View>
                        <StropheText style={[styles.weekCount, { color }]}>
                          {log.prayer_count}/5
                        </StropheText>
                      </View>
                    );
                  })}
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  header: { gap: Spacing.xs },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2 },

  statusCard: { padding: Spacing.lg, gap: Spacing.sm },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  statusCount: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 4 },
  countNum: { fontSize: 40, fontWeight: '900', lineHeight: 48 },
  countOf: { fontSize: FontSize.lg, color: Colors.whiteDim, fontWeight: '700' },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.borderGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  streakText: { fontSize: 11, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: Spacing.sm },

  prayerCard: { gap: Spacing.sm },
  sectionLabel: { color: Colors.whiteDim, letterSpacing: 1.5 },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prayerCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  prayerCheckDone: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  prayerName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white },
  donePill: {
    backgroundColor: Colors.borderGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  donePillText: { color: Colors.gold, fontSize: 10, fontWeight: '700' },

  bonusCard: { gap: Spacing.sm },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  quranRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  quranCounter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { fontSize: 18, color: Colors.white, fontWeight: '700', lineHeight: 22 },
  quranPages: { fontSize: FontSize.base, fontWeight: '700', color: Colors.gold, minWidth: 48, textAlign: 'center' },

  notesCard: { gap: Spacing.sm },
  textInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    lineHeight: 22,
  },
  addNoteBtn: { paddingVertical: Spacing.xs },
  addNoteText: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '600' },

  historyTitle: { letterSpacing: 2, color: Colors.whiteDim },
  weekCard: { gap: Spacing.sm },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  weekDots: { flexDirection: 'row', gap: 4 },
  weekCount: { fontSize: 11, fontWeight: '700', minWidth: 28, textAlign: 'right' },
});
