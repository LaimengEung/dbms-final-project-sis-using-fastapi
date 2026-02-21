import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card } from '../../../../components/ui';
import enrollmentService from '../../../../services/enrollmentService';

const EnrollmentForm = ({ initialData = {}, onSubmit, isLoading, semesters = [], isEdit = false }) => {
  const [formData, setFormData] = useState({
    student_id: initialData.student_id || '',
    section_id: initialData.section_id || '',
    status: initialData.status || 'enrolled',
    semester_id: initialData.section?.semester_id || ''
  });

  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Search students
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length > 2) {
        const res = await enrollmentService.searchStudents(searchTerm);
        setStudents(res.data || []);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load sections when semester changes
  useEffect(() => {
    if (formData.semester_id) {
      enrollmentService.getSectionsBySemester(formData.semester_id)
        .then(res => setSections(res.data || []));
    }
  }, [formData.semester_id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = 'Student required';
    if (!formData.section_id) newErrors.section_id = 'Section required';
    if (!formData.semester_id) newErrors.semester_id = 'Semester required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Semester */}
      <div>
        <label className="block text-sm font-medium mb-1">Semester *</label>
        <Select
          value={formData.semester_id}
          onChange={(e) => setFormData({ ...formData, semester_id: e.target.value, section_id: '' })}
          error={errors.semester_id}
          disabled={isEdit}
        >
          <option value="">Select semester</option>
          {semesters.map(s => (
            <option key={s.semester_id} value={s.semester_id}>
              {s.semester_name} {s.semester_year}
            </option>
          ))}
        </Select>
      </div>

      {/* Student */}
      <div>
        <label className="block text-sm font-medium mb-1">Student *</label>
        <Input
          placeholder="Search by ID or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isEdit}
        />
        {students.length > 0 && (
          <Card className="mt-2 max-h-60 overflow-auto">
            {students.map(s => (
              <div
                key={s.student_id}
                className={`p-2 cursor-pointer hover:bg-gray-50 ${
                  formData.student_id === s.student_id ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  setFormData({ ...formData, student_id: s.student_id });
                  setStudents([]);
                  setSearchTerm('');
                }}
              >
                <div className="font-medium">{s.user.first_name} {s.user.last_name}</div>
                <div className="text-sm text-gray-500">{s.student_number} - {s.major?.major_name}</div>
              </div>
            ))}
          </Card>
        )}
        {errors.student_id && <p className="text-sm text-red-600 mt-1">{errors.student_id}</p>}
      </div>

      {/* Section */}
      <div>
        <label className="block text-sm font-medium mb-1">Section *</label>
        <Select
          value={formData.section_id}
          onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
          error={errors.section_id}
          disabled={!formData.semester_id}
        >
          <option value="">Select section</option>
          {sections.map(s => (
            <option key={s.section_id} value={s.section_id}>
              {s.course?.course_code} - Sec {s.section_number} ({s.enrolled_count}/{s.max_capacity})
            </option>
          ))}
        </Select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="enrolled">Enrolled</option>
          <option value="dropped">Dropped</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Update' : 'Create'} Enrollment
        </Button>
      </div>
    </form>
  );
};

export default EnrollmentForm;
