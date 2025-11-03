'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardHeader, CardBody, CardFooter, Badge, Button, FormInput, LoadingSpinner } from '@/components/UI';

export default function SynopsisReview() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const qc = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState('approve');

  const { data: assignedGroups } = useQuery({
    queryKey: ['mentorGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      const myId = user?._id || user?.id;
      return res.data?.filter(g => g.assignedMentor?._id === myId || g.assignedMentor === myId) || [];
    },
    enabled: !!user
  });

  const { data: pendings } = useQuery({
    queryKey: ['pendingSynopsis'],
    queryFn: async () => {
      const res = await api.get('/synopsis?status=under-review');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: synopsisData } = useQuery({
    queryKey: ['groupSynopsis', selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return null;
      const res = await api.get(`/synopsis?group=${selectedGroup}`);
      return res.data?.[0];
    },
    enabled: !!selectedGroup
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/synopsis/${synopsisData._id}/review`, {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        feedback
      });
      return res.data;
    },
    onSuccess: () => {
      setFeedback('');
      setActionType('approve');
      setSelectedGroup('');
      qc.invalidateQueries({ queryKey: ['pendingSynopsis'] });
      qc.invalidateQueries({ queryKey: ['groupSynopsis'] });
      alert('Review submitted successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  });

  const handleReview = (e) => {
    e.preventDefault();
    if (!selectedGroup || !synopsisData) {
      alert('Please select a group');
      return;
    }
    reviewMutation.mutate();
  };

  if (userLoading) return <LoadingSpinner />;

  return (
    <ProtectedRole allowedRole="mentor">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Synopsis Review</h1>
              <p className="text-gray-700 mt-2">Review and approve student project synopses</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pending List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold">Pending Reviews</h2>
                    <p className="text-gray-600 text-sm mt-1">{pendings?.length || 0} waiting</p>
                  </CardHeader>
                  <CardBody>
                    {pendings && pendings.length > 0 ? (
                      <div className="space-y-3">
                        {pendings.map(s => (
                          <button
                            key={s._id}
                            onClick={() => setSelectedGroup(s.group)}
                            className={`w-full text-left p-4 rounded-lg border-l-4 transition-all ${
                              selectedGroup === s.group
                                ? 'bg-orange-50 border-orange-500 shadow-md'
                                : 'bg-yellow-50 border-yellow-400 hover:shadow'
                            }`}
                          >
                            <div className="font-semibold text-sm text-gray-900">{s.groupName}</div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">{s.title}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(s.submittedAt).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No pending reviews</p>
                        <p className="text-xs text-gray-400 mt-2">All synopses have been reviewed</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Review Form */}
              <div className="lg:col-span-2">
                {synopsisData ? (
                  <Card>
                    <CardHeader>
                      <h3 className="text-2xl font-bold text-gray-900">{synopsisData.title}</h3>
                      <Badge variant="warning" className="mt-2 inline-block">Under Review</Badge>
                    </CardHeader>
                    <CardBody>
                      <div className="mb-6 pb-6 border-b">
                        <p className="text-gray-700 leading-relaxed">{synopsisData.abstract}</p>
                        <div className="text-sm text-gray-500 mt-4 flex items-center gap-4">
                          <span>Submitted: {new Date(synopsisData.submittedAt).toLocaleDateString()}</span>
                          <span>Group: {synopsisData.groupName}</span>
                        </div>
                      </div>

                      <form onSubmit={handleReview}>
                        {/* Decision Radio */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-900 mb-3">Your Decision *</label>
                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: actionType === 'approve' ? '#10b981' : '#e5e7eb', backgroundColor: actionType === 'approve' ? '#f0fdf4' : '#f9fafb'}}>
                              <input
                                type="radio"
                                value="approve"
                                checked={actionType === 'approve'}
                                onChange={(e) => setActionType(e.target.value)}
                                className="w-4 h-4"
                              />
                              <div>
                                <p className="font-medium text-gray-900">Approve</p>
                                <p className="text-xs text-gray-600">Accept synopsis</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: actionType === 'reject' ? '#f97316' : '#e5e7eb', backgroundColor: actionType === 'reject' ? '#fff7ed' : '#f9fafb'}}>
                              <input
                                type="radio"
                                value="reject"
                                checked={actionType === 'reject'}
                                onChange={(e) => setActionType(e.target.value)}
                                className="w-4 h-4"
                              />
                              <div>
                                <p className="font-medium text-gray-900">Reject</p>
                                <p className="text-xs text-gray-600">Request revision</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Feedback {actionType === 'reject' && '*'}
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                            placeholder={actionType === 'reject' ? 'Provide specific feedback for revision...' : 'Optional feedback (suggestions, improvements)...'}
                            required={actionType === 'reject'}
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={reviewMutation.isPending}
                            variant={actionType === 'approve' ? 'success' : 'warning'}
                            size="md"
                            className="flex-1"
                          >
                            {reviewMutation.isPending ? 'Submitting...' : `${actionType === 'approve' ? 'Approve' : 'Reject'} & Submit`}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setSelectedGroup('');
                              setFeedback('');
                            }}
                            variant="outline"
                            size="md"
                            className="flex-1"
                          >
                            Clear
                          </Button>
                        </div>
                      </form>
                    </CardBody>
                  </Card>
                ) : (
                  <Card>
                    <CardBody>
                      <div className="text-center py-12">
                        <p className="text-lg text-gray-600 font-medium">No Synopsis Selected</p>
                        <p className="text-gray-500 mt-2">Select a pending review from the list to get started</p>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
