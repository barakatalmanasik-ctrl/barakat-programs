function renderProfilePage() {
  const container = document.getElementById('profile-content');
  const user = AuthService.currentUser;
  if (!user) { navigateToPage('login'); return; }

  container.innerHTML = `
    <div class="profile-page">
      <div class="profile-page__header">
        <button class="profile-page__back" onclick="navigateToPage('more')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 class="profile-page__title">حسابي</h1>
      </div>

      <div class="profile-page__avatar">
        <div class="profile-page__avatar-circle">${user.name.charAt(0)}</div>
        <div class="profile-page__avatar-name">${user.name}</div>
        <div class="profile-page__avatar-email">${user.email}</div>
      </div>

      <div class="profile-page__section">
        <h3 class="profile-page__section-title">البيانات الشخصية</h3>
        <div class="profile-page__card">
          <div class="profile-page__field">
            <div class="profile-page__field-label">الاسم</div>
            <div class="profile-page__field-value" id="profile-name-display">${user.name}</div>
            <input type="text" class="profile-page__field-input" id="profile-name-input" value="${user.name}" style="display:none">
          </div>
          <div class="profile-page__field">
            <div class="profile-page__field-label">البريد الإلكتروني</div>
            <div class="profile-page__field-value" id="profile-email-display">${user.email}${AuthService.isSupabase ? ' <small style="color:var(--color-text-secondary);font-size:11px">(لتغيير البريد تواصل معنا)</small>' : ''}</div>
            ${!AuthService.isSupabase ? '<input type="email" class="profile-page__field-input" id="profile-email-input" value="' + user.email + '" style="display:none">' : ''}
          </div>
          <div class="profile-page__field">
            <div class="profile-page__field-label">رقم الهاتف</div>
            <div class="profile-page__field-value" id="profile-phone-display">${user.phone || 'غير محدد'}</div>
            <input type="tel" class="profile-page__field-input" id="profile-phone-input" value="${user.phone || ''}" style="display:none">
          </div>
          <div class="profile-page__field">
            <div class="profile-page__field-label">عضو منذ</div>
            <div class="profile-page__field-value">${new Date(user.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        <div class="profile-page__actions" id="profile-edit-actions">
          <button class="profile-page__edit-btn" onclick="toggleProfileEdit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            تعديل البيانات
          </button>
        </div>
        <div class="profile-page__actions" id="profile-save-actions" style="display:none">
          <button class="profile-page__save-btn" onclick="saveProfile()">حفظ التعديلات</button>
          <button class="profile-page__cancel-btn" onclick="cancelProfileEdit()">إلغاء</button>
        </div>
        <div id="profile-success" class="auth-form__success" style="display:none"></div>
        <div id="profile-error" class="auth-form__error" style="display:none"></div>
      </div>

      <div class="profile-page__section">
        <h3 class="profile-page__section-title">تغيير كلمة المرور</h3>
        <div class="profile-page__card">
          ${!AuthService.isSupabase ? `
          <div class="profile-page__field">
            <div class="profile-page__field-label">كلمة المرور الحالية</div>
            <input type="password" class="profile-page__field-input" id="current-password" placeholder="أدخل كلمة المرور الحالية">
          </div>
          ` : ''}
          <div class="profile-page__field">
            <div class="profile-page__field-label">كلمة المرور الجديدة</div>
            <input type="password" class="profile-page__field-input" id="new-password" placeholder="6 أحرف على الأقل" minlength="6">
          </div>
          <div class="profile-page__field">
            <div class="profile-page__field-label">تأكيد كلمة المرور الجديدة</div>
            <input type="password" class="profile-page__field-input" id="confirm-new-password" placeholder="أعد إدخال كلمة المرور الجديدة">
          </div>
        </div>
        <div id="password-error" class="auth-form__error" style="display:none"></div>
        <div id="password-success" class="auth-form__success" style="display:none"></div>
        <div class="profile-page__actions">
          <button class="profile-page__save-btn" onclick="changePassword()">تغيير كلمة المرور</button>
        </div>
      </div>

      <div class="profile-page__section">
        <button class="profile-page__logout-btn" onclick="handleLogout()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          تسجيل الخروج
        </button>
      </div>
    </div>
  `;
}

function toggleProfileEdit() {
  const fields = AuthService.isSupabase ? ['name', 'phone'] : ['name', 'email', 'phone'];
  fields.forEach(f => {
    const display = document.getElementById(`profile-${f}-display`);
    const input = document.getElementById(`profile-${f}-input`);
    if (display) display.style.display = 'none';
    if (input) input.style.display = 'block';
  });
  document.getElementById('profile-edit-actions').style.display = 'none';
  document.getElementById('profile-save-actions').style.display = 'flex';
}

function cancelProfileEdit() {
  const user = AuthService.currentUser;
  const fields = AuthService.isSupabase ? ['name', 'phone'] : ['name', 'email', 'phone'];
  fields.forEach(f => {
    const display = document.getElementById(`profile-${f}-display`);
    const input = document.getElementById(`profile-${f}-input`);
    if (display) display.style.display = '';
    if (input) input.style.display = 'none';
  });
  document.getElementById('profile-name-input').value = user.name;
  const emailInput = document.getElementById('profile-email-input');
  if (emailInput) emailInput.value = user.email;
  document.getElementById('profile-phone-input').value = user.phone || '';
  document.getElementById('profile-edit-actions').style.display = 'flex';
  document.getElementById('profile-save-actions').style.display = 'none';
  document.getElementById('profile-error').style.display = 'none';
  document.getElementById('profile-success').style.display = 'none';
}

async function saveProfile() {
  const name = document.getElementById('profile-name-input').value.trim();
  const emailInput = document.getElementById('profile-email-input');
  const email = emailInput ? emailInput.value.trim() : AuthService.currentUser.email;
  const phone = document.getElementById('profile-phone-input').value.trim() || null;
  const errorEl = document.getElementById('profile-error');
  const successEl = document.getElementById('profile-success');

  if (!name) {
    errorEl.textContent = 'يرجى إدخال الاسم';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  errorEl.style.display = 'none';
  const result = await AuthService.updateProfile({ name, email, phone });
  if (result.success) {
    successEl.textContent = 'تم حفظ التعديلات بنجاح';
    successEl.style.display = 'block';
    renderProfilePage();
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

async function changePassword() {
  const currentEl = document.getElementById('current-password');
  const current = currentEl ? currentEl.value : '';
  const newPass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-new-password').value;
  const errorEl = document.getElementById('password-error');
  const successEl = document.getElementById('password-success');

  if (!newPass || !confirm) {
    errorEl.textContent = 'يرجى ملء جميع الحقول';
    errorEl.style.display = 'block';
    return;
  }
  if (!current && !AuthService.isSupabase) {
    errorEl.textContent = 'يرجى إدخال كلمة المرور الحالية';
    errorEl.style.display = 'block';
    return;
  }
  if (newPass !== confirm) {
    errorEl.textContent = 'كلمتا المرور غير متطابقتين';
    errorEl.style.display = 'block';
    return;
  }
  if (newPass.length < 6) {
    errorEl.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  successEl.style.display = 'none';
  const result = await AuthService.changePassword(current, newPass);
  if (result.success) {
    successEl.textContent = 'تم تغيير كلمة المرور بنجاح';
    successEl.style.display = 'block';
    if (currentEl) currentEl.value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

function handleLogout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    AuthService.logout();
    Router.go('home');
  }
}
