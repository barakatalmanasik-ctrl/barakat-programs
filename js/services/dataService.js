// Phase 3: Supabase-backed Favorites, Notifications, and Orders services.
// Keeps the same API surface used by pages, but syncs to Supabase tables
// (favorites / notifications / bookings) when Supabase is configured.
// Falls back to localStorage when Supabase is unavailable.

function _sb() {
  return (typeof SupabaseClient !== 'undefined' && SupabaseClient.isConfigured)
    ? SupabaseClient
    : null;
}

function _currentUserId() {
  const user = AuthService.currentUser;
  return user ? user.id : null;
}

const FavoritesService = {
  _favorites: [],
  _listeners: [],
  _synced: false,

  async init() {
    this._loadFromStorage();
    if (_sb()) {
      await this.syncFromServer();
    }
  },

  _loadFromStorage() {
    const saved = localStorage.getItem('barakat_favorites');
    try { this._favorites = saved ? JSON.parse(saved) : []; } catch(e) { this._favorites = []; }
  },

  async syncFromServer() {
    const uid = _currentUserId();
    const supabase = _sb();
    if (!supabase || !uid) { this._synced = false; return; }
    try {
      const { data, error } = await supabase.from('favorites').select('program_id').eq('user_id', uid);
      if (error) throw error;
      const ids = (data || []).map(r => String(r.program_id));
      const localIds = this._favorites;
      // Merge server + local, then persist back
      this._favorites = Array.from(new Set([...localIds, ...ids]));
      this._synced = true;
      this._save();
      this._notify();
    } catch (e) {
      console.error('Favorites sync error:', e);
      this._synced = false;
    }
  },

  getAll() { return [...this._favorites]; },
  isFavorite(programId) { return this._favorites.includes(String(programId)); },

  toggle(programId) {
    programId = String(programId);
    const idx = this._favorites.indexOf(programId);
    let added;
    if (idx > -1) {
      this._favorites.splice(idx, 1);
      added = false;
    } else {
      this._favorites.push(programId);
      added = true;
    }
    this._save();
    this._notify();
    this._syncToggle(programId, added);
    return added;
  },

  _syncToggle(programId, added) {
    const supabase = _sb();
    const uid = _currentUserId();
    if (!supabase || !uid) return;
    (async () => {
      try {
        if (added) {
          await supabase.from('favorites').insert({
            user_id: uid,
            program_id: programId
          });
        } else {
          await supabase.from('favorites').delete()
            .eq('user_id', uid)
            .eq('program_id', programId);
        }
      } catch (e) {
        console.error('Favorites toggle sync error:', e);
      }
    })();
  },

  remove(programId) {
    programId = String(programId);
    const idx = this._favorites.indexOf(programId);
    if (idx > -1) {
      this._favorites.splice(idx, 1);
      this._save();
      this._notify();
    }
    const supabase = _sb();
    const uid = _currentUserId();
    if (!supabase || !uid) return;
    (async () => {
      try {
        await supabase.from('favorites').delete()
          .eq('user_id', uid)
          .eq('program_id', programId);
      } catch (e) {
        console.error('Favorites remove sync error:', e);
      }
    })();
  },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() { this._listeners.forEach(l => l(this._favorites)); },

  _save() { localStorage.setItem('barakat_favorites', JSON.stringify(this._favorites)); }
};

const NotificationsService = {
  _notifications: [],
  _listeners: [],
  _synced: false,

  async init() {
    this._loadFromStorage();
    if (_sb()) {
      await this.syncFromServer();
    }
  },

  _loadFromStorage() {
    const saved = localStorage.getItem('barakat_notifications');
    try { this._notifications = saved ? JSON.parse(saved) : []; } catch(e) { this._notifications = []; }
  },

  async syncFromServer() {
    const uid = _currentUserId();
    const supabase = _sb();
    if (!supabase || !uid) { this._synced = false; return; }
    try {
      const { data, error } = await supabase.from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      this._notifications = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.is_read,
        timestamp: n.created_at
      }));
      this._synced = true;
      this._save();
      this._notify();
    } catch (e) {
      console.error('Notifications sync error:', e);
      this._synced = false;
    }
  },

  getAll() { return [...this._notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); },
  getUnreadCount() { return this._notifications.filter(n => !n.read).length; },

  async markAsRead(id) {
    const n = this._notifications.find(x => x.id === id);
    if (!n) return;
    n.read = true;
    this._save();
    this._notify();

    const supabase = _sb();
    const uid = _currentUserId();
    if (!supabase || !uid) return;
    try {
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', uid);
    } catch (e) { console.error('Notification read sync error:', e); }
  },

  async markAllAsRead() {
    this._notifications.forEach(n => n.read = true);
    this._save();
    this._notify();

    const supabase = _sb();
    const uid = _currentUserId();
    if (!supabase || !uid) return;
    try {
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', uid)
        .eq('is_read', false);
    } catch (e) { console.error('Notification mark-all sync error:', e); }
  },

  async remove(id) {
    const existed = this._notifications.some(n => n.id === id);
    this._notifications = this._notifications.filter(n => n.id !== id);
    this._save();
    this._notify();

    const supabase = _sb();
    const uid = _currentUserId();
    if (!supabase || !uid || !existed) return;
    try {
      await supabase.from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', uid);
    } catch (e) { console.error('Notification delete sync error:', e); }
  },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() { this._listeners.forEach(l => l(this._notifications)); },

  _save() { localStorage.setItem('barakat_notifications', JSON.stringify(this._notifications)); }
};

const OrdersService = {
  _orders: [],
  _listeners: [],

  init() {
    const saved = localStorage.getItem('barakat_orders');
    try { this._orders = saved ? JSON.parse(saved) : []; } catch(e) { this._orders = []; }
  },

  getOrdersByUser(userId) {
    return this._orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  getOrder(orderId) {
    return this._orders.find(o => o.orderId === orderId);
  },

  createOrder(programId, travelers) {
    const user = AuthService.currentUser;
    if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    const program = MockData.programs.find(p => p.id === programId);
    if (!program) return { success: false, error: 'البرنامج غير موجود' };
    const order = {
      orderId: 'ORD-' + Date.now().toString().slice(-6),
      userId: user.id,
      programId: program.id,
      programName: program.name,
      destination: program.destination,
      destinationEmoji: program.destinationEmoji,
      departureDate: program.dateDisplay,
      status: 'pending_review',
      travelers: travelers || 1,
      totalPrice: program.price * (travelers || 1),
      currency: program.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: ''
    };
    this._orders.push(order);
    this._save();
    this._notify();
    return { success: true, order };
  },

  cancelOrder(orderId) {
    const order = this._orders.find(o => o.orderId === orderId);
    if (order && order.status === 'pending_review') {
      order.status = 'cancelled';
      order.updatedAt = new Date().toISOString();
      this._save();
      this._notify();
      return true;
    }
    return false;
  },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() { this._listeners.forEach(l => l(this._orders)); },

  _save() { localStorage.setItem('barakat_orders', JSON.stringify(this._orders)); }
};
