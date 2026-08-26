const FavoritesService = {
  _favorites: [],
  _listeners: [],

  init() {
    const saved = localStorage.getItem('barakat_favorites');
    try { this._favorites = saved ? JSON.parse(saved) : []; } catch(e) { this._favorites = []; }
  },

  getAll() { return [...this._favorites]; },
  isFavorite(programId) { return this._favorites.includes(programId); },

  toggle(programId) {
    const idx = this._favorites.indexOf(programId);
    if (idx > -1) {
      this._favorites.splice(idx, 1);
    } else {
      this._favorites.push(programId);
    }
    this._save();
    this._notify();
    return this._favorites.includes(programId);
  },

  remove(programId) {
    const idx = this._favorites.indexOf(programId);
    if (idx > -1) {
      this._favorites.splice(idx, 1);
      this._save();
      this._notify();
    }
  },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() {
    this._listeners.forEach(l => l(this._favorites));
  },

  _save() {
    localStorage.setItem('barakat_favorites', JSON.stringify(this._favorites));
  }
};

const NotificationsService = {
  _notifications: [],
  _listeners: [],

  init() {
    const saved = localStorage.getItem('barakat_notifications');
    try { this._notifications = saved ? JSON.parse(saved) : []; } catch(e) { this._notifications = []; }
    if (this._notifications.length === 0) {
      this._notifications = this._getDefaultNotifications();
      this._save();
    }
  },

  getAll() { return [...this._notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); },
  getUnreadCount() { return this._notifications.filter(n => !n.read).length; },

  markAsRead(id) {
    const n = this._notifications.find(n => n.id === id);
    if (n) { n.read = true; this._save(); this._notify(); }
  },

  markAllAsRead() {
    this._notifications.forEach(n => n.read = true);
    this._save();
    this._notify();
  },

  remove(id) {
    this._notifications = this._notifications.filter(n => n.id !== id);
    this._save();
    this._notify();
  },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() {
    this._listeners.forEach(l => l(this._notifications));
  },

  _save() {
    localStorage.setItem('barakat_notifications', JSON.stringify(this._notifications));
  },

  _getDefaultNotifications() {
    return [
      { id: '1', title: 'مرحباً بك في بركات المناسك', message: 'اكتشف أجمل البرامج السياحية والدينية معنا', type: 'welcome', read: false, timestamp: new Date().toISOString() },
      { id: '2', title: 'عرض خاص - خصم 15%', message: 'استمتع بخصم 15% على رحلات دبي هذا الشهر', type: 'promo', read: false, timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', title: 'برامج جديدة متاحة', message: 'تم إضافة برامج جديدة لماليزيا وتايلاند', type: 'update', read: true, timestamp: new Date(Date.now() - 172800000).toISOString() }
    ];
  }
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

  _notify() {
    this._listeners.forEach(l => l(this._orders));
  },

  _save() {
    localStorage.setItem('barakat_orders', JSON.stringify(this._orders));
  }
};
