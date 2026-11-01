/* =========================================
   Service Worker — The Iron Man Protocol
   استراتژی:
   - HTML/JS/CSS : network-first (آپدیت سریع)
   - فونت/آیکون/CDN : cache-first (سرعت)
   - آفلاین fallback
   ========================================= */

const CACHE_VERSION = 'v1.0.2';
const CACHE_STATIC = `ironman-static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `ironman-dynamic-${CACHE_VERSION}`;

/* فایل‌های اصلی اپ (نصب اولیه) */
const PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192x192.png',
    './icon-512x512.png'
];

/* دامنه‌های CDN که کش می‌شن (cache-first) */
const CDN_HOSTS = [
    'cdn.tailwindcss.com',
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
    'fontnegar.ir',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

/* =========================================
   Install — پیش‌کش فایل‌های اصلی
   ========================================= */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                // addAll در صورت خطا کل کش رو خراب می‌کنه، پس تک‌تک اضافه می‌کنیم
                return Promise.all(
                    PRECACHE_URLS.map((url) =>
                        cache.add(url).catch((err) => {
                            console.warn('[SW] precache failed:', url, err);
                        })
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

/* =========================================
   Activate — پاک کردن کش‌های قدیمی
   ========================================= */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys.map((key) => {
                        if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) {
                            console.log('[SW] deleting old cache:', key);
                            return caches.delete(key);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

/* =========================================
   Fetch — استراتژی هوشمند
   ========================================= */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // فقط GET رو کش می‌کنیم
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // 1. درخواست‌های هم‌مبدا (same-origin) → network-first
    if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 2. درخواست‌های CDN → cache-first
    if (CDN_HOSTS.some((host) => url.hostname.includes(host))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // 3. بقیه → network با fallback به کش
    event.respondWith(networkFirst(request));
});

/* =========================================
   استراتژی‌ها
   ========================================= */

/* Network-first: اول شبکه، اگه شکست خورد از کش */
async function networkFirst(request) {
    try {
        const response = await fetch(request);

        // فقط پاسخ‌های موفق رو کش کن
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_DYNAMIC);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;

        // fallback نهایی برای navigation
        if (request.mode === 'navigate') {
            const fallback = await caches.match('./index.html');
            if (fallback) return fallback;
        }

        // پاسخ خطای آفلاین
        return new Response(
            '<html dir="rtl"><body style="background:#0a0a0c;color:#00f3ff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;"><div><h1>آفلاین</h1><p>اتصال اینترنت را بررسی کن.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }
}

/* Cache-first: اول کش، اگه نبود شبکه و کش کن */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_DYNAMIC);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        return new Response('', { status: 504, statusText: 'Offline' });
    }
}

/* =========================================
   پیام از کلاینت (برای skipWaiting دستی)
   ========================================= */
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});