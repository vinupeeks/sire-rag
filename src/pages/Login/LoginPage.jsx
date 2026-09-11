import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../../assets/logo-white.png';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLoginMutation } from '../../redux/services/userApi';
import { setUser } from '../../redux/reducers/authReducers';
import { ROUTES } from '../../constants/routes';

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
      navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS);
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
        navigate(ROUTES.OPERATOR_COMMENTS_FROM_REPORT_INSPECTIONS);
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

      <div className="relative z-10 flex w-[80%]">

        <div className="hidden w-1/2 flex-col justify-center xl:flex ml-20">
          <div className="max-w-2xl">
            <div className="mb-4 flex flex-col items-start gap-1">
              {/* Row 1: Logo */}
              <div className="flex h-10 w-26 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg p-2 flex-shrink-0">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Row 2: Title */}
              <div>
                <h1 className="text-4xl font-bold text-white">
                 Marine Operator Assistant
                </h1>
              </div>
            </div>

            {/* Row 3: Subtitle block */}
            <h2 className="text-2xl font-bold leading-tight text-white">
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Operational Excellence
                Through Knowledge
              </span>
            </h2>

            <span className="block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-lg font-semibold text-transparent">
              Draft operator comments and search the safety management system, in one place.
            </span>

            <div className="w-[413px] space-y-[14px] py-4">
              {/* Operator comments */}
              <div className="h-[68px] rounded-[10px] bg-[#112f4a] px-8 py-[14px]">
                <h3 className="text-[16px] font-medium leading-5 text-white">
                  Operator Comments Assistant
                </h3>
                <p className="text-[14px] leading-5 text-[#8eb5d8]">
                  Draft, review, refine
                </p>
              </div>

              {/* SMS search */}
              <div className="h-[68px] rounded-[10px] bg-[#112f4a] px-8 py-[14px]">
                <h3 className="text-[16px] font-medium leading-5 text-white">
                  Safety Management Search
                </h3>
                <p className="text-[14px] leading-5 text-[#8eb5d8]">
                  Procedures, file uploads & chat
                </p>
              </div>
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
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Safety Operations & Operator Assistance
              </p>
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
                {isLoading ? 'Logging In...' : 'Login'}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;