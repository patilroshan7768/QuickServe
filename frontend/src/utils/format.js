export function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

// "2026-12-15" -> "15 Dec 2026"
export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// "14:30:00" -> "2:30 PM"
export function formatTime(time) {
  const [h, m] = time.split(':');
  const hour = Number(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// Today as yyyy-MM-dd in the user's local timezone.
export function todayISO() {
  return new Date().toLocaleDateString('en-CA');
}
