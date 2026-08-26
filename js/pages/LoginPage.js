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
          <label class="auth-form__label">رقم الهاتف أو البريد الإلكتروني</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" class="auth-form__input" id="login-identifier" placeholder="أدخل رقم الهاتف أو البريد" required autocomplete="username">
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
          <a class="auth-form__link" href="#" onclick="event.preventDefault(); handleForgotPassword()">نسيت كلمة المرور؟</a>
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
  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember').checked;
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  if (!identifier || !password) {
    errorEl.textContent = 'يرجى ملء جميع الحقول';
    errorEl.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="auth-form__spinner"></span>';
  errorEl.style.display = 'none';

  const result = await AuthService.login(identifier, password, remember);
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span>تسجيل الدخول</span>';

  if (result.success) {
    window.location.hash = 'more';
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

async function handleForgotPassword() {
  const email = prompt('أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور:');
  if (!email) return;

  if (AuthService.isSupabase) {
    try {
      const { error } = await SupabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) {
        alert('حدث خطأ: ' + error.message);
      } else {
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      }
    } catch (e) {
      alert('حدث خطأ أثناء إرسال الرابط');
    }
  } else {
    alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (ميزة قادمة قريباً)');
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
