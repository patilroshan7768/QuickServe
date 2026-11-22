import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import api, { getErrorMessage, getFieldErrors } from '../../api/axios';
import FormField from '../FormField';
import LoadingSpinner from '../LoadingSpinner';
import ServiceImage from '../ServiceImage';
import { CATEGORIES } from '../../utils/constants';
import { formatPrice } from '../../utils/format';

const EMPTY = { name: '', category: '', price: '', imageUrl: '', description: '' };

function ServiceModal({ service, onClose, onSaved }) {
  const [form, setForm] = useState(
    service ? { ...service, price: String(service.price), imageUrl: service.imageUrl || '' } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.category.trim()) next.category = 'Category is required';
    if (!form.price || Number(form.price) <= 0) next.price = 'Price must be greater than 0';
    if (!form.description.trim()) next.description = 'Description is required';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setServerError('');
    const payload = {
      name: form.name.trim(), category: form.category.trim(), price: Number(form.price),
      imageUrl: form.imageUrl.trim(), description: form.description.trim(),
    };
    try {
      const { data } = service
        ? await api.put(`/services/${service.id}`, payload)
        : await api.post('/services', payload);
      onSaved(data, !service);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setServerError(getErrorMessage(err, 'Could not save the service.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="card w-full max-w-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{service ? 'Edit service' : 'Add service'}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        {serverError && <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <FormField label="Name" id="svc-name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormField label="Category" id="svc-category" name="category" list="category-options"
                         value={form.category} onChange={handleChange} error={errors.category} />
              <datalist id="category-options">
                {CATEGORIES.map((c) => <option key={c.name} value={c.name} />)}
              </datalist>
            </div>
            <FormField label="Price (INR)" id="svc-price" name="price" type="number" min="1" step="0.01"
                       value={form.price} onChange={handleChange} error={errors.price} />
          </div>
          <FormField label="Image URL (optional)" id="svc-image" name="imageUrl" type="url"
                     placeholder="https://images.unsplash.com/..." value={form.imageUrl}
                     onChange={handleChange} error={errors.imageUrl} />
          <div>
            <label htmlFor="svc-desc" className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea id="svc-desc" name="description" rows={4} value={form.description} onChange={handleChange}
                      className={`input ${errors.description ? 'border-red-400' : ''}`} />
            {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { service } where service is null for "add"
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/services')
      .then(({ data }) => { if (!cancelled) setServices(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, 'Could not load services.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSaved = (saved, isNew) => {
    setServices((list) => (isNew ? [...list, saved] : list.map((s) => (s.id === saved.id ? saved : s)))
      .sort((a, b) => a.name.localeCompare(b.name)));
    setModal(null);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${service.name}"? If it has bookings it will be hidden instead of removed.`)) return;
    setDeletingId(service.id);
    setError('');
    try {
      await api.delete(`/services/${service.id}`);
      setServices((list) => list.filter((s) => s.id !== service.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete the service.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Manage Services</h2>
        <button onClick={() => setModal({ service: null })} className="btn-primary"><Plus size={18} /> Add Service</button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <LoadingSpinner label="Loading services..." />}
      {!loading && services.length === 0 && !error && (
        <div className="card mt-6 p-10 text-center text-slate-500">No services yet. Add your first one.</div>
      )}

      {services.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Service</th><th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th><th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ServiceImage src={s.imageUrl} alt={s.name} category={s.category} className="h-12 w-16 shrink-0 rounded-lg [&_svg]:h-5 [&_svg]:w-5" />
                      <span className="font-semibold text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.category}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(s.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModal({ service: s })} aria-label={`Edit ${s.name}`}
                              className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={17} /></button>
                      <button onClick={() => handleDelete(s)} disabled={deletingId === s.id} aria-label={`Delete ${s.name}`}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ServiceModal service={modal.service} onClose={() => setModal(null)} onSaved={handleSaved} />}
    </section>
  );
}
