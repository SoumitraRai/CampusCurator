'use client';
import { useState } from 'react';
import { register } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', batch: '' });
  const [err, setErr] = useState(null);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      if (user) router.push('/dashboard');
    } catch (error) {
      setErr(error.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full name" className="w-full border p-2 rounded" />
        <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full border p-2 rounded" />
        <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="w-full border p-2 rounded" />
        <input value={form.batch} onChange={e=>setForm({...form, batch:e.target.value})} placeholder="Batch (e.g., 2025)" className="w-full border p-2 rounded" />
        {err && <div className="text-red-600">{err}</div>}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}