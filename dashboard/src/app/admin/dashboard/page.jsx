'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import Link from 'next/link';
import { Card, CardHeader, CardBody, CardFooter, Button, Badge, StatCard, LoadingSpinner, EmptyState } from '@/components/UI';

export default function AdminDashboard() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const { data: drives, isLoading: drivesLoading } = useQuery({
    queryKey: ['allDrives'],
    queryFn: async () => {
      const res = await api.get('/drives');
      return res.data || [];
    },
    enabled: !!user
  });

  const { data: stats } = useQuery({
    queryKey: ['driveStats'],
    queryFn: async () => {
      const res = await api.get('/drives/stats');
      return res.data || {};
    },
    enabled: !!user
  });

  if (userLoading || drivesLoading) return <LoadingSpinner />;

  const activeDrives = drives?.filter(d => d.status === 'active').length || 0;
  const completedDrives = drives?.filter(d => d.status === 'completed').length || 0;
  const totalGroups = stats?.totalGroups || 0;

  return (
    <ProtectedRole allowedRole="admin">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-700 mt-2">Welcome back, {user?.name}</p>
              </div>
              <Link href="/admin/drives/new">
                <Button variant="primary" size="lg">
                  New Drive
                </Button>
              </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                label="Total Drives" 
                value={drives?.length || 0} 
                color="blue"
              />
              <StatCard 
                label="Active" 
                value={activeDrives} 
                color="green"
              />
              <StatCard 
                label="Completed" 
                value={completedDrives} 
                color="emerald"
              />
              <StatCard 
                label="Total Groups" 
                value={totalGroups} 
                color="purple"
              />
            </div>

          {/* Drives Section */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">All Drives</h2>
              <p className="text-gray-700">Manage and monitor all active and completed drives</p>
            </CardHeader>
            <CardBody>
              {!drives?.length ? (
                <EmptyState 
                  title="No Drives Yet" 
                  message="Create your first drive to get started"
                />
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Drive Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Current Stage</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drives.map((drive, idx) => (
                      <tr 
                        key={drive._id} 
                        className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">{drive.name}</div>
                          <p className="text-sm text-gray-600 mt-1">{drive.description}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={drive.status === 'active' ? 'success' : drive.status === 'completed' ? 'info' : 'warning'}>
                            {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {drive.currentStage?.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {drive.academicYear}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Link href={`/admin/drives/${drive._id}/manage`}>
                              <Button variant="outline" size="sm">Manage</Button>
                            </Link>
                            <Link href={`/drives/${drive._id}`}>
                              <Button variant="secondary" size="sm">View</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <p className="text-sm text-gray-600">
              Showing {drives?.length || 0} drive{drives?.length !== 1 ? 's' : ''} • Last updated just now
            </p>
          </CardFooter>
        </Card>
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
