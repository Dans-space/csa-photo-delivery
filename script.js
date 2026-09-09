const CONFIG = {
    studio: { name: "Dan's Studios" },
    shoot: {
        title: 'OLYMPUS',
        subtitle: 'CSA Professional Shooting',
        date: '2026',
        client: 'CSA',
    },
    heroImages: {
        landing: 'assets/images/hero-landing.jpg',
        portraits: 'assets/images/hero-portraits.JPG',
    },
    categories: [
        {
            id: 'portraits',
            name: 'Portraits',
            locked: false,
            description: 'Individual portrait sessions',
            heroImage: 'assets/images/hero-portraits.JPG',
            people: [
                { id: 'jade',      name: 'Jade',       heroImage: 'assets/images/Jade hero.jpg',       albumUrl: 'https://adobe.ly/3VjI8Fw', downloadUrl: '' },
                { id: 'victoria',  name: 'Victoria',  heroImage: 'assets/images/Victoria hero.jpg',   albumUrl: 'https://adobe.ly/4qZ7Ue4', downloadUrl: '' },
                { id: 'jojo',      name: 'Jojo',      heroImage: 'assets/images/Jojo hero.jpg',       albumUrl: 'https://adobe.ly/4AiHCYG', downloadUrl: '', bannerPos: 'center 35%' },
                { id: 'roham',     name: 'Roham',     heroImage: 'assets/images/Roham hero.jpg',      albumUrl: 'https://adobe.ly/4r4kk4n', downloadUrl: '', bannerPos: 'center 35%' },
                { id: 'raphaelle', name: 'Raphaëlle', heroImage: 'assets/images/Raphaela Hero.jpg',   albumUrl: 'https://adobe.ly/46gnLvh', downloadUrl: '', bannerPos: 'center 35%' },
                { id: 'tuya',      name: 'Tuya',      heroImage: 'assets/images/Tuya hero.jpg',       albumUrl: 'https://adobe.ly/4ipw5jP', downloadUrl: '', bannerPos: 'center 35%' },
                { id: 'susan',     name: 'Susan',     heroImage: 'assets/images/Susan Hero.jpg',      albumUrl: 'https://adobe.ly/4yrs3Mn', downloadUrl: '' },
                { id: 'rejna',     name: 'Rejna',     heroImage: 'assets/images/Rejna hero.jpg',      albumUrl: 'https://adobe.ly/4gK9vRH', downloadUrl: '' },
            ],
        },
        {
            id: 'groupe-photo',
            name: 'Groupe Photo',
            locked: true,
            teaser: 'Coming soon',
            heroImage: 'assets/images/Grouope photo 1.JPG',
            bannerImage: 'assets/images/Groupe photo2o.JPG',
            people: [],
        },
        {
            id: 'the-statue',
            name: 'The Statue',
            locked: true,
            teaser: 'Coming soon',
            heroImage: 'assets/images/greek statu1 main.JPG',
            people: [],
        },
        {
            id: 'the-pool',
            name: 'The Pool',
            locked: true,
            teaser: 'Coming soon',
            heroImage: 'assets/images/The pool.JPG',
            people: [],
        },
        {
            id: 'exposed',
            name: 'Exposed',
            locked: true,
            teaser: 'Coming soon',
            heroImage: 'assets/images/Favoryt Exposes.JPG',
            people: [],
        },
    ],
    jpeg: {
        id: 'jpeg',
        name: 'JPEG',
        subtitle: 'Quick share to family and personal use',
        heroImage: 'assets/images/Jpeg share.JPG',
        disclaimer: 'These pictures were not edited and are not intended for professional use — use wisely.',
        people: [],
    },
};

const DEV_MODE = false;

const state = { currentView: null };

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

function switchView(viewId) {
    const current = $(`.view.active`);
    const next = $(`#view-${viewId}`);
    if (!next) return;
    if (current === next) return;

    $$('.view').forEach(v => {
        v.classList.remove('active', 'exiting');
        if (v !== next) v.style.display = 'none';
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
    next.style.display = 'block';
    void next.offsetWidth;
    next.classList.add('active');
    state.currentView = viewId;

    setTimeout(() => {
        initRevealObserver();
        if (viewId === 'category') initTilt();
    }, 50);
}

// ── Renderers ──

function renderLanding() {
    $('#shoot-title').textContent = CONFIG.shoot.title;
    $('#shoot-subtitle').textContent = CONFIG.shoot.subtitle;
    $('#shoot-info').textContent = `${CONFIG.shoot.date}`;

    if (CONFIG.heroImages.landing) {
        if (!$('#landing-hero .hero__bg-img')) {
            const img = document.createElement('img');
            img.src = CONFIG.heroImages.landing;
            img.alt = CONFIG.shoot.title;
            img.className = 'hero__bg-img';
            $('#landing-hero').insertBefore(img, $('#landing-hero').firstChild);
        }
    }

    const grid = $('#categories-container');
    grid.innerHTML = '';

    CONFIG.categories.forEach((cat, i) => {
        const card = document.createElement('div');
        card.className = 'category-card' + (cat.locked ? ' category-card--locked' : '');
        card.style.animationDelay = `${i * 0.1}s`;

        const bgStyle = cat.heroImage
            ? `background-image:url('${cat.heroImage}');background-size:cover;background-position:center;${cat.locked ? 'filter:blur(3px) brightness(0.4);' : ''}`
            : '';

        card.innerHTML = `
            <div class="category-card__bg" style="${bgStyle}"></div>
            <div class="category-card__overlay"></div>
            ${cat.locked ? '<div class="category-card__lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>' : ''}
            <div class="category-card__info">
                <div class="category-card__name">${cat.name}</div>
                <div class="category-card__count">${cat.locked ? cat.teaser : cat.people.length + ' people'}</div>
            </div>
        `;

        if (!cat.locked) {
            card.addEventListener('click', () => navigate(`#${cat.id}`));
        } else {
            const msg = document.createElement('div');
            msg.className = 'category-card__message';
            msg.innerHTML = `
                <p class="category-card__message-title">Still in the works</p>
                <p class="category-card__message-text">Will be available soon</p>
            `;
            card.appendChild(msg);
            card.addEventListener('click', () => {
                card.classList.remove('clicked');
                void card.offsetWidth;
                card.classList.add('clicked');
                msg.classList.add('visible');
                setTimeout(() => { msg.classList.remove('visible'); }, 2200);
                setTimeout(() => { card.classList.remove('clicked'); }, 600);
            });
        }
        grid.appendChild(card);
    });

    const container = grid.parentElement;
    let jpegSection = container.querySelector('.jpeg-section');
    if (jpegSection) jpegSection.remove();

    if (CONFIG.jpeg) {
        jpegSection = document.createElement('div');
        jpegSection.className = 'jpeg-section reveal';
        const jpeg = CONFIG.jpeg;
        const jpegBg = jpeg.heroImage
            ? `background-image:url('${jpeg.heroImage}');background-size:cover;background-position:center;filter:blur(3px) brightness(0.5);`
            : '';
        jpegSection.innerHTML = `
            <div class="jpeg-separator"></div>
            <div class="jpeg-card">
                <div class="category-card__bg" style="${jpegBg}"></div>
                <div class="category-card__overlay"></div>
                <div class="category-card__info">
                    <div class="category-card__name">${jpeg.name}</div>
                    <div class="category-card__count">${jpeg.subtitle}</div>
                </div>
            </div>
        `;
        jpegSection.querySelector('.jpeg-card').addEventListener('click', () => navigate(`#${jpeg.id}`));
        container.appendChild(jpegSection);
        setTimeout(checkReveals, 100);
    }
}

function renderCategory(categoryId) {
    const cat = findCategory(categoryId);
    if (!cat || cat.locked) { navigate('#/'); return; }

    $('#category-eyebrow').textContent = CONFIG.shoot.subtitle;
    $('#category-title').textContent = cat.name;
    $('#category-count').textContent = `${cat.people.length} people`;

    if (CONFIG.heroImages[categoryId] || cat.heroImage) {
        const src = CONFIG.heroImages[categoryId] || cat.heroImage;
        const existing = $('#category-hero .hero__bg-img');
        if (existing) existing.remove();
        const img = document.createElement('img');
        img.src = src;
        img.alt = cat.name;
        img.className = 'hero__bg-img';
        $('#category-hero').insertBefore(img, $('#category-hero').firstChild);
    }

    const grid = $('#people-container');
    grid.innerHTML = '';

    cat.people.forEach((person, i) => {
        const card = document.createElement('div');
        card.className = 'person-card';
        card.style.animationDelay = `${i * 0.06}s`;
        card.dataset.personId = person.id;

        const hasImage = person.heroImage && person.heroImage.length > 0;
        const imageContent = hasImage
            ? `<img src="${person.heroImage}" alt="${person.name}" loading="lazy">`
            : `<span class="person-card__initials">${getInitials(person.name)}</span>`;

        card.innerHTML = `
            <div class="person-card__image">${imageContent}</div>
            <div class="person-card__overlay"></div>
            <div class="person-card__info">
                <div class="person-card__name">${person.name}</div>
            </div>
        `;

        card.addEventListener('click', () => navigate(`#${categoryId}/${person.id}`));
        grid.appendChild(card);
    });
}

function renderJpeg() {
    const jpeg = CONFIG.jpeg;
    if (!jpeg) { navigate('#/'); return; }

    $('#category-eyebrow').textContent = 'Quick Share';
    $('#category-title').textContent = jpeg.name;
    $('#category-count').textContent = jpeg.subtitle;

    const existing = $('#category-hero .hero__bg-img');
    if (existing) existing.remove();
    if (jpeg.heroImage) {
        const img = document.createElement('img');
        img.src = jpeg.heroImage;
        img.alt = jpeg.name;
        img.className = 'hero__bg-img';
        $('#category-hero').insertBefore(img, $('#category-hero').firstChild);
    }

    const grid = $('#people-container');
    grid.innerHTML = '';

    const notice = document.createElement('div');
    notice.className = 'jpeg-disclaimer';
    notice.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>${jpeg.disclaimer}</p>
    `;
    grid.appendChild(notice);

    const photos = jpeg.photos || [];
    photos.forEach((photo, i) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.style.animationDelay = `${Math.min(i * 0.03, 0.6)}s`;
        card.innerHTML = `
            <div class="photo-card__inner">
                <img src="${photo}" alt="JPEG ${i + 1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="photo-card__hover">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderPerson(categoryId, personId) {
    const person = findPerson(categoryId, personId);
    if (!person) { navigate(`#${categoryId}`); return; }

    $('#person-name').textContent = person.name;
    const photos = person.photos || [];
    $('#person-photo-count').textContent = photos.length ? `${photos.length} photos` : '';

    const banner = $('#person-banner');
    const existing = banner.querySelector('.hero__bg-img');
    if (existing) existing.remove();
    if (person.heroImage) {
        const img = document.createElement('img');
        img.src = person.heroImage;
        img.alt = person.name;
        img.className = 'hero__bg-img';
        if (person.bannerPos) img.style.objectPosition = person.bannerPos;
        banner.insertBefore(img, banner.firstChild);
    }

    const dlBtn = $('#btn-download');
    const lrBtn = $('#btn-lightroom');
    dlBtn.href = person.downloadUrl || person.albumUrl || '#';
    lrBtn.href = person.albumUrl || '#';
    if (!person.downloadUrl && !person.albumUrl) dlBtn.style.opacity = '0.4';
    else dlBtn.style.opacity = '1';
    if (!person.albumUrl) lrBtn.style.opacity = '0.4';
    else lrBtn.style.opacity = '1';

    const grid = $('#photos-container');
    grid.innerHTML = '';
    photos.forEach((photo, i) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.style.animationDelay = `${Math.min(i * 0.03, 0.6)}s`;
        card.innerHTML = `
            <div class="photo-card__inner">
                <img src="${photo}" alt="${person.name} photo ${i + 1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="photo-card__hover">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
        `;
        card.addEventListener('click', () => openLightbox(i, photos.length));
        grid.appendChild(card);
    });
}

// ── Breadcrumb ──

function updateBreadcrumb(route) {
    const bc = $('#breadcrumb');
    bc.innerHTML = '';
    if (route.view === 'landing') return;

    const cat = route.categoryId === 'jpeg' ? CONFIG.jpeg : findCategory(route.categoryId);
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

// ── 3D Tilt ──

function initTilt() {
    $$('.person-card').forEach(card => {
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

// ── Lightbox ──

let lightboxIndex = 0;
let lightboxTotal = 0;
let lightboxPhotos = [];

function openLightbox(index, total) {
    lightboxIndex = index;
    lightboxTotal = total;
    const route = parseRoute();
    const person = findPerson(route.categoryId, route.personId);
    lightboxPhotos = person ? (person.photos || []) : [];
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
    img.src = lightboxPhotos[lightboxIndex] || '';
    $('#lightbox-counter').textContent = `${lightboxIndex + 1} / ${lightboxTotal}`;
    const dlLink = $('#lightbox-download');
    if (dlLink) dlLink.href = lightboxPhotos[lightboxIndex] || '';
}
function lightboxPrev() { lightboxIndex = (lightboxIndex - 1 + lightboxTotal) % lightboxTotal; updateLightboxContent(); }
function lightboxNext() { lightboxIndex = (lightboxIndex + 1) % lightboxTotal; updateLightboxContent(); }

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

// ── Scroll Reveal ──

let revealObserver;
function checkReveals() {
    $$('.reveal:not(.visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 20 && rect.bottom > 0) el.classList.add('visible');
    });
}
function initRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    $$('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
    setTimeout(checkReveals, 100);
    setTimeout(checkReveals, 700);
}

// ── Nav Scroll ──

function initNavScroll() {
    const nav = $('#nav');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 60); ticking = false; });
            ticking = true;
        }
    });
}

// ── Route Handler ──

function handleRoute() {
    const route = parseRoute();
    updateBreadcrumb(route);
    switch (route.view) {
        case 'landing':   renderLanding(); switchView('landing'); break;
        case 'category':
            if (route.categoryId === 'jpeg') {
                renderJpeg(); switchView('category');
            } else {
                renderCategory(route.categoryId); switchView('category');
            }
            break;
        case 'person':    renderPerson(route.categoryId, route.personId); switchView('person'); break;
    }
}

// ── Premium Loader ──

function runLoader() {
    const loader = $('#loader');
    const progress = $('.loader-progress');
    const loaderText = $('.loader-text');
    const site = $('#site-wrapper');

    site.classList.add('site--hidden');

    setTimeout(() => {
        loader.classList.add('loader--reveal');
    }, 400);

    setTimeout(() => {
        loader.classList.add('loader--done');
        setTimeout(() => {
            site.classList.remove('site--hidden');
            site.classList.add('site--entering');
            loader.style.display = 'none';
            setTimeout(() => { site.classList.remove('site--entering'); }, 1200);
        }, 600);
    }, 2800);
}

// ── Countdown Gate ──

const UNLOCK_TIME = new Date('2026-09-09T13:00:00-04:00').getTime();

function initCountdownGate() {
    const gate = $('#countdown-gate');
    const site = $('#site-wrapper');

    if (DEV_MODE || Date.now() >= UNLOCK_TIME) {
        gate.style.display = 'none';
        return;
    }

    site.classList.add('site-wrapper--gated');

    function tick() {
        const now = Date.now();
        const diff = UNLOCK_TIME - now;

        if (diff <= 0) {
            gate.classList.add('gate--open');
            site.classList.remove('site-wrapper--gated');
            setTimeout(() => { gate.style.display = 'none'; }, 1200);
            return;
        }

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        $('#gate-hours').textContent = String(h).padStart(2, '0');
        $('#gate-minutes').textContent = String(m).padStart(2, '0');
        $('#gate-seconds').textContent = String(s).padStart(2, '0');

        requestAnimationFrame(() => setTimeout(tick, 250));
    }
    tick();
}

// ── Custom Cursor ──

function initCursor() {
    const isTouch = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches;
    if (isTouch || window.innerWidth <= 768) return;

    const cursor = $('#cursor');
    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function lerp() {
        cx += (mx - cx) * 0.15;
        cy += (my - cy) * 0.15;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
        requestAnimationFrame(lerp);
    }
    lerp();

    document.addEventListener('mouseover', (e) => {
        const el = e.target.closest('a, button, .category-card, .person-card, .photo-card');
        if (!el) { cursor.className = 'cursor'; return; }
        if (el.closest('.category-card--locked')) {
            cursor.className = 'cursor cursor--locked';
        } else {
            cursor.className = 'cursor cursor--hover';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (!e.target.closest('a, button, .category-card, .person-card, .photo-card')) return;
        cursor.className = 'cursor';
    });
}

// ── Gallery Loader ──

function loadGallery() {
    fetch('assets/gallery.json')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (!data || !data.albums) return;
            data.albums.forEach(album => {
                if (album.slug === 'jpeg' && CONFIG.jpeg) {
                    CONFIG.jpeg.photos = album.photos.map(p => p.file);
                    return;
                }
                const cat = findCategory('portraits');
                if (!cat) return;
                const person = cat.people.find(p => p.id === album.slug);
                if (person) {
                    person.photos = album.photos.map(p => p.file);
                }
            });
            const route = parseRoute();
            if (route.view === 'person') {
                renderPerson(route.categoryId, route.personId);
            } else if (route.categoryId === 'jpeg') {
                renderJpeg();
            }
        })
        .catch(() => {});
}

// ── Init ──

function init() {
    $('#footer-year').textContent = new Date().getFullYear();

    if (DEV_MODE || Date.now() >= UNLOCK_TIME) {
        $('#countdown-gate').style.display = 'none';
    }
    runLoader();
    setTimeout(initCountdownGate, 3600);
    initCursor();

    renderLanding();
    initNavScroll();
    initRevealObserver();
    loadGallery();
    window.addEventListener('scroll', checkReveals, { passive: true });
    window.addEventListener('hashchange', handleRoute);

    setTimeout(() => {
        const route = parseRoute();
        if (route.view !== 'landing') handleRoute();
    }, 100);
}

document.addEventListener('DOMContentLoaded', init);
