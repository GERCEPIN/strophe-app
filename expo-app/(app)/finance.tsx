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
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../hooks/useFinance';

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function CategoryPicker({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {categories.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onSelect(c)}
          style={[
            catStyles.chip,
            selected === c && { backgroundColor: Colors.borderGold, borderColor: Colors.goldDim },
          ]}
        >
          <StropheText style={[catStyles.label, selected === c && { color: Colors.gold }]}>{c}</StropheText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const catStyles = StyleSheet.create({
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

export default function FinanceScreen() {
  const router = useRouter();
  const {
    transactions,
    goals,
    loading,
    saving,
    aiInsight,
    loadingInsight,
    totalIncome,
    totalExpense,
    balance,
    expenseByCategory,
    addTransaction,
    deleteTransaction,
    addGoal,
    getAiInsight,
  } = useFinance();

  const [tab, setTab] = useState<'overview' | 'add' | 'goals'>('overview');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');

  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const handleAddTransaction = async () => {
    const num = parseFloat(amount.replace(/\D/g, ''));
    if (!num || num <= 0) {
      Alert.alert('Nominal tidak valid', 'Masukkan jumlah yang benar.');
      return;
    }
    await addTransaction({ type: txType, amount: num, category, note: note.trim() || undefined });
    setAmount('');
    setNote('');
    setTab('overview');
  };

  const handleAddGoal = async () => {
    const num = parseFloat(goalTarget.replace(/\D/g, ''));
    if (!goalName.trim() || !num) {
      Alert.alert('Data tidak lengkap', 'Isi nama dan target tabungan.');
      return;
    }
    await addGoal(goalName.trim(), num);
    setGoalName('');
    setGoalTarget('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus transaksi?', '', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  const balanceColor = balance >= 0 ? Colors.success : Colors.danger;

  const topExpenses = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
            <StropheText variant="h2">Keuangan</StropheText>
            <StropheText variant="caption" style={{ marginTop: 4 }}>
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </StropheText>
          </View>

          {/* Summary card */}
          <Card gold style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryItem}>
                <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1 }}>PEMASUKAN</StropheText>
                <StropheText style={[styles.summaryAmt, { color: Colors.success }]}>
                  {formatRp(totalIncome)}
                </StropheText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <StropheText variant="dim" style={{ fontSize: 10, letterSpacing: 1 }}>PENGELUARAN</StropheText>
                <StropheText style={[styles.summaryAmt, { color: Colors.danger }]}>
                  {formatRp(totalExpense)}
                </StropheText>
              </View>
            </View>
            <View style={styles.balanceRow}>
              <StropheText variant="caption" style={{ letterSpacing: 1 }}>SISA</StropheText>
              <StropheText style={[styles.balanceAmt, { color: balanceColor }]}>
                {formatRp(balance)}
              </StropheText>
            </View>
          </Card>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {(['overview', 'add', 'goals'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && styles.tabActive]}
              >
                <StropheText style={[styles.tabLabel, tab === t && { color: Colors.gold }]}>
                  {t === 'overview' ? 'Ringkasan' : t === 'add' ? '+ Catat' : 'Tujuan'}
                </StropheText>
              </TouchableOpacity>
            ))}
          </View>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              {/* Top pengeluaran */}
              {topExpenses.length > 0 && (
                <Card style={styles.section}>
                  <StropheText variant="caption" style={styles.sectionLabel}>PENGELUARAN TERBESAR</StropheText>
                  {topExpenses.map(([cat, amt]) => (
                    <View key={cat} style={styles.expRow}>
                      <StropheText variant="body" style={{ flex: 1 }}>{cat}</StropheText>
                      <StropheText style={styles.expAmt}>{formatRp(amt)}</StropheText>
                    </View>
                  ))}
                </Card>
              )}

              {/* AI Insight */}
              <Card style={styles.section}>
                <StropheText variant="caption" style={styles.sectionLabel}>ANALISIS FINANSIAL</StropheText>
                {aiInsight ? (
                  <StropheText variant="body" style={styles.aiText}>{aiInsight}</StropheText>
                ) : (
                  <Button
                    label={loadingInsight ? 'Menganalisis...' : 'Minta Insight AI Coach'}
                    onPress={getAiInsight}
                    loading={loadingInsight}
                    disabled={transactions.length < 3}
                    variant="outline"
                  />
                )}
                {transactions.length < 3 && (
                  <StropheText variant="dim" style={{ fontSize: 11, marginTop: Spacing.xs }}>
                    Catat minimal 3 transaksi untuk mendapat insight.
                  </StropheText>
                )}
              </Card>

              {/* Transaksi terbaru */}
              {transactions.length > 0 && (
                <Card style={styles.section}>
                  <StropheText variant="caption" style={styles.sectionLabel}>TRANSAKSI BULAN INI</StropheText>
                  {transactions.slice(0, 10).map((tx) => (
                    <View key={tx.id} style={styles.txRow}>
                      <View style={{ flex: 1 }}>
                        <StropheText variant="body" style={{ fontWeight: '600' }}>{tx.category}</StropheText>
                        <StropheText variant="dim" style={{ fontSize: 11, marginTop: 2 }}>
                          {tx.note ?? ''}{tx.note ? ' · ' : ''}
                          {new Date(tx.transaction_date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short',
                          })}
                        </StropheText>
                      </View>
                      <StropheText
                        style={[
                          styles.txAmt,
                          { color: tx.type === 'income' ? Colors.success : Colors.danger },
                        ]}
                      >
                        {tx.type === 'income' ? '+' : '−'} {formatRp(tx.amount)}
                      </StropheText>
                      <TouchableOpacity
                        onPress={() => handleDelete(tx.id)}
                        style={{ padding: Spacing.xs, marginLeft: 4 }}
                      >
                        <Icon name="close" size={12} color={Colors.whiteDim} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </Card>
              )}

              {transactions.length === 0 && !loading && (
                <Card style={styles.emptyCard}>
                  <StropheText variant="dim" style={{ textAlign: 'center' }}>
                    Belum ada transaksi bulan ini. Catat pemasukan atau pengeluaran pertamamu.
                  </StropheText>
                </Card>
              )}
            </>
          )}

          {/* ADD TRANSACTION */}
          {tab === 'add' && (
            <Card style={styles.section}>
              <StropheText variant="caption" style={styles.sectionLabel}>CATAT TRANSAKSI</StropheText>

              {/* Type toggle */}
              <View style={styles.typeRow}>
                <TouchableOpacity
                  onPress={() => { setTxType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
                  style={[styles.typeBtn, txType === 'expense' && styles.typeBtnDanger]}
                >
                  <StropheText style={[styles.typeBtnLabel, txType === 'expense' && { color: Colors.danger }]}>
                    Pengeluaran
                  </StropheText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setTxType('income'); setCategory(INCOME_CATEGORIES[0]); }}
                  style={[styles.typeBtn, txType === 'income' && styles.typeBtnSuccess]}
                >
                  <StropheText style={[styles.typeBtnLabel, txType === 'income' && { color: Colors.success }]}>
                    Pemasukan
                  </StropheText>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={{ marginTop: Spacing.md, gap: Spacing.xs }}>
                <StropheText variant="caption" style={styles.fieldLabel}>JUMLAH (IDR)</StropheText>
                <TextInput
                  style={styles.textInput}
                  value={amount}
                  onChangeText={(t) => setAmount(t.replace(/\D/g, ''))}
                  placeholder="0"
                  placeholderTextColor={Colors.whiteDim}
                  keyboardType="numeric"
                />
                {amount !== '' && (
                  <StropheText variant="dim" style={{ fontSize: 11 }}>
                    {formatRp(parseFloat(amount) || 0)}
                  </StropheText>
                )}
              </View>

              {/* Category */}
              <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                <StropheText variant="caption" style={styles.fieldLabel}>KATEGORI</StropheText>
                <CategoryPicker
                  categories={txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES}
                  selected={category}
                  onSelect={setCategory}
                />
              </View>

              {/* Note */}
              <View style={{ marginTop: Spacing.md, gap: Spacing.xs }}>
                <StropheText variant="caption" style={styles.fieldLabel}>CATATAN (opsional)</StropheText>
                <TextInput
                  style={[styles.textInput, { minHeight: 0, height: 44 }]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Keterangan singkat..."
                  placeholderTextColor={Colors.whiteDim}
                />
              </View>

              <Button
                label="Simpan"
                onPress={handleAddTransaction}
                loading={saving}
                style={{ marginTop: Spacing.md }}
              />
            </Card>
          )}

          {/* GOALS */}
          {tab === 'goals' && (
            <>
              {/* Form tambah tujuan */}
              <Card style={styles.section}>
                <StropheText variant="caption" style={styles.sectionLabel}>TUJUAN TABUNGAN BARU</StropheText>
                <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
                  <TextInput
                    style={[styles.textInput, { height: 44, minHeight: 0 }]}
                    value={goalName}
                    onChangeText={setGoalName}
                    placeholder="Nama tujuan (misal: Dana Darurat)"
                    placeholderTextColor={Colors.whiteDim}
                  />
                  <TextInput
                    style={[styles.textInput, { height: 44, minHeight: 0 }]}
                    value={goalTarget}
                    onChangeText={(t) => setGoalTarget(t.replace(/\D/g, ''))}
                    placeholder="Target jumlah (Rp)"
                    placeholderTextColor={Colors.whiteDim}
                    keyboardType="numeric"
                  />
                  <Button
                    label="Tambah Tujuan"
                    onPress={handleAddGoal}
                    loading={saving}
                    variant="outline"
                    style={{ marginTop: 0 }}
                  />
                </View>
              </Card>

              {/* Daftar goals */}
              {goals.length > 0 && (
                <Card style={styles.section}>
                  <StropheText variant="caption" style={styles.sectionLabel}>TUJUAN AKTIF</StropheText>
                  {goals.map((g) => {
                    const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
                    return (
                      <View key={g.id} style={styles.goalItem}>
                        <View style={styles.goalTop}>
                          <StropheText variant="body" style={{ fontWeight: '700', flex: 1 }}>{g.name}</StropheText>
                          <StropheText variant="dim" style={{ fontSize: 11 }}>
                            {Math.round(pct)}%
                          </StropheText>
                        </View>
                        <View style={styles.goalBar}>
                          <View style={[styles.goalFill, { width: `${pct}%` }]} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                          <StropheText variant="dim" style={{ fontSize: 11 }}>
                            {formatRp(g.current_amount)}
                          </StropheText>
                          <StropheText variant="dim" style={{ fontSize: 11 }}>
                            {formatRp(g.target_amount)}
                          </StropheText>
                        </View>
                        {g.deadline && (
                          <StropheText variant="dim" style={{ fontSize: 10, marginTop: 2 }}>
                            Target: {new Date(g.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </StropheText>
                        )}
                      </View>
                    );
                  })}
                </Card>
              )}

              {goals.length === 0 && (
                <Card style={styles.emptyCard}>
                  <StropheText variant="dim" style={{ textAlign: 'center' }}>
                    Belum ada tujuan tabungan. Tambahkan tujuan pertamamu.
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

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  header: { gap: Spacing.xs },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2 },

  summaryCard: { padding: Spacing.lg, gap: Spacing.md },
  summaryTop: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, gap: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  summaryAmt: { fontSize: FontSize.md, fontWeight: '800' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  balanceAmt: { fontSize: FontSize.lg, fontWeight: '900' },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  tabLabel: { fontSize: 12, fontWeight: '700', color: Colors.whiteDim },

  section: { gap: Spacing.sm },
  sectionLabel: { color: Colors.whiteDim, letterSpacing: 1.5 },

  expRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  expAmt: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },

  aiText: { color: Colors.whiteSecondary, lineHeight: 22 },

  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  txAmt: { fontSize: FontSize.sm, fontWeight: '700' },

  emptyCard: { paddingVertical: Spacing.xl, alignItems: 'center' },

  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  typeBtn: {
    flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  typeBtnDanger: { borderColor: Colors.danger, backgroundColor: '#1A0A0A' },
  typeBtnSuccess: { borderColor: Colors.success, backgroundColor: '#0A1A0F' },
  typeBtnLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.whiteDim },
  fieldLabel: { color: Colors.whiteDim, letterSpacing: 1 },
  textInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
  },

  goalItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 4 },
  goalTop: { flexDirection: 'row', alignItems: 'center' },
  goalBar: { height: 6, backgroundColor: Colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 3 },
});
