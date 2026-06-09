import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../../assets/logo-white.png';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLoginMutation } from '../../redux/services/userApi';
import { setUser } from '../../redux/reducers/authReducers';

const LoginPage = () => {
  const [login, { isLoading }] = useLoginMutation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await login({
        email,
        password,
      });

      if (response?.data?.success) {
        dispatch(setUser(response.data.data));
        navigate('/chat');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err?.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* Background Effects */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 flex w-full">
        {/* Left Section */}
        <div className="hidden w-1/2 flex-col justify-center px-16 xl:flex">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-26 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg p-2 flex-shrink-0">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  SMS Search
                </h1>
                {/* <p className="text-slate-400">
                  Safety Management System
                </p> */}
              </div>
            </div>

            <h2 className="mb-2 text-5xl font-bold leading-tight text-white">
              Operational Excellence
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Through Knowledge
              </span>
            </h2>

            <p className="mb-5 text-lg leading-relaxed text-slate-300">
              A unified platform for accessing safety procedures, compliance
              documentation, operational standards, and organizational knowledge.
            </p>

            <div className="space-y-5">
              {[
                'Safety Management Resources',
                'Compliance Documentation',
                'Risk & Audit Information',
                'Intelligent Knowledge Discovery',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex w-full items-center justify-center px-6 py-10 xl:w-1/2">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
            {/* Mobile Logo */}
            <div className="mb-8 text-center xl:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600">
                <span className="text-xl font-bold text-white">S</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                SMS AI
              </h2>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome to SMS Search
              </h1>

              {/* <p className="mt-2 text-sm text-slate-500">
                Safety Management System
              </p> */}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <Input
                  type="email"
                  value={email}
                  required
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    required
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-300 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 font-medium text-white shadow-lg transition-all hover:scale-[1.01]"
              >
                {isLoading ? 'Logging In...' : 'Log In'}
              </Button>
            </form>

            {/* <div className="mt-8 border-t border-slate-200 pt-5 text-center">
              <p className="text-xs text-slate-400">
                Secure access to Safety Management System
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;