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
          <a class="admin-sidebar__link" href="#admin/conversations" id="admin-nav-conversations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            المحادثات
          </a>
          <a class="admin-sidebar__link" href="#admin/bookings" id="admin-nav-bookings">
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
            <div class="admin-toolbar__controls">
              <input type="search" class="admin-search" id="admin-programs-search" placeholder="ابحث عن برنامج بالاسم أو الوجهة..." oninput="adminFilterPrograms(this.value)">
              <button class="admin-btn admin-btn--primary" onclick="showAddProgramForm()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                إضافة برنامج
              </button>
            </div>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table admin-table--programs">
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
                <input type="date" class="admin-form__input" id="prg-date_departure" required onchange="adminAutoCalcDuration()">
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">تاريخ العودة *</label>
                <input type="date" class="admin-form__input" id="prg-date_return" required onchange="adminAutoCalcDuration()">
              </div>
              <span class="admin-form__hint" style="grid-column:1 / -1">تُحسب المدة (الأيام والليالي) تلقائياً عند اختيار التواريخ، ويمكنك تعديلها يدوياً</span>
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
                <input type="text" class="admin-form__input" id="prg-currency" value="د.ع">
              </div>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">صورة الغلاف</label>
              <div class="admin-cover-picker">
                <div class="admin-cover-preview" id="prg-cover-preview">
                  <span class="admin-cover-preview__empty">لا توجد صورة</span>
                </div>
                <div class="admin-cover-picker__actions">
                  <button type="button" class="admin-btn admin-btn--outline admin-btn--small" onclick="document.getElementById('prg-cover_file').click()">اختيار صورة</button>
                  <button type="button" class="admin-btn admin-btn--outline admin-btn--small" onclick="document.getElementById('prg-cover_image').value='';adminRefreshCoverPreview()">إزالة الصورة</button>
                  <input type="file" id="prg-cover_file" accept="image/*" style="display:none" onchange="adminHandleCoverFile(this)">
                </div>
                <input type="url" class="admin-form__input" id="prg-cover_image" placeholder="images/covers/مثال.jpeg أو رابط مباشر" oninput="adminRefreshCoverPreview()">
                <span class="admin-form__hint">الصورة المختارة تُرفع إلى Supabase Storage فور اختيارها، أو ألصق رابطاً مباشراً</span>
              </div>
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
              <label class="admin-form__label">أبرز نقاط البرنامج (واحد لكل سطر)</label>
              <textarea class="admin-form__textarea" id="prg-highlights" rows="3" placeholder="زيارة برج ميلاد&#10;جولة بحرية&#10;تسوق"></textarea>
              <span class="admin-form__hint">اكتب كل نقطة في سطر منفصل</span>
            </div>

            <div class="admin-form__group">
              <label class="admin-form__label">مميزات البرنامج</label>
              <div class="admin-features" id="prg-features-list"></div>
              <button type="button" class="admin-btn admin-btn--outline admin-btn--small" onclick="adminAddFeatureRow()">+ إضافة ميزة</button>
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
    const { data, error } = await _adminTimeout(SupabaseClient.from('programs').select('id, status'));
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

let adminProgramData = [];
let adminProgramDestMap = {};
let adminProgramSearch = '';

const adminTypeLabels = {
  tourism: 'سياحية', religious: 'دينية', adventure: 'برية',
  family: 'عائلية', flight: 'جوية', special: 'خاصة'
};

const adminStatusLabels = {
  draft: 'مسودة', published: 'منشور', available: 'متاح',
  limited: 'محدود', full: 'مكتمل', expired: 'منتهي'
};

async function loadAdminPrograms() {
  const tbody = document.getElementById('admin-programs-tbody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--color-text-tertiary)">جاري التحميل...</td></tr>';

  try {
    const { data: programs, error } = await _adminTimeout(
      SupabaseClient
        .from('programs')
        .select('id, name, destination_id, status, date_departure, price, currency, type')
        .order('created_at', { ascending: false })
    );

    if (error) throw error;
    if (!document.getElementById('admin-programs-tbody')) return;

    adminProgramData = programs || [];
    adminProgramDestMap = {};
    try {
      const { data: dests } = await SupabaseClient.from('destinations').select('id, name, emoji');
      if (dests) dests.forEach(d => { adminProgramDestMap[d.id] = d; });
    } catch(e) {}

    renderAdminPrograms();
  } catch (e) {
    if (!document.getElementById('admin-programs-tbody')) return;
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

function renderAdminPrograms() {
  const tbody = document.getElementById('admin-programs-tbody');
  if (!tbody) return;

  const q = (adminProgramSearch || '').trim().toLowerCase();
  const list = adminProgramData.filter(p => {
    if (!q) return true;
    const dest = adminProgramDestMap[p.destination_id];
    const destName = dest ? dest.name : '';
    const hay = [p.name || '', destName, adminTypeLabels[p.type] || '', adminStatusLabels[p.status] || ''].join(' ').toLowerCase();
    return hay.includes(q);
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="admin-empty">
            <div class="admin-empty__icon">${adminProgramData.length === 0 ? '📋' : '🔍'}</div>
            <div class="admin-empty__title">${adminProgramData.length === 0 ? 'لا توجد برامج' : 'لا توجد نتائج مطابقة'}</div>
            <div class="admin-empty__text">${adminProgramData.length === 0 ? 'ابدأ بإضافة برنامج جديد' : 'جرّب كلمة بحث مختلفة'}</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(p => {
    const dest = adminProgramDestMap[p.destination_id];
    const destName = dest ? `${dest.emoji || ''} ${dest.name}` : p.destination_id || '-';
    const statusClass = ['published', 'available'].includes(p.status) ? 'published' : p.status;

    return `
      <tr>
        <td><strong>${p.name || '-'}</strong></td>
        <td>${destName}</td>
        <td>
          <span class="admin-table__status admin-table__status--${statusClass}">
            ${adminStatusLabels[p.status] || p.status}
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
}

function adminFilterPrograms(value) {
  adminProgramSearch = value || '';
  renderAdminPrograms();
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
  document.getElementById('prg-currency').value = 'د.ع';
  document.getElementById('prg-status').value = 'draft';
  const featuresList = document.getElementById('prg-features-list');
  if (featuresList) { featuresList.innerHTML = ''; adminAddFeatureRow(); }
  adminRefreshCoverPreview();
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
    document.getElementById('prg-currency').value = data.currency || 'د.ع';
    document.getElementById('prg-cover_image').value = data.cover_image || '';
    document.getElementById('prg-short_description').value = data.short_description || '';
    document.getElementById('prg-full_description').value = data.full_description || '';
    document.getElementById('prg-highlights').value = Array.isArray(data.highlights) ? data.highlights.join('\n') : (data.highlights || '');
    document.getElementById('prg-booking_terms').value = data.booking_terms || '';
    document.getElementById('prg-cancellation_policy').value = data.cancellation_policy || '';

    const features = Array.isArray(data.included_services) ? data.included_services : [];
    const featuresList = document.getElementById('prg-features-list');
    if (featuresList) {
      featuresList.innerHTML = '';
      (features.length ? features : ['']).forEach(v => adminAddFeatureRow(v));
    }
    adminRefreshCoverPreview();

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

  const name = document.getElementById('prg-name').value.trim();
  const destination_id = document.getElementById('prg-destination_id').value;
  const date_departure = document.getElementById('prg-date_departure').value;
  const date_return = document.getElementById('prg-date_return').value;
  const price = parseFloat(document.getElementById('prg-price').value);

  if (!name) return adminShowFormError(errorEl, 'يرجى إدخال اسم البرنامج');
  if (!destination_id) return adminShowFormError(errorEl, 'يرجى اختيار وجهة البرنامج');
  if (!date_departure || !date_return) return adminShowFormError(errorEl, 'يرجى تحديد تاريخي الانطلاق والعودة');
  if (date_return < date_departure) return adminShowFormError(errorEl, 'تاريخ العودة يجب أن يكون بعد تاريخ الانطلاق');
  if (isNaN(price) || price < 0) return adminShowFormError(errorEl, 'يرجى إدخال سعر صحيح');

  const id = document.getElementById('prg-id').value;
  const highlightsRaw = document.getElementById('prg-highlights').value.trim();

  const programData = {
    name: name,
    destination_id: destination_id,
    type: document.getElementById('prg-type').value,
    status: document.getElementById('prg-status').value,
    emoji: document.getElementById('prg-emoji').value.trim(),
    cover_image: document.getElementById('prg-cover_image').value.trim() || null,
    date_departure: date_departure,
    date_return: date_return,
    days: parseInt(document.getElementById('prg-days').value) || null,
    nights: parseInt(document.getElementById('prg-nights').value) || null,
    price: price,
    currency: document.getElementById('prg-currency').value.trim(),
    short_description: document.getElementById('prg-short_description').value.trim(),
    full_description: document.getElementById('prg-full_description').value.trim(),
    highlights: highlightsRaw ? highlightsRaw.split('\n').filter(l => l.trim()) : [],
    included_services: adminGetFeatures(),
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
      programData.excluded_services = [];
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

function adminShowFormError(errorEl, message) {
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function adminGetFeatures() {
  return Array.from(document.querySelectorAll('#prg-features-list .admin-feature-input')).map(i => i.value.trim()).filter(Boolean);
}

function adminAddFeatureRow(value) {
  const list = document.getElementById('prg-features-list');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'admin-feature-row';
  row.innerHTML = `
    <input type="text" class="admin-form__input admin-feature-input" placeholder="مثال: سكن قريب من الحرم" value="${escapeHtml(value || '')}">
    <button type="button" class="admin-btn--icon admin-feature-remove" title="حذف الميزة" onclick="adminRemoveFeatureRow(this)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>
  `;
  list.appendChild(row);
}

function adminRemoveFeatureRow(btn) {
  const row = btn.closest('.admin-feature-row');
  const list = document.getElementById('prg-features-list');
  if (row && list && list.children.length > 1) {
    row.remove();
  }
}

function adminAutoCalcDuration() {
  const dep = document.getElementById('prg-date_departure')?.value;
  const ret = document.getElementById('prg-date_return')?.value;
  const daysEl = document.getElementById('prg-days');
  const nightsEl = document.getElementById('prg-nights');
  if (!dep || !ret || !daysEl || !nightsEl) return;
  const start = new Date(dep + 'T00:00:00');
  const end = new Date(ret + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return;
  const nights = Math.round((end - start) / 86400000);
  daysEl.value = nights + 1;
  nightsEl.value = nights;
}

function adminRefreshCoverPreview() {
  const input = document.getElementById('prg-cover_image');
  const preview = document.getElementById('prg-cover-preview');
  if (!input || !preview) return;
  const val = (input.value || '').trim();
  if (val) {
    preview.innerHTML = `<img src="${escapeHtml(val)}" alt="الغلاف" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="admin-cover-preview__error" style="display:none">تعذر عرض الصورة</span>`;
  } else {
    preview.innerHTML = '<span class="admin-cover-preview__empty">لا توجد صورة</span>';
  }
}

async function adminHandleCoverFile(fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    showAdminToast('يرجى اختيار ملف صورة', 'error');
    fileInput.value = '';
    return;
  }

  const preview = document.getElementById('prg-cover-preview');
  if (preview) {
    const localUrl = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${localUrl}" alt="الغلاف">`;
  }

  try {
    await adminUploadCoverToStorage(file);
  } catch (e) {
    showAdminToast(e.message || 'تعذر رفع الصورة', 'error');
    adminRefreshCoverPreview();
  }
  fileInput.value = '';
}

async function adminUploadCoverToStorage(file) {
  const client = SupabaseClient.client;
  if (!client || !client.storage) throw new Error('خدمة رفع الصور غير متوفرة — ألصق رابطاً مباشراً بدلاً من ذلك');

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const key = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await client.storage.from('covers').upload(key, file, { contentType: file.type || 'application/octet-stream', upsert: true });
  if (error) {
    const msg = (error.message || '').toString();
    if (/bucket|not found|does not exist|permission|access denied|new row violates/i.test(msg)) {
      throw new Error('خزان الصور غير جاهز بعد — نفّذ استعلام 20260829000003 في قاعدة البيانات, أو ألصق رابطاً مباشراً');
    }
    throw new Error('تعذر رفع الصورة: ' + msg);
  }

  const url = `${SUPABASE_CONFIG.url}/storage/v1/object/public/covers/${key}`;
  document.getElementById('prg-cover_image').value = url;
  adminRefreshCoverPreview();
  showAdminToast('تم رفع الصورة بنجاح', 'success');
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
// PHASE 5: Support dashboard (المحادثات) + Bookings management
// ============================================================

let _adminConvUnsub = null;
let _adminConvFilter = 'all';
let _adminActiveConvId = null;
let _adminViewToken = 0;

function _adminTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout: ' + (ms || 10000) + 'ms')), ms || 10000);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function _adminTakeToken() {
  return ++_adminViewToken;
}

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
        <h2 class="admin-toolbar__title">المحادثات</h2>
      </div>
      <div class="admin-conv-filters">
        ${[['all','الكل'],['open','مفتوحة'],['pending','قيد المعالجة'],['resolved','تم الحل'],['closed','إغلاق']].map(([k,l]) =>
          `<button class="admin-conv-filter ${_adminConvFilter===k?'admin-conv-filter--active':''}" onclick="showAdminConversations('${k}')">${l}</button>`
        ).join('')}
      </div>
      <div class="admin-conv-list" id="admin-conv-list">
        <div style="padding:40px;text-align:center;color:var(--color-text-tertiary)">جارٍ تحميل المحادثات...</div>
      </div>
    </div>
  `;

  const token = _adminTakeToken();

  if (_adminConvUnsub) { _adminConvUnsub(); _adminConvUnsub = null; }
  _adminConvUnsub = ChatService.subscribeToConversations(() => {
    if (token !== _adminViewToken) return;
    loadAdminConversations();
  });

  await loadAdminConversations();
  if (token !== _adminViewToken) return;
}

async function loadAdminConversations() {
  const list = document.getElementById('admin-conv-list');
  if (!list) return;

  const convs = await ChatService.getConversations(_adminConvFilter);

  if (!convs.length) {
    list.innerHTML = `
<div class="admin-empty">
        <div class="admin-empty__icon">💬</div>
        <div class="admin-empty__title">لا توجد محادثات</div>
        <div class="admin-empty__text">عند تواصل الزبائن معك ستظهر المحادثات هنا</div>
      </div>
    `;
    return;
  }

  list.innerHTML = convs.map(c => {
    const st = getConversationStatusMeta(c.status);
    const cName = c.customer_name || 'عميل';
    const bookingNo = c.booking ? c.booking.order_number : '';
    const lastMsg = c.lastMessage ? c.lastMessage.message : 'لا توجد رسائل بعد';
    const lastTime = c.lastMessage ? c.lastMessage.created_at : c.updated_at;
    return `
      <div class="admin-conv-row ${c.unreadCount > 0 ? 'admin-conv-row--unread' : ''}" onclick="window.location.hash='admin/chat/${c.id}'">
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
  const token = _adminTakeToken();
  const content = document.getElementById('admin-main-content');
  if (!content) return;

  const conv = await ChatService.getConversationById(conversationId);
  const st = getConversationStatusMeta(conv ? conv.status : 'open');
  const isClosed = conv && conv.status === 'closed';

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
<button class="admin-btn admin-btn--outline admin-btn--small" onclick="window.location.hash='admin/conversations'">↩ المحادثات</button>
        <h2 class="admin-toolbar__title">المحادثة</h2>
      </div>

      <div class="admin-chat-meta">
        <span class="admin-conv-status admin-conv-status--${conv ? conv.status : 'open'}">${st.label}</span>
        ${conv && conv.subject ? `<span>${escapeHtml(conv.subject)}</span>` : ''}
        ${conv && conv.booking ? `<span dir="ltr">${conv.booking.order_number}</span>` : ''}
      </div>

      <div class="admin-chat-status-actions">
<button class="admin-btn admin-btn--small ${conv&&conv.status==='open'?'admin-btn--primary':''}" onclick="adminSetConvStatus('${conversationId}','open')">مفتوحة</button>
        <button class="admin-btn admin-btn--small ${conv&&conv.status==='pending'?'admin-btn--primary':''}" onclick="adminSetConvStatus('${conversationId}','pending')">قيد المعالجة</button>
        <button class="admin-btn admin-btn--small ${conv&&conv.status==='resolved'?'admin-btn--primary':''}" onclick="adminSetConvStatus('${conversationId}','resolved')">تم الحل</button>
        <button class="admin-btn admin-btn--small admin-btn--danger ${conv&&conv.status==='closed'?'':''}" onclick="adminSetConvStatus('${conversationId}','closed')">إغلاق</button>
      </div>

      <div class="admin-chat-thread" id="admin-chat-thread">
        <div style="padding:40px;text-align:center;color:var(--color-text-tertiary)">جارٍ تحميل الرسائل...</div>
      </div>

      <div class="admin-chat-composer">
<textarea class="admin-chat-input" id="admin-chat-input" rows="2" placeholder="اكتب رسالة..." ${isClosed ? 'disabled' : ''}></textarea>
        <button class="admin-btn admin-btn--primary" onclick="adminSendReply()" ${isClosed ? 'disabled' : ''}>إرسال</button>
      </div>
    </div>
  `;

  if (_adminConvUnsub) { _adminConvUnsub(); _adminConvUnsub = null; }
  _adminConvUnsub = ChatService.subscribeToMessages(conversationId, () => {
    if (token !== _adminViewToken) return;
    loadAdminChatThread(conversationId);
  });

  await loadAdminChatThread(conversationId);
  if (token !== _adminViewToken) return;
  ChatService.markConversationRead(conversationId);
}

async function loadAdminChatThread(conversationId) {
  const thread = document.getElementById('admin-chat-thread');
  if (!thread) return;
  const messages = await ChatService.getMessages(conversationId);
  if (!document.getElementById('admin-chat-thread')) return;
  const meId = AuthService.currentUser ? AuthService.currentUser.id : null;

  thread.innerHTML = messages.map(m => `
    <div class="admin-chat-msg admin-chat-msg--${m.sender_id === meId ? 'mine' : 'theirs'}">
      <div class="admin-chat-msg__bubble">
        <div class="admin-chat-msg__text">${escapeHtml(m.message)}</div>
        <div class="admin-chat-msg__meta">
${m.sender_id === meId ? (m.read_at ? '✓' : '○') : `· ${m.sender_role === 'customer' ? 'الزبون' : 'الموظف'}`}
          · ${formatChatTime(m.created_at)}
        </div>
      </div>
    </div>
  `).join('') || '<div class="admin-empty" style="padding:30px">لا توجد رسائل بعد</div>';

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
open: { label: 'مفتوحة' }, pending: { label: 'قيد المعالجة' },
    resolved: { label: 'تم الحل' }, closed: { label: 'إغلاق' }
  };
  return map[status] || { label: status };
}

let _adminBookingFilter = 'all';
let _adminActiveBookingId = null;

async function showAdminBookings(filter) {
  _adminSetActiveNav('admin-nav-bookings');
  _adminBookingFilter = filter || _adminBookingFilter || 'all';

  const content = document.getElementById('admin-main-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <h2 class="admin-toolbar__title">الحجوزات</h2>
      </div>
      <div class="admin-conv-filters">
        ${[['all','الكل'],['pending','قيد المراجعة'],['reviewing','قيد المعالجة'],['confirmed','مؤكد'],['completed','مكتمل'],['cancelled','ملغي']].map(([k,l]) =>
          `<button class="admin-conv-filter ${_adminBookingFilter===k?'admin-conv-filter--active':''}" onclick="showAdminBookings('${k}')">${l}</button>`
        ).join('')}
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>البرنامج</th>
              <th>الحالة</th>
              <th>المسافرون</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody id="admin-bookings-tbody">
            <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--color-text-tertiary)">جارٍ تحميل الحجوزات...</td></tr>
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
    let query = SupabaseClient
      .from('bookings')
      .select('id, order_number, status, travelers_count, total_price, currency, created_at, customer_name, user_id, program_id')
      .order('created_at', { ascending: false })
      .limit(200);
    if (_adminBookingFilter && _adminBookingFilter !== 'all') {
      query = query.eq('status', _adminBookingFilter);
    }
    const { data, error } = await _adminTimeout(query);
    if (error) throw error;

    if (!document.getElementById('admin-bookings-tbody')) return;

    if (!data || !data.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="admin-empty"><div class="admin-empty__icon">📋</div><div class="admin-empty__title">لا توجد حجوزات${_adminBookingFilter && _adminBookingFilter !== 'all' ? ' بهذه الحالة' : ' حالياً'}</div></div></td></tr>`;
      return;
    }

    let progMap = {};
    try {
      const progIds = [...new Set(data.map(b => b.program_id).filter(Boolean))];
      if (progIds.length) {
        const { data: progs } = await SupabaseClient.from('programs').select('id, name, emoji').in('id', progIds);
        (progs || []).forEach(p => { progMap[p.id] = p; });
      }
    } catch (e) {}

    tbody.innerHTML = data.map(b => {
      const st = getBookingStatusMeta(b.status);
      const prog = progMap[b.program_id];
      return `
        <tr class="admin-booking-row" onclick="window.location.hash='admin/booking/${b.id}'">
          <td><strong dir="ltr">${b.order_number}</strong></td>
          <td>${escapeHtml(b.customer_name || 'زائر')}</td>
          <td>${prog ? `${prog.emoji || ''} ${escapeHtml(prog.name)}` : '-'}</td>
          <td><span class="admin-table__status" style="color:${st.color};background:${st.color}15">${st.label}</span></td>
          <td>${b.travelers_count}</td>
          <td>${(Number(b.total_price)||0).toLocaleString('ar-SA')} ${b.currency || 'د.ع'}</td>
          <td>${formatDateShort(b.created_at)}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="admin-empty"><div class="admin-empty__icon">⚠️</div><div class="admin-empty__title">${escapeHtml(e.message)}</div></div></td></tr>`;
  }
}

async function showAdminBookingDetail(bookingId) {
  _adminSetActiveNav('admin-nav-bookings');
  const token = _adminTakeToken();
  const content = document.getElementById('admin-main-content');
  if (!content) return;

  content.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <button class="admin-btn admin-btn--outline admin-btn--small" onclick="window.location.hash='admin/bookings'">↩ الحجوزات</button>
        <h2 class="admin-toolbar__title">تفاصيل الحجز</h2>
      </div>
      <div id="admin-booking-detail">
        <div style="padding:40px;text-align:center;color:var(--color-text-tertiary)">جارٍ تحميل تفاصيل الحجز...</div>
      </div>
    </div>
  `;

  try {
    const { data: booking, error } = await _adminTimeout(
      SupabaseClient
        .from('bookings')
        .select('*, booking_travelers(*)')
        .eq('id', bookingId)
        .single()
    );
    if (error) throw error;
    if (token !== _adminViewToken) return;

    let prog = null;
    let dest = null;
    try {
      const { data: p } = await SupabaseClient.from('programs').select('*').eq('id', booking.program_id).single();
      prog = p || null;
      if (prog && prog.destination_id) {
        const { data: d } = await SupabaseClient.from('destinations').select('name, emoji').eq('id', prog.destination_id).single();
        dest = d || null;
      }
    } catch (e) {}

    renderAdminBookingDetail(booking, prog, dest);
  } catch (e) {
    const el = document.getElementById('admin-booking-detail');
    if (el) el.innerHTML = `<div class="admin-empty"><div class="admin-empty__icon">⚠️</div><div class="admin-empty__title">${escapeHtml(e.message)}</div></div>`;
  }
}

function renderAdminBookingDetail(booking, prog, dest) {
  _adminActiveBookingId = booking.id;
  const el = document.getElementById('admin-booking-detail');
  if (!el) return;

  const st = getBookingStatusMeta(booking.status);
  const travelers = (booking.booking_travelers || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const waNum = booking.customer_phone ? String(booking.customer_phone).replace(/\D/g, '') : '';

  const statusLabels = ['pending','reviewing','confirmed','completed','cancelled'];
  const statusBtnHtml = statusLabels.map(s => {
    const m = getBookingStatusMeta(s);
    const active = booking.status === s;
    const danger = s === 'cancelled';
    const cls = active
      ? (danger ? 'admin-btn--danger' : 'admin-btn--primary')
      : 'admin-btn--outline';
    return `<button class="admin-btn admin-btn--small ${cls}" onclick="adminUpdateBookingStatus('${booking.id}','${s}')">${active ? '✓ ' : ''}${m.icon} ${m.label}</button>`;
  }).join('');

  el.innerHTML = `
    <div class="admin-booking-header">
      <div>
        <div class="admin-booking-header__no" dir="ltr">${booking.order_number}</div>
        <div class="admin-booking-header__date">أنشئ في ${formatDateShort(booking.created_at)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="admin-table__status" style="color:${st.color};background:${st.color}15;font-size:13px;padding:6px 14px">${st.icon} ${st.label}</span>
        ${waNum ? `<a class="admin-btn admin-btn--small admin-btn--success" target="_blank" rel="noopener" href="https://wa.me/${waNum}">واتساب</a>` : ''}
      </div>
    </div>

    <div class="admin-booking-grid">
      <div class="admin-booking-card">
        <div class="admin-booking-card__title">👤 معلومات العميل</div>
        <div class="admin-booking-rows">
          <div class="admin-booking-row"><span>الاسم</span><strong>${escapeHtml(booking.customer_name || '—')}</strong></div>
          <div class="admin-booking-row"><span>رقم الهاتف</span><strong dir="ltr">${booking.customer_phone ? `<a href="tel:${escapeHtml(booking.customer_phone)}">${escapeHtml(booking.customer_phone)}</a>` : '—'}</strong></div>
          <div class="admin-booking-row"><span>البريد</span><strong dir="ltr" style="font-size:12px">${booking.customer_email ? escapeHtml(booking.customer_email) : '—'}</strong></div>
          <div class="admin-booking-row"><span>المدينة</span><strong>${escapeHtml(booking.customer_city || '—')}</strong></div>
          <div class="admin-booking-row"><span>النوع</span><strong>${booking.user_id ? 'عميل مسجل' : 'زائر (بدون حساب)'}</strong></div>
        </div>
      </div>

      <div class="admin-booking-card">
        <div class="admin-booking-card__title">✈️ البرنامج</div>
        ${prog ? `
          <div class="admin-booking-prog__name">${prog.emoji || ''} ${escapeHtml(prog.name)}</div>
          <div class="admin-booking-rows">
            <div class="admin-booking-row"><span>الوجهة</span><strong>${dest ? `${dest.emoji || ''} ${escapeHtml(dest.name)}` : '-'}</strong></div>
            <div class="admin-booking-row"><span>الانطلاق</span><strong>${prog.date_departure ? formatDateShort(prog.date_departure) : '-'}</strong></div>
            <div class="admin-booking-row"><span>العودة</span><strong>${prog.date_return ? formatDateShort(prog.date_return) : '-'}</strong></div>
            <div class="admin-booking-row"><span>المدة</span><strong>${prog.days ? prog.days + ' يوم' : '-'}${prog.nights ? ' / ' + prog.nights + ' ليلة' : ''}</strong></div>
            <div class="admin-booking-row"><span>سعر البرنامج</span><strong>${(Number(prog.price) || 0).toLocaleString('ar-SA')} ${prog.currency || 'د.ع'}</strong></div>
          </div>` : `
          <div class="admin-booking-row"><span>البرنامج</span><strong>—</strong></div>`}
      </div>

      <div class="admin-booking-card">
        <div class="admin-booking-card__title">🧾 تفاصيل الحجز</div>
        <div class="admin-booking-rows">
          <div class="admin-booking-row"><span>عدد المسافرين</span><strong>${booking.travelers_count}</strong></div>
          <div class="admin-booking-row"><span>الغرف</span><strong>${booking.rooms_count || 1}</strong></div>
          <div class="admin-booking-row"><span>نوع الغرفة</span><strong>${escapeHtml(booking.room_type || '—')}</strong></div>
          <div class="admin-booking-row admin-booking-row--total"><span>إجمالي المبلغ</span><strong>${(Number(booking.total_price) || 0).toLocaleString('ar-SA')} ${booking.currency || 'د.ع'}</strong></div>
        </div>
      </div>
    </div>

    <div class="admin-booking-card">
      <div class="admin-booking-card__title">👥 المسافرون (${travelers.length})</div>
      ${travelers.length ? `
        <div class="admin-travelers">
          ${travelers.map((t, i) => `
            <div class="admin-traveler">
              <div class="admin-traveler__num">${i + 1}</div>
              <div class="admin-traveler__body">
                <div class="admin-traveler__name">${escapeHtml(t.full_name)}</div>
                <div class="admin-traveler__meta">
                  ${t.phone ? `<span dir="ltr">📞 ${escapeHtml(t.phone)}</span>` : ''}
                  ${t.nationality ? `<span>🌍 ${escapeHtml(t.nationality)}</span>` : ''}
                  ${t.passport_number ? `<span dir="ltr">🛂 ${escapeHtml(t.passport_number)}</span>` : ''}
                  ${t.date_of_birth ? `<span>🎂 ${formatDateShort(t.date_of_birth)}</span>` : ''}
                  ${t.notes ? `<span>📝 ${escapeHtml(t.notes)}</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>` : '<div class="admin-booking-row"><strong>لا توجد بيانات مسافرين</strong></div>'}
    </div>

    ${booking.customer_notes ? `
    <div class="admin-booking-card">
      <div class="admin-booking-card__title">📝 ملاحظات العميل</div>
      <div class="admin-booking-notes applicant">${escapeHtml(booking.customer_notes)}</div>
    </div>` : ''}

    <div class="admin-booking-card">
      <div class="admin-booking-card__title">💬 سجل الردود ومراجعة الطلب</div>
      <div class="admin-booking-actions">
        <span class="admin-booking-actions__label">حالة الطلب:</span>
        ${statusBtnHtml}
      </div>
      <div class="admin-notes-thread">
        ${bookingNotesToHtml(booking.employee_notes) || '<div class="admin-notes-empty">لا توجد ردود بعد — اكتب أول رد للعميل بالأسفل</div>'}
      </div>
      <div class="admin-chat-composer">
        <textarea class="admin-chat-input" id="admin-booking-reply-input" rows="2" placeholder="اكتب ردك للعميل هنا..."></textarea>
        <button class="admin-btn admin-btn--primary" onclick="adminReplyToBooking('${booking.id}')">إرسال الرد</button>
      </div>
    </div>
  `;
}

async function adminUpdateBookingStatus(bookingId, status) {
  const meta = getBookingStatusMeta(status);
  try {
    const { data: cur, error: ce } = await SupabaseClient.from('bookings').select('employee_notes').eq('id', bookingId).single();
    if (ce) throw ce;
    const entry = buildBookingNoteEntry('status', '', meta.label);
    const notes = [entry, (cur && cur.employee_notes)].filter(Boolean).join('\n---\n');
    const { error } = await SupabaseClient
      .from('bookings')
      .update({ status, employee_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', bookingId);
    if (error) throw error;
    showAdminToast('تم تحديث حالة الطلب إلى «' + meta.label + '»', 'success');
  } catch (e) {
    showAdminToast(e.message || 'تعذر تحديث حالة الطلب', 'error');
  }
  await showAdminBookingDetail(bookingId);
}

async function adminReplyToBooking(bookingId) {
  const input = document.getElementById('admin-booking-reply-input');
  const text = input ? input.value.trim() : '';
  if (!text) {
    showAdminToast('اكتب نص الرد أولاً', 'error');
    return;
  }

  const staffName = AuthService.currentUser ? (AuthService.currentUser.name || 'الإدارة') : 'الإدارة';
  try {
    const { data: cur, error: ce } = await SupabaseClient.from('bookings').select('employee_notes, status').eq('id', bookingId).single();
    if (ce) throw ce;
    const entry = buildBookingNoteEntry('reply', staffName, text);
    const notes = [entry, (cur && cur.employee_notes)].filter(Boolean).join('\n---\n');

    const patch = { employee_notes: notes, updated_at: new Date().toISOString() };
    // Moving a fresh request into "reviewing" when staff replies shows progress to the customer.
    if (cur && cur.status === 'pending') patch.status = 'reviewing';

    const { error } = await SupabaseClient.from('bookings').update(patch).eq('id', bookingId);
    if (error) throw error;
    showAdminToast('تم إرسال الرد للعميل', 'success');
  } catch (e) {
    showAdminToast(e.message || 'تعذر إرسال الرد', 'error');
  }
  await showAdminBookingDetail(bookingId);
}

function formatDateShort(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric' }); }
  catch(e){ return ''; }
}
