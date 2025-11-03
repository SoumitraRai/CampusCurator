'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardHeader, CardBody, CardFooter, Badge, Button, FormInput, FormSelect, LoadingSpinner } from '@/components/UI';

export default function Evaluations() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [evaluationType, setEvaluationType] = useState('checkpoint');

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['mentorGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      const myId = user?._id || user?.id;
      return res.data?.filter(g => g.assignedMentor?._id === myId || g.assignedMentor === myId) || [];
    },
    enabled: !!user
  });

  const { data: submissions } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: async () => {
      const res = await api.get('/submissions?status=under-review');
      return res.data || [];
    },
    enabled: !!user
  });

  const evaluationMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/evaluations', {
        groupId: selectedGroup,
        totalMarks: parseInt(marks),
        feedback,
        type: evaluationType
      });
      return res.data;
    },
    onSuccess: () => {
      setMarks('');
      setFeedback('');
      setSelectedGroup('');
      alert('Evaluation saved!');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to save evaluation');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedGroup || !marks) {
      alert('Please fill all required fields');
      return;
    }
    evaluationMutation.mutate();
  };

  if (userLoading) return <LoadingSpinner />;

  return (
    <ProtectedRole allowedRole="mentor">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Evaluations</h1>
              <p className="text-gray-700 mt-2">Enter marks and feedback for student groups</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pending Submissions - Left */}
              <div className="lg:col-span-1">
                {submissions && submissions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h2 className="text-xl font-bold">Pending Reviews</h2>
                      <p className="text-gray-600 text-sm mt-1">{submissions.length} awaiting evaluation</p>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {submissions.map(s => (
                          <div 
                            key={s._id}
                            onClick={() => setSelectedGroup(s.group || s.groupId)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedGroup === s.group || selectedGroup === s.groupId
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-semibold text-sm uppercase text-gray-700">
                              {s.submissionType === 'logbook' && 'Logbook'}
                              {s.submissionType === 'report' && 'Report'}
                              {s.submissionType === 'ppt' && 'PPT'}
                              {s.submissionType === 'code' && 'Code'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{s.groupName}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(s.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>

              {/* Evaluation Form - Right */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-900">Enter Evaluation</h2>
                    <p className="text-gray-600 mt-1">Fill in the evaluation details below</p>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Group Selection */}
                      <div>
                        <label htmlFor="group-select" className="block text-sm font-semibold text-gray-900 mb-2">
                          Select Group *
                        </label>
                        <select
                          id="group-select"
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none text-gray-900 bg-white"
                        >
                          <option value="">Choose a group...</option>
                          {groups?.map(g => (
                            <option key={g._id} value={g._id}>
                              {g.name} - {g.projectTitle}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Evaluation Type */}
                      <div>
                        <label htmlFor="eval-type" className="block text-sm font-semibold text-gray-900 mb-2">
                          Evaluation Type
                        </label>
                        <select
                          id="eval-type"
                          value={evaluationType}
                          onChange={(e) => setEvaluationType(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none text-gray-900 bg-white"
                        >
                          <option value="checkpoint">Checkpoint</option>
                          <option value="midsem">Mid-Semester</option>
                          <option value="endsem">End-Semester</option>
                        </select>
                      </div>

                      {/* Marks */}
                      <div>
                        <label htmlFor="marks" className="block text-sm font-semibold text-gray-900 mb-2">
                          Marks (0-100) *
                        </label>
                        <div className="relative">
                          <input
                            id="marks"
                            type="number"
                            value={marks}
                            onChange={(e) => setMarks(e.target.value)}
                            required
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none"
                            placeholder="Enter marks out of 100"
                          />
                          <span className="absolute right-4 top-3.5 text-gray-600 font-semibold">/100</span>
                        </div>
                        {marks && (
                          <div className="mt-2 text-sm">
                            <p className="text-gray-600">
                              Percentage: <span className="font-semibold">{marks}%</span>
                            </p>
                            <p className="text-gray-600">
                              Grade: <span className={`font-semibold ${parseInt(marks) >= 80 ? 'text-green-600' : parseInt(marks) >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {parseInt(marks) >= 90 ? 'A+' : parseInt(marks) >= 80 ? 'A' : parseInt(marks) >= 70 ? 'B' : parseInt(marks) >= 60 ? 'C' : 'D'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Feedback */}
                      <div>
                        <label htmlFor="feedback" className="block text-sm font-semibold text-gray-900 mb-2">
                          Feedback
                        </label>
                        <textarea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows="5"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                          placeholder="Provide constructive feedback to the group..."
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={evaluationMutation.isPending}
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        {evaluationMutation.isPending ? 'Saving...' : 'Save Evaluation'}
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
