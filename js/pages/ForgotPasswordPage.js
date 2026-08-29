function renderForgotPasswordPage() {
  const container = document.getElementById('forgot-password-content');
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-page__header">
        <button class="auth-page__back" onclick="Router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>
      <div class="auth-page__brand">
        <div class="auth-page__logo">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#C8963E"/><path d="M2 17l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/><path d="M2 12l10 5 10-5" stroke="#C8963E" stroke-width="2" fill="none"/></svg>
        </div>
        <h1 class="auth-page__title">نسيت كلمة المرور؟</h1>
        <p class="auth-page__subtitle">أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة التعيين</p>
      </div>
      <form class="auth-form" id="forgot-password-form" onsubmit="handleForgotPasswordForm(event)">
        <div class="auth-form__group">
          <label class="auth-form__label">البريد الإلكتروني</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" class="auth-form__input" id="forgot-email" placeholder="example@email.com" required dir="ltr" style="text-align:right">
          </div>
        </div>
        <div id="forgot-error" class="auth-form__error" style="display:none"></div>
        <div id="forgot-success" class="auth-form__success" style="display:none"></div>
        <button type="submit" class="auth-form__submit" id="forgot-submit">
          <span>إرسال رابط إعادة التعيين</span>
        </button>
      </form>
      <div class="auth-page__footer">
        <p><a href="#login" class="auth-form__link auth-form__link--bold">العودة لتسجيل الدخول</a></p>
      </div>
    </div>
  `;
}

async function handleForgotPasswordForm(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const errorEl = document.getElementById('forgot-error');
  const successEl = document.getElementById('forgot-success');
  const submitBtn = document.getElementById('forgot-submit');

  if (!email) {
    errorEl.textContent = 'يرجى إدخال البريد الإلكتروني';
    errorEl.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="auth-form__spinner"></span>';
  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (AuthService.isSupabase) {
    try {
      const { error } = await SupabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>إرسال رابط إعادة التعيين</span>';

      if (error) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
      } else {
        successEl.textContent = 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى فحص صندوق الوارد.';
        successEl.style.display = 'block';
      }
    } catch (e) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>إرسال رابط إعادة التعيين</span>';
      errorEl.textContent = 'حدث خطأ أثناء إرسال الرابط';
      errorEl.style.display = 'block';
    }
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>إرسال رابط إعادة التعيين</span>';
    successEl.textContent = 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (ميزة قادمة قريباً)';
    successEl.style.display = 'block';
  }
}
