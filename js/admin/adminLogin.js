function renderAdminLoginPage() {
  const container = document.getElementById('admin-login-content');
  if (!container) return;

  container.innerHTML = `
    <div class="admin-login">
      <div class="auth-page">
        <div class="auth-page__brand">
          <div class="auth-page__logo">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#C8963E"/><path d="M2 17l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/><path d="M2 12l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/></svg>
          </div>
          <h1 class="auth-page__title">لوحة التحكم</h1>
          <p class="auth-page__subtitle">سجّل الدخول للوصول إلى لوحة التحكم</p>
        </div>
        <form class="auth-form" id="admin-login-form" onsubmit="handleAdminLogin(event)">
          <div class="auth-form__group">
            <label class="auth-form__label">البريد الإلكتروني</label>
            <div class="auth-form__input-wrapper">
              <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" class="auth-form__input" id="admin-email" placeholder="admin@example.com" required dir="ltr" style="text-align:right" autocomplete="email">
            </div>
          </div>
          <div class="auth-form__group">
            <label class="auth-form__label">كلمة المرور</label>
            <div class="auth-form__input-wrapper">
              <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" class="auth-form__input" id="admin-password" placeholder="أدخل كلمة المرور" required autocomplete="current-password">
              <button type="button" class="auth-form__toggle-pass" onclick="togglePasswordVisibility('admin-password', this)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div id="admin-login-error" class="auth-form__error" style="display:none"></div>
          <button type="submit" class="auth-form__submit" id="admin-login-submit">
            <span>تسجيل الدخول</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('admin-login-error');
  const submitBtn = document.getElementById('admin-login-submit');

  if (!email || !password) {
    errorEl.textContent = 'يرجى ملء جميع الحقول';
    errorEl.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="auth-form__spinner"></span>';
  errorEl.style.display = 'none';

  try {
    if (!SupabaseClient.isConfigured) {
      throw new Error('Supabase غير مكوّن');
    }

    const { data, error } = await SupabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>تسجيل الدخول</span>';

    if (error) {
      let msg = error.message;
      if (msg.includes('Invalid login')) msg = 'بيانات الدخول غير صحيحة';
      if (msg.includes('Email not confirmed')) msg = 'يرجى تأكيد البريد الإلكتروني أولاً';
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      return;
    }

    window.location.hash = 'admin/dashboard';
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>تسجيل الدخول</span>';
    errorEl.textContent = err.message || 'حدث خطأ أثناء تسجيل الدخول';
    errorEl.style.display = 'block';
  }
}
