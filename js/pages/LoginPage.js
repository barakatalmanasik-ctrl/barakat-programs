function renderLoginPage() {
  const container = document.getElementById('login-content');
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-page__header">
        <button class="auth-page__back" onclick="history.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>
      <div class="auth-page__brand">
        <div class="auth-page__logo">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#C8963E"/><path d="M2 17l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/><path d="M2 12l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/></svg>
        </div>
        <h1 class="auth-page__title">مرحباً بعودتك</h1>
        <p class="auth-page__subtitle">سجّل دخولك لمتابعة رحلاتك وطلباتك</p>
      </div>
      <form class="auth-form" id="login-form" onsubmit="handleLoginForm(event)">
        <div class="auth-form__group">
          <label class="auth-form__label">البريد الإلكتروني</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" class="auth-form__input" id="login-email" placeholder="example@email.com" required dir="ltr" style="text-align:right" autocomplete="email">
          </div>
        </div>
        <div class="auth-form__group">
          <label class="auth-form__label">كلمة المرور</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" class="auth-form__input" id="login-password" placeholder="أدخل كلمة المرور" required autocomplete="current-password">
            <button type="button" class="auth-form__toggle-pass" onclick="togglePasswordVisibility('login-password', this)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="auth-form__row">
          <label class="auth-form__checkbox">
            <input type="checkbox" id="login-remember">
            <span class="auth-form__checkbox-mark"></span>
            تذكر تسجيل الدخول
          </label>
          <a class="auth-form__link" href="#forgot-password">نسيت كلمة المرور؟</a>
        </div>
        <div id="login-error" class="auth-form__error" style="display:none"></div>
        <button type="submit" class="auth-form__submit" id="login-submit">
          <span>تسجيل الدخول</span>
        </button>
      </form>
      <div class="auth-page__footer">
        <p>ليس لديك حساب؟ <a href="#register" class="auth-form__link auth-form__link--bold">إنشاء حساب جديد</a></p>
      </div>
    </div>
  `;
}

async function handleLoginForm(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember').checked;
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  if (!email || !password) {
    errorEl.textContent = 'يرجى ملء جميع الحقول';
    errorEl.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="auth-form__spinner"></span>';
  errorEl.style.display = 'none';

  const result = await AuthService.login(email, password, remember);
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span>تسجيل الدخول</span>';

  if (result.success) {
    window.location.hash = 'more';
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
}
