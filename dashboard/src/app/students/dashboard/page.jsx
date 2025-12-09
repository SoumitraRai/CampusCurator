'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardHeader, CardBody, Badge, StatCard, LoadingSpinner, EmptyState, Alert, Button } from '@/components/UI';

export default function StudentDashboard() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const { data: drives, isLoading: drivesLoading, isError: drivesError } = useQuery({
    queryKey: ['studentDrives'],
    queryFn: async () => {
      const res = await api.get('/drives');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: myGroups, isLoading: groupsLoading, isError: groupsError } = useQuery({
    queryKey: ['myGroups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: mySubmissions, isLoading: submissionsLoading, isError: submissionsError } = useQuery({
    queryKey: ['mySubmissions'],
    queryFn: async () => {
      const res = await api.get('/submissions');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: myResults, isLoading: resultsLoading, isError: resultsError } = useQuery({
    queryKey: ['myResults'],
    queryFn: async () => {
      const res = await api.get('/results');
      return res.data || [];
    },
    enabled: !!user
  });

  const firstJoinableDrive = drives?.find(d => d.status === 'active');

  if (userLoading) return <LoadingSpinner />;

  return (
    <ProtectedRole allowedRole="student">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Your Groups & Drives</h1>
              <p className="text-gray-700 mt-2">
                Manage your project groups and track drive progress
              </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-10">
              {(drivesLoading || groupsLoading || submissionsLoading || resultsLoading) && (
                <div className="flex gap-4 items-center text-gray-600 text-sm">
                  <LoadingSpinner size="sm" />
                  <span>Loading your data...</span>
                </div>
              )}
              {(drivesError || groupsError || submissionsError || resultsError) && (
                <Alert variant="danger" className="mt-4">
                  Could not load all stats right now. Please refresh in a moment.
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                <StatCard
                  label="My Groups"
                  value={myGroups?.length || 0}
                  color="blue"
                />
                <StatCard
                  label="Submissions"
                  value={mySubmissions?.length || 0}
                  color="green"
                />
                <StatCard
                  label="Active Drives"
                  value={drives?.filter(d => d.status === 'active').length || 0}
                  color="purple"
                />
                <StatCard
                  label="Results"
                  value={myResults?.length || 0}
                  color="orange"
                />
              </div>
            </div>

            {/* My Groups Section */}
            <Card className="mb-10">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">My Groups</h2>
                <p className="text-gray-600">Your project groups and team details</p>
              </CardHeader>
              <CardBody>
                {groupsLoading ? (
                  <LoadingSpinner />
                ) : groupsError ? (
                  <Alert variant="danger">Unable to load your groups. Please retry.</Alert>
                ) : myGroups?.length === 0 ? (
                  <div className="space-y-4">
                    <EmptyState
                      title="No Groups Yet"
                      message="Join a drive and form a group to get started."
                    />
                    <div className="flex gap-3">
                      <Link href="/drives" className="flex-1">
                        <Button variant="primary" className="w-full">Browse Drives</Button>
                      </Link>
                      {firstJoinableDrive && (
                        <Link href={`/drives/${firstJoinableDrive._id}`} className="flex-1">
                          <Button variant="outline" className="w-full">Go to an Active Drive</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {myGroups.map(g => (
                      <div
                        key={g._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-transparent"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{g.name}</h3>
                            <p className="text-gray-600 mt-1">{g.projectTitle || 'Project title not set'}</p>
                          </div>
                          <Badge variant={g.status === 'formed' ? 'success' : 'info'}>
                            {g.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Members</p>
                            <p className="font-semibold text-gray-900">{(g.members?.filter(m => m.status === 'accepted').length || 0) + 1}/{g.maxMembers || 4}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Assigned Mentor</p>
                            <p className="font-semibold text-gray-900">{g.assignedMentor?.name || 'Pending'}</p>
                          </div>
                        </div>

                        <Link href={`/drives/${g.drive?._id || g.drive}`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View Drive Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Available Drives Section - Only show if no groups yet */}
            {myGroups?.length === 0 && (
              <Card className="mb-10">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900">Available Drives</h2>
                  <p className="text-gray-600 mt-1">Browse and join project drives</p>
                </CardHeader>
                <CardBody>
                  {drivesLoading ? (
                    <LoadingSpinner />
                  ) : (() => {
                    // Filter out drives where student already has a group
                    const drivenIds = new Set(myGroups?.map(g => g.drive?._id || g.drive) || []);
                    const availableDrives = drives?.filter(d => !drivenIds.has(d._id)) || [];

                    return availableDrives.length === 0 ? (
                      <EmptyState
                        title="No More Drives Available"
                        message="You're already part of all available drives"
                      />
                    ) : (
                      <div className="grid gap-6">
                        {availableDrives.map(d => (
                          <div
                            key={d._id}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{d.name}</h3>
                                <p className="text-gray-600 text-sm mt-1">{d.description}</p>
                              </div>
                              <Badge variant={d.status === 'active' ? 'success' : 'warning'}>
                                {d.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm mb-4">
                              <div>
                                <span className="text-gray-600">Current Stage:</span>
                                <span className="ml-2 font-semibold text-gray-900">{d.currentStage?.replace('-', ' ').toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Year:</span>
                                <span className="ml-2 font-semibold text-gray-900">{d.academicYear}</span>
                              </div>
                            </div>

                            <Link href={`/drives/${d._id}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                              Join Drive →
                            </Link>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardBody>
              </Card>
            )}

            {/* Recent Submissions Section */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Recent Submissions</h2>
                <p className="text-gray-600 mt-1">Your latest checkpoint submissions</p>
              </CardHeader>
              <CardBody>
                {submissionsLoading ? (
                  <LoadingSpinner />
                ) : submissionsError ? (
                  <Alert variant="danger">Unable to load submissions right now.</Alert>
                ) : mySubmissions && mySubmissions.length > 0 ? (
                  <div className="grid gap-4">
                    {mySubmissions.slice(0, 5).map(s => (
                      <div
                        key={s._id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold uppercase text-sm text-gray-700">
                            {s.submissionType === 'logbook' && 'Logbook'}
                            {s.submissionType === 'report' && 'Report'}
                            {s.submissionType === 'ppt' && 'Presentation'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {new Date(s.submittedAt).toLocaleDateString()}
                          </p>
                          {s.feedback && <p className="text-sm text-gray-600 mt-2 italic">"{s.feedback}"</p>}
                        </div>
                        <Badge variant={s.status === 'accepted' ? 'success' : s.status === 'rejected' ? 'danger' : 'warning'}>
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No submissions yet"
                    message="Upload your first checkpoint to see it here."
                  />
                )}
              </CardBody>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Results</h2>
                <p className="text-gray-600 mt-1">Latest published results</p>
              </CardHeader>
              <CardBody>
                {resultsLoading ? (
                  <LoadingSpinner />
                ) : resultsError ? (
                  <Alert variant="danger">Unable to load results right now.</Alert>
                ) : myResults && myResults.length > 0 ? (
                  <div className="grid gap-4">
                    {myResults.slice(0, 3).map(r => (
                      <div key={r._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{r.groupName}</p>
                          <p className="text-sm text-gray-600">{r.driveName}</p>
                          <p className="text-xs text-gray-500 mt-1">Final Marks: {r.final_marks ?? 'TBA'}</p>
                        </div>
                        <Badge variant={r.grade ? 'success' : 'info'}>
                          {r.grade || 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No results yet"
                    message="When results are published you'll see them here."
                  />
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
