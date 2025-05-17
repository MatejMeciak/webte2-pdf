export type UserRole = 'ADMIN' | 'USER';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  email: string;
  role: UserRole;
}