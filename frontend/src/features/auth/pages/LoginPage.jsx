import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, LogIn, Lock, User as UserIcon } from 'lucide-react';
import { loginSchema } from '../schemas/authSchemas';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { APP_NAME, ROUTES } from '../../../constants';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMessage, setErrorMessage] = useState(
    location.state?.registered
      ? null
      : location.state?.error || null
  );
  const [successMessage] = useState(
    location.state?.registered
      ? 'Initial setup complete! You can now log in with your credentials.'
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setErrorMessage(null);
    try {
      await login(values);
      const destination = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(destination, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid username, email, or password. Please try again.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md mx-auto mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to {APP_NAME}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Single-user work tracking & developer change log
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-xl border border-slate-200">
          {/* Notification Alerts */}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              className="mb-5"
            />
          )}

          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Username or Email"
              name="usernameOrEmail"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. admin or developer@example.com"
              leftIcon={UserIcon}
              error={errors.usernameOrEmail?.message}
              {...register('usernameOrEmail')}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full mt-2"
                icon={LogIn}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Single-user notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              DevWork Tracker runs in dedicated single-user mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

