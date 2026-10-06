import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import Spinner from '../../components/Spinner';
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
    titleKey: 'admin_nav_projects',
    newKey: 'admin_cm_new_project',
    apiPath: '/api/projects',
    adminPath: '/api/admin/projects',
    arrayFields: ['stack'],
    fields: [
      { name: 'title.en', labelKey: 'admin_field_title_en', type: 'text', required: true },
      { name: 'title.ar', labelKey: 'admin_field_title_ar', type: 'text', required: true },
      { name: 'description.en', labelKey: 'admin_field_description_en', type: 'textarea', required: true },
      { name: 'description.ar', labelKey: 'admin_field_description_ar', type: 'textarea', required: true },
      { name: 'category', labelKey: 'admin_field_category', type: 'select', required: true, options: ['backend', 'frontend', 'fullstack', 'simple'], optionPrefix: 'admin_cat_' },
      { name: 'stack', labelKey: 'admin_field_stack', type: 'text' },
      { name: 'links.github', labelKey: 'admin_field_github', type: 'text' },
      { name: 'links.frontend', labelKey: 'admin_field_frontend', type: 'text' },
      { name: 'links.backend', labelKey: 'admin_field_backend', type: 'text' },
      { name: 'links.admin', labelKey: 'admin_field_admin_url', type: 'text' },
      { name: 'image', labelKey: 'admin_field_image', type: 'image' },
      { name: 'order', labelKey: 'admin_field_order', type: 'number' },
    ],
    displayField: 'title',
  },
  skills: {
    titleKey: 'admin_nav_skills',
    newKey: 'admin_cm_new_skill',
    apiPath: '/api/skills',
    adminPath: '/api/admin/skills',
    fields: [
      { name: 'name', labelKey: 'admin_field_name', type: 'text', required: true },
      { name: 'category', labelKey: 'admin_field_category', type: 'select', options: ['frontend', 'backend', 'tools'], optionPrefix: 'admin_cat_' },
      { name: 'icon', labelKey: 'admin_field_icon', type: 'text' },
      { name: 'order', labelKey: 'admin_field_order', type: 'number' },
    ],
    displayField: 'name',
  },
  experience: {
    titleKey: 'admin_nav_experience',
    newKey: 'admin_cm_new_experience',
    apiPath: '/api/experience',
    adminPath: '/api/admin/experience',
    fields: [
      { name: 'title.en', labelKey: 'admin_field_role_en', type: 'text', required: true },
      { name: 'title.ar', labelKey: 'admin_field_role_ar', type: 'text', required: true },
      { name: 'organization.en', labelKey: 'admin_field_company_en', type: 'text', required: true },
      { name: 'organization.ar', labelKey: 'admin_field_company_ar', type: 'text', required: true },
      { name: 'startDate', labelKey: 'admin_field_start_date', type: 'date', required: true },
      { name: 'endDate', labelKey: 'admin_field_end_date', type: 'date' },
      { name: 'description.en', labelKey: 'admin_field_description_en', type: 'textarea' },
      { name: 'description.ar', labelKey: 'admin_field_description_ar', type: 'textarea' },
      { name: 'order', labelKey: 'admin_field_order', type: 'number' },
    ],
    displayField: 'title',
  },
  certificates: {
    titleKey: 'admin_nav_certificates',
    newKey: 'admin_cm_new_certificate',
    apiPath: '/api/certificates',
    adminPath: '/api/admin/certificates',
    fields: [
      { name: 'title.en', labelKey: 'admin_field_title_en', type: 'text', required: true },
      { name: 'title.ar', labelKey: 'admin_field_title_ar', type: 'text', required: true },
      { name: 'issuer', labelKey: 'admin_field_issuer', type: 'text', required: true },
      { name: 'date', labelKey: 'admin_field_issue_date', type: 'date', required: true },
      { name: 'credentialUrl', labelKey: 'admin_field_credential_url', type: 'text' },
      { name: 'image', labelKey: 'admin_field_image', type: 'image' },
      { name: 'order', labelKey: 'admin_field_order', type: 'number' },
    ],
    displayField: 'title',
  },
  blog: {
    titleKey: 'admin_nav_blog',
    newKey: 'admin_cm_new_blog',
    apiPath: '/api/blog',
    adminPath: '/api/admin/blog',
    arrayFields: ['tags'],
    fields: [
      { name: 'title.en', labelKey: 'admin_field_title_en', type: 'text', required: true },
      { name: 'title.ar', labelKey: 'admin_field_title_ar', type: 'text', required: true },
      { name: 'excerpt.en', labelKey: 'admin_field_excerpt_en', type: 'textarea' },
      { name: 'excerpt.ar', labelKey: 'admin_field_excerpt_ar', type: 'textarea' },
      { name: 'content.en', labelKey: 'admin_field_content_en', type: 'textarea' },
      { name: 'content.ar', labelKey: 'admin_field_content_ar', type: 'textarea' },
      { name: 'tags', labelKey: 'admin_field_tags', type: 'text' },
      { name: 'coverImage', labelKey: 'admin_field_cover_image', type: 'image' },
      { name: 'externalUrl', labelKey: 'admin_field_external_url', type: 'text' },
      { name: 'publishedAt', labelKey: 'admin_field_published_date', type: 'date' },
    ],
    displayField: 'title',
  },
};

export default function ContentManager() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
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
      setError(t('admin_cm_load_error'));
    } finally {
      setLoading(false);
    }
  }, [config, t]);

  useEffect(() => {
    if (!config) return;
    const timer = setTimeout(fetchItems, 0);
    return () => clearTimeout(timer);
  }, [config, fetchItems]);

  if (!config) return (
    <div className="text-center py-12">
      <p className="text-red-500">{t('admin_cm_unknown_type')}</p>
      <Link to="/admin" className="text-emerald-600 hover:underline mt-2 inline-block">
        {t('admin_cm_back')}
      </Link>
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
      setError(err.response?.data?.message || t('admin_cm_upload_error'));
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
      setError(err.response?.data?.message || t('admin_cm_save_error'));
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
      setError(err.response?.data?.message || t('admin_cm_delete_error'));
    }
  };

  const formatValue = (item, field) => {
    const val = getNested(item, field);
    if (val && typeof val === 'object') return val[lang] || val.en || val.ar || '—';
    if (Array.isArray(val)) return val.join(', ');
    if (field.includes('Url') || field.includes('url')) return val ? `${val.slice(0, 30)}...` : '—';
    return val || '—';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')} 
            aria-label={t('admin_cm_back')}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500"
          >
            <ArrowLeft size={20} className="rtl:rotate-180 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-white">
              {t(config.titleKey)}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t('admin_cm_items_count', { count: items.length })}
            </p>
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all">
            <Plus size={16} /> {t('admin_cm_add_new')}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label={t('admin_cm_dismiss_error')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Form */}
      {(editing === 'new' || editing) && editing !== deleteConfirm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-heading font-semibold text-stone-900 dark:text-white mb-4">
            {editing === 'new' ? t(config.newKey || 'admin_cm_new_item', { type: t(config.titleKey) }) : t('admin_cm_edit_item')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map(({ name, labelKey, type: fieldType, required, options, optionPrefix }) => (
              <div key={name} className={fieldType === 'textarea' ? 'md:col-span-2' : ''}>
                <label htmlFor={`field-${name}`} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t(labelKey)} {required && <span className="text-red-500">*</span>}
                </label>
                {fieldType === 'select' ? (
                  <select id={`field-${name}`} value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                    <option value="">{t('admin_field_select_placeholder')}</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {optionPrefix ? t(optionPrefix + opt) : opt}
                      </option>
                    ))}
                  </select>
                ) : fieldType === 'textarea' ? (
                  <textarea id={`field-${name}`} value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-y" />
                ) : fieldType === 'image' ? (
                  <div>
                    {getNested(form, name) && (
                      <div className="relative mb-2 inline-block">
                        <img 
                          src={getNested(form, name)} 
                          alt={t('admin_field_image_preview')} 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="h-24 rounded-lg object-cover border border-stone-200 dark:border-slate-700" 
                        />
                        <button type="button" onClick={() => handleChange(name, '')}
                          aria-label={t('admin_field_remove_image')}
                          className="absolute -top-2 -end-2 p-1 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 transition-all">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label htmlFor={`file-${name}`} className="cursor-pointer px-3 py-2 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium transition-all border border-dashed border-stone-300 dark:border-slate-600">
                        {t('admin_field_choose_file')}
                        <input id={`file-${name}`} type="file" accept="image/*" className="hidden" disabled={uploading === name}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(name, file);
                          }} />
                      </label>
                      {uploading === name && <Spinner size="sm" />}
                    </div>
                    <input id={`field-${name}`} type="text" value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                      placeholder={t('admin_field_paste_url')}
                      className="w-full mt-2 px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                  </div>
                ) : (
                  <input id={`field-${name}`} type={fieldType} value={getNested(form, name) || ''} onChange={(e) => handleChange(name, e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all">
              <Check size={16} /> {saving ? t('admin_cm_saving') : t('admin_cm_save')}
            </button>
            <button type="button" onClick={resetForm}
              className="px-4 py-2 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium transition-all">
              {t('admin_cm_cancel')}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-stone-500 dark:text-stone-400">
          {t('admin_cm_no_items')}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-stone-200 dark:divide-slate-800">
            {items.map((item) => {
              const isEditing = editing === item._id;
              return (
                <div key={item._id} className={`p-4 flex items-center justify-between ${isEditing ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 dark:text-white truncate">
                      {item[config.displayField]?.[lang] || item[config.displayField]?.en || item[config.displayField]?.ar || item[config.displayField] || t('admin_cm_untitled')}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {config.fields.slice(0, 3).map((f) => (
                        <span key={f.name} className="text-xs text-stone-500 dark:text-stone-400">
                          {t(f.labelKey)}: {formatValue(item, f.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!isEditing && (
                    <div className="flex items-center gap-2 ms-4 shrink-0">
                      <button onClick={() => startEdit(item)}
                        aria-label={t('admin_cm_edit')}
                        className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 hover:text-emerald-600 transition-all">
                        <Edit3 size={16} />
                      </button>
                      {deleteConfirm === item._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(item._id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-all text-xs font-medium">
                            {t('admin_cm_confirm')}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            aria-label={t('admin_cm_cancel')}
                            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 transition-all">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(item._id)}
                          aria-label={t('admin_cm_delete')}
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
