# Sahayak Sathi - Android Application

This directory contains the ready-to-build Android Studio project for **Sahayak Sathi** (सहायक साथी).

## Quick Install (Pre-built APK)
You do not need to build Android Studio if you just want to install the app on your phone:
- **`SahayakSathi.apk`** is located in the root of this project and in `public/SahayakSathi.apk`.
- You can install it on your Android phone using USB Debugging / ADB:
  ```bash
  adb install -r SahayakSathi.apk
  ```

## Opening in Android Studio
1. Open Android Studio.
2. Select **File -> Open** and navigate to the `android/` folder in this workspace.
3. Wait for Gradle to sync dependencies.
4. Click **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
5. The freshly signed APK will be output in `app/build/outputs/apk/debug/app-debug.apk`.
