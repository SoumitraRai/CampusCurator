'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewDrivePage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    academicYear: '',
    participatingBatches: '',
    maxGroupSize: 4,
    minGroupSize: 1,
    maxGroupsPerMentor: 6
  });
  const [err, setErr] = useState(null);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        academicYear: form.academicYear,
        participatingBatches: form.participatingBatches.split(',').map(s => s.trim()),
        maxGroupSize: Number(form.maxGroupSize),
        minGroupSize: Number(form.minGroupSize),
        maxGroupsPerMentor: Number(form.maxGroupsPerMentor),
        createdBy: '' // backend will derive from token/me
      };
      await api.post('/drives', { body: payload });
      router.push('/admin');
    } catch (error) {
      setErr(error.message || 'Failed to create drive');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Create Drive</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Drive name" className="w-full border p-2 rounded" />
        <input value={form.academicYear} onChange={e=>setForm({...form, academicYear:e.target.value})} placeholder="Academic Year (e.g., 2024-2025)" className="w-full border p-2 rounded" />
        <input value={form.participatingBatches} onChange={e=>setForm({...form, participatingBatches:e.target.value})} placeholder="Participating batches (comma-separated, e.g., 2025)" className="w-full border p-2 rounded" />
        <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full border p-2 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <input value={form.maxGroupSize} onChange={e=>setForm({...form, maxGroupSize:e.target.value})} placeholder="Max group size" className="border p-2 rounded" />
          <input value={form.minGroupSize} onChange={e=>setForm({...form, minGroupSize:e.target.value})} placeholder="Min group size" className="border p-2 rounded" />
          <input value={form.maxGroupsPerMentor} onChange={e=>setForm({...form, maxGroupsPerMentor:e.target.value})} placeholder="Max groups per mentor" className="border p-2 rounded" />
        </div>

        {err && <div className="text-red-600">{err}</div>}
        <button className="bg-indigo-600 text-white px-4 py-2 rounded">Create Drive</button>
      </form>
    </div>
  );
}