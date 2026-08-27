// OrdersPage - 'حجوزاتي' (My Bookings), backed by real Supabase `bookings`.
// Arabic labels are display-only; the DB stores system status values.

async function renderOrdersPage() {
  const container = document.getElementById('orders-content');
  const user = AuthService.currentUser;
  if (!user) { navigateToPage('login'); return; }

  container.innerHTML = `
    <div class="orders-page">
      <div class="orders-page__header">
        <button class="orders-page__back" onclick="navigateToPage('more')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="orders-page__title">حجوزاتي</h1>
      </div>

      <div class="orders-page__filters">
        <button class="orders-page__filter orders-page__filter--active" onclick="filterOrders('all', this)">الكل</button>
        <button class="orders-page__filter" onclick="filterOrders('active', this)">النشطة</button>
        <button class="orders-page__filter" onclick="filterOrders('completed', this)">المكتملة</button>
        <button class="orders-page__filter" onclick="filterOrders('cancelled', this)">الملغية</button>
      </div>

      <div class="orders-page__list" id="orders-list">
        <div class="orders-page__loading">جاري تحميل حجوزاتك...</div>
      </div>
    </div>
  `;

  const bookings = await BookingService.getUserBookings();
  const list = document.getElementById('orders-list');

  if (!bookings || bookings.length === 0) {
    list.innerHTML = `
      <div class="orders-page__empty">
        <div class="orders-page__empty-icon">📦</div>
        <h3>لا توجد حجوزات بعد</h3>
        <p>ابدأ رحلتك باختيار برنامج سياحي مناسب</p>
        <button class="orders-page__empty-btn" onclick="navigateToPage('programs')">تصفح البرامج</button>
      </div>
    `;
    return;
  }

  list.innerHTML = bookings.map(b => {
    const status = getBookingStatusMeta(b.status);
    const progName = b.programs ? b.programs.name : 'برنامج سياحي';
    const progEmoji = (b.programs && b.programs.emoji) || '🌍';
    const price = Number(b.total_price) || 0;
    const cur = b.currency || 'د.ع';
    return `
      <div class="orders-page__card" data-status="${b.status}" onclick="navigateToOrderDetail('${b.id}')" style="cursor:pointer">
        <div class="orders-page__card-header">
          <span class="orders-page__card-id" dir="ltr">${b.order_number}</span>
          <span class="orders-page__card-status" style="background:${status.color}20; color:${status.color}">${status.icon} ${status.label}</span>
        </div>
        <div class="orders-page__card-body">
          <div class="orders-page__card-destination">${progEmoji} ${progName}</div>
          <div class="orders-page__card-details">
            <span>👥 ${b.travelers_count} مسافر${b.travelers_count > 1 ? 'ين' : ''}</span>
            ${b.room_type ? `<span>🏨 ${b.room_type}</span>` : ''}
          </div>
          <div class="orders-page__card-price">${price.toLocaleString('ar-SA')} ${cur}</div>
        </div>
        <div class="orders-page__card-footer">
          <span class="orders-page__card-date">بتاريخ ${formatDate(b.created_at)}</span>
          <button class="orders-page__card-btn" onclick="event.stopPropagation(); navigateToOrderDetail('${b.id}')">التفاصيل</button>
        </div>
      </div>
    `;
  }).join('');
}

function navigateToOrderDetail(bookingId) {
  window.location.hash = 'booking-detail/' + bookingId;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return ''; }
}

function filterOrders(filter, btn) {
  document.querySelectorAll('.orders-page__filter').forEach(b => b.classList.remove('orders-page__filter--active'));
  btn.classList.add('orders-page__filter--active');

  const cards = document.querySelectorAll('.orders-page__card');
  cards.forEach(card => {
    const status = card.dataset.status;
    let show = false;
    if (filter === 'all') show = true;
    else if (filter === 'active') show = ['pending', 'reviewing', 'confirmed', 'payment_pending'].includes(status);
    else if (filter === 'completed') show = status === 'completed';
    else if (filter === 'cancelled') show = status === 'cancelled';
    card.style.display = show ? '' : 'none';
  });
}
