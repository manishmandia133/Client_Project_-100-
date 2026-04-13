import { gsap } from 'gsap';

// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3 });
});

const hoverElements = document.querySelectorAll('a, button, .interactive, input');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
    });
});

// Simulation State
let config = {
    p: 4,
    n: 1,
    lang: 'p_n_d_n'
};

// DOM Elements
const selectLang = document.getElementById('example-select');
const inputP = document.getElementById('input-p');
const valP = document.getElementById('val-p');
const infoP = document.getElementById('info-p');
const valX = document.getElementById('val-x');
const valY = document.getElementById('val-y');
const valZ = document.getElementById('val-z');
const valN = document.getElementById('val-n');
const btnPumpUp = document.getElementById('btn-pump-up');
const btnPumpDown = document.getElementById('btn-pump-down');
const stringDisplay = document.getElementById('string-display');
const statusText = document.getElementById('status-text');
const statusDetails = document.getElementById('status-details');

// Update UI
function renderSimulation() {
    valP.textContent = config.p;
    valN.textContent = config.n;

    // Partition logic: s = P^p D^p
    // x gets first ceil(p/2) 'P's
    // y gets the rest of the 'P's (at least 1)
    // z gets the 'D's
    const pCount = config.p;
    const countX = Math.max(1, Math.ceil(pCount / 2));
    const countY = pCount - countX; // This will always be > 0 since max p=6, min p=2
    
    // In edge case where p=1 (not possible here min is 2), y would be 0, breaking rules.
    // For p=2, countX=1, countY=1.
    // For p=4, countX=2, countY=2.

    const strX = 'P'.repeat(countX);
    const strY = 'P'.repeat(countY);
    const strZ = 'D'.repeat(pCount);

    valX.textContent = strX;
    valY.textContent = strY;
    valZ.textContent = strZ;

    // Generate current string based on n
    stringDisplay.innerHTML = '';
    
    let totalP = countX + (countY * config.n);
    let totalD = pCount;
    if (config.lang === 'p_n_d_2n') {
        totalD = pCount * 2;
    }

    // Render X
    for(let i=0; i<countX; i++) {
        createParticle('P', 'x-part');
    }

    // Render Y (pumped n times)
    for(let i=0; i<config.n; i++) {
        for(let j=0; j<countY; j++) {
            createParticle('P', 'y-part');
        }
    }

    // Render Z
    for(let i=0; i<totalD; i++) {
        createParticle('D', 'z-part');
    }

    // Animate Particles
    gsap.from('.particle', {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: 'back.out(1.7)'
    });

    // Update Status
    if (config.lang === 'p_n_d_n') {
        infoP.textContent = `Initial sequence: P^${config.p} D^${config.p}`;
        if(totalP === totalD) {
            statusText.textContent = 'GRAVITY FIELD: STABLE';
            statusText.className = 'status-indicator stable';
            statusDetails.textContent = `P Count (${totalP}) MATCHES D Count (${totalD}). The machine accepts the sequence.`;
        } else {
            statusText.textContent = 'GRAVITY FIELD: UNSTABLE!';
            statusText.className = 'status-indicator unstable';
            statusDetails.textContent = `P Count (${totalP}) DOES NOT MATCH D Count (${totalD}). The engine rejects the pumped sequence!`;
        }
    } else if (config.lang === 'p_n_d_2n') {
        infoP.textContent = `Initial sequence: P^${config.p} D^${config.p * 2}`;
        if(totalD === totalP * 2) {
            statusText.textContent = 'GRAVITY FIELD: STABLE';
            statusText.className = 'status-indicator stable';
            statusDetails.textContent = `D Count (${totalD}) is exactly TWICE P Count (${totalP}). Accepted.`;
        } else {
            statusText.textContent = 'GRAVITY FIELD: UNSTABLE!';
            statusText.className = 'status-indicator unstable';
            statusDetails.textContent = `D Count (${totalD}) is NOT exactly TWICE P Count (${totalP}). Rejected!`;
        }
    }
}

function createParticle(type, className) {
    const el = document.createElement('div');
    el.classList.add('particle', type.toLowerCase(), className);
    el.textContent = type;
    stringDisplay.appendChild(el);
}

// Event Listeners
selectLang.addEventListener('change', (e) => {
    config.lang = e.target.value;
    config.n = 1;
    renderSimulation();
});

inputP.addEventListener('input', (e) => {
    config.p = parseInt(e.target.value);
    config.n = 1; // reset n when changing p
    renderSimulation();
});

btnPumpUp.addEventListener('click', () => {
    config.n += 1;
    renderSimulation();
});

btnPumpDown.addEventListener('click', () => {
    if(config.n > 0) {
        config.n -= 1;
        renderSimulation();
    }
});

// Initial Render
renderSimulation();
