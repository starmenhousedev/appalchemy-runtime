export interface Palette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primarySoft: string;
  secondary: string;
  secondaryLight: string;

  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceSecondary: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  border: string;
  borderLight: string;
  divider: string;

  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  overlay: string;
  shadow: string;

  inputBg: string;
  drawerBg: string;
  drawerText: string;
  drawerActiveItem: string;
  drawerActiveBg: string;
  headerBg: string;
}

export const lightColors: Palette = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  primarySoft: 'rgba(108, 92, 231, 0.10)',
  secondary: '#00CEC9',
  secondaryLight: '#81ECEC',

  background: '#F8F9FA',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',

  text: '#212529',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  textInverse: '#FFFFFF',

  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  divider: '#F1F3F5',

  success: '#00B894',
  successLight: '#D4EDDA',
  warning: '#FDCB6E',
  warningLight: '#FFF3CD',
  error: '#E17055',
  errorLight: '#F8D7DA',
  info: '#74B9FF',
  infoLight: '#D1ECF1',

  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',

  inputBg: '#FFFFFF',
  drawerBg: '#FFFFFF',
  drawerText: '#212529',
  drawerActiveItem: '#6C5CE7',
  drawerActiveBg: 'rgba(108, 92, 231, 0.10)',
  headerBg: '#FFFFFF',
};

export const darkColors: Palette = {
  primary: '#8B7CF8',
  primaryLight: '#A29BFE',
  primaryDark: '#6C5CE7',
  primarySoft: 'rgba(139, 124, 248, 0.18)',
  secondary: '#00CEC9',
  secondaryLight: '#81ECEC',

  background: '#0F1115',
  backgroundElevated: '#171A21',
  surface: '#1C1F27',
  surfaceSecondary: '#252934',

  text: '#F1F3F5',
  textSecondary: '#9BA3AF',
  textTertiary: '#6B7280',
  textInverse: '#0F1115',

  border: '#2A2F3A',
  borderLight: '#222732',
  divider: '#222732',

  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.18)',
  warning: '#FCD34D',
  warningLight: 'rgba(252, 211, 77, 0.18)',
  error: '#F87171',
  errorLight: 'rgba(248, 113, 113, 0.20)',
  info: '#60A5FA',
  infoLight: 'rgba(96, 165, 250, 0.20)',

  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.6)',

  inputBg: '#1C1F27',
  drawerBg: '#13161D',
  drawerText: '#E5E7EB',
  drawerActiveItem: '#8B7CF8',
  drawerActiveBg: 'rgba(139, 124, 248, 0.18)',
  headerBg: '#171A21',
};

export const colors: Palette = lightColors;
