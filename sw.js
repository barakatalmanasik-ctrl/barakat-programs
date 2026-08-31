/* Service Worker — Barakat Al-Manasik PWA
 *
 * Strategy:
 *  - PRECACHE the app shell (HTML, CSS, JS, icons, manifest). None of it is
 *    sensitive; it is public static code/styles.
 *  - Network-first for the app shell: try the network, fall back to cache
 *    only when OFFLINE — so an old shell never impersonates a fresh one
 *    unless there is genuinely no connection.
 *  - NEVER cache Supabase data endpoints (/rest/v1/**, /auth/v1/**) or any
 *    user/booking/admin data. Those are always network-only. If there is no
 *    network, the app shows an explicit offline state instead of stale data.
 */

const CACHE = 'barakat-manasik-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/responsive.css',
  './css/pwa.css',
  './css/services.css',
  './js/admin/adminStyles.css',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/maskable-192x192.png',
  './icons/maskable-512x512.png',
  './icons/apple-touch-icon.png',
  './images/og-cover.png'
];

// Shell assets (scripts are many; precache the core app scripts so the app
// shell can boot offline before it then guards dynamic data).
const JS_SHELL = [
  'js/services/supabase-config.js',
  'js/services/supabaseClient.js',
  'js/services/siteSettings.js',
  'js/services/authService.js',
  'js/services/programsService.js',
  'js/services/dataService.js',
  'js/services/bookingService.js',
  'js/services/pwa.js',
  'js/data/mockData.js',
  'js/components/icons.js',
  'js/components/Header.js',
  'js/components/BottomNavigation.js',
  'js/components/ProgramCard.js',
  'js/components/DestinationCard.js',
  'js/components/HotelCard.js',
  'js/components/DayAccordion.js',
  'js/components/SearchBar.js',
  'js/components/FilterPanel.js',
  'js/components/EmptyState.js',
  'js/components/LoadingState.js',
  'js/components/FilterBottomSheet.js',
  'js/components/GallerySection.js',
  'js/pages/HomePage.js',
  'js/pages/ProgramsPage.js',
  'js/pages/DetailPage.js',
  'js/pages/MorePage.js',
  'js/pages/LoginPage.js',
  'js/pages/RegisterPage.js',
  'js/pages/ProfilePage.js',
  'js/pages/OrdersPage.js',
  'js/pages/NotificationsPage.js',
  'js/pages/FavoritesPage.js',
  'js/pages/ForgotPasswordPage.js',
  'js/pages/TicketPage.js',
  'js/pages/TicketsPage.js',
  'js/pages/HotelBookingPage.js',
  'js/pages/VisaRequestPage.js',
  'js/pages/WhatsAppBookingModal.js',
  'js/pages/BookingDetailPage.js',
  'js/router.js',
  'js/app.js'
];

function isStatic(url) {
  if (!url) return false;
  return /^\/?(css\/|js\/|icons\/|images\/|manifest\.webmanifest|index\.html$|\/$)/.test(url.pathname || url);
}
function isSupabaseData(url) {
  const p = url.pathname || '';
  return p.indexOf('/rest/v1/') !== -1 || p.indexOf('/auth/v1/') !== -1 || p.indexOf('/storage/v1/') !== -1;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        const all = SHELL.concat(JS_SHELL.map(j => './' + j));
        return Promise.allSettled(all.map(u => cache.add(u)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept Supabase data/auth/storage calls — network only.
  if (url.origin.includes('supabase.co') || isSupabaseData(url)) return;

  // Same-origin navigation / shell: network-first, cache fallback.
  if (url.origin === self.location.origin) {
    const requestUrl = url.pathname === '/' || url.pathname === '' ? './' : url.pathname.replace(/^\//, '');
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req.url, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          return caches.match(req).then(m => m || caches.match('./index.html'));
        })
    );
  }
});

// Let the page know when the SW is ready.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
