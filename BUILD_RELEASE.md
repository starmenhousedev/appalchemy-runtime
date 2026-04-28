# Building AppEngineX for Play Store and App Store

This document covers releasing the **AppEngineX builder app itself** to Google Play and Apple App Store.

> **Per-merchant app builds are a separate problem.** This doc builds the one builder
> app. Each merchant publishing their own custom-branded shopping app to the stores
> from inside AppEngineX requires a different pipeline (see "Per-merchant builds"
> at the bottom).

---

## 1. Android — release AAB / APK

### One-time setup: generate a release keystore

The release keystore signs the AAB Google Play publishes. **Lose this and you can never update the app on Play Store again.** Back it up.

```bash
keytool -genkeypair -v \
  -keystore appenginex-release.keystore \
  -alias appenginex \
  -keyalg RSA -keysize 2048 -validity 10000
```

Answer the prompts (org name, country, etc.). Choose strong passwords. Move the file to:

```
android/app/appenginex-release.keystore
```

(`.gitignore` already excludes `*.keystore` so it won't be committed.)

### One-time setup: tell Gradle about the keystore

Put credentials in your **user-level** `gradle.properties`, NOT the repo's:

- Windows: `C:\Users\<you>\.gradle\gradle.properties`
- macOS / Linux: `~/.gradle/gradle.properties`

Add:

```properties
MYAPP_RELEASE_STORE_FILE=appenginex-release.keystore
MYAPP_RELEASE_KEY_ALIAS=appenginex
MYAPP_RELEASE_STORE_PASSWORD=<keystore-password>
MYAPP_RELEASE_KEY_PASSWORD=<key-password>
```

These properties are picked up automatically by `android/app/build.gradle`. If they aren't set, the release build falls back to the debug keystore — fine for local testing, **rejected by Play Store**.

### Bump version before each release

In [`android/app/build.gradle`](android/app/build.gradle#L82-L87):

```groovy
versionCode 2     // Must increment by at least 1 every Play Store upload.
versionName "1.1" // User-visible version string.
```

### Build the AAB (recommended for Play Store)

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Upload that file to Play Console → Production → Create release.

### Build an APK (for sideloading / non-Play distribution)

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Sanity check the build

```bash
# Verify it's signed with your release key, not the debug key:
keytool -printcert -jarfile android/app/build/outputs/apk/release/app-release.apk
# The "Owner:" line should match the values you entered when creating the keystore.
```

---

## 2. iOS — release IPA

**Building iOS requires macOS + Xcode.** You cannot build iOS apps from Windows.

You have three options:

### Option A — Build on a Mac

1. Open `ios/AppEngineX.xcworkspace` in Xcode (note: `.xcworkspace`, not `.xcodeproj`, after running `pod install`).
2. Set the team in Signing & Capabilities to your Apple Developer team.
3. Bump `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` (build number).
4. Product → Archive.
5. Window → Organizer → Distribute App → App Store Connect.

You'll need:
- Apple Developer Program membership ($99/yr).
- An App ID in developer.apple.com matching your bundle identifier.
- Distribution certificate + provisioning profile (Xcode can manage these automatically).

### Option B — EAS Build (easiest if you don't own a Mac)

Sign up at expo.dev/eas. From your project root:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p ios --profile production
```

EAS runs the build on Expo's macOS infrastructure and gives you back an `.ipa`. Free tier: limited builds/month; paid plans available.

### Option C — GitHub Actions macOS runner

Create `.github/workflows/ios-release.yml` running `runs-on: macos-14` with Fastlane / `xcodebuild`. Free for public repos, costs Action minutes for private. More setup, but free-tier-friendly long-term.

For all three: Apple Developer membership and signing certs are required regardless.

---

## 3. Before submitting to either store — checklist

These items are required by the stores' review processes:

### App Store / Play Store metadata
- [ ] App name, short description, full description
- [ ] Screenshots: at least 5 per device family (iPhone 6.7", iPhone 5.5", iPad 12.9" for App Store; phone + 7" tablet + 10" tablet for Play)
- [ ] Privacy policy URL (publicly hosted, mandatory for both stores)
- [ ] Support URL / contact email
- [ ] Content rating questionnaire answered
- [ ] App icon (1024×1024 PNG, no transparency, no rounded corners — the stores apply their own masks)

### Shopify-specific (for App Store / Play, not Shopify App Store)
- [ ] If your app talks to Shopify on behalf of merchants, the merchant Shopify install/auth happens **inside the app** via WebView (already implemented in [`OAuthWebViewScreen.tsx`](src/screens/auth/OAuthWebViewScreen.tsx)).
- [ ] Apple's policy 4.7 / Google's policy require that any merchant who installs the app can **fully use it** without external sign-up. The current "enter shop domain" flow satisfies this.

### App Store specifically
- [ ] App Tracking Transparency prompt declared in `Info.plist` (`NSUserTrackingUsageDescription`) if you ever read IDFA.
- [ ] Sign-in-with-Apple available **if** you offer any other third-party sign-in (we currently only do Shopify, which is fine).

### Play Store specifically
- [ ] Data safety form completed (what data the app collects, how it's used, sharing).
- [ ] Target API level meets Google's annual requirement (currently 34 / Android 14 — verify against Play Console at submission time).

---

## 4. Per-merchant app builds (NOT covered here)

If your goal is "every merchant who finishes editing in AppEngineX gets their own custom-branded APK + IPA published to their own Play / App Store account," that's a different system entirely. It requires:

1. **A build orchestrator** that takes a merchant's theme JSON + assets, generates a customized native project, builds + signs it, and uploads to each merchant's own developer account.
2. **Per-merchant signing keys**, per-merchant Apple Developer / Play Console memberships (these can't be shared — Google and Apple require each app live under the merchant's own account).
3. **A queue worker** consuming the existing `Build` table on the backend and actually producing artifacts. The current backend writes a `queued` row and never picks it up — see [`appbuilder/src/controllers/PublishController.js`](https://analytics.deodap.in/api/publish) for context.

Realistic scope: 2–4 weeks of focused infrastructure work (Fastlane lanes for iOS + Android, an EC2 macOS-stadium / dedicated Mac mini farm or EAS Build credits, signing-key vault, store-API submission integration). Apps like Shopify's own Shop Mini, Tapcart, Vajro all run this kind of pipeline.

When you're ready to build that, decide:
- **iOS hosting**: rented Mac mini ($150/mo at MacStadium) or EAS Build subscription.
- **Build tooling**: Fastlane (most flexible, lots of code) or EAS Build (managed, less control).
- **Signing strategy**: managed-signing per merchant (you hold the keys) or merchant-supplied keys (each merchant uploads their own keystore + cert).

I can scaffold any of those when you're ready.

---

## 5. Quick reference

| Task | Command |
|---|---|
| Generate Android release keystore | `keytool -genkeypair -v -keystore appenginex-release.keystore -alias appenginex -keyalg RSA -keysize 2048 -validity 10000` |
| Build Android AAB for Play Store | `cd android && ./gradlew bundleRelease` |
| Build Android APK for sideload | `cd android && ./gradlew assembleRelease` |
| Build iOS via EAS | `eas build -p ios --profile production` |
| Verify APK signing | `keytool -printcert -jarfile path/to/app-release.apk` |

If a release build fails complaining about the JS bundle, run `cd android && ./gradlew clean` first.
