import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

type Trend = 'up' | 'down' | 'neutral';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: Trend;
  trendValue?: string;
  icon?: string;
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  onPress?: () => void;
  style?: ViewStyle;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  trendValue,
  icon,
  accent = 'primary',
  onPress,
  style,
}: StatCardProps) {
  const theme = useTheme();
  const accentColor = theme.colors[accent] ?? theme.colors.primary;

  const trendColor =
    trend === 'up'
      ? theme.colors.success
      : trend === 'down'
      ? theme.colors.error
      : theme.colors.textSecondary;
  const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '–';

  const Wrapper: React.ElementType = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        theme.shadows.sm,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}>
      <View style={styles.row}>
        <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={1}>
          {label.toUpperCase()}
        </Text>
        {icon ? (
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: accentColor + '22', borderRadius: theme.borderRadius.sm },
            ]}>
            <Text style={[styles.iconText, { color: accentColor }]}>{icon}</Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[theme.typography.h2, { color: theme.colors.text, marginTop: theme.spacing.xs }]}
        numberOfLines={1}>
        {value}
      </Text>
      {(hint || trendValue) && (
        <View style={[styles.row, { marginTop: theme.spacing.xs }]}>
          {trendValue ? (
            <Text style={[theme.typography.caption, { color: trendColor, marginRight: theme.spacing.xs }]}>
              {trendSymbol} {trendValue}
            </Text>
          ) : null}
          {hint ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  iconText: { fontSize: 14, fontWeight: '700' },
});
