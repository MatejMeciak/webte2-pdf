import axios from 'axios';

const API_URL = '/api/auth';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>('/api/auth/register', data);
    
    if (response.data.accessToken) {
      // Store tokens if needed
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const login = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${import.meta.env.VITE_API_URL}/auth/login`, {
      email: data.email,
      password: data.password
    });
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Nesprávne prihlasovacie údaje';
      throw new Error(message);
    }
    throw new Error('Nastala neočakávaná chyba');
  }
};
