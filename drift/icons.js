// Drift Remote's tutorial (drift.html), 1 of 5: the app's details, and every icon drawn and sampled into dots

// Drift Remote, as the home page shows it inside the sphere: its icon (an iPhone in ice-blue dots) and its HUD
var DRIFT = {
    name: "Drift Remote", status: "Beta",
    tagline: "Control your Apple devices using your iPhone.",
    tech: "iOS",
    link: { label: "Join the beta", href: "https://testflight.apple.com/join/kYvrg2Tb" },
    callouts: ["Trackpad, keyboard & Media", "Bluetooth, Wi-Fi",
        "Cast screens to your device", "iPhone → Mac & iPad"]
};
var BETA_COLOR = "#5ad17a";
var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------- The icon ----------------
// Drawn on a canvas as on the home page, then sampled into dots: [across, up] as fractions of the icon's size,
// centred, over the drawn strokes (grid steps, fine to coarse, until the count is close)
function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
}
// The devices, outlined as the home page draws its icons (on a 240 × 240 canvas, a 14 px round stroke)
var ICONS = {
    iphone: function (g) {
        roundRect(g, 72, 18, 96, 204, 22);
        g.stroke();
        g.beginPath(); g.moveTo(106, 42); g.lineTo(134, 42); g.stroke();
        g.beginPath(); g.arc(120, 194, 9, 0, Math.PI * 2); g.fill();
    },
    ipad: function (g) {
        roundRect(g, 44, 24, 152, 192, 18);
        g.stroke();
        g.beginPath(); g.arc(120, 44, 6, 0, Math.PI * 2); g.fill();   // the camera
    },
    laptop: function (g) {
        roundRect(g, 44, 50, 152, 104, 10);                            // the screen
        g.stroke();
        g.beginPath(); g.moveTo(16, 180); g.lineTo(224, 180); g.stroke();   // the base
    },
    appletv: function (g) {
        roundRect(g, 30, 84, 180, 80, 14);                             // the box
        g.stroke();
        g.lineWidth = 11;                                              // "tv" on its face
        g.beginPath(); g.moveTo(98, 104); g.lineTo(98, 138); g.quadraticCurveTo(98, 146, 114, 146); g.stroke();
        g.beginPath(); g.moveTo(88, 116); g.lineTo(112, 116); g.stroke();
        g.beginPath(); g.moveTo(124, 116); g.lineTo(136, 146); g.lineTo(148, 116); g.stroke();
    },
    homepod: function (g) {
        roundRect(g, 60, 34, 120, 180, 54);                            // the body
        g.stroke();
        g.lineWidth = 12;
        g.beginPath(); g.ellipse(120, 65, 34, 11, 0, 0, Math.PI * 2); g.stroke();   // the touch surface on top
    }
};
var ICON_POINTS = 260;
function sampleIcon(draw, target) {
    target = target || ICON_POINTS;
    var c = document.createElement("canvas");
    c.width = c.height = 240;
    var g = c.getContext("2d");
    g.strokeStyle = g.fillStyle = "#fff";
    g.lineWidth = 14;
    g.lineCap = g.lineJoin = "round";
    draw(g);
    var pixels = g.getImageData(0, 0, 240, 240).data;
    var points = [];
    for (var step = 3; step < 24; step++) {
        var found = [];
        for (var py = 0; py < 240; py += step) {
            for (var px = 0; px < 240; px += step) {
                if (pixels[(py * 240 + px) * 4 + 3] > 128) found.push([(px - 120) / 240, (120 - py) / 240]);
            }
        }
        points = found;
        if (found.length <= target) break;
    }
    return points;
}
// Several layers, back to front, each with its own brightness: a dot wherever any layer is drawn, as bright as
// the front-most one there ([across, up, alpha])
function sampleLayers(layers, target) {
    var pixels = layers.map(function (layer) {
        var c = document.createElement("canvas");
        c.width = c.height = 240;
        var g = c.getContext("2d");
        g.strokeStyle = g.fillStyle = "#fff";
        g.lineWidth = 14;
        g.lineCap = g.lineJoin = "round";
        layer.draw(g);
        return g.getImageData(0, 0, 240, 240).data;
    });
    var points = [];
    for (var step = 3; step < 24; step++) {
        var found = [];
        for (var py = 0; py < 240; py += step) {
            for (var px = 0; px < 240; px += step) {
                for (var n = layers.length - 1; n >= 0; n--) {
                    if (pixels[n][(py * 240 + px) * 4 + 3] > 128) {
                        found.push([(px - 120) / 240, (120 - py) / 240, layers[n].alpha]);
                        break;
                    }
                }
            }
        }
        points = found;
        if (found.length <= target) break;
    }
    return points;
}
// Each icon's dots: their places ([across, up], fractions of its size), where each gathers in from (somewhere at
// random on the screen, as fractions of it, as the home page's do), and when it began to gather
var SHAPES = {};
Object.keys(ICONS).forEach(function (key) {
    var offsets = sampleIcon(ICONS[key]);
    SHAPES[key] = {
        offsets: offsets,
        from: offsets.map(function () { return { x: Math.random(), y: Math.random() }; }),
        gatherFrom: -100
    };
});
function scatter(sh) {
    sh.from.forEach(function (d) {
        d.x = Math.random();
        d.y = Math.random();
    });
}
// The devices in a row (Devices), left to right
var ROW = ["ipad", "laptop", "iphone", "appletv", "homepod"];

// ---------------- The icons ----------------
// Every SF Symbol Drift Remote uses, outlined in our own drawing (SF Symbols may only be used in apps on Apple's
// platforms), as the home page draws its icons: on a 240 × 240 canvas with a 14 px round stroke. Grouped as
// they're used in the app; then a few the app doesn't have (ours)
function lines(g, pts) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
}
function outline(g, pts, fill) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    if (fill) g.fill(); else g.stroke();
}
function circle(g, x, y, r, fill) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    if (fill) g.fill(); else g.stroke();
}
// Takes a shape away from what's drawn (a check out of a filled circle, a gap either side of a slash)
function cutOut(g, draw) {
    g.save();
    g.globalCompositeOperation = "destination-out";
    draw();
    g.restore();
}
// Drawn turned about the middle
function turned(g, degrees, draw) {
    g.save();
    g.translate(120, 120);
    g.rotate(degrees * Math.PI / 180);
    g.translate(-120, -120);
    draw();
    g.restore();
}
// A slash across, with a gap cut either side of it so it reads over what's under it
function slashed(g, from, to) {
    cutOut(g, function () {
        g.lineWidth = 36;
        lines(g, [from, to]);
    });
    lines(g, [from, to]);
}
function arrowUp(g) {
    lines(g, [[120, 206], [120, 40]]);
    lines(g, [[66, 94], [120, 40], [174, 94]]);
}
// The pointer (cursorarrow), scaled and moved
var POINTER = [[78, 30], [78, 196], [116, 160], [142, 214], [166, 202], [140, 150], [190, 150]];
function pointer(g, scale, dx, dy, fill) {
    outline(g, POINTER.map(function (p) { return [p[0] * scale + dx, p[1] * scale + dy]; }), fill);
}
function speaker(g) {
    outline(g, [[26, 96], [60, 96], [104, 58], [104, 182], [60, 144], [26, 144]], true);
}
function radiowaves(g, cx, cy, radii) {
    radii.forEach(function (r) {
        g.beginPath(); g.arc(cx, cy, r, -Math.PI / 4, Math.PI / 4); g.stroke();
        g.beginPath(); g.arc(cx, cy, r, Math.PI * 3 / 4, Math.PI * 5 / 4); g.stroke();
    });
}
function gear(g, cx, cy, R, r, teeth) {
    var h = Math.PI / teeth;
    g.beginPath();
    for (var t = 0; t < teeth; t++) {
        var a = t * 2 * h;
        [[r, a - h * 0.6], [R, a - h * 0.35], [R, a + h * 0.35], [r, a + h * 0.6]].forEach(function (p, i) {
            var x = cx + Math.cos(p[1]) * p[0], y = cy + Math.sin(p[1]) * p[0];
            if (t === 0 && i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        });
    }
    g.closePath();
    g.stroke();
    circle(g, cx, cy, r * 0.42, false);
}
function eye(g) {
    g.beginPath();
    g.moveTo(18, 120);
    g.quadraticCurveTo(120, 20, 222, 120);
    g.quadraticCurveTo(120, 220, 18, 120);
    g.stroke();
    circle(g, 120, 120, 30, false);
}
function openBox(g) {
    lines(g, [[78, 96], [42, 96], [42, 214], [198, 214], [198, 96], [162, 96]]);
}
function check(g) {
    lines(g, [[66, 124], [104, 162], [176, 86]]);
}
var GROUPS = [
    { title: "Devices", icons: [
        ["iphone", function (g) {
            roundRect(g, 72, 18, 96, 204, 22);
            g.stroke();
            lines(g, [[106, 42], [134, 42]]);
            circle(g, 120, 194, 9, true);
        }],
        ["ipad", function (g) {
            roundRect(g, 44, 24, 152, 192, 18);
            g.stroke();
            circle(g, 120, 44, 6, true);                                   // the camera
        }],
        ["laptopcomputer", function (g) {
            roundRect(g, 44, 50, 152, 104, 10);                            // the screen
            g.stroke();
            lines(g, [[16, 180], [224, 180]]);                             // the base
        }],
        ["macbook", function (g) {
            roundRect(g, 50, 46, 140, 100, 10);
            g.stroke();
            outline(g, [[20, 166], [220, 166], [204, 186], [36, 186]], false);
        }],
        ["desktopcomputer", function (g) {                                 // an iMac: the screen, its chin, the stand
            roundRect(g, 26, 34, 188, 128, 12);
            g.stroke();
            lines(g, [[26, 132], [214, 132]]);
            lines(g, [[104, 162], [96, 204]]);
            lines(g, [[136, 162], [144, 204]]);
            lines(g, [[80, 206], [160, 206]]);
        }],
        ["display", function (g) {
            roundRect(g, 22, 40, 196, 124, 12);
            g.stroke();
            lines(g, [[120, 164], [120, 196]]);
            lines(g, [[82, 200], [158, 200]]);
        }],
        ["macmini", function (g) {
            roundRect(g, 26, 96, 188, 56, 16);
            g.stroke();
            circle(g, 184, 124, 6, true);
        }],
        ["macpro.gen3", function (g) {                                     // the tower, and its grille
            roundRect(g, 62, 22, 116, 196, 16);
            g.stroke();
            for (var r = 0; r < 5; r++) {
                for (var c = 0; c < 3; c++) circle(g, 92 + c * 28, 58 + r * 30, 7, true);
            }
        }],
        ["appletv", function (g) {
            roundRect(g, 30, 84, 180, 80, 14);                             // the box
            g.stroke();
            g.lineWidth = 11;                                              // "tv" on its face
            g.beginPath(); g.moveTo(98, 104); g.lineTo(98, 138); g.quadraticCurveTo(98, 146, 114, 146); g.stroke();
            lines(g, [[88, 116], [112, 116]]);
            lines(g, [[124, 116], [136, 146], [148, 116]]);
        }],
        ["homepod", function (g) {
            roundRect(g, 60, 34, 120, 180, 54);                            // the body
            g.stroke();
            g.lineWidth = 12;
            g.beginPath(); g.ellipse(120, 65, 34, 11, 0, 0, Math.PI * 2); g.stroke();   // its touch surface
        }]
    ] },
    { title: "The controls", icons: [
        ["cursorarrow", function (g) { pointer(g, 1, 0, 0, false); }],
        ["cursorarrow.motionlines", function (g) {
            pointer(g, 0.8, 48, 18, false);
            lines(g, [[22, 86], [62, 86]]);
            lines(g, [[12, 120], [58, 120]]);
            lines(g, [[22, 154], [62, 154]]);
        }],
        ["keyboard", function (g) {
            roundRect(g, 16, 62, 208, 120, 14);
            g.stroke();
            for (var r = 0; r < 2; r++) {
                for (var c = 0; c < 6; c++) g.fillRect(40 + c * 30, 86 + r * 28, 16, 14);
            }
            lines(g, [[74, 154], [166, 154]]);                             // the space bar
        }],
        ["music.note", function (g) {
            g.save();
            g.translate(112, 176);
            g.rotate(-0.35);
            g.beginPath(); g.ellipse(0, 0, 34, 24, 0, 0, Math.PI * 2); g.fill();
            g.restore();
            lines(g, [[144, 166], [144, 34]]);
            g.beginPath(); g.moveTo(144, 34); g.quadraticCurveTo(196, 46, 192, 100); g.stroke();
        }]
    ] },
    { title: "Media and arrow keys", icons: [
        ["playpause.fill", function (g) {
            outline(g, [[30, 66], [30, 174], [112, 120]], true);
            g.fillRect(140, 66, 24, 108);
            g.fillRect(184, 66, 24, 108);
        }],
        ["backward.fill", function (g) {
            outline(g, [[118, 66], [118, 174], [30, 120]], true);
            outline(g, [[210, 66], [210, 174], [122, 120]], true);
        }],
        ["forward.fill", function (g) {
            outline(g, [[30, 66], [30, 174], [118, 120]], true);
            outline(g, [[122, 66], [122, 174], [210, 120]], true);
        }],
        ["speaker.plus.fill", function (g) {
            speaker(g);
            lines(g, [[148, 120], [212, 120]]);
            lines(g, [[180, 88], [180, 152]]);
        }],
        ["speaker.minus.fill", function (g) {
            speaker(g);
            lines(g, [[148, 120], [212, 120]]);
        }],
        ["speaker.slash.fill", function (g) {
            speaker(g);
            slashed(g, [30, 40], [210, 200]);
        }],
        ["arrow.up", function (g) { arrowUp(g); }],
        ["arrow.down", function (g) { turned(g, 180, function () { arrowUp(g); }); }],
        ["arrow.left", function (g) { turned(g, -90, function () { arrowUp(g); }); }],
        ["arrow.right", function (g) { turned(g, 90, function () { arrowUp(g); }); }],
        ["arrow.up.left.and.arrow.down.right", function (g) {
            lines(g, [[52, 52], [104, 104]]);
            lines(g, [[52, 108], [52, 52], [108, 52]]);
            lines(g, [[188, 188], [136, 136]]);
            lines(g, [[188, 132], [188, 188], [132, 188]]);
        }]
    ] },
    { title: "Connection and devices list", icons: [
        ["antenna.radiowaves.left.and.right", function (g) {
            circle(g, 120, 100, 14, true);
            lines(g, [[120, 116], [120, 214]]);
            radiowaves(g, 120, 100, [46, 84]);
        }],
        ["antenna.radiowaves.left.and.right.slash", function (g) {
            circle(g, 120, 100, 14, true);
            lines(g, [[120, 116], [120, 214]]);
            radiowaves(g, 120, 100, [46, 84]);
            slashed(g, [30, 30], [210, 210]);
        }],
        ["dot.radiowaves.left.and.right", function (g) {
            circle(g, 120, 120, 16, true);
            radiowaves(g, 120, 120, [48, 88]);
        }],
        ["checkmark", function (g) { lines(g, [[40, 126], [94, 180], [202, 62]]); }],
        ["minus.circle", function (g) {
            circle(g, 120, 120, 94, false);
            lines(g, [[72, 120], [168, 120]]);
        }],
        ["xmark.circle", function (g) {
            circle(g, 120, 120, 94, false);
            lines(g, [[84, 84], [156, 156]]);
            lines(g, [[156, 84], [84, 156]]);
        }],
        ["slash.circle", function (g) {
            circle(g, 120, 120, 94, false);
            lines(g, [[54, 186], [186, 54]]);
        }],
        ["eye", function (g) { eye(g); }],
        ["eye.slash", function (g) {
            eye(g);
            slashed(g, [36, 36], [204, 204]);
        }]
    ] },
    { title: "Settings and app shell", icons: [
        ["gearshape", function (g) { gear(g, 120, 120, 104, 80, 8); }],
        ["gear.badge", function (g) {
            gear(g, 108, 132, 86, 66, 8);
            cutOut(g, function () { circle(g, 190, 50, 36, true); });
            circle(g, 190, 50, 22, true);
        }],
        ["hammer", function (g) {
            turned(g, -40, function () {
                roundRect(g, 64, 40, 112, 40, 8);
                g.stroke();
                lines(g, [[120, 80], [120, 214]]);
            });
        }],
        ["arrow.counterclockwise", function (g) {
            g.beginPath(); g.arc(120, 124, 80, -Math.PI / 2, Math.PI); g.stroke();
            lines(g, [[148, 20], [120, 44], [148, 68]]);
        }],
        ["square.and.arrow.up", function (g) {
            openBox(g);
            lines(g, [[120, 148], [120, 26]]);
            lines(g, [[84, 62], [120, 26], [156, 62]]);
        }],
        ["square.and.arrow.down", function (g) {
            openBox(g);
            lines(g, [[120, 26], [120, 150]]);
            lines(g, [[84, 114], [120, 150], [156, 114]]);
        }],
        ["square.and.pencil", function (g) {
            lines(g, [[120, 52], [40, 52], [40, 200], [188, 200], [188, 120]]);
            g.lineWidth = 20;
            lines(g, [[104, 136], [198, 42]]);
        }],
        ["square.dashed", function (g) {
            g.setLineDash([26, 22]);
            roundRect(g, 34, 34, 172, 172, 22);
            g.stroke();
            g.setLineDash([]);
        }]
    ] },
    { title: "Trackpad", icons: [
        ["lock.fill", function (g) {
            roundRect(g, 50, 108, 140, 108, 16);
            g.fill();
            g.beginPath(); g.moveTo(78, 108); g.lineTo(78, 78); g.arc(120, 78, 42, Math.PI, 0); g.lineTo(162, 108); g.stroke();
        }],
        ["lock.open", function (g) {
            roundRect(g, 26, 108, 140, 108, 16);
            g.fill();
            g.beginPath(); g.moveTo(130, 108); g.lineTo(130, 72); g.arc(172, 72, 42, Math.PI, 0); g.lineTo(214, 92); g.stroke();
        }]
    ] },
    { title: "Cast", icons: [
        ["rectangle.3.group", function (g) {
            roundRect(g, 26, 30, 188, 92, 12);
            g.stroke();
            roundRect(g, 26, 144, 84, 66, 12);
            g.stroke();
            roundRect(g, 130, 144, 84, 66, 12);
            g.stroke();
        }],
        ["checkmark.circle.fill", function (g) {
            circle(g, 120, 120, 100, true);
            cutOut(g, function () { g.lineWidth = 22; check(g); });
        }],
        ["xmark", function (g) {
            lines(g, [[56, 56], [184, 184]]);
            lines(g, [[184, 56], [56, 184]]);
        }]
    ] },
    { title: "Developer tools only", icons: [
        ["hand.point.up.left.fill", function (g) {
            turned(g, -30, function () {
                roundRect(g, 104, 22, 34, 110, 17);                        // the pointing finger
                g.fill();
                roundRect(g, 84, 108, 112, 100, 34);                       // the hand
                g.fill();
            });
        }],
        ["play.fill", function (g) { outline(g, [[64, 40], [64, 200], [196, 120]], true); }],
        ["record.circle", function (g) {
            circle(g, 120, 120, 96, false);
            circle(g, 120, 120, 52, true);
        }],
        ["scope", function (g) {
            circle(g, 120, 120, 74, false);
            lines(g, [[120, 18], [120, 76]]);
            lines(g, [[120, 164], [120, 222]]);
            lines(g, [[18, 120], [76, 120]]);
            lines(g, [[164, 120], [222, 120]]);
            circle(g, 120, 120, 10, true);
        }],
        ["rectangle.dashed", function (g) {
            g.setLineDash([26, 20]);
            roundRect(g, 20, 60, 200, 120, 16);
            g.stroke();
            g.setLineDash([]);
        }],
        ["arrow.triangle.2.circlepath", function (g) {
            g.beginPath(); g.arc(120, 120, 82, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
            lines(g, [[178, 84], [199, 100], [212, 74]]);
            g.beginPath(); g.arc(120, 120, 82, Math.PI * 0.08, Math.PI * 0.92); g.stroke();
            lines(g, [[62, 156], [41, 140], [28, 166]]);
        }],
        ["arrow.up.right.circle", function (g) {
            circle(g, 120, 120, 96, false);
            lines(g, [[84, 156], [158, 82]]);
            lines(g, [[100, 82], [158, 82], [158, 140]]);
        }],
        ["plus.circle.fill", function (g) {
            circle(g, 120, 120, 100, true);
            cutOut(g, function () {
                g.lineWidth = 22;
                lines(g, [[120, 66], [120, 174]]);
                lines(g, [[66, 120], [174, 120]]);
            });
        }],
        ["trash", function (g) {
            lines(g, [[36, 58], [204, 58]]);                                // the lid
            lines(g, [[94, 58], [100, 32], [140, 32], [146, 58]]);          // its handle
            outline(g, [[56, 58], [70, 214], [170, 214], [184, 58]], false);
            lines(g, [[98, 90], [100, 186]]);
            lines(g, [[120, 90], [120, 186]]);
            lines(g, [[142, 90], [140, 186]]);
        }],
        ["chevron.down", function (g) { lines(g, [[48, 86], [120, 158], [192, 86]]); }],
        ["chevron.right", function (g) { lines(g, [[86, 48], [158, 120], [86, 192]]); }],
        ["circle", function (g) { circle(g, 120, 120, 96, false); }],
        ["circle.fill", function (g) { circle(g, 120, 120, 96, true); }],
        ["square", function (g) {
            roundRect(g, 30, 30, 180, 180, 26);
            g.stroke();
        }],
        ["checkmark.square.fill", function (g) {
            roundRect(g, 30, 30, 180, 180, 26);
            g.fill();
            cutOut(g, function () { g.lineWidth = 22; check(g); });
        }]
    ] },
    { title: "Not in the app (ours)", icons: [
        ["wifi", function (g) {
            circle(g, 120, 196, 14, true);
            [52, 96, 140].forEach(function (r) {
                g.beginPath(); g.arc(120, 204, r, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke();
            });
        }],
        ["bluetooth", function (g) {
            lines(g, [[78, 74], [162, 150], [120, 190], [120, 50], [162, 90], [78, 166]]);
        }],
        ["house", function (g) {
            lines(g, [[22, 124], [120, 34], [218, 124]]);                  // the roof
            lines(g, [[52, 100], [52, 212], [188, 212], [188, 100]]);
            roundRect(g, 100, 150, 40, 62, 8);                             // the door
            g.stroke();
        }],
        ["computermouse", function (g) {
            roundRect(g, 68, 24, 104, 192, 52);
            g.stroke();
            lines(g, [[120, 52], [120, 86]]);                              // the scroll wheel
        }],
        // The app icon's look: a pointer moving up and right, trailing ghosts of itself, fainter the further back
        ["drift (ghosted pointers)", [
            { alpha: 0.18, draw: function (g) { pointer(g, 0.74, -6, 54, true); } },
            { alpha: 0.32, draw: function (g) { pointer(g, 0.74, 18, 42, true); } },
            { alpha: 0.55, draw: function (g) { pointer(g, 0.74, 42, 30, true); } },
            { alpha: 1, draw: function (g) { pointer(g, 0.74, 66, 18, true); } }
        ]]
    ] }
];
// The app icon's ghosted pointers, faded into the middle of the iPhone as the intro's name fades out: their own
// dots (already in place, so they fade rather than gather), centred on the shape they make
var GHOST = (function () {
    var layers = GROUPS[GROUPS.length - 1].icons.filter(function (icon) { return icon[0] === "drift (ghosted pointers)"; })[0][1];
    // Every pointer whole, so each can come away from the others (Connect) with no hole where the one in front
    // covered it; those covered dots are marked, and stay unseen while they're stacked:
    // [across, up, alpha, which pointer (0 the faintest, at the back), covered (1) or not (0)]
    var pixels = layers.map(function (layer) {
        var c = document.createElement("canvas");
        c.width = c.height = 240;
        var cg = c.getContext("2d");
        cg.strokeStyle = cg.fillStyle = "#fff";
        cg.lineWidth = 14;
        cg.lineCap = cg.lineJoin = "round";
        layer.draw(cg);
        return cg.getImageData(0, 0, 240, 240).data;
    });
    var on = function (n, px, py) { return pixels[n][(py * 240 + px) * 4 + 3] > 128; };
    var offsets = [];
    for (var step = 3; step < 24; step++) {
        var found = [], seen = 0;
        for (var py = 0; py < 240; py += step) {
            for (var px = 0; px < 240; px += step) {
                for (var n = 0; n < layers.length; n++) {
                    if (!on(n, px, py)) continue;
                    var covered = 0;
                    for (var m = n + 1; m < layers.length; m++) if (on(m, px, py)) covered = 1;
                    if (!covered) seen++;
                    found.push([(px - 120) / 240, (120 - py) / 240, layers[n].alpha, n, covered]);
                }
            }
        }
        offsets = found;
        if (seen <= 150) break;   // as many showing as before: about 150
    }
    var xs = offsets.map(function (o) { return o[0]; }), ys = offsets.map(function (o) { return o[1]; });
    var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    var my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    offsets.forEach(function (o) { o[0] -= mx; o[1] -= my; });
    // each pointer's middle and width, for laying them out in a row
    var centres = layers.map(function (layer, n) {
        var mine = offsets.filter(function (o) { return o[3] === n; });
        var lx = mine.map(function (o) { return o[0]; }), ly = mine.map(function (o) { return o[1]; });
        return {
            x: (Math.min.apply(null, lx) + Math.max.apply(null, lx)) / 2,
            y: (Math.min.apply(null, ly) + Math.max.apply(null, ly)) / 2,
            w: Math.max.apply(null, lx) - Math.min.apply(null, lx)
        };
    });
    return { offsets: offsets, from: [], centres: centres };   // (where each dot is born: a label, set below)
})();
var GHOST_SCALE = 0.36;   // its size, as a share of the iPhone's (so it sits inside the phone)

// The same icon at the top of the grid (Icons), where pointing at it pulls its pointers apart into four separate
// ones (a tap does it on a phone). Each pointer is sampled whole, so none has a hole where the one in front
// covered it: [across, up, alpha, which pointer (0 the faintest, at the back)]
var FEATURE = (function () {
    var layers = GROUPS[GROUPS.length - 1].icons.filter(function (icon) { return icon[0] === "drift (ghosted pointers)"; })[0][1];
    var offsets = [];
    layers.forEach(function (layer, n) {
        sampleIcon(layer.draw, 60).forEach(function (p) { offsets.push([p[0], p[1], layer.alpha, n]); });
    });
    return {
        name: "drift (ghosted pointers)",
        offsets: offsets,
        from: offsets.map(function () { return { x: Math.random(), y: Math.random() }; }),
        gatherFrom: -100,
        layerCount: layers.length,
        spread: 0,        // 0 → 1: pulled apart
        hover: false,
        box: null         // where it is on screen, for pointing at it
    };
})();
// Pulled apart, each pointer moves this far (a share of the icon's size) from the next, sideways and a little up
var SPREAD_X = 0.3, SPREAD_Y = 0.04;

// The device list (Connect's end): its devices along the top, left to right, by their names in the grid
var LIST = ["ipad", "laptopcomputer", "desktopcomputer", "homepod"];
function gridIcon(name) {
    for (var gi = 0; gi < GRID.length; gi++) {
        for (var ii = 0; ii < GRID[gi].icons.length; ii++) if (GRID[gi].icons[ii].name === name) return GRID[gi].icons[ii];
    }
    return null;
}

// The grid (Icons): each group's title, then its icons, each sampled into fewer dots (they're small)
var GRID_POINTS = 150;
var GRID = GROUPS.map(function (group) {
    return {
        title: group.title,
        icons: group.icons.map(function (icon) {
            var offsets = typeof icon[1] === "function" ? sampleIcon(icon[1], GRID_POINTS) : sampleLayers(icon[1], GRID_POINTS);
            return {
                name: icon[0],
                offsets: offsets,
                from: offsets.map(function () { return { x: Math.random(), y: Math.random() }; }),
                gatherFrom: -100
            };
        })
    };
});

// Ice blue: near-white at the top through to deep blue at the bottom (p: 0 → 1)
var ICE = [[0xf2, 0xfb, 0xff], [0xb5, 0xe2, 0xff], [0x74, 0xb9, 0xff], [0x3f, 0x7f, 0xff]];
function iceRGB(p) {
    p = Math.max(0, Math.min(1, p)) * (ICE.length - 1);
    var at = Math.min(ICE.length - 2, Math.floor(p));
    var f = p - at, a = ICE[at], b = ICE[at + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
function rgb(c) { return "rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")"; }
function ice(p) { return rgb(iceRGB(p)); }

var canvas = document.getElementById("dots");
var g = canvas.getContext("2d");
var ratio = 1;
function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
}
window.addEventListener("resize", resize);
resize();
