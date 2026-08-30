// Ticket booking request — "طلب حجز تذكرة".
//
// This section does NOT book or issue tickets. It only collects the
// passenger's basic request and sends it to the company's WhatsApp number
// (from SiteSettings). The support agent then checks availability and
// follows up with the price and details via WhatsApp.
//
// No in-app chat, no booking creation, no database writes, no prices shown.

function renderTicketPage() {
  const container = document.getElementById('ticket-content');
  const user = AuthService.currentUser;
  const hasUser = !!(user && user.id);

  container.innerHTML = `
    <div class="ticket-page">
      <div class="ticket-page__header">
        <button class="ticket-page__back" onclick="Router.back()" aria-label="رجوع">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h1 class="ticket-page__title">طلب حجز تذكرة</h1>
          <p class="ticket-page__subtitle">أدخل بياناتك وسيرسل فريقنا الطلب إليك عبر WhatsApp</p>
        </div>
      </div>

      <p class="ticket-page__error" id="ticket-error"></p>

      <div class="ticket-page__card">
        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">👥</span> عدد المسافرين</label>
          <div class="ticket-page__stepper">
            <button type="button" class="ticket-page__stepper-btn" onclick="stepTicketTravelers(-1)" aria-label="إنقاص">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="ticket-page__stepper-value" id="ticket-travelers">2</span>
            <button type="button" class="ticket-page__stepper-btn" onclick="stepTicketTravelers(1)" aria-label="زيادة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label" for="ticket-from"><span class="ticket-page__label-icon">🛫</span> مطار الانطلاق</label>
          <input type="text" class="ticket-page__input" id="ticket-from" placeholder="بغداد أو مطار بغداد الدولي" autocomplete="off">
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label" for="ticket-to"><span class="ticket-page__label-icon">🛬</span> مطار الوجهة</label>
          <input type="text" class="ticket-page__input" id="ticket-to" placeholder="مشهد أو مطار مشهد الدولي" autocomplete="off">
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label" for="ticket-depart"><span class="ticket-page__label-icon">📅</span> تاريخ الانطلاق</label>
          <input type="date" class="ticket-page__input" id="ticket-depart" min="${_ticketTodayIso()}">
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">🔁</span> نوع الرحلة</label>
          <div class="ticket-page__seg">
            <button type="button" class="ticket-page__seg-btn ticket-page__seg-btn--active" data-trip="oneway" onclick="setTicketTripType('oneway')">ذهاب فقط</button>
            <button type="button" class="ticket-page__seg-btn" data-trip="round" onclick="setTicketTripType('round')">ذهاب وعودة</button>
          </div>
        </div>

        <div class="ticket-page__field ticket-page__field--return" id="ticket-return-field">
          <label class="ticket-page__label" for="ticket-return"><span class="ticket-page__label-icon">🔄</span> تاريخ العودة</label>
          <input type="date" class="ticket-page__input" id="ticket-return" min="${_ticketTodayIso()}">
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">⏰</span> وقت الرحلة</label>
          <div class="ticket-page__seg">
            <button type="button" class="ticket-page__seg-btn ticket-page__seg-btn--active" data-time="morning" onclick="setTicketTime('morning')">☀️ صباحًا</button>
            <button type="button" class="ticket-page__seg-btn" data-time="evening" onclick="setTicketTime('evening')">🌙 مساءً</button>
          </div>
        </div>

        ${hasUser ? `
          <div class="ticket-page__user-note">
            سيرسل طلبك مع بياناتك: <strong>${_ticketEscape(user.name || '')}</strong>${user.phone ? ' · ' + _ticketEscape(user.phone) : ''}
          </div>
        ` : ''}

        <button type="button" class="ticket-page__submit" onclick="submitTicketRequest()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
          إرسال طلب التذكرة عبر WhatsApp
        </button>
        <p class="ticket-page__note">لن يتم حجز التذكرة الآن. نتصل بك لتأكيد توفر الرحلة والسعر والتفاصيل.</p>
      </div>
    </div>
  `;
}

function _ticketTodayIso() {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

function _ticketEscape(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _ticketFmtDate(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return String(iso);
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Pure message builder (testable without the DOM).
function buildTicketMessage(data) {
  const lines = [
    'السلام عليكم، أرغب بطلب حجز تذكرة:',
    '',
    'عدد المسافرين: ' + data.travelers,
    'مطار الانطلاق: ' + data.from,
    'مطار الوجهة: ' + data.to,
    'تاريخ الانطلاق: ' + _ticketFmtDate(data.depart),
    'نوع الرحلة: ' + data.tripLabel
  ];
  if (data.returnDate) lines.push('تاريخ العودة: ' + _ticketFmtDate(data.returnDate));
  lines.push('وقت الرحلة: ' + data.timeLabel);
  if (data.name) lines.push('', 'اسم المسافر: ' + data.name);
  if (data.phone) lines.push('رقم الهاتف: ' + data.phone);
  lines.push('', 'أرجو التحقق من توفر الرحلة وتزويدي بالسعر والتفاصيل.');
  return lines.join('\n');
}

function _ticketShowError(message) {
  const err = document.getElementById('ticket-error');
  if (err) err.textContent = message || '';
}

function _ticketInvalid(el, invalid) {
  if (el) {
    if (invalid) el.classList.add('ticket-page__input--invalid');
    else el.classList.remove('ticket-page__input--invalid');
  }
}

function stepTicketTravelers(delta) {
  const el = document.getElementById('ticket-travelers');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 1;
  el.textContent = Math.min(30, Math.max(1, current + delta));
}

function setTicketTripType(type) {
  const seg = document.querySelector('.ticket-page__seg');
  const btns = seg ? seg.querySelectorAll('[data-trip]') : [];
  btns.forEach(b => b.classList.toggle('ticket-page__seg-btn--active', b.getAttribute('data-trip') === type));
  const field = document.getElementById('ticket-return-field');
  if (field) field.classList.toggle('ticket-page__field--visible', type === 'round');
}

function setTicketTime(period) {
  const btns = document.querySelectorAll('[data-time]');
  btns.forEach(b => b.classList.toggle('ticket-page__seg-btn--active', b.getAttribute('data-time') === period));
}

function submitTicketRequest() {
  const fromEl = document.getElementById('ticket-from');
  const toEl = document.getElementById('ticket-to');
  const departEl = document.getElementById('ticket-depart');
  const returnEl = document.getElementById('ticket-return');
  const travelersEl = document.getElementById('ticket-travelers');

  _ticketInvalid(fromEl, false);
  _ticketInvalid(toEl, false);
  _ticketInvalid(departEl, false);
  _ticketInvalid(returnEl, false);
  _ticketShowError('');

  const from = fromEl ? fromEl.value.trim() : '';
  const to = toEl ? toEl.value.trim() : '';
  const depart = departEl ? departEl.value : '';
  const travelers = parseInt(travelersEl ? travelersEl.textContent : '1', 10) || 1;

  const tripBtn = document.querySelector('[data-trip].ticket-page__seg-btn--active');
  const tripType = tripBtn ? tripBtn.getAttribute('data-trip') : 'oneway';
  const tripLabel = tripType === 'round' ? 'ذهاب وعودة' : 'ذهاب فقط';
  const isRound = tripType === 'round';
  const returnDate = isRound && returnEl ? returnEl.value : '';

  const timeBtn = document.querySelector('[data-time].ticket-page__seg-btn--active');
  const timeLabel = timeBtn && timeBtn.getAttribute('data-time') === 'evening' ? 'مساءً' : 'صباحًا';

  if (!from) { _ticketInvalid(fromEl, true); _ticketShowError('يرجى إدخال مطار الانطلاق'); if (fromEl) fromEl.focus(); return; }
  if (!to) { _ticketInvalid(toEl, true); _ticketShowError('يرجى إدخال مطار الوجهة'); if (toEl) toEl.focus(); return; }
  if (!depart) { _ticketInvalid(departEl, true); _ticketShowError('يرجى اختيار تاريخ الانطلاق'); if (departEl) departEl.focus(); return; }
  if (isRound && !returnDate) { _ticketInvalid(returnEl, true); _ticketShowError('يرجى اختيار تاريخ العودة'); if (returnEl) returnEl.focus(); return; }

  const user = AuthService.currentUser;
  const message = buildTicketMessage({
    travelers: travelers,
    from: from,
    to: to,
    depart: depart,
    tripLabel: tripLabel,
    returnDate: isRound ? returnDate : '',
    timeLabel: timeLabel,
    name: user ? user.name : '',
    phone: user ? user.phone : ''
  });

  const link = SiteSettings.whatsAppLink(message);
  if (!link) {
    _ticketShowError('رقم الواتساب غير مضبوط في الإعدادات. يرجى الاتصال بإدارة الموقع.');
    return;
  }
  window.open(link, '_blank', 'noopener');
}