import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useDecisionJournal } from '../../hooks/useDecisionJournal';

export default function DecisionJournalScreen() {
  const router = useRouter();
  const { entries, loading, saving, todayEntry, saveDecision, updateOutcome } = useDecisionJournal();

  const [decision, setDecision] = useState('');
  const [context, setContext] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);

  const handleSave = async () => {
    if (decision.trim().length < 10) {
      Alert.alert('Terlalu singkat', 'Deskripsikan keputusannya lebih jelas.');
      return;
    }
    await saveDecision(decision.trim(), context.trim());
    setDecision('');
    setContext('');
  };

  const handleSaveOutcome = async (id: string) => {
    if (!outcomeInput.trim()) return;
    await updateOutcome(id, outcomeInput.trim());
    setEditingOutcomeId(null);
    setOutcomeInput('');
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={16} color={Colors.gold} />
            <StropheText variant="gold">Kembali</StropheText>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.goldLine} />
            <StropheText variant="h2">Decision Journal</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              1 keputusan penting per hari — AI analisis polamu dari waktu ke waktu
            </StropheText>
          </View>

          {/* Entri hari ini */}
          {todayEntry ? (
            <Card gold style={styles.todayCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Icon name="check" size={14} color={Colors.gold} />
                <StropheText variant="gold" style={{ fontWeight: '700', fontSize: 11, letterSpacing: 1 }}>
                  ENTRI HARI INI
                </StropheText>
              </View>
              <StropheText variant="h3" style={{ marginTop: Spacing.sm }}>{todayEntry.decision}</StropheText>
              {todayEntry.context && (
                <StropheText variant="caption" style={{ marginTop: 4, color: Colors.whiteSecondary }}>
                  Konteks: {todayEntry.context}
                </StropheText>
              )}

              {/* AI Pattern */}
              {todayEntry.ai_pattern && (
                <>
                  <View style={styles.divider} />
                  <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1 }}>
                    POLA YANG COACH LIHAT
                  </StropheText>
                  <StropheText variant="body" style={styles.aiText}>{todayEntry.ai_pattern}</StropheText>
                </>
              )}

              {/* Outcome */}
              <View style={styles.divider} />
              {todayEntry.outcome ? (
                <View>
                  <StropheText variant="caption" style={{ color: Colors.whiteDim, letterSpacing: 1 }}>
                    HASIL
                  </StropheText>
                  <StropheText variant="body" style={{ marginTop: 4, color: Colors.whiteSecondary }}>
                    {todayEntry.outcome}
                  </StropheText>
                </View>
              ) : editingOutcomeId === todayEntry.id ? (
                <View style={{ gap: Spacing.sm }}>
                  <StropheText variant="caption" style={{ color: Colors.whiteDim, letterSpacing: 1 }}>
                    BAGAIMANA HASILNYA?
                  </StropheText>
                  <TextInput
                    style={styles.outlineInput}
                    value={outcomeInput}
                    onChangeText={setOutcomeInput}
                    placeholder="Tulis hasil keputusan ini..."
                    placeholderTextColor={Colors.whiteDim}
                    multiline
                  />
                  <Button
                    label="Simpan Hasil"
                    onPress={() => handleSaveOutcome(todayEntry.id)}
                    style={{ marginTop: 0 }}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => { setEditingOutcomeId(todayEntry.id); setOutcomeInput(''); }}
                  style={styles.addOutcomeBtn}
                >
                  <StropheText style={styles.addOutcomeText}>+ Tambah hasil keputusan ini</StropheText>
                </TouchableOpacity>
              )}
            </Card>
          ) : (
            /* Form entri baru */
            <Card style={styles.formCard}>
              <StropheText variant="caption" style={styles.formLabel}>KEPUTUSAN PENTING HARI INI</StropheText>
              <TextInput
                style={styles.textInput}
                value={decision}
                onChangeText={setDecision}
                placeholder="Apa keputusan penting yang kamu ambil atau sedang dipertimbangkan hari ini?"
                placeholderTextColor={Colors.whiteDim}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <StropheText variant="caption" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                KONTEKS (opsional)
              </StropheText>
              <TextInput
                style={styles.textInput}
                value={context}
                onChangeText={setContext}
                placeholder="Situasi atau latar belakang keputusan ini..."
                placeholderTextColor={Colors.whiteDim}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              <Button
                label="Catat Keputusan"
                onPress={handleSave}
                loading={saving}
                disabled={decision.trim().length < 10}
                style={{ marginTop: Spacing.md }}
              />
            </Card>
          )}

          {/* Info */}
          <Card style={styles.infoCard}>
            <StropheText variant="caption" style={{ color: Colors.whiteDim, letterSpacing: 1, marginBottom: Spacing.sm }}>
              CARA KERJA DECISION JOURNAL
            </StropheText>
            {[
              'Catat 1 keputusan penting per hari — besar atau kecil.',
              'Setelah beberapa hari, AI menganalisis pola cara berpikirmu.',
              'Setelah beberapa waktu, tambahkan hasil dari keputusan itu.',
              'Dari sini kamu akan melihat apakah insting dan pertimbanganmu berkembang.',
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <View style={styles.infoNum}>
                  <StropheText style={{ color: Colors.gold, fontSize: 10, fontWeight: '800' }}>{i + 1}</StropheText>
                </View>
                <StropheText variant="caption" style={{ flex: 1, lineHeight: 20 }}>{item}</StropheText>
              </View>
            ))}
          </Card>

          {/* Riwayat */}
          {entries.filter((e) => e.journal_date !== today).length > 0 && (
            <>
              <StropheText variant="caption" style={styles.sectionTitle}>RIWAYAT</StropheText>
              {entries
                .filter((e) => e.journal_date !== today)
                .map((entry) => (
                  <Card key={entry.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <StropheText variant="dim" style={{ fontSize: 11 }}>
                        {new Date(entry.journal_date).toLocaleDateString('id-ID', {
                          weekday: 'long', day: 'numeric', month: 'short',
                        })}
                      </StropheText>
                      {entry.outcome && (
                        <View style={styles.outcomePill}>
                          <StropheText style={{ color: Colors.success, fontSize: 10, fontWeight: '700' }}>
                            ADA HASIL
                          </StropheText>
                        </View>
                      )}
                    </View>
                    <StropheText variant="body" style={{ marginTop: 4 }}>{entry.decision}</StropheText>
                    {entry.outcome && (
                      <StropheText variant="caption" style={{ marginTop: 4, color: Colors.whiteSecondary }}>
                        Hasil: {entry.outcome}
                      </StropheText>
                    )}
                    {!entry.outcome && editingOutcomeId !== entry.id && (
                      <TouchableOpacity
                        onPress={() => { setEditingOutcomeId(entry.id); setOutcomeInput(''); }}
                        style={styles.addOutcomeBtn}
                      >
                        <StropheText style={styles.addOutcomeText}>+ Tambah hasil</StropheText>
                      </TouchableOpacity>
                    )}
                    {editingOutcomeId === entry.id && (
                      <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
                        <TextInput
                          style={styles.outlineInput}
                          value={outcomeInput}
                          onChangeText={setOutcomeInput}
                          placeholder="Bagaimana hasilnya?"
                          placeholderTextColor={Colors.whiteDim}
                          multiline
                        />
                        <Button label="Simpan" onPress={() => handleSaveOutcome(entry.id)} />
                      </View>
                    )}
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

  todayCard: { padding: Spacing.lg, gap: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.border },
  aiText: { color: Colors.whiteSecondary, lineHeight: 22 },
  addOutcomeBtn: { paddingVertical: Spacing.xs },
  addOutcomeText: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: '600' },

  formCard: { gap: Spacing.sm },
  formLabel: { color: Colors.whiteDim, letterSpacing: 1 },
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
  outlineInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 22,
  },

  infoCard: { gap: Spacing.sm },
  infoRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  infoNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.borderGold,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },

  sectionTitle: { letterSpacing: 2, color: Colors.whiteDim },
  historyCard: { gap: Spacing.xs },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  outcomePill: {
    backgroundColor: '#0A1A0F',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.success,
  },
});
