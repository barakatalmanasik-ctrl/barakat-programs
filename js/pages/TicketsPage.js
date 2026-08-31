// Tickets section — "تذاكر الطيران ✈️" — a top-level section beside programs.
//
// There is NO real airline API in this project, so this page never shows
// fake flights or fake prices. It only collects the search basics and, after
// "البحث عن تذكرة", offers "طلب تذكرة عبر WhatsApp" which opens WhatsApp with
// a ready inquiry message. A support agent then replies with the available
// flights and prices. No database writes, no in-app chat.

function _ticketsTodayIso() {
  try { return new Date().toISOString().split('T')[0]; } catch (e) { return ''; }
}

function _ticketsFmtDate(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return String(iso);
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Pure message builder (testable without the DOM).
function buildTicketInquiryMessage(data) {
  const lines = [
    'السلام عليكم، أرغب بالاستفسار عن تذكرة طيران:',
    '',
    '✈️ من: ' + data.from,
    '✈️ إلى: ' + data.to,
    '📅 تاريخ السفر: ' + _ticketsFmtDate(data.date),
    '👥 عدد المسافرين: ' + data.travelers,
    '',
    'أرجو تزويدي بالرحلات والأسعار المتوفرة.'
  ];
  return lines.join('\n');
}

function renderTicketsPage() {
  const container = document.getElementById('tickets-content');

  container.innerHTML = `
    <div class="tickets-page">
      <div class="tickets-page__header">
        <h1 class="tickets-page__title">تذاكر الطيران ✈️</h1>
        <p class="tickets-page__subtitle">احجز واستفسر عن تذاكر الطيران بسهولة عبر WhatsApp</p>
      </div>

      <div class="ticket-page__card tickets-page__search-card">
        <div class="tickets-page__grid">
          <div class="ticket-page__field">
            <label class="ticket-page__label" for="tk-from"><span class="ticket-page__label-icon">🛫</span> من</label>
            <input type="text" class="ticket-page__input" id="tk-from" placeholder="النجف" autocomplete="off">
          </div>

          <div class="ticket-page__field">
            <label class="ticket-page__label" for="tk-to"><span class="ticket-page__label-icon">🛬</span> إلى</label>
            <input type="text" class="ticket-page__input" id="tk-to" placeholder="طهران" autocomplete="off">
          </div>
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label" for="tk-date"><span class="ticket-page__label-icon">📅</span> تاريخ السفر</label>
          <input type="date" class="ticket-page__input" id="tk-date" min="${_ticketsTodayIso()}">
        </div>

        <div class="ticket-page__field">
          <label class="ticket-page__label"><span class="ticket-page__label-icon">👥</span> عدد المسافرين</label>
          <div class="ticket-page__stepper">
            <button type="button" class="ticket-page__stepper-btn" onclick="stepTicketsTravelers(-1)" aria-label="إنقاص">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="ticket-page__stepper-value" id="tk-travelers">2</span>
            <button type="button" class="ticket-page__stepper-btn" onclick="stepTicketsTravelers(1)" aria-label="زيادة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <p class="ticket-page__error" id="tk-error"></p>

        <button type="button" class="ticket-page__submit" onclick="searchTickets()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          البحث عن تذكرة
        </button>
      </div>

      <div class="tickets-result" id="tk-result" hidden></div>
    </div>
  `;
}

function _ticketsShowError(message) {
  const err = document.getElementById('tk-error');
  if (err) err.textContent = message || '';
}

function _ticketsInvalid(el, invalid) {
  if (el) {
    if (invalid) el.classList.add('ticket-page__input--invalid');
    else el.classList.remove('ticket-page__input--invalid');
  }
}

function stepTicketsTravelers(delta) {
  const el = document.getElementById('tk-travelers');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 1;
  el.textContent = Math.min(30, Math.max(1, current + delta));
}

function searchTickets() {
  const fromEl = document.getElementById('tk-from');
  const toEl = document.getElementById('tk-to');
  const dateEl = document.getElementById('tk-date');

  _ticketsInvalid(fromEl, false);
  _ticketsInvalid(toEl, false);
  _ticketsInvalid(dateEl, false);
  _ticketsShowError('');
  const result = document.getElementById('tk-result');
  if (result) result.hidden = true;

  const from = fromEl ? fromEl.value.trim() : '';
  const to = toEl ? toEl.value.trim() : '';
  const date = dateEl ? dateEl.value : '';

  if (!from) { _ticketsInvalid(fromEl, true); _ticketsShowError('يرجى إدخال مدينة الانطلاق'); if (fromEl) fromEl.focus(); return; }
  if (!to) { _ticketsInvalid(toEl, true); _ticketsShowError('يرجى إدخال مدينة الوجهة'); if (toEl) toEl.focus(); return; }
  if (!date) { _ticketsInvalid(dateEl, true); _ticketsShowError('يرجى اختيار تاريخ السفر'); if (dateEl) dateEl.focus(); return; }

  if (result) {
    result.innerHTML = `
      <div class="tickets-result__card">
        <div class="tickets-result__icon">✈️</div>
        <h3 class="tickets-result__title">أرسل طلبك الآن</h3>
        <p class="tickets-result__text">لا نعرض الرحلات والأسعار مباشرة على الموقع حالياً. أرسل طلبك عبر واتساب وسيتواصل معك فريقنا لتأكيد الرحلات والأسعار المتوفرة.</p>
        <button type="button" class="ticket-page__submit" onclick="sendTicketInquiry()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
          طلب تذكرة عبر WhatsApp
        </button>
      </div>
    `;
    result.hidden = false;
  }
}

function sendTicketInquiry() {
  const fromEl = document.getElementById('tk-from');
  const toEl = document.getElementById('tk-to');
  const dateEl = document.getElementById('tk-date');
  const travelersEl = document.getElementById('tk-travelers');

  const from = fromEl ? fromEl.value.trim() : '';
  const to = toEl ? toEl.value.trim() : '';
  const date = dateEl ? dateEl.value : '';
  const travelers = parseInt(travelersEl ? travelersEl.textContent : '1', 10) || 1;

  if (!from || !to || !date) { searchTickets(); return; }

  const message = buildTicketInquiryMessage({ from: from, to: to, date: date, travelers: travelers });
  const link = SiteSettings.whatsAppLink(message);
  if (!link) {
    _ticketsShowError('رقم الواتساب غير مضبوط في الإعدادات. يرجى الاتصال بإدارة الموقع.');
    return;
  }
  window.open(link, '_blank', 'noopener');
}