function renderOrdersPage() {
  const container = document.getElementById('orders-content');
  const user = AuthService.currentUser;
  if (!user) { navigateToPage('login'); return; }

  const orders = OrdersService.getOrdersByUser(user.id);
  const statusMap = {
    pending_review: { label: 'قيد المراجعة', color: '#E8A317', icon: '📋' },
    confirmed: { label: 'تم التأكيد', color: '#1B3A5C', icon: '✅' },
    awaiting_payment: { label: 'بانتظار الدفع', color: '#C8963E', icon: '💳' },
    completed: { label: 'مكتمل', color: '#2D7A3A', icon: '🎉' },
    cancelled: { label: 'ملغي', color: '#999', icon: '❌' }
  };

  container.innerHTML = `
    <div class="orders-page">
      <div class="orders-page__header">
        <button class="orders-page__back" onclick="navigateToPage('more')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="orders-page__title">طلباتي</h1>
      </div>

      <div class="orders-page__filters">
        <button class="orders-page__filter orders-page__filter--active" onclick="filterOrders('all', this)">الكل</button>
        <button class="orders-page__filter" onclick="filterOrders('active', this)">النشطة</button>
        <button class="orders-page__filter" onclick="filterOrders('completed', this)">المكتملة</button>
        <button class="orders-page__filter" onclick="filterOrders('cancelled', this)">الملغية</button>
      </div>

      <div class="orders-page__list" id="orders-list">
        ${orders.length === 0 ? `
          <div class="orders-page__empty">
            <div class="orders-page__empty-icon">📦</div>
            <h3>لا توجد طلبات بعد</h3>
            <p>ابدأ رحلتك باختيار برنامج سياحي مناسب</p>
            <button class="orders-page__empty-btn" onclick="navigateToPage('programs')">تصفح البرامج</button>
          </div>
        ` : orders.map(order => {
          const status = statusMap[order.status] || statusMap.pending_review;
          return `
            <div class="orders-page__card" data-status="${order.status}">
              <div class="orders-page__card-header">
                <span class="orders-page__card-id">${order.orderId}</span>
                <span class="orders-page__card-status" style="background:${status.color}20; color:${status.color}">${status.icon} ${status.label}</span>
              </div>
              <div class="orders-page__card-body">
                <div class="orders-page__card-destination">${order.destinationEmoji || '🌍'} ${order.programName}</div>
                <div class="orders-page__card-details">
                  <span>📅 ${order.departureDate}</span>
                  <span>👥 ${order.travelers} مسافر${order.travelers > 1 ? 'ين' : ''}</span>
                </div>
                <div class="orders-page__card-price">${order.totalPrice.toLocaleString('ar-SA')} ${order.currency}</div>
              </div>
              <div class="orders-page__card-footer">
                <span class="orders-page__card-date">بتاريخ ${new Date(order.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <button class="orders-page__card-btn" onclick="showOrderDetail('${order.orderId}')">التفاصيل</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function filterOrders(filter, btn) {
  document.querySelectorAll('.orders-page__filter').forEach(b => b.classList.remove('orders-page__filter--active'));
  btn.classList.add('orders-page__filter--active');

  const cards = document.querySelectorAll('.orders-page__card');
  cards.forEach(card => {
    const status = card.dataset.status;
    let show = false;
    if (filter === 'all') show = true;
    else if (filter === 'active') show = ['pending_review', 'confirmed', 'awaiting_payment'].includes(status);
    else if (filter === 'completed') show = status === 'completed';
    else if (filter === 'cancelled') show = status === 'cancelled';
    card.style.display = show ? '' : 'none';
  });
}

function showOrderDetail(orderId) {
  const user = AuthService.currentUser;
  if (!user) return;
  const orders = OrdersService.getOrdersByUser(user.id);
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const statusMap = {
    pending_review: { label: 'قيد المراجعة', color: '#E8A317', desc: 'تم استلام طلبك وسنتواصل معك قريباً' },
    confirmed: { label: 'تم التأكيد', color: '#1B3A5C', desc: 'تم تأكيد حجزك بنجاح' },
    awaiting_payment: { label: 'بانتظار الدفع', color: '#C8963E', desc: 'يرجى إتمام عملية الدفع لتأكيد الحجز' },
    completed: { label: 'مكتمل', color: '#2D7A3A', desc: 'تمت رحلتك بنجاح!' },
    cancelled: { label: 'ملغي', color: '#999', desc: 'تم إلغاء هذا الطلب' }
  };
  const status = statusMap[order.status] || statusMap.pending_review;

  const existing = document.getElementById('order-detail-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'order-detail-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-sheet__handle"></div>
      <div class="order-detail">
        <div class="order-detail__header">
          <h3>تفاصيل الطلب</h3>
          <button class="modal-sheet__close" onclick="document.getElementById('order-detail-modal').remove()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="order-detail__body">
          <div class="order-detail__status-badge" style="background:${status.color}15; color:${status.color}; border: 1px solid ${status.color}30">
            <span class="order-detail__status-dot" style="background:${status.color}"></span>
            ${status.label}
          </div>
          <p class="order-detail__status-desc">${status.desc}</p>
          <div class="order-detail__info">
            <div class="order-detail__row"><span class="order-detail__label">رقم الطلب</span><span class="order-detail__value">${order.orderId}</span></div>
            <div class="order-detail__row"><span class="order-detail__label">البرنامج</span><span class="order-detail__value">${order.destinationEmoji || '🌍'} ${order.programName}</span></div>
            <div class="order-detail__row"><span class="order-detail__label">الوجهة</span><span class="order-detail__value">${order.destination}</span></div>
            <div class="order-detail__row"><span class="order-detail__label">تاريخ المغادرة</span><span class="order-detail__value">${order.departureDate}</span></div>
            <div class="order-detail__row"><span class="order-detail__label">عدد المسافرين</span><span class="order-detail__value">${order.travelers}</span></div>
            <div class="order-detail__row order-detail__row--total"><span class="order-detail__label">الإجمالي</span><span class="order-detail__value">${order.totalPrice.toLocaleString('ar-SA')} ${order.currency}</span></div>
            <div class="order-detail__row"><span class="order-detail__label">تاريخ الطلب</span><span class="order-detail__value">${new Date(order.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>
        </div>
        <div class="order-detail__footer">
          ${order.status === 'pending_review' ? `<button class="order-detail__action-btn order-detail__action-btn--cancel" onclick="cancelOrder('${order.orderId}')">إلغاء الطلب</button>` : ''}
          ${order.status === 'confirmed' ? `<button class="order-detail__action-btn" onclick="document.getElementById('order-detail-modal').remove()">تواصل معنا للدفع</button>` : ''}
          <button class="order-detail__action-btn order-detail__action-btn--close" onclick="document.getElementById('order-detail-modal').remove()">إغلاق</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function cancelOrder(orderId) {
  if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
  OrdersService.cancelOrder(orderId);
  document.getElementById('order-detail-modal')?.remove();
  renderOrdersPage();
}
