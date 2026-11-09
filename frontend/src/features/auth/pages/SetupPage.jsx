import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { registerSchema } from '../schemas/authSchemas';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { APP_NAME, ROUTES } from '../../../constants';

export const SetupPage = () => {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setErrorMessage(null);
    try {
      await registerAccount(values);
      // Redirect to login page upon successful account setup
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to complete initial account setup. Please verify your input.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md mx-auto mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Initial Application Setup</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Owner Account
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Welcome to {APP_NAME}. Configure your primary account to initialize and lock the application.
        </p>
      </div>

      {/* Setup Form Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-xl border border-slate-200">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
              className="mb-5"
            />
          )}

          <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">
              One-Time Administrator Registration
            </p>
            <p>
              DevWork Tracker is a single-user system. Once this account is created, all subsequent registrations are permanently disabled at both application and database levels.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. devadmin"
              leftIcon={User}
              helperText="3 to 100 characters. Used for sign in."
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="developer@example.com"
              leftIcon={Mail}
              helperText="Used for notifications and alternate sign in."
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              leftIcon={Lock}
              helperText="Between 8 and 72 characters."
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              leftIcon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full"
                icon={CheckCircle2}
              >
                Complete Setup & Initialize
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;

