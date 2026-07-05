import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useProfile } from '../../hooks/useProfile';
import { useReflection } from '../../hooks/useReflection';

export default function ReflectionScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { entries, saving, saveReflection, hasReflectionForLevel } = useReflection();

  const level = profile?.current_level ?? 1;
  const [text, setText] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [done, setDone] = useState(false);

  // Level refleksi terdekat (kelipatan 10 ke bawah dari level saat ini)
  const reflectionLevel = Math.floor(level / 10) * 10;
  const alreadyDone = hasReflectionForLevel(reflectionLevel);

  const handleSave = async () => {
    if (text.trim().length < 50) {
      Alert.alert('Terlalu singkat', 'Tulis minimal 50 karakter untuk refleksimu.');
      return;
    }
    const ai = await saveReflection(reflectionLevel, text.trim());
    setAiResult(ai);
    setDone(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow-left" size={16} color={Colors.gold} />
            <StropheText variant="gold">Kembali</StropheText>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.goldLine} />
            <StropheText variant="h2">Reflection Level</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Kelipatan {reflectionLevel} level — momen jeda wajib
            </StropheText>
          </View>

          {!done ? (
            <>
              <Card gold style={styles.promptCard}>
                <StropheText variant="gold" style={styles.promptLabel}>PERTANYAAN REFLEKSI</StropheText>
                <StropheText variant="h3" style={styles.promptText}>
                  Apa yang paling nyata berubah dari dirimu sejak kamu mulai?
                </StropheText>
                <StropheText variant="caption" style={{ marginTop: Spacing.sm, lineHeight: 22 }}>
                  Bukan soal level atau XP. Bicara soal cara berpikirmu, keputusanmu, atau cara kamu merespons situasi sulit.
                </StropheText>
              </Card>

              {/* Entry sebelumnya sebagai konteks */}
              {entries.length > 0 && (
                <Card style={styles.prevCard}>
                  <StropheText variant="caption" style={styles.prevLabel}>
                    REFLEKSIMU DI LEVEL {entries[entries.length - 1].level_at_time}
                  </StropheText>
                  <StropheText variant="body" style={styles.prevText} numberOfLines={4}>
                    "{entries[entries.length - 1].reflection}"
                  </StropheText>
                </Card>
              )}

              {alreadyDone ? (
                <Card style={styles.doneCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <Icon name="check" size={16} color={Colors.success} />
                    <StropheText style={{ color: Colors.success, fontWeight: '700' }}>
                      Refleksi Level {reflectionLevel} sudah tersimpan
                    </StropheText>
                  </View>
                  <StropheText variant="dim" style={{ marginTop: Spacing.sm }}>
                    Kamu bisa lihat semua refleksi di bawah.
                  </StropheText>
                </Card>
              ) : (
                <>
                  <TextInput
                    style={styles.textInput}
                    value={text}
                    onChangeText={setText}
                    placeholder="Tulis jujur — tidak ada yang salah di sini..."
                    placeholderTextColor={Colors.whiteDim}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                  <StropheText variant="dim" style={styles.charCount}>
                    {text.length} karakter (min. 50)
                  </StropheText>
                  <Button
                    label="Simpan Refleksi"
                    onPress={handleSave}
                    loading={saving}
                    disabled={text.trim().length < 50}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Card style={styles.savedCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Icon name="check" size={16} color={Colors.success} />
                  <StropheText style={{ color: Colors.success, fontWeight: '700' }}>
                    Refleksi tersimpan
                  </StropheText>
                </View>
              </Card>

              {aiResult ? (
                <Card gold style={styles.aiCard}>
                  <StropheText variant="gold" style={styles.aiLabel}>
                    APA YANG COACH LIHAT
                  </StropheText>
                  <StropheText variant="body" style={styles.aiText}>{aiResult}</StropheText>
                </Card>
              ) : null}

              <Button label="Kembali ke Home" onPress={() => router.replace('/(app)')} />
            </>
          )}

          {/* Riwayat semua refleksi */}
          {entries.length > 0 && (
            <>
              <StropheText variant="caption" style={styles.sectionTitle}>RIWAYAT REFLEKSI</StropheText>
              {[...entries].reverse().map((entry) => (
                <Card key={entry.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.levelPill}>
                      <StropheText style={styles.levelPillText}>LVL {entry.level_at_time}</StropheText>
                    </View>
                    <StropheText variant="dim" style={{ fontSize: 11 }}>
                      {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </StropheText>
                  </View>
                  <StropheText variant="body" style={styles.historyText}>
                    "{entry.reflection}"
                  </StropheText>
                  {entry.ai_comparison && (
                    <>
                      <View style={styles.divider} />
                      <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1 }}>
                        COACH
                      </StropheText>
                      <StropheText variant="body" style={[styles.historyText, { color: Colors.whiteSecondary }]}>
                        {entry.ai_comparison}
                      </StropheText>
                    </>
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

  promptCard: { padding: Spacing.lg, gap: Spacing.sm },
  promptLabel: { letterSpacing: 2, fontSize: 11, fontWeight: '700' },
  promptText: { lineHeight: 28 },

  prevCard: { borderColor: Colors.border },
  prevLabel: { letterSpacing: 1, color: Colors.whiteDim, marginBottom: Spacing.sm },
  prevText: { color: Colors.whiteDim, lineHeight: 22, fontStyle: 'italic' },

  doneCard: { borderColor: Colors.success, backgroundColor: '#0A1A0F' },

  textInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 180,
    lineHeight: 24,
  },
  charCount: { textAlign: 'right', marginTop: -Spacing.sm },

  savedCard: { borderColor: Colors.success, backgroundColor: '#0A1A0F' },
  aiCard: { padding: Spacing.lg, gap: Spacing.sm },
  aiLabel: { letterSpacing: 2, fontSize: 11, fontWeight: '700' },
  aiText: { color: Colors.whiteSecondary, lineHeight: 24 },

  sectionTitle: { letterSpacing: 2, color: Colors.whiteDim, marginTop: Spacing.sm },
  historyCard: { gap: Spacing.sm },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelPill: {
    backgroundColor: Colors.borderGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  levelPillText: { color: Colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  historyText: { lineHeight: 22, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: Colors.border },
});
