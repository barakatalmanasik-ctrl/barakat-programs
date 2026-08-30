// BookingDetailPage - shows a single booking's details to its owner
// (or to staff). Includes: order number, program/hotel/trip info,
// travelers, price, remaining amount, status, notes, plus support links.

let _currentDetailBooking = null;

const BookingStatusMap = {
  pending:         { label: 'قيد المراجعة', color: '#E8A317', icon: '📋', desc: 'تم استلام طلبك وسنتواصل معك قريباً' },
  reviewing:       { label: 'قيد المعالجة', color: '#5B7DB1', icon: '🔄', desc: 'يقوم فريقنا بمراجعة طلبك حالياً' },
  confirmed:       { label: 'مؤكد', color: '#1B3A5C', icon: '✅', desc: 'تم تأكيد حجزك بنجاح' },
  payment_pending: { label: 'بانتظار الدفع', color: '#C8963E', icon: '💳', desc: 'يرجى إتمام عملية الدفع لتأكيد الحجز' },
  completed:       { label: 'مكتمل', color: '#2D7A3A', icon: '🎉', desc: 'تمت رحلتك بنجاح!' },
  cancelled:       { label: 'ملغي', color: '#999', icon: '❌', desc: 'تم إلغاء هذا الطلب' }
};

function getBookingStatusMeta(status) {
  return BookingStatusMap[status] || BookingStatusMap.pending;
}

// Shared helpers for the employee_notes thread (admin replies + status log).
// Each entry is stored as: [ISO] type|author|body , entries separated by "\n---\n".

function _fmtNoteTime(iso) {
  try {
    return new Date(iso).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}

function buildBookingNoteEntry(type, author, body) {
  return '[' + new Date().toISOString() + '] ' + type + '|' + (author || '') + '|' + String(body || '').replace(/\s*\n+\s*/g, ' ');
}

function bookingNotesToHtml(raw) {
  if (!raw || !String(raw).trim()) return '';
  const labels = { reply: '✍️ رد الإدارة', status: '🔄 تحديث الحالة', system: '📝 ملاحظة' };
  const entries = String(raw).split(/\n-{3,}\n/).map(s => s.trim()).filter(Boolean);
  return entries.map(ln => {
    const m = ln.match(/^\[([^\]]+)\]\s+(\w+)\|([^|]*)\|([\s\S]*)$/);
    const ts = m ? _fmtNoteTime(m[1]) : '';
    const type = m ? m[2] : 'system';
    const author = m ? m[3] : '';
    const text = m ? m[4] : ln;
    const meta = ['<span class="bd-note__kind">' + (labels[type] || 'ملاحظة') + '</span>', author ? '<span class="bd-note__author">' + escapeHtml(author) + '</span>' : '', ts ? '<span class="bd-note__time">' + ts + '</span>' : ''].filter(Boolean).join(' ');
    return (type === 'status'
      ? '<div class="bd-note bd-note--status"><span class="bd-note__meta">' + meta + '</span><span class="bd-note__text">' + escapeHtml(text) + '</span></div>'
      : '<div class="bd-note"><span class="bd-note__meta">' + meta + '</span><span class="bd-note__text">' + escapeHtml(text) + '</span></div>');
  }).join('');
}

async function renderBookingDetailPage(bookingId) {
  const container = document.getElementById('booking-detail-content');
  if (!container) return;

  container.innerHTML = `
    <div class="bd-page">
      <div class="bd-page__header">
        <button class="bd-page__back" onclick="Router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="bd-page__title">تفاصيل الحجز</h1>
      </div>
      <div id="bd-page-body">
        <div class="bd-page__loading">جاري تحميل تفاصيل الحجز...</div>
      </div>
    </div>
  `;

  const booking = await BookingService.getBookingById(bookingId);
  const body = document.getElementById('bd-page-body');
  if (!booking) {
    body.innerHTML = `
      <div class="bd-page__empty">
        <div class="bd-page__empty-icon">❌</div>
        <h3>تعذر العثور على الحجز</h3>
      </div>
    `;
    return;
  }

  const prog = ProgramsService.getById(booking.program_id);
  _currentDetailBooking = booking;
  const progName = prog ? prog.name : (booking.program_name || 'برنامج سياحي');
  const progEmoji = prog ? prog.emoji : '🌍';
  const progDest = prog ? `${prog.destinationEmoji} ${prog.destination}` : '';
  const progDate = prog ? prog.dateDisplay : '';
  const status = getBookingStatusMeta(booking.status);

  const price = Number(booking.total_price) || 0;
  const currency = booking.currency || 'د.ع';
  // No payments table in this phase; remaining = total.
  const remaining = price;

  let travelersHtml = '';
  if (booking.booking_travelers && booking.booking_travelers.length) {
    const t = booking.booking_travelers
      .slice()
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    travelersHtml = `
      <div class="bd-section__rows">
        ${t.map((tr, i) => `
          <div class="bd-row">
            <span class="bd-row__label">المسافر ${i + 1}</span>
            <span class="bd-row__value">${tr.full_name}${tr.phone ? ' · ' + tr.phone : ''}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  body.innerHTML = `
    <div class="bd-card bd-card--status" style="border-top: 3px solid ${status.color}">
      <div class="bd-status">
        <span class="bd-status__icon">${status.icon}</span>
        <div>
          <div class="bd-status__label" style="color:${status.color}">${status.label}</div>
          <div class="bd-status__desc">${status.desc}</div>
        </div>
      </div>
    </div>

    <div class="bd-card">
      <div class="bd-card__title">${progEmoji} ${progName}</div>
      ${progDest ? `<div class="bd-card__sub">${progDest}</div>` : ''}
      ${progDate ? `<div class="bd-card__sub">📅 ${progDate}</div>` : ''}
      <div class="bd-divider"></div>
      <div class="bd-section__rows">
        <div class="bd-row"><span class="bd-row__label">رقم الحجز</span><span class="bd-row__value bd-row__value--strong" dir="ltr">${booking.order_number}</span></div>
        ${booking.rooms_count ? `<div class="bd-row"><span class="bd-row__label">عدد الغرف</span><span class="bd-row__value">${booking.rooms_count}</span></div>` : ''}
        ${booking.room_type ? `<div class="bd-row"><span class="bd-row__label">نوع الغرفة</span><span class="bd-row__value">${booking.room_type}</span></div>` : ''}
        <div class="bd-row"><span class="bd-row__label">عدد المسافرين</span><span class="bd-row__value">${booking.travelers_count}</span></div>
      </div>
    </div>

    <div class="bd-card">
      <div class="bd-card__title">👥 المسافرون</div>
      ${travelersHtml || '<div class="bd-card__sub">لا توجد بيانات مسافرين إضافية</div>'}
    </div>

    ${booking.customer_notes ? `
    <div class="bd-card">
      <div class="bd-card__title">📝 ملاحظاتك</div>
      <div class="bd-card__sub">${booking.customer_notes}</div>
    </div>
    ` : ''}

    ${booking.employee_notes ? `
    <div class="bd-card">
      <div class="bd-card__title">💬 ردود الإدارة ومراجعة الطلب</div>
      <div class="bd-notes-thread">${bookingNotesToHtml(booking.employee_notes)}</div>
      <div class="bd-card__sub" style="margin-top:10px">تابع حالة طلبك هنا — يقوم فريقنا بالرد عليك وتحديث حالة الحجز من هذه الصفحة</div>
    </div>
    ` : ''}

    <div class="bd-card bd-card--price">
      <div class="bd-section__rows">
        <div class="bd-row"><span class="bd-row__label">إجمالي المبلغ</span><span class="bd-row__value">${price.toLocaleString('ar-SA')} ${currency}</span></div>
        <div class="bd-row"><span class="bd-row__label">المدفوع</span><span class="bd-row__value">0 ${currency}</span></div>
        <div class="bd-row bd-row--total"><span class="bd-row__label">المتبقي</span><span class="bd-row__value bd-row__value--strong">${remaining.toLocaleString('ar-SA')} ${currency}</span></div>
      </div>
    </div>

    <div class="bd-card">
      <div class="bd-card__title">💬 الدعم</div>
      <div class="bd-support-actions">
        <button class="bd-btn bd-btn--primary" onclick="openWhatsAppBookingSupport('${booking.id}')">متابعة الطلب عبر WhatsApp</button>
      </div>
    </div>

    ${['pending', 'reviewing'].includes(booking.status) && !isStaffUser() ? `
    <button class="bd-btn bd-btn--danger bd-btn--full" onclick="cancelBookingFromDetail('${booking.id}')">إلغاء الحجز</button>
    ` : ''}
  `;
}

function isStaffUser() {
  const u = AuthService.currentUser;
  return !!(u && ['employee', 'admin'].includes(u.role));
}

function openWhatsAppBookingSupport(bookingId) {
  const booking = _currentDetailBooking;
  const orderNo = booking ? booking.order_number : '';
  const user = AuthService.currentUser;
  const msg =
    'السلام عليكم، أستفسر بخصوص الحجز رقم ' + (orderNo || '') + '.\n' +
    (user && user.name ? 'الاسم: ' + user.name + '\n' : '') +
    (user && user.phone ? 'رقم الهاتف: ' + user.phone : '');
  const link = SiteSettings.whatsAppLink(msg);
  if (link) window.open(link, '_blank', 'noopener');
}

async function cancelBookingFromDetail(bookingId) {
  if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
  const res = await BookingService.cancelBooking(bookingId);
  if (res.success) {
    renderBookingDetailPage(bookingId);
  } else {
    alert('تعذر إلغاء الحجز، يرجى المحاولة مرة أخرى');
  }
}
