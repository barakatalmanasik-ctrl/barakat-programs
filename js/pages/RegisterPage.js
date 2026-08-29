function renderRegisterPage() {
  const container = document.getElementById('register-content');
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
        <h1 class="auth-page__title">إنشاء حساب جديد</h1>
        <p class="auth-page__subtitle">انضم إلى بركات المناسك واستمتع بأفضل العروض</p>
      </div>
      <form class="auth-form" id="register-form" onsubmit="handleRegisterForm(event)">
        <div class="auth-form__group">
          <label class="auth-form__label">الاسم الكامل</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" class="auth-form__input" id="reg-name" placeholder="أدخل اسمك الكامل" required>
          </div>
        </div>
        <div class="auth-form__group">
          <label class="auth-form__label">رقم الهاتف</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input type="tel" class="auth-form__input" id="reg-phone" placeholder="05XXXXXXXX" required dir="ltr" style="text-align:right">
          </div>
        </div>
        <div class="auth-form__group">
          <label class="auth-form__label">البريد الإلكتروني</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" class="auth-form__input" id="reg-email" placeholder="example@email.com" required dir="ltr" style="text-align:right">
          </div>
        </div>
        <div class="auth-form__group">
          <label class="auth-form__label">كلمة المرور</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" class="auth-form__input" id="reg-password" placeholder="6 أحرف على الأقل" required minlength="6">
            <button type="button" class="auth-form__toggle-pass" onclick="togglePasswordVisibility('reg-password', this)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <div class="auth-form__strength" id="password-strength"></div>
        </div>
        <div class="auth-form__group">
          <label class="auth-form__label">تأكيد كلمة المرور</label>
          <div class="auth-form__input-wrapper">
            <svg class="auth-form__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" class="auth-form__input" id="reg-password-confirm" placeholder="أعد إدخال كلمة المرور" required minlength="6">
          </div>
        </div>
        <div class="auth-form__group">
          <label class="auth-form__checkbox">
            <input type="checkbox" id="reg-agree" required>
            <span class="auth-form__checkbox-mark"></span>
            أوافق على <a href="#terms" class="auth-form__link">الشروط والأحكام</a> و<a href="#privacy" class="auth-form__link">سياسة الخصوصية</a>
          </label>
        </div>
        <div id="register-error" class="auth-form__error" style="display:none"></div>
        <button type="submit" class="auth-form__submit" id="register-submit">
          <span>إنشاء الحساب</span>
        </button>
      </form>
      <div class="auth-page__footer">
        <p>لديك حساب بالفعل؟ <a href="#login" class="auth-form__link auth-form__link--bold">تسجيل الدخول</a></p>
      </div>
    </div>
  `;

  const passInput = document.getElementById('reg-password');
  if (passInput) {
    passInput.addEventListener('input', function() {
      updatePasswordStrength(this.value);
    });
  }
}

function updatePasswordStrength(password) {
  const el = document.getElementById('password-strength');
  if (!el) return;
  if (!password) { el.innerHTML = ''; return; }
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'ضعيفة جداً', class: 'weak', width: '20%' },
    { label: 'ضعيفة', class: 'weak', width: '40%' },
    { label: 'متوسطة', class: 'medium', width: '60%' },
    { label: 'جيدة', class: 'good', width: '80%' },
    { label: 'ممتازة', class: 'strong', width: '100%' }
  ];
  const level = levels[Math.min(score, 4)];
  el.innerHTML = `
    <div class="auth-form__strength-bar">
      <div class="auth-form__strength-fill auth-form__strength-fill--${level.class}" style="width:${level.width}"></div>
    </div>
    <span class="auth-form__strength-text auth-form__strength-text--${level.class}">${level.label}</span>
  `;
}

async function handleRegisterForm(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-password-confirm').value;
  const errorEl = document.getElementById('register-error');
  const successEl = document.getElementById('register-success');
  const submitBtn = document.getElementById('register-submit');

  if (password !== confirm) {
    errorEl.textContent = 'كلمتا المرور غير متطابقتين';
    errorEl.style.display = 'block';
    if (successEl) successEl.style.display = 'none';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    errorEl.style.display = 'block';
    if (successEl) successEl.style.display = 'none';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="auth-form__spinner"></span>';
  errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  const result = await AuthService.register({ name, phone, email, password });
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span>إنشاء الحساب</span>';

  if (result.success) {
    if (result.message) {
      // Supabase: email verification required
      const container = document.getElementById('register-form');
      if (container) {
        container.innerHTML = `
          <div class="auth-form__success" style="display:block; text-align:center; padding: 32px 16px;">
            <div style="font-size: 48px; margin-bottom: 16px;">✉️</div>
            <h3 style="margin-bottom: 8px; color: var(--color-text-primary);">تم إنشاء الحساب بنجاح!</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 24px;">${result.message}</p>
            <a href="#login" class="auth-form__submit" style="display:inline-block; text-decoration:none;">الذهاب لتسجيل الدخول</a>
          </div>
        `;
      }
    } else {
      Router.go('more');
    }
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}
