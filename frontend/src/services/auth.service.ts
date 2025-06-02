const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData extends UserCredentials {
  username: string;
  // Add other fields if necessary, e.g., role, avatar etc.
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  points?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define a more specific type for express-validator errors
export interface ValidationError {
  type?: string; // express-validator type field
  msg: string;    // The error message
  path?: string;   // The parameter that caused the error (param in older versions, path in newer)
  location?: string; // e.g., body, query, params
  value?: unknown;     // Changed from any to unknown
  // For nested errors, though less common for simple validation
  // nested_errors?: ValidationError[];
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  errors?: ValidationError[]; // Use the new ValidationError type
}

export interface ApiErrorData {
  message: string;
  errors?: ValidationError[]; // Use the new ValidationError type
  // success?: false; // If your backend error response includes this
}

export class ApiError extends Error {
  status: number;
  response: ApiErrorData;
  constructor(status: number, message: string, response: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

export const register = async (userData: UserRegistrationData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data: AuthResponse | ApiErrorData = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'Registration failed', data as ApiErrorData);
  }
  return data as AuthResponse;
};

export const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data: AuthResponse | ApiErrorData = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'Login failed', data as ApiErrorData);
  }
  return data as AuthResponse;
};