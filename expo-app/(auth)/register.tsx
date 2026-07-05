import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { StropheText } from '../../components/ui/StropheText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Lengkapi semua field');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Gagal daftar', error.message);
    } else {
      Alert.alert(
        'Akun berhasil dibuat',
        'Cek email kamu untuk verifikasi, lalu masuk.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.goldLine} />
            <StropheText variant="h2">Buat Akun</StropheText>
            <StropheText variant="caption" style={styles.sub}>
              Titik balik dimulai dari sini.
            </StropheText>
          </View>

          <Card style={styles.form}>
            <StropheText variant="caption" style={styles.label}>NAMA LENGKAP</StropheText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nama kamu"
              placeholderTextColor={Colors.whiteDim}
              autoCapitalize="words"
            />

            <StropheText variant="caption" style={[styles.label, { marginTop: Spacing.md }]}>EMAIL</StropheText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@kamu.com"
              placeholderTextColor={Colors.whiteDim}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <StropheText variant="caption" style={[styles.label, { marginTop: Spacing.md }]}>PASSWORD</StropheText>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimal 8 karakter"
              placeholderTextColor={Colors.whiteDim}
              secureTextEntry
            />

            <Button
              label="Daftar Sekarang"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: Spacing.lg }}
            />
          </Card>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginLink}>
            <StropheText variant="dim">Sudah punya akun? </StropheText>
            <StropheText variant="gold">Masuk</StropheText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl },
  header: { marginBottom: Spacing.xl },
  goldLine: { width: 32, height: 3, backgroundColor: Colors.gold, borderRadius: 2, marginBottom: Spacing.md },
  sub: { marginTop: Spacing.xs, color: Colors.whiteSecondary },
  form: { gap: Spacing.xs },
  label: { color: Colors.whiteDim, letterSpacing: 1, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.white,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
});
