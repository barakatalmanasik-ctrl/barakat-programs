/* PWA helper: service worker registration, install button management,
 * iOS "Add to Home Screen" instructions, and online/offline status banner.
 */

const PWA = {
  deferredPrompt: null,
  installBtn: null,

  async register() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
        console.log('[PWA] Service Worker registered');
      } catch (e) {
        console.warn('[PWA] SW registration failed', e);
      }
    }
  },

  init() {
    // iOS Safari shows how-to-add instead of a native prompt.
    this.isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    this.standalone = window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && navigator.standalone === true);

    this._bindInstallPrompt();
    this._bindOnlineEvents();
  },

  _bindInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this._showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this._hideInstallButton();
    });
  },

  _bindOnlineEvents() {
    window.addEventListener('offline', () => this._setOnline(false));
    window.addEventListener('online', () => {
      this._setOnline(true);
      if (Router && Router.currentPage) Router.handleHashChange();
    });
    this._setOnline(navigator.onLine !== false);
  },

  _setOnline(online) {
    let banner = document.getElementById('pwa-offline-banner');
    if (online) {
      if (banner) banner.remove();
      return;
    }
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'pwa-offline-banner';
    banner.className = 'pwa-offline-banner';
    banner.innerHTML = `
      <div class="pwa-offline-banner__inner">
        <span class="pwa-offline-banner__icon">📡</span>
        <div class="pwa-offline-banner__text">
          <strong>لا يوجد اتصال بالإنترنت</strong>
          <span>البيانات الحية غير متاحة حالياً</span>
        </div>
        <button class="pwa-offline-banner__btn" onclick="PWA.retry()">إعادة المحاولة</button>
      </div>
    `;
    document.body.appendChild(banner);
  },

  retry() {
    const banner = document.getElementById('pwa-offline-banner');
    if (banner) banner.remove();
    if (navigator.onLine) {
      if (Router) Router.handleHashChange();
    } else {
      this._setOnline(false);
      alert('لا يوجد اتصال بالإنترنت بعد. تحقق من اتصالك ثم حاول مجدداً.');
    }
  },

  _showInstallButton() {
    document.querySelectorAll('.install-app-btn').forEach(b => (b.style.display = ''));
  },

  _hideInstallButton() {
    document.querySelectorAll('.install-app-btn').forEach(b => (b.style.display = 'none'));
  },

  // Called by the install button click.
  async install() {
    if (this.standalone) {
      // Already installed as an app — no need to show anything.
      this._hideInstallButton();
      return;
    }
    if (this.deferredPrompt) {
      // Native install prompt is available (Android/Chrome/Edge): use it.
      const prompt = this.deferredPrompt;
      this.deferredPrompt = null;
      prompt.prompt();
      try { await prompt.userChoice; } catch (e) {}
      return;
    }
    if (this.isIOS) {
      // iOS: no native prompt — show elegant how-to instructions.
      this._showIOSSheet();
      return;
    }
    // Desktop browser that supports installing but hasn't fired the prompt yet.
    this._showGenericHint();
  },

  _showIOSSheet() {
    const existing = document.getElementById('ios-install-sheet');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'ios-sheet-overlay';
    overlay.id = 'ios-install-sheet';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this._closeIOSSheet(); });

    const sheet = document.createElement('div');
    sheet.className = 'ios-sheet';
    sheet.innerHTML = `
      <div class="ios-sheet__handle"></div>
      <div class="ios-sheet__header">
        <h3 class="ios-sheet__title">تثبيت التطبيق</h3>
        <button class="ios-sheet__close" onclick="PWA._closeIOSSheet()" aria-label="إغلاق">&times;</button>
      </div>
      <ol class="ios-sheet__steps">
        <li>
          <span class="ios-sheet__step-num">1</span>
          <div>
            <strong>اضغط زر المشاركة</strong>
            <span class="ios-sheet__step-desc">في أسفل شريط Safari، اضغط أيقونة المشاركة <b>↑</b></span>
          </div>
        </li>
        <li>
          <span class="ios-sheet__step-num">2</span>
          <div>
            <strong>Add to Home Screen</strong>
            <span class="ios-sheet__step-desc">اختر «إضافة إلى الشاشة الرئيسية / Add to Home Screen»</span>
          </div>
        </li>
        <li>
          <span class="ios-sheet__step-num">3</span>
          <div>
            <strong>اضغط إضافة / Add</strong>
            <span class="ios-sheet__step-desc">ثم «إضافة» لتثبيت التطبيق على شاشتك</span>
          </div>
        </li>
      </ol>
      <button class="ios-sheet__btn" onclick="PWA._closeIOSSheet()">فهمت</button>
    `;

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
  },

  _closeIOSSheet() {
    const s = document.getElementById('ios-install-sheet');
    if (s) s.remove();
  },

  _showGenericHint() {
    // Desktop: browser usually offers install via the address bar icon.
    alert('يمكنك تثبيت التطبيق من أيقونة التثبيت في شريط عنوان المتصفح.');
  }
};

window.PWA = PWA;

// Register SW on load (after app boot, don't block first paint).
window.addEventListener('load', () => PWA.register());
