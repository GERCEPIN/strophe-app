import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'STROPHE',
    subtitle: 'The Turning Point',
    body: 'Dari bahasa Yunani — titik balik.\nIni bukan aplikasi game. Ini sistem transformasi diri serius untuk orang dewasa.',
    accent: '01',
  },
  {
    id: '2',
    title: 'Bukan sekadar\nbelajar.',
    subtitle: 'Berubah.',
    body: 'Disiplin, insting, daya ingat, komunikasi, kesehatan, keuangan — semua dilatih setiap hari lewat sistem yang terukur.',
    accent: '02',
  },
  {
    id: '3',
    title: 'Level tanpa\nbatas.',
    subtitle: 'Progres nyata.',
    body: 'Tidak ada level maksimal. Tidak ada reset ke nol. Setiap hari, kamu selalu selangkah lebih maju dari kemarin.',
    accent: '03',
  },
  {
    id: '4',
    title: 'Siap memulai\ntitik balikmu?',
    subtitle: '',
    body: 'Butuh 10–15 menit per hari.\nKomitmen penuh. Progres nyata.',
    accent: '04',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace('/(auth)/register');
      return;
    }
    flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const handleSkip = () => router.replace('/(auth)/login');

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <StropheText style={styles.accentNumber}>{item.accent}</StropheText>
            <View style={styles.goldLine} />
            <StropheText variant="h1" style={styles.title}>{item.title}</StropheText>
            {item.subtitle ? (
              <StropheText variant="gold" style={styles.subtitle}>{item.subtitle}</StropheText>
            ) : null}
            <StropheText variant="body" style={styles.body}>{item.body}</StropheText>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <Button
          label={isLast ? 'Mulai Sekarang' : 'Lanjut'}
          onPress={handleNext}
          style={styles.btn}
        />

        {!isLast && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <StropheText variant="dim">Sudah punya akun? Masuk</StropheText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl * 1.5,
    justifyContent: 'center',
  },
  accentNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.bgElevated,
    letterSpacing: -2,
    marginBottom: Spacing.md,
  },
  goldLine: {
    width: 40,
    height: 3,
    backgroundColor: Colors.gold,
    marginBottom: Spacing.lg,
    borderRadius: 2,
  },
  title: { marginBottom: Spacing.sm, lineHeight: 44 },
  subtitle: { fontSize: FontSize.lg, marginBottom: Spacing.lg },
  body: { color: Colors.whiteSecondary, lineHeight: 26 },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.whiteDim,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.gold,
  },
  btn: {},
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
});
