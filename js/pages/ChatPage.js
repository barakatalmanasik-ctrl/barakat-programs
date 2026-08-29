// ChatPage - renders a single conversation thread with realtime updates.
// Used by both customers and staff/admin. RLS enforces who can see it.
// Read receipts: messages from the other party are marked read on load/focus.

let _chatUnsub = null;

async function renderChatPage(conversationId) {
  const container = document.getElementById('chat-content');
  if (!container) return;

  const conv = await ChatService.getConversationById(conversationId);
  if (!conv) {
    container.innerHTML = `
      <div class="chat-page">
        <div class="chat-page__header">
          <button class="chat-page__back" onclick="Router.back()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 class="chat-page__title">المحادثة</h1>
        </div>
        <div class="chat-page__empty">تعذر فتح هذه المحادثة</div>
      </div>
    `;
    return;
  }

  const user = AuthService.currentUser;
  const title = conv.subject || (conv.booking_id ? 'بخصوص الحجز' : 'محادثة');
  const isClosed = conv.status === 'closed';

  container.innerHTML = `
    <div class="chat-page">
      <div class="chat-page__header">
        <button class="chat-page__back" onclick="Router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div class="chat-page__title-wrap">
          <h1 class="chat-page__title">${escapeHtml(title)}</h1>
          <span class="chat-page__status chat-page__status--${conv.status}">${getConversationStatusLabel(conv.status)}</span>
        </div>
      </div>

      ${isClosed ? `
        <div class="chat-page__closed-banner">
          <span>تم إغلاق هذه المحادثة.</span>
          ${user && user.id === conv.user_id ? `<button class="chat-page__reopen" onclick="openNewConversation('${conv.booking_id}', '${escapeHtml(title)}')">فتح محادثة جديدة</button>` : ''}
        </div>
      ` : ''}

      <div class="chat-page__messages" id="chat-messages">
        <div class="chat-page__loading">جاري تحميل الرسائل...</div>
      </div>

      <div class="chat-page__composer" id="chat-composer">
        <textarea class="chat-page__input" id="chat-input" rows="1" placeholder="اكتب رسالتك..." ${isClosed ? 'disabled' : ''}></textarea>
        <button class="chat-page__send" id="chat-send" onclick="sendChatMessage()" ${isClosed ? 'disabled' : ''}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;

  window._currentChat = { conversationId, bookingId: conv.booking_id, subject: title, meId: user && user.id };

  bindChatInput(conv, isClosed);
  await loadChatMessages(conversationId);
  if (_chatUnsub) {
    try { _chatUnsub(); } catch (e) {}
    _chatUnsub = null;
  }
  _chatUnsub = ChatService.subscribeToMessages(conversationId, onChatMessage);
  ChatService.markConversationRead(conversationId);
}

function bindChatInput(conv, isClosed) {
  if (isClosed) return;
  const input = document.getElementById('chat-input');
  if (!input) return;
  const send = document.getElementById('chat-send');
  const doSend = () => sendChatMessage();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });
}

function onChatMessage() {
  loadChatMessages(window._currentChat.conversationId);
  ChatService.markConversationRead(window._currentChat.conversationId);
}

async function loadChatMessages(conversationId) {
  const box = document.getElementById('chat-messages');
  if (!box) return;
  const messages = await ChatService.getMessages(conversationId);
  const meId = window._currentChat.meId;
  box.innerHTML = messages.map(m => `
    <div class="chat-bubble chat-bubble--${m.sender_id === meId ? 'mine' : 'theirs'}">
      <div class="chat-bubble__text">${escapeHtml(m.message)}</div>
      <div class="chat-bubble__meta">
        ${formatChatTime(m.created_at)}
        ${m.sender_id === meId ? (m.read_at ? '<span class="chat-bubble__read">✓✓ مقروءة</span>' : '<span class="chat-bubble__sent">✓</span>') : `<span class="chat-bubble__sender">${m.sender_role === 'customer' ? 'العميل' : 'الدعم'}</span>`}
      </div>
    </div>
  `).join('') || '<div class="chat-page__empty">لا توجد رسائل بعد، ابدأ المحادثة!</div>';

  box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = (input ? input.value : '').trim();
  const conv = window._currentChat;
  if (!text || !conv) return;

  const ok = await ChatService.sendMessage(conv.conversationId, text);
  if (ok) {
    input.value = '';
    input.style.height = 'auto';
    // Realtime will push it back; also update locally for snappiness.
    onChatMessage();
  }
}

async function openNewConversation(bookingId, subject) {
  const conv = await ChatService.createNewConversation(bookingId, subject);
  if (conv) {
    Router.go('chat/' + conv.id);
  } else {
    navigateToBookingHome();
  }
}

function navigateToBookingHome() {
  Router.go('orders');
}

// Called by the router when leaving the chat page to stop realtime
// subscriptions (prevents duplicate listeners on re-entry and freezes).
function cleanupChatPage() {
  if (_chatUnsub) {
    try { _chatUnsub(); } catch (e) {}
    _chatUnsub = null;
  }
}

function getConversationStatusLabel(status) {
  const map = {
    open: 'مفتوحة', pending: 'قيد الانتظار', resolved: 'تم الرد', closed: 'مغلقة'
  };
  return map[status] || status;
}

function formatChatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }) + ' ' +
         d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
