import React from 'react';
import { View, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../../components/ui/Icon';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const name = session?.user?.user_metadata?.display_name ?? '—';
  const email = session?.user?.email ?? '—';

  const handleSignOut = () => {
    Alert.alert('Keluar?', 'Kamu yakin mau keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.goldLine} />
        <StropheText variant="h2">Profil</StropheText>

        <Card style={styles.infoCard}>
          <StropheText variant="dim">NAMA</StropheText>
          <StropheText variant="body" style={{ marginTop: 4 }}>{name}</StropheText>

          <View style={styles.divider} />

          <StropheText variant="dim">EMAIL</StropheText>
          <StropheText variant="body" style={{ marginTop: 4 }}>{email}</StropheText>
        </Card>

        <TouchableOpacity onPress={() => router.push('/(app)/brutal-report')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="warning" size={20} color={Colors.danger} />
                <View>
                  <StropheText style={{ fontWeight: '700', color: Colors.white }}>Brutal Honesty Report</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>Laporan mingguan jujur berbasis data</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/compass')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.xl }} gold>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="target" size={20} color={Colors.gold} />
                <View>
                  <StropheText variant="gold" style={{ fontWeight: '700' }}>Kompas 5 Tahun</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>Nilai inti · Future Self · Blueprint</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.gold} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/stock-academy')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.xl }} gold>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="trophy" size={20} color={Colors.gold} />
                <View>
                  <StropheText variant="gold" style={{ fontWeight: '700' }}>Akademi Saham</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>6 modul · Analisis fundamental & teknikal</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.gold} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/mentor')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.xl }} gold>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="brain" size={20} color={Colors.gold} />
                <View>
                  <StropheText variant="gold" style={{ fontWeight: '700' }}>Global Mentor</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>Pilih mentor & baca wisdom harian</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.gold} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/diamond-vault')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.md }} gold>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="trophy" size={20} color={Colors.gold} />
                <View>
                  <StropheText variant="gold" style={{ fontWeight: '700' }}>Diamond Vault</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>Badge, refleksi, dan XP multiplier</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.gold} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/dictionary')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="book" size={20} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Kamus Pribadi</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>
                    Istilah yang sudah dijelaskan AI Coach
                  </StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/health')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="bolt" size={20} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Health Check-in</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>
                    Rekam kondisi fisik, mental, dan kulit
                  </StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/decision-journal')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="target" size={20} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Decision Journal</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>
                    Lacak keputusan harian dan polamu
                  </StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/ibadah')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="book" size={20} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Ibadah Harian</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>Shalat, Quran, dzikir</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/finance')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="cursor" size={20} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Keuangan</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>Catat transaksi dan tujuan finansial</StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/reflection')} activeOpacity={0.8}>
          <Card style={{ marginTop: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
                <Icon name="brain" size={20} color={Colors.whiteSecondary} />
                <View>
                  <StropheText variant="body" style={{ fontWeight: '600' }}>Riwayat Refleksi</StropheText>
                  <StropheText variant="dim" style={{ marginTop: 4 }}>
                    Refleksi per 10 level — lihat perkembanganmu
                  </StropheText>
                </View>
              </View>
              <Icon name="arrow-right" size={16} color={Colors.whiteDim} />
            </View>
          </Card>
        </TouchableOpacity>

        <Button
          label="Keluar"
          onPress={handleSignOut}
          variant="outline"
          style={{ marginTop: Spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2, marginBottom: Spacing.md },
  infoCard: { marginTop: Spacing.xl, gap: Spacing.xs },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
});
