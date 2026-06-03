import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/chat');
    } catch (authError) {
      setError(authError.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-6 sm:px-6 md:px-8">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:rounded-3xl sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">Welcome back</h1>
          <p className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm">Sign in and continue your AI workflow.</p>
        </div>

        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:mb-2 sm:text-sm">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:mb-2 sm:text-sm">Password</label>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" />
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700 sm:rounded-3xl sm:px-4 sm:py-3 sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" variant="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
