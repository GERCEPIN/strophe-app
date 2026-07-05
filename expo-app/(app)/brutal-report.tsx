import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useBrutalReport, WeeklyReport } from '../../hooks/useBrutalReport';

// ── Score ring ─────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 75 ? Colors.success : score >= 50 ? Colors.gold : Colors.danger;
  const label =
    score >= 75 ? 'Minggu Kuat' : score >= 50 ? 'Perlu Ditingkatkan' : 'Minggu Berat';

  return (
    <View style={ringStyles.container}>
      <View style={[ringStyles.ring, { borderColor: color }]}>
        <StropheText style={[ringStyles.score, { color }]}>{score}</StropheText>
        <StropheText style={ringStyles.outOf}>/100</StropheText>
      </View>
      <StropheText style={[ringStyles.label, { color }]}>{label}</StropheText>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm },
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignContent: 'center',
    gap: 0,
  },
  score: { fontSize: 32, fontWeight: '900', lineHeight: 38 },
  outOf: { fontSize: 12, color: Colors.whiteDim, fontWeight: '700', alignSelf: 'flex-end', paddingBottom: 4 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});

// ── Stat pill ──────────────────────────────────────────────────────
function StatPill({ label, value, color = Colors.whiteDim }: { label: string; value: string; color?: string }) {
  return (
    <View style={pillStyles.pill}>
      <StropheText style={[pillStyles.val, { color }]}>{value}</StropheText>
      <StropheText style={pillStyles.label}>{label}</StropheText>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: 'center', gap: 2 },
  val: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 9, color: Colors.whiteDim, letterSpacing: 0.5, textAlign: 'center' },
});

// ── Report section ─────────────────────────────────────────────────
function ReportSection({ title, content, color }: { title: string; content: string; color: string }) {
  return (
    <View style={sectionStyles.container}>
      <View style={[sectionStyles.titleRow, { borderLeftColor: color }]}>
        <StropheText style={[sectionStyles.title, { color }]}>{title}</StropheText>
      </View>
      <StropheText variant="body" style={sectionStyles.content}>{content}</StropheText>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { gap: Spacing.xs },
  titleRow: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
    marginBottom: 2,
  },
  title: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  content: { color: Colors.whiteSecondary, lineHeight: 24 },
});

// ── Parse report sections ──────────────────────────────────────────
function parseReport(text: string): { sections: { title: string; content: string; color: string }[]; score: string | null } {
  const sectionDefs = [
    { key: 'SKOR', color: Colors.gold },
    { key: 'YANG BERJALAN', color: Colors.success },
    { key: 'YANG TIDAK BERJALAN', color: Colors.danger },
    { key: 'POLA', color: '#4FC3F7' },
    { key: 'KEBENARAN BRUTAL', color: '#CE93D8' },
    { key: 'FOKUS MINGGU DEPAN', color: Colors.gold },
  ];

  const sections: { title: string; content: string; color: string }[] = [];
  let score: string | null = null;

  // Split berdasarkan angka di awal baris atau heading
  const lines = text.split('\n');
  let currentTitle = '';
  let currentColor = Colors.whiteSecondary;
  let currentContent: string[] = [];

  const flush = () => {
    if (currentTitle && currentContent.length > 0) {
      const contentStr = currentContent.join('\n').trim();
      sections.push({ title: currentTitle, content: contentStr, color: currentColor });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Deteksi heading — baris yang dimulai angka + titik atau semua huruf kapital
    const isHeading =
      /^\d+\.\s/.test(trimmed) ||
      sectionDefs.some((s) => trimmed.toUpperCase().includes(s.key));

    if (isHeading) {
      flush();
      currentContent = [];

      // Cari warna yang cocok
      const matched = sectionDefs.find((s) => trimmed.toUpperCase().includes(s.key));
      currentColor = matched?.color ?? Colors.whiteSecondary;

      // Bersihkan heading dari angka di depan
      currentTitle = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();

      // Jika heading punya konten di baris yang sama (misal: "1. SKOR: 72/100 — ...")
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const after = trimmed.slice(colonIdx + 1).trim();
        if (after) {
          currentContent.push(after);
          if (trimmed.toUpperCase().includes('SKOR')) score = after;
        }
      }
    } else {
      currentContent.push(trimmed);
    }
  }
  flush();

  return { sections, score };
}

// ── Report card ────────────────────────────────────────────────────
function ReportCard({ report }: { report: WeeklyReport }) {
  const [expanded, setExpanded] = useState(false);
  const { sections } = parseReport(report.report_text);
  const scoreColor =
    (report.overall_score ?? 0) >= 75
      ? Colors.success
      : (report.overall_score ?? 0) >= 50
      ? Colors.gold
      : Colors.danger;

  const weekLabel = new Date(report.week_start).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  }) + ' – ' + new Date(report.week_end).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card style={styles.reportCard}>
      <TouchableOpacity onPress={() => setExpanded((e) => !e)} activeOpacity={0.8}>
        <View style={styles.reportCardHeader}>
          <View style={{ flex: 1 }}>
            <StropheText variant="dim" style={{ fontSize: 10 }}>{weekLabel}</StropheText>
            {report.overall_score !== null && (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <StropheText style={[styles.historyScore, { color: scoreColor }]}>
                  {report.overall_score}
                </StropheText>
                <StropheText variant="dim" style={{ fontSize: 11 }}>/100</StropheText>
              </View>
            )}
          </View>
          <View style={styles.reportStats}>
            <StropheText variant="dim" style={{ fontSize: 10 }}>{report.sessions_done}/7 sesi</StropheText>
            <StropheText variant="dim" style={{ fontSize: 10 }}>Mental {report.mental_score_at_report}</StropheText>
          </View>
          <Icon name={expanded ? 'close' : 'arrow-right'} size={14} color={Colors.whiteDim} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
          <View style={styles.divider} />
          {sections.map((s, i) => (
            <ReportSection key={i} title={s.title} content={s.content} color={s.color} />
          ))}
        </View>
      )}
    </Card>
  );
}

// ── Main screen ────────────────────────────────────────────────────
export default function BrutalReportScreen() {
  const router = useRouter();
  const {
    reports,
    currentReport,
    loading,
    generating,
    canGenerateThisWeek,
    enoughDataForThisWeek,
    thisWeek,
    lastWeek,
    generateThisWeek,
    generateLastWeek,
  } = useBrutalReport();

  const { sections: currentSections } = currentReport
    ? parseReport(currentReport.report_text)
    : { sections: [] };

  const historyReports = reports.filter((r) => r.week_start !== thisWeek.start);

  const weekLabel = (start: string, end: string) =>
    new Date(start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
    ' – ' +
    new Date(end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={16} color={Colors.gold} />
          <StropheText variant="gold">Kembali</StropheText>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.goldLine} />
          <StropheText variant="h2">Brutal Honesty Report</StropheText>
          <StropheText variant="caption" style={{ marginTop: 4 }}>
            Laporan mingguan jujur — berbasis data, bukan opini
          </StropheText>
        </View>

        {/* Laporan minggu ini */}
        {currentReport ? (
          <>
            <Card gold style={styles.currentCard}>
              <View style={styles.currentHeader}>
                <View>
                  <StropheText variant="gold" style={styles.currentLabel}>LAPORAN MINGGU INI</StropheText>
                  <StropheText variant="dim" style={{ fontSize: 11, marginTop: 2 }}>
                    {weekLabel(currentReport.week_start, currentReport.week_end)}
                  </StropheText>
                </View>
                {currentReport.overall_score !== null && (
                  <ScoreRing score={currentReport.overall_score} />
                )}
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <StatPill
                  label="SESI"
                  value={`${currentReport.sessions_done}/7`}
                  color={currentReport.sessions_done >= 5 ? Colors.success : currentReport.sessions_done >= 3 ? Colors.gold : Colors.danger}
                />
                <StatPill label="XP" value={`+${currentReport.xp_earned}`} color={Colors.gold} />
                <StatPill label="MENTAL" value={`${currentReport.mental_score_at_report}`} color={Colors.whiteSecondary} />
                <StatPill label="STREAK" value={`${currentReport.streak_at_report}h`} color={Colors.whiteSecondary} />
                <StatPill label="HEALTH" value={`${currentReport.health_checkins}/7`} color={Colors.whiteSecondary} />
              </View>
            </Card>

            {/* Report sections */}
            <Card style={styles.reportBody}>
              {currentSections.length > 0 ? (
                <View style={{ gap: Spacing.lg }}>
                  {currentSections.map((s, i) => (
                    <ReportSection key={i} title={s.title} content={s.content} color={s.color} />
                  ))}
                </View>
              ) : (
                <StropheText variant="body" style={{ color: Colors.whiteSecondary, lineHeight: 24 }}>
                  {currentReport.report_text}
                </StropheText>
              )}
            </Card>

            <Button
              label="Generate Ulang Laporan Ini"
              onPress={generateThisWeek}
              loading={generating}
              variant="outline"
            />
          </>
        ) : (
          /* Belum ada laporan minggu ini */
          <>
            <Card gold style={styles.generateCard}>
              <View style={{ alignItems: 'center', gap: Spacing.md }}>
                <View style={styles.reportIconContainer}>
                  <Icon name="target" size={32} color={Colors.gold} />
                </View>
                <StropheText variant="h3" style={{ textAlign: 'center' }}>
                  Laporan Minggu Ini Belum Ada
                </StropheText>
                <StropheText variant="caption" style={{ textAlign: 'center', color: Colors.whiteSecondary, lineHeight: 20 }}>
                  {weekLabel(thisWeek.start, thisWeek.end)}
                </StropheText>
                <StropheText variant="dim" style={{ textAlign: 'center', lineHeight: 20 }}>
                  {enoughDataForThisWeek
                    ? 'AI akan menganalisis semua aktivitasmu minggu ini — sesi, kesehatan, ibadah, keuangan, dan tujuan — lalu memberikan laporan jujur.'
                    : 'Tersedia mulai Rabu agar ada cukup data untuk dianalisis. Sementara itu, kamu bisa generate laporan minggu lalu.'}
                </StropheText>

                {generating ? (
                  <View style={styles.generatingContainer}>
                    <ActivityIndicator size="large" color={Colors.gold} />
                    <StropheText variant="dim" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
                      Menganalisis minggu ini...
                    </StropheText>
                  </View>
                ) : (
                  <Button
                    label={enoughDataForThisWeek ? 'Generate Laporan Minggu Ini' : 'Generate Laporan Minggu Lalu'}
                    onPress={enoughDataForThisWeek ? generateThisWeek : generateLastWeek}
                    style={{ width: '100%', marginTop: 0 }}
                  />
                )}
              </View>
            </Card>

            {/* Info cara kerja */}
            <Card style={styles.infoCard}>
              <StropheText variant="caption" style={styles.infoTitle}>
                APA YANG DIANALISIS AI?
              </StropheText>
              {[
                { label: 'Sesi Inti', desc: 'Berapa hari dari 7 kamu selesaikan sesi level' },
                { label: 'Health Check-in', desc: 'Pola tidur, hidrasi, energi, dan mood mingguan' },
                { label: 'Ibadah', desc: 'Rata-rata shalat harian dan konsistensi rutinitas' },
                { label: 'Decision Journal', desc: 'Keputusan yang dicatat dan pola yang terlihat' },
                { label: 'Blueprint Goals', desc: 'Kemajuan terhadap tujuan 1-5-10 tahun' },
                { label: 'Mental Score & Streak', desc: 'Kondisi mental dan momentum konsistensi' },
              ].map((item) => (
                <View key={item.label} style={styles.infoRow}>
                  <Icon name="check" size={12} color={Colors.gold} />
                  <View style={{ flex: 1 }}>
                    <StropheText style={styles.infoLabel}>{item.label}</StropheText>
                    <StropheText variant="dim" style={{ fontSize: 11, lineHeight: 16 }}>{item.desc}</StropheText>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Riwayat laporan */}
        {historyReports.length > 0 && (
          <>
            <StropheText variant="caption" style={styles.historyTitle}>RIWAYAT LAPORAN</StropheText>
            {historyReports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </>
        )}

        {/* Trend mini jika ada 2+ laporan */}
        {reports.length >= 2 && (
          <Card style={styles.trendCard}>
            <StropheText variant="caption" style={styles.infoTitle}>TREN SKOR (12 MINGGU TERAKHIR)</StropheText>
            <View style={styles.trendRow}>
              {[...reports].reverse().slice(-8).map((r) => {
                const score = r.overall_score ?? 0;
                const color =
                  score >= 75 ? Colors.success : score >= 50 ? Colors.gold : Colors.danger;
                const heightPct = Math.max(score, 5);
                return (
                  <View key={r.id} style={styles.trendBar}>
                    <StropheText style={[styles.trendScore, { color }]}>{score}</StropheText>
                    <View style={styles.trendBarBg}>
                      <View
                        style={[
                          styles.trendBarFill,
                          { height: `${heightPct}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                    <StropheText style={styles.trendWeek}>
                      {new Date(r.week_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }).replace(' ', '\n')}
                    </StropheText>
                  </View>
                );
              })}
            </View>
          </Card>
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
  divider: { height: 1, backgroundColor: Colors.border },

  currentCard: { padding: Spacing.lg, gap: Spacing.lg },
  currentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  currentLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: Spacing.xs, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },

  reportBody: { gap: Spacing.md, padding: Spacing.lg },

  generateCard: { padding: Spacing.xl },
  reportIconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.borderGold, borderWidth: 2, borderColor: Colors.goldDim,
    alignItems: 'center', justifyContent: 'center',
  },
  generatingContainer: { alignItems: 'center', paddingVertical: Spacing.md },

  infoCard: { gap: Spacing.sm },
  infoTitle: { color: Colors.whiteDim, letterSpacing: 1.5, marginBottom: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  infoLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },

  historyTitle: { letterSpacing: 2, color: Colors.whiteDim },
  reportCard: { gap: 0 },
  reportCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  historyScore: { fontSize: 22, fontWeight: '900' },
  reportStats: { gap: 2, alignItems: 'flex-end', marginRight: Spacing.xs },

  trendCard: { gap: Spacing.md },
  trendRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs, height: 100 },
  trendBar: { flex: 1, alignItems: 'center', gap: 4 },
  trendScore: { fontSize: 9, fontWeight: '800' },
  trendBarBg: { flex: 1, width: '100%', backgroundColor: Colors.bgElevated, borderRadius: 2, justifyContent: 'flex-end', overflow: 'hidden' },
  trendBarFill: { width: '100%', borderRadius: 2 },
  trendWeek: { fontSize: 7, color: Colors.whiteDim, textAlign: 'center', lineHeight: 10 },
});
