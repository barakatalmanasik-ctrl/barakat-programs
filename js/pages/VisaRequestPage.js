// Visa request — "طلب فيزا 🛂".
//
// This section is only an initial inquiry form. It collects no passport or
// personal document data. It sends the request to the company WhatsApp number
// (SiteSettings) and the agent collects the required documents and details
// later via WhatsApp. No document upload, no payment, no visa issuance API.

function renderVisaRequestPage() {
  const container = document.getElementById('visa-content');

  container.innerHTML = `
    <div class="visa-page">
      <div class="visa-page__header">
        <div class="hotel-page__header-row">
          <button class="ticket-page__back" onclick="Router.back()" aria-label="رجوع">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 class="visa-page__title">طلب فيزا 🛂</h1>
        </div>
        <p class="visa-page__subtitle">استفسار أولي بسيط — سيتواصل معك فريقنا بالتفاصيل والسعر عبر WhatsApp</p>
      </div>

      <div class="visa-page__card">
        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🛂</span> نوع الفيزا</label>
          <div class="visa-page__types">
            <div class="visa-page__type visa-page__type--active visa-page__type--single">
              <span class="visa-page__type-icon">🛂</span>
              <span class="visa-page__type-label">سياحية فورية</span>
            </div>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🌍</span> الجهة / البلد المسافر إليه</label>
          <input type="text" class="ticket-page__input" id="visa-country" placeholder="مثال: إيران، تركيا، الإمارات…" />
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🪪</span> الجنسية</label>
          <div class="ticket-page__select-wrap">
            <select id="visa-nationality" class="ticket-page__select">
              <option value="">اختر الجنسية</option>
              <option value="عراقي">عراقي</option>
              <option value="إيراني">إيراني</option>
              <option value="تركي">تركي</option>
              <option value="إماراتي">إماراتي</option>
              <option value="سعودي">سعودي</option>
              <option value="أردني">أردني</option>
              <option value="لبناني">لبناني</option>
              <option value="سوري">سوري</option>
              <option value="مصري">مصري</option>
              <option value="غيره">أخرى</option>
            </select>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">⏳</span> مدة الفيزا المطلوبة</label>
          <div class="ticket-page__seg">
            <button type="button" class="ticket-page__seg-btn visa-page__dur-btn--active" data-unit="days" onclick="selectVisaUnit('days')">أيام</button>
            <button type="button" class="ticket-page__seg-btn" data-unit="months" onclick="selectVisaUnit('months')">أشهر</button>
          </div>
          <div class="visa-page__duration">
            <button type="button" class="ticket-page__stepper-btn" onclick="stepVisaDuration(-1)" aria-label="إنقاص">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="ticket-page__stepper-value" id="visa-duration">30</span>
            <button type="button" class="ticket-page__stepper-btn" onclick="stepVisaDuration(1)" aria-label="زيادة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">👥</span> عدد الأشخاص</label>
          <div class="ticket-page__stepper">
            <button type="button" class="ticket-page__stepper-btn" onclick="stepVisaTravelers(-1)" aria-label="إنقاص">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="ticket-page__stepper-value" id="visa-travelers">1</span>
            <button type="button" class="ticket-page__stepper-btn" onclick="stepVisaTravelers(1)" aria-label="زيادة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <p class="ticket-page__error" id="visa-error"></p>

        <button type="button" class="ticket-page__submit" onclick="submitVisaRequest()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
          إرسال طلب الفيزا عبر WhatsApp
        </button>
        <p class="ticket-page__note">هذا طلب/استفسار أولي فقط. سنتواصل معك لتأكيد التفاصيل والمستندات المطلوبة لاحقاً.</p>
      </div>
    </div>
  `;
}

// ── Interactions ────────────────────────────────────────────────────
let _visaUnit = 'days';

function selectVisaUnit(unit) {
  _visaUnit = unit;
  const seg = document.querySelector('.visa-page .ticket-page__seg');
  const btns = seg ? seg.querySelectorAll('[data-unit]') : [];
  btns.forEach(b => b.classList.toggle('visa-page__dur-btn--active', b.getAttribute('data-unit') === unit));
  const el = document.getElementById('visa-duration');
  if (el) {
    const current = parseInt(el.textContent, 10) || 1;
    if (unit === 'months') {
      el.textContent = current > 12 ? '1' : String(current);
    } else {
      el.textContent = current < 1 ? '1' : String(current);
    }
  }
}

function stepVisaDuration(delta) {
  const el = document.getElementById('visa-duration');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 1;
  const max = _visaUnit === 'months' ? 12 : 365;
  el.textContent = Math.min(max, Math.max(1, current + delta));
}

function stepVisaTravelers(delta) {
  const el = document.getElementById('visa-travelers');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 1;
  el.textContent = Math.min(60, Math.max(1, current + delta));
}

function _visaShowError(message) {
  const err = document.getElementById('visa-error');
  if (err) err.textContent = message || '';
}

function _visaTypeLabel() {
  return 'سياحية فورية';
}

// ── WhatsApp submit ─────────────────────────────────────────────────
// Pure message builder (testable without the DOM).
function _visaDurationLabel(duration, unit) {
  if (unit === 'months') {
    if (duration === 1) return '1 شهر';
    if (duration === 2) return '2 شهر';
    if (duration >= 3 && duration <= 10) return duration + ' أشهر';
    return duration + ' شهر';
  }
  if (duration === 1) return '1 يوم';
  return duration + ' يوم';
}

function buildVisaInquiryMessage(data) {
  const lines = [
    'السلام عليكم، أرغب بالاستفسار عن إصدار فيزا:',
    '',
    'نوع الفيزا: ' + _visaTypeLabel(),
    'البلد المسافر إليه: ' + (data.country || 'غير محدد'),
    'الجنسية: ' + (data.nationality || 'غير محددة'),
    'المدة المطلوبة: ' + _visaDurationLabel(data.duration, data.unit),
    'عدد الأشخاص: ' + data.travelers,
    '',
    'أرجو تزويدي بالتفاصيل والسعر ومدة إنجاز الفيزا.'
  ];
  return lines.join('\n');
}

function submitVisaRequest() {
  _visaShowError('');

  const countryEl = document.getElementById('visa-country');
  const nationalityEl = document.getElementById('visa-nationality');
  const durationEl = document.getElementById('visa-duration');
  const travelersEl = document.getElementById('visa-travelers');

  const country = (countryEl ? countryEl.value : '').trim();
  const nationality = nationalityEl ? nationalityEl.value : '';

  if (!country) {
    _visaShowError('يرجى كتابة البلد المسافر إليه.');
    if (countryEl) countryEl.focus();
    return;
  }
  if (!nationality) {
    _visaShowError('يرجى اختيار الجنسية.');
    if (nationalityEl) nationalityEl.focus();
    return;
  }

  const duration = parseInt(durationEl ? durationEl.textContent : '1', 10) || 1;
  const travelers = parseInt(travelersEl ? travelersEl.textContent : '1', 10) || 1;

  const message = buildVisaInquiryMessage({
    type: 'tourist',
    unit: _visaUnit,
    duration: duration,
    travelers: travelers,
    country: country,
    nationality: nationality
  });

  const link = SiteSettings.whatsAppLink(message);
  if (!link) {
    _visaShowError('رقم الواتساب غير مضبوط في الإعدادات. يرجى الاتصال بإدارة الموقع.');
    return;
  }
  window.open(link, '_blank', 'noopener');
}
