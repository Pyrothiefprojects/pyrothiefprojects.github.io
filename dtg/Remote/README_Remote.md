# Remote

> **License:** Proprietary — not open source. All rights reserved. See [License](#license) for details.

Remote is an iOS app that turns an iPhone into a Bluetooth Low Energy trackpad, keyboard, and media controller for macOS. No Wi-Fi, no pairing screen — connection is handled entirely over BLE using Apple's iCloud device trust.

---

## Current Status

| | Status |
|---|---|
| iPhone app | Beta — TestFlight |
| TestFlight | Live — internal testers |
| Apple Developer Program | Active |
| App Store release | In progress |

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
- `#if DEBUG` — file logging (`Documents/sneaky_remote.log`), dev report share sheet

---

## Distribution

**Bundle ID:** `com.pyrothiefprojects.Remote`

**Pushing a build to TestFlight:**
1. Xcode → scheme set to "Any iOS Device" → Product → Archive
2. Distribute App → App Store Connect → Upload
3. Wait 5–30 min for processing
4. Build appears automatically for all tester groups — no re-invitation needed

---

## License

Remote is **not open source.**

All software, source code, assets, and tooling in this project are the exclusive property of Pyrothiefprojects.
The App Store version of this app is distributed under standard Apple App Store terms.
