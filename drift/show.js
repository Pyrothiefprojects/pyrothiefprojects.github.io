// Drift Remote's tutorial (drift.html): the show — the song along the bottom, and its timeline. The tutorial's parts
// (its scenes) placed on it play at their moment; the effects (Pyrosphere's: Pulse, Flare, Spin kick, Glow, Skew, Spike,
// and Colour joined to any of them) act on the stars of whatever's showing, between their flags. All of it — which
// effects are on, Colour's joins, the scenes, the flags — from the show's file, set and saved in #edit.
// Its own names kept to itself; the tutorial sees `show`: frame (each frame's work), paused (the clock to hold),
// transform (the whole picture's swell and twist), dot (each star's look), along (▶ Play with Music), duration (the
// song's length), cue / span / mark (#edit's Dialog: the song put at a line's moment, its segment played, marked),
// watch (▶ Play watched: the player small, to pause it), capture (every star drawn, caught: Disconnect's end), and music
// (the beats heard so far, the last one's strength, how loud and how much bass just now, and whether Mouse party's on:
// for the spheres in the frame),
// and whenPlaying (once the song's really playing: a run with Music starting with it)

var show = (function () {
    var SONG = "drift/Drift_tutorial.mp4";
    var BEATS_FILE = "drift/Drift_tutorial.beats.json";   // (worked out ahead, with Pyrosphere's analysis)
    var SHOW_FILE = "Drift_tutorial.show.json";           // (beside the song: its scenes, the effects' flags, Colour's joins)
    var editing = location.hash === "#edit";
    var player = document.getElementById("player");
    if (editing) player.classList.add("editing");

    // ---------------- The player ----------------
    var song = new Audio(SONG);
    song.preload = "auto";
    // …and all of it in memory as soon as the page opens, played from there (so it never stalls part way, waiting on the
    // network: the first visit's stutter) — taken up only if it's not been played yet
    if (window.fetch && window.URL && URL.createObjectURL) {
        fetch(SONG).then(function (r) { return r.ok ? r.blob() : null; }).then(function (blob) {
            if (blob && song.paused && song.currentTime === 0) song.src = URL.createObjectURL(blob);
        }).catch(function () {});
    }
    // Once the song's really playing (or 4 s on, if it can't), fn — so a run with Music starts with the music, not before it
    function whenPlaying(fn) {
        var done = false;
        function go() {
            if (done) return;
            done = true;
            song.removeEventListener("playing", go);
            fn();
        }
        if (!song.paused && song.currentTime > 0.05) return go();
        song.addEventListener("playing", go);
        setTimeout(go, 4000);
    }
    var playButton = document.getElementById("songPlay"), seek = document.getElementById("songSeek");
    var timeLabel = document.getElementById("songTime"), note = document.getElementById("showNote");
    var seeking = false, started = false;   // (started: the song's been played — the show has the clock)
    function clockText(sec) {
        if (!isFinite(sec)) return "0:00";
        var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
    }
    function showTime() {
        timeLabel.textContent = clockText(song.currentTime) + " / " + clockText(song.duration);
        if (!seeking && song.duration) seek.value = Math.round(song.currentTime / song.duration * 1000);
    }
    song.addEventListener("timeupdate", showTime);
    song.addEventListener("loadedmetadata", function () { showTime(); drawLanes(); });
    song.addEventListener("play", face);
    song.addEventListener("pause", face);
    function face() {   // (the button: ❚❚ while it's going — the song, or ▶ Play's run while it's watched)
        var going = watched ? !halted : !song.paused;
        playButton.innerHTML = going ? "&#10074;&#10074;" : "&#9654;";
        playButton.setAttribute("aria-label", going ? "Pause" : "Play");
    }
    song.addEventListener("error", function () { note.textContent = "The song couldn't be loaded."; });
    seek.addEventListener("input", function () {
        seeking = true;
        if (song.duration) timeLabel.textContent = clockText(seek.value / 1000 * song.duration) + " / " + clockText(song.duration);
    });
    seek.addEventListener("change", function () {
        if (song.duration) song.currentTime = seek.value / 1000 * song.duration;
        seeking = false;
        started = true;     // (scrubbing: the show's picture at that moment, even paused)
        jumped = true;
    });
    // The song through the browser's audio (an analyser on it, for listening live if there's no beats file)
    var Ctx = window.AudioContext || window.webkitAudioContext, ctx = null, analyser = null, bins = null;
    try { ctx = new Ctx(); } catch (err) {}
    function connect() {
        if (analyser || !ctx) return;
        try {
            var source = ctx.createMediaElementSource(song);
            analyser = ctx.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.6;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            bins = new Uint8Array(analyser.frequencyBinCount);
        } catch (err) {}
    }
    playButton.addEventListener("click", function () {
        if (dialog.playPicked()) return;   // (a dialog line picked in #edit: just its segment)
        if (watched) { halt(!halted); return; }   // (▶ Play's run: paused, and on again)
        connect();
        if (ctx && ctx.state === "suspended") ctx.resume();
        started = true;
        if (song.paused) song.play(); else song.pause();
    });
    // Moved by its grip; made small (just play and the slider) and back
    movable(player, document.getElementById("playerGrip"));
    var shrinkButton = document.getElementById("playerShrink");
    function setSmall(small) {
        player.classList.toggle("small", small);
        shrinkButton.setAttribute("aria-pressed", small ? "true" : "false");
        shrinkButton.innerHTML = small ? "&#9633;" : "&#8211;";
        shrinkButton.title = small ? "Make it full size" : "Make it small: just play and the slider";
    }
    shrinkButton.addEventListener("click", function () { setSmall(!player.classList.contains("small")); });
    // ▶ Play, watched: the player made small (just play and the slider) and kept up, its button pausing the whole run (the
    // picture, the dialog, and the song with Music) and on again, Space too; its slider following the run. As it was after
    var watched = false, halted = false, runTime = 0, wasSmall = false;
    function watch(on) {
        if (on && !watched) wasSmall = player.classList.contains("small");
        watched = on;
        halted = false;
        runTime = 0;
        setSmall(on || wasSmall);
        seek.disabled = on;
        face();
    }
    function halt(on) {
        halted = on;
        if (alongOn) {
            if (on) song.pause();
            else song.play();
        }
        face();
    }
    document.addEventListener("keydown", function (e) {
        if (!watched || e.key !== " ") return;
        e.preventDefault();
        halt(!halted);
    });
    // #edit's Dialog: the song put at a moment (the show not taking the clock), a stretch of it played on its own, and
    // the stretch marked on the slider's bar
    var spanTo = null, spanMark = document.getElementById("songSpan");
    function cue(t) {
        started = false;
        spanTo = null;
        if (!song.paused) song.pause();
        if (isFinite(t) && song.duration) song.currentTime = t;
        showTime();
    }
    function span(from, to) {
        cue(from);
        spanTo = to;
        connect();
        if (ctx && ctx.state === "suspended") ctx.resume();
        song.play();
    }
    function mark(from, to) {   // (from null: none)
        spanMark.hidden = from === null || !song.duration;
        if (spanMark.hidden) return;
        spanMark.style.left = "calc(8px + (100% - 16px) * " + from / song.duration + ")";
        spanMark.style.width = "max(3px, calc((100% - 16px) * " + (to - from) / song.duration + "))";
    }
    // The tutorial's own menu, used: it has the clock back
    document.getElementById("tutorial").addEventListener("click", function () { started = false; });
    function delay() { return ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0; }   // (the speakers' delay)

    // ---------------- The beats ----------------
    var grid = null;
    fetch(BEATS_FILE).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d || !d.beats) return;
        var bar = d.beats.map(function () { return false; });
        d.bar.forEach(function (k) { bar[k] = true; });
        grid = { beats: d.beats, strength: d.strength, bar: bar, fps: d.fps, loud: d.loud, bass: d.bass || d.loud, start: d.start };
    }).catch(function () {});
    // `beat` jumps to a beat's strength and fades; `loud` and `bass` (0 → 1), eased. From the beats file, each as the song's
    // heard passing it; with none, the bass heard live against its last second or so (as Pyrosphere's)
    var beat = 0, loud = 0, bass = 0, bassPeak = 1e-9, side = 1, lastHeard = -1, nextBeat = 0, bassHistory = [], lastLive = -1;
    function hear(heard, dt, now) {
        beat *= Math.exp(-dt * 6);
        if (song.paused) { loud *= Math.exp(-dt * 3); bass *= Math.exp(-dt * 3); return; }
        if (grid) {
            if (heard < lastHeard - 0.05 || heard > lastHeard + 0.5) {   // (sought: on from the next beat after it)
                nextBeat = 0;
                while (nextBeat < grid.beats.length && grid.beats[nextBeat] < heard) nextBeat++;
            }
            lastHeard = heard;
            while (nextBeat < grid.beats.length && grid.beats[nextBeat] <= heard) {
                if (heard - grid.beats[nextBeat] < 0.12) onBeat(grid.strength[nextBeat] * (grid.bar[nextBeat] ? 1 : 0.8));
                nextBeat++;
            }
            var f = Math.max(0, Math.min(grid.loud.length - 1, Math.round((heard - grid.start) * grid.fps)));
            loud += (grid.loud[f] * 0.6 - loud) * Math.min(1, dt * 6);
            bass += (grid.bass[f] - bass) * Math.min(1, dt * 12);
            return;
        }
        if (!analyser) return;
        analyser.getByteFrequencyData(bins);
        var hz = ctx.sampleRate / analyser.fftSize, low = 0, all = 0, range = analyser.maxDecibels - analyser.minDecibels;
        for (var b = 1; b * hz < 160; b++) low += Math.pow(10, (bins[b] / 255 * range + analyser.minDecibels) / 10);
        for (var k = 0; k < bins.length; k++) all += bins[k];
        loud += (all / (bins.length * 255) - loud) * Math.min(1, dt * 6);
        bassPeak = Math.max(low, bassPeak * Math.exp(-dt * 0.2));
        bass += (Math.sqrt(low / bassPeak) - bass) * Math.min(1, dt * 12);
        bassHistory.push(low);
        if (bassHistory.length > 50) bassHistory.shift();
        var avg = bassHistory.reduce(function (s, v) { return s + v; }, 0) / bassHistory.length;
        if (bassHistory.length > 10 && avg > 0 && low > avg * 1.5 && now - lastLive > 0.24) {
            lastLive = now;
            onBeat(Math.min(1, 0.5 + (low / avg - 1.5) * 0.4));
        }
    }

    // ---------------- The effects, their flags, and Colour ----------------
    var EFFECTS = [
        { key: "pulse", name: "Pulse", colour: "#ff9a3c" },    // the whole picture swelling on the beat
        { key: "flare", name: "Flare", colour: "#ffd166" },    // the stars bigger and brighter on the beat, with the loudness
        { key: "spin", name: "Spin kick", colour: "#7bdff2" }, // the picture twisting a little, one way then the other
        { key: "colour", name: "Glow", colour: "#ff6b6b" },    // the stars flashing the sunrise on the beat
        { key: "skew", name: "Skew", colour: "#b388ff" },      // each beat a ring rippling out, pushing the stars aside
        { key: "spike", name: "Spike", colour: "#5ad17a" },    // rays out from the stars with the bass
        { key: "mouse", name: "Mouse party", colour: "#ffffff" }   // the spheres' stars round your pointer, pushed aside: full party
    ];
    var reacts = {};   // each effect's button: on or off — all off (but Mouse party, on) till the show's file (set in #edit) says
    EFFECTS.forEach(function (e) { reacts[e.key] = e.key === "mouse"; });
    var reactsBox = document.getElementById("showReacts"), buttons = {}, linking = false;
    EFFECTS.forEach(function (e) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "react";
        b.innerHTML = '<span class="swatch" style="background:' + e.colour + '"></span>' + e.name;
        b.setAttribute("aria-pressed", reacts[e.key] ? "true" : "false");
        b.addEventListener("click", function () {
            if (linking) return join(e.key);   // (Colour waiting for one to join)
            reacts[e.key] = !reacts[e.key];
            b.setAttribute("aria-pressed", reacts[e.key] ? "true" : "false");
        });
        reactsBox.appendChild(b);
        buttons[e.key] = b;
    });
    var ranges = {};   // where each runs: { key: [[from, to], …] } (s; `to` null while it's still open, in #edit)
    function inRange(key, t) {   // (no flags: all the way through)
        var list = ranges[key];
        if (!list || !list.length) return true;
        return list.some(function (r) { return t >= r[0] && (r[1] === null || t <= r[1]); });
    }
    var act = {};   // which effects are on just now
    function whatsOn(t) { EFFECTS.forEach(function (e) { act[e.key] = reacts[e.key] && inRange(e.key, t); }); }

    // Colour: joined to an effect, it brings colour with it — all colours (the default, moving round the wheel), a hue
    // picked on the wheel (its shades), or a set palette
    var PALETTES = {
        sunrise: ["#fd9d0a", "#f46f0c", "#e75114", "#e8271e"],
        ice: ["#f2fbff", "#b5e2ff", "#74b9ff", "#3f7fff"],
        neon: ["#ff2bd6", "#7b2bff", "#2bd9ff", "#2bff88"],
        ocean: ["#48cae4", "#0a9396", "#94d2bd", "#005f73"],
        candy: ["#ff8fab", "#ffc2d1", "#b8f2e6", "#cdb4db"],
        forest: ["#2d6a4f", "#52b788", "#95d5b2", "#d8f3dc"],
        gold: ["#ffe08a", "#ffc53d", "#f2a20c", "#d97b06"]
    };
    function hexRGB(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    var paletteRGB = {};
    Object.keys(PALETTES).forEach(function (k) { paletteRGB[k] = PALETTES[k].map(hexRGB); });
    function hsl(hue, s, l, out) {   // (0 → 1 each; into out, 0 → 255)
        function part(n) {
            var k = (n + hue * 12) % 12, a = s * Math.min(l, 1 - l);
            return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
        }
        out[0] = part(0); out[1] = part(8); out[2] = part(4);
        return out;
    }
    var colours = {};   // an effect's key → { palette: "all" or one of PALETTES } or { hue: 0 → 1 } — none till the show's file says
    var paint = [0, 0, 0];
    function tint(key, n) {   // (the colour effect `key` brings to star n just now; null if Colour isn't joined to it)
        var c = colours[key];
        if (!c) return null;
        var u = (n * 0.618 + clock * 0.12) % 1;
        if (c.hue !== undefined) return hsl((c.hue + (u - 0.5) * 0.12 + 1) % 1, 0.9, 0.5 + 0.12 * Math.sin(u * 6.283), paint);
        if (c.palette === "all" || !paletteRGB[c.palette]) return hsl(u, 0.85, 0.6, paint);
        var list = paletteRGB[c.palette], at = u * list.length, i0 = Math.floor(at) % list.length, i1 = (i0 + 1) % list.length, f = at - Math.floor(at);
        paint[0] = list[i0][0] + (list[i1][0] - list[i0][0]) * f;
        paint[1] = list[i0][1] + (list[i1][1] - list[i0][1]) * f;
        paint[2] = list[i0][2] + (list[i1][2] - list[i0][2]) * f;
        return paint;
    }
    function swatchOf(c) {
        if (!c || c.palette === "all") return "conic-gradient(hsl(0,85%,60%),hsl(60,85%,60%),hsl(120,85%,60%),hsl(180,85%,60%),hsl(240,85%,60%),hsl(300,85%,60%),hsl(360,85%,60%))";
        if (c.hue !== undefined) {
            var h = Math.round(c.hue * 360);
            return "linear-gradient(135deg,hsl(" + (h - 20) + ",90%,45%),hsl(" + h + ",90%,58%),hsl(" + (h + 20) + ",90%,45%))";
        }
        return "linear-gradient(135deg," + (PALETTES[c.palette] || PALETTES.sunrise).join(",") + ")";
    }
    function lineColour(c) {
        if (!c || c.palette === "all") return "#ffffff";
        if (c.hue !== undefined) return "hsl(" + Math.round(c.hue * 360) + ",90%,58%)";
        return (PALETTES[c.palette] || PALETTES.sunrise)[1];
    }
    function keepColours() {}   // (kept in the show's file, by #edit's Save)
    // The tool, first among the buttons; pressed, it waits for an effect to join (its hint says so)
    var colourTool = document.createElement("button");
    colourTool.type = "button";
    colourTool.className = "react colourtool";
    colourTool.innerHTML = '<span class="wheel"></span>Colour';
    colourTool.setAttribute("aria-pressed", "false");
    colourTool.title = "Join colour to an effect";
    reactsBox.insertBefore(colourTool, reactsBox.firstChild);
    var hint = document.getElementById("colourHint");
    function setLinking(on) {
        linking = on;
        colourTool.setAttribute("aria-pressed", on ? "true" : "false");
        hint.hidden = !on;
        if (on) {
            var p = player.getBoundingClientRect(), r = colourTool.getBoundingClientRect();
            hint.style.left = (r.left - p.left) + "px";
            hint.style.top = (r.top - p.top - 8) + "px";
        }
    }
    colourTool.addEventListener("click", function () { setLinking(!linking); });
    function join(key) {   // (joined: unjoin it; else join it, all colours to start with)
        if (colours[key]) delete colours[key]; else colours[key] = { palette: "all" };
        keepColours();
        setLinking(false);
        showJoins();
    }
    var links = document.getElementById("links"), SVG = "http://www.w3.org/2000/svg", chips = {};
    EFFECTS.forEach(function (e) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.title = "Its colours";
        chip.addEventListener("click", function (ev) { ev.stopPropagation(); openWheel(e.key, chip); });
        buttons[e.key].appendChild(chip);
        chips[e.key] = chip;
    });
    function showJoins() {
        EFFECTS.forEach(function (e) {
            chips[e.key].style.display = colours[e.key] ? "inline-block" : "none";
            chips[e.key].style.background = swatchOf(colours[e.key]);
        });
        drawLinks();
    }
    function drawLinks() {   // (from the tool to each joined effect, arching over the buttons between)
        while (links.firstChild) links.removeChild(links.firstChild);
        var p = player.getBoundingClientRect(), from = colourTool.getBoundingClientRect();
        var fx = from.left + from.width / 2 - p.left, fy = from.top - p.top;
        EFFECTS.forEach(function (e) {
            if (!colours[e.key]) return;
            var to = buttons[e.key].getBoundingClientRect(), tx = to.left + to.width / 2 - p.left, ty = to.top - p.top;
            var bend = Math.max(14, Math.abs(tx - fx) * 0.25);
            var path = document.createElementNS(SVG, "path");
            path.setAttribute("d", "M" + fx + "," + fy + " C" + fx + "," + (fy - bend) + " " + tx + "," + (ty - bend) + " " + tx + "," + ty);
            path.setAttribute("stroke", lineColour(colours[e.key]));
            links.appendChild(path);
        });
    }
    window.addEventListener("resize", drawLinks);
    // The wheel: all colours in the middle, any hue round it, the set palettes under it, unjoining
    var wheelPop = document.getElementById("wheelPop"), wheelFor = null;
    Object.keys(PALETTES).forEach(function (name) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pal";
        b.title = name.charAt(0).toUpperCase() + name.slice(1);
        b.style.background = swatchOf({ palette: name });
        b.addEventListener("click", function () { setColours({ palette: name }); });
        document.getElementById("palettes").appendChild(b);
    });
    function setColours(c) {
        if (!wheelFor) return;
        colours[wheelFor] = c;
        keepColours();
        showJoins();
        closeWheel();
    }
    function openWheel(key, chip) {
        wheelFor = key;
        wheelPop.hidden = false;
        var p = player.getBoundingClientRect(), r = chip.getBoundingClientRect();
        wheelPop.style.left = Math.max(8, Math.min(p.width - wheelPop.offsetWidth - 8, r.left - p.left - wheelPop.offsetWidth / 2)) + "px";
        wheelPop.style.top = (r.top - p.top - wheelPop.offsetHeight - 10) + "px";
    }
    function closeWheel() { wheelPop.hidden = true; wheelFor = null; }
    document.getElementById("wheel").addEventListener("click", function (ev) {
        var r = this.getBoundingClientRect(), dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
        setColours({ hue: ((Math.atan2(dx, -dy) / (2 * Math.PI)) + 1) % 1 });   // (round from the top, clockwise)
    });
    document.getElementById("allColours").addEventListener("click", function (ev) { ev.stopPropagation(); setColours({ palette: "all" }); });
    document.getElementById("unjoin").addEventListener("click", function () { var k = wheelFor; closeWheel(); join(k); });
    document.addEventListener("pointerdown", function (ev) {
        if (!wheelPop.hidden && !wheelPop.contains(ev.target) && !(ev.target.classList && ev.target.classList.contains("chip"))) closeWheel();
    }, true);
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { closeWheel(); setLinking(false); } });

    // ---------------- The scenes: the tutorial's parts, each placed at its moment ----------------
    // [[at (s), the part's name], …], in order. When the song reaches one it plays, from its own start; sought to, it
    // plays from as far in as the song is past it
    var scenes = [];
    var SCENES = PARTS.filter(function (p) { return !p.staging; }).map(function (p) { return p.name; });
    var fired = -1, jumped = true;
    function startScene(i, late) {
        var n = -1;
        PARTS.forEach(function (p, k) { if (p.name === scenes[i][1]) n = k; });
        if (n < 0) return;
        var now = clock;
        clock -= late;   // (so its own start is `late` ago: it's that far in)
        playPart(n, false, i > 0 ? scenes[i - 1][1] : null);
        clock = now;
    }
    function runScenes(heard) {
        if (jumped) {   // (sought: the scene there, as far in as the song is)
            jumped = false;
            fired = -1;
            while (fired + 1 < scenes.length && scenes[fired + 1][0] <= heard) fired++;
            if (fired >= 0) startScene(fired, heard - scenes[fired][0]);
            else { showAll(); blank = true; playing = -1; }
            return;
        }
        while (fired + 1 < scenes.length && scenes[fired + 1][0] <= heard) {
            fired++;
            startScene(fired, heard - scenes[fired][0]);
        }
    }

    // ---------------- The timeline: the lanes under the bar ----------------
    // The scenes, as tags along a line of their own; under it, a line for each effect with flags (in #edit, a click
    // on a tag or a range takes it off)
    var lanes = document.getElementById("lanes");
    function drawLanes() {
        lanes.innerHTML = "";
        var len = song.duration;
        if (!isFinite(len) || !len) return;
        if (scenes.length) {
            var row = document.createElement("div");
            row.className = "lane scenes";
            row.title = "Scenes";
            scenes.forEach(function (s, n) {
                var tag = document.createElement("span");
                tag.className = "tag";
                tag.style.left = (s[0] / len * 100) + "%";
                tag.textContent = s[1];
                tag.title = s[1] + " at " + clockText(s[0]);
                if (editing) tag.addEventListener("click", function () { remember(); scenes.splice(n, 1); drawLanes(); });
                row.appendChild(tag);
            });
            lanes.appendChild(row);
        }
        EFFECTS.forEach(function (e) {
            var list = ranges[e.key];
            if (!list || !list.length) return;
            var lane = document.createElement("div");
            lane.className = "lane";
            lane.title = e.name;
            list.forEach(function (r, n) {
                var seg = document.createElement("span"), to = r[1] === null ? Math.max(r[0], song.currentTime) : r[1];
                seg.style.left = (r[0] / len * 100) + "%";
                seg.style.width = Math.max(0.3, (to - r[0]) / len * 100) + "%";
                seg.style.background = e.colour;
                seg.title = e.name + ": " + clockText(r[0]) + " – " + (r[1] === null ? "…" : clockText(r[1]));
                if (editing) seg.addEventListener("click", function () { remember(); list.splice(n, 1); drawLanes(); });
                lane.appendChild(seg);
            });
            lanes.appendChild(lane);
        });
    }
    function openRange() {
        return Object.keys(ranges).some(function (k) { return ranges[k].some(function (r) { return r[1] === null; }); });
    }

    // ---------------- #edit: placing scenes and flags; undo; saving it all beside the song ----------------
    var undo = [];
    function remember() { undo.push(JSON.stringify({ scenes: scenes, ranges: ranges })); if (undo.length > 50) undo.shift(); }
    function at() { return Math.round(song.currentTime * 100) / 100; }
    if (editing) {
        var which = document.getElementById("editWhich"), sceneWhich = document.getElementById("sceneWhich");
        EFFECTS.forEach(function (e) {
            var o = document.createElement("option");
            o.value = e.key;
            o.textContent = e.name;
            which.appendChild(o);
        });
        SCENES.forEach(function (name) {
            var o = document.createElement("option");
            o.value = o.textContent = name;
            sceneWhich.appendChild(o);
        });
        document.getElementById("scenePlace").addEventListener("click", function () {
            remember();
            scenes.push([at(), sceneWhich.value]);
            scenes.sort(function (a, b) { return a[0] - b[0]; });
            jumped = true;   // (it plays from here)
            drawLanes();
        });
        document.getElementById("flagStart").addEventListener("click", function () {
            remember();
            (ranges[which.value] = ranges[which.value] || []).push([at(), null]);
            drawLanes();
        });
        document.getElementById("flagEnd").addEventListener("click", function () {
            var t = at(), list = ranges[which.value] || [];
            var open = list.filter(function (r) { return r[1] === null && r[0] <= t; }).pop();
            if (!open) { note.textContent = "No start flag before here for " + which.options[which.selectedIndex].text; return; }
            remember();
            open[1] = t;
            drawLanes();
        });
        document.getElementById("flagUndo").addEventListener("click", function () {
            if (!undo.length) return;
            var was = JSON.parse(undo.pop());
            scenes = was.scenes;
            ranges = was.ranges;
            jumped = true;
            drawLanes();
        });
        document.getElementById("flagSave").addEventListener("click", function () {
            var body = JSON.stringify({ song: "Drift_tutorial.mp4", on: reacts, scenes: scenes, ranges: ranges, colours: colours,
                dialog: dialog.saved() }, null, 2);
            fetch("/save-effects?file=" + encodeURIComponent(SHOW_FILE), { method: "POST", body: body }).then(function (r) {
                if (!r.ok) throw new Error();
                note.textContent = "Saved, beside the song";
            }).catch(function () {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([body], { type: "application/json" }));
                a.download = SHOW_FILE;
                a.click();
                note.textContent = "Couldn't save here: downloaded instead — put it in the drift folder";
            });
        });
    }
    // The show's file: its scenes, flags and joins
    fetch("drift/" + SHOW_FILE).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d) return;
        if (d.scenes) scenes = d.scenes.slice().sort(function (a, b) { return a[0] - b[0]; });
        if (d.ranges) ranges = d.ranges;
        if (d.colours) colours = d.colours;
        if (d.dialog || d.pauses) dialog.load(d.dialog || d.pauses);   // (the dialog's lines: their words, pauses, places)
        if (d.on) EFFECTS.forEach(function (e) {   // (each effect on or off, as #edit saved it)
            if (e.key in d.on) reacts[e.key] = !!d.on[e.key];   // (one the file doesn't know of: as it was)
            buttons[e.key].setAttribute("aria-pressed", reacts[e.key] ? "true" : "false");
        });
        drawLanes();
        showJoins();
    }).catch(function () {});
    showJoins();

    // ---------------- The effects on the stars ----------------
    // Spin kick's twist (a kick, then easing back), its colour bands; Skew's rings (on screen: where from, when, how strong)
    var twist = 0, twistKick = 0, spinGlow = 0, ripples = [];
    var SKEW_LIFE = 1.2, SKEW_WIDTH = 40, SKEW_PUSH = 22;
    var view = { w: 1, h: 1 };
    var beatCount = 0, beatStrength = 0;   // (every beat heard, and the last one's strength: for the spheres in the frame)
    function onBeat(strength) {
        beatCount++;
        beatStrength = strength;
        beat = Math.max(beat, strength);
        side = -side;
        if (act.spin && !reducedMotion) { twistKick = 0.035 * strength * side; spinGlow = Math.max(spinGlow, strength); }
        if (act.skew && !reducedMotion) {
            ripples.push({ x: view.w * (0.5 + (Math.random() - 0.5) * 0.5), y: view.h * (0.5 + (Math.random() - 0.5) * 0.5), born: clock, strength: strength });
            if (ripples.length > 4) ripples.shift();
        }
    }
    var SUNRISE = [[253, 157, 10], [244, 111, 12], [231, 81, 20], [232, 39, 30]], sun = [0, 0, 0];
    function sunrise(p) {   // (0 at the top → 1 at the bottom)
        p = Math.max(0, Math.min(1, p)) * (SUNRISE.length - 1);
        var i0 = Math.min(SUNRISE.length - 2, Math.floor(p)), f = p - i0;
        for (var k = 0; k < 3; k++) sun[k] = SUNRISE[i0][k] + (SUNRISE[i0 + 1][k] - SUNRISE[i0][k]) * f;
        return sun;
    }
    var pulse = 0, flare = 0, glowBeat = 0, spiky = 0, dotN = 0, mixed = [0, 0, 0], out = [0, 0, null, 0, 0];
    // Every star drawn, as it's drawn, while caught (Disconnect's end: the picture's stars, for the sphere to build from)
    var caught = null;
    function capture(on) { var got = caught; caught = on ? [] : null; return got; }

    // Each frame, before the tutorial steps on: where the song is; what's on; the scenes it's reached; the effects' state
    function frame(dt, w, h) {
        view.w = w;
        view.h = h;
        dotN = 0;
        if (spanTo !== null && song.currentTime >= spanTo) { song.pause(); spanTo = null; }   // (a dialog's segment, done)
        if (watched && !halted) {   // (the run's time; the slider at it, if the song's not playing along to show it)
            runTime += dt;
            if (!alongOn && song.duration) seek.value = Math.min(1000, Math.round(runTime / song.duration * 1000));
        }
        var heard = song.currentTime - delay();
        whatsOn(heard);
        hear(heard, dt, clock);
        if (started) {
            runScenes(heard);
            if (!song.paused) document.getElementById("tutorial").classList.add("away");   // (the show's playing: its menu aside)
        }
        pulse = act.pulse ? beat : 0;
        flare = act.flare ? beat : 0;
        glowBeat = act.colour ? beat : 0;
        spiky = act.spike ? bass : 0;
        twist += (twistKick - twist) * Math.min(1, dt * 10);
        twistKick *= Math.exp(-dt * 4);
        spinGlow *= Math.exp(-dt * 3);
        ripples = ripples.filter(function (r) { return clock - r.born < SKEW_LIFE; });
        if (editing && !song.paused && openRange()) drawLanes();   // (an open range following the playhead)
        if (clock % 0.5 < dt) drawLinks();   // (the lines kept to their buttons as the player's laid out)
    }
    // The whole picture: swelling (Pulse) and twisting (Spin kick) about the middle
    function transform(g, w, h) {
        if (!pulse && !twist) return;
        var s = 1 + 0.05 * pulse;
        g.translate(w / 2, h / 2);
        g.rotate(twist);
        g.scale(s, s);
        g.translate(-w / 2, -h / 2);
    }
    // A star, as the effects have it: pushed aside by Skew's rings; coloured by the strongest glow on it (Skew's, Glow's,
    // and Colour's joins); bigger and brighter with Flare; rays out from it with Spike. Into `out`: [x, y, colour, alpha, r]
    function dot(x, y, colour, alpha, r) {
        var n = dotN++, h1 = (n * 0.618) % 1, h2 = (n * 0.37) % 1, glow = 0, gc = null, gw, k;
        for (k = 0; k < ripples.length; k++) {
            var rp = ripples[k], age = clock - rp.born, dx = x - rp.x, dy = y - rp.y, d = Math.hypot(dx, dy) || 1;
            var off = (d - age * Math.max(view.w, view.h) * 0.9) / SKEW_WIDTH;
            if (off > 3 || off < -3) continue;
            var weight = Math.exp(-off * off) * (1 - age / SKEW_LIFE) * rp.strength;
            x += dx / d * SKEW_PUSH * weight;
            y += dy / d * SKEW_PUSH * weight;
            if (weight > glow) { glow = weight; gc = tint("skew", n) || sunrise(y / view.h); }
        }
        gw = glowBeat * (0.35 + 0.65 * h1);
        if (gw > glow) { glow = gw; gc = tint("colour", n) || sunrise(y / view.h); }
        if (colours.pulse && pulse * 0.8 > glow) { glow = pulse * 0.8; gc = tint("pulse", n); }
        gw = flare * (0.45 + 0.55 * h2);
        if (colours.flare && gw > glow) { glow = gw; gc = tint("flare", n); }
        gw = spinGlow * Math.max(0, Math.sin(Math.atan2(y - view.h / 2, x - view.w / 2) * 3 - side * clock * 4));
        if (colours.spin && act.spin && gw > glow) { glow = gw; gc = tint("spin", n); }
        if (glow > 0.001 && gc) {
            for (k = 0; k < 3; k++) mixed[k] = colour[k] + (gc[k] - colour[k]) * Math.min(1, glow);
            colour = mixed;
        }
        r *= 1 + flare * (0.5 + loud) + (act.flare ? loud * 0.3 : 0);
        alpha = Math.min(1, alpha * (1 + 0.3 * flare));
        if (spiky > 0.05 && h1 < 0.35 && alpha > 0.05) {   // (Spike: a ray out from it, away from the middle)
            var ox = x - view.w / 2, oy = y - view.h / 2, ol = Math.hypot(ox, oy) || 1, len = spiky * 28 * (0.5 + h2);
            var rc = tint("spike", n) || colour;
            g.strokeStyle = rgb(rc);
            g.globalAlpha = alpha * 0.6 * spiky;
            g.lineWidth = Math.max(1, r * 0.35);
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + ox / ol * len, y + oy / ol * len);
            g.stroke();
        }
        out[0] = x; out[1] = y; out[2] = colour; out[3] = alpha; out[4] = r;
        if (caught) caught.push([x, y, colour ? [colour[0], colour[1], colour[2]] : null, alpha, r]);
        return out;
    }
    // The tutorial's clock held while the show has it and the song's paused (so the picture waits with the music)
    function paused() { return halted || (started && song.paused); }
    // ▶ Play with Music: the song from the start alongside the tutorial's own run (its scenes in order, not the
    // timeline's), its beats on the stars; stopped when the run is. Its end ends the run (none: whether it's still going)
    var alongOn = false;
    song.addEventListener("ended", function () {
        if (alongOn && document.body.classList.contains("watching")) watching(false);
        alongOn = false;
    });
    function along(on) {
        if (on === undefined) return alongOn && !song.paused;
        alongOn = on;
        if (on) {
            started = false;
            song.currentTime = 0;
            connect();
            if (ctx && ctx.state === "suspended") ctx.resume();
            song.play();
        } else if (!song.paused) {
            song.pause();
        }
    }

    return { frame: frame, transform: transform, dot: dot, paused: paused, along: along,
        duration: function () { return song.duration; }, cue: cue, span: span, mark: mark, watch: watch, capture: capture,
        music: function () { return { beats: beatCount, strength: beatStrength, loud: loud, bass: bass, playing: !song.paused, mouse: !!act.mouse }; },
        whenPlaying: whenPlaying };
})();
