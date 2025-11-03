'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect } from 'react';
import { Card, CardHeader, CardBody, Badge, LoadingSpinner, EmptyState } from '@/components/UI';

async function fetchDrives() {
  const res = await api.get('/drives');
  return res.data || res.drives || res;
}

export default function DrivesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['drives'],
    queryFn: fetchDrives,
    staleTime: 1000 * 60 * 2
  });

  useEffect(() => { refetch(); }, [refetch]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="w-full px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Drives</h1>
          <p className="text-gray-700 mb-8">Browse and explore all available project drives</p>

          {isLoading && <LoadingSpinner />}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 font-medium">Error loading drives</p>
            </div>
          )}

          {data && data.length === 0 && (
            <EmptyState 
              title="No Drives Found" 
              message="Check back soon for new project drives"
            />
          )}

          {data && data.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.map(d => (
                <Link key={d._id} href={`/drives/${d._id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardBody>
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-900">{d.name}</h2>
                        <Badge variant={d.status === 'active' ? 'success' : 'warning'}>
                          {d.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{d.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Stage:</span>
                          <p className="font-semibold text-gray-900">{d.currentStage?.replace('-', ' ').toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Year:</span>
                          <p className="font-semibold text-gray-900">{d.academicYear}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}