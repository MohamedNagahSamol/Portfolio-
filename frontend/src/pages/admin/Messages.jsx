import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { Spinner } from '../../components';
import { formatDateTime } from '../../utils/date';
import { Mail, Trash2, X, ChevronDown, ChevronUp, Inbox, CheckCircle2 } from 'lucide-react';

export default function AdminMessages() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/admin/messages');
        setMessages(data.data || []);
      } catch {
        try {
          const { data } = await api.get('/api/contact/admin/messages');
          setMessages(data.data || []);
        } catch {
          setError(t('admin_messages_load_error'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [t]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/admin/messages/${id}/read`);
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m));
      window.dispatchEvent(new Event('messages-updated'));
    } catch {
      try {
        await api.patch(`/api/contact/admin/messages/${id}/read`);
        setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m));
        window.dispatchEvent(new Event('messages-updated'));
      } catch (err) {
        setError(err.response?.data?.message || t('admin_messages_load_error'));
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setDeleteConfirm(null);
      window.dispatchEvent(new Event('messages-updated'));
    } catch {
      try {
        await api.delete(`/api/contact/admin/messages/${id}`);
        setMessages((prev) => prev.filter((m) => m._id !== id));
        setDeleteConfirm(null);
        window.dispatchEvent(new Event('messages-updated'));
      } catch (err) {
        setError(err.response?.data?.message || t('admin_messages_delete_error'));
      }
    }
  };

  const toggleExpand = async (id) => {
    if (expanded !== id) {
      setExpanded(id);
      const target = messages.find(m => m._id === id);
      if (target && !target.read) {
        await handleMarkRead(id);
      }
    } else {
      setExpanded(null);
    }
  };

  const formatDate = (dateStr) => formatDateTime(dateStr, i18n.language);

  const unreadCount = messages.filter(m => !m.read).length;
  const readCount = messages.filter(m => m.read).length;

  const filteredMessages = activeFilter === 'unread'
    ? messages.filter(m => !m.read)
    : activeFilter === 'read'
    ? messages.filter(m => m.read)
    : messages;

  if (loading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-(--text-main)">
            {t('admin_messages_title')}
          </h1>
          <p className="text-sm text-(--text-muted) mt-1">
            {t('admin_messages_count', { count: messages.length })}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-(--bg-surface-muted) border border-(--border-main) w-fit">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-(--bg-surface) text-(--primary) shadow-xs font-semibold'
                : 'text-(--text-muted) hover:text-(--text-main)'
            }`}
          >
            {t('messages_filter_all')} ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeFilter === 'unread'
                ? 'bg-(--bg-surface) text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-(--text-muted) hover:text-(--text-main)'
            }`}
          >
            {t('messages_filter_unread')} ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeFilter === 'read'
                ? 'bg-(--bg-surface) text-(--text-main) shadow-xs font-semibold'
                : 'text-(--text-muted) hover:text-(--text-main)'
            }`}
          >
            {t('messages_filter_read')} ({readCount})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label={t('admin_cm_dismiss_error')}>
            <X size={16} />
          </button>
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <div className="text-center py-16 text-(--text-muted)">
          <Inbox size={48} className="mx-auto mb-3 opacity-40" />
          <p>{t('admin_messages_empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div 
              key={msg._id}
              className={`bg-(--bg-surface) rounded-2xl border ${
                msg.read 
                  ? 'border-(--border-main)' 
                  : 'border-emerald-500/50 dark:border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              } overflow-hidden transition-all`}
            >
              {/* Message Header Item */}
              <button 
                onClick={() => toggleExpand(msg._id)}
                className="w-full flex items-center justify-between p-4 hover:bg-(--bg-surface-muted)/50 transition-all text-start"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 ${
                    msg.read 
                      ? 'bg-(--bg-surface-muted) text-(--text-muted)' 
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  } rounded-xl flex items-center justify-center shrink-0`}>
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-semibold text-(--text-main) truncate">{msg.name}</p>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-medium ${
                        msg.read 
                          ? 'bg-(--bg-surface-muted) text-(--text-muted)' 
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {!msg.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 me-1 animate-pulse align-middle" />}
                        {msg.read ? t('admin_messages_read') : t('admin_messages_unread')}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-(--text-muted) truncate mt-0.5">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ms-2">
                  <span className="text-xs font-mono text-(--text-muted) hidden sm:inline">{formatDate(msg.createdAt)}</span>
                  {expanded === msg._id ? <ChevronUp size={18} className="text-(--text-muted)" /> : <ChevronDown size={18} className="text-(--text-muted)" />}
                </div>
              </button>

              {/* Expanded Body */}
              {expanded === msg._id && (
                <div className="px-5 pb-5 pt-0 border-t border-(--border-main)/60">
                  <p className="text-sm text-(--text-main) mt-4 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-(--border-main)/60">
                    <div className="flex items-center gap-3">
                      <a 
                        href={`mailto:${msg.email}`}
                        className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {t('admin_messages_reply')}
                      </a>
                      {!msg.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(msg._id)}
                          className="flex items-center gap-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <CheckCircle2 size={13} />
                          {t('admin_messages_mark_read')}
                        </button>
                      )}
                    </div>
                    {deleteConfirm === msg._id ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDelete(msg._id)}
                          className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-xs font-mono font-medium hover:bg-rose-500/20 transition-all"
                        >
                          {t('admin_messages_confirm_delete')}
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(null)}
                          aria-label={t('admin_messages_cancel_delete')}
                          className="p-1 rounded-lg hover:bg-(--bg-surface-muted) text-(--text-muted)"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirm(msg._id)}
                        className="flex items-center gap-1 text-xs font-mono text-rose-500 hover:text-rose-600 transition-all"
                      >
                        <Trash2 size={13} /> {t('admin_messages_delete')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
