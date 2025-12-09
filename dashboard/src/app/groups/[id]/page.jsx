'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Badge, StatCard, LoadingSpinner, EmptyState, Alert, Button } from '@/components/UI';
import { use, useState } from 'react';

export default function GroupDetail({ params }) {
  const { id } = use(params);
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const qc = useQueryClient();
  const router = useRouter();
  const [leaveError, setLeaveError] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data || res;
    },
    enabled: !!id
  });

  const { data: myGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['myGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ['mySubmissions'],
    queryFn: async () => {
      const res = await api.get('/submissions');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: myResults } = useQuery({
    queryKey: ['myResults'],
    queryFn: async () => {
      const res = await api.get('/results');
      return res.data || [];
    },
    enabled: !!user
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/groups/${id}/leave`);
      return res.data || res;
    },
    onSuccess: () => {
      setLeaveSuccess('You have left the group.');
      setLeaveError('');
      qc.invalidateQueries({ queryKey: ['group', id] });
      qc.invalidateQueries({ queryKey: ['myGroups'] });
      setTimeout(() => router.push('/drives'), 1200);
    },
    onError: (err) => {
      setLeaveSuccess('');
      setLeaveError(err.response?.data?.message || 'Unable to leave this group right now.');
    }
  });

  if (userLoading || groupLoading) return <LoadingSpinner />;
  if (!group) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><p className="text-gray-600">Group not found</p></div>;

  const drives = [];
  const activeDrives = drives?.filter(d => d.status === 'active').length || 0;
  const userId = user?._id || user?.id;
  const isLeader = userId && group.leader?._id?.toString() === userId.toString();
  const isMember = userId && (group.members || []).some(m => (m.student?._id || m.student)?.toString() === userId.toString());

  return (
    <ProtectedRole allowedRole="student">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Link */}
            <Link href="/drives" className="text-orange-600 hover:text-orange-700 font-medium mb-6 inline-block">
              ← Back to Drives
            </Link>

            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-700">{group.projectTitle || 'Project details not set'}</p>
            </div>

            {(leaveError || leaveSuccess) && (
              <div className="mb-6">
                {leaveError && <Alert variant="danger">{leaveError}</Alert>}
                {leaveSuccess && <Alert variant="success">{leaveSuccess}</Alert>}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard 
                label="Group Members" 
                value={(group.members?.filter(m => m.status === 'accepted').length || 0) + 1} 
                color="blue"
              />
              <StatCard 
                label="Submissions" 
                value={mySubmissions?.filter(s => s.group === id)?.length || 0} 
                color="green"
              />
              <StatCard 
                label="Mentor" 
                value={group.assignedMentor?.name ? 'Assigned' : 'Pending'} 
                color="purple"
              />
              <StatCard 
                label="Results" 
                value={myResults?.filter(r => r.group === id)?.length || 0} 
                color="orange"
              />
            </div>

            {/* Group Details Section */}
            <Card className="mb-10">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Group Information</h2>
                <p className="text-gray-600">Team details and members</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Group Name</p>
                    <p className="text-lg font-semibold text-gray-900">{group.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Group Status</p>
                    <Badge variant={group.status === 'formed' ? 'success' : 'info'}>
                      {group.status || 'pending'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Project Title</p>
                    <p className="text-lg font-semibold text-gray-900">{group.projectTitle || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Assigned Mentor</p>
                    <p className="text-lg font-semibold text-gray-900">{group.assignedMentor?.name || 'Pending Assignment'}</p>
                  </div>
                </div>

                {(isLeader || isMember) && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isPending}
                      className="text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50"
                    >
                      {leaveMutation.isPending ? 'Leaving...' : isLeader ? 'Leave group (promote next leader)' : 'Leave group'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">You cannot leave after mentor allotment.</p>
                  </div>
                )}

                {/* Members List */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                    {(group.invitationCode || group.inviteCode) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Invite Code:</p>
                        <p className="text-sm font-mono text-blue-900">{group.invitationCode || group.inviteCode}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{group.leader?.name || 'Leader'}</p>
                        <p className="text-sm text-gray-600">{group.leader?.email}</p>
                      </div>
                      <Badge variant="success">Leader</Badge>
                    </div>
                    {group.members && group.members.length > 0 ? (
                      group.members.map((m, idx) => (
                        <div key={m._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{m.student?.name || m.name || 'Member'}</p>
                            <p className="text-sm text-gray-600">{m.student?.email || m.email}</p>
                          </div>
                          <Badge variant={m.status === 'accepted' ? 'success' : m.status === 'rejected' ? 'danger' : 'warning'}>
                            {m.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 italic">No other members yet. Share the invite code above!</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Submissions Section */}
            {mySubmissions && mySubmissions.filter(s => s.group === id).length > 0 && (
              <Card className="mb-10">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
                  <p className="text-gray-600">Your checkpoint submissions and feedback</p>
                </CardHeader>
                <CardBody>
                  <div className="grid gap-4">
                    {mySubmissions.filter(s => s.group === id).map(s => (
                      <div 
                        key={s._id} 
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold uppercase text-sm text-gray-700">
                              {s.submissionType === 'logbook' && 'Logbook'}
                              {s.submissionType === 'report' && 'Report'}
                              {s.submissionType === 'ppt' && 'Presentation'}
                              {s.submissionType === 'synopsis' && 'Synopsis'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted: {new Date(s.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={s.status === 'accepted' ? 'success' : s.status === 'rejected' ? 'danger' : 'warning'}>
                            {s.status}
                          </Badge>
                        </div>
                        {s.feedback && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Feedback:</p>
                            <p className="text-sm text-blue-800">{s.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Results Section */}
            {myResults && myResults.filter(r => r.group === id).length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900">Results</h2>
                  <p className="text-gray-600">Your evaluation results and marks</p>
                </CardHeader>
                <CardBody>
                  <div className="grid gap-4">
                    {myResults.filter(r => r.group === id).map(r => (
                      <div 
                        key={r._id} 
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{r.evaluationType || 'Evaluation'}</p>
                            <p className="text-sm text-gray-600 mt-1">By: {r.mentorName || 'Mentor'}</p>
                            {r.comments && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{r.comments}"</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-orange-600">{r.marks || 'N/A'}</p>
                            <p className="text-xs text-gray-500">out of {r.totalMarks || 100}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
