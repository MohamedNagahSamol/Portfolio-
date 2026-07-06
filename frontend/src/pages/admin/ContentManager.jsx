import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { Spinner } from '../../components';
import { Plus, Edit3, Trash2, X, Check, ArrowLeft } from 'lucide-react';

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function setNested(obj, path, value) {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...(current[keys[i]] || {}) };
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

const CONTENT_CONFIG = {
  projects: {
    title: 'Projects',
    apiPath: '/api/projects',
    adminPath: '/api/admin/projects',
    arrayFields: ['stack'],
    fields: [
      { name: 'title.en', label: 'Title (English)', type: 'text', required: true },
      { name: 'title.ar', label: 'Title (Arabic)', type: 'text', required: true },
      { name: 'description.en', label: 'Description (English)', type: 'textarea', required: true },
      { name: 'description.ar', label: 'Description (Arabic)', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['backend', 'frontend', 'fullstack', 'simple'] },
      { name: 'stack', label: 'Tech Stack (comma separated)', type: 'text' },
      { name: 'links.github', label: 'GitHub URL', type: 'text' },
      { name: 'links.frontend', label: 'Live / Frontend URL', type: 'text' },
      { name: 'links.backend', label: 'Backend / API URL', type: 'text' },
      { name: 'links.admin', label: 'Admin URL', type: 'text' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    displayField: 'title',
  },
  skills: {
    title: 'Skills',
    apiPath: '/api/skills',
    adminPath: '/api/admin/skills',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['frontend', 'backend', 'tools'] },
      { name: 'icon', label: 'Icon Name (e.g. react, nodejs)', type: 'text' },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    displayField: 'name',
  },
  experience: {
    title: 'Experience',
    apiPath: '/api/experience',
    adminPath: '/api/admin/experience',
    fields: [
      { name: 'title.en', label: 'Role (English)', type: 'text', required: true },
      { name: 'title.ar', label: 'Role (Arabic)', type: 'text', required: true },
      { name: 'organization.en', label: 'Company (English)', type: 'text', required: true },
      { name: 'organization.ar', label: 'Company (Arabic)', type: 'text', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date (leave blank for present)', type: 'date' },
      { name: 'description.en', label: 'Description (English)', type: 'textarea' },
      { name: 'description.ar', label: 'Description (Arabic)', type: 'textarea' },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    displayField: 'title',
  },
  certificates: {
    title: 'Certificates',
    apiPath: '/api/certificates',
    adminPath: '/api/admin/certificates',
    fields: [
      { name: 'title.en', label: 'Title (English)', type: 'text', required: true },
      { name: 'title.ar', label: 'Title (Arabic)', type: 'text', required: true },
      { name: 'issuer', label: 'Issuer', type: 'text', required: true },
      { name: 'date', label: 'Issue Date', type: 'date', required: true },
      { name: 'credentialUrl', label: 'Credential URL', type: 'text' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    displayField: 'title',
  },
  blog: {
    title: 'Blog',
    apiPath: '/api/blog',
    adminPath: '/api/admin/blog',
    arrayFields: ['tags'],
    fields: [
      { name: 'title.en', label: 'Title (English)', type: 'text', required: true },
      { name: 'title.ar', label: 'Title (Arabic)', type: 'text', required: true },
      { name: 'excerpt.en', label: 'Excerpt (English)', type: 'textarea' },
      { name: 'excerpt.ar', label: 'Excerpt (Arabic)', type: 'textarea' },
      { name: 'content.en', label: 'Content (English)', type: 'textarea' },
      { name: 'content.ar', label: 'Content (Arabic)', type: 'textarea' },
      { name: 'tags', label: 'Tags (comma separated)', type: 'text' },
      { name: 'coverImage', label: 'Cover Image', type: 'image' },
      { name: 'externalUrl', label: 'External URL', type: 'text' },
      { name: 'publishedAt', label: 'Published Date', type: 'date' },
    ],
    displayField: 'title',
  },
};

export default function ContentManager() {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = CONTENT_CONFIG[type];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const { data } = await api.get(config.apiPath);
      setItems(data.data || []);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (!config) return;
    const timer = setTimeout(fetchItems, 0);
    return () => clearTimeout(timer);
  }, [config, fetchItems]);

  if (!config) return (
    <div className="text-center py-12">
      <p className="text-red-500">Unknown content type</p>
      <Link to="/admin" className="text-emerald-600 hover:underline mt-2 inline-block">Back to Dashboard</Link>
    </div>
  );

  const resetForm = () => {
    setEditing(null);
    setForm({});
  };

  const startEdit = (item) => {
    setEditing(item._id);
    const formData = { ...item };
    (config.arrayFields || []).forEach(field => {
      if (Array.isArray(formData[field])) {
        formData[field] = formData[field].join(', ');
      }
    });
    setForm(formData);
  };

  const handleChange = (field, value) => {
    setForm((prev) => setNested(prev, field, value));
  };

  const handleImageUpload = async (field, file) => {
    setUploading(field);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        handleChange(field, data.data.url);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      (config.arrayFields || []).forEach(field => {
        if (typeof body[field] === 'string') {
          body[field] = body[field].split(',').map(s => s.trim()).filter(Boolean);
        }
      });
      if (editing && editing !== 'new') {
        await api.put(`${config.adminPath}/${editing}`, body);
      } else {
        await api.post(config.adminPath, body);
      }
      resetForm();
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${config.adminPath}/${id}`);
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatValue = (item, field) => {
    const val = getNested(item, field);
    if (val && typeof val === 'object' && val.en) return val.en;
    if (Array.isArray(val)) return val.join(', ');
    if (field.includes('Url') || field.includes('url')) return val ? `${val.slice(0, 30)}...` : '—';
    return val || '—';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-white">{config.title}</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">{items.length} items</p>
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all">
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {/* Form */}
      {(editing === 'new' || editing) && editing !== deleteConfirm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-heading font-semibold text-stone-900 dark:text-white mb-4">
            {editing === 'new' ? `New ${config.title.slice(0, -1)}` : 'Edit Item'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map(({ name, label, type, required, options }) => (
              <div key={name} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                {type === 'select' ? (
                  <select value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                    <option value="">Select...</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : type === 'textarea' ? (
                  <textarea value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-y" />
                ) : type === 'image' ? (
                  <div>
                    {getNested(form, name) && (
                      <div className="relative mb-2 inline-block">
                        <img src={getNested(form, name)} alt="Preview" className="h-24 rounded-lg object-cover border border-stone-200 dark:border-slate-700" />
                        <button type="button" onClick={() => handleChange(name, '')}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 transition-all">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-3 py-2 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium transition-all border border-dashed border-stone-300 dark:border-slate-600">
                        Choose File
                        <input type="file" accept="image/*" className="hidden" disabled={uploading === name}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(name, file);
                          }} />
                      </label>
                      {uploading === name && <Spinner size="sm" />}
                    </div>
                    <input type="text" value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                      placeholder="Or paste image URL..."
                      className="w-full mt-2 px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                  </div>
                ) : (
                  <input type={type} value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all">
              <Check size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={resetForm}
              className="px-4 py-2 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-stone-500 dark:text-stone-400">No items yet</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-stone-200 dark:divide-slate-800">
            {items.map((item) => {
              const isEditing = editing === item._id;
              return (
                <div key={item._id} className={`p-4 flex items-center justify-between ${isEditing ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 dark:text-white truncate">
                      {item[config.displayField]?.en || item[config.displayField] || 'Untitled'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {config.fields.slice(0, 3).map((f) => (
                        <span key={f.name} className="text-xs text-stone-500 dark:text-stone-400">
                          {f.label}: {formatValue(item, f.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!isEditing && (
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button onClick={() => startEdit(item)}
                        className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 hover:text-emerald-600 transition-all">
                        <Edit3 size={16} />
                      </button>
                      {deleteConfirm === item._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-all text-xs font-medium">
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 transition-all">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(item._id)}
                          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 hover:text-red-600 transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
