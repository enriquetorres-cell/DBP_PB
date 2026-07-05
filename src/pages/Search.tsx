import { Fragment, useState, type FormEvent } from 'react';
import { ApiError, bookFlight, searchFlights } from '../api';
import { useAuth } from '../context/AuthContext';
import { addBookingId } from '../bookingStore';
import { formatDateTime } from '../format';
import type { Flight } from '../types';

/** Turn a value from <input type="datetime-local"> into ISO-8601 (UTC). */
function toIso(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function Search() {
  const { isAuthenticated } = useAuth();

  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [results, setResults] = useState<Flight[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Per-flight booking feedback, keyed by flight id.
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookingMsg, setBookingMsg] = useState<{
    flightId: number;
    text: string;
    ok: boolean;
  } | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBookingMsg(null);
    setLoading(true);
    try {
      const res = await searchFlights({
        flightNumber: flightNumber.trim() || undefined,
        airlineName: airlineName.trim() || undefined,
        estDepartureTimeFrom: toIso(from),
        estDepartureTimeTo: toIso(to),
      });
      setResults(res.items ?? []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Error al buscar vuelos.'
      );
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (flight: Flight) => {
    setBookingMsg(null);
    setBookingId(flight.id);
    try {
      const res = await bookFlight(flight.id);
      addBookingId(res.id);
      setBookingMsg({
        flightId: flight.id,
        text: `¡Reserva confirmada! ID de reserva: ${res.id}`,
        ok: true,
      });
    } catch (err) {
      setBookingMsg({
        flightId: flight.id,
        text:
          err instanceof ApiError ? err.message : 'No se pudo reservar el vuelo.',
        ok: false,
      });
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Buscar vuelos</h1>
        <p className="subtitle">Encuentra tu próximo destino</p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="grid-2">
            <label>
              Número de vuelo
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Ej. LA123"
              />
            </label>
            <label>
              Aerolínea
              <input
                type="text"
                value={airlineName}
                onChange={(e) => setAirlineName(e.target.value)}
                placeholder="Ej. LATAM"
              />
            </label>
            <label>
              Salida desde
              <input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              Salida hasta
              <input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}
      </div>

      {results !== null && (
        <div className="card">
          {results.length === 0 ? (
            <div className="empty">
              🔎 No se encontraron vuelos con esos criterios. Prueba con otra
              búsqueda.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vuelo</th>
                    <th>Aerolínea</th>
                    <th>Salida</th>
                    <th>Llegada</th>
                    <th>Asientos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((f) => (
                    <Fragment key={f.id}>
                      <tr>
                        <td>{f.flightNumber}</td>
                        <td>{f.airlineName}</td>
                        <td>{formatDateTime(f.estDepartureTime)}</td>
                        <td>{formatDateTime(f.estArrivalTime)}</td>
                        <td>{f.availableSeats}</td>
                        <td>
                          {isAuthenticated ? (
                            <button
                              type="button"
                              className="btn-book"
                              disabled={
                                bookingId === f.id || f.availableSeats <= 0
                              }
                              onClick={() => handleBook(f)}
                            >
                              {bookingId === f.id ? 'Reservando…' : 'Reservar'}
                            </button>
                          ) : (
                            <span className="muted-sm">Inicia sesión</span>
                          )}
                        </td>
                      </tr>
                      {bookingMsg && bookingMsg.flightId === f.id && (
                        <tr>
                          <td colSpan={6}>
                            <div
                              className={`alert ${
                                bookingMsg.ok ? 'alert-success' : 'alert-error'
                              } inline`}
                            >
                              {bookingMsg.text}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
