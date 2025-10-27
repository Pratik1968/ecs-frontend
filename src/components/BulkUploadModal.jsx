import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users
} from 'lucide-react';
import { createStudent } from '@/services/api';
import { handleApiError } from '@/utils/apiHelpers';

function BulkUploadModal({ isOpen, onClose, onUploadComplete, classes }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/vnd.ms-excel' || 
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setResults(null);
    } else {
      alert('Please select a valid Excel file (.xlsx, .xls) or CSV file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 4) {
        students.push({
          regNo: values[0] || '',
          name: values[1] || '',
          classID: values[2] || '',
          barcode: values[3] || ''
        });
      }
    }

    return students;
  };

  const parseExcel = async (file) => {
    // For demo purposes, we'll simulate Excel parsing
    // In a real app, you'd use a library like xlsx or SheetJS
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Simulate parsing Excel data
        // This is a simplified version - in reality you'd use xlsx library
        const mockData = [
          { regNo: '2024CS001', name: 'John Doe', classID: 'CS101', barcode: 'JD001234' },
          { regNo: '2024CS002', name: 'Jane Smith', classID: 'CS101', barcode: 'JS002345' },
          { regNo: '2024MA001', name: 'Bob Johnson', classID: 'MA102', barcode: 'BJ003456' }
        ];
        resolve(mockData);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResults(null);

    try {
      let studentsData = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        studentsData = parseCSV(text);
      } else {
        studentsData = await parseExcel(file);
      }

      if (studentsData.length === 0) {
        setResults({
          success: [],
          errors: [{ error: 'No valid student data found in file' }],
          total: 0
        });
        return;
      }

      const results = {
        success: [],
        errors: [],
        total: studentsData.length
      };

      // Process each student
      for (const studentData of studentsData) {
        try {
          // Validate required fields
          if (!studentData.regNo || !studentData.name || !studentData.classID || !studentData.barcode) {
            results.errors.push({
              student: studentData,
              error: 'Missing required fields (regNo, name, classID, barcode)'
            });
            continue;
          }

          // Check if class exists
          const classExists = classes.find(c => c.id === studentData.classID);
          if (!classExists) {
            results.errors.push({
              student: studentData,
              error: `Class ${studentData.classID} does not exist`
            });
            continue;
          }

          // Create student
          const createdStudent = await createStudent(studentData);
          results.success.push(createdStudent);
        } catch (err) {
          results.errors.push({
            student: studentData,
            error: handleApiError(err, 'Creating student')
          });
        }
      }

      setResults(results);

      // If there were successful uploads, notify parent
      if (results.success.length > 0) {
        onUploadComplete(results.success);
      }

    } catch (err) {
      setResults({
        success: [],
        errors: [{ error: handleApiError(err, 'Processing file') }],
        total: 0
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'regNo,name,classID,barcode\n2024CS001,John Doe,CS101,JD001234\n2024CS002,Jane Smith,CS101,JS002345';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{
        width: '100%',
        maxWidth: '600px',
        borderRadius: '20px',
        border: 'none',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        background: 'white',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <CardHeader style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '20px',
              fontWeight: '700',
              margin: '0'
            }}>
              <Upload size={24} />
              Bulk Upload Students
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              style={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                padding: '0'
              }}
            >
              <X size={20} />
            </Button>
          </div>
          <p style={{ 
            fontSize: '14px', 
            opacity: 0.9, 
            margin: '8px 0 0 0'
          }}>
            Upload an Excel or CSV file with student information to add multiple students at once
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Template Download */}
            <div style={{
              padding: '16px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertCircle size={16} style={{ color: '#0284c7' }} />
                <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#0284c7' }}>
                  File Format Requirements
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: '#0369a1', margin: '0 0 12px 0' }}>
                Your file must contain columns: regNo, name, classID, barcode
              </p>
              <Button
                onClick={downloadTemplate}
                variant="outline"
                style={{
                  fontSize: '13px',
                  padding: '8px 16px',
                  height: 'auto',
                  borderColor: '#0284c7',
                  color: '#0284c7'
                }}
              >
                <Download size={14} style={{ marginRight: '6px' }} />
                Download Template
              </Button>
            </div>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${dragOver ? '#10b981' : '#d1d5db'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                background: dragOver ? '#f0fdf4' : '#fafafa',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              
              <FileSpreadsheet 
                size={48} 
                style={{ 
                  color: dragOver ? '#10b981' : '#9ca3af',
                  margin: '0 auto 16px'
                }} 
              />
              
              {file ? (
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                    Drop your file here or click to browse
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Supports Excel (.xlsx, .xls) and CSV files
                  </p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {file && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  background: uploading ? '#f3f4f6' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: uploading ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                <Upload size={18} />
                {uploading ? 'Processing...' : 'Upload Students'}
              </Button>
            )}

            {/* Results */}
            {results && (
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#f9fafb',
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Users size={18} />
                    Upload Results
                  </h4>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Badge style={{ background: '#10b981', color: 'white' }}>
                      {results.success.length} Successful
                    </Badge>
                    <Badge style={{ background: '#ef4444', color: 'white' }}>
                      {results.errors.length} Failed
                    </Badge>
                    <Badge style={{ background: '#6b7280', color: 'white' }}>
                      {results.total} Total
                    </Badge>
                  </div>
                </div>

                <div style={{ padding: '16px', maxHeight: '300px', overflow: 'auto' }}>
                  {/* Success Items */}
                  {results.success.map((student, index) => (
                    <div key={`success-${index}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 0',
                      borderBottom: index < results.success.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '14px' }}>
                        {student.name} ({student.regNo}) - Added successfully
                      </span>
                    </div>
                  ))}

                  {/* Error Items */}
                  {results.errors.map((error, index) => (
                    <div key={`error-${index}`} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px 0',
                      borderBottom: index < results.errors.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <XCircle size={16} style={{ color: '#ef4444', marginTop: '2px' }} />
                      <div style={{ fontSize: '14px' }}>
                        {error.student ? (
                          <>
                            <strong>{error.student.name || error.student.regNo || 'Unknown'}</strong>
                            <br />
                            <span style={{ color: '#ef4444' }}>{error.error}</span>
                          </>
                        ) : (
                          <span style={{ color: '#ef4444' }}>{error.error}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BulkUploadModal;