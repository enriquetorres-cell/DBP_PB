// Persists the IDs of bookings this user has made in localStorage, so the
// "Mis Reservas" screen can list them (the backend has no "list my bookings"
// endpoint — only GET /flights/book/{id}).

const KEY = 'bookingIds';

export function getBookingIds(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function addBookingId(id: number): void {
  const ids = getBookingIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(KEY, JSON.stringify(ids));
  }
}

export function clearBookingIds(): void {
  localStorage.removeItem(KEY);
}
