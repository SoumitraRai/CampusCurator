'use client';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import Link from 'next/link';

async function fetchDrive(id) {
  const res = await api.get(`/drives/${id}`);
  return res.data || res.drive || res;
}

export default function DriveDetail({ params }) {
  const id = params.id;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(['drive', id], () => fetchDrive(id));
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const router = useRouter();

  const createGroupMutation = useMutation(async (payload) => {
    const res = await api.post(`/groups`, { body: payload });
    return res;
  }, {
    onSuccess: () => qc.invalidateQueries(['drive', id])
  });

  const joinGroupMutation = useMutation(async (payload) => {
    const res = await api.post('/groups/join', { body: payload });
    return res;
  }, {
    onSuccess: () => qc.invalidateQueries(['drive', id])
  });

  if (isLoading) return <div className="py-8 container mx-auto">Loading...</div>;
  if (!data) return <div className="py-8 container mx-auto">Drive not found</div>;

  const drive = data.data || data.drive || data;

  const onCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await createGroupMutation.mutateAsync({ driveId: id, name, maxMembers: drive.maxGroupSize });
      setName('');
      router.push('/drives');
    } catch (err) {
      alert(err.message || 'Failed to create group');
    }
  };

  const onJoin = async (e) => {
    e.preventDefault();
    try {
      await joinGroupMutation.mutateAsync({ inviteCode, driveId: id });
      setInviteCode('');
      alert('Join request submitted');
    } catch (err) {
      alert(err.message || 'Failed to join group');
    }
  };

  return (
    <div className="py-8 container mx-auto px-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{drive.name}</h1>
          <p className="text-sm text-gray-600">{drive.description}</p>
          <div className="mt-3 text-sm text-gray-500">Current stage: {drive.currentStage}</div>
        </div>
        <div>
          <Link href="/" className="text-sm text-blue-600">Back</Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h2 className="font-medium mb-3">Create Group (Leader)</h2>
          <form onSubmit={onCreateGroup} className="space-y-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Group name" className="w-full border p-2 rounded" />
            <button className="bg-green-600 text-white px-3 py-1 rounded">Create Group</button>
          </form>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-medium mb-3">Join Group (Member)</h2>
          <form onSubmit={onJoin} className="space-y-2">
            <input value={inviteCode} onChange={(e)=>setInviteCode(e.target.value)} placeholder="Invitation code" className="w-full border p-2 rounded" />
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Request to Join</button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">Existing Groups</h3>
        <div className="space-y-3">
          {(drive.groups || []).map(g => (
            <div key={g._id} className="border p-3 rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-gray-500">Leader: {g.leaderName || g.leader}</div>
                </div>
                <div>
                  <Link href={`/groups/${g._id}`} className="text-sm text-blue-600">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}