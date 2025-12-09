'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardHeader, CardBody, CardFooter, Badge, Button, Alert, LoadingSpinner } from '@/components/UI';

export default function SynopsisPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const qc = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [objectives, setObjectives] = useState('');
  const [methodology, setMethodology] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [file, setFile] = useState(null);

  const { data: myGroups } = useQuery({
    queryKey: ['myGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: groupSynopsis } = useQuery({
    queryKey: ['groupSynopsis', selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return null;
      const res = await api.get(`/synopsis/group/${selectedGroup}`);
      return res.data?.data;
    },
    enabled: !!selectedGroup
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('groupId', selectedGroup);
      formData.append('title', title);
      formData.append('abstract', abstract);
      if (objectives) formData.append('objectives', objectives);
      if (methodology) formData.append('methodology', methodology);
      if (expectedOutcome) formData.append('expectedOutcome', expectedOutcome);
      if (technologies) formData.append('technologies', technologies);
      if (file) formData.append('documents', file);

      const res = await api.post('/synopsis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      setTitle('');
      setAbstract('');
      setObjectives('');
      setMethodology('');
      setExpectedOutcome('');
      setTechnologies('');
      setFile(null);
      qc.invalidateQueries({ queryKey: ['groupSynopsis', selectedGroup] });
      alert('Synopsis submitted successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to submit synopsis');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedGroup || !title || !abstract) {
      alert('Please fill all required fields');
      return;
    }
    if (submissionBlockedReason) {
      alert(submissionBlockedReason);
      return;
    }
    submitMutation.mutate();
  };

  const statusLabel = (status) => status?.replace(/_/g, ' ').toUpperCase();

  const selectedGroupDetails = myGroups?.find(g => g._id === selectedGroup);
  const hasMentor = !!selectedGroupDetails?.assignedMentor;
  const canSubmitStatus = !groupSynopsis || ['draft', 'changes_requested', 'rejected'].includes(groupSynopsis.status);
  const submissionBlockedReason = !selectedGroup
    ? null
    : !hasMentor
      ? 'A mentor must be assigned to your group before submitting the synopsis.'
      : !canSubmitStatus
        ? 'Your synopsis is already submitted and awaiting review. You can resubmit only after feedback or rejection.'
        : null;

  if (userLoading) return <LoadingSpinner />;

  return (
    <ProtectedRole allowedRole="student">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Project Synopsis</h1>
              <p className="text-gray-700 mt-2">Submit your project synopsis for mentor review</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-gray-900">Submit Your Synopsis</h2>
                    <p className="text-gray-600 mt-1">Provide detailed information about your project</p>
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
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none text-gray-900 bg-white"
                          required
                        >
                          <option value="">Choose your group...</option>
                          {myGroups?.map(g => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Mentor / drive info */}
                      {selectedGroupDetails && (
                        <Alert variant="info">
                          <p className="text-sm font-semibold text-gray-900">Group mentor</p>
                          <p className="text-sm text-gray-700">
                            {selectedGroupDetails.assignedMentor?.name || 'Not assigned yet'}
                          </p>
                        </Alert>
                      )}

                      {submissionBlockedReason && (
                        <Alert variant="warning">
                          <p className="text-sm font-medium text-gray-900">{submissionBlockedReason}</p>
                        </Alert>
                      )}

                      {/* Project Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                          Project Title *
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none"
                          placeholder="e.g., AI-based Student Performance Predictor"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Be clear and descriptive</p>
                      </div>

                      {/* Abstract */}
                      <div>
                        <label htmlFor="abstract" className="block text-sm font-semibold text-gray-900 mb-2">
                          Abstract/Synopsis *
                        </label>
                        <textarea
                          id="abstract"
                          value={abstract}
                          onChange={(e) => setAbstract(e.target.value)}
                          rows="6"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                          placeholder="Describe your project objectives, methodology, and expected outcomes..."
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Include key points like problem statement, approach, and deliverables
                        </p>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="objectives" className="block text-sm font-semibold text-gray-900 mb-2">
                            Objectives
                          </label>
                          <textarea
                            id="objectives"
                            value={objectives}
                            onChange={(e) => setObjectives(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                            placeholder="List the primary objectives"
                          />
                        </div>
                        <div>
                          <label htmlFor="methodology" className="block text-sm font-semibold text-gray-900 mb-2">
                            Methodology
                          </label>
                          <textarea
                            id="methodology"
                            value={methodology}
                            onChange={(e) => setMethodology(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                            placeholder="Explain your approach"
                          />
                        </div>
                        <div>
                          <label htmlFor="expectedOutcome" className="block text-sm font-semibold text-gray-900 mb-2">
                            Expected Outcome
                          </label>
                          <textarea
                            id="expectedOutcome"
                            value={expectedOutcome}
                            onChange={(e) => setExpectedOutcome(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                            placeholder="What do you expect to deliver?"
                          />
                        </div>
                        <div>
                          <label htmlFor="technologies" className="block text-sm font-semibold text-gray-900 mb-2">
                            Technologies
                          </label>
                          <textarea
                            id="technologies"
                            value={technologies}
                            onChange={(e) => setTechnologies(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none"
                            placeholder="Stack, tools, libraries"
                          />
                        </div>
                      </div>

                      {/* File Upload */}
                      <div>
                        <label htmlFor="file-input" className="block text-sm font-semibold text-gray-900 mb-2">
                          Upload PDF Document (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                          <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            accept=".pdf"
                            className="hidden"
                            id="file-input"
                          />
                          <label htmlFor="file-input" className="cursor-pointer">
                            {file ? (
                              <div className="text-orange-600">
                                <p className="text-lg mb-1 font-medium">File selected</p>
                                <p className="text-sm">{file.name}</p>
                              </div>
                            ) : (
                              <div className="text-gray-600">
                                <p className="text-lg mb-1 font-medium">Upload file</p>
                                <p className="text-sm">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500">PDF files only</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending || !!submissionBlockedReason}
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Synopsis'}
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              </div>

              {/* Status Panel - Right */}
              <div className="lg:col-span-1">
                {groupSynopsis ? (
                  <Card>
                    <CardHeader>
                      <h3 className="text-xl font-bold">Submission Status</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {/* Status Badge */}
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-2">CURRENT STATUS</p>
                          <Badge variant={
                            groupSynopsis.status === 'approved' ? 'success' :
                            groupSynopsis.status === 'rejected' ? 'danger' :
                            groupSynopsis.status === 'under_review' ? 'warning' :
                            groupSynopsis.status === 'changes_requested' ? 'info' :
                            'info'
                          }>
                            {statusLabel(groupSynopsis.status) || 'NO SUBMISSION'}
                          </Badge>
                        </div>

                        {/* Title */}
                        {groupSynopsis.title && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">PROJECT TITLE</p>
                            <p className="font-semibold text-gray-900">{groupSynopsis.title}</p>
                          </div>
                        )}

                        {/* Dates */}
                        {groupSynopsis.submittedAt && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">SUBMITTED ON</p>
                            <p className="text-sm text-gray-700">
                              {new Date(groupSynopsis.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {groupSynopsis.reviewedAt && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">REVIEWED ON</p>
                            <p className="text-sm text-gray-700">
                              {new Date(groupSynopsis.reviewedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {/* Documents */}
                        {groupSynopsis.documents?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-1">DOCUMENTS</p>
                            <ul className="space-y-1">
                              {groupSynopsis.documents.map((doc) => (
                                <li key={doc.fileUrl}>
                                  <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:text-orange-700 text-sm"
                                  >
                                    {doc.fileName}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Feedback */}
                        {groupSynopsis.feedback && (
                          <Alert variant="info">
                            <p className="font-semibold text-sm mb-2">Mentor Feedback</p>
                            <p className="text-sm">{groupSynopsis.feedback}</p>
                          </Alert>
                        )}

                        {/* Approval Messages */}
                        {groupSynopsis.status === 'approved' && (
                          <Alert variant="success">
                            <p className="font-semibold">Approved</p>
                            <p className="text-sm mt-1">Your synopsis has been approved. You may proceed to the next stage.</p>
                          </Alert>
                        )}

                        {groupSynopsis.status === 'rejected' && (
                          <Alert variant="danger">
                            <p className="font-semibold">Revision Needed</p>
                            <p className="text-sm mt-1">Please address the feedback and resubmit your synopsis.</p>
                          </Alert>
                        )}

                        {groupSynopsis.status === 'under_review' && (
                          <Alert variant="warning">
                            <p className="font-semibold">Under Review</p>
                            <p className="text-sm mt-1">Your synopsis is being reviewed by the mentor.</p>
                          </Alert>
                        )}

                        {groupSynopsis.status === 'changes_requested' && (
                          <Alert variant="info">
                            <p className="font-semibold">Changes Requested</p>
                            <p className="text-sm mt-1">Update your synopsis and resubmit when ready.</p>
                          </Alert>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <Card>
                    <CardBody>
                      <div className="text-center py-8">
                        <p className="text-gray-600 font-medium">No Synopsis Yet</p>
                        <p className="text-sm text-gray-500 mt-2">Submit your synopsis to get started</p>
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
