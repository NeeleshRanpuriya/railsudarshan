const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'railraksha_access_token';

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Backend unavailable at ${API_BASE || 'the current frontend host'}. Start the backend or check VITE_API_BASE_URL.`
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Authentication request failed');
  }
  return payload;
}

export async function registerWithBackend(user) {
  const payload = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  });
  localStorage.setItem(TOKEN_KEY, payload.token);
  return payload.user;
}

export async function loginWithBackend({ mobile, password, pin }) {
  const payload = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password, pin }),
  });
  localStorage.setItem(TOKEN_KEY, payload.token);
  return payload.user;
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function authenticatedRequest(path, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('You must be logged in to access bookings.');
  }

  return request(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export async function fetchBookings() {
  const payload = await authenticatedRequest('/bookings');
  return payload.bookings.map((item) => ({
    ...item.booking,
    backendBookingId: item._id,
    bookingStage: item.status,
  }));
}

export async function saveBooking(booking) {
  if (!booking || typeof booking !== 'object') {
    throw new Error('Booking details are missing. Please reopen the payment summary and try again.');
  }

  const payload = await authenticatedRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      booking: { ...booking },
      status: booking.bookingStage || booking.status || 'Confirmed',
    }),
  });
  return {
    ...payload.booking.booking,
    backendBookingId: payload.booking._id,
    bookingStage: payload.booking.status,
  };
}

export async function cancelBooking(bookingId, refundInfo) {
  if (!bookingId) return null;
  const payload = await authenticatedRequest(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ refundInfo }),
  });
  return payload.booking;
}
