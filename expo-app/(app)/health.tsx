import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useHealth } from '../../hooks/useHealth';

// ── Slider component ───────────────────────────────────────────────
function StepSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  color = Colors.gold,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  color?: string;
}) {
  const steps = [];
  for (let v = min; v <= max; v += step) {
    steps.push(parseFloat(v.toFixed(1)));
  }
  return (
    <View style={sliderStyles.row}>
      {steps.map((v) => (
        <TouchableOpacity
          key={v}
          onPress={() => onChange(v)}
          style={[
            sliderStyles.dot,
            value === v && { backgroundColor: color, borderColor: color },
          ]}
        />
      ))}
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

// ── Score picker (1–10) ────────────────────────────────────────────
function ScorePicker({
  value,
  onChange,
  color = Colors.gold,
}: {
  value: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          style={[
            scoreStyles.chip,
            value === n && { backgroundColor: color, borderColor: color },
          ]}
        >
          <StropheText
            style={[
              scoreStyles.chipText,
              value === n && { color: Colors.bg },
            ]}
          >
            {n}
          </StropheText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  chip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.whiteDim },
});

// ── Toggle pill ────────────────────────────────────────────────────
function TogglePill({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        pillStyles.pill,
        active && { backgroundColor: Colors.borderGold, borderColor: Colors.goldDim },
      ]}
    >
      {active && <Icon name="check" size={10} color={Colors.gold} />}
      <StropheText style={[pillStyles.label, active && { color: Colors.gold }]}>{label}</StropheText>
    </TouchableOpacity>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { fontSize: 12, color: Colors.whiteDim, fontWeight: '600' },
});

// ── Main screen ────────────────────────────────────────────────────
export default function HealthScreen() {
  const router = useRouter();
  const { todayLog, logs, saving, saveLog } = useHealth();

  const [sleepHours, setSleepHours] = useState(7);
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [mood, setMood] = useState(7);
  const [skincareAM, setSkincareAM] = useState(false);
  const [skincareNight, setSkincareNight] = useState(false);
  const [skincareNotes, setSkincareNotes] = useState('');

  const [done, setDone] = useState(false);

  const handleSave = async () => {
    await saveLog({
      sleep_hours: sleepHours,
      water_glasses: waterGlasses,
      exercise_minutes: exerciseMinutes,
      energy_level: energyLevel,
      stress_level: stressLevel,
      mood,
      skincare_morning: skincareAM,
      skincare_night: skincareNight,
      skincare_notes: skincareNotes.trim() || undefined,
    });
    setDone(true);
  };

  const today = new Date().toISOString().slice(0, 10);

  // Helper: score bar
  const renderScoreBar = (label: string, value: number, color: string) => (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1 }}>{label}</StropheText>
        <StropheText style={{ fontSize: 11, fontWeight: '700', color }}>{value}/10</StropheText>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${value * 10}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

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
            <StropheText variant="h2">Health Check-in</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Rekam kondisi fisik dan mentalmu hari ini
            </StropheText>
          </View>

          {/* Sudah isi hari ini */}
          {todayLog && !done ? (
            <Card gold style={styles.doneCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Icon name="check" size={14} color={Colors.gold} />
                <StropheText variant="gold" style={{ fontWeight: '700', letterSpacing: 1 }}>
                  CHECK-IN HARI INI SUDAH SELESAI
                </StropheText>
              </View>

              <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                {renderScoreBar('ENERGI', todayLog.energy_level ?? 0, Colors.success)}
                {renderScoreBar('MOOD', todayLog.mood ?? 0, Colors.gold)}
                {renderScoreBar('STRES', todayLog.stress_level ?? 0, Colors.danger)}
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <StropheText variant="dim" style={{ fontSize: 10 }}>TIDUR</StropheText>
                  <StropheText style={styles.statVal}>{todayLog.sleep_hours}j</StropheText>
                </View>
                <View style={styles.statItem}>
                  <StropheText variant="dim" style={{ fontSize: 10 }}>AIR</StropheText>
                  <StropheText style={styles.statVal}>{todayLog.water_glasses} gl</StropheText>
                </View>
                <View style={styles.statItem}>
                  <StropheText variant="dim" style={{ fontSize: 10 }}>OLAHRAGA</StropheText>
                  <StropheText style={styles.statVal}>{todayLog.exercise_minutes}m</StropheText>
                </View>
                <View style={styles.statItem}>
                  <StropheText variant="dim" style={{ fontSize: 10 }}>SKINCARE</StropheText>
                  <StropheText style={styles.statVal}>
                    {[todayLog.skincare_morning && 'AM', todayLog.skincare_night && 'PM']
                      .filter(Boolean)
                      .join('/') || '—'}
                  </StropheText>
                </View>
              </View>

              {todayLog.ai_insight && (
                <>
                  <View style={styles.divider} />
                  <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1 }}>
                    INSIGHT COACH
                  </StropheText>
                  <StropheText variant="body" style={{ color: Colors.whiteSecondary, lineHeight: 22, marginTop: 4 }}>
                    {todayLog.ai_insight}
                  </StropheText>
                </>
              )}
            </Card>
          ) : done ? (
            /* Setelah simpan */
            <Card gold style={styles.doneCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Icon name="check" size={14} color={Colors.success} />
                <StropheText style={{ color: Colors.success, fontWeight: '700' }}>
                  Check-in tersimpan
                </StropheText>
              </View>
              {todayLog?.ai_insight && (
                <>
                  <View style={styles.divider} />
                  <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1 }}>
                    INSIGHT COACH
                  </StropheText>
                  <StropheText variant="body" style={{ color: Colors.whiteSecondary, lineHeight: 22, marginTop: 4 }}>
                    {todayLog.ai_insight}
                  </StropheText>
                </>
              )}
              <Button label="Kembali ke Home" onPress={() => router.replace('/(app)')} style={{ marginTop: Spacing.md }} />
            </Card>
          ) : (
            /* Form check-in */
            <>
              {/* FISIK */}
              <Card style={styles.section}>
                <StropheText variant="caption" style={styles.sectionLabel}>FISIK</StropheText>

                <View style={styles.fieldGroup}>
                  <View style={styles.fieldHeader}>
                    <StropheText variant="body" style={styles.fieldTitle}>Tidur</StropheText>
                    <StropheText variant="gold" style={styles.fieldVal}>{sleepHours} jam</StropheText>
                  </View>
                  <StepSlider value={sleepHours} onChange={setSleepHours} min={3} max={12} step={0.5} />
                </View>

                <View style={[styles.fieldGroup, { marginTop: Spacing.md }]}>
                  <View style={styles.fieldHeader}>
                    <StropheText variant="body" style={styles.fieldTitle}>Air minum</StropheText>
                    <StropheText variant="gold" style={styles.fieldVal}>{waterGlasses} gelas</StropheText>
                  </View>
                  <StepSlider value={waterGlasses} onChange={setWaterGlasses} min={0} max={16} step={1} />
                </View>

                <View style={[styles.fieldGroup, { marginTop: Spacing.md }]}>
                  <View style={styles.fieldHeader}>
                    <StropheText variant="body" style={styles.fieldTitle}>Olahraga</StropheText>
                    <StropheText variant="gold" style={styles.fieldVal}>{exerciseMinutes} menit</StropheText>
                  </View>
                  <StepSlider value={exerciseMinutes} onChange={setExerciseMinutes} min={0} max={120} step={10} />
                </View>
              </Card>

              {/* MENTAL */}
              <Card style={styles.section}>
                <StropheText variant="caption" style={styles.sectionLabel}>MENTAL</StropheText>

                <View style={styles.fieldGroup}>
                  <View style={styles.fieldHeader}>
                    <StropheText variant="body" style={styles.fieldTitle}>Level energi</StropheText>
                    <StropheText style={[styles.fieldVal, { color: Colors.success }]}>{energyLevel}/10</StropheText>
                  </View>
                  <ScorePicker value={energyLevel} onChange={setEnergyLevel} color={Colors.success} />
                </View>

                <View style={[styles.fieldGroup, { marginTop: Spacing.md }]}>
                  <View style={styles.fieldHeader}>
                    <StropheText variant="body" style={styles.fieldTitle}>Mood</StropheText>
                    <StropheText style={[styles.fieldVal, { color: Colors.gold }]}>{mood}/10</StropheText>
                  </View>
                  <ScorePicker value={mood} onChange={setMood} color={Colors.gold} />
                </View>

                <View style={[styles.fieldGroup, { marginTop: Spacing.md }]}>
                  <View style={styles.fieldHeader}>
                    <StropheText variant="body" style={styles.fieldTitle}>Level stres</StropheText>
                    <StropheText style={[styles.fieldVal, { color: Colors.danger }]}>{stressLevel}/10</StropheText>
                  </View>
                  <ScorePicker value={stressLevel} onChange={setStressLevel} color={Colors.danger} />
                </View>
              </Card>

              {/* SKINCARE */}
              <Card style={styles.section}>
                <StropheText variant="caption" style={styles.sectionLabel}>SKINCARE</StropheText>

                <View style={styles.fieldGroup}>
                  <StropheText variant="body" style={[styles.fieldTitle, { marginBottom: Spacing.sm }]}>
                    Rutinitas hari ini
                  </StropheText>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <TogglePill label="Pagi (AM)" active={skincareAM} onToggle={() => setSkincareAM((p) => !p)} />
                    <TogglePill label="Malam (PM)" active={skincareNight} onToggle={() => setSkincareNight((p) => !p)} />
                  </View>
                </View>

                <View style={[styles.fieldGroup, { marginTop: Spacing.md }]}>
                  <StropheText variant="body" style={[styles.fieldTitle, { marginBottom: Spacing.sm }]}>
                    Catatan kulit (opsional)
                  </StropheText>
                  <TextInput
                    style={styles.textInput}
                    value={skincareNotes}
                    onChangeText={setSkincareNotes}
                    placeholder="Jerawat baru, kulit kering, reaksi produk..."
                    placeholderTextColor={Colors.whiteDim}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              </Card>

              <Button
                label="Simpan Check-in"
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: Spacing.xs }}
              />
            </>
          )}

          {/* Riwayat 7 hari */}
          {logs.filter((l) => l.log_date !== today).length > 0 && (
            <>
              <StropheText variant="caption" style={styles.historyTitle}>7 HARI TERAKHIR</StropheText>
              {logs
                .filter((l) => l.log_date !== today)
                .slice(0, 7)
                .map((log) => (
                  <Card key={log.id} style={styles.historyCard}>
                    <View style={styles.historyTop}>
                      <StropheText variant="dim" style={{ fontSize: 11 }}>
                        {new Date(log.log_date).toLocaleDateString('id-ID', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                      </StropheText>
                      <View style={styles.historyBadges}>
                        {log.skincare_morning && (
                          <View style={styles.badge}>
                            <StropheText style={styles.badgeText}>AM</StropheText>
                          </View>
                        )}
                        {log.skincare_night && (
                          <View style={styles.badge}>
                            <StropheText style={styles.badgeText}>PM</StropheText>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.historyStats}>
                      <StropheText variant="dim" style={{ fontSize: 11 }}>
                        {log.sleep_hours}j tidur · {log.water_glasses}gl air · {log.exercise_minutes}m olahraga
                      </StropheText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs }}>
                      {renderScoreBar('ENERGI', log.energy_level ?? 0, Colors.success)}
                    </View>
                  </Card>
                ))}
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

  doneCard: { padding: Spacing.lg, gap: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.border },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', gap: 2 },
  statVal: { fontSize: FontSize.md, fontWeight: '800', color: Colors.white },

  section: { gap: Spacing.sm },
  sectionLabel: { color: Colors.whiteDim, letterSpacing: 1.5 },
  fieldGroup: {},
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  fieldTitle: { fontWeight: '600' },
  fieldVal: { fontSize: FontSize.sm, fontWeight: '700' },

  textInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 64,
    lineHeight: 22,
  },

  barBg: { height: 6, backgroundColor: Colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  historyTitle: { letterSpacing: 2, color: Colors.whiteDim },
  historyCard: { gap: Spacing.xs },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyBadges: { flexDirection: 'row', gap: 4 },
  badge: {
    backgroundColor: Colors.borderGold,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  badgeText: { color: Colors.gold, fontSize: 9, fontWeight: '700' },
  historyStats: { marginTop: 2 },
});
