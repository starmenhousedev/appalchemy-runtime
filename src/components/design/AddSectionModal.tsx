import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../common/Button';
import { SECTION_TYPES } from '../../utils/constants';
import type { SectionType } from '../../types';

interface AddSectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (type: SectionType, title: string) => void;
  loading?: boolean;
}

const SECTION_ICONS: Record<string, string> = {
  banner: '🖼', video_banner: '🎬', youtube_video: '▶️', carousel: '🎠',
  image_marquee: '🏷', image_list: '📷', video_carousel: '🎥',
  image_collage: '🧩', countdown_timer: '⏱', faq: '❓', menu: '☰',
  rich_text: '📝', announcements: '📢', ticker: '📰', text_list: '📋',
  tabbed_product_list: '📑', product_grid: '⊞', previously_ordered: '🔄',
  product_list: '📦', recently_viewed: '👁', wishlisted_items: '♥',
};

const SECTION_CATEGORIES = [
  { label: 'Media', types: ['banner', 'video_banner', 'youtube_video', 'carousel', 'image_marquee', 'image_list', 'video_carousel', 'image_collage'] },
  { label: 'Products', types: ['product_grid', 'product_list', 'tabbed_product_list', 'previously_ordered', 'recently_viewed', 'wishlisted_items'] },
  { label: 'Content', types: ['rich_text', 'announcements', 'ticker', 'text_list', 'countdown_timer', 'faq', 'menu'] },
];

export function AddSectionModal({ visible, onClose, onAdd, loading }: AddSectionModalProps) {
  const [selectedType, setSelectedType] = useState<SectionType | null>(null);

  const handleAdd = () => {
    if (!selectedType) return;
    const label = SECTION_TYPES.find(s => s.value === selectedType)?.label || selectedType;
    onAdd(selectedType, label);
    setSelectedType(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Section</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={SECTION_CATEGORIES}
            keyExtractor={item => item.label}
            contentContainerStyle={styles.body}
            renderItem={({ item: category }) => (
              <View style={styles.categoryGroup}>
                <Text style={styles.categoryLabel}>{category.label}</Text>
                <View style={styles.typeGrid}>
                  {category.types.map(type => {
                    const sectionInfo = SECTION_TYPES.find(s => s.value === type);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeCard, selectedType === type && styles.typeCardActive]}
                        onPress={() => setSelectedType(type as SectionType)}>
                        <Text style={styles.typeIcon}>
                          {SECTION_ICONS[type] || '☐'}
                        </Text>
                        <Text
                          style={[styles.typeLabel, selectedType === type && styles.typeLabelActive]}
                          numberOfLines={2}>
                          {sectionInfo?.label || type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <Button title="Cancel" onPress={onClose} variant="ghost" />
            <Button
              title="Add Section"
              onPress={handleAdd}
              loading={loading}
              disabled={!selectedType}
            />
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
    borderTopRightRadius: borderRadius.xl, maxHeight: '85%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  closeBtn: { ...typography.h4, color: colors.textSecondary, padding: spacing.xs },
  body: { padding: spacing.lg },
  categoryGroup: { marginBottom: spacing.xl },
  categoryLabel: {
    ...typography.captionMedium, color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard: {
    width: '31%', alignItems: 'center', gap: 4,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  typeIcon: { fontSize: 20 },
  typeLabel: {
    ...typography.small, color: colors.textSecondary, textAlign: 'center',
  },
  typeLabelActive: { color: colors.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
});
