export type UserRole = 'ADMIN' | 'USER';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  email: string;
  role: UserRole;
}