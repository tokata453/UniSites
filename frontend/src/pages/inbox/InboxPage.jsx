import { useEffect, useMemo, useRef, useState } from 'react';
import { authApi, inboxApi } from '@/api';
import { useAuth, useToast } from '@/hooks';
import { useInboxStore } from '@/store/inboxStore';

const shell = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';

function EmptyBlock({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

function timeLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString();
}

export default function InboxPage() {
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useToast();
  const setUnreadNotifications = useInboxStore((s) => s.setUnreadNotifications);
  const setUnreadMessages = useInboxStore((s) => s.setUnreadMessages);
  const [tab, setTab] = useState('chats');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [composeEmail, setComposeEmail] = useState('');
  const [composeQuery, setComposeQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [composeMessage, setComposeMessage] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const selectedIdRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId]
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await authApi.getNotifications();
      const nextUnreadCount = res.data.unreadCount || 0;
      setNotifications(res.data.notifications || []);
      setUnreadCount(nextUnreadCount);
      setUnreadNotifications(nextUnreadCount);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadConversations = async (nextSelectedId = null) => {
    setLoadingChats(true);
    try {
      const res = await inboxApi.getConversations();
      const items = res.data.conversations || [];
      const nextUnreadMessages = items.reduce(
        (sum, item) => sum + Number(item.unreadCount || 0),
        0
      );
      setConversations(items);
      const fallbackId = nextSelectedId || selectedId || items[0]?.id || null;
      setSelectedId(fallbackId);
      setUnreadMessages(nextUnreadMessages);
    } catch (err) {
      setConversations([]);
      setUnreadMessages(0);
      error(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const res = await inboxApi.getMessages(conversationId);
      setMessages(res.data.messages || []);
      await inboxApi.markConversationRead(conversationId);
      loadConversations(conversationId);
      loadNotifications();
    } catch (err) {
      setMessages([]);
      error(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;

    let active = true;
    let socket;
    let cleanup;

    const initSocket = async () => {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const socketBase = apiBase.replace(/\/api\/?$/, '');
      const scriptSrc = `${socketBase}/socket.io/socket.io.js`;

      const ensureScript = () => new Promise((resolve, reject) => {
        if (window.io) {
          resolve(window.io);
          return;
        }
        const existing = document.querySelector(`script[data-socket-io="true"][src="${scriptSrc}"]`);
        if (existing) {
          existing.addEventListener('load', () => resolve(window.io), { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.async = true;
        script.dataset.socketIo = 'true';
        script.onload = () => resolve(window.io);
        script.onerror = reject;
        document.body.appendChild(script);
      });

      try {
        const ioFactory = await ensureScript();
        if (!active || !ioFactory) return;
        socket = ioFactory(socketBase, { withCredentials: true });
        socket.on('connect', () => socket.emit('join_user', user.id));
        socket.on('message:new', ({ conversationId }) => {
          const currentSelectedId = selectedIdRef.current;
          loadConversations(conversationId || currentSelectedId);
          loadNotifications();
          if (conversationId && conversationId === currentSelectedId) loadMessages(conversationId);
        });
        cleanup = () => {
          socket.emit('leave_user', user.id);
          socket.disconnect();
        };
      } catch (_) {
        // Realtime is additive; ignore script load issues.
      }
    };

    initSocket();

    return () => {
      active = false;
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    if (!composeQuery.trim()) {
      setUserResults([]);
      setSelectedRecipient(null);
      return undefined;
    }

    const handle = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await inboxApi.searchUsers(composeQuery.trim());
        setUserResults(res.data.users || []);
      } catch (err) {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [composeQuery, isAuthenticated]);

  useEffect(() => {
    if (tab === 'chats' && selectedId) loadMessages(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tab]);

  const startConversation = async () => {
    if (!(selectedRecipient?.id || composeEmail.trim()) || !composeMessage.trim()) return;
    setCreating(true);
    try {
      const res = await inboxApi.createConversation({
        recipient_id: selectedRecipient?.id,
        recipient_email: selectedRecipient?.id ? undefined : composeEmail.trim(),
        message: composeMessage.trim(),
      });
      const conversationId = res.data.conversation?.id;
      setComposeEmail('');
      setComposeQuery('');
      setSelectedRecipient(null);
      setUserResults([]);
      setComposeMessage('');
      success('Conversation started');
      await loadConversations(conversationId);
      setTab('chats');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedId || !draftMessage.trim()) return;
    setSending(true);
    try {
      await inboxApi.sendMessage(selectedId, { body: draftMessage.trim() });
      setDraftMessage('');
      await loadMessages(selectedId);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await authApi.markNotificationsRead();
      success('Notifications marked as read');
      loadNotifications();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update notifications');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <EmptyBlock title="Please sign in to use your inbox" description="Chat with other users and keep track of notifications in one place." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inbox</h1>
          <p className="mt-1 text-sm text-slate-500">Messages and notifications for {user?.name}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab('chats')} className={tab === 'chats' ? primaryBtn : secondaryBtn}>
            Chats
          </button>
          <button type="button" onClick={() => setTab('notifications')} className={tab === 'notifications' ? primaryBtn : secondaryBtn}>
            Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        </div>
      </div>

      {tab === 'notifications' ? (
        <div className={`${shell} p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
              <p className="text-sm text-slate-500">System alerts and message notifications.</p>
            </div>
            <button type="button" onClick={markNotificationsRead} className={secondaryBtn}>Mark all read</button>
          </div>
          {loadingNotifications ? (
            <p className="text-sm text-slate-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <EmptyBlock title="No notifications yet" description="We’ll show message alerts and platform updates here." />
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className={`rounded-2xl border p-4 ${item.is_read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      {item.message && <p className="mt-1 text-sm text-slate-600">{item.message}</p>}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>{item.type}</span>
                        <span>{timeLabel(item.createdAt || item.created_at)}</span>
                      </div>
                    </div>
                    {item.link && (
                      <a href={item.link} className="text-sm font-semibold text-[#1B3A6B] hover:underline">
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className={`${shell} p-5 space-y-5`}>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Start a chat</h2>
              <p className="mt-1 text-sm text-slate-500">Search for a registered user and send the first message.</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  className={input}
                  value={selectedRecipient ? `${selectedRecipient.name} (${selectedRecipient.email})` : composeQuery}
                  onChange={(e) => {
                    setSelectedRecipient(null);
                    setComposeQuery(e.target.value);
                    setComposeEmail(e.target.value);
                  }}
                  placeholder="Search by name or email"
                />
                {!selectedRecipient && (searchingUsers || userResults.length > 0) && (
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                    {searchingUsers ? (
                      <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
                    ) : userResults.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-500">No matching users found.</p>
                    ) : (
                      userResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedRecipient(item);
                            setComposeEmail(item.email);
                            setComposeQuery('');
                            setUserResults([]);
                          }}
                          className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <textarea className={`${input} resize-y`} rows={4} value={composeMessage} onChange={(e) => setComposeMessage(e.target.value)} placeholder="Write your first message..." />
              <button type="button" onClick={startConversation} disabled={creating || !(selectedRecipient?.id || composeEmail.trim()) || !composeMessage.trim()} className={primaryBtn}>
                {creating ? 'Starting...' : 'Start conversation'}
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Recent chats</h3>
              <div className="mt-3 space-y-2">
                {loadingChats ? (
                  <p className="text-sm text-slate-500">Loading chats...</p>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-slate-500">No conversations yet.</p>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition-all ${
                        selectedId === conversation.id
                          ? 'border-[#1B3A6B] bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{conversation.participant?.name || 'Unknown user'}</p>
                          <p className="truncate text-xs text-slate-400">{conversation.participant?.email}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-[#1B3A6B] px-2 py-0.5 text-xs font-semibold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 truncate text-xs text-slate-500">
                        {conversation.latestMessage?.body || 'No messages yet'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={`${shell} p-5 flex min-h-[620px] flex-col`}>
            {selectedConversation ? (
              <>
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-lg font-bold text-slate-800">{selectedConversation.participant?.name}</p>
                  <p className="text-sm text-slate-500">{selectedConversation.participant?.email}</p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto py-4">
                  {loadingMessages ? (
                    <p className="text-sm text-slate-500">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <EmptyBlock title="No messages yet" description="Say hello to start the conversation." />
                  ) : (
                    messages.map((message) => {
                      const mine = message.sender_id === user?.id;
                      return (
                        <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${mine ? 'bg-[#1B3A6B] text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <p>{message.body}</p>
                            <p className={`mt-2 text-[11px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>
                              {timeLabel(message.createdAt || message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex gap-3">
                    <textarea
                      className={`${input} min-h-[96px] resize-y`}
                      value={draftMessage}
                      onChange={(e) => setDraftMessage(e.target.value)}
                      placeholder="Write a reply..."
                    />
                    <button type="button" onClick={sendMessage} disabled={sending || !draftMessage.trim()} className={primaryBtn}>
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyBlock title="Select a conversation" description="Choose a chat from the left or start a new conversation." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
