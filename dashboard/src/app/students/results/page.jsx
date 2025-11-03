'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import ProtectedRole from '@/components/ProtectedRole';
import { Card, CardHeader, CardBody, CardFooter, Badge, LoadingSpinner, EmptyState } from '@/components/UI';

export default function Results() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const { data: results, isLoading } = useQuery({
    queryKey: ['myResults'],
    queryFn: async () => {
      const res = await api.get('/results');
      return res.data || [];
    },
    enabled: !!user
  });

  if (userLoading || isLoading) return <LoadingSpinner />;

  const getGradeColor = (grade) => {
    if (!grade) return 'gray';
    if (grade === 'A+' || grade === 'A') return 'green';
    if (grade === 'B+' || grade === 'B') return 'blue';
    if (grade === 'C+' || grade === 'C') return 'yellow';
    return 'red';
  };

  const getMarksColor = (marks) => {
    if (!marks) return 'text-gray-600';
    if (marks >= 80) return 'text-green-600';
    if (marks >= 60) return 'text-blue-600';
    if (marks >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <ProtectedRole allowedRole="student">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Your Results</h1>
              <p className="text-gray-700 mt-2">View your final grades and performance feedback</p>
            </div>

            {!results?.length ? (
              <EmptyState 
                title="No Results Yet" 
                message="Your results will appear here once all evaluations are completed and published"
              />
            ) : (
              <div className="grid gap-8">
                {results.map(r => (
                  <Card key={r._id} className="border-l-4 hover:shadow-lg transition-shadow" style={{borderLeftColor: getGradeColor(r.grade) === 'green' ? '#10b981' : getGradeColor(r.grade) === 'blue' ? '#3b82f6' : getGradeColor(r.grade) === 'yellow' ? '#f59e0b' : '#ef4444'}}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{r.groupName}</h2>
                          <p className="text-gray-600 mt-1">{r.driveName}</p>
                        </div>
                        <Badge variant={getGradeColor(r.grade)}>
                          Grade: {r.grade || 'TBA'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardBody>
                      {/* Marks Breakdown */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marks Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div className="bg-white p-4 rounded-lg border-2 border-blue-200 hover:shadow-md transition">
                            <p className="text-xs text-gray-600 font-medium">Logbook</p>
                            <p className={`text-2xl font-bold mt-2 ${getMarksColor(r.logbook_marks)}`}>
                              {r.logbook_marks || 0}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border-2 border-purple-200 hover:shadow-md transition">
                            <p className="text-xs text-gray-600 font-medium">Synopsis</p>
                            <p className={`text-2xl font-bold mt-2 ${getMarksColor(r.synopsis_marks)}`}>
                              {r.synopsis_marks || 0}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border-2 border-green-200 hover:shadow-md transition">
                            <p className="text-xs text-gray-600 font-medium">Report</p>
                            <p className={`text-2xl font-bold mt-2 ${getMarksColor(r.report_marks)}`}>
                              {r.report_marks || 0}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border-2 border-yellow-200 hover:shadow-md transition">
                            <p className="text-xs text-gray-600 font-medium">PPT</p>
                            <p className={`text-2xl font-bold mt-2 ${getMarksColor(r.ppt_marks)}`}>
                              {r.ppt_marks || 0}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-200 hover:shadow-md transition">
                            <p className="text-xs text-gray-600 font-medium">Mid-Sem</p>
                            <p className={`text-2xl font-bold mt-2 ${getMarksColor(r.midsem_marks)}`}>
                              {r.midsem_marks || 0}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border-2 border-red-200 hover:shadow-md transition">
                            <p className="text-xs text-gray-600 font-medium">End-Sem</p>
                            <p className={`text-2xl font-bold mt-2 ${getMarksColor(r.endsem_marks)}`}>
                              {r.endsem_marks || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Final Result */}
                      <div className="rounded-lg p-6 border-2 border-orange-300 mb-6 bg-gradient-to-r from-orange-50 to-white">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Final Marks</p>
                            <p className="text-5xl font-bold text-orange-600">{r.final_marks || 0}</p>
                            <p className="text-xs text-gray-500 mt-2">Out of 100</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Letter Grade</p>
                            <p className={`text-5xl font-bold ${
                              r.grade === 'A+' || r.grade === 'A' ? 'text-green-600' :
                              r.grade === 'B+' || r.grade === 'B' ? 'text-blue-600' :
                              r.grade === 'C+' || r.grade === 'C' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {r.grade || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      {r.feedback && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Mentor Feedback</p>
                          <p className="text-gray-700 leading-relaxed">{r.feedback}</p>
                        </div>
                      )}
                    </CardBody>

                    <CardFooter>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Results Published</span>
                        <span className="text-xs">Status: {r.status || 'Final'}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}
