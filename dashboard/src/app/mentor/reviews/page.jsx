'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardHeader, CardBody, CardFooter, Badge, Button, Alert, LoadingSpinner } from '@/components/UI';

const backendBase = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/api$/, '');
const buildFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return backendBase ? `${backendBase}${url}` : url;
};

export default function SynopsisReview() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const qc = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSynopsisId, setSelectedSynopsisId] = useState('');
  const [selectedSource, setSelectedSource] = useState(''); // 'synopsis' | 'submission'
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState('approve');
  const [pendingError, setPendingError] = useState('');

  const { data: assignedGroups } = useQuery({
    queryKey: ['mentorGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      const myId = user?._id || user?.id;
      const groups = res.data?.data || res.data || [];
      return groups.filter(g => (g.assignedMentor?._id || g.assignedMentor)?.toString() === (myId || '').toString());
    },
    enabled: !!user
  });

  const { data: pendings } = useQuery({
    queryKey: ['pendingSynopsis'],
    queryFn: async () => {
      const res = await api.get('/synopsis');
      const items = res.data?.data || res.data || [];
      return items.filter(s => ['submitted', 'under_review', 'changes_requested'].includes(s.status));
    },
    enabled: !!user,
    onError: (err) => {
      setPendingError(err?.data?.message || err?.message || 'Unable to load synopses');
    }
  });

  const { data: pendingSubmissionSynopses } = useQuery({
    queryKey: ['pendingSubmissionSynopses'],
    queryFn: async () => {
      const res = await api.get('/submissions?submissionType=synopsis');
      const items = res.data?.data || res.data || [];
      return items.filter(s => ['submitted', 'under-review', 'revision-requested'].includes(s.status));
    },
    enabled: !!user,
    onError: (err) => {
      setPendingError(prev => prev || err?.data?.message || err?.message || 'Unable to load submissions');
    }
  });

  const { data: synopsisData } = useQuery({
    queryKey: ['groupSynopsis', selectedGroup, selectedSynopsisId, actionType],
    queryFn: async () => {
      if (selectedSynopsisId) {
        const res = await api.get(`/synopsis/${selectedSynopsisId}`);
        return res.data?.data || res.data;
      }
      if (selectedGroup) {
        const res = await api.get(`/synopsis/group/${selectedGroup}`);
        return res.data?.data || res.data;
      }
      return null;
    },
    enabled: selectedSource === 'synopsis' && (!!selectedGroup || !!selectedSynopsisId)
  });

  const { data: submissionData } = useQuery({
    queryKey: ['submissionSynopsis', selectedSynopsisId],
    queryFn: async () => {
      if (!selectedSynopsisId) return null;
      const res = await api.get(`/submissions/${selectedSynopsisId}`);
      return res.data?.data || res.data;
    },
    enabled: selectedSource === 'submission' && !!selectedSynopsisId
  });

  const isSubmissionReview = selectedSource === 'submission' && !!submissionData;

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (isSubmissionReview) {
        return api.put(`/submissions/${selectedSynopsisId}/review`, {
          body: {
            status: actionType === 'approve' ? 'accepted' : 'rejected',
            feedback
          }
        });
      }
      const targetId = selectedSynopsisId || synopsisData?._id;
      return api.put(`/synopsis/${targetId}/review`, {
        body: {
          status: actionType === 'approve' ? 'approved' : 'rejected',
          feedback
        }
      });
    },
    onSuccess: () => {
      setFeedback('');
      setActionType('approve');
      setSelectedGroup('');
      setSelectedSynopsisId('');
      setSelectedSource('');
      qc.invalidateQueries({ queryKey: ['pendingSubmissionSynopses'] });
      qc.invalidateQueries({ queryKey: ['pendingSynopsis'] });
      qc.invalidateQueries({ queryKey: ['groupSynopsis'] });
      qc.invalidateQueries({ queryKey: ['submissionSynopsis'] });
      alert('Review submitted successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  });

  const handleReview = (e) => {
    e.preventDefault();
    if (!selectedGroup) {
      alert('Please select a group');
      return;
    }
    if (!synopsisData && !submissionData) {
      alert('No synopsis loaded');
      return;
    }
    reviewMutation.mutate();
  };

  if (userLoading) return <LoadingSpinner />;

  const combinedPendings = [
    ...(pendings || []).map(s => ({
      source: 'synopsis',
      id: s._id,
      groupId: s.group?._id || s.group,
      title: s.title,
      abstract: s.abstract,
      submittedAt: s.submittedAt,
      status: s.status,
      groupName: s.group?.name || s.groupName
    })),
    ...(pendingSubmissionSynopses || []).map(s => ({
      source: 'submission',
      id: s._id,
      groupId: s.group?._id || s.group,
      title: s.title || (s.submissionType ? s.submissionType.toUpperCase() : 'Submission'),
      abstract: s.description,
      submittedAt: s.submittedAt,
      status: s.status,
      file: s.synopsis || s.file || s[s.submissionType],
      groupName: s.group?.name
    }))
  ];

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
                    {pendingError && (
                      <Alert variant="danger" className="mb-4">
                        {pendingError}
                      </Alert>
                    )}
                    {combinedPendings && combinedPendings.length > 0 ? (
                      <div className="space-y-3">
                        {combinedPendings.map(s => (
                          <button
                            key={`${s.source}-${s.id}`}
                            onClick={() => {
                              setSelectedGroup(s.groupId);
                              setSelectedSynopsisId(s.id);
                              setSelectedSource(s.source);
                            }}
                            className={`w-full text-left p-4 rounded-lg border-l-4 transition-all ${
                              selectedSynopsisId === s.id
                                ? 'bg-orange-50 border-orange-500 shadow-md'
                                : 'bg-yellow-50 border-yellow-400 hover:shadow'
                            }`}
                          >
                            <div className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                              <span>{s.title}</span>
                              <Badge variant={s.source === 'submission' ? 'info' : 'warning'}>
                                {s.source === 'submission' ? 'File' : 'Synopsis'}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">{s.groupName || 'Group'}</div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">{s.abstract || 'No abstract provided'}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
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
                {synopsisData || submissionData ? (
                  <Card>
                    <CardHeader>
                      <h3 className="text-2xl font-bold text-gray-900">{(synopsisData || submissionData)?.title || 'Synopsis'}</h3>
                      <Badge variant="warning" className="mt-2 inline-block">Under Review</Badge>
                    </CardHeader>
                    <CardBody>
                      <div className="mb-6 pb-6 border-b">
                        <p className="text-gray-700 leading-relaxed">{(synopsisData || submissionData)?.abstract || (submissionData?.description) || 'No abstract provided'}</p>
                        <div className="text-sm text-gray-500 mt-4 flex items-center gap-4">
                          <span>Submitted: {new Date((synopsisData || submissionData)?.submittedAt || Date.now()).toLocaleDateString()}</span>
                          <span>Group: {(synopsisData?.group?.name) || submissionData?.group?.name || '—'}</span>
                        </div>
                        {submissionData?.synopsis?.fileUrl && (
                          <div className="mt-3">
                            <a
                              href={buildFileUrl(submissionData.synopsis.fileUrl)}
                              className="text-orange-600 text-sm hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open submitted file ({submissionData.synopsis.fileName || 'file'})
                            </a>
                          </div>
                        )}
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
