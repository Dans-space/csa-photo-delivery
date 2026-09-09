// ============================================
// CONFIGURATION — Edit this section to update content
// ============================================
const CONFIG = {
    studio: {
        name: 'DanRec STUDIO',
    },
    shoot: {
        title: 'CSA Professional Pictures',
        date: '2025',
        client: 'CSA',
    },
    // Hero images — replace placeholder paths with real images
    heroImages: {
        landing: '',      // e.g. 'assets/images/hero-landing.jpg'
        portraits: '',    // e.g. 'assets/images/hero-portraits.jpg'
    },
    categories: [
        {
            id: 'portraits',
            name: 'Portraits',
            description: 'Individual portrait sessions',
            people: [
                { id: 'jade',     name: 'Jade',     heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 25 },
                { id: 'victoria', name: 'Victoria', heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 28 },
                { id: 'jojo',     name: 'Jojo',     heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 25 },
                { id: 'roham',    name: 'Roham',    heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 27 },
                { id: 'raphaela', name: 'Raphaela', heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 26 },
                { id: 'tuya',     name: 'Tuya',     heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 25 },
                { id: 'susan',    name: 'Susan',    heroImage: '', albumUrl: '', downloadUrl: '', photoCount: 30 },
            ],
        },
    ],
};

// ============================================
// STATE
// ============================================
const state = {
    currentView: null,
    transitioning: false,
};

// ============================================
// HELPERS
// ============================================
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
}

function findCategory(id) {
    return CONFIG.categories.find(c => c.id === id);
}

function findPerson(categoryId, personId) {
    const cat = findCategory(categoryId);
    return cat ? cat.people.find(p => p.id === personId) : null;
}

// ============================================
// ROUTER
// ============================================
function parseRoute() {
    const hash = location.hash.replace('#', '') || '/';
    const parts = hash.split('/').filter(Boolean);
    if (parts.length === 0) return { view: 'landing' };
    if (parts.length === 1) return { view: 'category', categoryId: parts[0] };
    if (parts.length === 2) return { view: 'person', categoryId: parts[0], personId: parts[1] };
    return { view: 'landing' };
}

function navigate(hash) {
    location.hash = hash;
}

// ============================================
// VIEW TRANSITIONS
// ============================================
function switchView(viewId) {
    if (state.transitioning) return;
    const current = $(`.view.active`);
    const next = $(`#view-${viewId}`);
    if (!next || current === next) return;

    state.transitioning = true;

    if (current) {
        current.classList.remove('active');
        current.classList.add('exiting');
        current.addEventListener('animationend', function handler() {
            current.removeEventListener('animationend', handler);
            current.classList.remove('exiting');
            current.style.display = 'none';
            showNext();
        }, { once: true });
    } else {
        showNext();
    }

    function showNext() {
        window.scrollTo({ top: 0, behavior: 'instant' });
        next.classList.add('active');
        state.currentView = viewId;
        state.transitioning = false;
        initRevealObserver();
        if (viewId === 'category') initTilt();
    }
}

// ============================================
// RENDERERS
// ============================================
function renderLanding() {
    $('#shoot-title').textContent = CONFIG.shoot.title;
    $('#shoot-info').textContent = `${CONFIG.studio.name}  ·  ${CONFIG.shoot.date}`;

    if (CONFIG.heroImages.landing) {
        $('#landing-hero').style.backgroundImage = `url('${CONFIG.heroImages.landing}')`;
        $('#landing-hero').style.backgroundSize = 'cover';
        $('#landing-hero').style.backgroundPosition = 'center';
    }

    const grid = $('#categories-container');
    grid.innerHTML = '';

    CONFIG.categories.forEach(cat => {
        const totalPhotos = cat.people.reduce((sum, p) => sum + p.photoCount, 0);
        const card = document.createElement('div');
        card.className = 'category-card reveal';
        card.innerHTML = `
            <div class="category-card__bg"></div>
            <div class="category-card__overlay"></div>
            <div class="category-card__info">
                <div class="category-card__name">${cat.name}</div>
                <div class="category-card__count">${cat.people.length} people · ${totalPhotos} photos</div>
            </div>
        `;
        card.addEventListener('click', () => navigate(`#${cat.id}`));
        grid.appendChild(card);
    });
}

function renderCategory(categoryId) {
    const cat = findCategory(categoryId);
    if (!cat) { navigate('#/'); return; }

    $('#category-eyebrow').textContent = CONFIG.shoot.title;
    $('#category-title').textContent = cat.name;
    $('#category-count').textContent = `${cat.people.length} people`;

    if (CONFIG.heroImages[categoryId]) {
        $('#category-hero').style.backgroundImage = `url('${CONFIG.heroImages[categoryId]}')`;
        $('#category-hero').style.backgroundSize = 'cover';
        $('#category-hero').style.backgroundPosition = 'center';
    }

    const grid = $('#people-container');
    grid.innerHTML = '';

    cat.people.forEach((person, i) => {
        const card = document.createElement('div');
        card.className = 'person-card reveal';
        card.style.transitionDelay = `${i * 0.06}s`;
        card.dataset.personId = person.id;

        const hasImage = person.heroImage && person.heroImage.length > 0;
        const imageContent = hasImage
            ? `<img src="${person.heroImage}" alt="${person.name}" style="width:100%;height:100%;object-fit:cover;">`
            : `<span class="person-card__initials">${getInitials(person.name)}</span>`;

        card.innerHTML = `
            <div class="person-card__image">${imageContent}</div>
            <div class="person-card__overlay"></div>
            <div class="person-card__info">
                <div class="person-card__name">${person.name}</div>
                <div class="person-card__photos">${person.photoCount} photos</div>
            </div>
            <div class="person-card__arrow">
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
        `;

        card.addEventListener('click', () => navigate(`#${categoryId}/${person.id}`));
        grid.appendChild(card);
    });
}

function renderPerson(categoryId, personId) {
    const person = findPerson(categoryId, personId);
    if (!person) { navigate(`#${categoryId}`); return; }

    $('#person-name').textContent = person.name;
    $('#person-photo-count').textContent = `${person.photoCount} photos`;

    if (person.heroImage) {
        $('#person-banner').style.backgroundImage = `url('${person.heroImage}')`;
        $('#person-banner').style.backgroundSize = 'cover';
        $('#person-banner').style.backgroundPosition = 'center';
    } else {
        $('#person-banner').style.backgroundImage = '';
    }

    const dlBtn = $('#btn-download');
    const lrBtn = $('#btn-lightroom');
    dlBtn.href = person.downloadUrl || '#';
    lrBtn.href = person.albumUrl || '#';
    if (!person.downloadUrl) dlBtn.style.opacity = '0.4';
    else dlBtn.style.opacity = '1';
    if (!person.albumUrl) lrBtn.style.opacity = '0.4';
    else lrBtn.style.opacity = '1';

    const grid = $('#photos-container');
    grid.innerHTML = '';

    for (let i = 1; i <= person.photoCount; i++) {
        const card = document.createElement('div');
        card.className = 'photo-card reveal';
        card.style.transitionDelay = `${Math.min(i * 0.03, 0.6)}s`;
        card.innerHTML = `
            <div class="photo-card__inner">
                <span class="photo-card__number">${String(i).padStart(2, '0')}</span>
            </div>
            <div class="photo-card__hover">
                <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
            </div>
        `;
        card.addEventListener('click', () => openLightbox(i - 1, person.photoCount));
        grid.appendChild(card);
    }
}

// ============================================
// BREADCRUMB
// ============================================
function updateBreadcrumb(route) {
    const bc = $('#breadcrumb');
    bc.innerHTML = '';

    if (route.view === 'landing') return;

    const cat = findCategory(route.categoryId);
    if (!cat) return;

    bc.innerHTML += `<span class="breadcrumb__sep">/</span>`;
    if (route.view === 'category') {
        bc.innerHTML += `<span class="breadcrumb__item current">${cat.name}</span>`;
    } else {
        bc.innerHTML += `<a href="#${cat.id}" class="breadcrumb__item">${cat.name}</a>`;
    }

    if (route.view === 'person') {
        const person = findPerson(route.categoryId, route.personId);
        if (person) {
            bc.innerHTML += `<span class="breadcrumb__sep">/</span>`;
            bc.innerHTML += `<span class="breadcrumb__item current">${person.name}</span>`;
        }
    }
}

// ============================================
// 3D TILT EFFECT
// ============================================
function initTilt() {
    const cards = $$('.person-card');
    cards.forEach(card => {
        let raf;
        card.addEventListener('mousemove', (e) => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rx = ((y - cy) / cy) * -8;
                const ry = ((x - cx) / cx) * 8;
                card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            if (raf) cancelAnimationFrame(raf);
            card.style.transition = 'transform 0.5s var(--ease-out), box-shadow 0.4s var(--ease-out)';
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    });
}

// ============================================
// LIGHTBOX
// ============================================
let lightboxIndex = 0;
let lightboxTotal = 0;

function openLightbox(index, total) {
    lightboxIndex = index;
    lightboxTotal = total;
    updateLightboxContent();
    $('#lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    $('#lightbox').classList.remove('open');
    document.body.style.overflow = '';
}

function updateLightboxContent() {
    const img = $('#lightbox-img');
    img.alt = `Photo ${lightboxIndex + 1} of ${lightboxTotal}`;
    // Placeholder — will show the actual photo when URLs are provided
    img.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="#1a1a1a"><rect width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="#333" font-family="sans-serif" font-size="24">${String(lightboxIndex + 1).padStart(2, '0')}</text></svg>`)}`;
    $('#lightbox-counter').textContent = `${lightboxIndex + 1} / ${lightboxTotal}`;
}

function lightboxPrev() {
    lightboxIndex = (lightboxIndex - 1 + lightboxTotal) % lightboxTotal;
    updateLightboxContent();
}

function lightboxNext() {
    lightboxIndex = (lightboxIndex + 1) % lightboxTotal;
    updateLightboxContent();
}

$('.lightbox__close').addEventListener('click', closeLightbox);
$('.lightbox__prev').addEventListener('click', lightboxPrev);
$('.lightbox__next').addEventListener('click', lightboxNext);

$('#lightbox').addEventListener('click', (e) => {
    if (e.target === $('#lightbox') || e.target === $('.lightbox__stage')) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!$('#lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
});

// ============================================
// SCROLL REVEAL
// ============================================
let revealObserver;

function initRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    $$('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

// ============================================
// NAV SCROLL EFFECT
// ============================================
function initNavScroll() {
    const nav = $('#nav');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                nav.classList.toggle('scrolled', window.scrollY > 60);
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// ROUTE HANDLER
// ============================================
function handleRoute() {
    const route = parseRoute();
    updateBreadcrumb(route);

    switch (route.view) {
        case 'landing':
            renderLanding();
            switchView('landing');
            break;
        case 'category':
            renderCategory(route.categoryId);
            switchView('category');
            break;
        case 'person':
            renderPerson(route.categoryId, route.personId);
            switchView('person');
            break;
    }
}

// ============================================
// INIT
// ============================================
function init() {
    $('#footer-year').textContent = new Date().getFullYear();

    // Loading screen
    setTimeout(() => {
        $('.loader').classList.add('done');
        setTimeout(() => { $('.loader').style.display = 'none'; }, 800);
    }, 1600);

    renderLanding();
    initNavScroll();
    initRevealObserver();

    window.addEventListener('hashchange', handleRoute);

    // Handle initial route after loader
    setTimeout(() => {
        const route = parseRoute();
        if (route.view !== 'landing') handleRoute();
    }, 100);
}

document.addEventListener('DOMContentLoaded', init);
