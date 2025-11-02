'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
    <div className="max-w-4xl mx-auto py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Create New Drive (Stage 1)</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-black p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <input 
              value={form.name} 
              onChange={e=>setForm({...form, name:e.target.value})} 
              placeholder="Drive name (e.g., Mini Project Drive 2025)" 
              className="w-full border p-3 rounded-lg" 
              required 
            />
            <input 
              value={form.academicYear} 
              onChange={e=>setForm({...form, academicYear:e.target.value})} 
              placeholder="Academic Year (e.g., 2024-2025)" 
              className="w-full border p-3 rounded-lg" 
              required 
            />
            <input 
              value={form.participatingBatches} 
              onChange={e=>setForm({...form, participatingBatches:e.target.value})} 
              placeholder="Participating batches (comma-separated, e.g., 2025)" 
              className="w-full border p-3 rounded-lg" 
              required 
            />
            <textarea 
              value={form.description} 
              onChange={e=>setForm({...form, description:e.target.value})} 
              placeholder="Description" 
              className="w-full border p-3 rounded-lg h-24" 
              required 
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-black p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Group Size</label>
              <input 
                type="number" 
                value={form.maxGroupSize} 
                onChange={e=>setForm({...form, maxGroupSize:e.target.value})} 
                className="w-full border p-3 rounded-lg" 
                min="1" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Group Size</label>
              <input 
                type="number" 
                value={form.minGroupSize} 
                onChange={e=>setForm({...form, minGroupSize:e.target.value})} 
                className="w-full border p-3 rounded-lg" 
                min="1" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Groups Per Mentor</label>
              <input 
                type="number" 
                value={form.maxGroupsPerMentor} 
                onChange={e=>setForm({...form, maxGroupsPerMentor:e.target.value})} 
                className="w-full border p-3 rounded-lg" 
                min="1" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Participating Students */}
        <div className="bg-black p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Participating Students 
            <span className="text-sm font-normal text-gray-600">
              ({form.participatingStudents.length} selected)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {availableStudents.map(student => (
              <label key={student._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.participatingStudents.includes(student.email)}
                  onChange={() => toggleStudent(student.email)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                  <div className="text-xs text-gray-400">{student.registrationNumber}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mentors */}
        <div className="bg-black p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Mentors 
            <span className="text-sm font-normal text-gray-600">
              ({form.mentors.length} selected)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableMentors.map(mentor => (
              <label key={mentor._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.mentors.includes(mentor.email)}
                  onChange={() => toggleMentor(mentor.email)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">{mentor.name}</div>
                  <div className="text-sm text-gray-500">{mentor.email}</div>
                  <div className="text-xs text-gray-400">{mentor.department}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {err && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{err}</div>}
        
        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            disabled={form.participatingStudents.length === 0 || form.mentors.length === 0}
          >
            Create Drive
          </button>
        </div>
      </form>
    </div>
  );
}