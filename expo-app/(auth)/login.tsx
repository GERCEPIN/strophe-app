import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Isi email dan password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) Alert.alert('Gagal masuk', error.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <StropheText variant="h1" style={styles.brand}>STROPHE</StropheText>
          <StropheText variant="gold" style={styles.tagline}>The Turning Point</StropheText>
        </View>

        <Card style={styles.form}>
          <StropheText variant="caption" style={styles.label}>EMAIL</StropheText>
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
            placeholder="Password"
            placeholderTextColor={Colors.whiteDim}
            secureTextEntry
          />

          <Button
            label="Masuk"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: Spacing.lg }}
          />
        </Card>

        <TouchableOpacity onPress={() => router.replace('/(auth)/register')} style={styles.link}>
          <StropheText variant="dim">Belum punya akun? </StropheText>
          <StropheText variant="gold">Daftar</StropheText>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center', gap: Spacing.xl },
  header: { alignItems: 'center' },
  brand: { letterSpacing: 6, fontSize: 36, fontWeight: '900' },
  tagline: { marginTop: Spacing.xs, letterSpacing: 3, fontSize: FontSize.sm },
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
  link: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
});
