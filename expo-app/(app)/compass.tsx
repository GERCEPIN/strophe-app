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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import {
  useCompass,
  BLUEPRINT_CATEGORIES,
  CORE_VALUE_SUGGESTIONS,
} from '../../hooks/useCompass';

type Horizon = '1' | '5' | '10';

const HORIZON_LABELS: Record<Horizon, string> = {
  '1': '1 Tahun',
  '5': '5 Tahun',
  '10': '10 Tahun',
};

const HORIZON_COLORS: Record<Horizon, string> = {
  '1': Colors.gold,
  '5': '#4FC3F7',
  '10': '#CE93D8',
};

// ── Category chip ──────────────────────────────────────────────────
function CatChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        chipStyles.chip,
        selected && { backgroundColor: Colors.borderGold, borderColor: Colors.goldDim },
      ]}
    >
      <StropheText style={[chipStyles.label, selected && { color: Colors.gold }]}>{label}</StropheText>
    </TouchableOpacity>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { fontSize: 11, color: Colors.whiteDim, fontWeight: '600' },
});

// ── Goal item ──────────────────────────────────────────────────────
function GoalItem({
  goal,
  onToggle,
  onDelete,
  color,
}: {
  goal: { id: string; goal: string; category: string; milestone: string | null; completed: boolean; ai_breakdown: string | null };
  onToggle: () => void;
  onDelete: () => void;
  color: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={[goalStyles.card, goal.completed && { opacity: 0.6 }]}>
      <View style={goalStyles.top}>
        <TouchableOpacity onPress={onToggle} style={[goalStyles.check, goal.completed && { backgroundColor: color, borderColor: color }]}>
          {goal.completed && <Icon name="check" size={10} color={Colors.bg} />}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <StropheText style={[goalStyles.goalText, goal.completed && { textDecorationLine: 'line-through', color: Colors.whiteDim }]}>
            {goal.goal}
          </StropheText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 }}>
            <View style={[goalStyles.catPill, { borderColor: color + '55', backgroundColor: color + '15' }]}>
              <StropheText style={[goalStyles.catText, { color }]}>{goal.category}</StropheText>
            </View>
            {goal.milestone && (
              <StropheText variant="dim" style={{ fontSize: 10 }}>→ {goal.milestone}</StropheText>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Hapus tujuan?', '', [
            { text: 'Batal', style: 'cancel' },
            { text: 'Hapus', style: 'destructive', onPress: onDelete },
          ])}
          style={{ padding: Spacing.xs }}
        >
          <Icon name="close" size={12} color={Colors.whiteDim} />
        </TouchableOpacity>
      </View>

      {goal.ai_breakdown && (
        <>
          <TouchableOpacity onPress={() => setExpanded((e) => !e)} style={goalStyles.expandBtn}>
            <Icon name="bolt" size={10} color={Colors.gold} />
            <StropheText style={goalStyles.expandText}>
              {expanded ? 'Sembunyikan breakdown' : 'Lihat breakdown AI'}
            </StropheText>
          </TouchableOpacity>
          {expanded && (
            <View style={goalStyles.breakdown}>
              <StropheText variant="body" style={{ color: Colors.whiteSecondary, lineHeight: 20 }}>
                {goal.ai_breakdown}
              </StropheText>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const goalStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  check: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  goalText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white, lineHeight: 22 },
  catPill: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: Radius.full, borderWidth: 1,
  },
  catText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  expandText: { color: Colors.gold, fontSize: 11, fontWeight: '600' },
  breakdown: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
});

// ── Main ───────────────────────────────────────────────────────────
export default function CompassScreen() {
  const router = useRouter();
  const {
    values,
    futureSelfMap,
    saving,
    generating,
    addValue,
    removeValue,
    generateFutureSelf,
    addGoal,
    toggleGoal,
    deleteGoal,
    getGoalsByHorizon,
  } = useCompass();

  const [tab, setTab] = useState<'nilai' | 'future' | 'blueprint'>('nilai');

  // Nilai form
  const [newValue, setNewValue] = useState('');
  const [newValueDesc, setNewValueDesc] = useState('');

  // Future Self
  const [activeHorizon, setActiveHorizon] = useState<Horizon>('5');
  const [futureInput, setFutureInput] = useState('');

  // Blueprint
  const [bpHorizon, setBpHorizon] = useState<Horizon>('1');
  const [bpCategory, setBpCategory] = useState(BLUEPRINT_CATEGORIES[0]);
  const [bpGoal, setBpGoal] = useState('');
  const [bpMilestone, setBpMilestone] = useState('');
  const [showBpForm, setShowBpForm] = useState(false);

  const handleAddValue = async () => {
    if (!newValue.trim()) return;
    await addValue(newValue.trim(), newValueDesc.trim());
    setNewValue('');
    setNewValueDesc('');
  };

  const handleGenerateFuture = async () => {
    if (!futureInput.trim() || futureInput.trim().length < 30) {
      Alert.alert('Terlalu singkat', 'Tulis minimal 30 karakter tentang visimu.');
      return;
    }
    await generateFutureSelf(activeHorizon, futureInput.trim());
    setFutureInput('');
  };

  const handleAddGoal = async () => {
    if (!bpGoal.trim()) {
      Alert.alert('Kosong', 'Tulis tujuanmu dulu.');
      return;
    }
    await addGoal(bpHorizon, bpCategory, bpGoal.trim(), bpMilestone.trim() || undefined);
    setBpGoal('');
    setBpMilestone('');
    setShowBpForm(false);
  };

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
            <StropheText variant="h2">Kompas 5 Tahun</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Nilai · Future Self · Blueprint 1–5–10 tahun
            </StropheText>
          </View>

          {/* Status bar */}
          <Card style={styles.statusBar}>
            <View style={styles.statusItem}>
              <StropheText style={styles.statusNum}>{values.length}</StropheText>
              <StropheText variant="dim" style={styles.statusLabel}>Nilai Inti</StropheText>
            </View>
            <View style={styles.statusDiv} />
            <View style={styles.statusItem}>
              <StropheText style={styles.statusNum}>{Object.keys(futureSelfMap).length}/3</StropheText>
              <StropheText variant="dim" style={styles.statusLabel}>Future Self</StropheText>
            </View>
            <View style={styles.statusDiv} />
            <View style={styles.statusItem}>
              <StropheText style={styles.statusNum}>
                {getGoalsByHorizon('1').length + getGoalsByHorizon('5').length + getGoalsByHorizon('10').length}
              </StropheText>
              <StropheText variant="dim" style={styles.statusLabel}>Tujuan</StropheText>
            </View>
          </Card>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {(['nilai', 'future', 'blueprint'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && styles.tabActive]}
              >
                <StropheText style={[styles.tabLabel, tab === t && { color: Colors.gold }]}>
                  {t === 'nilai' ? 'Nilai' : t === 'future' ? 'Future Self' : 'Blueprint'}
                </StropheText>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── NILAI TAB ── */}
          {tab === 'nilai' && (
            <>
              <Card style={styles.infoCard}>
                <StropheText variant="caption" style={styles.sectionLabel}>MENGAPA NILAI INTI?</StropheText>
                <StropheText variant="body" style={styles.infoText}>
                  Nilai inti adalah filter pengambilan keputusan. Ketika ada pilihan sulit, nilai ini yang menentukan arah. Tanpa nilai yang jelas, kamu bereaksi terhadap situasi — bukan bertindak berdasarkan prinsip.
                </StropheText>
              </Card>

              {/* Nilai yang sudah ada */}
              {values.length > 0 && (
                <Card style={{ gap: Spacing.sm }}>
                  <StropheText variant="caption" style={styles.sectionLabel}>
                    NILAI INTI KAMU ({values.length}/5)
                  </StropheText>
                  {values.map((v, i) => (
                    <View key={v.id} style={styles.valueRow}>
                      <View style={styles.valuePriority}>
                        <StropheText style={styles.valuePriorityText}>{i + 1}</StropheText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <StropheText style={styles.valueName}>{v.value_name}</StropheText>
                        {v.description && (
                          <StropheText variant="dim" style={{ fontSize: 11, marginTop: 2, lineHeight: 16 }}>
                            {v.description}
                          </StropheText>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => Alert.alert('Hapus nilai?', '', [
                          { text: 'Batal', style: 'cancel' },
                          { text: 'Hapus', style: 'destructive', onPress: () => removeValue(v.id) },
                        ])}
                        style={{ padding: Spacing.xs }}
                      >
                        <Icon name="close" size={12} color={Colors.whiteDim} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </Card>
              )}

              {/* Saran nilai */}
              {values.length < 5 && (
                <Card style={{ gap: Spacing.sm }}>
                  <StropheText variant="caption" style={styles.sectionLabel}>PILIH DARI DAFTAR</StropheText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {CORE_VALUE_SUGGESTIONS
                      .filter((s) => !values.some((v) => v.value_name === s))
                      .map((s) => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => addValue(s)}
                          style={styles.suggestionChip}
                        >
                          <StropheText style={styles.suggestionText}>+ {s}</StropheText>
                        </TouchableOpacity>
                      ))}
                  </View>
                </Card>
              )}

              {/* Form tambah manual */}
              {values.length < 5 && (
                <Card style={{ gap: Spacing.sm }}>
                  <StropheText variant="caption" style={styles.sectionLabel}>ATAU TULIS SENDIRI</StropheText>
                  <TextInput
                    style={[styles.textInput, { height: 44 }]}
                    value={newValue}
                    onChangeText={setNewValue}
                    placeholder="Nama nilai (misal: Keberanian)"
                    placeholderTextColor={Colors.whiteDim}
                  />
                  <TextInput
                    style={[styles.textInput, { height: 44 }]}
                    value={newValueDesc}
                    onChangeText={setNewValueDesc}
                    placeholder="Apa artinya bagimu? (opsional)"
                    placeholderTextColor={Colors.whiteDim}
                  />
                  <Button
                    label="Tambah Nilai"
                    onPress={handleAddValue}
                    loading={saving}
                    disabled={!newValue.trim()}
                    variant="outline"
                    style={{ marginTop: 0 }}
                  />
                </Card>
              )}

              {values.length >= 5 && (
                <Card style={styles.maxCard}>
                  <StropheText variant="dim" style={{ textAlign: 'center' }}>
                    5 nilai inti sudah cukup. Lebih banyak bukan lebih baik — fokus adalah kuncinya.
                  </StropheText>
                </Card>
              )}
            </>
          )}

          {/* ── FUTURE SELF TAB ── */}
          {tab === 'future' && (
            <>
              <Card style={styles.infoCard}>
                <StropheText variant="caption" style={styles.sectionLabel}>APA ITU FUTURE SELF?</StropheText>
                <StropheText variant="body" style={styles.infoText}>
                  Future Self bukan mimpi — ini adalah proyeksi konkret siapa kamu bisa menjadi jika kamu konsisten dengan nilai dan tujuanmu. AI akan menggambarkan versi masa depanmu secara detail berdasarkan visi yang kamu tulis.
                </StropheText>
              </Card>

              {/* Horizon selector */}
              <View style={styles.horizonRow}>
                {(['1', '5', '10'] as Horizon[]).map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setActiveHorizon(h)}
                    style={[
                      styles.horizonBtn,
                      activeHorizon === h && {
                        borderColor: HORIZON_COLORS[h],
                        backgroundColor: HORIZON_COLORS[h] + '15',
                      },
                    ]}
                  >
                    <StropheText
                      style={[
                        styles.horizonLabel,
                        activeHorizon === h && { color: HORIZON_COLORS[h] },
                      ]}
                    >
                      {HORIZON_LABELS[h]}
                    </StropheText>
                    {futureSelfMap[h] && (
                      <Icon name="check" size={10} color={HORIZON_COLORS[h]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Portrait yang sudah ada */}
              {futureSelfMap[activeHorizon] ? (
                <Card
                  style={[
                    styles.portraitCard,
                    { borderColor: HORIZON_COLORS[activeHorizon] + '55' },
                  ]}
                >
                  <View style={styles.portraitHeader}>
                    <StropheText
                      style={[styles.portraitTitle, { color: HORIZON_COLORS[activeHorizon] }]}
                    >
                      {HORIZON_LABELS[activeHorizon].toUpperCase()} DARI SEKARANG
                    </StropheText>
                    <TouchableOpacity
                      onPress={() => setFutureInput(futureSelfMap[activeHorizon].user_input)}
                    >
                      <StropheText style={{ color: Colors.gold, fontSize: 11 }}>Edit ulang</StropheText>
                    </TouchableOpacity>
                  </View>
                  <StropheText variant="body" style={styles.portraitText}>
                    {futureSelfMap[activeHorizon].ai_portrait}
                  </StropheText>
                  <View style={styles.portraitDivider} />
                  <StropheText variant="dim" style={{ fontSize: 10 }}>
                    Berdasarkan visi: "{futureSelfMap[activeHorizon].user_input.slice(0, 100)}
                    {futureSelfMap[activeHorizon].user_input.length > 100 ? '...' : ''}"
                  </StropheText>
                </Card>
              ) : (
                <Card style={{ gap: Spacing.sm }}>
                  <StropheText variant="caption" style={styles.sectionLabel}>
                    VISIMU DALAM {HORIZON_LABELS[activeHorizon].toUpperCase()}
                  </StropheText>
                  <StropheText variant="dim" style={{ fontSize: 12, lineHeight: 18 }}>
                    Ceritakan secara bebas — siapa kamu, apa yang sedang kamu kerjakan, bagaimana hidupmu terasa. Minimal 30 karakter.
                  </StropheText>
                  <TextInput
                    style={styles.textInput}
                    value={futureInput}
                    onChangeText={setFutureInput}
                    placeholder={`Dalam ${HORIZON_LABELS[activeHorizon].toLowerCase()}, saya ingin...`}
                    placeholderTextColor={Colors.whiteDim}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                  <StropheText variant="dim" style={{ textAlign: 'right', fontSize: 11 }}>
                    {futureInput.length} karakter
                  </StropheText>

                  {generating === activeHorizon ? (
                    <View style={styles.generatingRow}>
                      <ActivityIndicator size="small" color={HORIZON_COLORS[activeHorizon]} />
                      <StropheText variant="dim" style={{ fontSize: 12 }}>
                        AI sedang membangun portrait-mu...
                      </StropheText>
                    </View>
                  ) : (
                    <Button
                      label="Generate Future Self"
                      onPress={handleGenerateFuture}
                      disabled={futureInput.trim().length < 30}
                    />
                  )}
                </Card>
              )}
            </>
          )}

          {/* ── BLUEPRINT TAB ── */}
          {tab === 'blueprint' && (
            <>
              <Card style={styles.infoCard}>
                <StropheText variant="caption" style={styles.sectionLabel}>CARA PAKAI BLUEPRINT</StropheText>
                <StropheText variant="body" style={styles.infoText}>
                  Mulai dari 10 tahun — apa yang ingin kamu capai? Lalu pecah ke 5 tahun, lalu 1 tahun. Tujuan besar jadi langkah nyata. AI Coach akan breakdown setiap tujuan menjadi langkah pertama yang bisa kamu ambil minggu ini.
                </StropheText>
              </Card>

              {/* Horizon tabs dalam blueprint */}
              <View style={styles.horizonRow}>
                {(['1', '5', '10'] as Horizon[]).map((h) => {
                  const count = getGoalsByHorizon(h).length;
                  const done = getGoalsByHorizon(h).filter((g) => g.completed).length;
                  return (
                    <TouchableOpacity
                      key={h}
                      onPress={() => { setBpHorizon(h); setShowBpForm(false); }}
                      style={[
                        styles.horizonBtn,
                        bpHorizon === h && {
                          borderColor: HORIZON_COLORS[h],
                          backgroundColor: HORIZON_COLORS[h] + '15',
                        },
                      ]}
                    >
                      <StropheText
                        style={[styles.horizonLabel, bpHorizon === h && { color: HORIZON_COLORS[h] }]}
                      >
                        {HORIZON_LABELS[h]}
                      </StropheText>
                      {count > 0 && (
                        <StropheText style={[styles.horizonCount, { color: HORIZON_COLORS[h] }]}>
                          {done}/{count}
                        </StropheText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Goals list */}
              {getGoalsByHorizon(bpHorizon).map((g) => (
                <GoalItem
                  key={g.id}
                  goal={g}
                  color={HORIZON_COLORS[bpHorizon]}
                  onToggle={() => toggleGoal(g.id, !g.completed)}
                  onDelete={() => deleteGoal(g.id)}
                />
              ))}

              {getGoalsByHorizon(bpHorizon).length === 0 && !showBpForm && (
                <Card style={{ paddingVertical: Spacing.xl, alignItems: 'center' }}>
                  <StropheText variant="dim" style={{ textAlign: 'center' }}>
                    Belum ada tujuan {HORIZON_LABELS[bpHorizon].toLowerCase()}. Tambahkan yang pertama.
                  </StropheText>
                </Card>
              )}

              {/* Form */}
              {showBpForm ? (
                <Card style={{ gap: Spacing.sm }}>
                  <StropheText variant="caption" style={styles.sectionLabel}>
                    TUJUAN BARU — {HORIZON_LABELS[bpHorizon].toUpperCase()}
                  </StropheText>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {BLUEPRINT_CATEGORIES.map((c) => (
                      <CatChip
                        key={c}
                        label={c}
                        selected={bpCategory === c}
                        onPress={() => setBpCategory(c)}
                      />
                    ))}
                  </View>

                  <TextInput
                    style={styles.textInput}
                    value={bpGoal}
                    onChangeText={setBpGoal}
                    placeholder="Tujuan spesifik yang ingin kamu capai..."
                    placeholderTextColor={Colors.whiteDim}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <TextInput
                    style={[styles.textInput, { height: 44 }]}
                    value={bpMilestone}
                    onChangeText={setBpMilestone}
                    placeholder="Milestone terukur (opsional — misal: 10 juta/bulan)"
                    placeholderTextColor={Colors.whiteDim}
                  />

                  <StropheText variant="dim" style={{ fontSize: 11, lineHeight: 16 }}>
                    AI Coach akan breakdown tujuanmu menjadi langkah pertama minggu ini + hambatan yang kemungkinan muncul.
                  </StropheText>

                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <Button
                      label="Batal"
                      onPress={() => { setShowBpForm(false); setBpGoal(''); setBpMilestone(''); }}
                      variant="outline"
                      style={{ flex: 1, marginTop: 0 }}
                    />
                    <Button
                      label={saving ? 'Menyimpan...' : 'Simpan + AI Breakdown'}
                      onPress={handleAddGoal}
                      loading={saving}
                      disabled={!bpGoal.trim()}
                      style={{ flex: 2, marginTop: 0 }}
                    />
                  </View>
                </Card>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowBpForm(true)}
                  style={[styles.addGoalBtn, { borderColor: HORIZON_COLORS[bpHorizon] + '55' }]}
                >
                  <Icon name="target" size={14} color={HORIZON_COLORS[bpHorizon]} />
                  <StropheText style={[styles.addGoalText, { color: HORIZON_COLORS[bpHorizon] }]}>
                    + Tambah tujuan {HORIZON_LABELS[bpHorizon].toLowerCase()}
                  </StropheText>
                </TouchableOpacity>
              )}
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

  statusBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  statusItem: { flex: 1, alignItems: 'center', gap: 2 },
  statusNum: { fontSize: 22, fontWeight: '900', color: Colors.gold },
  statusLabel: { fontSize: 10, letterSpacing: 0.5 },
  statusDiv: { width: 1, height: 32, backgroundColor: Colors.border },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  tabLabel: { fontSize: 12, fontWeight: '700', color: Colors.whiteDim },

  infoCard: { gap: Spacing.xs },
  sectionLabel: { color: Colors.whiteDim, letterSpacing: 1.5 },
  infoText: { color: Colors.whiteSecondary, lineHeight: 22 },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  valuePriority: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.borderGold, borderWidth: 1, borderColor: Colors.goldDim,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  valuePriorityText: { color: Colors.gold, fontSize: 10, fontWeight: '800' },
  valueName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },

  suggestionChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  suggestionText: { color: Colors.gold, fontSize: 11, fontWeight: '600' },

  maxCard: { paddingVertical: Spacing.md, alignItems: 'center' },

  horizonRow: { flexDirection: 'row', gap: Spacing.sm },
  horizonBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated,
  },
  horizonLabel: { fontSize: 12, fontWeight: '700', color: Colors.whiteDim },
  horizonCount: { fontSize: 10, fontWeight: '800' },

  portraitCard: { padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.lg },
  portraitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  portraitTitle: { fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  portraitText: { color: Colors.whiteSecondary, lineHeight: 26, fontStyle: 'italic' },
  portraitDivider: { height: 1, backgroundColor: Colors.border },

  generatingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center', padding: Spacing.md },

  textInput: {
    backgroundColor: Colors.bgElevated, borderRadius: Radius.md,
    padding: Spacing.md, color: Colors.white, fontSize: FontSize.base,
    borderWidth: 1, borderColor: Colors.border, minHeight: 100, lineHeight: 22,
  },

  addGoalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderStyle: 'dashed',
  },
  addGoalText: { fontSize: FontSize.sm, fontWeight: '700' },
});
