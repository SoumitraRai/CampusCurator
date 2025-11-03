'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Button, Alert } from '@/components/UI';
import ProtectedRole from '@/components/ProtectedRole';

export default function NewDrivePage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    academicYear: '',
    participatingBatches: '',
    maxGroupSize: 4,
    minGroupSize: 1,
    maxGroupsPerMentor: 6,
    participatingStudents: [],
    mentors: []
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [err, setErr] = useState(null);
  const router = useRouter();

  // Load available students and mentors
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load students from batch 2025 (you can make this dynamic based on participatingBatches)
        const studentsRes = await api.get('/users/students/batch/2025');
        setAvailableStudents(studentsRes.data || []);
        
        // Load mentors from Computer Science department
        const mentorsRes = await api.get('/users/mentors/department/Computer%20Science');
        setAvailableMentors(mentorsRes.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setErr('Failed to load students and mentors');
      }
    };
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        academicYear: form.academicYear,
        participatingBatches: form.participatingBatches.split(',').map(s => s.trim()),
        maxGroupSize: Number(form.maxGroupSize),
        minGroupSize: Number(form.minGroupSize),
        maxGroupsPerMentor: Number(form.maxGroupsPerMentor),
        participatingStudents: form.participatingStudents, // Array of student emails
        mentors: form.mentors // Array of mentor emails
      };
      const result = await api.post('/drives', { body: payload });
      console.log('Drive created:', result);
      router.push('/drives');
    } catch (error) {
      setErr(error.message || 'Failed to create drive');
    }
  };

  const toggleStudent = (studentEmail) => {
    setForm(prev => ({
      ...prev,
      participatingStudents: prev.participatingStudents.includes(studentEmail)
        ? prev.participatingStudents.filter(e => e !== studentEmail)
        : [...prev.participatingStudents, studentEmail]
    }));
  };

  const toggleMentor = (mentorEmail) => {
    setForm(prev => ({
      ...prev,
      mentors: prev.mentors.includes(mentorEmail)
        ? prev.mentors.filter(e => e !== mentorEmail)
        : [...prev.mentors, mentorEmail]
    }));
  };

  return (
    <ProtectedRole allowedRole="admin">
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Drive</h1>
            <p className="text-gray-600 mb-8">Set up a new project drive with participants and configuration</p>

            {err && (
              <Alert variant="danger" className="mb-6">
                {err}
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="drive-name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Drive Name *
                      </label>
                      <input 
                        id="drive-name"
                        value={form.name} 
                        onChange={e=>setForm({...form, name:e.target.value})} 
                        placeholder="e.g., Mini Project Drive 2025" 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                        required 
                      />
                    </div>

                    <div>
                      <label htmlFor="academic-year" className="block text-sm font-semibold text-gray-900 mb-2">
                        Academic Year *
                      </label>
                      <input 
                        id="academic-year"
                        value={form.academicYear} 
                        onChange={e=>setForm({...form, academicYear:e.target.value})} 
                        placeholder="e.g., 2024-2025" 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                        required 
                      />
                    </div>

                    <div>
                      <label htmlFor="batches" className="block text-sm font-semibold text-gray-900 mb-2">
                        Participating Batches *
                      </label>
                      <input 
                        id="batches"
                        value={form.participatingBatches} 
                        onChange={e=>setForm({...form, participatingBatches:e.target.value})} 
                        placeholder="Comma-separated, e.g., 2025, 2026" 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                        required 
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                        Description *
                      </label>
                      <textarea 
                        id="description"
                        value={form.description} 
                        onChange={e=>setForm({...form, description:e.target.value})} 
                        placeholder="Describe the drive objectives and expectations" 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none resize-none h-24" 
                        required 
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Configuration */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900">Configuration</h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="max-size" className="block text-sm font-semibold text-gray-900 mb-2">Max Group Size</label>
                      <input 
                        id="max-size"
                        type="number" 
                        value={form.maxGroupSize} 
                        onChange={e=>setForm({...form, maxGroupSize:e.target.value})} 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                        min="1" 
                        required 
                      />
                    </div>
                    <div>
                      <label htmlFor="min-size" className="block text-sm font-semibold text-gray-900 mb-2">Min Group Size</label>
                      <input 
                        id="min-size"
                        type="number" 
                        value={form.minGroupSize} 
                        onChange={e=>setForm({...form, minGroupSize:e.target.value})} 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                        min="1" 
                        required 
                      />
                    </div>
                    <div>
                      <label htmlFor="max-groups" className="block text-sm font-semibold text-gray-900 mb-2">Max Groups Per Mentor</label>
                      <input 
                        id="max-groups"
                        type="number" 
                        value={form.maxGroupsPerMentor} 
                        onChange={e=>setForm({...form, maxGroupsPerMentor:e.target.value})} 
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none" 
                        min="1" 
                        required 
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Participating Students */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900">
                    Participating Students 
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({form.participatingStudents.length} selected)
                    </span>
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {availableStudents.map(student => (
                      <label key={student._id} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={form.participatingStudents.includes(student.email)}
                          onChange={() => toggleStudent(student.email)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                          <div className="text-xs text-gray-500">{student.registrationNumber}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Mentors */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900">
                    Mentors 
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({form.mentors.length} selected)
                    </span>
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableMentors.map(mentor => (
                      <label key={mentor._id} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={form.mentors.includes(mentor.email)}
                          onChange={() => toggleMentor(mentor.email)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{mentor.name}</div>
                          <div className="text-sm text-gray-600">{mentor.email}</div>
                          <div className="text-xs text-gray-500">{mentor.department}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardBody>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={form.participatingStudents.length === 0 || form.mentors.length === 0}
                >
                  Create Drive
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRole>
  );
}