// Minimal typing for `process.env` used by config.ts. The RN Metro bundler
// inlines these at build time (Expo: vars prefixed with EXPO_PUBLIC_; bare
// RN: vars wired via babel-plugin-transform-inline-environment-variables or
// react-native-config). No runtime `process` exists; this is build-time
// substitution.
declare const process: {
  env: Record<string, string | undefined>;
};
