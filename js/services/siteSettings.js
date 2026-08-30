// SiteSettings - centralized, easily-editable site settings.
//
// The default values live in this file; the admin can change them from
// لوحة التحكم -> الإعدادات and the new value is saved to localStorage,
// overriding the default app-wide (no database change required).

const SiteSettings = {
  STORAGE_KEY: 'barakat_site_settings',

  // Factory default: company WhatsApp number in international format,
  // digits only (country code + number, without '+').
  defaults: {
    whatsappNumber: '9647730332831'
  },

  _readAll() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  },

  _writeAll(obj) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj || {}));
    } catch (e) {}
  },

  get(key) {
    const val = this._readAll()[key];
    if (val !== undefined && val !== '' && val !== null) return String(val);
    return this.defaults[key];
  },

  set(key, value) {
    const obj = this._readAll();
    obj[key] = value;
    this._writeAll(obj);
  },

  getWhatsAppNumber() {
    return String(this.get('whatsappNumber') || '').replace(/\D/g, '');
  },

  // Build a wa.me link with a ready message. Pass a custom number to
  // override; otherwise uses the company number from settings.
  whatsAppLink(message, number) {
    const num = String(number !== undefined && number !== '' ? number : this.getWhatsAppNumber()).replace(/\D/g, '');
    if (!num) return '';
    return 'https://wa.me/' + num + (message ? '?text=' + encodeURIComponent(message) : '');
  }
};