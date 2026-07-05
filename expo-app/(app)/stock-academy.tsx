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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useStockAcademy } from '../../hooks/useStockAcademy';
import { STOCK_CURRICULUM, getModuleProgress, getLessonById, Lesson, QuizQuestion } from '../../lib/stock-curriculum';

// ── Progress ring (simple bar) ─────────────────────────────────────
function ProgressBar({ pct, color = Colors.gold }: { pct: number; color?: string }) {
  return (
    <View style={progressStyles.bg}>
      <View style={[progressStyles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}
const progressStyles = StyleSheet.create({
  bg: { height: 4, backgroundColor: Colors.bgElevated, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});

// ── Quiz component ─────────────────────────────────────────────────
function QuizView({
  questions,
  onDone,
}: {
  questions: QuizQuestion[];
  onDone: (score: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const selected = answers[current];

  const handleSelect = (idx: number) => {
    if (revealed) return;
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    setRevealed(true);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setRevealed(false);
    } else {
      const correct = answers.filter((a, i) => a === questions[i].correct).length;
      const score = Math.round((correct / questions.length) * 100);
      setFinished(true);
      onDone(score);
    }
  };

  if (finished) return null;

  return (
    <Card style={quizStyles.card}>
      <View style={quizStyles.header}>
        <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1 }}>
          SOAL {current + 1}/{questions.length}
        </StropheText>
        <ProgressBar pct={((current) / questions.length) * 100} />
      </View>

      <StropheText variant="body" style={quizStyles.question}>{q.question}</StropheText>

      {q.options.map((opt, i) => {
        let borderColor = Colors.border;
        let bg = Colors.bgElevated;
        if (revealed) {
          if (i === q.correct) { borderColor = Colors.success; bg = '#0A1A0F'; }
          else if (i === selected && i !== q.correct) { borderColor = Colors.danger; bg = '#1A0A0A'; }
        } else if (i === selected) {
          borderColor = Colors.gold;
        }
        return (
          <TouchableOpacity
            key={i}
            onPress={() => handleSelect(i)}
            style={[quizStyles.option, { borderColor, backgroundColor: bg }]}
            activeOpacity={0.8}
          >
            <View style={quizStyles.optionLeft}>
              <View style={[quizStyles.optionDot, { borderColor }]}>
                {revealed && i === q.correct && <Icon name="check" size={8} color={Colors.success} />}
                {revealed && i === selected && i !== q.correct && <Icon name="close" size={8} color={Colors.danger} />}
              </View>
              <StropheText variant="body" style={{ flex: 1, lineHeight: 20 }}>{opt}</StropheText>
            </View>
          </TouchableOpacity>
        );
      })}

      {revealed && (
        <View style={quizStyles.explanation}>
          <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1, marginBottom: 4 }}>PENJELASAN</StropheText>
          <StropheText variant="body" style={{ color: Colors.whiteSecondary, lineHeight: 20 }}>{q.explanation}</StropheText>
        </View>
      )}

      {revealed && (
        <Button
          label={current < questions.length - 1 ? 'Soal Berikutnya' : 'Selesai'}
          onPress={handleNext}
          style={{ marginTop: Spacing.sm }}
        />
      )}
    </Card>
  );
}

const quizStyles = StyleSheet.create({
  card: { gap: Spacing.sm },
  header: { gap: Spacing.xs },
  question: { fontWeight: '700', lineHeight: 24 },
  option: {
    borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  optionDot: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  explanation: {
    backgroundColor: Colors.bgElevated, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
});

// ── Lesson Detail View ─────────────────────────────────────────────
function LessonView({
  lesson,
  quizScore,
  onComplete,
  onBack,
}: {
  lesson: Lesson;
  quizScore: number | null;
  onComplete: (score: number) => void;
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<'read' | 'terms' | 'quiz' | 'done'>('read');
  const [score, setScore] = useState<number | null>(quizScore);

  const handleQuizDone = (s: number) => {
    setScore(s);
    setPhase('done');
    onComplete(s);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.xxl }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <Icon name="arrow-left" size={16} color={Colors.gold} />
        <StropheText variant="gold">Kembali</StropheText>
      </TouchableOpacity>

      <View style={{ gap: Spacing.xs }}>
        <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1 }}>{lesson.duration}</StropheText>
        <StropheText variant="h2">{lesson.title}</StropheText>
      </View>

      {/* Tab */}
      <View style={styles.tabBar}>
        {(['read', 'terms', 'quiz'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => { if (t !== 'quiz' || phase !== 'read') setPhase(t); }}
            style={[styles.tab, phase === t && styles.tabActive]}
          >
            <StropheText style={[styles.tabLabel, phase === t && { color: Colors.gold }]}>
              {t === 'read' ? 'Materi' : t === 'terms' ? 'Istilah' : score !== null ? `Kuis ✓ ${score}%` : 'Kuis'}
            </StropheText>
          </TouchableOpacity>
        ))}
      </View>

      {/* MATERI */}
      {phase === 'read' && (
        <>
          <Card style={{ gap: Spacing.md }}>
            {lesson.content.split('\n\n').map((para, i) => (
              <StropheText
                key={i}
                variant={para.match(/^[A-Z0-9].{0,60}$/) ? 'caption' : 'body'}
                style={
                  para.match(/^[A-Z0-9].{0,60}$/)
                    ? { color: Colors.gold, letterSpacing: 1, fontWeight: '700' }
                    : { lineHeight: 24, color: Colors.whiteSecondary }
                }
              >
                {para}
              </StropheText>
            ))}
          </Card>
          <Button label="Lanjut ke Kuis" onPress={() => setPhase('quiz')} />
        </>
      )}

      {/* ISTILAH */}
      {phase === 'terms' && (
        <Card style={{ gap: Spacing.sm }}>
          <StropheText variant="caption" style={{ color: Colors.whiteDim, letterSpacing: 1 }}>KAMUS ISTILAH</StropheText>
          {lesson.keyTerms.map((kt) => (
            <View key={kt.term} style={lessonStyles.termRow}>
              <StropheText style={lessonStyles.term}>{kt.term}</StropheText>
              <StropheText variant="body" style={lessonStyles.termDef}>{kt.definition}</StropheText>
            </View>
          ))}
        </Card>
      )}

      {/* KUIS */}
      {(phase === 'quiz' || phase === 'done') && (
        <>
          {phase === 'done' ? (
            <Card gold style={{ padding: Spacing.lg, gap: Spacing.sm, alignItems: 'center' }}>
              <Icon name="check" size={24} color={score! >= 60 ? Colors.success : Colors.danger} />
              <StropheText variant="h3" style={{ color: score! >= 60 ? Colors.success : Colors.danger }}>
                Skor: {score}%
              </StropheText>
              <StropheText variant="caption" style={{ textAlign: 'center', color: Colors.whiteSecondary }}>
                {score! >= 60 ? 'Pelajaran selesai! Kamu memahami materi ini.' : 'Belum lulus. Coba lagi setelah membaca ulang materi.'}
              </StropheText>
              {score! < 60 && (
                <Button label="Coba Lagi" onPress={() => { setPhase('quiz'); }} variant="outline" style={{ marginTop: Spacing.sm }} />
              )}
            </Card>
          ) : (
            <QuizView questions={lesson.quiz} onDone={handleQuizDone} />
          )}
        </>
      )}
    </ScrollView>
  );
}

const lessonStyles = StyleSheet.create({
  termRow: { gap: 4, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  term: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.gold },
  termDef: { color: Colors.whiteSecondary, lineHeight: 20 },
});

// ── Main screen ────────────────────────────────────────────────────
export default function StockAcademyScreen() {
  const router = useRouter();
  const {
    completedIds,
    overallProgress,
    totalLessons,
    totalCompleted,
    notes,
    saving,
    getProgress,
    markLessonRead,
    submitQuiz,
    addNote,
    deleteNote,
  } = useStockAcademy();

  const [tab, setTab] = useState<'curriculum' | 'notes'>('curriculum');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Note form
  const [ticker, setTicker] = useState('');
  const [noteText, setNoteText] = useState('');
  const [analysisType, setAnalysisType] = useState('fundamental');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const handleLessonComplete = async (lessonId: string, score: number) => {
    await submitQuiz(lessonId, score);
    if (score >= 60) await markLessonRead(lessonId);
  };

  if (activeLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lessonContainer}>
          <LessonView
            lesson={activeLesson}
            quizScore={getProgress(activeLesson.id)?.quiz_score ?? null}
            onComplete={(score) => handleLessonComplete(activeLesson.id, score)}
            onBack={() => setActiveLesson(null)}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            <StropheText variant="h2">Akademi Saham</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              Analisis fundamental · Teknikal · Psikologi · Manajemen risiko
            </StropheText>
          </View>

          {/* Overall progress */}
          <Card gold style={styles.progressCard}>
            <View style={styles.progressTop}>
              <View>
                <StropheText variant="gold" style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: '700' }}>
                  PROGRES KESELURUHAN
                </StropheText>
                <StropheText style={styles.progressNum}>{overallProgress}%</StropheText>
              </View>
              <View style={styles.progressStats}>
                <StropheText variant="dim" style={{ fontSize: 11 }}>
                  {totalCompleted}/{totalLessons} pelajaran
                </StropheText>
              </View>
            </View>
            <ProgressBar pct={overallProgress} />
            {overallProgress === 100 && (
              <StropheText style={{ color: Colors.success, fontSize: 11, fontWeight: '700', marginTop: 4 }}>
                Kurikulum selesai — kamu siap analisis mandiri.
              </StropheText>
            )}
          </Card>

          {/* Tab */}
          <View style={styles.tabBar}>
            {(['curriculum', 'notes'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && styles.tabActive]}
              >
                <StropheText style={[styles.tabLabel, tab === t && { color: Colors.gold }]}>
                  {t === 'curriculum' ? 'Kurikulum' : 'Catatan Analisis'}
                </StropheText>
              </TouchableOpacity>
            ))}
          </View>

          {/* CURRICULUM TAB */}
          {tab === 'curriculum' && STOCK_CURRICULUM.map((mod) => {
            const modProgress = getModuleProgress(mod.id, completedIds);
            return (
              <View key={mod.id} style={{ gap: Spacing.sm }}>
                {/* Module header */}
                <View style={styles.moduleHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moduleTitle}>
                      <View style={styles.moduleNum}>
                        <StropheText style={styles.moduleNumText}>{mod.order}</StropheText>
                      </View>
                      <StropheText variant="body" style={{ fontWeight: '800', flex: 1 }}>{mod.title}</StropheText>
                    </View>
                    <StropheText variant="dim" style={{ fontSize: 11, marginTop: 4, marginLeft: 28 }}>
                      {mod.description}
                    </StropheText>
                  </View>
                  <StropheText
                    style={[
                      styles.moduleProgress,
                      modProgress === 100 && { color: Colors.success },
                    ]}
                  >
                    {modProgress}%
                  </StropheText>
                </View>
                <ProgressBar pct={modProgress} color={modProgress === 100 ? Colors.success : Colors.gold} />

                {/* Lessons */}
                {mod.lessons.map((lesson) => {
                  const prog = getProgress(lesson.id);
                  const done = completedIds.has(lesson.id);
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      onPress={() => setActiveLesson(lesson)}
                      activeOpacity={0.8}
                    >
                      <Card style={[styles.lessonCard, done && { borderColor: Colors.success + '55' }]}>
                        <View style={styles.lessonRow}>
                          <View
                            style={[
                              styles.lessonCheck,
                              done
                                ? { backgroundColor: Colors.success, borderColor: Colors.success }
                                : { backgroundColor: Colors.bgElevated, borderColor: Colors.border },
                            ]}
                          >
                            {done && <Icon name="check" size={10} color={Colors.bg} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <StropheText variant="body" style={{ fontWeight: '700' }}>{lesson.title}</StropheText>
                            <View style={styles.lessonMeta}>
                              <StropheText variant="dim" style={{ fontSize: 11 }}>{lesson.duration}</StropheText>
                              {prog?.quiz_score !== null && prog?.quiz_score !== undefined && (
                                <View
                                  style={[
                                    styles.scorePill,
                                    {
                                      borderColor: prog.quiz_score >= 60 ? Colors.success : Colors.danger,
                                      backgroundColor: prog.quiz_score >= 60 ? '#0A1A0F' : '#1A0A0A',
                                    },
                                  ]}
                                >
                                  <StropheText
                                    style={[
                                      styles.scorePillText,
                                      { color: prog.quiz_score >= 60 ? Colors.success : Colors.danger },
                                    ]}
                                  >
                                    Kuis {prog.quiz_score}%
                                  </StropheText>
                                </View>
                              )}
                            </View>
                          </View>
                          <Icon name="arrow-right" size={14} color={Colors.whiteDim} />
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          {/* NOTES TAB */}
          {tab === 'notes' && (
            <>
              {/* Form */}
              <Card style={{ gap: Spacing.sm }}>
                <StropheText variant="caption" style={styles.sectionLabel}>CATAT ANALISIS SAHAM</StropheText>
                <StropheText variant="dim" style={{ fontSize: 11, lineHeight: 18 }}>
                  Tulis analisismu, AI Coach akan review kualitas proses berpikirmu — bukan rekomendasikan beli/jual.
                </StropheText>

                <TextInput
                  style={[styles.textInput, { height: 44 }]}
                  value={ticker}
                  onChangeText={(t) => setTicker(t.toUpperCase().replace(/[^A-Z]/g, ''))}
                  placeholder="Kode saham (misal: BBCA)"
                  placeholderTextColor={Colors.whiteDim}
                  maxLength={6}
                  autoCapitalize="characters"
                />

                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  {(['fundamental', 'technical', 'general'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setAnalysisType(t)}
                      style={[
                        styles.typeChip,
                        analysisType === t && { borderColor: Colors.goldDim, backgroundColor: Colors.borderGold },
                      ]}
                    >
                      <StropheText
                        style={[styles.typeChipText, analysisType === t && { color: Colors.gold }]}
                      >
                        {t === 'fundamental' ? 'Fundamental' : t === 'technical' ? 'Teknikal' : 'Umum'}
                      </StropheText>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.textInput}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Tulis analisismu di sini — bisnis model, rasio keuangan, pola grafik, atau alasan lainnya..."
                  placeholderTextColor={Colors.whiteDim}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <Button
                  label="Simpan & Minta Feedback AI"
                  onPress={async () => {
                    if (!ticker || !noteText.trim()) {
                      Alert.alert('Lengkapi dulu', 'Isi kode saham dan catatanmu.');
                      return;
                    }
                    await addNote(ticker, noteText, analysisType);
                    setTicker('');
                    setNoteText('');
                  }}
                  loading={saving}
                  style={{ marginTop: 0 }}
                />
              </Card>

              {/* Notes list */}
              {notes.length > 0 && (
                <>
                  <StropheText variant="caption" style={styles.sectionLabel}>CATATAN TERSIMPAN</StropheText>
                  {notes.map((n) => (
                    <Card key={n.id} style={{ gap: Spacing.sm }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                          <View style={styles.tickerBadge}>
                            <StropheText style={styles.tickerText}>{n.ticker}</StropheText>
                          </View>
                          <View style={[styles.typeChip, { borderColor: Colors.border }]}>
                            <StropheText style={[styles.typeChipText, { color: Colors.whiteDim }]}>
                              {n.analysis_type ?? 'umum'}
                            </StropheText>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert('Hapus catatan?', '', [
                              { text: 'Batal', style: 'cancel' },
                              { text: 'Hapus', style: 'destructive', onPress: () => deleteNote(n.id) },
                            ])
                          }
                          style={{ padding: Spacing.xs }}
                        >
                          <Icon name="close" size={12} color={Colors.whiteDim} />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity onPress={() => setExpandedNote(expandedNote === n.id ? null : n.id)}>
                        <StropheText
                          variant="body"
                          style={{ color: Colors.whiteSecondary, lineHeight: 20 }}
                          numberOfLines={expandedNote === n.id ? undefined : 3}
                        >
                          {n.note}
                        </StropheText>
                        {n.note.length > 150 && (
                          <StropheText style={{ color: Colors.gold, fontSize: 11, marginTop: 4 }}>
                            {expandedNote === n.id ? 'Sembunyikan' : 'Baca semua'}
                          </StropheText>
                        )}
                      </TouchableOpacity>

                      {n.ai_feedback && (
                        <>
                          <View style={{ height: 1, backgroundColor: Colors.border }} />
                          <StropheText variant="caption" style={{ color: Colors.gold, letterSpacing: 1 }}>
                            FEEDBACK COACH
                          </StropheText>
                          <StropheText variant="body" style={{ color: Colors.whiteSecondary, lineHeight: 20 }}>
                            {n.ai_feedback}
                          </StropheText>
                        </>
                      )}

                      <StropheText variant="dim" style={{ fontSize: 10 }}>
                        {new Date(n.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </StropheText>
                    </Card>
                  ))}
                </>
              )}

              {notes.length === 0 && (
                <Card style={{ paddingVertical: Spacing.xl, alignItems: 'center' }}>
                  <StropheText variant="dim" style={{ textAlign: 'center' }}>
                    Belum ada catatan analisis. Mulai tulis analisismu untuk mendapat feedback dari AI Coach.
                  </StropheText>
                </Card>
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
  lessonContainer: { flex: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  header: { gap: Spacing.xs },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2 },

  progressCard: { padding: Spacing.lg, gap: Spacing.sm },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  progressNum: { fontSize: 36, fontWeight: '900', color: Colors.gold, lineHeight: 44 },
  progressStats: { alignItems: 'flex-end' },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  tabLabel: { fontSize: 12, fontWeight: '700', color: Colors.whiteDim },

  moduleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  moduleTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  moduleNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.borderGold, borderWidth: 1, borderColor: Colors.goldDim,
    alignItems: 'center', justifyContent: 'center',
  },
  moduleNumText: { color: Colors.gold, fontSize: 10, fontWeight: '800' },
  moduleProgress: { fontSize: 12, fontWeight: '800', color: Colors.gold, minWidth: 36, textAlign: 'right' },

  lessonCard: { padding: Spacing.md },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  lessonCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  scorePill: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1,
  },
  scorePillText: { fontSize: 9, fontWeight: '700' },

  sectionLabel: { color: Colors.whiteDim, letterSpacing: 1.5 },

  textInput: {
    backgroundColor: Colors.bgElevated, borderRadius: Radius.md,
    padding: Spacing.md, color: Colors.white, fontSize: FontSize.base,
    borderWidth: 1, borderColor: Colors.border, minHeight: 120, lineHeight: 22,
  },
  typeChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  typeChipText: { fontSize: 11, fontWeight: '600', color: Colors.whiteDim },

  tickerBadge: {
    backgroundColor: Colors.borderGold, paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.goldDim,
  },
  tickerText: { color: Colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
