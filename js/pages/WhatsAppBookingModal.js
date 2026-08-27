function openWhatsAppBooking(programId) {
  const program = ProgramsService.getById(programId);
  if (!program) return;

  closeWhatsAppBooking();

  const overlay = document.createElement('div');
  overlay.className = 'whatsapp-modal__overlay';
  overlay.id = 'whatsapp-modal-overlay';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeWhatsAppBooking();
  });

  overlay.innerHTML = `
    <div class="whatsapp-modal">
      <div class="whatsapp-modal__content">
        <div class="whatsapp-modal__header">
          <h2 class="whatsapp-modal__title">طلب حجز</h2>
          <button class="whatsapp-modal__close" onclick="closeWhatsAppBooking()" aria-label="إغلاق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="whatsapp-modal__body">
          <div class="whatsapp-modal__program-info">
            <span class="whatsapp-modal__program-emoji">${program.emoji}</span>
            <div>
              <div class="whatsapp-modal__program-name">${program.name}</div>
              <div class="whatsapp-modal__program-dest">${program.destinationEmoji} ${program.destination}</div>
            </div>
          </div>
          <form id="whatsapp-booking-form" onsubmit="handleWhatsAppBookingSubmit(event, '${programId}')">
            <div class="whatsapp-modal__field">
              <label class="whatsapp-modal__label">الاسم الكامل <span class="whatsapp-modal__required">*</span></label>
              <input type="text" class="whatsapp-modal__input" id="wa-customer-name" placeholder="أدخل اسمك الكامل" required>
            </div>
            <div class="whatsapp-modal__field">
              <label class="whatsapp-modal__label">رقم الهاتف <span class="whatsapp-modal__required">*</span></label>
              <input type="tel" class="whatsapp-modal__input" id="wa-customer-phone" placeholder="05XXXXXXXX" required dir="ltr" style="text-align:right">
            </div>
            <div class="whatsapp-modal__field">
              <label class="whatsapp-modal__label">عدد المسافرين <span class="whatsapp-modal__required">*</span></label>
              <input type="number" class="whatsapp-modal__input" id="wa-travelers-count" value="1" min="1" max="50" required>
            </div>
            <div class="whatsapp-modal__field">
              <label class="whatsapp-modal__label">ملاحظات</label>
              <textarea class="whatsapp-modal__textarea" id="wa-customer-notes" placeholder="أي ملاحظات إضافية (اختياري)" rows="3"></textarea>
            </div>
            <div class="whatsapp-modal__footer">
              <button type="submit" class="whatsapp-modal__submit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                إرسال طلب الحجز عبر واتساب
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('whatsapp-modal__overlay--active'));

  setTimeout(() => {
    const nameInput = document.getElementById('wa-customer-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

function closeWhatsAppBooking() {
  const overlay = document.getElementById('whatsapp-modal-overlay');
  if (overlay) {
    overlay.classList.remove('whatsapp-modal__overlay--active');
    setTimeout(() => overlay.remove(), 300);
  }
}

function handleWhatsAppBookingSubmit(e, programId) {
  e.preventDefault();

  const program = ProgramsService.getById(programId);
  if (!program) return;

  const name = document.getElementById('wa-customer-name').value.trim();
  const phone = document.getElementById('wa-customer-phone').value.trim();
  const travelers = document.getElementById('wa-travelers-count').value;
  const notes = document.getElementById('wa-customer-notes').value.trim();

  if (!name || !phone || !travelers) {
    return;
  }

  const message = `السلام عليكم، أرغب في طلب حجز البرنامج التالي:

*بيانات البرنامج*
البرنامج: ${program.name}
الوجهة: ${program.destinationEmoji} ${program.destination}
تاريخ الانطلاق: ${program.dateDisplay}
تاريخ العودة: ${program.dateReturnDisplay}
المدة: ${program.days} أيام / ${program.nights} ليالي
السعر: ${program.price.toLocaleString('ar-SA')} ${program.currency}

*بيانات العميل*
الاسم: ${name}
رقم الهاتف: ${phone}
عدد المسافرين: ${travelers}

ملاحظات: ${notes || 'لا توجد ملاحظات'}

أرجو التواصل معي لتأكيد الحجز.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/9647730332831?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');

  closeWhatsAppBooking();
}
