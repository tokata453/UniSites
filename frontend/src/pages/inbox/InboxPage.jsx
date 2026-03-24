import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authApi, inboxApi, organizationApi, universityApi } from '@/api';
import { useAuth, useToast } from '@/hooks';
import { useInboxStore } from '@/store/inboxStore';

const shell = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';
const iconBtn = 'inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700';
const SUMMARY_POLL_MS = 90_000;
const MESSAGE_POLL_MS = 45_000;

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
  return new Date(value).toLocaleString();
}

function shortTimeLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function dayLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function Avatar({ user, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-sm' : 'h-10 w-10 text-xs';
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-2xl bg-slate-200 font-semibold text-slate-600 ${sizeClass}`}>
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user?.name || 'User avatar'}
          className="h-full w-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        getInitials(user?.name)
      )}
    </div>
  );
}

function conversationEntity(conversation, viewerRole) {
  const context = conversation?.conversation_context;

  if (!conversation) return null;

  if (context === 'university') {
    if (conversation.University) {
      return {
        id: `university-${conversation.University.id}`,
        name: conversation.University.name,
        email: 'Official Inbox',
        avatar_url: conversation.University.logo_url,
      };
    }
  }

  if (context === 'organization') {
    if (conversation.Organization) {
      return {
        id: `organization-${conversation.Organization.id}`,
        name: conversation.Organization.name,
        email: 'Official Inbox',
        avatar_url: conversation.Organization.logo_url,
      };
    }
  }

  if (context === 'admin') {
    if (viewerRole === 'admin') return conversation.participant || null;
    return {
      id: `admin-${conversation.participant?.id || 'official'}`,
      name: 'UniSites Admin',
      email: 'Official admin inbox',
      avatar_url: conversation.participant?.avatar_url || null,
    };
  }

  return conversation.participant || null;
}

function internalConversationLabel(conversation, viewerRole) {
  if (!conversation) return '';

  if (conversation.conversation_context === 'university' && viewerRole === 'owner') {
    return conversation.participant?.name ? `Student contact: ${conversation.participant.name}` : '';
  }

  if (conversation.conversation_context === 'organization' && viewerRole === 'organization') {
    return conversation.participant?.name ? `Student contact: ${conversation.participant.name}` : '';
  }

  if (conversation.conversation_context === 'admin' && viewerRole === 'admin') {
    return conversation.participant?.name ? `User contact: ${conversation.participant.name}` : '';
  }

  return '';
}

function dedupeMessages(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function makeTempMessage({ body, conversationId, sender }) {
  const id = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    conversation_id: conversationId,
    sender_id: sender?.id,
    body,
    is_read: false,
    createdAt: new Date().toISOString(),
    Sender: sender ? {
      id: sender.id,
      name: sender.name,
      avatar_url: sender.avatar_url,
    } : null,
    _status: 'sending',
  };
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 21a3 3 0 0 0 6 0" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </svg>
);

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export default function InboxPage() {
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const setUnreadNotifications = useInboxStore((s) => s.setUnreadNotifications);
  const setUnreadMessages = useInboxStore((s) => s.setUnreadMessages);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [composeQuery, setComposeQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [composeMessage, setComposeMessage] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [ownedUniversity, setOwnedUniversity] = useState(null);
  const [ownedOrganization, setOwnedOrganization] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingByConversation, setTypingByConversation] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);
  const selectedIdRef = useRef(null);
  const userIdRef = useRef(user?.id || null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingConversationRef = useRef(null);
  const hasUniversityInbox = user?.Role?.name === 'owner';
  const hasOrganizationInbox = user?.Role?.name === 'organization';
  const hasAdminInbox = user?.Role?.name === 'admin';
  const canUseInstitutionInbox = hasUniversityInbox || hasOrganizationInbox;
  const viewerRole = user?.Role?.name;
  const allowedContexts = hasUniversityInbox
    ? ['university', 'personal']
    : hasOrganizationInbox
    ? ['organization', 'personal']
    : hasAdminInbox
      ? ['admin', 'personal']
      : ['all'];
  const requestedContext = searchParams.get('context');
  const defaultContext = hasUniversityInbox
    ? 'university'
    : hasOrganizationInbox
      ? 'organization'
      : hasAdminInbox
        ? 'admin'
        : 'personal';
  const queryContext = allowedContexts.includes(requestedContext)
    ? requestedContext
    : defaultContext;
  const [inboxContext, setInboxContext] = useState(queryContext);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId]
  );
  const selectedConversationEntity = useMemo(
    () => conversationEntity(selectedConversation, viewerRole),
    [selectedConversation, viewerRole]
  );
  const selectedParticipantId = selectedConversation?.participant?.id ? String(selectedConversation.participant.id) : null;
  const selectedParticipantOnline = selectedParticipantId ? onlineUserIds.has(selectedParticipantId) : false;
  const selectedConversationTyping = selectedId && selectedParticipantId && typingByConversation[selectedId] === selectedParticipantId;
  const institutionInboxLabel = hasUniversityInbox
    ? ownedUniversity?.name || 'University Inbox'
    : hasOrganizationInbox
      ? ownedOrganization?.name || 'Organization Inbox'
      : 'UniSites Admin';
  const inboxPageTitle = inboxContext === 'university'
    ? 'University Inbox'
    : inboxContext === 'organization'
      ? 'Organization Inbox'
      : inboxContext === 'admin'
        ? 'Admin Inbox'
      : inboxContext === 'all'
        ? 'Inbox'
        : 'Personal Inbox';

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!canUseInstitutionInbox && !hasAdminInbox) {
      if (inboxContext !== 'personal') setInboxContext('personal');
      if (queryContext !== 'personal') {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('context', 'personal');
        nextParams.delete('conversation');
        setSearchParams(nextParams, { replace: true });
      }
      return;
    }
    if (inboxContext !== queryContext) setInboxContext(queryContext);
  }, [canUseInstitutionInbox, hasAdminInbox, inboxContext, queryContext, searchParams, setSearchParams]);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated || !canUseInstitutionInbox) {
      setOwnedUniversity(null);
      setOwnedOrganization(null);
      return undefined;
    }

    let active = true;
    const loader = hasUniversityInbox ? universityApi.getMine : organizationApi.getMine;

    loader()
      .then((res) => {
        if (!active) return;
        if (hasUniversityInbox) {
          setOwnedUniversity(res.data?.university || null);
          setOwnedOrganization(null);
        } else {
          setOwnedOrganization(res.data?.organization || null);
          setOwnedUniversity(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setOwnedUniversity(null);
        setOwnedOrganization(null);
      });

    return () => {
      active = false;
    };
  }, [canUseInstitutionInbox, hasUniversityInbox, isAuthenticated]);

  const loadNotifications = async ({ silent = false } = {}) => {
    if (!silent) setLoadingNotifications(true);
    try {
      const res = await authApi.getNotifications();
      const nextUnreadCount = res.data.unreadCount || 0;
      setNotifications(res.data.notifications || []);
      setUnreadCount(nextUnreadCount);
      setUnreadNotifications(nextUnreadCount);
    } catch (err) {
      if (!silent) error(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      if (!silent) setLoadingNotifications(false);
    }
  };

  const loadConversations = async (nextSelectedId = null, { silent = false, context = inboxContext } = {}) => {
    if (!silent) setLoadingChats(true);
    try {
      const params = context && context !== 'all' ? { context } : {};
      const res = await inboxApi.getConversations(params);
      const items = res.data.conversations || [];
      const nextUnreadMessages = items.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
      if (Object.prototype.hasOwnProperty.call(res.data, 'university')) {
        setOwnedUniversity(res.data.university || null);
      }
      if (Object.prototype.hasOwnProperty.call(res.data, 'organization')) {
        setOwnedOrganization(res.data.organization || null);
      }
      setConversations(items);
      const fallbackId = nextSelectedId || selectedIdRef.current || items[0]?.id || null;
      setSelectedId(fallbackId);
      setUnreadMessages(nextUnreadMessages);
    } catch (err) {
      if (!silent) {
        setConversations([]);
        setUnreadMessages(0);
        error(err.response?.data?.message || 'Failed to load conversations');
      }
    } finally {
      if (!silent) setLoadingChats(false);
    }
  };

  const switchInboxContext = (nextContext) => {
    if (nextContext === inboxContext) return;
    setInboxContext(nextContext);
    setSelectedId(null);
    setMessages([]);
    setSelectedRecipient(null);
    setComposeQuery('');
    setComposeMessage('');
    setDraftMessage('');
    setUserResults([]);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('context', nextContext);
    nextParams.delete('conversation');
    setSearchParams(nextParams, { replace: true });
  };

  const upsertConversation = (nextConversation) => {
    if (!nextConversation?.id) return;
    setConversations((current) => {
      const nextItems = [nextConversation, ...current.filter((item) => item.id !== nextConversation.id)];
      nextItems.sort((a, b) => {
        const aTime = new Date(a.latestMessage?.createdAt || a.latestMessage?.created_at || a.last_message_at || 0).getTime();
        const bTime = new Date(b.latestMessage?.createdAt || b.latestMessage?.created_at || b.last_message_at || 0).getTime();
        return bTime - aTime;
      });
      const nextUnreadMessages = nextItems.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
      setUnreadMessages(nextUnreadMessages);
      return nextItems;
    });
  };

  const mergeMessageIntoThread = (nextMessage, clientTempId = null) => {
    if (!nextMessage?.id) return;
    setMessages((current) => {
      let replaced = false;
      let nextItems = current.map((item) => {
        if (clientTempId && item.id === clientTempId) {
          replaced = true;
          return { ...nextMessage, _status: 'sent' };
        }
        if (item.id === nextMessage.id) {
          replaced = true;
          return { ...item, ...nextMessage, _status: 'sent' };
        }
        return item;
      });

      if (!replaced) nextItems = [...nextItems, { ...nextMessage, _status: 'sent' }];
      return dedupeMessages(nextItems);
    });
  };

  const setConversationLatestMessage = (conversationId, nextMessage, unreadCount) => {
    setConversations((current) => {
      const nextItems = current.map((item) => (
        item.id === conversationId
          ? {
              ...item,
              latestMessage: nextMessage,
              last_message_at: nextMessage?.createdAt || nextMessage?.created_at || item.last_message_at,
              ...(typeof unreadCount === 'number' ? { unreadCount } : {}),
            }
          : item
      ));
      nextItems.sort((a, b) => {
        const aTime = new Date(a.latestMessage?.createdAt || a.latestMessage?.created_at || a.last_message_at || 0).getTime();
        const bTime = new Date(b.latestMessage?.createdAt || b.latestMessage?.created_at || b.last_message_at || 0).getTime();
        return bTime - aTime;
      });
      const nextUnreadMessages = nextItems.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
      setUnreadMessages(nextUnreadMessages);
      return nextItems;
    });
  };

  const appendTemporaryMessage = (tempMessage) => {
    setMessages((current) => [...current, tempMessage]);
    setConversationLatestMessage(tempMessage.conversation_id, tempMessage, 0);
  };

  const failTemporaryMessage = (tempId) => {
    setMessages((current) => current.map((item) => (
      item.id === tempId ? { ...item, _status: 'failed' } : item
    )));
  };

  const clearTypingState = (conversationId) => {
    if (!conversationId) return;
    setTypingByConversation((current) => {
      if (!current[conversationId]) return current;
      const next = { ...current };
      delete next[conversationId];
      return next;
    });
  };

  const markOwnMessagesRead = (conversationId, readAt) => {
    setMessages((current) => current.map((message) => (
      message.conversation_id === conversationId && message.sender_id === userIdRef.current
        ? { ...message, is_read: true, read_at: readAt || message.read_at }
        : message
    )));

    setConversations((current) => current.map((item) => (
      item.id === conversationId && item.latestMessage?.sender_id === userIdRef.current
        ? {
            ...item,
            latestMessage: {
              ...item.latestMessage,
              is_read: true,
              read_at: readAt || item.latestMessage.read_at,
            },
          }
        : item
    )));
  };

  const openConversation = async (conversationId) => {
    if (!conversationId) return;

    setSelectedRecipient(null);
    setComposeMessage('');
    setSelectedId(conversationId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('context', inboxContext);
    nextParams.set('conversation', conversationId);
    setSearchParams(nextParams, { replace: true });
    clearTypingState(conversationId);

    setConversations((current) => {
      const nextItems = current.map((item) => (
        item.id === conversationId ? { ...item, unreadCount: 0 } : item
      ));
      const nextUnreadMessages = nextItems.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
      setUnreadMessages(nextUnreadMessages);
      return nextItems;
    });

    setNotifications((current) => {
      const nextItems = current.map((item) => (
        item.type === 'message' && String(item.data?.conversation_id || '') === String(conversationId)
          ? { ...item, is_read: true }
          : item
      ));
      const nextUnreadNotifications = nextItems.filter((item) => !item.is_read).length;
      setUnreadCount(nextUnreadNotifications);
      setUnreadNotifications(nextUnreadNotifications);
      return nextItems;
    });
  };

  const loadMessages = async (conversationId, { silent = false, markRead = true } = {}) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    if (!silent) setLoadingMessages(true);
    try {
      const res = await inboxApi.getMessages(conversationId);
      setMessages(res.data.messages || []);
      if (markRead) {
        await Promise.all([
          inboxApi.markConversationRead(conversationId),
          authApi.markConversationNotificationsRead(conversationId),
        ]);
        setConversations((current) => {
          const nextItems = current.map((item) => (
            item.id === conversationId ? { ...item, unreadCount: 0 } : item
          ));
          const nextUnreadMessages = nextItems.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
          setUnreadMessages(nextUnreadMessages);
          return nextItems;
        });
        setNotifications((current) => {
          const nextItems = current.map((item) => (
            item.type === 'message' && String(item.data?.conversation_id || '') === String(conversationId)
              ? { ...item, is_read: true }
              : item
          ));
          const nextUnreadNotifications = nextItems.filter((item) => !item.is_read).length;
          setUnreadCount(nextUnreadNotifications);
          setUnreadNotifications(nextUnreadNotifications);
          return nextItems;
        });
      }
    } catch (err) {
      if (!silent) {
        setMessages([]);
        error(err.response?.data?.message || 'Failed to load messages');
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
    loadConversations(null, { context: inboxContext });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxContext, isAuthenticated]);

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
        socketRef.current = socket;
        socket.on('connect', () => {
          setSocketConnected(true);
          socket.emit('join_user', user.id);
          if (selectedIdRef.current) socket.emit('join_thread', selectedIdRef.current);
        });
        socket.on('disconnect', () => {
          setSocketConnected(false);
        });
        socket.on('presence:snapshot', ({ userIds = [] }) => {
          setOnlineUserIds(new Set(userIds.map((id) => String(id))));
        });
        socket.on('presence:update', ({ userId, isOnline }) => {
          if (!userId) return;
          setOnlineUserIds((current) => {
            const next = new Set(current);
            if (isOnline) next.add(String(userId));
            else next.delete(String(userId));
            return next;
          });
        });
        socket.on('typing:update', ({ conversationId, userId, isTyping }) => {
          if (!conversationId || !userId || userId === String(userIdRef.current)) return;
          setTypingByConversation((current) => {
            const next = { ...current };
            if (isTyping) next[conversationId] = String(userId);
            else delete next[conversationId];
            return next;
          });
        });
        socket.on('message:new', ({ conversationId, conversation, message, clientTempId }) => {
          const currentSelectedId = selectedIdRef.current;
          if (conversation) upsertConversation(conversation);
          if (message && conversationId && conversationId === currentSelectedId) {
            mergeMessageIntoThread(message, clientTempId);
            clearTypingState(conversationId);
            if (message.sender_id !== userIdRef.current) {
              Promise.all([
                inboxApi.markConversationRead(conversationId),
                authApi.markConversationNotificationsRead(conversationId),
              ]).catch(() => {});
              setConversations((current) => {
                const nextItems = current.map((item) => (
                  item.id === conversationId ? { ...item, unreadCount: 0 } : item
                ));
                const nextUnreadMessages = nextItems.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
                setUnreadMessages(nextUnreadMessages);
                return nextItems;
              });
            }
          } else if (conversationId && !conversation) {
            loadConversations(conversationId || currentSelectedId);
          }
        });
        socket.on('conversation:read', ({ conversationId, readerId, readAt }) => {
          if (!conversationId || readerId === userIdRef.current) return;
          markOwnMessagesRead(conversationId, readAt);
        });
        cleanup = () => {
          setSocketConnected(false);
          socketRef.current = null;
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
    if (!composeQuery.trim() || composeQuery.trim().length < 2) {
      setUserResults([]);
      return undefined;
    }

    const handle = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await inboxApi.searchUsers(composeQuery.trim());
        setUserResults(res.data.users || []);
      } catch (_) {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [composeQuery, isAuthenticated]);

  useEffect(() => {
    if (selectedId) loadMessages(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const interval = setInterval(() => {
      if (document.hidden) return;
      if (!socketConnected) {
        loadConversations(selectedIdRef.current, { silent: true, context: inboxContext });
      }
      if (showNotifications || !socketConnected) {
        loadNotifications({ silent: true });
      }
    }, SUMMARY_POLL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxContext, isAuthenticated, showNotifications, socketConnected]);

  useEffect(() => {
    if (!isAuthenticated || !selectedId) return undefined;

    const interval = setInterval(() => {
      if (document.hidden || socketConnected) return;
      loadMessages(selectedId, { silent: true, markRead: false });
    }, MESSAGE_POLL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedId, socketConnected]);

  useEffect(() => {
    const requestedConversationId = searchParams.get('conversation');
    if (!requestedConversationId || conversations.length === 0) return;
    const matchedConversation = conversations.find((item) => String(item.id) === String(requestedConversationId));
    if (matchedConversation && matchedConversation.id !== selectedId) {
      setSelectedId(matchedConversation.id);
    }
  }, [conversations, searchParams, selectedId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedId) return undefined;
    socket.emit('join_thread', selectedId);
    return () => {
      socket.emit('leave_thread', selectedId);
      clearTypingState(selectedId);
    };
  }, [selectedId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedId) return undefined;

    const trimmed = draftMessage.trim();
    if (trimmed) {
      socket.emit('typing:start', { conversationId: selectedId, userId: user?.id });
      typingConversationRef.current = selectedId;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: selectedId, userId: user?.id });
        typingConversationRef.current = null;
      }, 1200);
    } else if (typingConversationRef.current === selectedId) {
      socket.emit('typing:stop', { conversationId: selectedId, userId: user?.id });
      typingConversationRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [draftMessage, selectedId, user?.id]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const selectRecipient = (item) => {
    const existingConversation = conversations.find((conversation) => conversation.participant?.id === item.id);
    if (existingConversation) {
      setComposeQuery('');
      setUserResults([]);
      openConversation(existingConversation.id);
      return;
    }

    setSelectedRecipient(item);
    setSelectedId(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('context', 'personal');
    nextParams.delete('conversation');
    setSearchParams(nextParams, { replace: true });
    setMessages([]);
    setComposeQuery(item.name);
    setUserResults([]);
    setComposeMessage('');
  };

  const startConversation = async () => {
    if (!selectedRecipient?.id || !composeMessage.trim()) return;
    setCreating(true);
    try {
      const res = await inboxApi.createConversation({
        recipient_id: selectedRecipient?.id,
        message: composeMessage.trim(),
      });
      const nextConversation = res.data.conversation;
      const createdMessage = res.data.message;
      const conversationId = nextConversation?.id;
      setComposeQuery('');
      setSelectedRecipient(null);
      setUserResults([]);
      setComposeMessage('');
      if (nextConversation) upsertConversation(nextConversation);
      if (createdMessage) setMessages([createdMessage]);
      setSelectedId(conversationId);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('context', 'personal');
      nextParams.set('conversation', conversationId);
      setSearchParams(nextParams, { replace: true });
      success('Conversation started');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedId || !draftMessage.trim()) return;
    const body = draftMessage.trim();
    const tempMessage = makeTempMessage({ body, conversationId: selectedId, sender: user });
    setSending(true);
    appendTemporaryMessage(tempMessage);
    setDraftMessage('');
    if (socketRef.current) {
      socketRef.current.emit('typing:stop', { conversationId: selectedId, userId: user?.id });
      typingConversationRef.current = null;
    }
    try {
      const res = await inboxApi.sendMessage(selectedId, { body, client_temp_id: tempMessage.id });
      const nextMessage = res.data.message;
      if (nextMessage) {
        mergeMessageIntoThread(nextMessage, res.data.clientTempId || tempMessage.id);
        setConversationLatestMessage(selectedId, { ...nextMessage, _status: 'sent' }, 0);
      }
    } catch (err) {
      failTemporaryMessage(tempMessage.id);
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
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
      <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{inboxPageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {(canUseInstitutionInbox || hasAdminInbox)
              ? 'Switch between official institution conversations and personal chats in one place.'
              : 'Your inbox includes direct chats as well as official conversations with universities, organizations, and admins.'}
          </p>
        </div>
        {(canUseInstitutionInbox || hasAdminInbox) && (
          <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-slate-50 p-1 sm:w-auto">
            {hasUniversityInbox && (
              <button
                type="button"
                onClick={() => switchInboxContext('university')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:flex-none ${
                  inboxContext === 'university'
                    ? 'bg-[#1B3A6B] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                University Inbox
              </button>
            )}
            {hasOrganizationInbox && (
              <button
                type="button"
                onClick={() => switchInboxContext('organization')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:flex-none ${
                  inboxContext === 'organization'
                    ? 'bg-[#1B3A6B] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organization Inbox
              </button>
            )}
            {hasAdminInbox && (
              <button
                type="button"
                onClick={() => switchInboxContext('admin')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:flex-none ${
                  inboxContext === 'admin'
                    ? 'bg-[#1B3A6B] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Inbox
              </button>
            )}
            <button
              type="button"
              onClick={() => switchInboxContext('personal')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:flex-none ${
                inboxContext === 'personal'
                  ? 'bg-[#1B3A6B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personal Inbox
            </button>
          </div>
        )}
      </div>

      {showNotifications && (
        <div className={`${shell} mb-5 overflow-hidden`}>
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
                <p className="text-sm text-slate-500">System alerts and message notifications.</p>
              </div>
              <button type="button" onClick={markNotificationsRead} className={secondaryBtn}>Mark all read</button>
            </div>
          </div>
          <div className="p-5">
            {loadingNotifications ? (
              <p className="text-sm text-slate-500">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <EmptyBlock title="No notifications yet" description="We’ll show message alerts and platform updates here." />
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div key={item.id} className={`rounded-2xl border p-4 transition-all ${item.is_read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/70 shadow-sm'}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.is_read ? 'bg-slate-100 text-slate-500' : 'bg-[#1B3A6B] text-white'}`}>
                          <BellIcon />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            {!item.is_read && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1B3A6B]">New</span>}
                          </div>
                          {item.message && <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                            <span>{item.type}</span>
                            <span>{timeLabel(item.createdAt || item.created_at)}</span>
                          </div>
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
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className={`${shell} overflow-hidden ${selectedConversation || selectedRecipient ? 'hidden lg:block' : ''}`}>
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {inboxContext === 'university'
                    ? 'University Conversations'
                    : inboxContext === 'organization'
                      ? 'Organization Conversations'
                      : inboxContext === 'admin'
                        ? 'Admin Conversations'
                      : inboxContext === 'all'
                        ? 'All Conversations'
                        : 'Personal Conversations'}
                </h2>
                <p className="text-sm text-slate-500">{conversations.length} total conversations</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div>
              {inboxContext === 'personal' ? (
                <div className="mb-3">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <SearchIcon />
                    </span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                      value={composeQuery}
                      onChange={(e) => {
                        setComposeQuery(e.target.value);
                        setSelectedRecipient(null);
                      }}
                      placeholder="Search users to start a conversation"
                    />
                    {composeQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setComposeQuery('');
                          setUserResults([]);
                          setSelectedRecipient(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">{institutionInboxLabel}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {inboxContext === 'organization'
                      ? 'Messages sent to your organization arrive here as official organization conversations.'
                      : inboxContext === 'admin'
                        ? 'Official platform conversations for the admin team appear here.'
                        : 'Messages sent from your public university page arrive here as official institution conversations.'}
                  </p>
                </div>
              )}

              {inboxContext === 'personal' && (composeQuery.trim().length >= 2 || searchingUsers || userResults.length > 0 || selectedRecipient) && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="space-y-3">
                    {(composeQuery.trim().length >= 2 || searchingUsers || userResults.length > 0) && !selectedRecipient && (
                      <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2">
                        {searchingUsers ? (
                          <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
                        ) : composeQuery.trim().length < 2 ? (
                          <p className="px-3 py-2 text-sm text-slate-500">Type at least 2 characters to search.</p>
                        ) : userResults.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-slate-500">No matching users found.</p>
                        ) : (
                          userResults.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectRecipient(item)}
                              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-slate-50"
                            >
                              <Avatar user={item} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                                <p className="truncate text-xs text-slate-500">{item.email}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {selectedRecipient ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar user={selectedRecipient} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">{selectedRecipient.name}</p>
                              <p className="truncate text-xs text-slate-500">{selectedRecipient.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecipient(null);
                              setComposeQuery('');
                              setUserResults([]);
                              setComposeMessage('');
                            }}
                            className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Search for a person and pick them to start a new conversation.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {loadingChats ? (
                  <p className="text-sm text-slate-500">Loading chats...</p>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-slate-500">No conversations yet.</p>
                ) : (
                  conversations.map((conversation) => {
                    const displayEntity = conversationEntity(conversation, viewerRole);
                    const internalLabel = internalConversationLabel(conversation, viewerRole);
                    return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation.id)}
                      className={`w-full rounded-3xl border p-3 text-left transition-all ${
                        selectedId === conversation.id
                          ? 'border-[#1B3A6B] bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar user={displayEntity} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-800">{displayEntity?.name || 'Unknown conversation'}</p>
                                {conversation.conversation_context === 'personal' && (
                                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${onlineUserIds.has(String(conversation.participant?.id)) ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                )}
                                {conversation.conversation_context !== 'personal' && (
                                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1B3A6B]">
                                    {conversation.conversation_context === 'organization' ? 'Organization' : conversation.conversation_context === 'admin' ? 'Admin' : 'University'}
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-slate-400">
                                {conversation.conversation_context === 'personal'
                                  ? (
                                    `${typingByConversation[conversation.id] === String(conversation.participant?.id)
                                  ? 'Typing...'
                                  : onlineUserIds.has(String(conversation.participant?.id))
                                    ? 'Online'
                                    : 'Offline'} • ${conversation.participant?.email}`
                                  )
                                  : displayEntity?.email || 'Official inbox'}
                              </p>
                              {conversation.conversation_context === 'university' && conversation.University?.name && (
                                <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                                  {viewerRole === 'owner' ? `Replying as ${conversation.University.name}` : 'Official university profile'}
                                </p>
                              )}
                              {conversation.conversation_context === 'organization' && conversation.Organization?.name && (
                                <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                                  {viewerRole === 'organization' ? `Replying as ${conversation.Organization.name}` : 'Official organization profile'}
                                </p>
                              )}
                              {conversation.conversation_context === 'admin' && (
                                <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
                                  {viewerRole === 'admin' ? 'Replying as UniSites Admin' : 'Official admin profile'}
                                </p>
                              )}
                              {internalLabel && (
                                <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                                  {internalLabel}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[11px] font-medium text-slate-400">
                                {shortTimeLabel(conversation.latestMessage?.createdAt || conversation.latestMessage?.created_at)}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="mt-1 inline-flex rounded-full bg-[#1B3A6B] px-2 py-0.5 text-[11px] font-semibold text-white">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 truncate text-sm text-slate-500">
                            {typingByConversation[conversation.id] === String(conversation.participant?.id) && conversation.conversation_context === 'personal'
                              ? 'Typing...'
                              : conversation.latestMessage?.body || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  )})
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className={`${shell} ${!selectedConversation && !selectedRecipient ? 'hidden lg:flex' : 'flex'} min-h-[520px] flex-col overflow-hidden lg:h-[calc(100vh-13rem)] lg:min-h-[620px] lg:max-h-[760px]`}>
          {selectedConversation ? (
            <>
              <div className="border-b border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.delete('conversation');
                        setSearchParams(nextParams, { replace: true });
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 lg:hidden"
                      aria-label="Back to chats"
                    >
                      ←
                    </button>
                    <Avatar user={selectedConversationEntity} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-900">{selectedConversationEntity?.name}</p>
                      <p className="truncate text-sm text-slate-500">
                        {selectedConversation.conversation_context === 'personal'
                          ? (selectedConversationTyping
                          ? 'Typing...'
                          : selectedParticipantOnline
                            ? 'Online now'
                            : 'Offline')
                          : selectedConversationEntity?.email || 'Official inbox'
                        }
                        {selectedConversation.conversation_context === 'personal' && ` • ${selectedConversation.participant?.email}`}
                      </p>
                      {selectedConversation.conversation_context === 'university' && selectedConversation.University?.name && (
                        <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          {viewerRole === 'owner'
                            ? `Replying as University • ${selectedConversation.University.name}`
                            : `University Profile • ${selectedConversation.University.name}`}
                        </p>
                      )}
                      {selectedConversation.conversation_context === 'organization' && selectedConversation.Organization?.name && (
                        <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          {viewerRole === 'organization'
                            ? `Replying as Organization • ${selectedConversation.Organization.name}`
                            : `Organization Profile • ${selectedConversation.Organization.name}`}
                        </p>
                      )}
                      {selectedConversation.conversation_context === 'admin' && (
                        <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          {viewerRole === 'admin'
                            ? 'Replying as UniSites Admin'
                            : 'Admin Profile • UniSites'}
                        </p>
                      )}
                      {internalConversationLabel(selectedConversation, viewerRole) && (
                        <p className="mt-1 truncate text-xs font-medium text-slate-400">
                          {internalConversationLabel(selectedConversation, viewerRole)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button type="button" className={iconBtn} title="Conversation options">
                    <MoreIcon />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_40%)] px-5 py-5">
                {loadingMessages ? (
                  <p className="text-sm text-slate-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <EmptyBlock title="No messages yet" description="Say hello to start the conversation." />
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const mine = message.sender_id === user?.id;
                      const previous = messages[index - 1];
                      const showDayDivider = !previous || dayLabel(previous.createdAt || previous.created_at) !== dayLabel(message.createdAt || message.created_at);
                      return (
                        <div key={message.id}>
                          {showDayDivider && (
                            <div className="my-6 flex items-center gap-3">
                              <div className="h-px flex-1 bg-slate-200" />
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                {dayLabel(message.createdAt || message.created_at)}
                              </span>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>
                          )}
                          <div className={`flex gap-3 ${mine ? 'justify-end' : 'justify-start'}`}>
                            {!mine && <Avatar user={selectedConversationEntity} />}
                            <div className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                              <div className={`rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                                mine
                                  ? 'rounded-br-md bg-[#1B3A6B] text-white'
                                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                              }`}>
                              <p>{message.body}</p>
                            </div>
                              <p className="mt-1 px-1 text-[11px] text-slate-400">
                                {timeLabel(message.createdAt || message.created_at)}
                                {mine ? ` • ${message._status === 'sending' ? 'Sending...' : message._status === 'failed' ? 'Failed to send' : message.is_read ? 'Read' : 'Delivered'}` : ''}
                              </p>
                            </div>
                            {mine && <Avatar user={selectedConversation.conversation_context === 'personal' ? user : (selectedConversation.conversation_context === 'university' ? {
                              name: selectedConversation.University?.name,
                              avatar_url: selectedConversation.University?.logo_url,
                            } : selectedConversation.conversation_context === 'organization' ? {
                              name: selectedConversation.Organization?.name,
                              avatar_url: selectedConversation.Organization?.logo_url,
                            } : selectedConversation.conversation_context === 'admin' ? {
                              name: 'UniSites Admin',
                              avatar_url: user?.avatar_url,
                            } : user)} />}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-3 shadow-inner">
                  <div className="flex gap-3">
                    <textarea
                      className="min-h-[88px] flex-1 resize-none rounded-2xl border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      value={draftMessage}
                      onChange={(e) => setDraftMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!sending && draftMessage.trim()) sendMessage();
                        }
                      }}
                      placeholder="Write a reply..."
                    />
                    <button type="button" onClick={sendMessage} disabled={sending || !draftMessage.trim()} className={`${primaryBtn} self-end px-4`}>
                      <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                      <span className="sm:hidden"><SendIcon /></span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : selectedRecipient ? (
            <>
              <div className="border-b border-slate-200 bg-white px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipient(null);
                        setComposeQuery('');
                        setComposeMessage('');
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.delete('conversation');
                        setSearchParams(nextParams, { replace: true });
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 lg:hidden"
                      aria-label="Back to chats"
                    >
                      ←
                    </button>
                    <Avatar user={selectedRecipient} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-900">{selectedRecipient.name}</p>
                      <p className="truncate text-sm text-slate-500">New conversation • {selectedRecipient.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                    onClick={() => {
                      setSelectedRecipient(null);
                      setComposeQuery('');
                      setComposeMessage('');
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.delete('conversation');
                      setSearchParams(nextParams, { replace: true });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_40%)] p-8">
                <div className="max-w-lg text-center">
                  <div className="mx-auto flex w-fit items-center justify-center">
                    <Avatar user={selectedRecipient} size="lg" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">Start chatting with {selectedRecipient.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Write the first message below and we’ll create the conversation here in the main chat panel.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white p-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-3 shadow-inner">
                  <div className="flex gap-3">
                    <textarea
                      className="min-h-[88px] flex-1 resize-none rounded-2xl border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      value={composeMessage}
                      onChange={(e) => setComposeMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!creating && selectedRecipient?.id && composeMessage.trim()) startConversation();
                        }
                      }}
                      placeholder={`Write your first message to ${selectedRecipient.name}...`}
                    />
                    <button type="button" onClick={startConversation} disabled={creating || !selectedRecipient?.id || !composeMessage.trim()} className={`${primaryBtn} self-end px-4`}>
                      <span className="hidden sm:inline">{creating ? 'Starting...' : 'Send'}</span>
                      <span className="sm:hidden"><SendIcon /></span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(27,58,107,0.10),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1B3A6B] text-white shadow-lg">
                  <SearchIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Select a conversation</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {inboxContext === 'university'
                    ? 'Open a university conversation from the left to reply as the institution.'
                    : inboxContext === 'organization'
                    ? 'Open an organization conversation from the left to reply as the organization.'
                    : inboxContext === 'admin'
                    ? 'Open an admin conversation from the left to reply as the platform.'
                    : 'Choose a conversation from the left. Official university, organization, and admin messages appear here as profile-based chats.'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
