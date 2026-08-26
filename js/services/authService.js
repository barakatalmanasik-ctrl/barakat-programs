// AuthService - Supabase Auth with localStorage fallback
// Same API surface for all existing pages

const AuthService = {
  _user: null,
  _listeners: [],
  _useSupabase: false,
  _initialized: false,

  async init() {
    // Try Supabase first
    try {
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured) {
        this._useSupabase = true;
        const { data: { session } } = await SupabaseClient.auth.getSession();
        if (session?.user) {
          await this._fetchProfile(session.user);
        }
        // Listen for auth state changes
        SupabaseClient.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await this._fetchProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            this._user = null;
            this._notify();
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            await this._fetchProfile(session.user);
          }
        });
      } else {
        this._loadFromStorage();
      }
    } catch (e) {
      console.error('Supabase init error:', e);
      this._useSupabase = false;
      this._loadFromStorage();
    }
    this._initialized = true;
  },

  _loadFromStorage() {
    const saved = localStorage.getItem('barakat_user');
    if (saved) {
      try { this._user = JSON.parse(saved); } catch(e) { this._user = null; }
    }
  },

  get currentUser() { return this._user; },
  get isLoggedIn() { return !!this._user; },
  get isSupabase() { return this._useSupabase; },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() {
    this._listeners.forEach(l => l(this._user));
  },

  _save() {
    if (!this._useSupabase) {
      if (this._user) {
        localStorage.setItem('barakat_user', JSON.stringify(this._user));
      } else {
        localStorage.removeItem('barakat_user');
      }
    }
  },

  async _fetchProfile(authUser) {
    if (!this._useSupabase) return;
    try {
      const { data, error } = await SupabaseClient
        .from('profiles')
        .select('id, full_name, phone, email, avatar_url, role, created_at')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      this._user = {
        id: data.id,
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatar_url,
        role: data.role,
        createdAt: data.created_at
      };
      this._notify();
    } catch (e) {
      console.error('Profile fetch error:', e);
      this._user = {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        email: authUser.email,
        phone: authUser.user_metadata?.phone || null,
        createdAt: authUser.created_at
      };
      this._notify();
    }
  },

  async login(identifier, password, remember) {
    if (this._useSupabase) {
      return this._loginSupabase(identifier, password);
    }
    return this._loginLocal(identifier, password);
  },

  async _loginSupabase(identifier, password) {
    try {
      const { data, error } = await SupabaseClient.auth.signInWithPassword({
        email: identifier,
        password: password
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login')) msg = 'بيانات الدخول غير صحيحة';
        if (msg.includes('Email not confirmed')) msg = 'يرجى تأكيد البريد الإلكتروني أولاً';
        return { success: false, error: msg };
      }

      await this._fetchProfile(data.user);
      return { success: true, user: this._user };
    } catch (e) {
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  },

  async _loginLocal(identifier, password) {
    await this._simulateDelay();
    const users = this._getUsers();
    const user = users.find(u =>
      (u.email === identifier || u.phone === identifier) && u.password === password
    );
    if (!user) {
      return { success: false, error: 'بيانات الدخول غير صحيحة' };
    }
    this._user = { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt };
    this._save();
    this._notify();
    return { success: true, user: this._user };
  },

  async register(data) {
    if (this._useSupabase) {
      return this._registerSupabase(data);
    }
    return this._registerLocal(data);
  },

  async _registerSupabase(data) {
    try {
      const { data: authData, error } = await SupabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone
          }
        }
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('already registered')) msg = 'البريد الإلكتروني مسجل مسبقاً';
        if (msg.includes('valid email')) msg = 'البريد الإلكتروني غير صحيح';
        return { success: false, error: msg };
      }

      if (authData.user && !authData.session) {
        return { success: true, user: null, message: 'تم إنشاء الحساب بنجاح. يرجى تأكيد البريد الإلكتروني.' };
      }

      if (authData.user) {
        await this._fetchProfile(authData.user);
      }
      return { success: true, user: this._user };
    } catch (e) {
      return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  },

  async _registerLocal(data) {
    await this._simulateDelay();
    const users = this._getUsers();
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    if (users.find(u => u.phone === data.phone)) {
      return { success: false, error: 'رقم الهاتف مسجل مسبقاً' };
    }
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this._saveUsers(users);
    this._user = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, createdAt: newUser.createdAt };
    this._save();
    this._notify();
    return { success: true, user: this._user };
  },

  async updateProfile(data) {
    if (this._useSupabase) {
      return this._updateProfileSupabase(data);
    }
    return this._updateProfileLocal(data);
  },

  async _updateProfileSupabase(data) {
    if (!this._user) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const updates = {};
      if (data.name) updates.full_name = data.name;
      if (data.phone !== undefined) updates.phone = data.phone;

      const { error } = await SupabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', this._user.id);

      if (error) {
        return { success: false, error: 'حدث خطأ أثناء تحديث البيانات' };
      }

      // Refresh profile
      const { data: profile } = await SupabaseClient
        .from('profiles')
        .select('id, full_name, phone, email, avatar_url, role, created_at')
        .eq('id', this._user.id)
        .single();

      if (profile) {
        this._user = {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          role: profile.role,
          createdAt: profile.created_at
        };
        this._notify();
      }
      return { success: true, user: this._user };
    } catch (e) {
      return { success: false, error: 'حدث خطأ أثناء تحديث البيانات' };
    }
  },

  async _updateProfileLocal(data) {
    await this._simulateDelay();
    if (!this._user) return { success: false, error: 'غير مسجل الدخول' };
    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === this._user.id);
    if (idx === -1) return { success: false, error: 'المستخدم غير موجود' };
    if (data.email && data.email !== this._user.email) {
      if (users.find(u => u.email === data.email && u.id !== this._user.id)) {
        return { success: false, error: 'البريد الإلكتروني مستخدم من حساب آخر' };
      }
    }
    if (data.phone && data.phone !== this._user.phone) {
      if (users.find(u => u.phone === data.phone && u.id !== this._user.id)) {
        return { success: false, error: 'رقم الهاتف مستخدم من حساب آخر' };
      }
    }
    Object.assign(users[idx], data);
    this._saveUsers(users);
    this._user = { id: users[idx].id, name: users[idx].name, email: users[idx].email, phone: users[idx].phone, createdAt: users[idx].createdAt };
    this._save();
    this._notify();
    return { success: true, user: this._user };
  },

  async changePassword(currentPass, newPass) {
    if (this._useSupabase) {
      return this._changePasswordSupabase(newPass);
    }
    return this._changePasswordLocal(currentPass, newPass);
  },

  async _changePasswordSupabase(newPass) {
    if (!this._user) return { success: false, error: 'غير مسجل الدخول' };
    try {
      const { error } = await SupabaseClient.auth.updateUser({
        password: newPass
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: 'حدث خطأ أثناء تغيير كلمة المرور' };
    }
  },

  async _changePasswordLocal(currentPass, newPass) {
    await this._simulateDelay();
    if (!this._user) return { success: false, error: 'غير مسجل الدخول' };
    const users = this._getUsers();
    const idx = users.findIndex(u => u.id === this._user.id);
    if (idx === -1) return { success: false, error: 'المستخدم غير موجود' };
    if (users[idx].password !== currentPass) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    users[idx].password = newPass;
    this._saveUsers(users);
    return { success: true };
  },

  async logout() {
    if (this._useSupabase) {
      try { await SupabaseClient.auth.signOut(); } catch(e) {}
    }
    this._user = null;
    this._save();
    this._notify();
  },

  _getUsers() {
    const data = localStorage.getItem('barakat_users');
    try { return data ? JSON.parse(data) : []; } catch(e) { return []; }
  },

  _saveUsers(users) {
    localStorage.setItem('barakat_users', JSON.stringify(users));
  },

  _simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
  }
};
