// ─── Uses globals from CDN: gsap ────────────────────

// ─── CURSOR ─────────────────────────────────────────
const cursor = document.getElementById('cursor');
gsap.set(cursor, { xPercent: -50, yPercent: -50 });
document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'none' });
});
document.querySelectorAll('a, button, select').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

// ─── BG CANVAS ───────────────────────────────────────
const bgCanvas = document.getElementById('cfl-bg-canvas');
const ctx = bgCanvas.getContext('2d');
const resize = () => {
    bgCanvas.width = bgCanvas.parentElement.clientWidth;
    bgCanvas.height = bgCanvas.parentElement.clientHeight;
};
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 70;
const pts = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.2 + 0.3,
    life: Math.random(),
}));

const animateBG = () => {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = bgCanvas.width;
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height;
        if (p.y > bgCanvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const rnd = Math.random();
        ctx.fillStyle = rnd > 0.97 ? '#a78bfa' : rnd > 0.94 ? '#22d3ee' : '#ffffff';
        ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
    });
    for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 100) {
                ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                ctx.strokeStyle = `rgba(167,139,250,${0.05 * (1 - d/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateBG);
};
animateBG();

// ─── PARSE TREE CANVAS ──────────────────────────────
const treeCanvas = document.getElementById('cfl-tree-canvas');
const treeCtx = treeCanvas.getContext('2d');
const resizeTree = () => {
    const wrap = document.getElementById('cfl-tree-wrap');
    treeCanvas.width = wrap.clientWidth * window.devicePixelRatio;
    treeCanvas.height = wrap.clientHeight * window.devicePixelRatio;
    treeCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
};
resizeTree();
window.addEventListener('resize', resizeTree);

function drawTree(parts, isStable) {
    const w = treeCanvas.width / window.devicePixelRatio;
    const h = treeCanvas.height / window.devicePixelRatio;
    treeCtx.clearRect(0, 0, w, h);
    const cx = w / 2, topY = 20, midY = 70, botY = 140;
    const colors = { u: '#64b5f6', v: '#a78bfa', x: '#22d3ee', y: '#f472b6', z: '#ff7043' };
    drawNode(treeCtx, cx, topY, 'S', isStable ? '#a78bfa' : '#f472b6');
    const leftX = cx - w * 0.28, rightX = cx + w * 0.28;
    drawEdge(treeCtx, cx, topY + 10, leftX, midY - 10, 'rgba(167,139,250,0.4)');
    drawEdge(treeCtx, cx, topY + 10, cx, midY - 10, 'rgba(34,211,238,0.3)');
    drawEdge(treeCtx, cx, topY + 10, rightX, midY - 10, 'rgba(244,114,182,0.4)');
    drawNode(treeCtx, leftX, midY, 'A', 'rgba(167,139,250,0.6)');
    drawNode(treeCtx, cx, midY, 'A', 'rgba(34,211,238,0.6)');
    drawNode(treeCtx, rightX, midY, 'A', 'rgba(244,114,182,0.6)');
    const segments = [
        { label: 'u', x: leftX - w*0.1, color: colors.u, from: leftX },
        { label: 'v', x: leftX + w*0.05, color: colors.v, from: leftX },
        { label: 'x', x: cx, color: colors.x, from: cx },
        { label: 'y', x: rightX - w*0.05, color: colors.y, from: rightX },
        { label: 'z', x: rightX + w*0.1, color: colors.z, from: rightX },
    ];
    segments.forEach(seg => {
        drawEdge(treeCtx, seg.from, midY + 10, seg.x, botY - 10, seg.color + '60');
        const val = parts[seg.label] || '';
        drawNode(treeCtx, seg.x, botY, val || 'ε', seg.color, (seg.label === 'v' || seg.label === 'y') && val.length > 0);
    });
    if (!isStable) {
        treeCtx.save();
        treeCtx.font = '10px "Space Mono", monospace';
        treeCtx.fillStyle = '#f472b6'; treeCtx.globalAlpha = 0.7;
        treeCtx.fillText('↻ pump', leftX + w*0.05 - 15, botY + 24);
        treeCtx.fillText('↻ pump', rightX - w*0.05 - 15, botY + 24);
        treeCtx.restore();
    }
}

function drawNode(ctx, x, y, text, color, glow = false) {
    ctx.save();
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17,17,17,0.9)'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    const display = text.length > 6 ? text.slice(0, 5) + '…' : text;
    ctx.fillText(display, x, y); ctx.restore();
}

function drawEdge(ctx, x1, y1, x2, y2, color) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
}

// ─── CFL SIMULATION LOGIC ────────────────────────────
const LANGUAGES = {
    anbncn: {
        title: 'Parse Tree Resonance Field',
        desc: 'L₁: Equal counts of a, b, and c in sequence. String: aⁿbⁿcⁿ',
        genString: p => ({
            u: 'a'.repeat(Math.max(0, p - 2)), v: 'a'.repeat(1),
            x: 'a'.repeat(1) + 'b'.repeat(1), y: 'b'.repeat(1),
            z: 'b'.repeat(p - 2) + 'c'.repeat(p),
            fullOriginal: 'a'.repeat(p) + 'b'.repeat(p) + 'c'.repeat(p),
        }),
        check: str => {
            const a = (str.match(/a/g)||[]).length, b = (str.match(/b/g)||[]).length, c = (str.match(/c/g)||[]).length;
            return a === b && b === c && a > 0;
        },
    },
    ww: {
        title: 'Mirror Symmetry Breach',
        desc: 'L₂: The string w repeated exactly. Requires exact copy matching. String: ww where w ∈ {a,b}*',
        genString: p => {
            const half = 'a'.repeat(p) + 'b';
            return { u: 'a'.repeat(Math.max(0,p-2)), v: 'a'.repeat(1), x: 'a'.repeat(1)+'b', y: 'a'.repeat(1), z: 'a'.repeat(Math.max(0,p-2))+'b', fullOriginal: half+half };
        },
        check: str => { if (str.length % 2 !== 0) return false; const mid = str.length/2; return str.slice(0,mid) === str.slice(mid); },
    },
    anbncndn: {
        title: 'Quad Frequency Lock',
        desc: 'L₃: Four-way balance — equal counts of a, b, c, d. String: aⁿbⁿcⁿdⁿ',
        genString: p => ({
            u: 'a'.repeat(Math.max(0,p-2)), v: 'a'.repeat(1), x: 'a'.repeat(1)+'b'.repeat(1), y: 'b'.repeat(1),
            z: 'b'.repeat(p-2)+'c'.repeat(p)+'d'.repeat(p), fullOriginal: 'a'.repeat(p)+'b'.repeat(p)+'c'.repeat(p)+'d'.repeat(p),
        }),
        check: str => {
            const a=(str.match(/a/g)||[]).length, b=(str.match(/b/g)||[]).length, c=(str.match(/c/g)||[]).length, d=(str.match(/d/g)||[]).length;
            return a===b && b===c && c===d && a>0;
        },
    },
    a2n: {
        title: 'Perfect Square Disruption',
        desc: 'L₄: String of a\'s whose length is a perfect square. String: a^(n²)',
        genString: p => {
            const totalLen = p * p;
            const q = Math.floor(totalLen/4);
            return { u: 'a'.repeat(Math.max(0,q)), v: 'a'.repeat(1), x: 'a'.repeat(Math.max(1,q)), y: 'a'.repeat(1), z: 'a'.repeat(Math.max(0,totalLen-q-1-q-1)), fullOriginal: 'a'.repeat(totalLen) };
        },
        check: str => { const len=str.length; if(len===0) return false; const s=Math.sqrt(len); return s===Math.floor(s); },
    },
};

let state = { lang: 'anbncn', p: 3, n: 1 };

const $langSelect  = document.getElementById('cfl-lang-select');
const $rangeP      = document.getElementById('cfl-range-p');
const $valP        = document.getElementById('cfl-val-p');
const $valN        = document.getElementById('cfl-val-n');
const $nGhost      = document.getElementById('cfl-n-ghost');
const $btnUp       = document.getElementById('cfl-btn-up');
const $btnDn       = document.getElementById('cfl-btn-dn');
const $partU       = document.getElementById('cfl-part-u');
const $partV       = document.getElementById('cfl-part-v');
const $partX       = document.getElementById('cfl-part-x');
const $partY       = document.getElementById('cfl-part-y');
const $partZ       = document.getElementById('cfl-part-z');
const $wrap        = document.getElementById('cfl-string-wrap');
const $statusTitle = document.getElementById('cfl-status-title');
const $statusDtl   = document.getElementById('cfl-status-detail');
const $langTitle   = document.getElementById('cfl-lang-title');
const $langDesc    = document.getElementById('cfl-lang-desc');

function render() {
    const L = LANGUAGES[state.lang];
    const parts = L.genString(state.p);
    const { u, v, x, y, z } = parts;
    const pumpedV = v.repeat(state.n), pumpedY = y.repeat(state.n);
    const fullString = u + pumpedV + x + pumpedY + z;

    $valP.textContent = state.p; $valN.textContent = state.n; $nGhost.textContent = state.n;
    $partU.textContent = u || 'ε';
    $partV.textContent = (pumpedV || 'ε') + ` (×${state.n})`;
    $partX.textContent = x || 'ε';
    $partY.textContent = (pumpedY || 'ε') + ` (×${state.n})`;
    $partZ.textContent = z || 'ε';
    $langTitle.textContent = L.title; $langDesc.textContent = L.desc;

    $wrap.innerHTML = '';
    const frag = document.createDocumentFragment();
    const addTokens = (str, pumpClass = '') => {
        for (let i = 0; i < str.length; i++) {
            const t = document.createElement('div');
            t.className = `token ${str[i]}` + (pumpClass ? ` ${pumpClass}` : '');
            t.textContent = str[i]; frag.appendChild(t);
        }
    };
    addTokens(u);
    addTokens(pumpedV, state.n !== 1 ? 'v-pump' : '');
    addTokens(x);
    addTokens(pumpedY, state.n !== 1 ? 'y-pump' : '');
    addTokens(z);
    $wrap.appendChild(frag);

    gsap.fromTo('.cfl-string-wrap .token', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.015, ease: 'back.out(2)' });

    const stable = L.check(fullString);
    $statusTitle.className = `status-indicator ${stable ? 'stable' : 'unstable'}`;
    $statusTitle.textContent = stable ? 'PARSE TREE: STABLE' : 'PARSE TREE: COLLAPSED!';
    $statusDtl.textContent = stable
        ? `String "${fullString.length > 30 ? fullString.slice(0,30)+'…' : fullString}" satisfies the language rule. Accepted.`
        : `Pumped string (length ${fullString.length}) violates the language rule. This language is NOT context-free.`;

    drawTree({ u, v: pumpedV, x, y: pumpedY, z }, stable);

    const stage = document.querySelector('.cfl-stage');
    if (!stable) {
        gsap.fromTo(stage, { outlineColor: 'rgba(244,114,182,0)' },
            { outlineColor: 'rgba(244,114,182,0.4)', outlineWidth: '2px', outlineStyle: 'solid', duration: 0.2, yoyo: true, repeat: 3 });
    } else { stage.style.outline = 'none'; }
}

$langSelect.addEventListener('change', e => { state.lang = e.target.value; state.n = 1; render(); });
$rangeP.addEventListener('input', e => { state.p = +e.target.value; state.n = 1; render(); });
$btnUp.addEventListener('click', () => { state.n++; render(); });
$btnDn.addEventListener('click', () => { if (state.n > 0) { state.n--; render(); } });

render();
