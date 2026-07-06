import { useState, useEffect } from 'react';
import api from '../../api';
import { Spinner } from '../../components';
import { Mail, Trash2, X, ChevronDown, ChevronUp, Inbox } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/contact/admin/messages');
        setMessages(data.data || []);
      } catch {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/contact/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-white">Messages</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">{messages.length} total</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-16 text-stone-500 dark:text-stone-400">
          <Inbox size={48} className="mx-auto mb-3 opacity-40" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg._id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 overflow-hidden transition-all">
              {/* Header */}
              <button onClick={() => toggleExpand(msg._id)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-all text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 dark:text-white truncate">{msg.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-stone-400">{formatDate(msg.createdAt)}</span>
                  {expanded === msg._id ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                </div>
              </button>

              {/* Expanded Body */}
              {expanded === msg._id && (
                <div className="px-4 pb-4 pt-0 border-t border-stone-100 dark:border-slate-800">
                  <p className="text-sm text-stone-700 dark:text-stone-300 mt-3 whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 dark:border-slate-800">
                    <a href={`mailto:${msg.email}`}
                      className="text-sm text-emerald-600 hover:underline">
                      Reply via email
                    </a>
                    {deleteConfirm === msg._id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(msg._id)}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-all">
                          Confirm Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="p-1 rounded hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(msg._id)}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-all">
                        <Trash2 size={14} /> Delete
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
