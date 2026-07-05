import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useDictionary } from '../../hooks/useDictionary';

export default function DictionaryScreen() {
  const router = useRouter();
  const { entries, loading, searchEntries } = useDictionary();
  const [query, setQuery] = useState('');

  const filtered = searchEntries(query);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-left" size={16} color={Colors.gold} />
          <StropheText variant="gold">Kembali</StropheText>
        </TouchableOpacity>
        <View style={styles.goldLine} />
        <StropheText variant="h2">Kamus Pribadi</StropheText>
        <StropheText variant="caption" style={{ marginTop: 4 }}>
          {entries.length} istilah tersimpan
        </StropheText>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Cari istilah..."
          placeholderTextColor={Colors.whiteDim}
        />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <StropheText variant="dim">Memuat kamus...</StropheText>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="book" size={40} color={Colors.whiteDim} />
          <StropheText variant="body" style={{ textAlign: 'center', marginTop: Spacing.md }}>
            {query ? 'Istilah tidak ditemukan.' : 'Belum ada istilah tersimpan.'}
          </StropheText>
          <StropheText variant="caption" style={{ textAlign: 'center', marginTop: 8 }}>
            Ketuk istilah bergaris emas di Sesi Inti untuk menambah ke kamus.
          </StropheText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <StropheText variant="gold" style={styles.entryTerm}>{item.term}</StropheText>
                {item.source_level && (
                  <View style={styles.levelBadge}>
                    <StropheText style={styles.levelBadgeText}>LVL {item.source_level}</StropheText>
                  </View>
                )}
              </View>
              <View style={styles.divider} />
              <StropheText variant="body" style={styles.entryExplanation}>
                {item.simple_explanation}
              </StropheText>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2, marginBottom: Spacing.md },

  searchRow: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  searchInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.md },
  entryCard: { gap: Spacing.sm },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryTerm: { fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  levelBadge: {
    backgroundColor: Colors.borderGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  levelBadgeText: { fontSize: 10, color: Colors.gold, fontWeight: '700', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.border },
  entryExplanation: { color: Colors.whiteSecondary, lineHeight: 22 },
});
