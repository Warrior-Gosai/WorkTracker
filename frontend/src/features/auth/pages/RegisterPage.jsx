
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  UserPlus,
  User as UserIcon,
  Mail,
  Lock,
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { APP_NAME, ROUTES } from '../../../constants';
import { registerSchema } from '../schemas/authSchemas';

export const RegisterPage = () => {
  const { register: registerUser, setupRequired, recheckSetupStatus } = useAuth();
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
      const { confirmPassword, ...registrationData } = values;

      await registerUser({
        ...registrationData,
        confirmPassword,
      });

      await recheckSetupStatus();

      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    }
  };

  if (setupRequired === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md">
          <Layers className="w-10 h-10 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">
            Setup Already Completed
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            An account already exists. Registration is disabled.
          </p>
          <Button
            type="button"
            variant="primary"
            className="w-full mt-6"
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md mx-auto mb-4">
          <Layers className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Initial Setup
        </h2>

        <p className="mt-1.5 text-xs text-slate-500">
          Create your {APP_NAME} administrator account
        </p>
      </div>

      {/* Registration Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-xl border border-slate-200">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
              className="mb-5"
            />
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <Input
              label="Username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Choose a username"
              leftIcon={UserIcon}
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="developer@example.com"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Create a password"
              leftIcon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              leftIcon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full mt-2"
              icon={UserPlus}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Registration is available only during initial setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
