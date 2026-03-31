import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PAGE_TYPES } from '../../utils/constants';
import type { PageType } from '../../types';

interface AddPageModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, type: PageType) => void;
  loading?: boolean;
}

const PAGE_TYPE_ICONS: Record<string, string> = {
  blank: '☐', product_collection: '⊞', blog: '✎', reels: '▶',
  tabbed_screen: '⊟', menu: '☰', web_view: '⊕',
};

export function AddPageModal({ visible, onClose, onAdd, loading }: AddPageModalProps) {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<PageType>('blank');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), selectedType);
    setTitle('');
    setSelectedType('blank');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Page</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Input
              label="Page Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Featured Products"
            />

            <Text style={styles.label}>PAGE TYPE</Text>
            <FlatList
              data={PAGE_TYPES}
              numColumns={2}
              keyExtractor={item => item.value}
              columnWrapperStyle={styles.typeRow}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.typeCard, selectedType === item.value && styles.typeCardActive]}
                  onPress={() => setSelectedType(item.value as PageType)}>
                  <Text style={styles.typeIcon}>{PAGE_TYPE_ICONS[item.value] || '☐'}</Text>
                  <Text style={[styles.typeLabel, selectedType === item.value && styles.typeLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.footer}>
            <Button title="Cancel" onPress={onClose} variant="ghost" />
            <Button title="Add Page" onPress={handleAdd} loading={loading} disabled={!title.trim()} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl, maxHeight: '80%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  closeBtn: { ...typography.h4, color: colors.textSecondary, padding: spacing.xs },
  body: { padding: spacing.lg },
  label: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  typeRow: { gap: spacing.sm, marginBottom: spacing.sm },
  typeCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  typeIcon: { fontSize: 16 },
  typeLabel: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  typeLabelActive: { color: colors.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
});
