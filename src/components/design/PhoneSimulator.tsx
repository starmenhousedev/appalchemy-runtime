import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SectionRenderer } from './SectionRenderer';
import { BottomBarPreview } from './BottomBarPreview';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { PreviewDevice } from '../../types';
import type { Section } from '../../types';
import type { BottomBarItem } from '../../types';

interface PhoneSimulatorProps {
  device: PreviewDevice;
  sections: Section[];
  bottomBarItems: BottomBarItem[];
  pageName?: string;
  scale?: number;
}

const SIMULATOR_MAX_HEIGHT = 580;

export function PhoneSimulator({
  device,
  sections,
  bottomBarItems,
  pageName,
  scale: scaleProp,
}: PhoneSimulatorProps) {
  const aspectRatio = device.width / device.height;
  const frameHeight = SIMULATOR_MAX_HEIGHT;
  const frameWidth = frameHeight * aspectRatio;
  const scale = scaleProp || Math.min(1, frameWidth / device.width);

  const screenWidth = frameWidth - 16;
  const screenHeight = frameHeight - (device.has_notch ? 72 : 40);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.phoneFrame,
          {
            width: frameWidth,
            height: frameHeight,
            borderRadius: device.has_notch ? 40 : 24,
          },
        ]}>
        {/* Status bar area */}
        {device.has_notch ? (
          <View style={styles.notchArea}>
            <View style={styles.notch} />
            <View style={styles.statusBar}>
              <Text style={styles.statusTime}>9:41</Text>
              <View style={styles.statusIcons}>
                <View style={styles.signalIcon} />
                <View style={styles.wifiIcon} />
                <View style={styles.batteryIcon} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.classicStatusBar}>
            <Text style={styles.statusTime}>9:41</Text>
          </View>
        )}

        {/* Page name header */}
        {pageName && (
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderText}>{pageName}</Text>
          </View>
        )}

        {/* Screen content */}
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.screenContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled>
          {sections.length > 0 ? (
            sections
              .filter(s => s.is_visible)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(section => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  screenWidth={screenWidth}
                />
              ))
          ) : (
            <View style={styles.emptyScreen}>
              <Text style={styles.emptyText}>No sections</Text>
              <Text style={styles.emptySubtext}>
                Add sections to build this page
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom navigation bar */}
        {bottomBarItems.length > 0 && (
          <BottomBarPreview items={bottomBarItems} />
        )}

        {/* Home indicator */}
        {device.has_notch && <View style={styles.homeIndicator} />}
      </View>

      {/* Device label */}
      <Text style={styles.deviceLabel}>{device.model}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  phoneFrame: {
    backgroundColor: '#1C1C1E',
    padding: 8,
    overflow: 'hidden',
  },
  notchArea: {
    height: 44,
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 120,
    height: 32,
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 10,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  statusTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalIcon: {
    width: 14,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
    opacity: 0.8,
  },
  wifiIcon: {
    width: 12,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
    opacity: 0.8,
  },
  batteryIcon: {
    width: 20,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
    opacity: 0.8,
  },
  classicStatusBar: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageHeader: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  pageHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  screenContent: {
    paddingBottom: 8,
  },
  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#FFF',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 6,
    opacity: 0.3,
  },
  deviceLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
