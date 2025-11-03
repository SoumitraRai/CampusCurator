'use client';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState, use } from 'react';
import Link from 'next/link';
import { Card, CardBody, Button, LoadingSpinner } from '@/components/UI';
import { useCurrentUser } from '@/lib/useCurrentUser';

async function fetchDrive(id) {
  const res = await api.get(`/drives/${id}`);
  return res.data || res.drive || res;
}

export default function DriveDetail({ params }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  
  const { data, isLoading } = useQuery({
    queryKey: ['drive', id],
    queryFn: () => fetchDrive(id)
  });

  const { data: myGroups } = useQuery({
    queryKey: ['myGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: driveGroups } = useQuery({
    queryKey: ['driveGroups', id],
    queryFn: async () => {
      const res = await api.get(`/groups?drive=${id}`);
      return res.data || [];
    }
  });
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const router = useRouter();

  const createGroupMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/groups`, { body: payload });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drive', id] })
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/groups/join', { body: payload });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drive', id] })
  });

  if (isLoading) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!data) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><p className="text-gray-600">Drive not found</p></div>;

  const drive = data.data || data.drive || data;

  // Check if student is already in a group for this drive
  const isAlreadyInGroup = myGroups?.some(g => (g.drive?._id || g.drive) === id);

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
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="w-full px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{drive.name}</h1>
              <p className="text-gray-700 mb-4">{drive.description}</p>
              <div className="text-sm text-gray-500">Current Stage: <span className="font-semibold text-gray-700">{drive.currentStage?.replace('-', ' ').toUpperCase()}</span></div>
            </div>
            <Link href="/drives" className="text-orange-500 hover:text-orange-600 font-medium">Back to Drives</Link>
          </div>

          {/* Show Create/Join forms only if student is NOT already in a group for this drive */}
          {!isAlreadyInGroup ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Create Group</h2>
                <form onSubmit={onCreateGroup} className="space-y-4">
                  <div>
                    <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input 
                      id="group-name"
                      value={name} 
                      onChange={(e)=>setName(e.target.value)} 
                      placeholder="Enter group name" 
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Max members: {drive.maxGroupSize}</p>
                  </div>
                  <Button type="submit" variant="primary" className="w-full">Create Group</Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Join Group</h2>
                <form onSubmit={onJoin} className="space-y-4">
                  <div>
                    <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">Invitation Code</label>
                    <input 
                      id="invite-code"
                      value={inviteCode} 
                      onChange={(e)=>setInviteCode(e.target.value)} 
                      placeholder="Enter invite code" 
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full">Request to Join</Button>
                </form>
              </CardBody>
            </Card>
          </div>
          ) : (
            <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-800 font-medium">You are already part of a group in this drive. You can view your group details in the "My Groups" section.</p>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Groups</h2>
            {(driveGroups || []).length === 0 ? (
              <p className="text-gray-500">No groups yet. Create one or join an existing group!</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {(driveGroups || []).map(g => (
                  <Card key={g._id}>
                    <CardBody>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{g.name}</h3>
                          <p className="text-sm text-gray-600">Project: {g.projectTitle || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Members: {(g.members?.length || 0) + 1} / {g.maxMembers || 4}</p>
                          <p className="text-sm text-gray-600">Leader: {g.leaderName || g.leader?.name || 'Unknown'}</p>
                          {(g.invitationCode || g.inviteCode) && (
                            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-600 font-semibold mb-1">Invite Code:</p>
                              <p className="text-sm font-mono text-blue-900">{g.invitationCode || g.inviteCode}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-col">
                          <Link href={`/groups/${g._id}`} className="text-orange-500 hover:text-orange-600 font-medium text-sm">View Details</Link>
                          {(g.invitationCode || g.inviteCode) && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(g.invitationCode || g.inviteCode);
                                alert('Invite code copied to clipboard!');
                              }}
                              className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                            >
                              Copy Code
                            </button>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}