import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Check, X, Loader } from 'lucide-react';
import { supabase } from './supabaseClient';
import { debounce } from 'lodash';

const AuthPage = () => {
  // Mode state (signin/signup)
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form state
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: false,
    message: ''
  });

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasSpecial: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Check password requirements on change
  useEffect(() => {
    if (signUpForm.password) {
      setPasswordValidation({
        minLength: signUpForm.password.length >= 8,
        hasNumber: /\d/.test(signUpForm.password),
        hasUppercase: /[A-Z]/.test(signUpForm.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(signUpForm.password)
      });
    }
  }, [signUpForm.password]);

  // Check if passwords match on change
  useEffect(() => {
    if (signUpForm.confirmPassword) {
      setPasswordsMatch(signUpForm.password === signUpForm.confirmPassword);
    }
  }, [signUpForm.password, signUpForm.confirmPassword]);

  // Username validation
  const checkUsername = async (username) => {
    const cleanUsername = username.replace('@', '').trim();
    
    if (cleanUsername.length < 3) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Username must be at least 3 characters'
      });
      return;
    }

    setUsernameStatus({
      isChecking: true,
      isAvailable: false,
      message: 'Checking availability...'
    });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername);

      if (error) throw error;

      const isAvailable = data.length === 0;
      setUsernameStatus({
        isChecking: false,
        isAvailable: isAvailable,
        message: isAvailable ? 'Username is available' : 'Username is taken'
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Error checking username'
      });
    }
  };

  const debouncedCheckUsername = debounce(checkUsername, 300);

  const handleUsernameChange = (e) => {
    let newUsername = e.target.value;
    if (!newUsername.startsWith('@')) {
      newUsername = '@' + newUsername;
    }
    setSignUpForm(prev => ({ ...prev, username: newUsername }));
    if (newUsername.length > 1) {
      debouncedCheckUsername(newUsername);
    }
  };

  // Password requirement component
  const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span className={met ? 'text-green-600' : 'text-gray-600'}>{text}</span>
    </div>
  );

  // Form validation
  const validateSignUp = () => {
    if (!signUpForm.email || !signUpForm.username || !signUpForm.password || !signUpForm.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (!signUpForm.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      setError('Please meet all password requirements');
      return false;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return false;
    }

    if (!usernameStatus.isAvailable) {
      setError('Please choose an available username');
      return false;
    }

    return true;
  };

  // Handle sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateSignUp()) return;
    
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpForm.email,
        password: signUpForm.password,
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: signUpForm.username.replace('@', ''),
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render forgot password form
  if (forgotPassword) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-blue-600">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              {resetSent ? 'Check your email for the reset link!' : 'Enter your email to reset your password'}
            </p>
          </div>

          {!resetSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setError(null);
                }}
                className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We've sent you an email with a link to reset your password. 
                The link will expire in 24 hours.
              </p>
              <button
                onClick={() => {
                  setForgotPassword(false);
                  setResetSent(false);
                  setError(null);
                }}
                className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main auth form
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">WeekendSync</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={signUpForm.username}
                  onChange={handleUsernameChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none ${
                    usernameStatus.isAvailable ? 'border-green-500' : 'border-gray-300'
                  }`}
                  required
                />
                <div className="absolute right-3 top-4">
                  {usernameStatus.isChecking ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : usernameStatus.isAvailable ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : signUpForm.username.length > 1 ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {usernameStatus.message && (
                <p className={`mt-1 text-sm ${
                  usernameStatus.isAvailable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="mt-2 space-y-2">
                <PasswordRequirement 
                  met={passwordValidation.minLength} 
                  text="At least 8 characters long" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasUppercase} 
                  text="Contains uppercase letter" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasNumber} 
                  text="Contains number" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasSpecial} 
                  text="Contains special character" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  type="password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none pr-10 ${
                    signUpForm.confirmPassword 
                      ? (passwordsMatch ? 'border-green-500' : 'border-red-500')
                      : 'border-gray-300'
                  }`}
                  required
                />
                {signUpForm.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {passwordsMatch 
                      ? <Check className="w-5 h-5 text-green-500" />
                      : <X className="w-5 h-5 text-red-500" />
                    }
                  </div>
                )}
              </div>
              {signUpForm.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;