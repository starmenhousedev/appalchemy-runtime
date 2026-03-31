import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Input } from '../../components/common/Input';

export function ThemeCodeScreen({
  route,
  navigation,
}: {
  route: { params: { themeId: number } };
  navigation: any;
}) {
  const { themeId } = route.params;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    loadCode();
  }, []);

  const loadCode = async () => {
    try {
      const data = await themesApi.getCode(themeId);
      setCode(data.code || '');
    } catch {
      showToast('error', 'Failed to load theme code');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await themesApi.updateCode(themeId, code);
      showToast('success', 'Theme code saved');
    } catch {
      showToast('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Theme Code</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Edit the raw theme code. Be careful — invalid changes may break your theme.
        </Text>
      </View>

      <ScrollView style={styles.editorContainer}>
        <Input
          value={code}
          onChangeText={setCode}
          multiline
          numberOfLines={50}
          style={styles.codeInput}
          containerStyle={styles.codeContainer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: '#333', backgroundColor: '#252526',
  },
  headerTitle: { ...typography.h4, color: '#CCC' },
  infoBar: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: '#2D2D30', borderBottomWidth: 1, borderBottomColor: '#333',
  },
  infoText: { ...typography.caption, color: '#999' },
  editorContainer: { flex: 1 },
  codeInput: {
    fontFamily: 'monospace', fontSize: 12, color: '#D4D4D4',
    lineHeight: 20, minHeight: 600, textAlignVertical: 'top',
    backgroundColor: '#1E1E1E',
  },
  codeContainer: { margin: 0, marginBottom: 0 },
});
