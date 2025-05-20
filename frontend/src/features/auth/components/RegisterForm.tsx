import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export function RegisterForm() {
  const { t } = useTranslation();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    if (!firstName.trim()) {
      setError(t('auth.register.errors.firstNameRequired'));
      return false;
    }
    if (!lastName.trim()) {
      setError(t('auth.register.errors.lastNameRequired'));
      return false;
    }
    if (!email.trim()) {
      setError(t('auth.register.errors.emailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.register.errors.emailInvalid'));
      return false;
    }
    if (!password) {
      setError(t('auth.register.errors.passwordRequired'));
      return false;
    }
    if (password.length < 8) {
      setError(t('auth.register.errors.passwordLength'));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('auth.register.errors.passwordsMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await authService.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password
      });
      
      login(
        response.access_token,
        response.refresh_token,
        response.email,
        response.role
      );
      
      navigate('/');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || t('auth.register.errors.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t('auth.register.title')}</CardTitle>
        <CardDescription className="text-center">
          {t('auth.register.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('auth.register.firstName')}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('auth.register.lastName')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.register.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.register.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="*********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('auth.register.creating') : t('auth.register.submit')}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter>
        <p className="text-center w-full text-sm">
          {t('auth.register.haveAccount')}{' '}
          <a href="login" className="text-blue-600 hover:underline">
            {t('auth.register.login')}
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}