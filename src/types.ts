export interface RegisterForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface NewIdResponse {
  id: number;
}

// GET /users/current returns only these fields (UserNoPasswordDTO on the
// backend). `username` holds the email the user registered with.
export interface UserProfile {
  id: number;
  username: string;
  role: string;
}

export interface Flight {
  id: number;
  airlineName: string;
  flightNumber: string;
  estDepartureTime: string;
  estArrivalTime: string;
  availableSeats: number;
}

export interface FlightSearchResult {
  items: Flight[];
}

export interface FlightSearchParams {
  flightNumber?: string;
  airlineName?: string;
  estDepartureTimeFrom?: string;
  estDepartureTimeTo?: string;
}

export interface Booking {
  id: number;
  bookingDate: string;
  flightId: number;
  flightNumber: string;
  estDepartureTime: string;
  estArrivalTime: string;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
}
