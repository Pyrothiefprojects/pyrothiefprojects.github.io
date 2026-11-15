// Drift Remote's tutorial (drift.html): the dialog — each scene's lines (each part's `dialog`, in tutorial.js), typed
// in like the HUD's labels at their places in the picture, the scene held still for each one's pause. The tutorial sees
// `dialog`: step (a part's lines coming due), held (the clock to hold), place (each frame: where they go), arrive
// (when a device in the device row appears), and saved / load (each line's words, pause and place, for the show's
// file), and playPicked (▶ in the player: a picked line's segment alone). It also keeps #edit's Dialog menu (the lines to
// pick, move, edit and play alone, each pause's footprint on the song)

var dialog = (function () {
    var layer = document.getElementById("dialog");
    var TYPE_RATE = 40;   // letters a second, as the HUD's labels
    var FADE = 0.3;       // s going
    var EDGE = 8;         // px a line's kept in from the screen's edges
    var showing = [];     // each line showing: { line, el, born (real s), goneAt (real s, once it's going) }
    var hold = 0;         // real s left of the scene held still
    var part = -1, fired = {};
    var geo = { L: null, W: null };
    var pose = null;      // the line picked in #edit: { i, n, line, el, text, u }, its scene held at its moment
    var segment = null;   // …or playing its segment on its own (▶ in the player): { i, n, on (its pause begun) }
    var wall = 0;         // real s gone by, but while it's all paused (▶ Play paused, or the show's song)
    function now() { return wall; }
    function atOf(line) { return typeof line.at === "function" ? line.at() : line.at; }

    function begin(line, n) {
        follow(part, n);
        if (segment && PARTS[segment.i].dialog[segment.n] === line) { segment.on = true; segment.end = wall + (line.moving ? line.pause : 0); }
        if (line.pause && !line.moving) hold = Math.max(hold, line.pause);   // (moving: the scene going on, the line on that long)
        showing.forEach(function (s) { if (s.until === "next" && !s.goneAt) s.goneAt = now(); });
        if (!line.text) return;   // (a hold, with no words)
        var el = document.createElement("div");
        el.className = "dialog";
        layer.appendChild(el);
        var born = now();
        showing.push({
            // (no pause: on, the scene going on, till its part's next line, or its end)
            line: line, el: el, born: born, until: line.until !== undefined ? line.until : line.pause ? undefined : "next",
            // (a long line typed quicker, so it's all there with time to read it — in its pause, or soon)
            rate: Math.max(TYPE_RATE, line.text.length / (line.pause ? line.pause * 0.6 : 1.2)),
            goneAt: line.until === undefined && line.pause ? born + line.pause : 0
        });
    }
    function clear(carry) {   // (carry: ▶ Play on to the next part — a line that's on for its time, not holding, carries on)
        var t = now();
        showing.forEach(function (s) {
            if (carry && s.line.moving && s.goneAt > t) return;
            if (!s.goneAt || s.goneAt > t) s.goneAt = t;
        });
        hold = 0;
    }
    // A step on (from stepParts): the playing part's lines whose moment has come. A part started partway (the show's
    // timeline, sought into it) skips the lines it's already past. A line picked in #edit holds it all
    function step() {
        if (pose) {
            if (playing === pose.i) return;
            unpose();
        }
        if (segment && playing !== segment.i) segment = null;
        var t = playing >= 0 ? clock - partFrom : 0;
        if (playing !== part) {
            clear(playAll);
            part = playing;
            fired = {};
            follow(part, -1);
            if (part >= 0) (PARTS[part].dialog || []).forEach(function (line, n) { if (atOf(line) < t - 0.05) fired[n] = true; });
        }
        if (part < 0) return;
        (PARTS[part].dialog || []).forEach(function (line, n) {
            if (fired[n] || t < atOf(line)) return;
            fired[n] = true;
            begin(line, n);
        });
        showing.forEach(function (s) { if (typeof s.until === "number" && t >= s.until && !s.goneAt) s.goneAt = now(); });
    }
    // Whether the scene's held just now (before the clock moves on)
    function held(dt) {
        wall += dt;
        if (pose) return true;
        if (segment && segment.on && hold <= 0 && wall >= segment.end) {   // (its segment over: back to the line, held)
            var s = segment;
            segment = null;
            pick(s.i, s.n);
            return true;
        }
        if (hold <= 0) return false;
        hold -= dt;
        return true;
    }

    // Typed as far as count letters, as the HUD's labels are (showLetters), the rest there but unseen (so a centred line
    // doesn't shift as it types)
    function type(el, full, count) {
        count = Math.max(0, Math.min(full.length, Math.floor(count)));
        if (el.dataset.shown === String(count) && el.dataset.full === full) return;
        el.textContent = full.slice(0, count);
        if (count < full.length) {
            var yet = document.createElement("span");
            yet.className = "yet";
            yet.textContent = full.slice(count);
            el.appendChild(yet);
        }
        el.dataset.shown = String(count);
        el.dataset.full = full;
    }
    // Where each line goes: [across, down, how wide (px), u (px in its unit: its phone's size — the normal phone's
    // height / 100, or the big phone's / 250)], from the picture's own geometry just now
    function spot(where) {
        var L = geo.L, W = geo.W;
        if (!L || !where) return null;
        var wide = Math.min(420, L.w - 32), u = L.phone / 100;
        if (where === "aboveBigPhone" || where === "abovePhoneSmall") return [L.cx, L.rowY - L.phone * 0.5 - 30, wide, u];
        if (where === "devicesBand") return [L.cx, (L.devBottom + L.phoneEnd - L.phone * 0.45) / 2, wide, u];
        if (where.indexOf("aboveDevice:") === 0) {
            var r = connectRoutes(L).routes[+where.split(":")[1]];
            return [r.x, L.devY - L.dsize * 0.55 - 12, 160, u];
        }
        if (!W) return null;
        u = W.size / 250;
        if (where === "walkMiddle") return [L.cx, (L.rowY + W.row.icon[1] + W.row.iconSize * 0.5) / 2, W.size * 0.3, u];
        if (where === "aboveLandscape") return [L.cx, landGeom(L, W).Y(0) - 28, Math.min(520, L.w - 32), u];
        var G = rcGeom(L, W, rcScreen || "trackpad"), inPhone = G.k * 340;
        if (where === "bigPhoneTop") return [L.cx, G.Y(70), inPhone, u];
        if (where === "belowList") return [L.cx, G.Y(rcScreen === "share" || rcScreen === "off" ? 310 : 380), inPhone, u];
        if (where === "bigPhoneScreen") return [L.cx, G.Y(Math.min(110, G.panelTop * 0.22)), inPhone, u];
        if (where === "aboveKeys") {
            var C = castGeom(G);
            return [L.cx, G.Y((C.ph + 60 + G.panelTop) / 2), inPhone, u];
        }
        if (where === "trackpad") {
            if (rcScreen === "cast" || rcScreen === "share" || rcScreen === "off") {   // (the shared screen's)
                var P = castGeom(G).pad;
                return [G.X(P[0] + P[2] / 2), G.Y(P[1] + P[3] * 0.72), inPhone, u];
            }
            return [L.cx, G.Y(G.H * 0.75), inPhone, u];
        }
        return null;
    }
    // A line's box just now: its spot, moved as it's been in #edit (dx, dy, in its unit), as wide as set there (wide)
    function box(line) {
        var at = spot(line.where);
        if (!at) return null;
        return { x: at[0] + (line.dx || 0) * at[3], y: at[1] + (line.dy || 0) * at[3], wide: line.wide ? line.wide * at[3] : Math.max(140, at[2]), u: at[3] };
    }
    function put(el, b) {   // (its middle there, but all of it kept on the screen)
        el.style.maxWidth = b.wide + "px";
        var hw = el.offsetWidth / 2, hh = el.offsetHeight / 2, L = geo.L;
        el.style.left = Math.max(hw + EDGE, Math.min(L.w - hw - EDGE, b.x)) + "px";
        el.style.top = Math.max(hh + EDGE, Math.min(L.h - hh - EDGE, b.y)) + "px";
    }
    // Each frame (from the tutorial's tick, with the layout it's drawn with; none: nothing to place against): each line
    // to its place, typed as far as it's got, going once its time's up; the picked one there in full
    function place(L, W) {
        heardLength();
        geo.L = L;
        geo.W = W;
        var t = now();
        showing = showing.filter(function (s) {
            var going = s.goneAt && t >= s.goneAt ? (t - s.goneAt) / FADE : 0;
            if (going >= 1) { layer.removeChild(s.el); return false; }
            var b = box(s.line);
            if (!b) { s.el.style.opacity = 0; return true; }
            s.el.style.opacity = 1 - going;
            type(s.el, s.line.text, (t - s.born) * s.rate);
            put(s.el, b);
            return true;
        });
        if (pose) {
            var b = box(pose.line);
            pose.el.style.display = b ? "" : "none";
            if (!b) return;
            pose.u = b.u;
            if (pose.text.textContent !== pose.line.text) pose.text.textContent = pose.line.text;
            put(pose.el, b);
        }
    }
    // When device n appears in the device row (s from its pointers setting off: the part's own time, less D_START)
    function arrive(n) { return geo.L ? connectRoutes(geo.L).routes[n].arrive : C_TRAVEL_FROM + C_TRAVEL; }

    // ---------------- #edit: a line picked — its scene held at its moment, the line there in full ----------------
    // Dragged to move it, its handle to set how wide it is (both in its unit, so it keeps its place against the phone
    // on any screen); its words and pause edited below the timeline. Done: the scene plays on from there, the line
    // typed in and held as it is in the run
    function posing(i, n) {
        var line = PARTS[i].dialog[n], was = clock;
        unpose();
        clock = was - atOf(line);   // (the scene started that long ago, as the show's timeline joins one partway)
        playPart(i, false);
        clock = was;
        clear();
        part = -1;   // (its lines worked out afresh once it's let go: this one coming due then)
        var el = document.createElement("div"), text = document.createElement("span"), grip = document.createElement("span");
        el.className = "dialog posed";
        grip.className = "grip";
        grip.title = "Drag: how wide it is";
        el.appendChild(text);
        el.appendChild(grip);
        layer.appendChild(el);
        layer.classList.add("posing");
        pose = { i: i, n: n, line: line, el: el, text: text, u: 1 };
        drag(el, grip);
        refresh();
    }
    function unpose() {
        if (!pose) return;
        letGo();
        show.mark(null);
        refresh();
    }
    function letGo() {
        layer.removeChild(pose.el);
        layer.classList.remove("posing");
        pose = null;
    }
    // Picked from the Dialog menu (or its footprint): held there, the song's slider at its moment, its segment marked
    function pick(i, n) {
        segment = null;
        posing(i, n);
        var from = plan().from[key(i, n)], line = PARTS[i].dialog[n];
        show.cue(from);
        show.mark(from, from + (line.pause || 0));
    }
    // ▶ in the player with a line picked: just its segment — the scene on from its moment, the line typed in and held
    // for its pause, the song over it; then back to the line, held. Again while it plays: back now
    function playPicked() {
        if (segment) {
            var s = segment;
            segment = null;
            pick(s.i, s.n);
            return true;
        }
        if (!pose) return false;
        var from = plan().from[key(pose.i, pose.n)];
        segment = { i: pose.i, n: pose.n, on: false };
        show.span(from, from + (pose.line.pause || 0));
        letGo();   // (the line comes due straight away: its part's lines worked out afresh)
        refresh();
        return true;
    }
    function drag(el, grip) {
        el.addEventListener("pointerdown", function (e) {
            if (!pose) return;
            e.preventDefault();
            var line = pose.line, sizing = e.target === grip, sx = e.clientX, sy = e.clientY;
            var dx = line.dx || 0, dy = line.dy || 0, wide = el.offsetWidth;
            if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
            function move(ev) {
                var u = pose ? pose.u : 1;
                if (sizing) line.wide = Math.round(Math.max(60, wide + 2 * (ev.clientX - sx)) / u * 10) / 10;   // (both sides: it's centred)
                else {
                    line.dx = Math.round((dx + (ev.clientX - sx) / u) * 10) / 10;
                    line.dy = Math.round((dy + (ev.clientY - sy) / u) * 10) / 10;
                }
                readPlace();
            }
            function up() {
                el.removeEventListener("pointermove", move);
                el.removeEventListener("pointerup", up);
                el.removeEventListener("pointercancel", up);
                refresh();
            }
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerup", up);
            el.addEventListener("pointercancel", up);
        });
    }
    document.addEventListener("keydown", function (e) { if (pose && e.key === "Escape") unpose(); });

    // ---------------- #edit's Dialog: the list ----------------
    // Each card numbered (n/18), its lines: each to pick, its moment in ▶ Play's run with Music (every scene in order from
    // 0:00, pauses and all), its pause (s, to 0.1: how long the scene's held — a line that lingers still goes when its
    // scene says); the run's total under it, and each pause's footprint on the song under its timeline. Saved with the
    // show's file
    var cards = [];   // the tutorial's parts, in ▶ Play's order
    for (var c = nextPart(-1); c >= 0; c = nextPart(c)) cards.push(c);
    var fields = [], whens = [], texts = [], rows = [], heads = [], miniTotal = null;
    var lane = document.getElementById("dialogLane"), mini = document.getElementById("dialogMini");
    var songLength = NaN;
    var PLACEHOLDER = "(a pause, no words)";
    function key(i, n) { return PARTS[i].name + "/" + n; }
    function cardName(i) { return (cards.indexOf(i) + 1) + "/" + cards.length + " " + PARTS[i].name; }
    function clockText(sec) {
        var m = Math.floor(sec / 60), s = sec - m * 60;
        return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1);
    }
    function signed(v) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1); }
    function placeText(line) {
        return (line.where || "nowhere") + (line.dx || line.dy ? " · moved " + signed(line.dx || 0) + ", " + signed(line.dy || 0) : "") +
            (line.wide ? " · " + line.wide.toFixed(1) + " wide" : "");
    }
    // Each line's moment in the run (s, by key) and the run's whole length: each scene's own length and its pauses (lines
    // coming at the same moment held together, for the longest of their pauses)
    function plan() {
        var t = 0, from = {};
        cards.forEach(function (i) {
            var held = 0, at = -1, most = 0;
            (PARTS[i].dialog || []).map(function (line, n) { return { line: line, n: n, at: atOf(line) }; })
                .sort(function (a, b) { return a.at - b.at || a.n - b.n; })
                .forEach(function (d) {
                    if (d.at !== at) { held += most; most = 0; at = d.at; }
                    from[key(i, d.n)] = t + d.at + held;
                    most = Math.max(most, d.line.moving ? 0 : d.line.pause || 0);   // (moving: on screen, the run not held)
                });
            t += PARTS[i].length + held + most;
        });
        return { from: from, total: t };
    }
    function add(box, tag, cls, text) {
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text !== undefined) el.textContent = text;
        box.appendChild(el);
        return el;
    }
    function pauseBox(line, label) {
        var input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.max = "30";
        input.step = "0.1";
        input.value = line.pause.toFixed(1);
        input.setAttribute("aria-label", label);
        input.addEventListener("input", function () {
            var v = parseFloat(input.value);
            if (!isFinite(v) || v < 0) return;
            line.pause = Math.round(Math.min(30, v) * 10) / 10;
            refresh(input);
        });
        input.addEventListener("change", function () { input.value = line.pause.toFixed(1); });
        return input;
    }
    // #edit's: each line (a click on its words picks it), its moment, its pause
    function buildMini() {
        cards.forEach(function (i) {
            var head = add(mini, "button", "card", cardName(i));
            head.type = "button";
            head.title = "Play " + PARTS[i].name;
            head.addEventListener("click", function () { segment = null; unpose(); playPart(i, false); });
            heads.push({ i: i, el: head });
            var lines = PARTS[i].dialog || [];
            if (!lines.length) add(mini, "div", "line none", "No dialog");
            lines.forEach(function (line, n) {
                var row = add(mini, "div", "line");
                add(row, "span", "num", n + 1);
                whens.push({ key: key(i, n), el: add(row, "span", "when") });
                var words = add(row, "span", "words");
                words.title = "Show it in its scene, to move and edit";
                words.addEventListener("click", function () { pick(i, n); });
                texts.push({ line: line, el: words });
                rows.push({ i: i, n: n, el: row });
                if (line.pause === undefined) add(row, "span", "stays", "no pause");
                else {
                    var input = pauseBox(line, "Pause for " + cardName(i) + " line " + (n + 1) + " (s)");
                    row.appendChild(input);
                    fields.push({ line: line, input: input, key: key(i, n), unit: add(row, "span", "unit", "s") });
                }
            });
        });
        miniTotal = add(mini, "div", "total");
    }
    // The picked line's own: its words, pause and place, put back, done
    var edit = document.getElementById("dialogEdit");
    var editHead = add(edit, "div", "head"), editWords = add(edit, "textarea", "words");
    editWords.rows = 2;
    editWords.setAttribute("aria-label", "Its words");
    editWords.addEventListener("input", function () {
        if (!pose || pose.line.text === undefined) return;
        pose.line.text = editWords.value;
        refresh(editWords);
    });
    var editPauseRow = add(edit, "label", "pause", "Pause ");
    var editPause = add(editPauseRow, "input");
    editPause.type = "number";
    editPause.min = "0";
    editPause.max = "30";
    editPause.step = "0.1";
    var editUnit = add(editPauseRow, "span", "unit", " s");
    // Holding the scene for it (the pause: the scene still that long), or not (moving: the scene going on, the line on
    // that long before it fades)
    var editHoldsRow = add(edit, "label", "holds"), editHolds = add(editHoldsRow, "input");
    editHolds.type = "checkbox";
    add(editHoldsRow, "span", null, " Holds the scene");
    editHolds.addEventListener("change", function () {
        if (!pose) return;
        if (editHolds.checked) delete pose.line.moving;
        else pose.line.moving = true;
        refresh();
    });
    editPause.addEventListener("input", function () {
        var v = parseFloat(editPause.value);
        if (!pose || pose.line.pause === undefined || !isFinite(v) || v < 0) return;
        pose.line.pause = Math.round(Math.min(30, v) * 10) / 10;
        refresh(editPause);
    });
    var editPlace = add(edit, "span", "place");
    editPlace.title = "Moved and wide in its unit: its phone's size, so it keeps its place on any screen";
    var resetButton = add(edit, "button", null, "Reset place");
    resetButton.type = "button";
    resetButton.addEventListener("click", function () {
        if (!pose) return;
        delete pose.line.dx;
        delete pose.line.dy;
        delete pose.line.wide;
        refresh();
    });
    var doneButton = add(edit, "button", "done", "Done ▶");
    doneButton.type = "button";
    doneButton.title = "Play on from here (Escape too)";
    doneButton.addEventListener("click", unpose);
    function readPlace() { if (pose) editPlace.textContent = placeText(pose.line); }
    // Following along as it plays: the part playing's card lit, the line just begun lit (n -1: none yet), each scrolled to
    function follow(i, n) {
        heads.forEach(function (h) { h.el.classList.toggle("on", h.i === i); });
        var to = null;
        rows.forEach(function (r) {
            var now = r.i === i && r.n === n;
            r.el.classList.toggle("now", now);
            if (now) to = r.el;
        });
        if (!to) heads.forEach(function (h) { if (h.i === i) to = h.el; });
        if (to && !menu.hidden && !menu.classList.contains("folded") && to.scrollIntoView) to.scrollIntoView({ block: "nearest" });
    }
    // Everything that follows from the lines' settings, again (but the box being typed in)
    function refresh(typing) {
        var P = plan();
        fields.forEach(function (f) {
            if (f.input !== typing) f.input.value = f.line.pause.toFixed(1);
            f.unit.textContent = f.line.moving ? "s on" : "s";
            f.unit.title = f.line.moving ? "On screen that long, the scene going on" : "The scene held that long";
        });
        whens.forEach(function (w) { w.el.textContent = clockText(P.from[w.key]); });
        texts.forEach(function (t) {
            t.el.textContent = t.line.text || (t.line.text === "" ? "(no words yet)" : t.line.note ? "(" + t.line.note + ")" : PLACEHOLDER);
        });
        var picked = pose || segment;
        rows.forEach(function (r) { r.el.classList.toggle("picked", !!picked && picked.i === r.i && picked.n === r.n); });
        edit.hidden = !picked;
        if (pose) {
            editHead.textContent = cardName(pose.i) + " · line " + (pose.n + 1) + " · at " + atOf(pose.line).toFixed(1) + " s";
            editWords.disabled = pose.line.text === undefined;
            if (typing !== editWords) editWords.value = pose.line.text || "";
            editPause.disabled = editHolds.disabled = pose.line.pause === undefined;
            editHolds.checked = !pose.line.moving;
            editUnit.textContent = pose.line.moving ? " s on" : " s";
            if (typing !== editPause) editPause.value = pose.line.pause === undefined ? "" : pose.line.pause.toFixed(1);
            readPlace();
        }
        var left = songLength - P.total;
        miniTotal.textContent = "Total " + clockText(P.total) + (isFinite(left) ?
            " · " + Math.abs(left).toFixed(1) + " s " + (left >= 0 ? "left for the sphere" : "over the song") + " (" + clockText(songLength) + ")" : "");
        miniTotal.classList.toggle("over", left < 0);
        sum.textContent = clockText(P.total);
        drawLane(P);
    }
    // Each pause's footprint, on a line of its own under the timeline (a click: picks its line)
    function drawLane(P) {
        lane.innerHTML = "";
        if (lane.hidden || !isFinite(songLength) || !songLength) return;
        cards.forEach(function (i, c) {
            (PARTS[i].dialog || []).forEach(function (line, n) {
                if (!line.pause) return;
                var at = P.from[key(i, n)], seg = document.createElement("span");
                seg.className = (c % 2 ? "odd" : "even") + (line.moving ? " moving" : "");
                seg.style.left = (at / songLength * 100) + "%";
                seg.style.width = Math.max(0.3, line.pause / songLength * 100) + "%";
                seg.title = cardName(i) + " (" + (n + 1) + "): " + clockText(at) + " – " + clockText(at + line.pause) + (line.text ? " · " + line.text : "");
                seg.addEventListener("click", function () { pick(i, n); });
                lane.appendChild(seg);
            });
        });
    }
    buildMini();
    // The Dialog menu (#edit's, on the right): moved by its title bar, folded up to it and opened again
    var menu = document.getElementById("dialogMenu"), sum = document.getElementById("dialogSum");
    menu.hidden = lane.hidden = location.hash !== "#edit";
    movable(menu, document.getElementById("dialogHead"));
    var expand = document.getElementById("dialogExpand");
    expand.addEventListener("click", function () {
        var folded = menu.classList.toggle("folded");
        expand.setAttribute("aria-expanded", folded ? "false" : "true");
        expand.innerHTML = folded ? "&#9633;" : "&#8211;";
        expand.title = folded ? "Open it" : "Fold it up";
    });
    // The song's length, once it's known (for the total's time left, and the footprints); the totals first worked out on
    // the first frame (once `dialog`'s here: Device row's lines ask it when each device appears)
    var worked = false;
    function heardLength() {
        var len = show.duration();
        if (isFinite(len) && len !== songLength) { songLength = len; worked = false; }
        if (!worked) { worked = true; refresh(); }
    }

    // The show's file: each card's lines as #edit left them ({ part's name: [{ text, pause, dx, dy, wide }] } — or an
    // older file's pauses alone, each a number; moving: true for one that doesn't hold the scene)
    function saved() {
        var out = {};
        PARTS.forEach(function (p) {
            if (p.dialog) out[p.name] = p.dialog.map(function (l) {
                var o = {};
                if (l.text !== undefined) o.text = l.text;
                if (l.pause !== undefined) o.pause = l.pause;
                ["dx", "dy", "wide", "moving"].forEach(function (k) { if (l[k]) o[k] = l[k]; });
                return o;
            });
        });
        return out;
    }
    function load(file) {
        PARTS.forEach(function (p) {
            var list = file[p.name];
            if (!list || !p.dialog) return;
            p.dialog.forEach(function (l, n) {
                var o = typeof list[n] === "number" ? { pause: list[n] } : list[n];
                if (!o) return;
                if (l.text !== undefined && typeof o.text === "string") l.text = o.text;
                if (l.pause !== undefined && typeof o.pause === "number") l.pause = o.pause;
                ["dx", "dy", "wide"].forEach(function (k) { if (typeof o[k] === "number") l[k] = o[k]; });
                if (o.moving === true) l.moving = true; else delete l.moving;
            });
        });
        refresh();
    }

    return { step: step, held: held, place: place, arrive: arrive, saved: saved, load: load, playPicked: playPicked };
})();
