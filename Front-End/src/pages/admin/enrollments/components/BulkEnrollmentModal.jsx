import React, { useState } from 'react';
import { Modal, Button, Select } from '../../../../components/ui';
import enrollmentService from '../../../../services/enrollmentService';
import * as XLSX from 'xlsx';

const BulkEnrollmentModal = ({ isOpen, onClose, onSuccess, semesters }) => {
  const [step, setStep] = useState(1);
  const [semesterId, setSemesterId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const semesterOptions = semesters.map((s) => ({
    value: String(s.semester_id),
    label: `${s.semester_name} ${s.semester_year}`,
  }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      const parsed = json.map(row => ({
        student_id: row['Student ID'] || row['student_id'],
        section_csn: row['Section CSN'] || row['csn'],
        status: 'enrolled'
      }));
      
      setEnrollments(parsed);
      setStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await enrollmentService.bulkCreate({ semester_id: semesterId, enrollments });
    onSuccess();
    setStep(1);
    setSemesterId('');
    setEnrollments([]);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h2 className="text-xl font-bold">Bulk Enrollment</h2>
      </Modal.Header>
      
      <Modal.Body>
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Semester *</label>
              <Select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                placeholder="Select semester..."
                options={semesterOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Upload File *</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600">
                  Click to upload
                </label>
                <p className="text-sm text-gray-500 mt-2">Excel or CSV format</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600">✓ {enrollments.length} enrollments ready</p>
            <div className="max-h-60 overflow-auto border rounded">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs">Student ID</th>
                    <th className="px-3 py-2 text-left text-xs">Section CSN</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.slice(0, 5).map((e, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{e.student_id}</td>
                      <td className="px-3 py-2">{e.section_csn}</td>
                    </tr>
                  ))}
                  {enrollments.length > 5 && (
                    <tr><td colSpan="2" className="px-3 py-2 text-gray-500">... and {enrollments.length - 5} more</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {step === 1 ? (
          <Button onClick={() => setStep(2)} disabled={!semesterId}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={loading}>Process</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkEnrollmentModal;
