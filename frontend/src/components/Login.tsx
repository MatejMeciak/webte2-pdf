import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import '../styles/Auth.css';
import { useState } from 'react';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const location = useLocation();
  const successMessage = location.state?.message;
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError(null);
      await authLogin(data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.message || 'Nastala chyba pri prihlasovaní');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <UserCircleIcon className="h-16 w-16 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Prihláste sa do svojho účtu
          </h2>
        </div>
        
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{successMessage}</div>
          </div>
        )}
        
        {loginError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{loginError}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { required: 'Email je povinný' })}
                  type="email"
                  className="auth-input pl-10"
                  placeholder="vas@email.sk"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Heslo
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', { required: 'Heslo je povinné' })}
                  type="password"
                  className="auth-input pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button type="submit" className="auth-button">
            Prihlásiť sa
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Nemáte účet? </span>
            <Link to="/register" className="auth-link font-medium">
              Zaregistrujte sa
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
