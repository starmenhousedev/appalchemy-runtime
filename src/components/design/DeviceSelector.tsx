import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { PreviewDevice } from '../../types';

const DEFAULT_DEVICES: PreviewDevice[] = [
  { id: 'iphone_15_pro', brand: 'Apple', model: 'iPhone 15 Pro', width: 393, height: 852, has_notch: true },
  { id: 'iphone_14', brand: 'Apple', model: 'iPhone 14', width: 390, height: 844, has_notch: true },
  { id: 'iphone_se', brand: 'Apple', model: 'iPhone SE', width: 375, height: 667, has_notch: false },
  { id: 'iphone_15_pro_max', brand: 'Apple', model: 'iPhone 15 Pro Max', width: 430, height: 932, has_notch: true },
  { id: 'samsung_s25_ultra', brand: 'Samsung', model: 'Galaxy S25 Ultra', width: 412, height: 915, has_notch: true },
  { id: 'samsung_s24', brand: 'Samsung', model: 'Galaxy S24', width: 360, height: 780, has_notch: true },
  { id: 'samsung_a15', brand: 'Samsung', model: 'Galaxy A15', width: 384, height: 854, has_notch: true },
  { id: 'pixel_9', brand: 'Google', model: 'Pixel 9', width: 412, height: 915, has_notch: true },
  { id: 'pixel_8a', brand: 'Google', model: 'Pixel 8a', width: 412, height: 892, has_notch: true },
];

interface DeviceSelectorProps {
  selectedDevice: PreviewDevice;
  onSelectDevice: (device: PreviewDevice) => void;
  devices?: PreviewDevice[];
}

export function DeviceSelector({
  selectedDevice,
  onSelectDevice,
  devices = DEFAULT_DEVICES,
}: DeviceSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const grouped = devices.reduce<Record<string, PreviewDevice[]>>((acc, d) => {
    if (!acc[d.brand]) acc[d.brand] = [];
    acc[d.brand].push(d);
    return acc;
  }, {});

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedDevice.model}
        </Text>
        <Text style={styles.selectorDims}>
          {selectedDevice.width}x{selectedDevice.height}
        </Text>
        <Text style={styles.chevron}>v</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Device</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.entries(grouped)}
              keyExtractor={([brand]) => brand}
              renderItem={({ item: [brand, brandDevices] }) => (
                <View style={styles.brandGroup}>
                  <Text style={styles.brandLabel}>{brand}</Text>
                  {brandDevices.map(device => (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        styles.deviceItem,
                        device.id === selectedDevice.id && styles.deviceItemActive,
                      ]}
                      onPress={() => {
                        onSelectDevice(device);
                        setModalVisible(false);
                      }}>
                      <Text
                        style={[
                          styles.deviceName,
                          device.id === selectedDevice.id && styles.deviceNameActive,
                        ]}>
                        {device.model}
                      </Text>
                      <Text style={styles.deviceDims}>
                        {device.width}x{device.height}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export { DEFAULT_DEVICES };

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  selectorText: {
    ...typography.captionMedium,
    color: colors.text,
    flex: 1,
  },
  selectorDims: {
    ...typography.small,
    color: colors.textTertiary,
  },
  chevron: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  closeButton: {
    ...typography.h4,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  brandGroup: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  brandLabel: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  deviceItemActive: {
    backgroundColor: colors.primary + '15',
  },
  deviceName: {
    ...typography.body,
    color: colors.text,
  },
  deviceNameActive: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  deviceDims: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
