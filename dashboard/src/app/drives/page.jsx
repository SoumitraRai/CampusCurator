'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect } from 'react';

async function fetchDrives() {
  const res = await api.get('/drives');
  // backend getDrives likely returns { success, data } or similar; handle both
  return res.data || res.drives || res;
}

export default function DrivesPage() {
  const { data, isLoading, error, refetch } = useQuery(['drives'], fetchDrives, { staleTime: 1000 * 60 * 2 });

  useEffect(() => { refetch(); }, []);

  return (
    <div className="py-8 container mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">Active Drives</h1>
      {isLoading && <div>Loading drives...</div>}
      {error && <div className="text-red-600">Error loading drives</div>}
      <div className="grid gap-4">
        {data && data.length === 0 && <div>No drives found.</div>}
        {data && data.map(d => (
          <div key={d._id} className="border p-4 rounded">
            <h2 className="text-lg font-medium"><Link href={`/drives/${d._id}`}>{d.name}</Link></h2>
            <p className="text-sm text-gray-600">{d.description}</p>
            <div className="mt-2 text-xs text-gray-500">Status: {d.status} — Current stage: {d.currentStage}</div>
          </div>
        ))}
      </div>
    </div>
  );
}