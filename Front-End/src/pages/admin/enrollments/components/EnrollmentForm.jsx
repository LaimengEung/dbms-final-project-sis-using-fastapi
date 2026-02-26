import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card } from '../../../../components/ui';
import enrollmentService from '../../../../services/enrollmentService';

const EnrollmentForm = ({ initialData = {}, onSubmit, isLoading, semesters = [], isEdit = false, disableSubmit = false, onCancel }) => {
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState('');
  const selectedSection = sections.find((s) => String(s.section_id) === String(formData.section_id)) || null;
  const semesterOptions = semesters.map((s) => ({
    value: String(s.semester_id),
    label: `${s.semester_name} ${s.semester_year}`,
  }));
  const sectionOptions = sections.map((s) => ({
    value: String(s.section_id),
    label: `${s.course?.course_code} - Sec ${s.section_number} (${s.enrolled_count}/${s.max_capacity})`,
  }));
  const statusOptions = [
    { value: 'enrolled', label: 'Enrolled' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'completed', label: 'Completed' },
  ];

  // Search students
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length <= 1) {
        setStudents([]);
        setSearchLoading(false);
        setSearchError('');
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError('');
        const res = await enrollmentService.searchStudents(searchTerm);
        setStudents(res.data || []);
      } catch (error) {
        setStudents([]);
        setSearchError(error?.message || 'Failed to search students');
      } finally {
        setSearchLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load sections when semester changes
  useEffect(() => {
    setSections([]);
    setSectionsError('');
    if (formData.semester_id) {
      setSectionsLoading(true);
      enrollmentService.getSectionsBySemester(formData.semester_id)
        .then(res => setSections(res.data || []))
        .catch((error) => setSectionsError(error?.message || 'Failed to load sections'))
        .finally(() => setSectionsLoading(false));
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
          placeholder="Select semester"
          options={semesterOptions}
        />
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
        {!isEdit && (
          <p className="mt-1 text-xs text-gray-500">
            Type at least 2 characters to search students.
          </p>
        )}
        {searchError && <p className="text-sm text-red-600 mt-1">{searchError}</p>}
        {searchLoading && <p className="text-sm text-gray-500 mt-1">Searching students...</p>}
        {students.length > 0 && (
          <Card className="mt-2 max-h-60 overflow-auto">
            {students.map(s => (
              <div
                key={s.student_id}
                className={`p-2 cursor-pointer hover:bg-gray-50 ${
                  String(formData.student_id) === String(s.student_id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  setFormData({ ...formData, student_id: String(s.student_id) });
                  setSelectedStudent(s);
                  setStudents([]);
                  setSearchTerm(`${s.user.first_name} ${s.user.last_name}`);
                }}
              >
                <div className="font-medium">{s.user.first_name} {s.user.last_name}</div>
                <div className="text-sm text-gray-500">{s.student_number} - {s.major?.major_name}</div>
              </div>
            ))}
          </Card>
        )}
        {!searchLoading && searchTerm.length > 1 && students.length === 0 && !searchError && (
          <p className="text-sm text-gray-500 mt-1">No students found.</p>
        )}
        {selectedStudent && (
          <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Selected: {selectedStudent.user.first_name} {selectedStudent.user.last_name} ({selectedStudent.student_number})
          </div>
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
          placeholder="Select section"
          options={sectionOptions}
        />
        {sectionsLoading && <p className="text-sm text-gray-500 mt-1">Loading sections...</p>}
        {sectionsError && <p className="text-sm text-red-600 mt-1">{sectionsError}</p>}
        {!sectionsLoading && formData.semester_id && sections.length === 0 && !sectionsError && (
          <p className="text-sm text-gray-500 mt-1">No open sections available for this semester.</p>
        )}
        {selectedSection && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {selectedSection.course?.course_code} - {selectedSection.course?.course_name}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Section {selectedSection.section_number} • {selectedSection.course?.credits || 0} credits
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  Number(selectedSection.enrolled_count) >= Number(selectedSection.max_capacity)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {selectedSection.enrolled_count}/{selectedSection.max_capacity} enrolled
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-800">Schedule:</span>{' '}
                {selectedSection.schedule || 'TBA'}
              </div>
              <div>
                <span className="font-medium text-gray-800">Instructor:</span>{' '}
                {selectedSection.faculty?.user
                  ? `${selectedSection.faculty.user.first_name} ${selectedSection.faculty.user.last_name}`
                  : 'Unassigned'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={statusOptions}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel || (() => window.history.back())}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={disableSubmit || sectionsLoading}>
          {isEdit ? 'Update' : 'Create'} Enrollment
        </Button>
      </div>
    </form>
  );
};

export default EnrollmentForm;
