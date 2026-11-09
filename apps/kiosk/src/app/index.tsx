import { formatCents } from '@opentotem/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Idle ("attract") screen. Day 5: categories, product grid and cart.
export default function IdleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Café Oeste</Text>
      <Pressable style={styles.cta} accessibilityRole="button">
        <Text style={styles.ctaText}>Toque para começar</Text>
      </Pressable>
      <Text style={styles.hint}>Combo do dia a partir de {formatCents(2490)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    backgroundColor: '#fff',
    padding: 32,
  },
  brand: { fontSize: 48, fontWeight: '700' },
  cta: {
    minHeight: 64,
    paddingHorizontal: 48,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#111827',
  },
  ctaText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  hint: { fontSize: 20, color: '#4b5563' },
});
