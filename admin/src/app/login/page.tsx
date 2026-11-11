'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('admin_token', data.token);
      }
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or server connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <form onSubmit={submit}>
        <div className="logo">MH</div>
        <p className="kicker">SECURE PORTFOLIO CONTROL</p>
        <h1>Welcome back.</h1>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
    </main>
  );
}
