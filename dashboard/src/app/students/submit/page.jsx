'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardBody, Button, Alert } from '@/components/UI';

export default function SubmitFile() {
  const router = useRouter();
  const [submissionType, setSubmissionType] = useState('logbook');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('submissionType', submissionType);
      formData.append('description', description);
      formData.append('groupId', groupId);

      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess('Submission successful!');
      setTimeout(() => router.push('/students/dashboard'), 2000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to submit');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    setError('');
    mutation.mutate();
  };

  return (
    <ProtectedRole allowedRole="student">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Checkpoint</h1>
            <p className="text-gray-700 mb-8">Upload your project submission for evaluation</p>

            {error && (
              <Alert variant="danger" className="mb-6">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="mb-6">
                {success}
              </Alert>
            )}

            <Card>
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="submission-type" className="block text-sm font-semibold text-gray-900 mb-2">
                      Submission Type *
                    </label>
                    <select
                      id="submission-type"
                      value={submissionType}
                      onChange={(e) => setSubmissionType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none text-gray-900 bg-white"
                    >
                      <option value="logbook">Logbook</option>
                      <option value="synopsis">Synopsis</option>
                      <option value="report">Final Report</option>
                      <option value="ppt">PPT Presentation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="group-id" className="block text-sm font-semibold text-gray-900 mb-2">
                      Group ID *
                    </label>
                    <input
                      id="group-id"
                      type="text"
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Your group ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="file" className="block text-sm font-semibold text-gray-900 mb-2">
                      File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                      <input
                        id="file"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0])}
                        required
                        className="hidden"
                      />
                      <label htmlFor="file" className="cursor-pointer">
                        {file ? (
                          <div className="text-orange-600">
                            <p className="text-lg font-medium mb-1">File selected</p>
                            <p className="text-sm">{file.name}</p>
                          </div>
                        ) : (
                          <div className="text-gray-600">
                            <p className="text-lg font-medium mb-1">Upload file</p>
                            <p className="text-sm">Click to upload or drag and drop</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Add any notes or context about your submission..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      variant="primary"
                      className="flex-1"
                    >
                      {mutation.isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
