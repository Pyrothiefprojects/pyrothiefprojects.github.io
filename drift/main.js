// Drift Remote's tutorial (drift.html), 5 of 5: each frame, drawing whatever's playing and placing the HUD

// ---------------- The frame ----------------
var last = performance.now();
var hudDrop = 0;          // px down, so the whole HUD (not just the icon) is centred on the screen
function tick(now) {
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    var w = window.innerWidth, h = window.innerHeight;
    if (!show.paused()) {   // (held while the show's song is paused, or ▶ Play's is)
        ambient += dt;
        if (!dialog.held(dt)) clock += dt;   // (and for a line's pause)
    }
    show.frame(dt, w, h);              // (the song: the scenes it's reached, the effects just now)
    stepParts();
    FEATURE.spread += ((FEATURE.hover ? 1 : 0) - FEATURE.spread) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 8));
    // The iPhone by its HUD: a third of the view high (narrower on a phone), as on the home page
    var size = Math.min(h * 0.3, w * 0.55);
    var cx = w / 2, cy = h / 2 + hudDrop;
    var hudNow = amounts(reducedMotion && retractFrom === null ? 1e9 : clock);   // how much of the HUD shows
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    g.clearRect(0, 0, w, h);
    var catching = catchStars;   // (Disconnect's burst: this frame's stars caught, for the sphere to build from)
    if (catching) show.capture(true);
    show.transform(g, w, h);   // (Pulse's swell, Spin kick's twist)
    if (blank || sphereFrom) {
        // nothing yet (or, once Disconnect's burst has handed its stars over, nothing more: the sphere's built from them)
    } else if (gridFrom >= 0) {
        drawGrid(w, h);

    } else if (rowFrom < 0) {
        // The iPhone (where Home or Connect has it), what they've drawn, the connection icon, and the drift icon's
        // pointers (coming in as the intro's labels go)
        var M = walkFrom !== null ? linkedNow(w, h, cx, cy) : null;   // (the remote's screens: over to the right)
        var L = layout(w, h, M ? M.cx : cx, cy, size);
        if (M) L.bigMax = M.big;
        var trip = homeFrom !== null ? HOME : linkFrom !== null ? LINK : settingsFrom !== null ? SETTINGS : null;
        var P = trip ? tripPhone(trip, L, tripT(trip)) : { x: L.cx, y: cy, scale: 1 };
        var W = walkFrom !== null ? walkGeom(L) : null;
        var C = clicking() ? clickGeom(L) : null;   // (Device row's start: the big phone shrinking back)
        var turned = W && landTurn() > 0;   // (Landscape: the phone and its upright view turning sideways)
        if (turned) {
            g.save();
            g.translate(P.x, cy);
            g.rotate(-Math.PI / 2 * landTurn());
            g.translate(-P.x, -cy);
        }
        drawShape(W || C ? BIG_SCREEN : SHAPES.iphone, P.x, connectFrom !== null ? connectPhoneY(L, connectT()) : P.y,
            W ? W.size : C ? C.size : size * P.scale, w, h);
        if (W) {
            drawWalk(L, W);
            if (rcScreen) drawRC(L, W, rcScreen);   // (the remote's screens)
        } else if (C) drawClick(L, C);
        else if (homeFrom !== null) drawTrip(HOME, L);
        else if (homeIcon) drawHomeIcon(L);
        if (turned) {
            g.restore();
            drawLand(L, W, smooth((landTurn() - 0.6) / 0.35));   // (the landscape view, upright on the screen)
        }
        if (W && (RC_LINKED[rcScreen] || rcScreen === "share" || rcScreen === "off")) drawLinked(L, W, rcScreen);   // (the MacBook, not turned)
        if (linkFrom !== null) drawTrip(LINK, L);
        else if (broadcast && !W && !C) drawBroadcast(L, 1);
        if (settingsFrom !== null) drawTrip(SETTINGS, L);
        else if (cog && !W) drawCog(L, 1);
        if (selectFrom !== null) drawSelection(L);
        else if (connectFrom !== null && !C) drawConnect(L);
        drawGhost(L);
        dialog.place(L, W);
    } else {
        // The row: as wide as the screen allows, across the middle
        var slot = Math.min(w * 0.92 / ROW.length, 240);
        var rowSize = Math.min(slot * 0.8, h * 0.24);
        ROW.forEach(function (key, i) {
            drawShape(SHAPES[key], w / 2 + (i - (ROW.length - 1) / 2) * slot, h / 2, rowSize, w, h);
        });
    }
    if (blank || sphereFrom || rowFrom >= 0 || gridFrom >= 0) dialog.place(null, null);
    if (catching) {
        catchStars = false;
        sphereFrom = show.capture(false);
    }
    hud.classList.toggle("shown", !blank && !sphereFrom && rowFrom < 0 && gridFrom < 0);   // the HUD only with the iPhone on its own
    scroller.classList.toggle("on", gridFrom >= 0);

    // The HUD around it; then the whole of it (the top of the name to the bottom of the lowest thing) centred —
    // held still while it retracts, so the icon doesn't move as the text goes
    layoutHud(cx, cy, size * 0.5, hudNow);
    if (retractFrom === null) measureWords();
    if (retractFrom === null) {
        var headTop = hudHead.getBoundingClientRect().top;
        var bottom = hudFoot.getBoundingClientRect().bottom;
        hudLabels.forEach(function (el) { bottom = Math.max(bottom, el.getBoundingClientRect().bottom); });
        hudDrop += (h / 2 - (headTop + bottom) / 2) * (reducedMotion ? 1 : 0.2);
    }
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
