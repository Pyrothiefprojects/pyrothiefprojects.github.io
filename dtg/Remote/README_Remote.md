# Drift Remote

> **License:** Proprietary — not open source. All rights reserved. See [License](#license) for details.

Drift Remote is an iOS app that turns an iPhone into a Bluetooth Low Energy trackpad, keyboard, and media controller for macOS. No Wi-Fi, no pairing screen — connection is handled entirely over BLE using Apple's iCloud device trust.

---

## Current Status

| | Status |
|---|---|
| iPhone app | Beta — TestFlight |
| TestFlight | Live — internal testers |
| Apple Developer Program | Active |
| App Store release | In progress |

---

## Planned

| | |
|---|---|
| Widgets | Lock screen (iOS 16.6+), home screen interactive (iOS 17+), Control Center control (iOS 18+), Liquid Glass (iOS 26+) — post-1.0, triggers new App Review cycle |
| Keyboard shortcuts | Cmd+Space, Mission Control, screenshot, lock screen, app switcher — all via existing HID path |
| Windows / PC | BLE HID is fundamentally broken on Windows; viable path is WiFi + small companion app on the PC side — post-1.0 |
| Android | `BluetoothLeAdvertiser` + `BluetoothGattServer` via library — no Mac companion needed, full UI rebuild in Jetpack Compose |
| Presentation mode | Prev/Next slide, Esc, black/white screen, fullscreen — within media tab |

---

## Tech Stack

- **Language:** Swift
- **Framework:** SwiftUI
- **Bluetooth:** CoreBluetooth (CBPeripheralManager — iPhone as BLE HID peripheral)
- **HID:** Standard USB HID over GATT — mouse report, consumer control, keyboard report
- **IDE:** VS Code + Xcode
- **No third-party libraries** — no external dependencies

---

## Sections

### Trackpad

Full-screen gesture surface. Tap to click, two-finger scroll, drag support. Sensitivity adjustable via optional slider. Haptic feedback on click events.

---

### Keyboard

Full iOS keyboard forwarded as HID keystrokes to the connected Mac. Characters mapped through a `KeyCode` table covering standard ASCII, modifiers, and common special keys.

---

### Media Controls

HID Consumer Control report (Report ID 2). Supports: play/pause, next track, previous track, volume up/down, mute, brightness up/down.

---

### Device Manager

Sheet accessible from the top bar. Sections: Connected (swipe to rename, swipe to block), Disconnect, Pair New Device (broadcast mode), Nearby (background BLE scan with RSSI), Blocked. Devices persist across sessions via `deviceNames` dictionary in UserDefaults.

---

### Settings

- Sensitivity slider toggle
- Click buttons toggle
- Keep screen awake
- Haptics
- Connect to last device (auto-reconnect on foreground)

---

## Architecture

- Single `BLEMouseManager` (ObservableObject) — owns all CoreBluetooth state, HID report logic, device tracking
- `CBPeripheralManager` — iPhone advertises as HID peripheral; Mac connects as central
- `CBCentralManager` — background BLE scan for known/nearby devices
- Multi-subscriber support — `allSubscribers: [CBCentral]`, only `targetCentral` receives HID reports
- Top bar unified across all screens — scan button (state-aware), connected device name, mode toggle, settings gear
- Three modes: trackpad → keyboard → media (cycles via single button)
- `#if DEBUG || BETA` — file logging (`Documents/drift_remote.log`), dev report share sheet

---

## Distribution

**Bundle ID:** `com.pyrothiefprojects.Remote`

**Pushing a build to TestFlight:**
1. Xcode → scheme set to "Any iOS Device" → Product → Archive
2. Distribute App → App Store Connect → Upload
3. Wait 5–30 min for processing
4. Build appears automatically for all tester groups — no re-invitation needed

---

## Platform Ports

### Windows / PC

BLE HID is fundamentally broken on Windows — the OS stack requires OS-level pairing for HID over GATT, which is not achievable from the iPhone peripheral side via public APIs. The viable path is WiFi:

- iPhone sends mouse/keyboard commands over UDP/TCP on the local network
- A small Windows companion app (system tray, ~200–300 lines C# or C++) listens on a socket and calls `SendInput` (standard Win32 API — no driver signing, no admin rights)
- Tradeoff: breaks the "no companion app required" promise of the BLE approach
- App Store: requires `NSLocalNetworkUsageDescription`; ship BLE-only 1.0 first, add WiFi/Windows as a later update

### Android

BLE HID peripheral mode on Android uses `BluetoothLeAdvertiser` + `BluetoothGattServer` (not `BluetoothHidDevice` — that's classic Bluetooth only). Android marks HID UUIDs as `BLUETOOTH_PRIVILEGED`, so a third-party library is required (kshoji/BLE-HID-Peripheral-for-Android or BLESSED-Kotlin). No companion app needed on the Mac — it connects natively as a standard BLE HID host.

**Mac compatibility — functional but not seamless:**
- HID reports are identical — Mac handles them exactly the same as iOS
- No iCloud trust bypass — macOS may show a pairing prompt on first connect (suppressed by setting HID Information bonding flag to `0x00`, but not guaranteed on all macOS versions)
- Android rotates its BLE MAC address periodically for privacy — macOS sees the device as new after app restarts, causing "forget and reconnect" loops. iOS has a stable MAC tied to Apple ID trust, making reconnection seamless. This is the main UX difference.

**What maps cleanly:**
- HID report descriptors — identical bytes, same GATT service structure
- Mouse, keyboard, consumer control reports — no changes needed
- Multi-device targeting logic

**What needs rebuilding:**
- All UI — SwiftUI is Apple-only, full rewrite required (Jetpack Compose recommended)
- CoreBluetooth → `BluetoothLeAdvertiser` + `BluetoothGattServer` via library
- UserDefaults → SharedPreferences or DataStore
- iCloud trust handshake — no Android equivalent; first-connect pairing prompt likely
- Foreground Service required — OEM background killers (Samsung, Xiaomi, Huawei) will kill BLE without it

**Minimum:** API 21 (Android 5.0), API 26+ recommended for reliable GATT server.

---

## Key Decisions

- **BLE HID over WiFi** — no companion app required on the Mac, no pairing dialog, doesn't appear in Bluetooth settings
- **CBPeripheralManager (peripheral role)** — iPhone advertises as the HID device; Mac connects as central. Reverse of the typical BLE pattern
- **iCloud trust handshake** — connecting to a Mac on the same Apple ID skips the standard Bluetooth pairing prompt entirely
- **Standard HID over GATT** — mouse report (Report ID 1), consumer control (Report ID 2), keyboard report (Report ID 3). No custom protocol — any HID host works
- **`#if DEBUG || BETA` flag over separate targets** — file logging and share sheet compiled out entirely in Release builds. Single codebase, one build switch
- **No third-party libraries** — no external dependencies, no package manager

---

## License

Drift Remote is **not open source.**

All software, source code, assets, and tooling in this project are the exclusive property of Pyrothiefprojects.
The App Store version of this app is distributed under standard Apple App Store terms.
