import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { getErrorMessage, login } from '../api/adminApi';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err.response?.status === 401 ? 'That email and password don’t match.' : getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-full lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-11 items-center rounded-xl bg-white px-3 py-2"><img src="./ace-logo-mark.png" alt="" className="h-full w-auto object-contain" /></span>
          <span className="font-display text-lg font-semibold">ACE Computers</span>
        </div>
        <div className="mt-auto max-w-md space-y-4">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Run the shop from one place.
          </h1>
          <p className="text-white/60">Products, stock, orders and sales for acecomputerslb.com.</p>
        </div>
        {/* circuit traces, as in the logo */}
        <svg className="pointer-events-none absolute -right-10 top-24 h-80 w-80 text-brand/30" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <path d="M0 40h90v50h110M0 100h50v60h150M30 0v20h120v60" stroke="currentColor" strokeWidth="2" />
          <circle cx="90" cy="40" r="4" fill="currentColor" />
          <circle cx="50" cy="100" r="4" fill="currentColor" />
          <circle cx="150" cy="20" r="4" fill="currentColor" />
        </svg>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div className="space-y-1 lg:hidden">
            <img src="./ace-logo-mark.png" alt="" className="mb-4 h-9 w-auto object-contain" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold text-ink">Sign in</h2>
            <p className="text-sm text-muted">Use the admin email and password.</p>
          </div>
          <div>
            <label htmlFor="login-email" className="label">
              Email
            </label>
            <input id="login-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
          </div>
          <div>
            <label htmlFor="login-password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={show ? 'text' : 'password'}
                className="field pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error ? (
            <p className="rounded-lg bg-dangerSoft px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
