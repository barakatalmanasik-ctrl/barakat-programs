function renderAdminDashboard() {
  const container = document.getElementById('admin-dashboard-content');
  if (!container) return;

  container.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar__brand">
          <div class="admin-sidebar__brand-title">بركات المناسك</div>
          <div class="admin-sidebar__brand-sub">لوحة التحكم</div>
        </div>
        <nav class="admin-sidebar__nav">
          <a class="admin-sidebar__link admin-sidebar__link--active" href="#admin/dashboard" id="admin-nav-dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            لوحة التحكم
          </a>
          <a class="admin-sidebar__link" href="#" id="admin-nav-conversations" onclick="showAdminConversations(); return false;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            المحادثات
          </a>
          <a class="admin-sidebar__link" href="#" id="admin-nav-bookings" onclick="showAdminBookings(); return false;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
            الحجوزات
          </a>
        </nav>
      </aside>

      <div class="admin-main">
        <header class="admin-header">
          <button class="admin-header__toggle" onclick="toggleAdminSidebar()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h1 class="admin-header__title">لوحة التحكم</h1>
          <div class="admin-header__actions">
            <a href="#home" class="admin-btn admin-btn--outline admin-btn--small">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              الموقع
            </a>
            <button class="admin-btn admin-btn--danger admin-btn--small" onclick="adminLogout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              تسجيل الخروج
            </button>
          </div>
        </header>
        <div class="admin-content" id="admin-main-content">
          <div class="admin-stats" id="admin-stats"></div>
          <div class="admin-toolbar">
            <h2 class="admin-toolbar__title">البرامج</h2>
            <button class="admin-btn admin-btn--primary" onclick="showAddProgramForm()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              إضافة برنامج
            </button>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الوجهة</th>
                  <th>الحالة</th>
                  <th>تاريخ الانطلاق</th>
                  <th>السعر</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody id="admin-programs-tbody">
                <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--color-text-tertiary)">جاري التحميل...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-modal" id="admin-program-modal">
      <div class="admin-modal__backdrop" onclick="closeAdminModal()"></div>
      <div class="admin-modal__dialog">
        <div class="admin-modal__header">
          <h3 class="admin-modal__title" id="admin-modal-title">إضافة برنامج</h3>
          <button class="admin-modal__close" onclick="closeAdminModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="admin-modal__body">
          <form class="admin-form" id="admin-program-form" onsubmit="handleAdminProgramSubmit(event)">
            <input type="hidden" id="prg-id">

            <div class="admin-form__group">
              <label class="admin-form__label">اسم البرنامج *</label>
              <input type="text" class="admin-form__input" id="prg-name" required>
            </div>

            <div class="admin-form__row">
              <div class="admin-form__group">
                <label class="admin-form__label">الوجهة *</label>
                <select class="admin-form__select" id="prg-destination_id" required></select>
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">النوع *</label>
                <select class="admin-form__select" id="prg-type" required>
                  <option value="tourism">سياحية</option>
                  <option value="religious">دينية</option>
                  <option value="adventure">برية</option>
                  <option value="family">عائلية</option>
                  <option value="flight">جوية</option>
                  <option value="special">خاصة</option>
                </select>
              </div>
            </div>

            <div class="admin-form__row">
              <div class="admin-form__group">
                <label class="admin-form__label">الحالة</label>
                <select class="admin-form__select" id="prg-status">
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="available">متاح</option>
                  <option value="limited">محدود</option>
                  <option value="full">مكتمل</option>
                  <option value="expired">منتهي</option>
                </select>
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">الإيموجي</label>
                <input type="text" class="admin-form__input" id="prg-emoji" placeholder="✈️">
              </div>
            </div>

            <div class="admin-form__row">
              <div class="admin-form__group">
                <label class="admin-form__label">تاريخ الانطلاق *</label>
                <input type="date" class="admin-form__input" id="prg-date_departure" required>
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">تاريخ العودة *</label>
                <input type="date" class="admin-form__input" id="prg-date_return" required>
              </div>
            </div>

            <div class="admin-form__row">
              <div class="admin-form__group">
                <label class="admin-form__label">عدد الأيام *</label>
                <input type="number" class="admin-form__input" id="prg-days" min="1" required>
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">عدد الليالي *</label>
                <input type="number" class="admin-form__input" id="prg-nights" min="0" required>
              </div>
            </div>

            <div class="admin-form__row">
              <div class="admin-form__group">
                <label class="admin-form__label">السعر *</label>
                <input type="number" class="admin-form__input" id="prg-price" min="0" required>
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">العملة</label>
                <input type="text" class="admin-form__input" id="prg-currency" value="ر.س">
              </div>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">الصورة التغطية (رابط)</label>
              <input type="url" class="admin-form__input" id="prg-cover_image" placeholder="https://...">
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">الوصف المختصر</label>
              <textarea class="admin-form__textarea" id="prg-short_description" rows="2"></textarea>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">الوصف الكامل</label>
              <textarea class="admin-form__textarea" id="prg-full_description" rows="4"></textarea>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">نقاط الומבاز (واحد لكل سطر)</label>
              <textarea class="admin-form__textarea" id="prg-highlights" rows="3" placeholder="زيارة برج ميلاد&#10;جولة بحرية&#10;تسوق"></textarea>
              <span class="admin-form__hint">اكتب كل نقطة في سطر منفصل</span>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">الخدمات المشمولة (واحد لكل سطر)</label>
              <textarea class="admin-form__textarea" id="prg-included" rows="3"></textarea>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">الخدمات غير المشمولة (واحد لكل سطر)</label>
              <textarea class="admin-form__textarea" id="prg-excluded" rows="3"></textarea>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">شروط الحجز</label>
              <textarea class="admin-form__textarea" id="prg-booking_terms" rows="3"></textarea>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">سياسة الإلغاء</label>
              <textarea class="admin-form__textarea" id="prg-cancellation_policy" rows="3"></textarea>
            </div>

            <div id="admin-form-error" class="auth-form__error" style="display:none"></div>
          </form>
        </div>
        <div class="admin-modal__footer">
          <button class="admin-btn admin-btn--outline" onclick="closeAdminModal()">إلغاء</button>
          <button class="admin-btn admin-btn--primary" id="admin-modal-submit" onclick="document.getElementById('admin-program-form').requestSubmit()">
            حفظ
          </button>
        </div>
      </div>
    </div>
  `;

  loadAdminStats();
  loadAdminPrograms();
}

async function loadAdminStats() {
  const statsEl = document.getElementById('admin-stats');
  if (!statsEl) return;

  try {
    const { data, error } = await SupabaseClient.from('programs').select('id, status');
    if (error) throw error;

    const total = data.length;
    const published = data.filter(p => p.status === 'published' || p.status === 'available' || p.status === 'limited').length;
    const draft = data.filter(p => p.status === 'draft').length;

    statsEl.innerHTML = `
      <div class="admin-stat-card">
        <div class="admin-stat-card__label">إجمالي البرامج</div>
        <div class="admin-stat-card__value admin-stat-card__value--primary">${total}</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__label">برامج منشورة</div>
        <div class="admin-stat-card__value admin-stat-card__value--success">${published}</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__label">مسودات</div>
        <div class="admin-stat-card__value admin-stat-card__value--warning">${draft}</div>
      </div>
    `;
  } catch (e) {
    statsEl.innerHTML = `
      <div class="admin-stat-card">
        <div class="admin-stat-card__label">إجمالي البرامج</div>
        <div class="admin-stat-card__value">-</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__label">برامج منشورة</div>
        <div class="admin-stat-card__value">-</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__label">مسودات</div>
        <div class="admin-stat-card__value">-</div>
      </div>
    `;
  }
}

async function loadAdminPrograms() {
  const tbody = document.getElementById('admin-programs-tbody');
  if (!tbody) return;

  try {
    const { data: programs, error } = await SupabaseClient
      .from('programs')
      .select('id, name, destination_id, status, date_departure, price, currency, type')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!programs || programs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="admin-empty">
              <div class="admin-empty__icon">📋</div>
              <div class="admin-empty__title">لا توجد برامج</div>
              <div class="admin-empty__text">ابدأ بإضافة برنامج جديد</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let destinations = {};
    try {
      const { data: dests } = await SupabaseClient.from('destinations').select('id, name, emoji');
      if (dests) dests.forEach(d => { destinations[d.id] = d; });
    } catch(e) {}

    const typeLabels = {
      tourism: 'سياحية', religious: 'دينية', adventure: 'برية',
      family: 'عائلية', flight: 'جوية', special: 'خاصة'
    };

    const statusLabels = {
      draft: 'مسودة', published: 'منشور', available: 'متاح',
      limited: 'محدود', full: 'مكتمل', expired: 'منتهي'
    };

    tbody.innerHTML = programs.map(p => {
      const dest = destinations[p.destination_id];
      const destName = dest ? `${dest.emoji || ''} ${dest.name}` : p.destination_id || '-';
      const statusClass = ['published', 'available'].includes(p.status) ? 'published' : p.status;

      return `
        <tr>
          <td><strong>${p.name || '-'}</strong></td>
          <td>${destName}</td>
          <td>
            <span class="admin-table__status admin-table__status--${statusClass}">
              ${statusLabels[p.status] || p.status}
            </span>
          </td>
          <td>${p.date_departure || '-'}</td>
          <td>${p.price ? p.price.toLocaleString('ar-SA') + ' ' + (p.currency || '') : '-'}</td>
          <td>
            <div class="admin-table__actions">
              <button class="admin-btn--icon" title="تعديل" onclick="showEditProgramForm('${p.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="admin-btn--icon" title="${p.status === 'published' ? 'إخفاء' : 'نشر'}" onclick="togglePublish('${p.id}', '${p.status}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p.status === 'published' ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>' : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'}</svg>
              </button>
              <button class="admin-btn--icon" title="حذف" onclick="deleteProgram('${p.id}')" style="color:var(--color-error)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="admin-empty">
            <div class="admin-empty__icon">⚠️</div>
            <div class="admin-empty__title">خطأ في تحميل البيانات</div>
            <div class="admin-empty__text">${e.message || 'حدث خطأ غير متوقع'}</div>
          </div>
        </td>
      </tr>
    `;
  }
}

async function deleteProgram(id) {
  if (!confirm('هل أنت متأكد من حذف هذا البرنامج؟')) return;

  try {
    const { error } = await SupabaseClient.from('programs').delete().eq('id', id);
    if (error) throw error;
    showAdminToast('تم حذف البرنامج بنجاح', 'success');
    loadAdminPrograms();
    loadAdminStats();
  } catch (e) {
    showAdminToast(e.message || 'حدث خطأ أثناء الحذف', 'error');
  }
}

async function togglePublish(id, currentStatus) {
  const newStatus = (currentStatus === 'published' || currentStatus === 'available') ? 'draft' : 'published';
  try {
    const { error } = await SupabaseClient.from('programs').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    showAdminToast(newStatus === 'published' ? 'تم نشر البرنامج' : 'تم إخفاء البرنامج', 'success');
    loadAdminPrograms();
    loadAdminStats();
  } catch (e) {
    showAdminToast(e.message || 'حدث خطأ', 'error');
  }
}

async function showAddProgramForm() {
  document.getElementById('admin-modal-title').textContent = 'إضافة برنامج';
  document.getElementById('prg-id').value = '';
  document.getElementById('admin-program-form').reset();
  document.getElementById('prg-currency').value = 'ر.س';
  document.getElementById('prg-status').value = 'draft';
  await loadDestinationsSelect();
  openAdminModal();
}

async function showEditProgramForm(id) {
  document.getElementById('admin-modal-title').textContent = 'تعديل البرنامج';
  await loadDestinationsSelect();

  try {
    const { data, error } = await SupabaseClient.from('programs').select('*').eq('id', id).single();
    if (error) throw error;

    document.getElementById('prg-id').value = data.id;
    document.getElementById('prg-name').value = data.name || '';
    document.getElementById('prg-destination_id').value = data.destination_id || '';
    document.getElementById('prg-type').value = data.type || 'tourism';
    document.getElementById('prg-status').value = data.status || 'draft';
    document.getElementById('prg-emoji').value = data.emoji || '';
    document.getElementById('prg-date_departure').value = data.date_departure || '';
    document.getElementById('prg-date_return').value = data.date_return || '';
    document.getElementById('prg-days').value = data.days || '';
    document.getElementById('prg-nights').value = data.nights || '';
    document.getElementById('prg-price').value = data.price || '';
    document.getElementById('prg-currency').value = data.currency || 'ر.س';
    document.getElementById('prg-cover_image').value = data.cover_image || '';
    document.getElementById('prg-short_description').value = data.short_description || '';
    document.getElementById('prg-full_description').value = data.full_description || '';
    document.getElementById('prg-highlights').value = Array.isArray(data.highlights) ? data.highlights.join('\n') : (data.highlights || '');
    document.getElementById('prg-included').value = Array.isArray(data.included_services) ? data.included_services.join('\n') : (data.included_services || '');
    document.getElementById('prg-excluded').value = Array.isArray(data.excluded_services) ? data.excluded_services.join('\n') : (data.excluded_services || '');
    document.getElementById('prg-booking_terms').value = data.booking_terms || '';
    document.getElementById('prg-cancellation_policy').value = data.cancellation_policy || '';

    openAdminModal();
  } catch (e) {
    showAdminToast(e.message || 'خطأ في تحميل بيانات البرنامج', 'error');
  }
}

async function loadDestinationsSelect() {
  const select = document.getElementById('prg-destination_id');
  if (!select) return;
  select.innerHTML = '<option value="">اختر الوجهة</option>';

  try {
    const { data, error } = await SupabaseClient.from('destinations').select('id, name, emoji').order('name');
    if (error) throw error;
    (data || []).forEach(d => {
      select.innerHTML += `<option value="${d.id}">${d.emoji || ''} ${d.name}</option>`;
    });
  } catch (e) {
    select.innerHTML = '<option value="">خطأ في تحميل الوجهات</option>';
  }
}

function openAdminModal() {
  const modal = document.getElementById('admin-program-modal');
  if (modal) modal.classList.add('admin-modal--active');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-program-modal');
  if (modal) modal.classList.remove('admin-modal--active');
}

async function handleAdminProgramSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById('admin-form-error');
  const submitBtn = document.getElementById('admin-modal-submit');
  errorEl.style.display = 'none';

  const id = document.getElementById('prg-id').value;
  const highlightsRaw = document.getElementById('prg-highlights').value.trim();
  const includedRaw = document.getElementById('prg-included').value.trim();
  const excludedRaw = document.getElementById('prg-excluded').value.trim();

  const programData = {
    name: document.getElementById('prg-name').value.trim(),
    destination_id: document.getElementById('prg-destination_id').value || null,
    type: document.getElementById('prg-type').value,
    status: document.getElementById('prg-status').value,
    emoji: document.getElementById('prg-emoji').value.trim(),
    cover_image: document.getElementById('prg-cover_image').value.trim() || null,
    date_departure: document.getElementById('prg-date_departure').value || null,
    date_return: document.getElementById('prg-date_return').value || null,
    days: parseInt(document.getElementById('prg-days').value) || null,
    nights: parseInt(document.getElementById('prg-nights').value) || null,
    price: parseFloat(document.getElementById('prg-price').value) || null,
    currency: document.getElementById('prg-currency').value.trim(),
    short_description: document.getElementById('prg-short_description').value.trim(),
    full_description: document.getElementById('prg-full_description').value.trim(),
    highlights: highlightsRaw ? highlightsRaw.split('\n').filter(l => l.trim()) : [],
    included_services: includedRaw ? includedRaw.split('\n').filter(l => l.trim()) : [],
    excluded_services: excludedRaw ? excludedRaw.split('\n').filter(l => l.trim()) : [],
    booking_terms: document.getElementById('prg-booking_terms').value.trim(),
    cancellation_policy: document.getElementById('prg-cancellation_policy').value.trim(),
    updated_at: new Date().toISOString()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'جاري الحفظ...';

  try {
    let result;
    if (id) {
      result = await SupabaseClient.from('programs').update(programData).eq('id', id);
    } else {
      programData.created_at = new Date().toISOString();
      result = await SupabaseClient.from('programs').insert(programData);
    }

    if (result.error) throw result.error;

    showAdminToast(id ? 'تم تحديث البرنامج بنجاح' : 'تم إضافة البرنامج بنجاح', 'success');
    closeAdminModal();
    loadAdminPrograms();
    loadAdminStats();
  } catch (e) {
    errorEl.textContent = e.message || 'حدث خطأ أثناء الحفظ';
    errorEl.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'حفظ';
  }
}

function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar) sidebar.classList.toggle('admin-sidebar--open');
}

async function adminLogout() {
  try {
    await SupabaseClient.auth.signOut();
  } catch(e) {}
  window.location.hash = 'admin/login';
}

function showAdminToast(message, type) {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast--${type || 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('admin-toast--visible'));
  setTimeout(() => {
    toast.classList.remove('admin-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// ============================================================
// PHASE 5: Support dashboard (���������) + Bookings management
// ============================================================

let _adminConvUnsub = null;
let _adminConvFilter = 'all';
let _adminActiveConvId = null;

function _adminSetActiveNav(id) {
  document.querySelectorAll('.admin-sidebar__link').forEach(l => l.classList.remove('admin-sidebar__link--active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('admin-sidebar__link--active');
}

async function showAdminConversations(filter) {
  _adminSetActiveNav('admin-nav-conversations');
  _adminConvFilter = filter || _adminConvFilter || 'all';

  const content = document.getElementById('admin-main-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <h2 class="admin-toolbar__title">���������</h2>
      </div>
      <div class="admin-conv-filters">
        ${[['all','����'],['open','������'],['pending','��� ��������'],['resolved','�� ����'],['closed','�����']].map(([k,l]) =>
          `<button class="admin-conv-filter ${_adminConvFilter===k?'admin-conv-filter--active':''}" onclick="showAdminConversations('${k}')">${l}</button>`
        ).join('')}
      </div>
      <div class="admin-conv-list" id="admin-conv-list">
        <div style="padding:40px;text-align:center;color:var(--color-text-tertiary)">���� ����� ���������...</div>
      </div>
    </div>
  `;

  if (_adminConvUnsub) { _adminConvUnsub(); _adminConvUnsub = null; }
  _adminConvUnsub = ChatService.subscribeToConversations(() => loadAdminConversations());

  await loadAdminConversations();
}

async function loadAdminConversations() {
  const list = document.getElementById('admin-conv-list');
  if (!list) return;

  const convs = await ChatService.getConversations(_adminConvFilter);

  if (!convs.length) {
    list.innerHTML = `
      <div class="admin-empty">
        <div class="admin-empty__icon">??</div>
        <div class="admin-empty__title">�� ���� �������</div>
        <div class="admin-empty__text">����� ���� ������� ��������� ����� ���</div>
      </div>
    `;
    return;
  }

  list.innerHTML = convs.map(c => {
    const st = getConversationStatusMeta(c.status);
    const cName = c.customer_name || 'عميل';
    const bookingNo = c.booking ? c.booking.order_number : '';
    const lastMsg = c.lastMessage ? c.lastMessage.message : '�� ���� �����';
    const lastTime = c.lastMessage ? c.lastMessage.created_at : c.updated_at;
    return `
      <div class="admin-conv-row ${c.unreadCount > 0 ? 'admin-conv-row--unread' : ''}" onclick="showAdminConversationChat('${c.id}')">
        <div class="admin-conv-avatar">${(cName).charAt(0)}</div>
        <div class="admin-conv-body">
          <div class="admin-conv-top">
            <span class="admin-conv-name">${escapeHtml(cName)}</span>
            ${bookingNo ? `<span class="admin-conv-booking" dir="ltr">${bookingNo}</span>` : ''}
          </div>
          <div class="admin-conv-last">${escapeHtml(lastMsg)}</div>
          <div class="admin-conv-sub">
            <span class="admin-conv-time">${formatChatTime(lastTime)}</span>
            <span class="admin-conv-status admin-conv-status--${c.status}">${st.label}</span>
          </div>
        </div>
        ${c.unreadCount > 0 ? `<span class="admin-conv-badge">${c.unreadCount}</span>` : ''}
      </div>
    `;
  }).join('');
}

async function showAdminConversationChat(conversationId) {
  _adminActiveConvId = conversationId;
  const content = document.getElementById('admin-main-content');
  if (!content) return;

  const conv = await ChatService.getConversationById(conversationId);
  const st = getConversationStatusMeta(conv ? conv.status : 'open');
  const isClosed = conv && conv.status === 'closed';

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <button class="admin-btn admin-btn--outline admin-btn--small" onclick="showAdminConversations()">? ���������</button>
        <h2 class="admin-toolbar__title">��������</h2>
      </div>

      <div class="admin-chat-meta">
        <span class="admin-conv-status admin-conv-status--${conv ? conv.status : 'open'}">${st.label}</span>
        ${conv && conv.subject ? `<span>${escapeHtml(conv.subject)}</span>` : ''}
        ${conv && conv.booking ? `<span dir="ltr">${conv.booking.order_number}</span>` : ''}
      </div>

      <div class="admin-chat-status-actions">
        <button class="admin-btn admin-btn--small ${conv&&conv.status==='open'?'admin-btn--primary':''}" onclick="adminSetConvStatus('${conversationId}','open')">������</button>
        <button class="admin-btn admin-btn--small ${conv&&conv.status==='pending'?'admin-btn--primary':''}" onclick="adminSetConvStatus('${conversationId}','pending')">��� ��������</button>
        <button class="admin-btn admin-btn--small ${conv&&conv.status==='resolved'?'admin-btn--primary':''}" onclick="adminSetConvStatus('${conversationId}','resolved')">�� ����</button>
        <button class="admin-btn admin-btn--small admin-btn--danger ${conv&&conv.status==='closed'?'':''}" onclick="adminSetConvStatus('${conversationId}','closed')">�����</button>
      </div>

      <div class="admin-chat-thread" id="admin-chat-thread">
        <div style="padding:40px;text-align:center;color:var(--color-text-tertiary)">���� ����� �������...</div>
      </div>

      <div class="admin-chat-composer">
        <textarea class="admin-chat-input" id="admin-chat-input" rows="2" placeholder="���� ���..." ${isClosed ? 'disabled' : ''}></textarea>
        <button class="admin-btn admin-btn--primary" onclick="adminSendReply()" ${isClosed ? 'disabled' : ''}>�����</button>
      </div>
    </div>
  `;

  if (_adminConvUnsub) { _adminConvUnsub(); _adminConvUnsub = null; }
  _adminConvUnsub = ChatService.subscribeToMessages(conversationId, () => loadAdminChatThread(conversationId));

  await loadAdminChatThread(conversationId);
  ChatService.markConversationRead(conversationId);
}

async function loadAdminChatThread(conversationId) {
  const thread = document.getElementById('admin-chat-thread');
  if (!thread) return;
  const messages = await ChatService.getMessages(conversationId);
  const meId = AuthService.currentUser ? AuthService.currentUser.id : null;

  thread.innerHTML = messages.map(m => `
    <div class="admin-chat-msg admin-chat-msg--${m.sender_id === meId ? 'mine' : 'theirs'}">
      <div class="admin-chat-msg__bubble">
        <div class="admin-chat-msg__text">${escapeHtml(m.message)}</div>
        <div class="admin-chat-msg__meta">
          ${m.sender_id === meId ? (m.read_at ? '??' : '?') : `�� ${m.sender_role === 'customer' ? '������' : '������'}`}
          � ${formatChatTime(m.created_at)}
        </div>
      </div>
    </div>
  `).join('') || '<div class="admin-empty" style="padding:30px">�� ���� ����� ���</div>';

  thread.scrollTop = thread.scrollHeight;
}

async function adminSendReply() {
  const input = document.getElementById('admin-chat-input');
  const text = input ? input.value.trim() : '';
  if (!text || !_adminActiveConvId) return;

  const ok = await ChatService.sendMessage(_adminActiveConvId, text, ChatService.isStaff() ? 'employee' : 'admin');
  if (ok) {
    input.value = '';
    loadAdminChatThread(_adminActiveConvId);
    // Auto-resolve when staff replies.
    await ChatService.updateConversationStatus(_adminActiveConvId, 'resolved');
    loadAdminConversations();
  }
}

async function adminSetConvStatus(conversationId, status) {
  await ChatService.updateConversationStatus(conversationId, status);
  showAdminConversationChat(conversationId);
  loadAdminConversations();
}

function getConversationStatusMeta(status) {
  const map = {
    open: { label: '������' }, pending: { label: '��� ��������' },
    resolved: { label: '�� ����' }, closed: { label: '�����' }
  };
  return map[status] || { label: status };
}

async function showAdminBookings() {
  _adminSetActiveNav('admin-nav-bookings');
  const content = document.getElementById('admin-main-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <h2 class="admin-toolbar__title">��������</h2>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>��� �����</th>
              <th>������</th>
              <th>������</th>
              <th>���������</th>
              <th>������</th>
              <th>�������</th>
            </tr>
          </thead>
          <tbody id="admin-bookings-tbody">
            <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--color-text-tertiary)">���� �������...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  await loadAdminBookings();
}

async function loadAdminBookings() {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;
  try {
    const { data, error } = await SupabaseClient
      .from('bookings')
      .select('id, order_number, status, travelers_count, total_price, currency, created_at, customer_name, user_id')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;

    if (!data || !data.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty"><div class="admin-empty__icon">??</div><div class="admin-empty__title">�� ���� ������</div></div></td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(b => {
      const st = getBookingStatusMeta(b.status);
      return `
        <tr>
          <td><strong dir="ltr">${b.order_number}</strong></td>
          <td>${escapeHtml(b.customer_name || '����')}</td>
          <td><span class="admin-table__status" style="color:${st.color};background:${st.color}15">${st.label}</span></td>
          <td>${b.travelers_count}</td>
          <td>${(Number(b.total_price)||0).toLocaleString('ar-SA')} ${b.currency || '�.�'}</td>
          <td>${formatDateShort(b.created_at)}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty"><div class="admin-empty__icon">??</div><div class="admin-empty__title">${escapeHtml(e.message)}</div></div></td></tr>`;
  }
}

function formatDateShort(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric' }); }
  catch(e){ return ''; }
}
