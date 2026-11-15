// Drift Remote's tutorial (drift.html), 4 of 5: drawing each part — the trips, Device row, Selection, Walkthrough

// ---------------- Drawing ----------------
// An icon's dots around (cx, cy), size px across, gathered in as far as their time says
// (greenFill 0 → 1: green from the bottom up, as a device is chosen — Selection)
function drawShape(sh, cx, cy, size, w, h, alpha, greenFill) {
    var form = reducedMotion ? 1 : Math.max(0, 1 - Math.exp(-(clock - sh.gatherFrom) * 4.2));   // 0 → 1
    if (form < 0.002) return;
    for (var k = 0; k < sh.offsets.length; k++) {
        var o = sh.offsets[k];
        var from = sh.from[k];
        var tx = cx + o[0] * size, ty = cy - o[1] * size;
        if (sh.spread && o.length > 3) {   // (the feature's pointers, pulled apart about their middle)
            var m = o[3] - (sh.layerCount - 1) / 2;
            tx += m * SPREAD_X * sh.spread * size;
            ty -= m * SPREAD_Y * sh.spread * size;
        }
        var x = from.x * w + (tx - from.x * w) * form;
        var y = from.y * h + (ty - from.y * h) * form;
        // Ice blue, a slow wave cascading down it; each dot shimmering a little out of step with the next
        var wave = 0.5 - o[1] + 0.12 * Math.sin(clock * 1.6 + o[1] * 7);
        var r = 3.2 * (1 + 0.22 * Math.sin(clock * 2.4 + k * 0.6)) * Math.min(1, size / 200 + 0.35);
        var bright = form * (o.length > 2 ? o[2] : 1) * (alpha === undefined ? 1 : alpha);   // (a ghost's dots are fainter)
        starDot(x, y, greenFill > 0 && o[1] + 0.5 <= greenFill ? GREEN : iceRGB(wave), bright, r);
    }
}

// The grid: as many columns as fit, each group starting a new row under its title, below the tutorial's list;
// scrolled with the page (only what's on screen is drawn). The page's height follows it
var scroller = document.getElementById("scroller");
var spacer = document.getElementById("spacer");
function overFeature(e) {
    var b = FEATURE.box;
    return !!b && e.clientX >= b.minX && e.clientX <= b.maxX && e.clientY >= b.minY && e.clientY <= b.maxY;
}
scroller.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    FEATURE.hover = overFeature(e);
    scroller.style.cursor = FEATURE.hover ? "pointer" : "";
});
scroller.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "touch") FEATURE.hover = false;
});
scroller.addEventListener("click", function (e) {   // a tap (a phone has no pointing)
    if (overFeature(e) && !matchMedia("(hover: hover)").matches) FEATURE.hover = !FEATURE.hover;
});
function drawGrid(w, h) {
    var cell = w <= 600 ? 96 : 128;
    var size = cell * 0.56;
    var cols = Math.max(3, Math.floor((w - 32) / cell));
    var left = (w - cols * cell) / 2;
    var y = (w <= 600 ? 150 : 40) - scroller.scrollTop;
    var top = y;
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
    // The drift icon, in a row of its own: point at it (or tap it) to pull its pointers apart
    y += 34;
    g.font = "600 11px Orbitron, sans-serif";
    g.fillStyle = "#ff8a3d";
    g.fillText("THE DRIFT ICON — POINT AT IT", left + 8, y);
    y += 14;
    var fx = left + cell / 2, fy = y + cell * 0.42;
    drawShape(FEATURE, fx, fy, size, w, h);
    FEATURE.box = { minX: fx - cell / 2, maxX: fx + cell / 2, minY: fy - cell / 2, maxY: fy + cell / 2 };
    g.font = "8px Orbitron, sans-serif";
    g.fillStyle = "rgba(245, 245, 245, 0.5)";
    g.textAlign = "center";
    g.fillText(FEATURE.name, fx, fy + size * 0.62 + 12, cell - 8);
    g.textAlign = "left";
    y += cell;
    GRID.forEach(function (group) {
        // the group's title, in the HUD's orange
        y += 34;
        g.font = "600 11px Orbitron, sans-serif";
        g.fillStyle = "#ff8a3d";
        g.fillText(group.title.toUpperCase(), left + 8, y);
        y += 14;
        group.icons.forEach(function (sh, i) {
            var col = i % cols;
            if (i > 0 && col === 0) y += cell;
            var x = left + col * cell + cell / 2;
            var iy = y + cell * 0.42;
            if (iy + cell < 0 || iy - cell > h) return;   // off screen
            drawShape(sh, x, iy, size, w, h);
            // its name, small, under it
            g.font = "8px Orbitron, sans-serif";
            g.fillStyle = "rgba(245, 245, 245, 0.5)";
            g.textAlign = "center";
            g.fillText(sh.name, x, iy + size * 0.62 + 12, cell - 8);
            g.textAlign = "left";
        });
        y += cell;
    });
    spacer.style.height = (y - top + 80) + "px";
}

// The ghosted pointers, made from the HUD's labels (not the name, the tagline or the badge line): as each label
// types itself away, each of its letters' dots leaves where that letter was as it goes, and flies into its place
// in the pointers, turning ice blue on the way
var WORDS = [];   // each label: its element, its colour, its length, and when a letter f of the way along goes
hudLabels.forEach(function (el, i) {
    WORDS.push({ el: el, colour: [245, 245, 245], weight: DRIFT.callouts[i].length,
        gone: function (f) { return i * RETRACT_TEXT * 0.08 + (1 - f) * RETRACT_TEXT * 0.76; } });
});
// Each dot is born from one of them, somewhere along it (the longer labels giving more)
(function () {
    var total = WORDS.reduce(function (sum, wd) { return sum + wd.weight; }, 0);
    GHOST.from = GHOST.offsets.map(function () {
        var pick = Math.random() * total, n = 0;
        while (n < WORDS.length - 1 && (pick -= WORDS[n].weight) > 0) n++;
        return { word: n, along: Math.random() };
    });
})();
// Where each word sits with all its letters showing (measured while the whole HUD is up)
function measureWords() {
    WORDS.forEach(function (wd) {
        var r = wd.el.getBoundingClientRect();
        if (r.width > 0) wd.box = { left: r.left, width: r.width, y: r.top + r.height / 2 };
    });
}
// ---------------- Home, Connect and Selection ----------------
function smooth(a) {
    a = Math.max(0, Math.min(1, a));
    return a * a * (3 - 2 * a);
}
// The point d px along a path of corners
function along(pts, d) {
    for (var i = 1; i < pts.length; i++) {
        var len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (d <= len || i === pts.length - 1) {
            var f = len ? Math.max(0, Math.min(1, d / len)) : 0;
            return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
        }
        d -= len;
    }
    return pts[pts.length - 1];
}
function pathLength(pts) {
    var total = 0;
    for (var i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return total;
}
// A trace of stars along a path, as far as it's grown (`from` px of the route before it): small dots every few
// px, shimmering like the icons' — ice blue, or a colour of its own (Selection's green)
var TRACE_STEP = 7;
var GREEN = [90, 209, 122];
function starTrace(pts, from, grown, alpha, colour) {
    if (alpha === undefined) alpha = 1;
    if (alpha <= 0 || grown - from <= 0) return;
    var upTo = Math.min(pathLength(pts), grown - from);
    for (var d = 0; d <= upTo; d += TRACE_STEP) {
        var p = along(pts, d);
        starDot(p[0], p[1], colour || iceRGB(0.35 + 0.25 * Math.sin(clock * 1.6 + (from + d) * 0.02)), alpha,
            2.4 * (1 + 0.22 * Math.sin(clock * 2.4 + (from + d) * 0.3)));
    }
}
function starDot(x, y, colour, alpha, r) {
    if (alpha <= 0) return;
    var d = show.dot(x, y, colour, alpha, r);   // (as the show's effects have it just now)
    x = d[0]; y = d[1]; colour = d[2]; alpha = d[3]; r = d[4];
    g.fillStyle = rgb(colour);
    g.globalAlpha = 0.35 * alpha;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.globalAlpha = alpha;
    g.beginPath(); g.arc(x, y, r * 0.6, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
}

// Where things sit — the same for every part, so each hands over to the next: the iPhone (in the middle, and at
// the bottom), the drift icon's place (where the phone's middle was: the junction), the pointers' row through it,
// the devices along the top, and the connection icon, low on the left
function layout(w, h, cx, rowY, phone) {
    var size = phone * GHOST_SCALE;
    var pw = GHOST.centres[GHOST.centres.length - 1].w * size;   // a pointer's width, px
    var edge = phone * 0.23;                                    // the phone's outer edge, from its middle
    var gap = Math.max(4, Math.min(pw, (w * 0.46 - edge - pw * 2) / 2));
    var col = Math.min(w * 0.92 / LIST.length, 240);
    var dsize = Math.min(col * 0.8, h * 0.2);
    var devY = Math.max(h * 0.2, dsize * 0.6 + 16);
    var phoneEnd = h - phone * 0.45 - Math.max(16, h * 0.03);
    var iconSize = Math.min(phone * 0.34, w * 0.2);
    return {
        w: w, h: h, cx: cx, rowY: rowY, phone: phone, size: size,
        slots: ROW_SLOTS.map(function (slot) {
            var k = Math.abs(slot);
            return cx + (slot < 0 ? -1 : 1) * (edge + gap * k + pw * (k - 0.5));
        }),
        dsize: dsize, devY: devY, devBottom: devY + dsize * 0.45 + 6,
        devX: LIST.map(function (name, i) { return cx + (i - (LIST.length - 1) / 2) * col; }),
        phoneEnd: phoneEnd, iconSize: iconSize,
        icon: [Math.max(w * 0.2, iconSize * 0.6 + 12), rowY + phone * 0.62],
        cog: [w - Math.max(w * 0.2, iconSize * 0.6 + 12), rowY + phone * 0.62],
        home: [cx, rowY + phone * 0.62]
    };
}
var ROW_SLOTS = [-2, -1, 1, 2];   // where each pointer goes in the row, back (faintest) to front: far left … far right

// ---- The connection icon (dot.radiowaves), broadcasting: its waves pulsing outward. `form` 0 → 1: gathering from
// stars across the screen (Home), as the icons do
function drawBroadcast(L, form, alpha) {   // (alpha: fading it in where it is)
    if (alpha === undefined) alpha = 1;
    var sh = gridIcon("dot.radiowaves.left.and.right");
    for (var k = 0; k < sh.offsets.length; k++) {
        var o = sh.offsets[k];
        var tx = L.icon[0] + o[0] * L.iconSize, ty = L.icon[1] - o[1] * L.iconSize;
        var x = sh.from[k].x * L.w + (tx - sh.from[k].x * L.w) * form;
        var y = sh.from[k].y * L.h + (ty - sh.from[k].y * L.h) * form;
        var reach = Math.hypot(o[0], o[1]);
        var pulse = reach < 0.1 ? 1 : 0.3 + 0.7 * Math.pow(Math.max(0, Math.sin(ambient * 5 - reach * 16)), 2);   // (on through a pause)
        starDot(x, y, iceRGB(0.4 + 0.3 * reach), form * pulse * alpha,
            3.2 * (1 + 0.22 * Math.sin(ambient * 2.4 + k * 0.6)) * Math.min(1, L.iconSize / 200 + 0.35));
    }
}
var broadcast = false;   // the connection icon stays, broadcasting, from Home's end on

// ---- Home
// (s from Home's start) The phone slides right, the drift icon left behind in the middle; a trace of stars grows
// from the phone's top-left corner to the connection icon's place; the drift icon goes over and circles it very
// fast — one pointer, its ghosts stringing out behind — as the icon gathers and starts broadcasting; then the
// phone slides back to the middle, the pointer goes back into it, and the trace's stars fly in too, making the
// drift icon again: the intro's end, with the icon broadcasting
// Home and Settings are the same trip, mirrored: Home's phone goes right and its icon (the connection icon,
// broadcasting) is on the left; Settings' phone goes left and its icon (the settings cog, turning) is on the right
var LINK = { side: 1, from: function () { return linkFrom; }, spot: function (L) { return L.icon; },
    draw: function (L, form) { drawBroadcast(L, form); }, kept: function () { return broadcast; } };
// Home: the phone itself goes down to the icon's place and shrinks into it, then grows back out the same way,
// leaving the small iPhone there (it looks just the same)
var HOME = { side: 0, from: function () { return homeFrom; }, spot: function (L) { return L.home; },
    draw: function (L, form, t) { if (t >= H_BACK_FROM) drawHomeIcon(L); }, kept: function () { return homeIcon; } };
function drawHomeIcon(L) { drawShape(SHAPES.iphone, L.home[0], L.home[1], L.iconSize, L.w, L.h); }

// ---- Walkthrough
function walkT() { return reducedMotion ? 1e9 : clock - walkFrom; }
// The iPhone without its earpiece line, for the big one
var BIG_IPHONE = (function () {
    var keep = SHAPES.iphone.offsets.map(function (o) { return !(o[1] > 0.28 && o[1] < 0.37 && Math.abs(o[0]) < 0.1); });
    return {
        offsets: SHAPES.iphone.offsets.filter(function (o, k) { return keep[k]; }),
        from: SHAPES.iphone.from.filter(function (f, k) { return keep[k]; }),
        gatherFrom: -100
    };
})();
// The big iPhone (a phone screen's size, round the drift icon), and the three icons' row along its top: where
// each goes, and their size there (`grown` 0 → 1: how far it's grown; by default, as far as Walkthrough has it)
function walkGeom(L, grown) {
    var big = Math.min(2 * Math.min(L.rowY, L.h - L.rowY) * 0.94 / 0.85, L.w * 0.96 / 0.4, L.bigMax || Infinity);
    if (grown === undefined) grown = smooth(walkT() / WALK_GROW);
    var s2 = Math.min(L.iconSize, big * 0.09);
    var y = L.rowY - big * 0.425 + big * 0.06 + s2 * 0.5;
    var left = L.cx - big * 0.2 + big * 0.035, right = L.cx + big * 0.2 - big * 0.035;
    var cogX = right - s2 * WALK_COG * 0.6;
    return {
        size: L.phone + (big - L.phone) * grown,
        // the layout with the icons in the row (for drawing them there, once they've landed)
        row: Object.assign({}, L, { iconSize: s2, icon: [left + s2 * 0.6, y], cog: [cogX, y],
            home: [cogX - s2 * (WALK_COG * 0.5 + 0.55), y] })
    };
}
// The three icons: their stars set off one after another from where they are and fly to the row, then the icons
// themselves take over there — still, in the big phone (no broadcasting, no turning), the cog smaller. (After
// Selection, the cog and home icon aren't out: theirs gather from across the screen)
function drawWalk(L, W) {
    var t = walkT() - WALK_MOVE_FROM;
    var landed = smooth((t - WALK_MOVE + 0.25) / 0.25);
    var R = W.row;
    [["dot.radiowaves.left.and.right", L.icon, R.icon, 1], ["gearshape", L.cog, R.cog, WALK_COG], [null, L.home, R.home, 1]].forEach(function (ic, n) {
        var sh = ic[0] ? gridIcon(ic[0]) : SHAPES.iphone, bare = walkBare && n > 0;
        sh.offsets.forEach(function (o, k) {
            var depart = ((k * 0.618 + n * 0.3) % 1) * (WALK_MOVE - GHOST_FLY - 0.05);
            var f = smooth((t - depart) / GHOST_FLY);
            var from = bare ? [sh.from[k].x * L.w, sh.from[k].y * L.h] : [ic[1][0] + o[0] * L.iconSize, ic[1][1] - o[1] * L.iconSize];
            var to = [ic[2][0] + o[0] * R.iconSize * ic[3], ic[2][1] - o[1] * R.iconSize * ic[3]];
            starDot(from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f, iceRGB(0.5 - o[1]), (1 - landed) * (bare ? f : 1),
                3.2 * Math.min(1, (L.iconSize + (R.iconSize - L.iconSize) * f) / 200 + 0.35));
        });
    });
    landed *= portraitAlpha();   // (sideways the top bar's hidden)
    if (landed > 0) {
        drawShape(gridIcon("dot.radiowaves.left.and.right"), R.icon[0], R.icon[1], R.iconSize * (1 - 0.18 * rowPress()),
            R.w, R.h, landed);
        drawShape(gridIcon("gearshape"), R.cog[0], R.cog[1], R.iconSize * WALK_COG, R.w, R.h, landed);
        // (the list: the iPhone; the shared screen: the cycler, as its section has it — pressed as it's clicked)
        var device = RC_ICON[rcScreen === "cast" ? castSection : rcScreen === "share" && shareHome() > 0.5 ? "cast"
            : rcScreen === "off" && offHome() > 0.5 ? "cast" : rcScreen === "trackpad" && joinT() < 0.85 ? null
            : rcScreen === "media" && mediaUnlink() > 0.5 ? null : rcScreen];
        drawShape(device ? gridIcon(device) : SHAPES.iphone, R.home[0], R.home[1], R.iconSize * (1 - 0.18 * cyclerPress()), R.w, R.h, landed);
    }
}
function rowPress() {   // 0 → 1 → 0, as the connection icon's clicked (Device list, Screen sharing, Disconnect)
    function at(t, from) { return Math.sin(Math.PI * Math.max(0, Math.min(1, (t - from) / S_PRESS))); }
    return rcScreen === "list" && listFrom !== null ? at(listT(), E_CLICK) : rcScreen === "share" ? sharePress(S_CLICK_LIST)
        : rcScreen === "off" ? at(offT(), X_CLICK_LIST) : 0;
}
// ---- Device row's start, from Device list's end (the device list open in the big phone, the pointer on its own in the
// middle): held a second; then the phone shrinks back to its size, the list going, the connection icon's stars flying to its
// place low on the left (home and the cog breaking up into stars that drift apart and fade), the pointer going
// back to the middle; then its ghosts come back out of it: the drift icon, as the device list starts
function clickT() { return reducedMotion ? 1e9 : clock - clickFrom; }
function clicking() { return clickFrom !== null && clickT() < D_START; }
// The phone's size now, and the big phone's row (where the icons were, at its full size)
function clickGeom(L) {
    var t = clickT(), W = walkGeom(L, 1);
    return { t: t, size: W.size + (L.phone - W.size) * smooth((t - D_SHRINK_FROM) / D_SHRINK), row: W.row };
}
// The front pointer's tip (its top left), from its middle, in the drift icon's terms
var GHOST_TIP = (function () {
    var front = GHOST.centres.length - 1, ctr = GHOST.centres[front];
    var mine = GHOST.offsets.filter(function (o) { return o[3] === front; });
    return [Math.min.apply(null, mine.map(function (o) { return o[0]; })) - ctr.x,
        Math.max.apply(null, mine.map(function (o) { return o[1]; })) - ctr.y];
})();
// The drift icon meanwhile: how far its pointers are together (1: one pointer) — it stays in the middle
function clickPose(L, C) {
    return { merge: 1 - smooth((C.t - D_GHOSTS_FROM) / D_GHOSTS), dx: 0, dy: 0 };
}
function drawClick(L, C) {
    var t = C.t, R = C.row;
    var size = Math.min(1, R.iconSize / 200 + 0.35);
    // The list, going as the phone starts to shrink
    drawList(rcGeom(L, walkGeom(L, 1), "list"), 1 - smooth((t - D_SHRINK_FROM) / 0.35), true);
    // The connection icon; then its stars fly to its place, and it's itself there again
    var conn = gridIcon("dot.radiowaves.left.and.right");
    if (t < D_SHRINK_FROM) drawShape(conn, R.icon[0], R.icon[1], R.iconSize, R.w, R.h);
    else {
        var landed = smooth((t - D_SHRINK_FROM - D_SHRINK + 0.25) / 0.25);
        conn.offsets.forEach(function (o, k) {
            var f = smooth((t - D_SHRINK_FROM - ((k * 0.618) % 1) * (D_SHRINK - GHOST_FLY - 0.05)) / GHOST_FLY);
            var from = [R.icon[0] + o[0] * R.iconSize, R.icon[1] - o[1] * R.iconSize];
            var to = [L.icon[0] + o[0] * L.iconSize, L.icon[1] - o[1] * L.iconSize];
            starDot(from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f, iceRGB(0.5 - o[1]), 1 - landed,
                3.2 * Math.min(1, (R.iconSize + (L.iconSize - R.iconSize) * f) / 200 + 0.35));
        });
        if (landed > 0) drawBroadcast(L, 1, landed);
    }
    // Home and the cog: still; then breaking up, their stars drifting apart as they fade
    var gone = smooth((t - D_SHRINK_FROM) / 0.6);
    [[SHAPES.iphone, R.home, 1], [gridIcon("gearshape"), R.cog, WALK_COG]].forEach(function (ic) {
        var s = R.iconSize * ic[2];
        if (t < D_SHRINK_FROM) return drawShape(ic[0], ic[1][0], ic[1][1], s, R.w, R.h);
        if (gone >= 1) return;
        ic[0].offsets.forEach(function (o) {
            starDot(ic[1][0] + o[0] * s * (1 + gone), ic[1][1] - o[1] * s * (1 + gone), iceRGB(0.5 - o[1]), 1 - gone, 3.2 * size);
        });
    });
}
// ---- The remote's screens: stills of the app's own layouts, upright, in the big phone (Walkthrough's end, the
// screen filled in) — the trackpad, its lock top left, and over its bottom the keyboard or the media buttons; laid
// out as the app lays them out with its default settings, in its points (393 across)
// (as the cycler shows them; on the shared screen, its section's — the trackpad)
var RC_ICON = { trackpad: "cursorarrow", keyboard: "keyboard", media: "music.note", cast: "cursorarrow" };
var RC_LINKED = { trackpad: true, keyboard: true, media: true, cast: true };   // the screens shown with the MacBook they're working (below)
// Each one's, with the MacBook it's connected to (the device list's laptop, green) out to the phone's left: the two
// side by side across the middle — the phone as big as leaves the laptop room — and the laptop's place and size
function linkedPlace(w, h, cy) {
    var lw = Math.max(64, Math.min(150, w * 0.16)), gap = Math.max(36, w * 0.05);
    var wide = 0.4 + 0.45 * landTurn();   // the phone's width, a share of its size (wider as it turns sideways)
    var big = Math.min(2 * Math.min(cy, h - cy) * 0.94 / 0.85, (w - 32 - lw - gap) / wide);
    var left = Math.max(16, (w - lw - gap - big * wide) / 2);
    return { cx: left + lw + gap + big * wide / 2, big: big, laptop: [left + lw / 2, cy], lw: lw };
}
// The big iPhone without its home button too: a screen, edge to edge
var BIG_SCREEN = (function () {
    var keep = BIG_IPHONE.offsets.map(function (o) { return !(o[1] < -0.25 && o[1] > -0.37 && Math.abs(o[0]) < 0.06); });
    return {
        offsets: BIG_IPHONE.offsets.filter(function (o, k) { return keep[k]; }),
        from: BIG_IPHONE.from.filter(function (f, k) { return keep[k]; }),
        gatherFrom: -100
    };
})();
// An app icon in fewer dots, for drawing small (n of them)
var SMALL_ICONS = {};
function smallIcon(name, n) {
    if (!SMALL_ICONS[name + n]) {
        var draw = null;
        GROUPS.forEach(function (gr) { gr.icons.forEach(function (ic) { if (ic[0] === name && typeof ic[1] === "function") draw = ic[1]; }); });
        SMALL_ICONS[name + n] = sampleIcon(draw, n);
    }
    return SMALL_ICONS[name + n];
}
// A rounded rectangle's outline, as a path of corners
function roundedPath(x, y, w, h, rad) {
    var pts = [];
    [[x + w - rad, y + rad, -Math.PI / 2], [x + w - rad, y + h - rad, 0], [x + rad, y + h - rad, Math.PI / 2],
        [x + rad, y + rad, Math.PI]].forEach(function (c) {
        for (var i = 0; i <= 8; i++) {
            var a = c[2] + i / 8 * Math.PI / 2;
            pts.push([c[0] + rad * Math.cos(a), c[1] + rad * Math.sin(a)]);
        }
    });
    pts.push(pts[0]);
    return pts;
}
// The keyboard's rows: [label, width (pt; none: sharing what's left), kind] — letters, specials (smaller labels),
// modifiers, and gaps (null: nothing drawn)
var KEY_ROWS = [
    "qwertyuiop".split("").map(function (l) { return [l, 0, "letter"]; }),
    [[null, 18]].concat("asdfghjkl".split("").map(function (l) { return [l, 0, "letter"]; }), [[null, 18]]),
    [["⇧", 44, "mod"]].concat("zxcvbnm".split("").map(function (l) { return [l, 0, "letter"]; }), [["⌫", 44, "special"]]),
    [["123", 44, "special"], ["ESC", 40, "special"], ["TAB", 40, "special"], ["⌘", 36, "mod"], ["⌃", 36, "mod"],
        ["⌥", 36, "mod"], ["space", 0, "special"], ["⏎", 44, "special"]]
];
// Where each key is (pt): { label: [across, down, wide, high] } — the first of each — its rows from panelTop down:
// 42 high, 8 apart, in 4 from the sides, keys 5 apart
function keyRects(panelTop) {
    var rects = {};
    KEY_ROWS.forEach(function (row, i) {
        var y = panelTop + 8 + i * 50, fixed = 0, flex = 0;
        row.forEach(function (key) { if (key[1]) fixed += key[1]; else flex++; });
        var share = (385 - fixed - (row.length - 1) * 5) / flex, x = 4;
        row.forEach(function (key) {
            var w = key[1] || share;
            if (key[0] !== null && !rects[key[0]]) rects[key[0]] = [x, y, w, 42, key[2]];
            x += w + 5;
        });
    });
    return rects;
}
function greenish(c, f) { return [c[0] + (GREEN[0] - c[0]) * f, c[1] + (GREEN[1] - c[1]) * f, c[2] + (GREEN[2] - c[2]) * f]; }
// The screen below the row of icons, in the app's points: k px a point, H points high; X and Y, where a point is;
// panelTop, the top of what's at the bottom (keyboard, media)
function rcGeom(L, W, screen) {
    var big = W.size, R = W.row;
    var left = L.cx - 0.163 * big, width = 0.326 * big;   // (a little in from the outline)
    var top = R.icon[1] + R.iconSize * 0.5 + 0.01 * big, bottom = L.rowY + 0.366 * big;
    var k = width / 393, H = (bottom - top) / k;
    var section = screen === "cast" ? castSection : screen;   // (the shared screen: what's under its keys)
    var panelTop = section === "keyboard" ? H - 206 : screen === "media" ? H * (1 - 0.345) : screen === "cast" && section === "media" ? H - 198 : H;
    return {
        k: k, H: H, ok: k > 0 && H >= 260,   // (room for it)
        X: function (x) { return left + x * k; }, Y: function (y) { return top + y * k; },
        panelTop: panelTop,
        // the media buttons' top row: on Media, in the middle of its panel; on the shared screen, at the bottom
        mediaTop: screen === "media" ? panelTop + (H * 0.345 - 198) / 2 : H - 198
    };
}
// The media buttons: [icon, across, down from the top of its rows, its icon's size] (pt) — mute and full screen;
// back, play/pause (outlined, bigger) and forward, twice as high; volume down and up
var MEDIA_KEYS = [["speaker.slash.fill", 99, 21, 38], ["arrow.up.left.and.arrow.down.right", 294, 21, 38],
    ["backward.fill", 66.5, 96, 38], ["playpause.fill", 196.5, 96, 58], ["forward.fill", 326.5, 96, 38],
    ["speaker.minus.fill", 66.5, 171, 38], ["speaker.plus.fill", 326.5, 171, 38]];
function mediaKey(G, name) {   // where a media button's middle is (px)
    var key = MEDIA_KEYS.filter(function (m) { return m[0] === name; })[0];
    return [G.X(key[1]), G.Y(G.mediaTop + key[2])];
}
// What the screens are drawn with, in the app's points (each `a` its brightness, under the whole's `alpha`; `green`,
// 0 → 1, how far it's flashed green)
function rcPen(G, alpha) {
    var k = G.k, X = G.X, Y = G.Y, r = Math.max(1.1, 1.8 * k);
    return {
        box: function (x, y, w, h, rad, a, upTo, green, colour) {   // (hidden below upTo: under what's over it)
            var pts = roundedPath(x, y, w, h, rad), len = pathLength(pts);
            for (var d = 0; d < len; d += 4.5 / k) {
                var p = along(pts, d);
                if (upTo === undefined || p[1] < upTo) starDot(X(p[0]), Y(p[1]), greenish(colour || iceRGB(0.35), green || 0), alpha * a, r);
            }
        },
        icon: function (name, x, y, boxPt, a, green, colour) {
            smallIcon(name, Math.round(boxPt * 1.3)).forEach(function (o) {
                starDot(X(x) + o[0] * boxPt * k, Y(y) - o[1] * boxPt * k, greenish(colour || iceRGB(0.5 - o[1]), green || 0), alpha * a, r);
            });
        },
        label: function (text, x, y, sizePt, green) {
            g.save();
            g.font = "500 " + (sizePt * k).toFixed(1) + "px -apple-system, system-ui, sans-serif";
            g.textAlign = "center";
            g.textBaseline = "middle";
            g.fillStyle = rgb(greenish(iceRGB(0.45), green || 0));
            g.shadowColor = rgb(iceRGB(0.3));
            g.shadowBlur = 6;
            g.globalAlpha = 0.9 * alpha;
            g.fillText(text, X(x), Y(y));
            g.restore();
        },
        line: function (x, y, w, a) {   // (a line where words go)
            for (var d = 0; d <= w; d += 3.2 / k) starDot(X(x + d), Y(y), iceRGB(0.45), alpha * a, r * 0.8);
        }
    };
}
function drawRC(L, W, screen) {
    var G = rcGeom(L, W, screen), R = W.row;
    if (!G.ok) return;
    var shown = portraitAlpha();   // (going as the phone turns sideways: Landscape's, below)
    if (shown <= 0) return;
    var joined = screen === "trackpad" && joinFrom !== null ? joinT() : 1e9;   // (Trackpad: connecting as it starts)
    var pen = rcPen(G, shown * smooth(joined / 0.6) * (1 - mediaUnlink()));   // (Media's end: its screen going)
    // Connected: the top bar's green dot (the app's label), in the middle of the row (not on Device list: nothing is yet;
    // going as Disconnect disconnects; coming as Trackpad connects)
    var gone = Math.max(screen === "off" ? offGone() : screen === "list" ? 1 : 0, 1 - smooth((joined - 0.85) / 0.35), mediaUnlink());
    starDot(L.cx, R.icon[1], GREEN, shown * (1 - gone), Math.max(3.5, 6 * G.k));
    if (screen === "list" || screen === "share" || screen === "cast" || screen === "off") {
        // (Screen sharing: the list coming up, then going over to the shared screen; Disconnect: the other way, then
        // the list going too)
        var home = screen === "cast" ? 1 : screen === "share" ? shareHome() : screen === "off" ? offHome() : 0;
        if (screen === "list") return drawList(G, listFrom === null ? 1 : smooth((listT() - E_CLICK - 0.1) / E_LIST), true);
        drawList(G, (screen === "share" ? smooth((shareT() - S_CLICK_LIST - 0.1) / S_LIST) : screen === "off" ? 1 : 0)
            * (1 - home) * (1 - gone));
        if (home > 0) drawCast(L, W, G, home * shown);
        return;
    }
    // The trackpad (16 in from each side, 8 off the bottom), what's at the bottom over it; its lock top left
    pen.box(16, 0, 361, G.H - 8, 20, 0.5, G.panelTop);
    pen.icon("lock.open", 40, 24, 26, 0.6);
    if (pickFrom !== null) {
        // (Selection's end: the list coming in as the phone grows, the laptop picked; it closes as they connect)
        drawList(G, smooth((pickT() - WALK_GROW + 0.35) / 0.35) * (1 - smooth((pickT() - P_JOIN) / 0.4)), true);
    }
    if (screen === "keyboard") drawKeysPanel(L, G, pen);
    else if (screen === "media") drawMediaPanel(L, G, pen);
}
// The keys (each popping up as it's typed, as the app's do, and flashing green); the pointer handed over to them
function drawKeysPanel(L, G, pen) {
    var rects = keyRects(G.panelTop);
    Object.keys(rects).forEach(function (name) {
        var kr = rects[name], p = keyPress(name), s = 1 + 0.2 * p, gr = keyFlash(name);
        pen.box(kr[0] + kr[2] / 2 - kr[2] * s / 2, kr[1] + 21 - 21 * s, kr[2] * s, 42 * s, 8, 0.4 + 0.55 * Math.max(p, gr), undefined, gr);
        pen.label(name, kr[0] + kr[2] / 2, kr[1] + 21, (kr[4] === "special" ? 12 : 16) * s, gr);
    });
    drawHandOff(L, ["h", "i", "space", "a", "l"].map(function (name) {   // (the keys "hi all" takes)
        var kr = rects[name], pts = roundedPath(kr[0], kr[1], kr[2], kr[3], 8), len = pathLength(pts), spots = [];
        for (var d = 0; d < len; d += 4.5 / G.k) { var q = along(pts, d); spots.push([G.X(q[0]), G.Y(q[1])]); }
        return spots;
    }), keysT(), K_OUT_FROM, K_OUT, K_BACK_FROM, K_BACK);
}
// The media buttons (each pressing in and flashing green as it's clicked); the pointer handed over to them
function drawMediaPanel(L, G, pen) {
    pen.box(134, G.mediaTop + 50, 125, 92, 8, 0.45 + 0.5 * mediaFlash("playpause.fill"), undefined, mediaFlash("playpause.fill"));
    MEDIA_KEYS.forEach(function (m) {
        pen.icon(m[0], m[1], G.mediaTop + m[2], m[3] * (1 - 0.2 * mediaPress(m[0])), m[0] === "playpause.fill" ? 1 : 0.85, mediaFlash(m[0]));
    });
    drawHandOff(L, M_CLICKS.map(function (c) {   // (the three it presses)
        var m = MEDIA_KEYS.filter(function (mk) { return mk[0] === c[0]; })[0], at = mediaKey(G, c[0]);
        return smallIcon(c[0], Math.round(m[3] * 1.3)).map(function (o) { return [at[0] + o[0] * m[3] * G.k, at[1] - o[1] * m[3] * G.k]; });
    }), mediaT(), M_OUT_FROM, M_OUT, M_BACK_FROM, M_BACK);
}
// ---- What's on the Mac's screen (the MacBook's, and the shared screen's picture of it): `sx`, `sy` its edges (px);
// `o` — window (0 → 1: shown) and full (0 → 1: filling the screen); typed (Keyboard's time: its line of text) and
// flashes (Media's: play/pause and volume down flashing); pulse (the screen-sharing icon); desk (0 → 1: the dock
// shown), bounce (each dock icon's hop, 0 → 1) and windows (Landscape's: back to front, each { r: its edges, 0 → 1
// across and down, from: the dock icon it opens from, open: 0 → 1 }); pointer ([across, down], 0 → 1, or none),
// pointerAlpha; caret (false: no text cursor); alpha, the whole. What's in the window goes where it is (shown or not); a window hides what's behind
function drawScreen(sx, sy, o) {
    var w = sx[1] - sx[0], h = sy[1] - sy[0], full = o.full || 0, A = o.alpha === undefined ? 1 : o.alpha;
    var ww = w * (0.55 + 0.42 * full), wh = h * (0.55 + 0.42 * full);
    var wx = (sx[0] + sx[1]) / 2 - ww / 2, wy = (sy[0] + sy[1]) / 2 - wh / 2, r = h > 60 ? 1.3 : 1;
    function px(f) { return [sx[0] + f[0] * w, sy[0] + f[1] * h]; }
    // the desk's windows, as far open as they are (px edges)
    var wins = (o.windows || []).filter(function (win) { return win.open > 0; }).map(function (win) {
        var a = px(win.from), e = win.open;
        return [a[0] + (sx[0] + win.r[0] * w - a[0]) * e, a[1] + (sy[0] + win.r[1] * h - a[1]) * e,
            a[0] + (sx[0] + win.r[2] * w - a[0]) * e, a[1] + (sy[0] + win.r[3] * h - a[1]) * e];
    });
    function behind(x, y, from) {   // under one of the desk's windows (from the `from`th on)
        for (var i = from; i < wins.length; i++) if (x > wins[i][0] && x < wins[i][2] && y > wins[i][1] && y < wins[i][3]) return true;
        return false;
    }
    function dot(x, y, colour, a, rad, from) { if (!behind(x, y, from || 0)) starDot(x, y, colour, a * A, rad); }
    if (o.window > 0) {
        var win = roundedPath(wx, wy, ww, wh, Math.min(3, wh * 0.2)), winLen = pathLength(win);
        for (var e = 0; e < winLen; e += 3 * r) { var q = along(win, e); dot(q[0], q[1], iceRGB(0.4), 0.75 * o.window, r); }
    }
    if (o.flashes !== null && o.flashes !== undefined) M_CLICKS.slice(0, 2).forEach(function (c) {
        var flash = Math.sin(Math.PI * Math.max(0, Math.min(1, (o.flashes - c[1] - 0.05) / 0.4)));
        if (flash > 0) smallIcon(c[0], 40).forEach(function (p) {
            dot(wx + ww / 2 + p[0] * wh * 1.4, wy + wh / 2 - p[1] * wh * 1.4, [235, 248, 255], flash, 1.2 * r);
        });
    });
    if (o.typed !== null && o.typed !== undefined) {
        // a line of text as it's typed: a dash a letter, a gap for the space, the text cursor blinking after it
        var cw = ww * 0.11, x = wx + ww * 0.1, y = wy + wh * 0.36;
        K_KEYS.forEach(function (k) {
            if (o.typed < k[1] + 0.05) return;
            if (k[0] !== "space") for (var cx = x + cw * 0.15; cx <= x + cw * 0.85; cx += 1.4 * r) dot(cx, y, [235, 248, 255], 0.9, 0.8 * r);
            x += cw;
        });
        if (o.caret !== false && Math.floor(clock * 2) % 2 === 0) for (var cy = y - wh * 0.12; cy <= y + wh * 0.12; cy += 1.4 * r) dot(x + cw * 0.2, cy, [235, 248, 255], 0.9, 0.7 * r);
    }
    // the desk's windows, each hiding what's behind it: an outline, its title bar, its three buttons
    wins.forEach(function (e, i) {
        var pts = roundedPath(e[0], e[1], e[2] - e[0], e[3] - e[1], Math.min(3, (e[3] - e[1]) * 0.1)), len = pathLength(pts);
        for (var d = 0; d < len; d += 2.6 * r) { var q = along(pts, d); dot(q[0], q[1], iceRGB(0.35), 0.85, r, i + 1); }
        var bar = e[1] + (e[3] - e[1]) * 0.14;
        for (var bx = e[0] + 2; bx < e[2] - 2; bx += 2.6 * r) dot(bx, bar, iceRGB(0.45), 0.4, 0.8 * r, i + 1);
        for (var n = 0; n < 3; n++) dot(e[0] + (e[2] - e[0]) * (0.06 + n * 0.05), e[1] + (e[3] - e[1]) * 0.07, [255, 120, 100], 0.8, 0.9 * r, i + 1);
    });
    if (o.desk > 0) {
        // the dock along the bottom: four icons, each hopping as it's clicked
        var dock = roundedPath(sx[0] + w * 0.29, sy[0] + h * 0.85, w * 0.42, h * 0.11, Math.min(4, h * 0.04)), dl = pathLength(dock);
        for (var dd = 0; dd < dl; dd += 2.6 * r) { var dq = along(dock, dd); starDot(dq[0], dq[1], iceRGB(0.4), 0.6 * o.desk * A, r); }
        for (var i = 0; i < 4; i++) {
            var c = px(dockIcon(i)), s = h * 0.065, up = h * 0.06 * ((o.bounce || [])[i] || 0);
            var ic = roundedPath(c[0] - s / 2, c[1] - s / 2 - up, s, s, s * 0.25), il = pathLength(ic);
            for (var id = 0; id < il; id += 2 * r) { var iq = along(ic, id); starDot(iq[0], iq[1], iceRGB(0.25 + i * 0.1), o.desk * A, 0.9 * r); }
        }
    }
    if (o.pulse > 0) {
        var ps = h * 0.42 * (1 + 0.15 * o.pulse);
        smallIcon("display", 40).forEach(function (p) {
            starDot((sx[0] + sx[1]) / 2 + p[0] * ps, (sy[0] + sy[1]) / 2 - p[1] * ps, [225, 255, 235], o.pulse * A, 1.2 * r);
        });
    }
    if (o.pointer) {
        // the Mac's pointer (its tip there)
        var tip = [sx[0] + o.pointer[0] * w, sy[0] + o.pointer[1] * h], pb = Math.max(7, Math.min(16, h * 0.36));
        smallIcon("cursorarrow", 22).forEach(function (p) {
            starDot(tip[0] + (p[0] + 0.175) * pb, tip[1] - (p[1] - 0.375) * pb, iceRGB(0.3), (o.pointerAlpha === undefined ? 1 : o.pointerAlpha) * A, 0.9 * r);
        });
    }
}
function dockIcon(i) { return [0.5 + (i - 1.5) * 0.09, 0.905]; }   // where dock icon i is (0 → 1, across and down)
// ---- The pointer, handed over to the buttons (Media, Keyboard): once it's at rest it breaks up, each of its
// stars flying, one after another, to a place on one of the buttons about to be pressed (`targets`: each one's
// places, px), fading into it; once they've all been pressed, stars fly back from them and make it again where it
// rests (the buttons staying)
var HAND_FLY = 0.5;   // s each star takes
function drawHandOff(L, targets, t, outFrom, outTime, backFrom, backTime) {
    if (t < outFrom || t >= backFrom + backTime) return;
    var front = GHOST.centres.length - 1, ctr = GHOST.centres[front], size = L.size, out = t < backFrom, n = 0;
    GHOST.offsets.forEach(function (o, k) {
        if (o[3] !== front) return;
        var j = n++, spots = targets[j % targets.length], spot = spots[(j * 7) % spots.length];
        var home = [L.cx + (o[0] - ctr.x) * size, L.rowY - (o[1] - ctr.y) * size];
        var depart = ((j * 0.618) % 1) * ((out ? outTime : backTime) - HAND_FLY);
        var f = smooth((t - (out ? outFrom : backFrom) - depart) / HAND_FLY);
        var alpha = out ? 1 - smooth((f - 0.75) / 0.25) : smooth(f / 0.25);
        if (alpha <= 0) return;
        var a = out ? home : spot, b = out ? spot : home;
        // (as drawGhost draws them, so it takes over seamlessly)
        starDot(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, iceRGB(0.5 - o[1] + 0.12 * Math.sin(clock * 1.6 + o[1] * 7)), alpha,
            3.2 * (1 + 0.22 * Math.sin(clock * 2.4 + k * 0.6)) * Math.min(1, size / 200 + 0.35));
    });
}
// Whether the pointer's away on the buttons just now (not drawn as itself)
function pointerAway() {
    if (walkFrom === null) return false;
    var section = rcScreen === "cast" ? castSection : rcScreen;
    if (section === "media" && mediaFrom !== null) return mediaT() >= M_OUT_FROM && mediaT() < M_BACK_FROM + M_BACK;
    if (section === "keyboard" && keysFrom !== null) return keysT() >= K_OUT_FROM && keysT() < K_BACK_FROM + K_BACK;
    return false;
}
// ---- The device list (Device list, before anything's connected — `nearby`; Screen sharing; Disconnect), as the connection
// icon opens it in the app — its words as lines:
// the Log row; under it, the radios' tags, the screen sharing switch (off) and its two hints; then the Connected
// box — the MacBook's row: its icon green (the one connected), its name, and — once the switch is on — the
// screen-sharing icon (blue; green once it's sharing); then Disconnect, in red. In the app's points, down from under the row of icons
var LIST_ROW = 184;                  // the MacBook's row's middle
var LIST_SHARE_AT = [350, LIST_ROW];   // the screen-sharing icon
var LIST_OFF = LIST_ROW + 26 + 42;   // Disconnect's row's middle, in its own box under the Connected one
function drawList(G, alpha, nearby) {
    if (alpha <= 0 || !G.ok) return;   // (or no room for it)
    var k = G.k, X = G.X, Y = G.Y, r = Math.max(1, 1.6 * k);
    function outline(x, y, w, h, rad, colour, a) {
        var pts = roundedPath(x, y, w, h, rad), len = pathLength(pts);
        for (var d = 0; d < len; d += 4.5 / k) { var p = along(pts, d); starDot(X(p[0]), Y(p[1]), colour, alpha * a, r); }
    }
    function words(x, y, w, a) {   // (a line where the words go)
        for (var d = 0; d <= w; d += 3.2 / k) starDot(X(x + d), Y(y), iceRGB(0.45), alpha * a, r * 0.8);
    }
    function icon(name, x, y, boxPt, colour, a) {
        smallIcon(name, Math.round(boxPt * 1.3)).forEach(function (o) {
            starDot(X(x) + o[0] * boxPt * k, Y(y) - o[1] * boxPt * k, colour || iceRGB(0.5 - o[1]), alpha * a, r);
        });
    }
    // Log
    outline(16, 14, 361, 44, 10, iceRGB(0.35), 0.45);
    words(36, 36, 26, 0.6);
    // the radios' tags, the switch and its hints
    outline(32, 66, 62, 18, 9, iceRGB(0.35), 0.4); words(44, 75, 38, 0.5);
    outline(100, 66, 50, 18, 9, iceRGB(0.35), 0.4); words(112, 75, 26, 0.5);
    words(32, 104, 196, 0.7);
    // (off — switched on in Screen sharing: green, its knob over to the right)
    var on = rcScreen === "off" ? 1 : shareFrom === null ? 0 : smooth((shareT() - S_CLICK_TOGGLE - 0.05) / 0.3), knob = 335 + 22 * on;
    var sw = greenish(iceRGB(0.35), on);
    outline(322, 90, 49, 28, 14, sw, 0.6 + 0.3 * on);
    for (var a = 0; a < Math.PI * 2; a += 0.5) starDot(X(knob + 10 * Math.cos(a)), Y(104 + 10 * Math.sin(a)), sw, alpha * (0.6 + 0.4 * on), r);
    words(32, 128, 300, 0.4);
    words(32, 142, 116, 0.4);
    if (nearby) {
        // (nothing connected yet: the devices nearby, in a box of their own — each its icon, in blue, and its name)
        outline(16, 158, 361, 4 * 46, 10, iceRGB(0.35), 0.45);
        var picked = pickFrom === null ? 0 : smooth((pickT() - P_ROW) / 0.3);   // (Selection's end: the laptop picked)
        LIST.forEach(function (name, n) {
            var y = 158 + 23 + n * 46;
            if (n > 0) words(60, y - 23, 317, 0.2);
            var mine = n === LAPTOP ? picked : 0;
            if (mine > 0) outline(20, y - 21, 353, 42, 8, GREEN, 0.7 * mine);
            icon(name, 44, y, 30 * (1 - 0.15 * (n === LAPTOP ? pickPress() : 0)), greenish([10, 132, 255], mine), 0.9);
            words(72, y, [60, 92, 84, 70][n], 0.7);
        });
        return;
    }
    // Connected: the MacBook
    outline(16, LIST_ROW - 26, 361, 52, 10, iceRGB(0.35), 0.45);
    icon("laptopcomputer", 44, LIST_ROW, 34, GREEN, 1);
    words(72, LIST_ROW, 92, 0.75);
    var sharing = rcScreen === "off" ? 1 : shareFrom === null ? 0 : smooth((shareT() - S_LINK_FROM - S_LINK * 0.7) / 0.3), pulse = sharePulse();
    if (on > 0) icon("display", LIST_SHARE_AT[0], LIST_SHARE_AT[1], 30 * (1 - 0.2 * sharePress(S_CLICK_SHARE) + 0.18 * pulse),
        greenish([10, 132, 255], sharing), on);   // (only once the switch is on)
    // Disconnect, in red (lit as it's clicked)
    var press = offPress(), red = [255, 69, 58];
    outline(16, LIST_OFF - 22, 361, 44, 10, greenish(iceRGB(0.35), 0).map(function (c, i) { return c + (red[i] - c) * press; }), 0.45 + 0.4 * press);
    icon("xmark.circle", 40, LIST_OFF, 24 * (1 - 0.15 * press), red, 0.9);
    for (var d = 0; d <= 82; d += 3.2 / k) starDot(X(62 + d), Y(LIST_OFF), red, alpha * 0.8, r * 0.8);
}
// ---- The shared screen (the app's Cast, upright): the Mac's screen across the top, full width (its menu bar; and
// what's on it, as on the MacBook); under a divider, Cast's keys — Mission Control, and Quit in red; then, as the
// cycler has it, the trackpad (its name in the middle, a line), the keys or the media buttons
function castGeom(G) {   // the picture (pt): [across, wide, high], and the trackpad under the keys [across, down, wide, high]
    var ph = Math.min(393 / 1.6, G.H * 0.6), pw = ph * 1.6;   // (a MacBook's 16:10)
    return { px: (393 - pw) / 2, pw: pw, ph: ph, pad: [8, ph + 60, 377, G.H - ph - 68] };
}
function drawCast(L, W, G, alpha) {
    var pen = rcPen(G, alpha), C = castGeom(G), section = rcScreen === "cast" ? castSection : "trackpad";
    pen.box(C.px, 0, C.pw, C.ph, 2, 0.55);
    pen.line(C.px + 8, 8, C.pw - 16, 0.3);
    var screen = castScreen(L, W);
    screen.alpha = alpha;
    drawScreen([G.X(C.px), G.X(C.px + C.pw)], [G.Y(14), G.Y(C.ph)], screen);
    pen.line(0, C.ph, 393, 0.3);
    pen.icon("rectangle.3.group", 4 + 190.5 / 2, C.ph + 26, 32, 0.85);
    pen.icon("xmark", 393 - 4 - 190.5 / 2, C.ph + 26, 26, 0.9, 0, [255, 69, 58]);
    if (section === "keyboard") drawKeysPanel(L, G, pen);
    else if (section === "media") drawMediaPanel(L, G, pen);
    else {
        pen.box(C.pad[0], C.pad[1], C.pad[2], C.pad[3], 12, 0.5);
        pen.line(196.5 - 28, C.pad[1] + C.pad[3] / 2, 56, 0.6);
    }
}
// ---- The shared screen, playing (Shared trackpad, Shared keyboard, Shared media — castPart "screen", "keys",
// "media"): the screen icon pulsing on the picture and the MacBook, then gone; the pointer on the trackpad (the Mac's
// pointer the same on both); the cycler clicked — Keyboard: typed, as Keyboard, on both; the cycler clicked — Media:
// the pointer on the picture itself (a trackpad too), then the buttons, as Media, on both
function castT() { return castFrom === null ? -1 : reducedMotion ? 1e9 : clock - castFrom; }
function castPulse() {   // 0 → 1 → 0, S_PULSES times
    var u = (castT() - CS_PULSE_FROM) / S_PULSE;
    return castPart !== "screen" || u <= 0 || u >= S_PULSES ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * 2 * u);
}
function cyclerPress() {   // 0 → 1 → 0, as the cycler's clicked
    var t = castPart === "screen" ? castT() - CS_CYCLE : castPart === "keys" ? keysT() - CK_CYCLE
        : castPart === "media" ? mediaT() - CM_CYCLE : -1;
    return rcScreen === "cast" ? Math.sin(Math.PI * Math.max(0, Math.min(1, t / S_PRESS))) : 0;
}
// To the cycler and back: where the tip is, from `from` (px), clicking it at `at` (its time)
function toCycler(L, t, at, from, rest) {
    var R = walkGeom(L).row, cyc = [R.home[0] + R.iconSize * 0.08, R.home[1] + R.iconSize * 0.08];
    var go = smooth((t - at + S_GO) / S_GO), back = smooth((t - at - S_PRESS - 0.1) / S_BACK);
    if (back > 0) return [cyc[0] + (rest[0] - cyc[0]) * back, cyc[1] + (rest[1] - cyc[1]) * back];
    if (go > 0) return [from[0] + (cyc[0] - from[0]) * go, from[1] + (cyc[1] - from[1]) * go];
    return null;
}
function castPose(L) {
    if (castPart === "land") return landPose(L);
    var G = rcGeom(L, walkGeom(L), "cast"), C = castGeom(G), rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    if (castPart === "media") {
        var mp = mediaPose(L), cyc = toCycler(L, mediaT(), CM_CYCLE, rest, rest);   // (then to the cycler)
        if (cyc) { mp.tip = cyc; mp.dx = cyc[0] - rest[0]; mp.dy = cyc[1] - rest[1]; mp.touching = false; }
        return mp;
    }
    var at = rest, touching = false, area = null;
    if (castPart === "screen") {
        // to the trackpad's middle, a figure of eight there, then to the cycler
        var t = castT(), mid = [G.X(C.pad[0] + C.pad[2] / 2), G.Y(C.pad[1] + C.pad[3] / 2)];
        var go = smooth((t - CS_PLAY_FROM + S_GO) / S_GO), u = (t - CS_PLAY_FROM) / CS_PLAY;
        if (go > 0) at = [rest[0] + (mid[0] - rest[0]) * go, rest[1] + (mid[1] - rest[1]) * go];
        if (u > 0) at = mid;
        if (u > 0 && u < 1) {
            at = [mid[0] + G.k * C.pad[2] * 0.3 * Math.sin(Math.PI * 2 * u), mid[1] + G.k * C.pad[3] * 0.28 * Math.sin(Math.PI * 4 * u)];
            touching = true;
            area = [G.X(C.pad[0]), G.Y(C.pad[1]), G.X(C.pad[0] + C.pad[2]), G.Y(C.pad[1] + C.pad[3])];
        }
        at = toCycler(L, t, CS_CYCLE, mid, rest) || at;
    } else if (castPart === "keys") {
        at = toCycler(L, keysT(), CK_CYCLE, rest, rest) || at;
    }
    return { merge: 1, dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: touching, area: area };
}
// What's on the Mac's screen just now (the MacBook's and the picture's alike)
function castScreen(L, W) {
    var media = rcScreen === "cast" && mediaFrom !== null, t = mediaT(), fullAt = M_CLICKS[2][1];   // (staying once it's moved on)
    var pose = rcScreen === "cast" ? castPose(L) : null, pointer = [0.55, 0.5];
    if (pose && pose.touching) pointer = [(pose.tip[0] - pose.area[0]) / (pose.area[2] - pose.area[0]),
        (pose.tip[1] - pose.area[1]) / (pose.area[3] - pose.area[1])];
    var land = rcScreen === "cast" && castPart === "land", lt = landT();
    return {
        window: media ? smooth((t - fullAt - 0.05) / 0.15) : 0, full: media ? smooth((t - fullAt - 0.15) / 0.5) : 0,
        typed: rcScreen === "cast" && keysFrom !== null ? keysT() : null, flashes: media ? t : null, caret: !land,
        pulse: rcScreen === "cast" ? castPulse() : 0, pointer: pointer,
        desk: land ? smooth((lt - L_DOCK_FROM) / 0.4) : 0, bounce: land ? [0, 1, 2, 3].map(dockHop) : null,
        windows: land ? landWindows(lt) : null
    };
}
// ---- Landscape (the shared screen sideways): from the trackpad, the phone turns sideways and the landscape view
// takes over — the picture filling it, Cast's keys down the side, no top bar; the Mac's dock comes up; the pointer
// clicks on the picture (L_CLICKS): a dock icon (it hops, its window opening), another (another window, over the
// first), then the first window (brought forward) — each on the MacBook too; back to the middle; turned upright again
function landT() { return landFrom === null ? -1 : reducedMotion ? 1e9 : clock - landFrom; }
function landTurn() {   // 0 → 1: how far it's turned sideways
    if (rcScreen !== "cast" || castPart !== "land" || landFrom === null) return 0;
    return smooth((landT() - L_TURN_FROM) / L_TURN) - smooth((landT() - L_UNTURN_FROM) / L_TURN);
}
function portraitAlpha() { return 1 - smooth((landTurn() - 0.15) / 0.35); }   // the upright view, going as it turns
var LAND_WINDOWS = [[0.1, 0.16, 0.5, 0.62], [0.34, 0.3, 0.74, 0.78]];   // the two windows the dock opens (0 → 1)
function landWindows(t) {
    var wins = [0, 1].map(function (n) {
        var c = L_CLICKS[n];
        return { r: LAND_WINDOWS[n], from: dockIcon(c[2]), open: smooth((t - c[1] - 0.1) / 0.35) };
    });
    return t >= L_CLICKS[2][1] + 0.05 ? [wins[1], wins[0]] : wins;   // (the first brought forward)
}
function dockHop(i) {   // 0 → 1: dock icon i hopping (twice, lower the second time) as it's clicked
    var hop = 0;
    L_CLICKS.forEach(function (c) {
        var u = (landT() - c[1]) / 0.6;
        if (c[0] === "dock" && c[2] === i && u > 0 && u < 1) hop = Math.abs(Math.sin(Math.PI * 2 * u)) * (1 - u * 0.5);
    });
    return hop;
}
// The landscape view: the app's points (852 across, 393 down) — the picture (16:10) filling its height, Cast's keys
// (60 wide) down the right, a line between
function landGeom(L, W) {
    var big = W.size, k = Math.min(0.76 * big / 852, 0.326 * big / 393), left = L.cx - 426 * k, top = L.rowY - 196.5 * k;
    return { k: k, X: function (x) { return left + x * k; }, Y: function (y) { return top + y * k; }, pic: [81, 0, 629, 393],
        screen: [[left + 81 * k, left + 710 * k], [top + 14 * k, top + 393 * k]] };   // (the Mac's screen in it: under its menu bar)
}
function drawLand(L, W, alpha) {
    var G = landGeom(L, W), pen = rcPen(G, alpha), P = G.pic;
    if (!(G.k > 0) || alpha <= 0) return;
    pen.box(P[0], P[1], P[2], P[3], 2, 0.55);
    pen.line(P[0] + 8, 8, P[2] - 16, 0.3);
    var screen = castScreen(L, W);
    screen.alpha = alpha;
    drawScreen(G.screen[0], G.screen[1], screen);
    for (var y = 0; y <= 393; y += 3.2 / G.k) starDot(G.X(792), G.Y(y), iceRGB(0.45), 0.3 * alpha, Math.max(1, 1.4 * G.k));
    pen.icon("rectangle.3.group", 822, 98, 32, 0.85);
    pen.icon("xmark", 822, 295, 26, 0.9, 0, [255, 69, 58]);
}
// Where the pointer's tip goes: each click's place on the picture, in turn, then back to the middle
function landPose(L) {
    var t = landT(), G = landGeom(L, walkGeom(L)), S = G.screen;
    var rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size], at = rest, from = rest;
    L_CLICKS.forEach(function (c) {
        var f = c[0] === "dock" ? dockIcon(c[2]) : [0.2, 0.26];   // (the first window, where the second doesn't cover it)
        var spot = [S[0][0] + f[0] * (S[0][1] - S[0][0]), S[1][0] + f[1] * (S[1][1] - S[1][0])];
        var go = smooth((t - c[1] + S_GO) / S_GO);
        if (go > 0) at = [from[0] + (spot[0] - from[0]) * go, from[1] + (spot[1] - from[1]) * go];
        from = spot;
    });
    var back = smooth((t - L_BACK_FROM) / L_BACK);
    if (back > 0) at = [from[0] + (rest[0] - from[0]) * back, from[1] + (rest[1] - from[1]) * back];
    return { merge: 1, dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: landTurn() > 0.6,
        area: [S[0][0], S[1][0], S[0][1], S[1][1]] };
}
// ---- Screen sharing, playing: from Walkthrough's end, the pointer clicks the connection icon and the device
// list comes up; it switches screen sharing on (the MacBook's screen-sharing icon showing) and clicks that icon; the phone moves over and the green line goes out,
// making the MacBook (connected, sharing); the screen icon pulses on its screen and the list as the pointer goes
// back; then the list goes over to the shared screen
function shareT() { return shareFrom === null ? -1 : reducedMotion ? 1e9 : clock - shareFrom; }
function sharePress(at) { return shareFrom === null ? 0 : Math.sin(Math.PI * Math.max(0, Math.min(1, (shareT() - at) / S_PRESS))); }
function sharePulse() {   // 0 → 1 → 0, S_PULSES times: the screen-sharing icon pulsing (on the list and the Mac's screen)
    var u = (shareT() - S_PULSE_FROM) / S_PULSE;
    return shareFrom === null || u <= 0 || u >= S_PULSES ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * 2 * u);
}
function shareHome() { return shareFrom === null ? 0 : smooth((shareT() - S_HOME_FROM) / S_HOME); }   // the list → the shared screen
function sharePose(L) {
    var t = shareT(), W = walkGeom(L), R = W.row, G = rcGeom(L, W, "share");
    var rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var icon = [R.icon[0] + R.iconSize * 0.08, R.icon[1] + R.iconSize * 0.08];
    var toggle = [G.X(346), G.Y(106)], disp = [G.X(LIST_SHARE_AT[0] + 4), G.Y(LIST_SHARE_AT[1] + 4)];
    var at = rest, a = smooth((t - S_CLICK_LIST + S_GO) / S_GO), s = smooth((t - S_CLICK_TOGGLE + S_GO) / S_GO);
    var b = smooth((t - S_CLICK_SHARE + S_GO) / S_GO), c = smooth((t - S_BACK_FROM) / S_BACK);
    if (a > 0) at = [rest[0] + (icon[0] - rest[0]) * a, rest[1] + (icon[1] - rest[1]) * a];
    if (s > 0) at = [icon[0] + (toggle[0] - icon[0]) * s, icon[1] + (toggle[1] - icon[1]) * s];
    if (b > 0) at = [toggle[0] + (disp[0] - toggle[0]) * b, toggle[1] + (disp[1] - toggle[1]) * b];
    if (c > 0) at = [disp[0] + (rest[0] - disp[0]) * c, disp[1] + (rest[1] - disp[1]) * c];
    return { merge: 1, dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: false };
}
// ---- Device list, playing: from Walkthrough's end, the pointer clicks the connection icon and the list comes up (nothing
// connected yet); the pointer goes back
function listT() { return listFrom === null ? -1 : reducedMotion ? 1e9 : clock - listFrom; }
function listPose(L) {
    var t = listT(), R = walkGeom(L).row, rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var icon = [R.icon[0] + R.iconSize * 0.08, R.icon[1] + R.iconSize * 0.08], at = rest;
    var a = smooth((t - E_CLICK + S_GO) / S_GO), c = smooth((t - E_BACK_FROM) / S_BACK);
    if (a > 0) at = [rest[0] + (icon[0] - rest[0]) * a, rest[1] + (icon[1] - rest[1]) * a];
    if (c > 0) at = [icon[0] + (rest[0] - icon[0]) * c, icon[1] + (rest[1] - icon[1]) * c];
    return { merge: 1, dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: false };
}
// ---- Selection's end, picking the laptop: the phone grows into the big phone with the list in it (as Device row
// shrank it, the other way round), the pointer collapsing to one; it clicks the laptop (its row going green), and the
// list closes as they connect — the phone moving over, the green line growing out of the connection icon and the MacBook made at its
// end, as Screen sharing makes it (Disconnect, the other way round) — the trackpad's screen showing: Trackpad's start
function pickT() { return pickFrom === null ? -1 : reducedMotion ? 1e9 : clock - pickFrom; }
function pickPress() { return pickFrom === null ? 0 : Math.sin(Math.PI * Math.max(0, Math.min(1, (pickT() - P_ROW) / S_PRESS))); }
function pickPose(L) {
    var t = pickT(), W = walkGeom(L), R = W.row, G = rcGeom(L, W, "trackpad");
    var rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var row = [G.X(120), G.Y(158 + 23 + LAPTOP * 46 + 4)];
    var at = rest, b = smooth((t - P_ROW + S_GO) / S_GO), c = smooth((t - P_ROW - 0.4) / S_BACK);
    if (b > 0) at = [rest[0] + (row[0] - rest[0]) * b, rest[1] + (row[1] - rest[1]) * b];
    if (c > 0) at = [row[0] + (rest[0] - row[0]) * c, row[1] + (rest[1] - row[1]) * c];
    // (collapsing to one pointer as Walkthrough's grow does)
    return { merge: smooth((walkT() - WALK_MERGE_FROM) / WALK_MERGE), dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: false };
}
function joinT() { return joinFrom === null ? 1e9 : reducedMotion ? 1e9 : clock - joinFrom; }   // (how far it's got with connecting)
// ---- Disconnect, playing: from the shared screen, the pointer clicks the connection icon and the list comes up;
// it clicks Disconnect — the green line drawing back, the MacBook going, the phone back in the middle at its size,
// the list going: Walkthrough's end; the pointer back
function offT() { return offFrom === null ? -1 : reducedMotion ? 1e9 : clock - offFrom; }
function offHome() { return rcScreen !== "off" ? 0 : 1 - smooth((offT() - X_CLICK_LIST - 0.1) / X_LIST); }   // the shared screen
function offGone() { return rcScreen !== "off" ? 0 : smooth((offT() - X_GONE_FROM) / X_GONE); }   // 0 → 1: disconnected
function offPress() { return rcScreen !== "off" ? 0 : Math.sin(Math.PI * Math.max(0, Math.min(1, (offT() - X_CLICK_OFF) / S_PRESS))); }
function offPose(L) {
    var t = offT(), W = walkGeom(L), R = W.row, G = rcGeom(L, W, "off");
    var rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var icon = [R.icon[0] + R.iconSize * 0.08, R.icon[1] + R.iconSize * 0.08], off = [G.X(70), G.Y(LIST_OFF + 4)];
    var at = rest, a = smooth((t - X_CLICK_LIST + S_GO) / S_GO), b = smooth((t - X_CLICK_OFF + S_GO) / S_GO);
    var c = smooth((t - X_BACK_FROM) / S_BACK);
    if (a > 0) at = [rest[0] + (icon[0] - rest[0]) * a, rest[1] + (icon[1] - rest[1]) * a];
    if (b > 0) at = [icon[0] + (off[0] - icon[0]) * b, icon[1] + (off[1] - icon[1]) * b];
    if (c > 0) at = [off[0] + (rest[0] - off[0]) * c, off[1] + (rest[1] - off[1]) * c];
    // (then its ghosts out of it again, as the device list's start brings them)
    return { merge: 1 - smooth((t - X_GHOSTS_FROM) / X_GHOSTS), dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: false };
}
// How far over the phone is (0: in the middle; 1: over to the right, the MacBook beside it): where its middle is
// and how big it can be — or null, in the middle
function linkedNow(w, h, cx, cy) {
    var move = RC_LINKED[rcScreen] ? smooth(joinT() / (J_LINK * 0.6)) : rcScreen === "share" && shareFrom !== null ? smooth((shareT() - S_LINK_FROM) / (S_LINK * 0.6))
        : rcScreen === "off" ? 1 - smooth((offT() - X_GONE_FROM - 0.2) / (X_GONE * 0.7)) : 0;
    if (rcScreen === "media" && mediaFrom !== null) move *= 1 - smooth((mediaT() - M_UNLINK_FROM - 0.2) / (M_UNLINK * 0.7));   // (Media's end)
    if (move <= 0) return null;
    var M = linkedPlace(w, h, cy), big = Math.min(2 * Math.min(cy, h - cy) * 0.94 / 0.85, w * 0.96 / 0.4);
    return { cx: cx + (M.cx - cx) * move, big: big + (M.big - big) * move };
}
// ---- Trackpad, playing: the pointer goes out to the trackpad's edge, once round it just inside, and back to
// where it rests — the Mac's pointer going round its screen's edge just the same
function trackT() { return trackFrom === null ? -1 : reducedMotion ? 1e9 : clock - trackFrom; }
function trackPose(L) {
    var t = trackT(), G = rcGeom(L, walkGeom(L), "trackpad");
    var rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var route = roundedPath(30, 14, 297, G.H - 76, 8).map(function (p) { return [G.X(p[0]), G.Y(p[1])]; });   // (its tip 14 in;
    // further from the right and bottom, so the rest of it's inside too)
    var start = route[0], at = rest;
    var go = smooth((t - T_GO_FROM) / T_GO), u = Math.max(0, Math.min(1, (t - T_ROUND_FROM) / T_ROUND));
    var back = smooth((t - T_BACK_FROM) / T_BACK);
    if (go > 0) at = [rest[0] + (start[0] - rest[0]) * go, rest[1] + (start[1] - rest[1]) * go];
    if (u > 0) at = along(route, (u - Math.sin(Math.PI * 2 * u) / (Math.PI * 2)) * pathLength(route));   // (easing in and out)
    if (back > 0) at = [start[0] + (rest[0] - start[0]) * back, start[1] + (rest[1] - start[1]) * back];
    return { merge: 1, dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: t > T_GO_FROM && t < T_BACK_FROM + T_BACK, G: G };
}
// ---- Media, playing: the pointer plays on the touchscreen (the Mac's pointer doing just the same) — on the shared
// screen, on the picture itself; then, handed over to the buttons, play/pause is pressed (it flashes on the Mac's
// screen), volume down (so does it) and full screen (the Mac's window filling its screen); then the pointer's made
// again where it rests
function mediaT() { return mediaFrom === null ? -1 : reducedMotion ? 1e9 : clock - mediaFrom; }
function mediaUnlink() { return rcScreen === "media" && mediaFrom !== null ? smooth((mediaT() - M_UNLINK_FROM) / M_UNLINK) : 0; }   // (its end)
function mediaPress(name) {   // 0 → 1 → 0, as it's clicked
    var c = M_CLICKS.filter(function (m) { return m[0] === name; })[0];
    return c ? Math.sin(Math.PI * Math.max(0, Math.min(1, (mediaT() - c[1]) / M_PRESS))) : 0;
}
function mediaFlash(name) {   // 0 → 1 → 0, green as it's clicked
    var c = M_CLICKS.filter(function (m) { return m[0] === name; })[0];
    return c ? Math.sin(Math.PI * Math.max(0, Math.min(1, (mediaT() - c[1]) / M_FLASH))) : 0;
}
// Where the pointer's tip is, and how far it's moved from where it rests (the middle): its pose for drawGhost. A
// figure of eight round where it rests (the shared screen: out to the picture's middle first, and back after)
function mediaPose(L) {
    var t = mediaT(), cast = rcScreen === "cast", G = rcGeom(L, walkGeom(L), cast ? "cast" : "media");
    var rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var mid = rest, ax = G.k * 110, ay = G.k * 80, area = null;
    if (cast) {
        var C = castGeom(G);
        mid = [G.X(196.5), G.Y(C.ph / 2)];
        ax = G.k * C.pw * 0.3;
        ay = G.k * C.ph * 0.26;
        area = [G.X(C.px), G.Y(0), G.X(C.px + C.pw), G.Y(C.ph)];
    }
    var at = rest, go = smooth((t - M_PLAY_FROM + S_GO) / S_GO), u = (t - M_PLAY_FROM) / M_PLAY;
    var leave = smooth((t - M_PLAY_FROM - M_PLAY) / M_LEAVE);
    if (go > 0) at = [rest[0] + (mid[0] - rest[0]) * go, rest[1] + (mid[1] - rest[1]) * go];
    if (u > 0 && u < 1) at = [mid[0] + ax * Math.sin(Math.PI * 2 * u), mid[1] + ay * Math.sin(Math.PI * 4 * u)];
    if (leave > 0) at = [mid[0] + (rest[0] - mid[0]) * leave, mid[1] + (rest[1] - mid[1]) * leave];
    return { merge: 1, dx: at[0] - rest[0], dy: at[1] - rest[1], tip: at, touching: u > 0 && u < 1, G: G, area: area };
}
// ---- Keyboard, typing: the pointer handed over to the keys, "hi all" typed on them, lines coming up on the
// Mac's screen as if it were being typed there (not the words themselves); then the pointer made again
function keysT() { return keysFrom === null ? -1 : reducedMotion ? 1e9 : clock - keysFrom; }
function keyPress(label) {   // 0 → 1 → 0, as it's typed (each time)
    var p = 0;
    K_KEYS.forEach(function (k) {
        if (k[0] === label) p = Math.max(p, Math.sin(Math.PI * Math.max(0, Math.min(1, (keysT() - k[1]) / K_PRESS))));
    });
    return p;
}
function keyFlash(label) {   // 0 → 1 → 0, green as it's typed (each time)
    var p = 0;
    K_KEYS.forEach(function (k) {
        if (k[0] === label) p = Math.max(p, Math.sin(Math.PI * Math.max(0, Math.min(1, (keysT() - k[1]) / K_FLASH))));
    });
    return p;
}
// The MacBook out to the left, green (chosen), and the green line from the connection icon to it — left, then
// down — brighter green running along it both ways, over and over. On its screen, what the screen being shown does
// there (drawScreen): a window and the Mac's pointer (where the phone's is on the touchscreen) on the remote's screens
function drawLinked(L, W, screen) {
    var M = linkedPlace(L.w, L.h, L.rowY), R = W.row, box = M.lw / 0.87;
    // (Screen sharing: the line growing out from the connection icon, then the MacBook made at its end)
    var st = screen === "share" ? shareT() - S_LINK_FROM : joinT();   // (how far it's got with connecting)
    var grow = smooth((st - 0.3) / 0.6), made = smooth((st - 0.85) / 0.35);
    var left = screen === "off" ? 1 - offGone() : 1 - mediaUnlink();   // (Disconnect, Media's end: the line drawing back, the MacBook going)
    if (left <= 0) return;
    if (screen === "off" || left < 1) grow = left;
    var path = [[R.icon[0] - R.iconSize * 0.5, R.icon[1]], [M.laptop[0], R.icon[1]], [M.laptop[0], M.laptop[1] - box * 0.33]];
    var turn = landTurn();
    if (turn > 0) {
        // (sideways: from the phone's side, the connection icon hidden; across to the laptop)
        var side = [L.cx - W.size * 0.425, L.rowY], start = [path[0][0] + (side[0] - path[0][0]) * turn, path[0][1] + (side[1] - path[0][1]) * turn];
        path = start[1] < path[2][1] ? [start, [M.laptop[0], start[1]], path[2]] : [start, [M.laptop[0] + box * 0.45, start[1]]];
    }
    if (made >= 1) drawShape(gridIcon("laptopcomputer"), M.laptop[0], M.laptop[1], box, L.w, L.h, left, 1);
    else if (grow >= 1) gridIcon("laptopcomputer").offsets.forEach(function (o, k) {
        var f = smooth((st - 0.85 - ((k * 0.618) % 1) * 0.12) / 0.2), end = path[2];
        starDot(end[0] + (M.laptop[0] + o[0] * box - end[0]) * f, end[1] + (M.laptop[1] - o[1] * box - end[1]) * f, GREEN, 1, 2.2);
    });
    var len = pathLength(path), run = (clock * 150) % (len + 120) - 60;   // (each pulse 60 px off the ends between runs)
    for (var d = 0; grow > 0 && d <= len * grow; d += TRACE_STEP) {
        var p = along(path, d);
        var lit = Math.max(Math.exp(-Math.pow((d - run) / 26, 2)), Math.exp(-Math.pow((d - (len - run)) / 26, 2)));
        starDot(p[0], p[1], [GREEN[0] + (200 - GREEN[0]) * lit, GREEN[1] + (255 - GREEN[1]) * lit, GREEN[2] + (210 - GREEN[2]) * lit],
            0.55 + 0.45 * lit, 2.4 * (1 + 0.5 * lit));
    }
    if (made < 1) return;
    // The Mac's screen (inside the laptop's outline)
    var sx = [M.laptop[0] - 0.28 * box, M.laptop[0] + 0.28 * box], sy = [M.laptop[1] - 0.255 * box, M.laptop[1] + 0.105 * box];
    if (screen === "share") {
        // the screen-sharing icon pulsing (as it does on the list); its pointer coming in as the list goes
        return drawScreen(sx, sy, { pulse: sharePulse(), pointer: shareHome() > 0 ? [0.55, 0.5] : null, pointerAlpha: shareHome() });
    }
    if (screen === "cast") return drawScreen(sx, sy, castScreen(L, W));
    if (screen === "off") return drawScreen(sx, sy, { pointer: [0.55, 0.5], alpha: left });
    var playing = { trackpad: trackFrom, keyboard: keysFrom, media: mediaFrom }[screen];
    if (playing === null || playing === undefined) return;
    var pose = screen === "media" ? mediaPose(L) : screen === "trackpad" ? trackPose(L) : null;
    var t = screen === "media" ? mediaT() : screen === "keyboard" ? keysT() : trackT();
    // the Mac's pointer: where the phone's is on the touchscreen
    var G = rcGeom(L, W, screen), rest = [L.cx + GHOST_TIP[0] * L.size, L.rowY - GHOST_TIP[1] * L.size];
    var at = pose && pose.touching ? pose.tip : rest;
    drawScreen(sx, sy, {
        window: 1, full: screen === "media" ? smooth((t - M_CLICKS[2][1] - 0.15) / 0.5) : 0,
        typed: screen === "keyboard" ? t : null, flashes: screen === "media" ? t : null,
        pointer: [(at[0] - G.X(16)) / (G.X(377) - G.X(16)), (at[1] - G.Y(0)) / (G.Y(G.panelTop) - G.Y(0))], alpha: left
    });
}
// Where the trip has the phone: { x, y, scale }
function tripPhone(trip, L, t) {
    if (trip.side === 0) {
        var down = smooth(t / H_SLIDE) - smooth((t - H_BACK_FROM) / H_BACK);
        return { x: L.cx, y: L.rowY + (L.home[1] - L.rowY) * down, scale: 1 + (L.iconSize / L.phone - 1) * down };
    }
    return { x: tripPhoneX(trip, L, t), y: L.rowY, scale: 1 };
}
var SETTINGS = { side: -1, from: function () { return settingsFrom; }, spot: function (L) { return L.cog; },
    draw: function (L, form) { drawCog(L, form); }, kept: function () { return cog; } };
function tripT(trip) { return reducedMotion ? 1e9 : clock - trip.from(); }
function tripPhoneX(trip, L, t) {
    var away = Math.min(L.w * 0.72, L.w - L.phone * 0.3 - 16) - L.cx;   // how far the phone goes, to its side
    return L.cx + trip.side * away * (smooth(t / H_SLIDE) - smooth((t - H_BACK_FROM) / H_BACK));
}
// From the phone's top corner nearest the icon (moving with it as it slides over to its side): across, then down
// to the icon. (Home: straight down from the drift icon, left in the middle, to the small iPhone)
function tripTrace(trip, L, t) {
    var spot = trip.spot(L);
    if (trip.side === 0) return [[L.cx, L.rowY + L.size * 0.5], [L.cx, spot[1] - L.iconSize * 0.45]];
    var corner = [tripPhoneX(trip, L, Math.min(t, H_SLIDE)) - trip.side * L.phone * 0.2, L.rowY - L.phone * 0.43];
    return [corner, [spot[0], corner[1]], [spot[0], spot[1] - L.iconSize * 0.5]];
}
function drawTrip(trip, L) {
    var t = tripT(trip);
    var trace = tripTrace(trip, L, t);
    var len = pathLength(trace);
    var back = smooth((t - H_BACK_FROM) / H_BACK);
    if (back <= 0) {
        // (Connect's and Settings' trace out of the phone from the moment it sets off — at full speed, then easing in
        // to the icon; Home's once it's down)
        var a = Math.min(1, t / (H_TRACE_FROM + H_TRACE));
        var grown = trip.side === 0 ? smooth((t - H_TRACE_FROM) / H_TRACE) : 1 - (1 - a) * (1 - a);
        starTrace(trace, 0, grown * len);
    } else if (back < 1) {
        // its stars fly into the phone (coming back to the middle), helping make the drift icon there
        var P = tripPhone(trip, L, t);
        for (var d = 0, k = 0; d <= len; d += TRACE_STEP, k++) {
            var p = along(trace, d), o = GHOST.offsets[(k * 7) % GHOST.offsets.length];
            var q = [P.x + o[0] * L.size, P.y - o[1] * L.size];
            starDot(p[0] + (q[0] - p[0]) * back, p[1] + (q[1] - p[1]) * back, iceRGB(0.4), 1 - back, 2.4);
        }
    }
    trip.draw(L, trip.kept() ? 1 : smooth((t - H_CIRCLE_FROM) / H_GATHER), t);
}
// Pointer n's middle on the trip (and how strung out they are: the hidden dots showing). Left behind in the
// middle; over to the icon's place — Home's very fast round it, its ghosts stringing out behind; Settings' and
// Connect's sitting just below it, together — then straight back into the phone, the ghosts closing up
function tripPlace(trip, n, L, ctr) {
    var t = tripT(trip);
    var spot = trip.spot(L), circles = trip.side === 0;
    var R = L.iconSize * 0.85, a0 = -Math.PI / 2;
    var start = circles ? [spot[0] + R * Math.cos(a0), spot[1] + R * Math.sin(a0)] : [spot[0], spot[1] + L.iconSize * 0.95];
    var go = smooth((t - H_GO_FROM) / H_GO);
    var G = [L.cx + (start[0] - L.cx) * go, L.rowY + (start[1] - L.rowY) * go];
    var at = [G[0] + ctr.x * L.size, G[1] - ctr.y * L.size];   // stacked, wherever the drift icon is
    var lag = circles ? smooth((t - H_CIRCLE_FROM) / 0.3) * (1 - smooth((t - H_BACK_FROM) / (H_BACK * 0.4))) : 0;
    if (circles && t > H_CIRCLE_FROM) {
        var spun = H_SPIN * (Math.min(t, H_BACK_FROM) - H_CIRCLE_FROM);   // (stopping as it heads back)
        var a = a0 + spun - (GHOST.centres.length - 1 - n) * TRAIL * lag;
        var onCircle = [spot[0] + R * Math.cos(a), spot[1] + R * Math.sin(a)];
        var b = smooth((t - H_CIRCLE_FROM) / 0.25);
        at = [at[0] + (onCircle[0] - at[0]) * b, at[1] + (onCircle[1] - at[1]) * b];
    }
    var back = smooth((t - H_BACK_FROM) / H_BACK);
    if (back > 0) {
        var P = tripPhone(trip, L, t);
        var inPhone = [P.x + ctr.x * L.size, P.y - ctr.y * L.size];
        at = [at[0] + (inPhone[0] - at[0]) * back, at[1] + (inPhone[1] - at[1]) * back];
    }
    return { x: at[0], y: at[1], alpha: 1, apart: lag };
}

// ---- The settings cog (gearshape), turning slowly. `form` 0 → 1: gathering from stars (Settings)
function drawCog(L, form, alpha) {   // (alpha: fading it in where it is)
    if (alpha === undefined) alpha = 1;
    var sh = gridIcon("gearshape");
    var turn = ambient * 0.6, c = Math.cos(turn), sn = Math.sin(turn);   // (turning on through a pause)
    for (var k = 0; k < sh.offsets.length; k++) {
        var o = sh.offsets[k];
        var ox = o[0] * c - o[1] * sn, oy = o[0] * sn + o[1] * c;
        var tx = L.cog[0] + ox * L.iconSize, ty = L.cog[1] - oy * L.iconSize;
        var x = sh.from[k].x * L.w + (tx - sh.from[k].x * L.w) * form;
        var y = sh.from[k].y * L.h + (ty - sh.from[k].y * L.h) * form;
        starDot(x, y, iceRGB(0.5 - oy), form * alpha,
            3.2 * (1 + 0.22 * Math.sin(ambient * 2.4 + k * 0.6)) * Math.min(1, L.iconSize / 200 + 0.35));
    }
}
var cog = false;   // the settings cog stays, turning, from Settings' end on

// ---- Connect
// (s from Connect's start) The phone slides to the bottom, the drift icon left behind in the middle, a line of
// stars between them; the pointers split apart into their row, the traces following them out from the junction;
// then each phases (in and out of sight) along its own route up to its device, like a circuit board's, the trace
// growing behind it; each device appears as its pointer arrives, and the pointer is gone
function connectT() { return reducedMotion ? 1e9 : clock - connectFrom; }
// The routes: from the junction along the row to each pointer's place, then up to its device — across and up at
// different heights, one on a 45° run (not mirrored)
function connectRoutes(L) {
    var H = L.rowY - L.devBottom;
    var routes = L.slots.map(function (sx, n) {
        var dx = L.devX[n], s = [sx, L.rowY], up;
        if (n === 0) up = [s, [sx, L.rowY - H * 0.35], [dx, L.rowY - H * 0.35], [dx, L.devBottom]];
        else if (n === 1) up = [s, [sx, L.rowY - H * 0.62], [dx, L.rowY - H * 0.62], [dx, L.devBottom]];
        else if (n === 2) {
            var y3 = L.rowY - H * 0.2;
            up = [s, [sx, y3], [dx, y3 - Math.abs(dx - sx)], [dx, L.devBottom]];
        } else up = [s, [sx, L.rowY - H * 0.48], [dx, L.rowY - H * 0.48], [dx, L.devBottom]];
        return { n: n, name: LIST[n], x: dx, y: L.devY, out: [[L.cx, L.rowY], s], up: up, len: pathLength(up) };
    });
    var longest = Math.max.apply(null, routes.map(function (r) { return r.len; }));
    routes.forEach(function (r) { r.arrive = C_TRAVEL_FROM + r.len / longest * C_TRAVEL; });
    return { routes: routes, longest: longest, stem: [[L.cx, L.phoneEnd - L.phone * 0.43], [L.cx, L.rowY]] };
}
// The whole way from the phone to device n: the stem, along the row, and up
function fullRoute(net, n) {
    var r = net.routes[n];
    return net.stem.concat([r.up[0]], r.up.slice(1));
}
function connectPhoneY(L, ct) {
    var y = L.rowY + (L.phoneEnd - L.rowY) * smooth(ct / C_SLIDE);
    return y + (L.rowY - y) * selEnding();   // (back up to the middle, as Selection ends)
}
// The traces and devices, as far as Connect has got. (opts, for Selection: `fade` for the devices but `keep`,
// `traces` for the blue traces, and `green` — the device whose route and icon are green)
function drawConnect(L, opts) {
    opts = opts || {};
    var fade = opts.fade === undefined ? 1 : opts.fade;
    var traces = opts.traces === undefined ? fade : opts.traces;
    var ct = connectT(), net = connectRoutes(L);
    // The line from the phone up to the drift icon: traced out of the phone's top as it slides down (its stars
    // where they'll stay, each showing once the phone's gone past it)
    var stemLen = pathLength(net.stem), phoneTop = connectPhoneY(L, ct) - L.phone * 0.43;
    for (var d = 0; d <= stemLen; d += TRACE_STEP) {
        var p = along(net.stem, d);
        if (p[1] > phoneTop) continue;   // (still in the phone)
        starDot(p[0], p[1], iceRGB(0.35 + 0.25 * Math.sin(clock * 1.6 + d * 0.02)), traces,
            2.4 * (1 + 0.22 * Math.sin(clock * 2.4 + d * 0.3)));
    }
    var split = smooth((ct - C_SPLIT_FROM) / C_SPLIT);
    var travelled = Math.max(0, ct - C_TRAVEL_FROM) / C_TRAVEL * net.longest;
    net.routes.forEach(function (r) {
        var colour = opts.green === r.n ? GREEN : null;
        var a = colour ? 1 : traces;
        starTrace(r.out, 0, split * pathLength(r.out), a, colour);
        starTrace(r.up, 0, Math.min(r.len, travelled), a, colour);
        var shown = smooth((ct - r.arrive) / APPEAR_TIME) * (r.n === opts.keep || colour ? 1 : fade);
        if (shown > 0) drawShape(gridIcon(r.name), r.x, r.y, L.dsize, L.w, L.h, shown, colour ? 1 : (r.n === opts.keep ? opts.keepFill || 0 : 0));
    });
    if (opts.green !== undefined && opts.green >= 0) starTrace(net.stem, 0, pathLength(net.stem), 1, GREEN);
}
// Pointer n's middle in Connect: left behind in the middle, splitting into the row, then phasing along its route
// (in and out of sight, each in its own rhythm), gone as its device appears
function connectPlace(n, L, ctr) {
    var ct = connectT(), net = connectRoutes(L), r = net.routes[n];
    if (selectFrom !== null) return { x: 0, y: 0, alpha: 0, apart: 0 };   // Selection draws its own (its end)
    var stacked = [L.cx + ctr.x * L.size, L.rowY - ctr.y * L.size];
    var split = smooth((ct - C_SPLIT_FROM) / C_SPLIT);
    var at = [stacked[0] + (L.slots[n] - stacked[0]) * split, stacked[1] + (L.rowY - stacked[1]) * split];
    var alpha = 1;
    if (ct > C_TRAVEL_FROM) {
        at = along(r.up, Math.min(r.len, (ct - C_TRAVEL_FROM) / C_TRAVEL * net.longest));
        var flicker = 0.5 + 0.5 * Math.sin(Math.PI * 2 * 2.2 * ct + n * 1.7);
        alpha = 0.12 + 0.88 * smooth((flicker - 0.35) / 0.3);
        alpha *= 1 - smooth((ct - r.arrive) / 0.15);
    }
    return { x: at[0], y: at[1], alpha: alpha, apart: split };
}

// ---- Selection
// (s from its start, from the device list) Green grows from the iPhone along the laptop's route in the map, and
// the laptop fills green from the bottom up, as the rest fades;
// a pointer in each one's screen, moving exactly alike: out, a second of very fast spinning (ghost trails), to
// rest outside to the right, then changing together — keyboard, music note; the notes break up into stars that
// go to rebuild the device list (the laptop's route and the laptop staying green);
// then the green moves device to device every half second, all at once: laptop, Mac, HomePod, iPad, laptop; and
// then back to Connect's start: the drift icon made again in the iPhone from the devices' stars, the phone back
// in the middle
function selectT() { return reducedMotion ? 1e9 : clock - selectFrom; }
// The pointer's path, in each device's own terms (its screen's middle at 0, 0; 1 its size), so the two move
// exactly alike: appearing; out of the screen; a second of very fast circles drifting right, its ghosts
// trailing; settling outside to the right; then changing — pointer, keyboard, music note
var SEL_SPIN = Math.PI * 9;
function selPointer(st) {
    var t = st - SEL_POINTER_FROM;
    var p = { x: 0, y: 0, lag: 0, alpha: smooth(t / 0.3), icon: ["cursorarrow", 1] };
    if (t < 0) { p.alpha = 0; return p; }
    var outTo = [0.72, -0.18], restAt = [0.9, 0.04];
    var out = smooth((t - 0.3) / 0.4);
    p.x = outTo[0] * out;
    p.y = outTo[1] * out;
    var spin = (t - 0.7) / 1.0;
    if (spin > 0) {
        var s = Math.min(1, spin);
        var ring = 0.17 * Math.sin(Math.PI * s);
        var mid = [outTo[0] + (restAt[0] - outTo[0]) * s, outTo[1] + (restAt[1] - outTo[1]) * s];
        p.angle = SEL_SPIN * s;
        p.x = mid[0] + ring * Math.cos(p.angle);
        p.y = mid[1] + ring * Math.sin(p.angle);
        p.ring = ring;
        p.mid = mid;
        p.lag = Math.sin(Math.PI * s);
    }
    var toKeys = smooth((t - 2.1) / 0.3), toNote = smooth((t - 2.7) / 0.3);
    p.icon = toNote > 0 ? ["keyboard", 1 - toNote, "music.note", toNote] : ["cursorarrow", 1 - toKeys, "keyboard", toKeys];
    p.alpha *= 1 - smooth((st - SEL_REBUILD_FROM) / 0.15);   // the notes go as they break up
    return p;
}
var GHOST_ALPHAS = [0.18, 0.32, 0.55];
function drawSelPointer(sp, x, y, unit, L) {
    var size = unit * 0.42;
    if (sp.lag > 0.02) {
        GHOST_ALPHAS.forEach(function (ga, n) {
            var back = (GHOST_ALPHAS.length - n) * 0.45 * sp.lag;
            var gx = sp.mid[0] + sp.ring * Math.cos(sp.angle - back), gy = sp.mid[1] + sp.ring * Math.sin(sp.angle - back);
            drawShape(gridIcon("cursorarrow"), x + gx * unit, y + gy * unit, size, L.w, L.h, ga * sp.alpha * sp.icon[1]);
        });
    }
    for (var i = 0; i < sp.icon.length; i += 2) {
        if (sp.icon[i + 1] > 0) drawShape(gridIcon(sp.icon[i]), x + sp.x * unit, y + sp.y * unit, size, L.w, L.h, sp.alpha * sp.icon[i + 1]);
    }
}
// How far Selection's end has got (0 → 1): the drift icon assembling in the iPhone from the blue devices' stars
// (as the intro's comes from the labels), the green trace's stars making the home icon again below (the green
// laptop going), and the phone rising back to the middle
function selEnding() { return selectFrom === null ? 0 : smooth((selectT() - SEL_END_FROM) / SEL_END); }
var DRIFT_DOTS = null;   // the drift icon's dots that show when it's stacked: where the blue stars go
function drawSelectionEnd(L, net, end) {
    var phoneY = connectPhoneY(L, connectT());
    // The green trace's stars fly off, one after another, into the phone as it comes back up, fading as they go
    var tEnd = selectT() - SEL_END_FROM;
    var route = fullRoute(net, LAPTOP), routeLen = pathLength(route);
    for (var d = 0, k = 0; d <= routeLen; d += TRACE_STEP, k++) {
        var from = along(route, d), o = GHOST.offsets[(k * 7) % GHOST.offsets.length];
        var to = [L.cx + o[0] * L.size, phoneY - o[1] * L.size];
        var f = smooth((tEnd - (k % 11) * 0.055) / 0.5);
        starDot(from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f, GREEN, 1 - f, 2.6);
    }
    var laptop = net.routes[LAPTOP];
    var left = 1 - smooth(end * 2.5);
    if (left > 0) drawShape(gridIcon(laptop.name), laptop.x, laptop.y, L.dsize, L.w, L.h, left, 1);
    // The drift icon, assembled as in the intro: each of its dots sets off from one of the blue devices at its own
    // moment and flies across to its place in the pointers (in the phone, wherever it's got to), turning to its
    // own colour and brightness on the way; the devices going as their dots leave
    var t = selectT() - SEL_END_FROM;
    var leaving = Math.max(0, Math.min(1, t / SEL_DEPART));
    DRIFT_DOTS = DRIFT_DOTS || GHOST.offsets.filter(function (o) { return !o[4]; });
    [0, 2, 3].forEach(function (n) {
        var r = net.routes[n];
        if (leaving < 1) drawShape(gridIcon(r.name), r.x, r.y, L.dsize, L.w, L.h, 1 - leaving);
    });
    DRIFT_DOTS.forEach(function (o, k) {
        var n = [0, 2, 3][k % 3], r = net.routes[n], src = gridIcon(r.name).offsets;
        var s0 = src[(k * 7) % src.length];
        var p = (t - ((k * 0.618) % 1) * SEL_DEPART) / GHOST_FLY;   // it set off at 0
        if (p <= 0) return;
        p = Math.min(1, p);
        var e = p * p * (3 - 2 * p);
        var from = [r.x + s0[0] * L.dsize, r.y - s0[1] * L.dsize];
        var to = [L.cx + o[0] * L.size, phoneY - o[1] * L.size];
        var start = iceRGB(0.5 - s0[1]), wave = iceRGB(0.5 - o[1] + 0.12 * Math.sin(clock * 1.6 + o[1] * 7));
        var c = [start[0] + (wave[0] - start[0]) * e, start[1] + (wave[1] - start[1]) * e, start[2] + (wave[2] - start[2]) * e];
        starDot(from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e, c, 1 + (o[2] - 1) * e,
            3.2 * (1 + 0.22 * Math.sin(clock * 2.4 + k * 0.6)) * Math.min(1, L.size / 200 + 0.35));
    });
}
function drawSelection(L) {
    var st = selectT();
    var net = connectRoutes(L);
    if (st >= SEL_END_FROM) return drawSelectionEnd(L, net, selEnding());
    var rebuilt = smooth((st - SEL_REBUILD_FROM) / SEL_REBUILD);
    var cycling = st >= SEL_CYCLE_FROM;
    var greenAt = cycling ? SEL_CYCLE[Math.min(SEL_CYCLE.length - 1, Math.floor((st - SEL_CYCLE_FROM) / SEL_STEP))] : LAPTOP;
    // The device list: fading as the laptop's chosen, the devices back as it's rebuilt (its blue traces not — from
    // then on only the green one shows, going round them)
    var gone = 1 - smooth((st - SEL_FADE_FROM) / SEL_FADE);
    drawConnect(L, rebuilt >= 1 ? { green: greenAt, traces: 0 }
        : { fade: Math.max(gone, rebuilt), traces: gone, keep: LAPTOP, keepFill: smooth((st - SEL_GREEN) / SEL_FILL) });
    // The green line: grown from the phone along the laptop's route in the map (once rebuilt, the map draws it)
    if (rebuilt < 1) {
        var route = fullRoute(net, LAPTOP);
        starTrace(route, 0, Math.min(1, st / SEL_GREEN) * pathLength(route), 1, GREEN);
    }
    // A pointer in each one's screen, moving alike (the laptop's screen a little above its middle)
    var sp = selPointer(st);
    var phoneY = L.phoneEnd, laptopY = L.devY - L.dsize * 0.075, laptopX = L.devX[LAPTOP];
    if (sp.alpha > 0) {
        drawSelPointer(sp, L.cx, phoneY, L.phone, L);
        drawSelPointer(sp, laptopX, laptopY, L.dsize, L);
    }
    // The notes breaking up: their stars flying out to the devices being rebuilt
    if (rebuilt > 0 && rebuilt < 1) {
        var note = gridIcon("music.note"), others = [0, 2, 3];
        [[L.cx + sp.x * L.phone, phoneY + sp.y * L.phone, L.phone], [laptopX + sp.x * L.dsize, laptopY + sp.y * L.dsize, L.dsize]]
            .forEach(function (at, which) {
                note.offsets.forEach(function (o, k) {
                    var dev = others[(k + which) % others.length];
                    var t2 = gridIcon(LIST[dev]).offsets[(k * 5) % gridIcon(LIST[dev]).offsets.length];
                    var from = [at[0] + o[0] * at[2] * 0.42, at[1] - o[1] * at[2] * 0.42];
                    var to = [L.devX[dev] + t2[0] * L.dsize, L.devY - t2[1] * L.dsize];
                    starDot(from[0] + (to[0] - from[0]) * rebuilt, from[1] + (to[1] - from[1]) * rebuilt, iceRGB(0.4), 1 - rebuilt, 2.2);
                });
            });
    }
}

// ---- The drift icon's pointers: flying in from the labels (the intro), stacked in the middle, and wherever Home
// or Connect takes them (each part saying where each pointer's middle is, and how far they've come apart: the
// dots a nearer pointer hid showing as they do)
function drawGhost(L) {
    if (retractFrom === null || pointerAway()) return;   // none while the whole HUD shows, or it's on the buttons
    var size = L.size;
    var rt = (reducedMotion ? 1e9 : clock) - retractFrom;
    // (Walkthrough's end: every pointer sliding into the icon's middle, the ghosts fading as they go, the front one
    // left on its own; and back out again, and moved about, as the device list starts)
    var C = clicking() ? clickGeom(L) : null;
    var pose = C ? clickPose(L, C) : walkFrom === null ? null : rcScreen === "media" && mediaFrom !== null ? mediaPose(L)
        : rcScreen === "trackpad" && pickFrom !== null ? pickPose(L) : rcScreen === "trackpad" && trackFrom !== null ? trackPose(L) : rcScreen === "share" && shareFrom !== null ? sharePose(L) : rcScreen === "cast" && castPart ? castPose(L) : rcScreen === "off" && offFrom !== null ? offPose(L)
        : rcScreen === "list" && listFrom !== null ? listPose(L) : null;
    var merge = pose ? pose.merge : walkFrom !== null ? smooth((walkT() - WALK_MERGE_FROM) / WALK_MERGE) : 0;
    var dx = pose ? pose.dx : 0, dy = pose ? pose.dy : 0;
    var front = GHOST.centres.length - 1;
    for (var k = 0; k < GHOST.offsets.length; k++) {
        var o = GHOST.offsets[k], src = GHOST.from[k];
        var wd = WORDS[src.word];
        var p = (rt - wd.gone(src.along)) / GHOST_FLY;   // its letter went at 0
        if (p <= 0) continue;
        p = Math.min(1, p);
        var e = p * p * (3 - 2 * p);
        var ctr = GHOST.centres[o[3]];
        var place = homeFrom !== null ? tripPlace(HOME, o[3], L, ctr) : linkFrom !== null ? tripPlace(LINK, o[3], L, ctr)
            : settingsFrom !== null ? tripPlace(SETTINGS, o[3], L, ctr)
            : connectFrom !== null && !C ? connectPlace(o[3], L, ctr) : null;
        if (o[4] && !(place && place.apart > 0)) continue;   // behind a nearer pointer, while they're stacked
        if (place && place.alpha <= 0) continue;
        var tx, ty;
        if (place) {
            tx = place.x + (o[0] - ctr.x) * size;
            ty = place.y - (o[1] - ctr.y) * size;
        } else {
            tx = L.cx + (o[0] - ctr.x * merge) * size + dx;
            ty = L.rowY - (o[1] - ctr.y * merge) * size + dy;
        }
        if (merge >= 1 && o[3] !== front) continue;
        var start = wd.box ? [wd.box.left + wd.box.width * src.along, wd.box.y] : [tx, ty];
        var x = start[0] + (tx - start[0]) * e, y = start[1] + (ty - start[1]) * e;
        var wave = iceRGB(0.5 - o[1] + 0.12 * Math.sin(clock * 1.6 + o[1] * 7));
        var c = [wd.colour[0] + (wave[0] - wd.colour[0]) * e, wd.colour[1] + (wave[1] - wd.colour[1]) * e,
            wd.colour[2] + (wave[2] - wd.colour[2]) * e];
        var r = 3.2 * (1 + 0.22 * Math.sin(clock * 2.4 + k * 0.6)) * Math.min(1, size / 200 + 0.35);
        var bright = (1 + (o[2] - 1) * e) * (o[4] ? place.apart : 1) * (place ? place.alpha : 1)
            * (o[3] === front ? 1 : 1 - merge);
        starDot(x, y, c, bright, r);
    }
}
