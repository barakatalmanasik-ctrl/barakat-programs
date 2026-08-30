// WhatsApp booking & inquiry — the ONLY booking/inquiry channel.
//
// - "احجز عبر WhatsApp" opens a modal (إكمال طلب الحجز) with exactly two
//   fields: عدد المسافرين (stepper) + تاريخ الانطلاق المرغوب (date picker).
//   "متابعة إلى WhatsApp" builds the message and opens WhatsApp.
// - "استفسر عبر WhatsApp" opens a modal (استفسر عن البرنامج) with suggested
//   question chips built from the program's real data, plus "✏️ سؤال آخر".
//   Picking a question (or writing your own) opens WhatsApp with the message.
// - No in-app chat, no database writes. Everything ends in WhatsApp.
// - The company WhatsApp number comes from SiteSettings.

var _waBookingProgramId = null;
var _waInquiryProgramId = null;

function _waEscapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Build the booking message. Travelers + desired date come from the modal.
function buildWhatsAppBookingMessage(program, travelers, desiredDate) {
  const lines = [
    'السلام عليكم، أرغب بالحجز في البرنامج التالي:',
    '',
    '📍 البرنامج: ' + program.name,
    '📍 الوجهة: ' + program.destination
  ];

  if (program.dateDisplay && program.dateDisplay !== 'قريباً') {
    lines.push('📅 تاريخ البرنامج: ' + program.dateDisplay);
  }

  lines.push('👥 عدد المسافرين: ' + travelers);
  if (desiredDate) lines.push('📅 تاريخ الانطلاق المرغوب: ' + desiredDate);
  lines.push('', 'أرجو تزويدي بتفاصيل الحجز والتأكيد.');
  return lines.join('\n');
}

// Build the inquiry message for either a suggested question or a custom one.
function buildWhatsAppInquiryMessage(program, question) {
  return [
    'السلام عليكم، أريد الاستفسار عن برنامج:',
    '',
    '📍 ' + program.name,
    '',
    '❓ ' + question
  ].join('\n');
}

// Smart questions: only ask about things the visitor cannot see on the page.
function whatsAppSuggestedQuestions(program) {
  const list = [];
  if (!program.dateDisplay || program.dateDisplay === 'قريباً') {
    list.push('📅 متى موعد الانطلاق؟');
  }
  if (!program.hotels || !program.hotels.length) {
    list.push('🏨 ما اسم الفندق؟');
  }
  list.push('🍽️ هل الوجبات مشمولة في البرنامج؟');
  if (program.type !== 'flight') {
    list.push('✈️ هل الرحلة جوية أم برية؟');
  }
  list.push('🚌 ما وسيلة النقل؟');
  if (!program.highlights || !program.highlights.length) {
    list.push('📍 ما الأماكن التي يشملها البرنامج؟');
  }
  list.push('👥 هل يوجد حد أقصى لعدد المسافرين؟');
  list.push('📝 أريد معرفة تفاصيل البرنامج كاملة.');
  return list;
}

function _openWhatsAppWithMessage(message) {
  const link = SiteSettings.whatsAppLink(message);
  if (!link) {
    alert('رقم الواتساب غير مضبوط في الإعدادات. يرجى الاتصال بإدارة الموقع.');
    return;
  }
  window.open(link, '_blank', 'noopener');
}

// ─── Booking modal ────────────────────────────────────────────
function openWhatsAppBooking(programId) {
  const program = ProgramsService.getById(programId);
  if (!program) return;

  _waBookingProgramId = programId;
  closeWhatsAppModal();

  const overlay = document.createElement('div');
  overlay.className = 'whatsapp-modal__overlay';
  overlay.id = 'whatsapp-modal-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeWhatsAppModal();
  });

  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];

  overlay.innerHTML = `
    <div class="whatsapp-modal">
      <div class="whatsapp-modal__content">
        <div class="whatsapp-modal__header">
          <div>
            <h2 class="whatsapp-modal__title">إكمال طلب الحجز</h2>
            <p class="whatsapp-modal__subtitle">يرجى إدخال المعلومات التالية لتجهيز طلبك عبر WhatsApp</p>
          </div>
          <button class="whatsapp-modal__close" onclick="closeWhatsAppModal()" aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="whatsapp-modal__body">
          <div class="whatsapp-modal__program-info">
            <span class="whatsapp-modal__program-emoji">${_waEscapeHtml(program.emoji || '✈️')}</span>
            <div>
              <div class="whatsapp-modal__program-name">${_waEscapeHtml(program.name)}</div>
              <div class="whatsapp-modal__program-dest">${_waEscapeHtml(program.destinationEmoji || '')} ${_waEscapeHtml(program.destination)}</div>
            </div>
          </div>

          <div class="whatsapp-modal__field">
            <label class="whatsapp-modal__label" for="wa-travelers">عدد المسافرين</label>
            <div class="whatsapp-modal__stepper">
              <button type="button" class="whatsapp-modal__stepper-btn" onclick="stepTravelers(-1)" aria-label="إنقاص">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="whatsapp-modal__stepper-value" id="wa-travelers">2</span>
              <button type="button" class="whatsapp-modal__stepper-btn" onclick="stepTravelers(1)" aria-label="زيادة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
            <p class="whatsapp-modal__hint">يمكنك تعديل العدد لاحقاً عند التواصل</p>
          </div>

          <div class="whatsapp-modal__field">
            <label class="whatsapp-modal__label" for="wa-date">تاريخ الانطلاق المرغوب</label>
            <input type="date" class="whatsapp-modal__input" id="wa-date" min="${todayIso}">
            <p class="whatsapp-modal__error" id="wa-date-error">يرجى اختيار تاريخ الانطلاق المرغوب</p>
          </div>

          <div class="whatsapp-modal__footer">
            <button type="button" class="whatsapp-modal__submit" onclick="submitWhatsAppBooking()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
              متابعة إلى WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('whatsapp-modal__overlay--active'));
}

function stepTravelers(delta) {
  const el = document.getElementById('wa-travelers');
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 2;
  el.textContent = Math.min(30, Math.max(1, current + delta));
}

function _waFormatDate(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return String(iso);
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function submitWhatsAppBooking() {
  const program = ProgramsService.getById(_waBookingProgramId);
  if (!program) return;

  const travelers = parseInt(document.getElementById('wa-travelers').textContent, 10) || 1;
  const dateEl = document.getElementById('wa-date');
  const errorEl = document.getElementById('wa-date-error');
  const dateIso = dateEl ? dateEl.value : '';

  if (!dateIso) {
    if (errorEl) {
      errorEl.classList.add('whatsapp-modal__error--show');
      if (dateEl) dateEl.focus();
    }
    return;
  }

  closeWhatsAppModal();
  _openWhatsAppWithMessage(buildWhatsAppBookingMessage(program, travelers, _waFormatDate(dateIso)));
}

// ─── Inquiry modal ────────────────────────────────────────────
function openWhatsAppInquiry(programId) {
  const program = ProgramsService.getById(programId);
  if (!program) return;

  _waInquiryProgramId = programId;
  closeWhatsAppModal();

  const overlay = document.createElement('div');
  overlay.className = 'whatsapp-modal__overlay';
  overlay.id = 'whatsapp-modal-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeWhatsAppModal();
  });

  const questions = whatsAppSuggestedQuestions(program);
  const chips = questions.map((q, i) => `
    <button type="button" class="whatsapp-modal__question" data-q="${_waEscapeHtml(q)}" onclick="selectWhatsAppQuestion(this, '${program.id}')">
      ${_waEscapeHtml(q)}
    </button>
  `).join('');

  overlay.innerHTML = `
    <div class="whatsapp-modal">
      <div class="whatsapp-modal__content">
        <div class="whatsapp-modal__header">
          <div>
            <h2 class="whatsapp-modal__title">استفسر عن البرنامج</h2>
            <p class="whatsapp-modal__subtitle">اختر السؤال الذي تريد الاستفسار عنه</p>
          </div>
          <button class="whatsapp-modal__close" onclick="closeWhatsAppModal()" aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="whatsapp-modal__body">
          <div class="whatsapp-modal__program-info">
            <span class="whatsapp-modal__program-emoji">${_waEscapeHtml(program.emoji || '✈️')}</span>
            <div>
              <div class="whatsapp-modal__program-name">${_waEscapeHtml(program.name)}</div>
              <div class="whatsapp-modal__program-dest">${_waEscapeHtml(program.destinationEmoji || '')} ${_waEscapeHtml(program.destination)}</div>
            </div>
          </div>

          <div class="whatsapp-modal__questions">
            ${chips}
            <button type="button" class="whatsapp-modal__question whatsapp-modal__question--custom" onclick="toggleWhatsAppCustom()">
              ✏️ سؤال آخر
            </button>
          </div>

          <div class="whatsapp-modal__custom" id="wa-custom">
            <textarea class="whatsapp-modal__textarea" id="wa-custom-input" rows="3" placeholder="اكتب استفسارك هنا..."></textarea>
            <p class="whatsapp-modal__error" id="wa-custom-error">يرجى كتابة الاستفسار أولاً</p>
            <div class="whatsapp-modal__footer">
              <button type="button" class="whatsapp-modal__submit" onclick="submitWhatsAppCustomInquiry()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                إرسال عبر WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('whatsapp-modal__overlay--active'));
}

function selectWhatsAppQuestion(chip, programId) {
  if (!chip) return;
  const question = chip.getAttribute('data-q');
  const program = ProgramsService.getById(programId);
  if (!program || !question) return;
  closeWhatsAppModal();
  _openWhatsAppWithMessage(buildWhatsAppInquiryMessage(program, question));
}

function toggleWhatsAppCustom() {
  const box = document.getElementById('wa-custom');
  const error = document.getElementById('wa-custom-error');
  if (!box) return;
  const show = !box.classList.contains('whatsapp-modal__custom--show');
  if (show) box.classList.add('whatsapp-modal__custom--show');
  else box.classList.remove('whatsapp-modal__custom--show');
  if (error) error.classList.remove('whatsapp-modal__error--show');
  if (show) {
    const input = document.getElementById('wa-custom-input');
    if (input) input.focus();
  }
}

function submitWhatsAppCustomInquiry() {
  const program = ProgramsService.getById(_waInquiryProgramId);
  if (!program) return;

  const input = document.getElementById('wa-custom-input');
  const error = document.getElementById('wa-custom-error');
  const question = input ? input.value.trim() : '';

  if (!question) {
    if (error) error.classList.add('whatsapp-modal__error--show');
    if (input) input.focus();
    return;
  }

  closeWhatsAppModal();
  _openWhatsAppWithMessage(buildWhatsAppInquiryMessage(program, question));
}

// ─── Shared ───────────────────────────────────────────────────
function closeWhatsAppModal() {
  const overlay = document.getElementById('whatsapp-modal-overlay');
  if (overlay) {
    overlay.classList.remove('whatsapp-modal__overlay--active');
    setTimeout(() => overlay.remove(), 300);
  }
}

// Backward-compatible alias.
function closeWhatsAppBooking() {
  closeWhatsAppModal();
}