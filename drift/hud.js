// Drift Remote's tutorial (drift.html), 2 of 5: the HUD around the iPhone, and how much of it shows over time

// ---------------- The HUD ----------------
var hud = document.getElementById("hud");
var hudLines = document.getElementById("hudLines");
var hudHead = document.getElementById("hudHead");
var hudFoot = document.getElementById("hudFoot");
var SVG_NS = "http://www.w3.org/2000/svg";
var hudLabels = [], hudPaths = [], hudDots = [];
DRIFT.callouts.forEach(function () {
    var label = document.createElement("div");
    label.className = "hud-label";
    label.dataset.shown = "0";
    hud.appendChild(label);
    hudLabels.push(label);
    var path = document.createElementNS(SVG_NS, "path");
    hudLines.appendChild(path);
    hudPaths.push(path);
    var dot = document.createElementNS(SVG_NS, "circle");
    hudLines.appendChild(dot);
    hudDots.push(dot);
});
// The text on the HUD, each piece shown up to some number of its letters (set each frame from the clock)
var hudLink = document.getElementById("hudLink");
hudLink.href = DRIFT.link.href;
hud.style.setProperty("--status", BETA_COLOR);
var pill = hud.querySelector(".pill");
var TEXTS = {
    name: { el: document.getElementById("hudName"), full: DRIFT.name },
    tagline: { el: document.getElementById("hudTagline"), full: DRIFT.tagline },
    status: { el: document.getElementById("hudStatusText"), full: DRIFT.status },
    tech: { el: document.getElementById("hudTech"), full: DRIFT.tech },
    link: { el: hudLink, full: DRIFT.link.label + " →" }
};
// Shows `count` letters of a piece (or of a label), touching the page only when that changes
function showLetters(el, full, count) {
    count = Math.max(0, Math.min(full.length, Math.floor(count)));
    if (el.dataset.shown === String(count)) return;
    el.textContent = full.slice(0, count);
    el.dataset.shown = String(count);
}

// ---------------- How much of the HUD shows, at clock time t ----------------
// Drawing in (from hudFrom): each line draws, then its label types in, a little after the one before; the rest
// is all there. Retracting (from retractFrom, for the intro): first every letter but the name's goes, typed
// backwards (the labels a little after one another), then the arms draw back into the icon while the name fades
// out, both gone together
var RETRACT_TEXT = 0.5;     // s for the labels, the tagline and the badge line to go
var RETRACT_NAME = 0.6;     // s for the arms and the name, after that
// s for each of the drift icon's dots to fly in from its label: as long as the fade, so the last label's last
// letter (gone as the text finishes) lands just as the name and the arms finish
var GHOST_FLY = RETRACT_NAME;
function amounts(t) {
    var a = { drawn: [], typed: [], name: 1, tagline: 1, foot: 1 };
    var dt = t - hudFrom;
    DRIFT.callouts.forEach(function (text, i) {
        a.drawn[i] = Math.max(0, Math.min(1, (dt - 0.15 - i * 0.12) / 0.35));
        a.typed[i] = Math.max(0, Math.min(1, (dt - 0.45 - i * 0.12) * 40 / text.length));
    });
    if (retractFrom === null) return a;
    var rt = t - retractFrom;
    var textLeft = 1 - Math.max(0, Math.min(1, rt / RETRACT_TEXT));
    a.tagline = Math.min(a.tagline, textLeft);
    a.foot = Math.min(a.foot, textLeft);
    DRIFT.callouts.forEach(function (text, i) {
        // each label from its end back, a little after the one before, all gone by RETRACT_TEXT
        var own = 1 - Math.max(0, Math.min(1, (rt - i * RETRACT_TEXT * 0.08) / (RETRACT_TEXT * 0.76)));
        a.typed[i] = Math.min(a.typed[i], own);
    });
    var lastLeft = 1 - Math.max(0, Math.min(1, (rt - RETRACT_TEXT) / RETRACT_NAME));
    a.name = Math.min(a.name, lastLeft);
    a.drawn = a.drawn.map(function (d) { return Math.min(d, lastLeft); });
    return a;
}

// Lays the HUD out around the icon (its middle cx, cy and half-width r on screen), showing as much as a says.
// Desktop: lines out at four angles, an elbow, then level to the label. Phone: the labels listed under it
var HUD_ANGLES = [-150, 150, -30, 30];   // up-left, down-left, up-right, down-right (screen y points down)
function layoutHud(cx, cy, r, a) {
    var narrow = window.innerWidth <= 600;
    TEXTS.name.el.textContent = TEXTS.name.full;
    TEXTS.name.el.style.opacity = a.name;   // the name fades, rather than typing itself away
    showLetters(TEXTS.tagline.el, TEXTS.tagline.full, TEXTS.tagline.full.length * a.tagline);
    ["status", "tech", "link"].forEach(function (key) {
        showLetters(TEXTS[key].el, TEXTS[key].full, TEXTS[key].full.length * a.foot);
    });
    pill.style.opacity = a.foot;   // the badge's pill and dot fade as its word goes
    hudHead.style.left = cx + "px";
    hudHead.style.top = (cy - r - 14) + "px";
    hudFoot.style.left = cx + "px";
    hudFoot.style.top = (cy + r + 14) + "px";
    var listTop = cy + r + 14 + hudFoot.offsetHeight + 18;
    hudLabels.forEach(function (el, i) {
        var text = DRIFT.callouts[i];
        var path = hudPaths[i];
        var dotEl = hudDots[i];
        var drawn = a.drawn[i];
        showLetters(el, text, text.length * a.typed[i]);
        if (narrow) {
            path.setAttribute("d", "");
            dotEl.setAttribute("r", "0");
            el.classList.add("listed");
            el.style.setProperty("--tick", drawn);   // the phone's stand-in for the arm, going with it
            el.style.left = "24px";
            el.style.top = (listTop + i * 28) + "px";
            el.style.transform = "none";
            el.style.textAlign = "left";
            return;
        }
        el.classList.remove("listed");
        var ang = HUD_ANGLES[i] * Math.PI / 180;
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        var side = cos < 0 ? -1 : 1;
        var ax = cx + cos * r * 1.05, ay = cy + sin * r * 1.05;   // where it leaves the icon
        var ex = ax + cos * r * 0.35, ey = ay + sin * r * 0.35;   // the elbow
        var lx = ex + side * r * 0.55, ly = ey;                   // level, to the label
        var length = Math.sqrt((ex - ax) * (ex - ax) + (ey - ay) * (ey - ay)) + Math.abs(lx - ex);
        path.setAttribute("d", "M" + ax + " " + ay + " L" + ex + " " + ey + " L" + lx + " " + ly);
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length * (1 - drawn);   // drawn from the icon out; retracts back to it
        dotEl.setAttribute("cx", ax);
        dotEl.setAttribute("cy", ay);
        dotEl.setAttribute("r", drawn > 0 ? "2.5" : "0");
        el.style.left = (lx + side * 8) + "px";
        el.style.top = ly + "px";
        el.style.transform = side < 0 ? "translate(-100%, -50%)" : "translate(0, -50%)";
        el.style.textAlign = side < 0 ? "right" : "left";
    });
}
