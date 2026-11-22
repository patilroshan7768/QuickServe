import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage, getFieldErrors } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FormField from './FormField';
import { TIME_SLOTS } from '../utils/constants';
import { formatTime, todayISO } from '../utils/format';

const PHONE_REGEX = /^\+?[0-9]{10,13}$/;

export default function BookingForm({ service }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = todayISO();

  const [form, setForm] = useState({
    bookingDate: '', bookingTime: '', phone: user?.phone || '', address: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError('');
  };

  // For today's date, slots that have already passed are disabled.
  const slotPassed = (slot) =>
    form.bookingDate === today && new Date(`${today}T${slot}:00`) <= new Date();

  const validate = () => {
    const next = {};
    if (!form.bookingDate) next.bookingDate = 'Select a date';
    else if (form.bookingDate < today) next.bookingDate = 'Date cannot be in the past';
    if (!form.bookingTime) next.bookingTime = 'Select a time slot';
    else if (slotPassed(form.bookingTime)) next.bookingTime = 'That time has already passed';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    else if (!PHONE_REGEX.test(form.phone.trim())) next.phone = 'Enter a valid phone number (10 to 13 digits)';
    if (!form.address.trim()) next.address = 'Address is required';
    else if (form.address.trim().length > 500) next.address = 'Address must be at most 500 characters';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError('');
    try {
      await api.post('/bookings', {
        serviceId: service.id,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      navigate('/my-bookings', { replace: true, state: { justBooked: true } });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setServerError(getErrorMessage(err, 'Could not create the booking.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <FormField label="Full name" id="name" value={user?.name || ''} readOnly
                 className="bg-slate-50" hint="Taken from your account." />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Appointment date" id="bookingDate" name="bookingDate" type="date"
                   min={today} value={form.bookingDate} onChange={handleChange} error={errors.bookingDate} />
        <div>
          <label htmlFor="bookingTime" className="mb-1.5 block text-sm font-medium text-slate-700">Time slot</label>
          <select id="bookingTime" name="bookingTime" value={form.bookingTime} onChange={handleChange}
                  className={`input ${errors.bookingTime ? 'border-red-400' : ''}`}>
            <option value="">Select a time</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot} disabled={slotPassed(slot)}>{formatTime(slot)}</option>
            ))}
          </select>
          {errors.bookingTime && <p className="mt-1.5 text-sm text-red-600">{errors.bookingTime}</p>}
        </div>
      </div>

      <FormField label="Phone number" id="phone" name="phone" type="tel" autoComplete="tel"
                 placeholder="9876543210" value={form.phone} onChange={handleChange} error={errors.phone} />

      <div>
        <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">Service address</label>
        <textarea id="address" name="address" rows={3} placeholder="House no., street, area, city"
                  value={form.address} onChange={handleChange}
                  className={`input ${errors.address ? 'border-red-400' : ''}`} />
        {errors.address && <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
