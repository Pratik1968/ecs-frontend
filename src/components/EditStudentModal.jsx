import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { X, User, Hash, Building, Scan, Save } from 'lucide-react';
import { updateStudent } from '@/services/api';
import { handleApiError, validateRequiredFields } from '@/utils/apiHelpers';

function EditStudentModal({ isOpen, onClose, onStudentUpdated, student, classes }) {
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    classID: '',
    barcode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when student prop changes
  useEffect(() => {
    if (student) {
      setFormData({
        regNo: student.regNo || '',
        name: student.name || '',
        classID: student.classID || '',
        barcode: student.barcode || ''
      });
    }
  }, [student]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const generateBarcode = () => {
    // Generate a simple barcode based on registration number and timestamp
    const timestamp = Date.now().toString().slice(-6);
    const regPart = formData.regNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-4);
    const barcode = `${regPart}${timestamp}`;
    setFormData(prev => ({ ...prev, barcode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    const validation = validateRequiredFields(formData, ['regNo', 'name', 'classID', 'barcode']);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      const updatedStudent = await updateStudent(student.regNo, formData);
      onStudentUpdated(updatedStudent);
    } catch (err) {
      setError(handleApiError(err, 'Updating student'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

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
        maxWidth: '500px',
        borderRadius: '20px',
        border: 'none',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        background: 'white',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <CardHeader style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
              <User size={24} />
              Edit Student
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
            Update the student information below
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Registration Number */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <Hash size={16} />
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.regNo}
                  onChange={(e) => handleInputChange('regNo', e.target.value)}
                  placeholder="e.g., 2024CS001"
                  required
                  disabled // Registration number should not be editable
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  margin: '4px 0 0 0' 
                }}>
                  Registration number cannot be changed
                </p>
              </div>

              {/* Student Name */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <User size={16} />
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Class Selection */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <Building size={16} />
                  Class *
                </label>
                <select
                  value={formData.classID}
                  onChange={(e) => handleInputChange('classID', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select a class</option>
                  {classes.map(classObj => (
                    <option key={classObj.id} value={classObj.id}>
                      {classObj.name} ({classObj.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Barcode */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <Scan size={16} />
                  Barcode *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Enter or generate barcode"
                    required
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'monospace',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    onClick={generateBarcode}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 16px'
                    }}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                marginTop: '8px'
              }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#f3f4f6' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: loading ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={16} />
                  {loading ? 'Updating...' : 'Update Student'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditStudentModal;