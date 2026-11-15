// Drift Remote's tutorial (drift.html), 3 of 5: the timings, the parts in order, and playing them from the menu

// The timings of Home, Connect and Selection (s from each one's start; what each step is, with the part, below)
var SPLASH_TIME = 11;   // Splash: the home page's tour, start to the HUD in the middle (about)
var H_SLIDE = 0.8;
var H_TRACE_FROM = 0.8, H_TRACE = 0.8;   // (Home's; Connect's and Settings' run from 0 over both)
var H_GO_FROM = 1.0, H_GO = 0.6;
var H_CIRCLE_FROM = 1.6, H_GATHER = 0.8;
var H_BACK_FROM = 2.8, H_BACK = 0.9;
var H_SPIN = Math.PI * 6;   // radians a second: three times round
var TRAIL = 0.45;           // radians each ghost lags the one ahead, strung out
var C_SLIDE = 0.8;
var C_SPLIT_FROM = 0.8, C_SPLIT = 0.9;
var C_TRAVEL_FROM = 1.8, C_TRAVEL = 2.0;   // (the longest route; the rest at its speed)
var APPEAR_TIME = 0.35;
var SEL_GREEN = 1.0, SEL_FILL = 0.4;
var SEL_FADE_FROM = 0.6, SEL_FADE = 0.6;
var SEL_POINTER_FROM = 1.6;
var SEL_REBUILD_FROM = SEL_POINTER_FROM + 3.2, SEL_REBUILD = 1.0;
var SEL_CYCLE_FROM = SEL_REBUILD_FROM + SEL_REBUILD + 0.2, SEL_STEP = 0.5;
var SEL_CYCLE = [1, 2, 3, 0, 1];   // laptop, Mac, HomePod, iPad, laptop
var SEL_END_FROM = SEL_CYCLE_FROM + SEL_STEP * SEL_CYCLE.length, SEL_END = 1.2;   // back to the start (below)
var WALK_GROW = 0.9;                       // Walkthrough: the iPhone growing to a phone screen's size
var WALK_MOVE_FROM = 0.5, WALK_MOVE = 1.1;
var WALK_COG = 0.7;                        // the cog's size in the row, against the other two
var WALK_MERGE_FROM = WALK_MOVE_FROM + WALK_MOVE + 0.2, WALK_MERGE = 0.8;   // the drift icon collapsing to one pointer
// Device row's start, from Walkthrough's end (what each step is, with the part, below)
var D_HOLD = 1.0;   // (the list held, as Device list left it)
var D_SHRINK_FROM = D_HOLD, D_SHRINK = 0.9;
var D_GHOSTS_FROM = D_SHRINK_FROM + D_SHRINK, D_GHOSTS = 0.6;
var D_START = D_GHOSTS_FROM + D_GHOSTS;
// Screen sharing: clicking the connection icon (the list coming up over S_LIST after), the screen sharing switch,
// then the MacBook's screen-sharing icon (each [when it's clicked], getting there over S_GO, pressing it over S_PRESS); the phone over
// and the MacBook made (S_LINK); the screen icon pulsing on it and the list, the pointer going back; then the list
// going over to the shared screen
var S_GO = 0.6, S_PRESS = 0.3;
var S_CLICK_LIST = 1.1, S_LIST = 0.6;
var S_CLICK_TOGGLE = 2.9;   // screen sharing switched on (the screen-sharing icon showing)
var S_CLICK_SHARE = 4.4;
var S_LINK_FROM = 4.9, S_LINK = 1.2;
var S_PULSE_FROM = S_LINK_FROM + S_LINK + 0.1, S_PULSE = 0.8, S_PULSES = 2;   // the screen icon pulsing (each S_PULSE)
var S_BACK_FROM = S_PULSE_FROM + 0.3, S_BACK = 0.7;
var S_HOME_FROM = S_PULSE_FROM + S_PULSE * S_PULSES, S_HOME = 0.6;   // the list going over to the shared screen
// Shared trackpad: the screen icon pulsing (S_PULSES of S_PULSE); the pointer to the trackpad's middle (over S_GO) and
// a figure of eight there (CS_PLAY); then the cycler clicked (at CS_CYCLE; there over S_GO, back over S_BACK after)
var CS_PULSE_FROM = 0.2;
var CS_PLAY_FROM = CS_PULSE_FROM + S_PULSE * S_PULSES + 0.6, CS_PLAY = 2.8;
var CS_CYCLE = CS_PLAY_FROM + CS_PLAY + S_GO + 0.1;
// Landscape: turned sideways (over L_TURN); the dock coming up; each click on the picture ([what, when, its dock
// icon]); back to the middle (L_BACK); turned upright
var L_TURN_FROM = 0.3, L_TURN = 0.8;
var L_DOCK_FROM = L_TURN_FROM + L_TURN - 0.2;
var L_CLICKS = [["dock", 2.2, 1], ["dock", 3.6, 3], ["window", 5.0]];
var L_BACK_FROM = 5.6, L_BACK = 0.7;
var L_UNTURN_FROM = L_BACK_FROM + L_BACK + 0.2;
// Disconnect: the connection icon clicked (the list coming up over X_LIST after), then Disconnect (X_CLICK_OFF);
// disconnecting over X_GONE; the pointer back
var X_CLICK_LIST = 1.1, X_LIST = 0.6;
var X_CLICK_OFF = 2.8;
var X_GONE_FROM = X_CLICK_OFF + 0.3, X_GONE = 1.0;
var X_BACK_FROM = X_CLICK_OFF + 0.5;
// …then the pointer's ghosts out of it again (X_GHOSTS), held a second, and everything flying apart into a sphere
// (X_BURST) — the home page's sphere coming in over it: Splash's
var X_GHOSTS_FROM = X_GONE_FROM + X_GONE + 0.2, X_GHOSTS = 0.6;
var X_BURST_FROM = X_GHOSTS_FROM + X_GHOSTS + 1.0, X_BURST = 1.6;
// List: the connection icon clicked (getting there over S_GO; the list coming up over E_LIST after); the pointer back
var E_CLICK = 1.1, E_LIST = 0.6;
var E_BACK_FROM = E_CLICK + S_PRESS + 0.3;
// Selection's end, picking the laptop (from when the phone starts growing, with the list in it): the laptop clicked
// (P_ROW, once the pointer's collapsed to one); connecting (from P_JOIN, over J_LINK, as Screen sharing does)
var P_ROW = WALK_MERGE_FROM + WALK_MERGE + 0.2 + S_GO, P_JOIN = P_ROW + 0.3;
var J_LINK = 1.2;
// Trackpad: the pointer out to the trackpad's edge, once round it, and back
var T_GO_FROM = 0.5, T_GO = 0.7;
var T_ROUND_FROM = T_GO_FROM + T_GO, T_ROUND = 2.0;
var T_BACK_FROM = T_ROUND_FROM + T_ROUND, T_BACK = 0.7;
// Media: the pointer on the touchscreen; then it's handed over to the buttons about to be pressed (its stars
// flying to them over M_OUT); each pressed ([its icon, when]) — pressing in over M_PRESS, flashing green over
// M_FLASH; then the pointer made again from them (over M_BACK)
var M_PLAY_FROM = 0.8, M_PLAY = 2.4, M_LEAVE = 0.5;   // (the shared screen: out to the picture over S_GO before, back after)
// (the buttons' part, from the handing over to the last press, twice as quick as it was)
var M_OUT_FROM = 3.8, M_OUT = 0.45;
var M_CLICKS = [["playpause.fill", 4.4], ["speaker.minus.fill", 5.15], ["arrow.up.left.and.arrow.down.right", 5.9]];
var M_PRESS = 0.15, M_FLASH = 0.3;
var M_BACK_FROM = 6.6, M_BACK = 0.9;   // (once the Mac's window has filled its screen)
var M_UNLINK_FROM = M_BACK_FROM + M_BACK + 0.3, M_UNLINK = 1.0;   // (Media's end: the connection undone, as Selection made it)
// Keyboard: the same — handed over to the keys, each typed ([its label, when]), popping up over K_PRESS and
// flashing green over K_FLASH, then the pointer made again
var K_OUT_FROM = 0.4, K_OUT = 0.9;
var K_KEYS = [["h", 1.6], ["i", 1.95], ["space", 2.4], ["m", 2.8], ["o", 3.1], ["m", 3.4]];
var K_PRESS = 0.25, K_FLASH = 0.45;
var K_BACK_FROM = 3.9, K_BACK = 0.9;
// Shared keyboard: as Keyboard, then the cycler clicked
var CK_CYCLE = K_BACK_FROM + K_BACK + 0.2 + S_GO;
// Shared media: as Media, then the cycler clicked (back to the trackpad)
var CM_CYCLE = M_BACK_FROM + M_BACK + 0.2 + S_GO;
var SEL_DEPART = 0.6;   // s over which the drift icon's dots set off from the devices (each then flies GHOST_FLY)
var LAPTOP = 1;

// ---------------- The tutorial ----------------
// Its parts, in order. Each has a name (listed top left; a click plays just that one) and a length (s); it sets
// things going when it starts (begin) and, if it needs to, moves them along as it plays (step(t), t s in).
// Its dialog (dialog, shown by dialog.js): each line's moment (at: s in, or a function giving it), its words, where it
// goes (where) and the real seconds the scene's held still for it (pause; moving: not held — on screen that long, the
// scene going on) — gone once that's up, or at until (s in;
// Infinity: the part's end); one with no pause stays on, the scene going on, till the part's next line or its end. A
// line with no words is just a pause (its note saying what for, in #edit's Dialog menu)
// ▶ Play plays them all, one after another — all but the staging ones (staging: the icons, for working on), which
// come after a gap in the list and only play on their own, and any still being built (wip). A part within the one
// above it (sub) is tabbed in under it — further (sub: 2) for one within one of those
var PARTS = [
    {
        // Splash: the home page itself, as pyrothief.ca/#drift plays it — the flame clicked, in through it, Drift Remote
        // picked from the projects, its HUD coming to the middle (the picture Intro starts on)
        name: "Splash", length: SPLASH_TIME,
        // (done once the home page says its HUD's settled in the middle — however long it took to load; SPLASH_TIME's about
        // right, and 6 s past it, it's done anyway)
        done: function (t) { return splashArrived || t >= SPLASH_TIME + 6; },
        dialog: [
            { at: 0, pause: 2, note: "On the sphere, before the flame's clicked" }   // (its tour waiting as long: splash, below)
        ],
        begin: function () {
            showAll();
            blank = true;
            splashArrived = false;
            splash(true);
        }
    },
    {
        // From the whole HUD: every letter but the name's types itself away, then the arms draw back into the
        // icon as the name fades out, leaving just the iPhone of stars
        name: "Intro", length: RETRACT_TEXT + RETRACT_NAME + 0.2,
        dialog: [
            { at: 0, pause: 5, note: "The HUD, centred, before it draws back" },   // (Splash's end held: the HUD a while longer)
            { at: RETRACT_TEXT + RETRACT_NAME, where: "aboveBigPhone", pause: 0, text: "" }   // (as the iPhone's left on its own: words to come)
        ],
        begin: function () {
            showAll();
            retractFrom = clock;
        },
        // (the home page's header and dots, carried on from Splash: faded out as the HUD draws back)
        step: function (t) { if (t > 0.05) backdropFade(); }
    },
    {
        // Home (being built): from the intro's end — the iPhone moves down and shrinks into a small iPhone icon at
        // the bottom, leaving the drift icon behind, a trace growing between them; the drift icon goes and circles
        // the small icon very fast; then the phone grows back out the same way, leaving the small icon there, and
        // the drift icon goes back into it (the trace's stars too): the intro's end, with the home icon below
        name: "Home", length: H_BACK_FROM + H_BACK + 0.2,
        dialog: [
            { at: H_CIRCLE_FROM, where: "aboveBigPhone", pause: 3, text: "This is your phone, your remote... you are here." }
        ],
        begin: function () {
            if (cameFrom !== "Intro") introDone();
            homeFrom = clock;
        }
    },
    {
        // Settings: Connect's trip, mirrored — from Home's end (the home icon below), the phone slides left,
        // leaving the drift icon behind; a trace grows from it to the settings cog's place on the right, where the
        // drift icon goes and sits just below it as the cog gathers; then back to the middle, the cog staying, turning
        name: "Settings", length: H_BACK_FROM + H_BACK + 0.2,
        dialog: [   // (once the pointer's sitting below the cog, gathered: its pause held there)
            { at: H_CIRCLE_FROM + H_GATHER, where: "aboveBigPhone", pause: 0, text: "These are settings you can use to change the look, feel and behavior of your remote." }
        ],
        begin: function () {
            if (cameFrom !== "Home") introDone();
            homeFrom = null;      // (Home ends where this starts)
            homeIcon = true;      // the home icon, below
            settingsFrom = clock;
        }
    },
    {
        // Connect: from Settings' end (the home icon below, the cog on the right) — the phone slides right, leaving the drift icon behind; a trace grows from it
        // to the connection icon's place, where the drift icon goes and sits just below it as the icon gathers and
        // starts broadcasting; then back to the middle, the icon still broadcasting
        name: "Connect", length: H_BACK_FROM + H_BACK + 0.2,
        dialog: [   // (once the pointer's sitting below the connection icon, gathered: its pause held there)
            { at: H_CIRCLE_FROM + H_GATHER, where: "aboveBigPhone", pause: 0, text: "This is where you can connect to other devices" }
        ],
        begin: function () {
            if (cameFrom !== "Settings") introDone();
            settingsFrom = null;  // (Settings ends where this starts)
            homeIcon = true;
            cog = true;           // the cog, from here on
            linkFrom = clock;
        }
    },
    {
        // Walkthrough (being built): from Connect's end (the three icons out — home below, the cog right, the
        // connection icon left) — the iPhone grows to the size of a phone's screen round the drift icon (which
        // stays as it is, in the middle), and the three icons come apart and together again inside it, in a row
        // along its top: the connection icon top left, the cog top right, the home icon just beside the cog; then the
        // drift icon collapses in on itself, its pointers sliding together into its middle, leaving one, no ghosts
        name: "Walkthrough", length: WALK_MERGE_FROM + WALK_MERGE + 0.3,
        dialog: [
            { at: WALK_MERGE_FROM + WALK_MERGE, where: "walkMiddle", pause: 2, text: "Welcome to Drift Remote 0.9!" }
        ],
        begin: function () {
            introDone();          // (Connect ends the same: the drift icon in the phone, in the middle)
            homeIcon = true;
            cog = true;
            broadcast = true;
            walkFrom = clock;
        }
    },
    {
        // Within Walkthrough: the list — from Walkthrough's end, the pointer clicks the connection icon and the device
        // list comes up in the big phone (its words as lines; nothing connected yet: the devices nearby)
        name: "Device list", length: E_BACK_FROM + S_BACK + 0.3, sub: true,
        dialog: [
            { at: E_CLICK - S_GO, where: "bigPhoneTop", pause: 2, text: "Begin by clicking the connection icon - it will present a list of devices." },
            { at: E_CLICK + E_LIST, where: "belowList", pause: 2, text: "Select your device from the list" }
        ],
        begin: function () { walkDone(); rcScreen = "list"; listFrom = clock; }
    },
    {
        // Within Walkthrough: the device row — from Device list's end (the list open in the big phone, the pointer on its
        // own in the middle), held a second; then the phone shrinks back to its size, the list going,
        // the connection icon going back to its place low on the left (home and the cog breaking up and fading),
        // the pointer back to the middle, and its ghosts come back out of it. Then the phone slides to the bottom,
        // leaving the drift icon behind, the line between them tracing out of its top; the pointers split into a
        // row, then each phases along its own route (traced behind it) to its device: faintest to the iPad …
        // brightest to the HomePod
        name: "Device row", length: D_START + C_TRAVEL_FROM + C_TRAVEL + APPEAR_TIME + 0.3, sub: true,
        dialog: [
            { at: D_START, where: "abovePhoneSmall", pause: 3.5, moving: true, text: "So far Drift Remote can connect with the following devices" },
            { at: function () { return D_START + dialog.arrive(0); }, where: "aboveDevice:0", until: Infinity, text: "iPad" },
            { at: function () { return D_START + dialog.arrive(1); }, where: "aboveDevice:1", until: Infinity, text: "MacBook" },
            { at: function () { return D_START + dialog.arrive(2); }, where: "aboveDevice:2", until: Infinity, text: "Mac" },
            { at: function () { return D_START + dialog.arrive(3); }, where: "aboveDevice:3", until: Infinity, text: "HomePod" },
            { at: D_START + C_TRAVEL_FROM + C_TRAVEL + APPEAR_TIME, pause: 2, note: "Held once the last device is in" }
        ],
        begin: function () {
            introDone();
            broadcast = true;     // the connection icon, broadcasting, from here on (once it's back in its place)
            clickFrom = clock;
            connectFrom = clock + D_START;
        }
    },
    {
        // Within Walkthrough: from the device list's end — the laptop chosen, joined to the iPhone in green; a pointer
        // in each one's screen, moving exactly alike, changing together to a keyboard and a music note; the notes
        // rebuilding the device list; the green going round it, device to device; then back to the middle, and on
        // into the big phone as Walkthrough has it (its three icons in the row along the top, one pointer), the list
        // in it (as Device row shrank it); then the laptop's picked: connected, the MacBook out to the left —
        // Trackpad's start
        name: "Selection", length: SEL_END_FROM + SEL_END + P_JOIN + J_LINK + 0.6, sub: true,
        dialog: [
            { at: 0, where: "devicesBand", pause: 2, text: "Connect to a device" },
            { at: SEL_GREEN, where: "devicesBand", pause: 0, until: SEL_REBUILD_FROM, text: "You now control that device" },
            { at: SEL_REBUILD_FROM, where: "devicesBand", pause: 2, until: SEL_CYCLE_FROM, text: "You can control many devices at once" },
            { at: SEL_CYCLE_FROM, where: "devicesBand", pause: 0, until: SEL_END_FROM, text: "Switch devices seamlessly" },
            { at: SEL_END_FROM + SEL_END + WALK_GROW, where: "belowList", pause: 0, text: "Choose your device from the list" },
            { at: SEL_END_FROM + SEL_END + P_JOIN + J_LINK, where: "trackpad", pause: 2, text: "You are connected!" }
        ],
        begin: function () {
            if (cameFrom !== "Device row") {
                introDone();
                broadcast = true;
                connectFrom = clock - 100;   // (the device list long since done)
            }
            selectFrom = clock;
        },
        step: function (t) {
            if (t < SEL_END_FROM + SEL_END || walkFrom !== null) return;
            introDone();          // (back in the middle: as Walkthrough starts, but with only the connection icon out)
            broadcast = true;
            walkBare = true;
            walkFrom = clock;
            rcScreen = "trackpad";   // (its screen showing once they've connected)
            pickFrom = clock;        // (the list coming in as it grows)
            joinFrom = clock + P_JOIN;
        }
    },
    {
        // Within Selection: the remote's screens — Walkthrough's end, the big phone showing each one's layout as the
        // app has it upright, the device icon in the row the remote type's (as the cycler shows it), and the MacBook
        // it's working out to the left, joined in green. Not in ▶ Play yet. Trackpad: the pointer goes round the
        // trackpad's edge and back, the Mac's pointer going round its screen's edge the same
        // (from Selection's end: connected)
        name: "Trackpad", length: T_BACK_FROM + T_BACK + 0.3, sub: 2,
        dialog: [
            { at: 0.3, where: "bigPhoneScreen", pause: 0, text: "Use Drift Remote to control your target's trackpad!" }
        ],
        begin: function () { walkDone(); rcScreen = "trackpad"; trackFrom = clock; }
    },
    {
        // Keyboard types: the pointer handed over to the keys, "hi mom" typed on them, each popping up and flashing
        // green, and a line coming up on the Mac's screen as if it were typed there; then the pointer made again
        name: "Keyboard", length: K_BACK_FROM + K_BACK + 0.3, sub: 2,
        dialog: [
            { at: 0.3, where: "bigPhoneScreen", pause: 0, text: "Use Drift Remote to control your target's keyboard!" }
        ],
        begin: function () { walkDone(); rcScreen = "keyboard"; keysFrom = clock; }
    },
    {
        // Media plays: the pointer on the touchscreen (the Mac's pointer doing the same); then, handed over to the
        // buttons, play/pause pressed (flashing on the Mac's screen), volume down (so does it) and full screen (the
        // Mac's window filling its screen), each flashing green; then the pointer made again from them; then the
        // connection undone (Selection's, the other way round: the MacBook gone into the line, the line drawn back into
        // the connection icon, the phone back in the middle at its size) — Walkthrough's end, where Screen sharing starts
        name: "Media", length: M_UNLINK_FROM + M_UNLINK + 0.3, sub: 2,
        dialog: [
            { at: 0.3, where: "bigPhoneScreen", pause: 0, text: "Use Drift Remote to control your target's media!" }
        ],
        begin: function () { walkDone(); rcScreen = "media"; mediaFrom = clock; }
    },
    {
        // Within Walkthrough: screen sharing — from Walkthrough's end, the pointer clicks the connection icon and the
        // device list comes up in the big phone; it clicks the MacBook's screen-sharing icon; the phone moves over and
        // a green line goes out, making the MacBook (connected, sharing — the icon turning green); the screen icon
        // pulses on its screen and the list as the pointer goes back; then the list goes over to the shared screen
        // (as Shared trackpad, below). Not in ▶ Play yet
        name: "Screen sharing", length: S_HOME_FROM + S_HOME + 0.3, sub: true,
        dialog: [
            { at: S_CLICK_LIST - S_GO, where: "bigPhoneTop", pause: 2, text: "Share the screen of your target with your remote" },
            { at: S_CLICK_LIST + S_LIST, where: "belowList", pause: 0, text: "Make sure screen sharing is toggled on" },
            { at: S_CLICK_TOGGLE + 0.4, where: "belowList", pause: 2, text: "On a MacBook: System Settings \u203a General \u203a Sharing \u203a Screen Sharing." },
            { at: S_CLICK_SHARE - S_GO, where: "belowList", pause: 2, until: S_HOME_FROM, text: "Select the screen sharing icon" },
            // (as the list goes over to the shared layout: on 3 s, not holding it, on into Shared trackpad as its icons flash)
            { at: S_HOME_FROM, where: "trackpad", pause: 3, moving: true, text: "You're now sharing your screen to your remote!" }
        ],
        begin: function () { walkDone(); rcScreen = "share"; shareFrom = clock; }
    },
    {
        // Within Screen sharing: the shared screen (the app's Cast upright: the Mac's screen across the top, Cast's
        // keys, the trackpad), the MacBook connected out to the left — the screen icon pulsing on the picture and the
        // MacBook, then gone; the pointer on the trackpad, the Mac's pointer the same on both; then it clicks the
        // cycler: Keyboard
        name: "Shared trackpad", length: CS_CYCLE + S_PRESS + 0.1 + S_BACK + 0.3, sub: 2,
        dialog: [
            { at: 0.3, where: "trackpad", pause: 2, text: "Use the trackpad to control your device" }
        ],
        begin: function () { walkDone(); rcScreen = "cast"; castPart = "screen"; castFrom = clock; },
        step: function (t) { if (t >= CS_CYCLE + 0.15) castSection = "keyboard"; }
    },
    {
        // Within Screen sharing: the shared screen on Keyboard — typed as Keyboard is, the line coming up on the picture and the
        // MacBook alike; then the cycler clicked: Media
        name: "Shared keyboard", length: CK_CYCLE + S_PRESS + 0.1 + S_BACK + 0.3, sub: 2,
        dialog: [
            { at: 0.3, where: "aboveKeys", pause: 2, text: "Control keyboard" }
        ],
        begin: function () { walkDone(); rcScreen = "cast"; castSection = "keyboard"; castPart = "keys"; keysFrom = clock; },
        step: function (t) { if (t >= CK_CYCLE + 0.15) castSection = "media"; }
    },
    {
        // Within Screen sharing: the shared screen on Media — the pointer on the picture itself (a trackpad too), the Mac's pointer
        // the same; then the buttons, as Media, each showing on the picture and the MacBook alike (the typing still
        // there, from Shared keyboard); then the cycler clicked: back to the trackpad
        name: "Shared media", length: CM_CYCLE + S_PRESS + 0.1 + S_BACK + 0.3, sub: 2,
        dialog: [
            { at: 0.15, where: "aboveKeys", pause: 0, until: CM_CYCLE - S_GO, text: "The remote's display is also a trackpad, use it to control the device's pointer alongside a media remote to play content" }
        ],
        begin: function () {
            walkDone();
            rcScreen = "cast";
            castSection = "media";
            castPart = "media";
            mediaFrom = clock;
            keysFrom = clock - 100;   // (long since typed)
        },
        step: function (t) { if (t >= CM_CYCLE + 0.15) castSection = "trackpad"; }
    },
    {
        // Within Screen sharing: the shared screen sideways — from the trackpad, the phone turns and the landscape
        // view takes over (the picture filling it, Cast's keys down the side, no top bar); the Mac's dock comes up;
        // the pointer clicks on the picture — a dock icon (its window opening), another, then the first window
        // (brought forward), all on the MacBook too; then it's turned upright again
        name: "Landscape", length: L_UNTURN_FROM + L_TURN + 0.3, sub: 2,
        dialog: [
            { at: L_TURN_FROM + L_TURN, where: "aboveLandscape", pause: 0, until: L_UNTURN_FROM, text: "Rotate your remote for a landscaped experience" }
        ],
        begin: function () {
            walkDone();
            rcScreen = "cast";
            castPart = "land";
            landFrom = clock;
            keysFrom = mediaFrom = clock - 100;   // (Shared media's end: the typing there, the window filling the screen)
        }
    },
    {
        // Disconnect: from the shared screen, the pointer clicks the connection icon and the list comes up; it clicks
        // Disconnect — the green line draws back, the MacBook goes, the phone comes back to the middle at its size and
        // the list goes: Walkthrough's end; the pointer goes back; its ghosts come back out of it, and a second on,
        // everything flies apart, its stars building the sphere (sphere.html, plain: Pyrosphere's, without the effects)
        name: "Disconnect", length: X_BURST_FROM + X_BURST + 0.3,
        dialog: [
            { at: 0.3, where: "trackpad", pause: 2, until: X_GHOSTS_FROM, text: "Disconnect from devices anytime from the connect screen" }
        ],
        begin: function () { walkDone(); rcScreen = "off"; offFrom = clock; sphere(); if (visiting) preloadHome(); },
        step: function (t) {
            if (visiting && t >= X_BURST_FROM + X_BURST + 0.2) goHome();   // (the visitors' end: the home screen, over it)
            if (t < X_BURST_FROM || sphereFrom) return;
            catchStars = true;
            splashFrame.classList.remove("on");   // (the stars behind fading, as these build the sphere)
        }
    },
    {
        // Just the devices' icons, no HUD: each gathers into its place in a row from across the screen, one after
        // another, left to right — iPad, laptop, iPhone, Apple TV, HomePod
        name: "Devices", length: 2.0, staging: true,
        begin: function () {
            showAll();
            rowFrom = clock;
            ROW.forEach(function (key, i) {
                scatter(SHAPES[key]);
                SHAPES[key].gatherFrom = clock + 0.1 + i * 0.12;
            });
        }
    },
    {
        // Every icon, in a grid under its group's title (scroll if it runs off the screen), gathering in one
        // after another
        name: "Icons", length: 2.5, staging: true,
        begin: function () {
            showAll();
            gridFrom = clock;
            scroller.scrollTop = 0;
            scatter(FEATURE);
            FEATURE.gatherFrom = clock + 0.1;
            var n = 1;
            GRID.forEach(function (group) {
                group.icons.forEach(function (sh) {
                    scatter(sh);
                    sh.gatherFrom = clock + 0.1 + n++ * 0.025;
                });
            });
        }
    },
    {
        // The sphere on its own page (Pyrosphere: to play with, moving to music)
        name: "Pyrosphere", length: 0.1, staging: true,
        begin: function () { window.location.href = "drift/pyrosphere.html"; }
    }
];
var clock = 0;            // the page's time (s)
var ambient = 0;          // …and a time that goes on through a line's pause (the cog turning, the connection icon
                          // broadcasting), held only when it's all paused (▶ Play's ❚❚, the show's song)
var rowFrom = -1;         // when the devices' row began (Devices: no HUD), or -1: the iPhone with its HUD
var gridFrom = -1;        // when the icons' grid began (Icons: no HUD), or -1
var connectFrom = null;   // when the pointers began to come out of the iPhone (Connect; can be before the page
                          // opened), or null
var blank = true;         // nothing played yet: the page is empty
var linkFrom = null;      // when Home began (can be before the page opened), or null
var settingsFrom = null;  // when Settings began, or null
var walkFrom = null;      // when Walkthrough began, or null
var walkBare = false;     // Walkthrough's grow, from Selection's end: no cog or home icon out before it
var castPart = null;      // what the shared screen's playing ("screen", "keys", "media"), or null
var castSection = "trackpad";   // what's under its keys, as its cycler has it
var listFrom = null;      // when Device list began, or null
var joinFrom = null;      // when the laptop's connecting (Selection's end), or null
var pickFrom = null;      // when Selection's end began picking the laptop, or null
var offFrom = null;       // when Disconnect began, or null
var landFrom = null;      // when Landscape began, or null
var castFrom = null;      // when Shared trackpad began, or null
var shareFrom = null;     // when Screen sharing began to play, or null
var trackFrom = null;     // when Trackpad began to play, or null
var keysFrom = null;      // when Keyboard began to type, or null
var mediaFrom = null;     // when Media began to play, or null
var rcScreen = null;      // the remote's screen in the big phone ("trackpad", "keyboard", "media"), or null
var clickFrom = null;     // when Device row's start (the click, in Walkthrough's big phone) began, or null
var homeFrom = null;      // when Home began, or null
var homeIcon = false;     // the home icon (the small iPhone) stays, below, from Home's end on
var selectFrom = null;    // when Selection began, or null
var cameFrom = null;      // the part played just before this one, in ▶ Play (null on its own)
var hudFrom = -100;       // when the HUD began to draw itself in (long ago: it's all there)
var retractFrom = null;   // when it began to retract (the intro; can be before the page opened), or null
var playing = -1;         // the part playing (its place in PARTS), or -1
var partFrom = 0;         // when it started
var playAll = false;      // ▶ Play: on to the next part when one ends
// As the intro leaves it: the iPhone, its HUD gone, the drift icon in it
function introDone() {
    showAll();
    retractFrom = clock - 100;   // (long since: all gone, the icon made)
}
// As Walkthrough leaves it: the big phone, its three icons in the row along the top, one pointer in the middle
function walkDone() {
    introDone();
    homeIcon = true;
    cog = true;
    broadcast = true;
    walkFrom = clock - 100;   // (long since)
}
// The home page, over the tutorial's own (Splash): loaded afresh each time, so its tour plays from the start; gone with
// anything else
var splashFrame = document.getElementById("splash");
var splashHeld = false;   // (the visitors' link: the home page already up, its tour held till Splash starts it)
var frameIs = null;       // what's in it: "tour" (Splash's), "backdrop" (the stars, behind everything), or null
function splash(on, held) {   // (its tour waiting as long as Splash's first pause, on the sphere, before the flame's clicked)
    var wait = PARTS[0].dialog[0].pause;
    if (splashHeld) {   // (held: kept, not loaded again — Splash's start tells its tour to go)
        if (!on) return;
        splashHeld = false;
        splashFrame.contentWindow.postMessage({ drift: "go", wait: wait }, "*");
        return;
    }
    if (!on) return backdrop();   // (anything else: the stars behind it)
    splashFrame.classList.add("on");
    splashFrame.classList.remove("behind");
    splashFrame.src = "index.html?splash=" + Date.now() + "#drift&splash" + (held ? "&hold" : wait ? "&wait=" + wait : "");
    frameIs = "tour";
}
// The stars behind everything else: the home page inside its sphere and nothing more of it (index.html#backdrop) — or, as
// Splash ends, its own page, there already, told to become that (so the stars go on just as they were). Dimmed, behind
// the picture; the pointer handed down to it, so the stars part round it as they do inside on the home page
function backdrop() {
    if (splashHeld) return;
    if (frameIs === "tour") { try { splashFrame.contentWindow.becomeBackdrop(); } catch (err) {} }
    else if (frameIs !== "backdrop") splashFrame.src = "index.html?backdrop=" + Date.now() + "#backdrop";
    frameIs = "backdrop";
    splashFrame.classList.add("on", "behind");
}
function backdropFade() {   // (the home page's header and dots, carried on from Splash, faded out: Intro's draw-back)
    if (frameIs === "backdrop") try { splashFrame.contentWindow.backdropFade(); } catch (err) {}
}
function handDown(e) {   // (your pointer, to the spheres in the frames: Splash's, the stars behind, Disconnect's)
    [splashFrame, sphereFrame].forEach(function (frame) {
        if (!frame.classList.contains("on")) return;
        try { if (e) frame.contentWindow.userPoint(e.clientX, e.clientY); else frame.contentWindow.userLeave(); } catch (err) {}
    });
}
document.addEventListener("pointermove", handDown);
document.documentElement.addEventListener("pointerleave", function () { handDown(null); });
var splashArrived = false;   // (the home page has said its HUD's settled in the middle: Splash done)
window.addEventListener("message", function (e) {
    if (e.source === splashFrame.contentWindow && e.data && e.data.drift === "splash-done") splashArrived = true;
});
// …or the sphere (drift/sphere.html: Pyrosphere's, plain), for Disconnect's end: loaded as Disconnect starts, over the
// picture but clear till it's built. As the picture bursts, every star it's drawing just then is caught (sphereFrom:
// each [across, down, colour, alpha, radius]) and handed over, and the picture's no longer drawn: the sphere's own stars
// start just there, as they looked, and fly apart to build it
var sphereFrom = null;      // (read by sphere.html, from its frame)
var catchStars = false;     // (the burst's moment: the next frame's stars to be caught)
var sphereFrame = document.getElementById("sphereFrame");
// The visitors' link, at the end: pyrothief.ca's own home screen — loaded unseen as Disconnect starts (#arrive: at rest,
// no flying in), faded in over the sphere once it's built; then the address is the home page's (a reload, or a link
// from there, is the site itself), and it's theirs to use, the song playing out
var homeFrame = document.getElementById("homeFrame"), wentHome = false;
function preloadHome() {
    wentHome = false;
    homeFrame.classList.remove("on");
    homeFrame.src = "index.html?home=" + Date.now() + "#arrive";
}
function goHome() {
    if (wentHome) return;
    wentHome = true;
    homeFrame.classList.add("on");
    setTimeout(function () {   // (faded in: the rest let go, the address the home page's)
        [sphereFrame, splashFrame].forEach(function (frame) { frame.classList.remove("on"); frame.src = "about:blank"; });
        frameIs = null;
        try { history.replaceState(null, "", location.pathname.replace(/drift\.html$/, "")); } catch (err) {}
        try { document.title = homeFrame.contentDocument.title; } catch (err) {}
        homeFrame.focus();
    }, 1000);
}
function sphere() {
    sphereFrom = null;
    catchStars = false;
    sphereFrame.classList.add("on");
    sphereFrame.src = "drift/sphere.html?" + Date.now();
}
// The whole Drift Remote HUD, as the intro starts: the iPhone gathered, the HUD drawn, no row
function showAll() {
    splash(false);
    if (sphereFrame.classList.contains("on")) {   // (Disconnect's sphere gone)
        sphereFrame.classList.remove("on");
        sphereFrame.src = "about:blank";
    }
    sphereFrom = null;   // (the picture drawn again)
    catchStars = false;
    SHAPES.iphone.gatherFrom = -100;
    hudFrom = -100;
    retractFrom = null;
    rowFrom = -1;
    gridFrom = -1;
    connectFrom = null;
    linkFrom = null;
    selectFrom = null;
    settingsFrom = null;
    homeFrom = null;
    walkFrom = null;
    walkBare = false;
    rcScreen = null;
    mediaFrom = null;
    keysFrom = null;
    trackFrom = null;
    shareFrom = null;
    castPart = null;
    castSection = "trackpad";
    castFrom = null;
    landFrom = null;
    offFrom = null;
    listFrom = null;
    joinFrom = null;
    pickFrom = null;
    clickFrom = null;
    broadcast = false;
    cog = false;
    homeIcon = false;
}
var partButtons = PARTS.map(function (part, i) {
    if (part.staging && !(PARTS[i - 1] || {}).staging) {   // a gap before the staging parts
        var gap = document.createElement("div");
        gap.className = "gap";
        document.getElementById("parts").appendChild(gap);
    }
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = part.name;
    if (part.sub) b.className = part.sub > 1 ? "sub sub" + part.sub : "sub";   // within the part above it
    b.addEventListener("click", function () { playPart(i, false); });
    document.getElementById("parts").appendChild(b);
    return b;
});
// The tutorial's next part after i (skipping the staging ones), or -1
function nextPart(i) {
    for (var n = i + 1; n < PARTS.length; n++) if (!PARTS[n].staging && !PARTS[n].wip) return n;
    return -1;
}
// ▶ Play: as a visitor starts it — the menus away, the home page's sphere up, its tour held (to play with), and a click on
// it begins the run with Music; the menus back once it's done (Escape: stopped, or not begun after all)
var asVisitor = false;
document.getElementById("play").addEventListener("click", function (e) {
    e.stopPropagation();   // (not this click: the next one, on the sphere)
    playing = -1;
    playAll = false;
    partButtons.forEach(function (b) { b.classList.remove("on"); });
    tutorial.classList.remove("away");
    showAll();
    blank = true;
    asVisitor = true;
    document.body.classList.add("visiting");
    splash(true, true);
    splashHeld = true;
});
function unvisit() {   // (▶ Play's visitor's run over: the menus back, the stars behind again)
    if (!asVisitor) return;
    asVisitor = false;
    document.body.classList.remove("visiting");
    splashHeld = false;
}
function visit() {   // (the visitors' click: on the page, or on a sphere in the frame)
    if (!(visiting || asVisitor) || document.body.classList.contains("watching")) return;
    musicButton.setAttribute("aria-pressed", "true");
    startRun();
}
function startRun() {   // (▶ Play, and the visitors' click: with Music, once the song's really playing, so they start together)
    watching(true);
    var go = function () { if (document.body.classList.contains("watching") && playing < 0) playPart(nextPart(-1), true); };
    if (musicButton.getAttribute("aria-pressed") === "true") show.whenPlaying(go);
    else go();
}
// ▶ Play watched as it is: the menu out of the way till it's done, the show's player small (to pause it) — with the song
// from the start, if Music's on (off each visit). A click (but on the player) or Escape stops it
var musicButton = document.getElementById("withMusic");
musicButton.addEventListener("click", function () {
    musicButton.setAttribute("aria-pressed", musicButton.getAttribute("aria-pressed") === "true" ? "false" : "true");
});
function watching(on) {
    document.body.classList.toggle("watching", on);
    show.along(on && musicButton.getAttribute("aria-pressed") === "true");
    show.watch(on);
    if (!on) unvisit();
}
// The link for visitors (drift.html#watch): the home page's sphere, as Splash starts, its tour held — to play with, as on
// the home page (the frame takes the mouse till then) — and a click on it (so the browser lets the song play: the sphere
// calls visit, in the click itself) begins the whole run with Music, as ▶ Play has it, the tour going on from that moment
// in the same frame. No menus, no editor, no player; nothing stops it (Space pauses). At the end it's on the sphere,
// to play with too: a click, and it's from the start again
var visiting = location.hash === "#watch";
if (!visiting) backdrop();   // (the stars there from the start)
if (visiting) {
    document.body.classList.add("visiting");
    splash(true, true);
    splashHeld = true;
}
document.addEventListener("click", visit);   // (a click: what browsers count as leave to play the song)
function stopWatching(e) {
    if (visiting) return;   // (the visitors' link: nothing stops it)
    if (asVisitor) {   // (▶ Play's, as a visitor's: only Escape stops it — or, not begun yet, puts it all back)
        if (e.type !== "keydown" || e.key !== "Escape") return;
        if (!document.body.classList.contains("watching")) { unvisit(); showAll(); return; }
    }
    if (!document.body.classList.contains("watching") || (e.type === "keydown" && e.key !== "Escape")) return;
    if (e.type === "pointerdown" && e.target.closest && e.target.closest("#player")) return;   // (its player: to pause it)
    playing = -1;
    playAll = false;
    partButtons.forEach(function (b) { b.classList.remove("on"); });
    tutorial.classList.remove("away");
    watching(false);
    if (frameIs === "tour") backdrop();   // (stopped in Splash: its page the stars behind again)
}
document.addEventListener("pointerdown", stopWatching, true);
document.addEventListener("keydown", stopWatching, true);
var tutorial = document.getElementById("tutorial");
// A menu moved by its grip (handle), anywhere on the screen and kept on it — this one, the show's player, #edit's Dialog.
// Where it's put lasts till the page is loaded again
function movable(el, handle) {
    handle.addEventListener("pointerdown", function (e) {
        if (e.target.closest && e.target.closest("button, input")) return;   // (its own buttons still buttons)
        e.preventDefault();
        var r = el.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
        el.style.left = r.left + "px";
        el.style.top = r.top + "px";
        el.style.right = el.style.bottom = "auto";
        el.style.transform = "none";
        if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
        function move(ev) {
            el.style.left = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, ev.clientX - sx)) + "px";
            el.style.top = Math.max(0, Math.min(window.innerHeight - 24, ev.clientY - sy)) + "px";
        }
        function up() {
            handle.removeEventListener("pointermove", move);
            handle.removeEventListener("pointerup", up);
            handle.removeEventListener("pointercancel", up);
        }
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", up);
        handle.addEventListener("pointercancel", up);
    });
}
movable(tutorial, document.getElementById("menuGrip"));
function playPart(i, all, from) {   // (from: the part it follows, if it's not the one playing — the show's scenes)
    cameFrom = from !== undefined ? from : all && playing >= 0 ? PARTS[playing].name : null;
    tutorial.classList.add("away");
    blank = false;
    playing = i;
    playAll = all;
    partFrom = clock;
    PARTS[i].begin();
    partButtons.forEach(function (b, n) { b.classList.toggle("on", n === i); });
}
function stepParts() {
    if (playing < 0) return dialog.step();   // (anything still showing, going)
    var part = PARTS[playing];
    var t = clock - partFrom;
    if (part.step) part.step(t);
    dialog.step();
    if (part.done ? !part.done(t) : t < part.length) return;   // (done: a part that says when it's over)
    if (playAll && nextPart(playing) >= 0) {
        playPart(nextPart(playing), true);
    } else {
        playing = -1;
        partButtons.forEach(function (b) { b.classList.remove("on"); });
        tutorial.classList.remove("away");
        // (▶ Play done: the controls back — or with Music, once the song's done, the sphere up till then)
        if (document.body.classList.contains("watching") && !show.along()) watching(false);
    }
}
