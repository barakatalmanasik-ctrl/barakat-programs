function renderBookingSuccessPage(orderNumber) {
  const container = document.getElementById('booking-success-content');

  container.innerHTML = `
    <div class="booking-success-page">
      <div class="profile-page__header">
        <button class="profile-page__back" onclick="navigateToPage('home')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="profile-page__title">تأكيد الحجز</h1>
      </div>

      <div class="booking-success">
        <div class="booking-success__icon">✅</div>
        <h2 class="booking-success__title">تم استلام طلب الحجز بنجاح!</h2>
        <p class="booking-success__subtitle">سنتواصل معك قريباً لتأكيد التفاصيل</p>

        <div class="booking-success__card">
          <div class="booking-success__order-number">
            <span>رقم الطلب</span>
            <strong>${orderNumber}</strong>
          </div>
          <div class="booking-success__details">
            <div class="booking-success__detail-row">
              <span class="booking-success__detail-label">حالة الطلب</span>
              <span class="booking-success__detail-value booking-success__detail-value--status">⏳ قيد المراجعة</span>
            </div>
          </div>
        </div>

        <div class="booking-success__info">
          <p>📞 سيتم التواصل معك خلال 24 ساعة لتأكيد الحجز</p>
          <p>📧 تأكد من صحة بيانات التواصل</p>
        </div>

        <div class="booking-success__actions">
          <button class="booking-success__btn booking-success__btn--primary" onclick="navigateToPage('home')">
            العودة إلى الصفحة الرئيسية
          </button>
          <button class="booking-success__btn booking-success__btn--secondary" onclick="navigateToPage('orders')">
            📋 عرض حجوزاتي
          </button>
        </div>
      </div>
    </div>
  `;
}
