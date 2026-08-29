function renderBookingFormPage(programId) {
  const container = document.getElementById('booking-form-content');
  const program = ProgramsService.getById(programId);

  if (!program) {
    container.innerHTML = '<div class="auth-page"><div class="auth-page__brand"><h1 class="auth-page__title">البرنامج غير موجود</h1></div></div>';
    return;
  }

  const hasAccommodation = program.hotels && program.hotels.length > 0;
  const roomTypes = hasAccommodation ? [...new Set(program.hotels.map(h => h.roomType))] : [];

  const user = AuthService.currentUser;

  container.innerHTML = `
    <div class="booking-form-page">
      <div class="profile-page__header">
        <button class="profile-page__back" onclick="navigateToDetail('${program.id}')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="profile-page__title">طلب الحجز</h1>
      </div>

      <div class="booking-form__program-card">
        <div class="booking-form__program-emoji">${program.emoji}</div>
        <div class="booking-form__program-info">
          <h3>${program.name}</h3>
          <p>${program.destinationEmoji} ${program.destination}</p>
          <p>📅 ${program.dateDisplay} → ${program.dateReturnDisplay}</p>
          <p>⏱️ ${program.days} أيام / ${program.nights} ليالي</p>
        </div>
        <div class="booking-form__program-price">${program.price.toLocaleString('ar-SA')} ${program.currency}</div>
      </div>

      <form class="booking-form" id="booking-form" onsubmit="handleBookingSubmit(event, '${program.id}')">

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">📋 بيانات العميل</h3>
          <div class="booking-form__card">
            <div class="auth-form__group">
              <label class="auth-form__label">الاسم الكامل *</label>
              <input type="text" class="auth-form__input" id="bf-name" placeholder="الاسم الكامل" value="${user && user.name ? user.name : ''}" required>
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">رقم الهاتف *</label>
              <input type="tel" class="auth-form__input" id="bf-phone" placeholder="05XXXXXXXX" value="${user && user.phone ? user.phone : ''}" required dir="ltr" style="text-align:right">
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">البريد الإلكتروني</label>
              <input type="email" class="auth-form__input" id="bf-email" placeholder="example@email.com" value="${user && user.email ? user.email : ''}" dir="ltr" style="text-align:right">
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">المدينة / الدولة</label>
              <input type="text" class="auth-form__input" id="bf-city" placeholder="مثال: الرياض، السعودية">
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">ملاحظات</label>
              <textarea class="auth-form__input" id="bf-notes" rows="3" placeholder="أي ملاحظات إضافية..." style="resize:vertical;min-height:80px"></textarea>
            </div>
          </div>
        </div>

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">👥 عدد المسافرين</h3>
          <div class="booking-form__card">
            <div class="booking-form__traveler-counter">
              <button type="button" class="booking-form__counter-btn" onclick="adjustTravelers(-1)">−</button>
              <span class="booking-form__counter-value" id="bf-travelers-count">1</span>
              <button type="button" class="booking-form__counter-btn" onclick="adjustTravelers(1)">+</button>
            </div>
          </div>
          <div id="bf-travelers-container"></div>
        </div>

        ${hasAccommodation ? `
        <div class="booking-form__section">
          <h3 class="booking-form__section-title">🏨 الإقامة</h3>
          <div class="booking-form__card">
            <div class="auth-form__group">
              <label class="auth-form__label">عدد الغرف</label>
              <div class="booking-form__traveler-counter">
                <button type="button" class="booking-form__counter-btn" onclick="adjustRooms(-1)">−</button>
                <span class="booking-form__counter-value" id="bf-rooms-count">1</span>
                <button type="button" class="booking-form__counter-btn" onclick="adjustRooms(1)">+</button>
              </div>
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">نوع الغرفة</label>
              <select class="auth-form__input" id="bf-room-type">
                ${roomTypes.map(rt => `<option value="${rt}">${rt}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">📝 ملخص الطلب</h3>
          <div class="booking-form__card booking-form__summary">
            <div class="booking-form__summary-row">
              <span>البرنامج</span>
              <span>${program.name}</span>
            </div>
            <div class="booking-form__summary-row">
              <span>الوجهة</span>
              <span>${program.destinationEmoji} ${program.destination}</span>
            </div>
            <div class="booking-form__summary-row">
              <span>تاريخ الرحلة</span>
              <span>${program.dateDisplay}</span>
            </div>
            <div class="booking-form__summary-row">
              <span>عدد المسافرين</span>
              <span id="bf-summary-travelers">1</span>
            </div>
            ${hasAccommodation ? `
            <div class="booking-form__summary-row">
              <span>عدد الغرف</span>
              <span id="bf-summary-rooms">1</span>
            </div>
            ` : ''}
            <div class="booking-form__summary-row booking-form__summary-row--total">
              <span>السعر التقديري</span>
              <span id="bf-summary-price">${program.price.toLocaleString('ar-SA')} ${program.currency}</span>
            </div>
          </div>
        </div>

        <div id="booking-error" class="auth-form__error" style="display:none"></div>

        <div class="booking-form__submit-section">
          <button type="submit" class="auth-form__submit" id="bf-submit">
            <span>تأكيد وإرسال طلب الحجز</span>
          </button>
          <p class="booking-form__note">بضغطك على "تأكيد" أنت توافق على <a href="#terms">الشروط والأحكام</a></p>
          <div class="booking-form__wa-divider">أو</div>
          <button type="button" class="booking-form__wa-btn" onclick="openWhatsAppBooking('${program.id}')">
            💬 إرسال الطلب عبر واتساب بدلاً من ذلك
          </button>
        </div>
      </form>
    </div>
  `;

  window._bookingTravelers = 1;
  window._bookingRooms = 1;
  window._bookingPrice = program.price;
  window._bookingCurrency = program.currency;
  renderTravelerFields(1);
}

function adjustTravelers(delta) {
  const count = Math.max(1, Math.min(20, (window._bookingTravelers || 1) + delta));
  window._bookingTravelers = count;
  document.getElementById('bf-travelers-count').textContent = count;
  document.getElementById('bf-summary-travelers').textContent = count;
  document.getElementById('bf-summary-price').textContent = (window._bookingPrice * count).toLocaleString('ar-SA') + ' ' + window._bookingCurrency;
  renderTravelerFields(count);
}

function adjustRooms(delta) {
  const count = Math.max(1, Math.min(10, (window._bookingRooms || 1) + delta));
  window._bookingRooms = count;
  document.getElementById('bf-rooms-count').textContent = count;
  const summaryRooms = document.getElementById('bf-summary-rooms');
  if (summaryRooms) summaryRooms.textContent = count;
}

function renderTravelerFields(count) {
  const container = document.getElementById('bf-travelers-container');
  if (!container) return;

  if (count <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 2; i <= count; i++) {
    html += `
      <div class="booking-form__section" style="margin-top:12px">
        <h4 class="booking-form__section-title" style="font-size:14px">مسافر ${i}</h4>
        <div class="booking-form__card">
          <div class="auth-form__group">
            <label class="auth-form__label">الاسم الكامل *</label>
            <input type="text" class="auth-form__input" name="traveler-name-${i}" placeholder="اسم المسافر ${i}" required>
          </div>
          <div class="auth-form__group">
            <label class="auth-form__label">رقم الهاتف</label>
            <input type="tel" class="auth-form__input" name="traveler-phone-${i}" placeholder="اختياري" dir="ltr" style="text-align:right">
          </div>
          <div class="auth-form__group">
            <label class="auth-form__label">الجنسية</label>
            <input type="text" class="auth-form__input" name="traveler-nationality-${i}" placeholder="اختياري">
          </div>
          <div class="auth-form__group">
            <label class="auth-form__label">تاريخ الميلاد</label>
            <input type="date" class="auth-form__input" name="traveler-dob-${i}">
          </div>
          <div class="auth-form__group">
            <label class="auth-form__label">رقم جواز السفر</label>
            <input type="text" class="auth-form__input" name="traveler-passport-${i}" placeholder="اختياري">
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

async function handleBookingSubmit(e, programId) {
  e.preventDefault();
  const program = ProgramsService.getById(programId);
  if (!program) return;

  const errorEl = document.getElementById('booking-error');
  const submitBtn = document.getElementById('bf-submit');

  const customerName = document.getElementById('bf-name').value.trim();
  const customerPhone = document.getElementById('bf-phone').value.trim();
  const customerEmail = document.getElementById('bf-email').value.trim();
  const customerCity = document.getElementById('bf-city').value.trim();
  const notes = document.getElementById('bf-notes').value.trim();

  if (!customerName || !customerPhone) {
    errorEl.textContent = 'يرجى ملء الحقول المطلوبة (الاسم ورقم الهاتف)';
    errorEl.style.display = 'block';
    return;
  }

  const travelersCount = window._bookingTravelers || 1;
  const travelers = [];

  // Main traveler (index 0) from the customer section.
  travelers.push({
    name: customerName,
    phone: customerPhone || null,
    nationality: null,
    dateOfBirth: null,
    passportNumber: null
  });

  if (travelersCount > 1) {
    for (let i = 2; i <= travelersCount; i++) {
      const name = document.querySelector(`[name="traveler-name-${i}"]`)?.value?.trim();
      if (!name) {
        errorEl.textContent = `يرجى إدخال اسم المسافر ${i}`;
        errorEl.style.display = 'block';
        return;
      }
      travelers.push({
        name: name,
        phone: document.querySelector(`[name="traveler-phone-${i}"]`)?.value?.trim() || null,
        nationality: document.querySelector(`[name="traveler-nationality-${i}"]`)?.value?.trim() || null,
        dateOfBirth: document.querySelector(`[name="traveler-dob-${i}"]`)?.value || null,
        passportNumber: document.querySelector(`[name="traveler-passport-${i}"]`)?.value?.trim() || null
      });
    }
  }

  const roomTypeEl = document.getElementById('bf-room-type');
  const emailEl = document.getElementById('bf-email');
  const cityEl = document.getElementById('bf-city');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="auth-form__spinner"></span>';
  errorEl.style.display = 'none';

  const result = await BookingService.createBooking({
    programId: programId,
    customerName: customerName,
    customerPhone: customerPhone,
    customerEmail: emailEl ? emailEl.value.trim() || null : null,
    customerCity: cityEl ? cityEl.value.trim() || null : null,
    notes: notes,
    travelersCount: travelersCount,
    travelers: travelers,
    totalPrice: program.price * travelersCount,
    currency: program.currency,
    roomsCount: window._bookingRooms || 1,
    roomType: roomTypeEl ? roomTypeEl.value : null
  });

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span>تأكيد وإرسال طلب الحجز</span>';

  if (result.success) {
    Router.go(`booking-success/${result.orderNumber}`);
  } else {
    errorEl.textContent = 'تعذر إرسال طلب الحجز (' + (result.error || 'خطأ غير معروف') + '). يرجى المحاولة مرة أخرى.';
    errorEl.style.display = 'block';
    console.error('Booking error:', result.error);
  }
}
