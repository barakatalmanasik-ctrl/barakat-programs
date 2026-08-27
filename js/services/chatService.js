// ChatService - in-app support chat backed by Supabase `conversations`
// and `messages` tables with Realtime subscriptions.
//
// - One conversation per booking (reused, not recreated).
// - Sender types: customer / employee / admin (stored in sender_role).
// - RLS on the DB is the real security boundary; the service just queries.
// - Realtime channels keep chats up-to-date without polling.

const ChatService = {
  _channels: [],
  _listeners: [],

  _uid() {
    const u = AuthService.currentUser;
    return u && u.id ? u.id : null;
  },

  _role() {
    const u = AuthService.currentUser;
    return (u && u.role) || 'customer';
  },

  isStaff() { return ['employee', 'admin'].includes(this._role()); },

  onChange(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _notify() { this._listeners.forEach(l => l()); },

  // ── Conversations ────────────────────────────────────────────
  // Get all conversations visible to the current user.
  // - Customer: own conversations.
  // - Staff: all conversations (optionally filtered by status).
  async getConversations(status) {
    const uid = this._uid();
    const supabase = SupabaseClient;
    if (!uid) return [];

    try {
      let q = supabase
        .from('conversations')
        .select('*, booking:booking_id(order_number)');

      if (this.isStaff()) {
        if (status && status !== 'all') q = q.eq('status', status);
      } else {
        q = q.eq('user_id', uid);
      }

      q = q.order('updated_at', { ascending: false });

      const { data, error } = await q;
      if (error) throw error;

      // Enrich with last message + unread count.
      const enriched = await Promise.all((data || []).map(async (c) => {
        const lastMsg = await this._lastMessage(c.id);
        const unread = await this._countUnread(c.id);
        return {
          ...c,
          lastMessage: lastMsg,
          unreadCount: unread,
          isMine: c.user_id === uid
        };
      }));

      return enriched;
    } catch (e) {
      console.error('Get conversations error:', e);
      return [];
    }
  },

  // Get (or reuse) the conversation for a booking.
  async getOrCreateConversation(bookingId, subject) {
    const uid = this._uid();
    const supabase = SupabaseClient;
    if (!uid) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;
      if (data) return data;

      return await this._insertConversation(uid, bookingId, subject);
    } catch (e) {
      console.error('Get/create conversation error:', e);
      return null;
    }
  },

  async _insertConversation(uid, bookingId, subject) {
    const supabase = SupabaseClient;
    const user = AuthService.currentUser;
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: uid,
        booking_id: bookingId,
        subject: subject || '',
        status: 'open',
        customer_name: (user && user.name) || null,
        customer_phone: (user && user.phone) || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getConversationById(id) {
    const supabase = SupabaseClient;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Get conversation error:', e);
      return null;
    }
  },

  // Always insert a new conversation for the same booking (used by
  // customers to "فتح محادثة جديدة" after a conversation was closed).
  async createNewConversation(bookingId, subject) {
    const uid = this._uid();
    if (!uid) return null;
    try {
      return await this._insertConversation(uid, bookingId, subject);
    } catch (e) {
      console.error('Create new conversation error:', e);
      return null;
    }
  },

  // ── Messages ─────────────────────────────────────────────────
  async getMessages(conversationId, { before, limit = 50 } = {}) {
    const supabase = SupabaseClient;
    try {
      let q = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) q = q.lt('created_at', before);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []).reverse();
    } catch (e) {
      console.error('Get messages error:', e);
      return [];
    }
  },

  async sendMessage(conversationId, message, senderRole) {
    const uid = this._uid();
    const supabase = SupabaseClient;
    if (!uid || !message.trim()) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: uid,
          sender_role: senderRole || this._role(),
          message: message.trim()
        });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Send message error:', e);
      return false;
    }
  },

  // Mark all messages from the other party as read (read_at = now).
  async markConversationRead(conversationId) {
    const uid = this._uid();
    const role = this._role();
    const supabase = SupabaseClient;
    if (!uid) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', uid)
        .is('read_at', null);
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Mark read error:', e);
    }
  },

  async updateConversationStatus(conversationId, status) {
    const supabase = SupabaseClient;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId);
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error('Update conversation status error:', e);
      return { success: false, error: e.message };
    }
  },

  async assignConversation(conversationId, employeeId) {
    const supabase = SupabaseClient;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ assigned_employee: employeeId || null })
        .eq('id', conversationId);
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error('Assign conversation error:', e);
      return { success: false, error: e.message };
    }
  },

  // ── Realtime ─────────────────────────────────────────────────
  // Subscribe a conversation's messages channel. Returns unsubscribe fn.
  subscribeToMessages(conversationId, onMessage) {
    const client = SupabaseClient.client;
    if (!client) return () => {};

    const channel = client
      .channel('chat-' + conversationId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => { onMessage(payload.new); }
      )
      .subscribe();

    this._channels.push(channel);
    return () => client.removeChannel(channel);
  },

  // Subscribe to any conversation inserted (for staff list refresh).
  subscribeToConversations(onChange) {
    const client = SupabaseClient.client;
    if (!client) return () => {};

    const channel = client
      .channel('conversations-all')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        () => onChange()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => onChange()
      )
      .subscribe();

    this._channels.push(channel);
    return () => client.removeChannel(channel);
  },

  // ── Internal helpers ─────────────────────────────────────────
  async _lastMessage(conversationId) {
    const supabase = SupabaseClient;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('message, sender_role, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) return null;
      return data;
    } catch (e) { return null; }
  },

  async _countUnread(conversationId) {
    const uid = this._uid();
    const supabase = SupabaseClient;
    if (!uid) return 0;
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', uid)
        .is('read_at', null);
      if (error) throw error;
      return count || 0;
    } catch (e) { return 0; }
  }
};
