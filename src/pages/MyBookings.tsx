import { useEffect, useState } from 'react';
import { ApiError, getBooking } from '../api';
import { getBookingIds } from '../bookingStore';
import { formatDateTime } from '../format';
import type { Booking } from '../types';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ids = getBookingIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.allSettled(ids.map((id) => getBooking(id)))
      .then((results) => {
        if (cancelled) return;
        const ok = results
          .filter(
            (r): r is PromiseFulfilledResult<Booking> =>
              r.status === 'fulfilled'
          )
          .map((r) => r.value);
        setBookings(ok);
        if (ok.length === 0 && results.length > 0) {
          setError('No se pudieron cargar tus reservas.');
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof ApiError ? err.message : 'Error al cargar reservas.'
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h1>Mis Reservas</h1>
        <p className="subtitle">Tus vuelos reservados</p>

        {loading && <p className="muted">Cargando…</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="empty">
            🎫 Aún no tienes reservas. Ve a{' '}
            <strong>Búsqueda</strong> para reservar un vuelo.
          </div>
        )}

        {bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Vuelo</th>
                  <th>Salida</th>
                  <th>Llegada</th>
                  <th>Fecha de reserva</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.flightNumber}</td>
                    <td>{formatDateTime(b.estDepartureTime)}</td>
                    <td>{formatDateTime(b.estArrivalTime)}</td>
                    <td>{formatDateTime(b.bookingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
