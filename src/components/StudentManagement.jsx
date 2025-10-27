import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  UserPlus,
  Filter,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { getAllStudents, deleteStudent, getClasses } from '@/services/api';
import { handleApiError } from '@/utils/apiHelpers';
import CreateStudentModal from './CreateStudentModal';
import EditStudentModal from './EditStudentModal';
import BulkUploadModal from './BulkUploadModal';

function StudentManagement({ pageParams = {}, onNavigateBack }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(pageParams.selectedClass || 'all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [contextMessage, setContextMessage] = useState('');

  // Load students and classes on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle page parameters (when navigated from class view)
  useEffect(() => {
    if (pageParams.selectedClass) {
      setSelectedClass(pageParams.selectedClass);
      if (pageParams.classContext) {
        setContextMessage(`Adding students to ${pageParams.classContext}`);
        // Clear the message after 5 seconds
        setTimeout(() => setContextMessage(''), 5000);
      }
    }
  }, [pageParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        getAllStudents(),
        getClasses()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      setError(null);
    } catch (err) {
      setError(handleApiError(err, 'Loading data'));
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (regNo) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await deleteStudent(regNo);
      setStudents(students.filter(student => student.regNo !== regNo));
    } catch (err) {
      setError(handleApiError(err, 'Deleting student'));
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleStudentCreated = (newStudent) => {
    setStudents([...students, newStudent]);
    setShowCreateModal(false);
  };

  const handleStudentUpdated = (updatedStudent) => {
    setStudents(students.map(student => 
      student.regNo === updatedStudent.regNo ? updatedStudent : student
    ));
    setShowEditModal(false);
    setSelectedStudent(null);
  };

  const handleBulkUploadComplete = (newStudents) => {
    setStudents([...students, ...newStudents]);
    setShowBulkUploadModal(false);
  };

  // Filter students based on search term and selected class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.classID === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getClassNameById = (classId) => {
    const classObj = classes.find(c => c.id === classId);
    return classObj ? classObj.name : classId;
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Loading students...</h2>
          <p>Please wait while we fetch the student data</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {pageParams.classContext && (
                <Button
                  onClick={() => {
                    if (onNavigateBack) {
                      onNavigateBack();
                    } else {
                      // Fallback to dashboard navigation
                      window.location.hash = '#dashboard';
                    }
                  }}
                  variant="outline"
                  style={{
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #667eea',
                    color: '#667eea',
                    background: 'white',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                  }}
                  title={`Back to ${pageParams.classContext}`}
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  margin: '0 0 8px 0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Student Management
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0' }}>
                  Manage student records, add new students, and organize class assignments
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setShowBulkUploadModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <Upload size={18} />
                Bulk Upload
              </Button>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <UserPlus size={18} />
                {selectedClass !== 'all' ? 
                  `Add Student to ${getClassNameById(selectedClass)}` : 
                  'Add Student'
                }
              </Button>
            </div>
          </div>

          {/* Context Message */}
          {contextMessage && (
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #667eea15, #764ba215)',
              border: '1px solid #667eea30',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#667eea',
                borderRadius: '50%'
              }} />
              <p style={{ 
                margin: '0', 
                color: '#667eea', 
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {contextMessage}
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <Card style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={24} style={{ color: '#667eea' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#1f2937' }}>
                    {students.length}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Total Students
                  </p>
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b98115, #05966915)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Filter size={24} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#1f2937' }}>
                    {filteredStudents.length}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Filtered Results
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card style={{ marginBottom: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <CardContent style={{ padding: '24px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px',
              alignItems: 'end'
            }}>
              {/* Search */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Search Students
                </label>
                <div style={{ position: 'relative' }}>
                  <Search 
                    size={18} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6b7280'
                    }} 
                  />
                  <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Classes</option>
                  {classes.map(classObj => (
                    <option key={classObj.id} value={classObj.id}>
                      {classObj.name} ({classObj.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card style={{ 
            marginBottom: '24px', 
            borderRadius: '12px', 
            border: '1px solid #fecaca',
            background: '#fef2f2'
          }}>
            <CardContent style={{ padding: '16px' }}>
              <p style={{ color: '#dc2626', margin: '0' }}>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <CardHeader style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <CardTitle style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              <Users size={20} />
              Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '0' }}>
            {filteredStudents.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                color: '#6b7280'
              }}>
                <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  No students found
                </h3>
                <p style={{ margin: '0' }}>
                  {searchTerm || selectedClass !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first student'
                  }
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: '#f8fafc' }}>
                      <TableHead style={{ fontWeight: '600', color: '#374151' }}>Registration No.</TableHead>
                      <TableHead style={{ fontWeight: '600', color: '#374151' }}>Name</TableHead>
                      <TableHead style={{ fontWeight: '600', color: '#374151' }}>Class</TableHead>
                      <TableHead style={{ fontWeight: '600', color: '#374151' }}>Barcode</TableHead>
                      <TableHead style={{ fontWeight: '600', color: '#374151', textAlign: 'center' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.regNo} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <TableCell style={{ fontWeight: '600', color: '#667eea' }}>
                          {student.regNo}
                        </TableCell>
                        <TableCell style={{ fontWeight: '500' }}>
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <Badge style={{ 
                            background: '#667eea15', 
                            color: '#667eea',
                            border: '1px solid #667eea30'
                          }}>
                            {getClassNameById(student.classID)}
                          </Badge>
                        </TableCell>
                        <TableCell style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          {student.barcode}
                        </TableCell>
                        <TableCell>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '8px' 
                          }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStudent(student)}
                              style={{
                                color: '#667eea',
                                padding: '8px',
                                borderRadius: '8px'
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.regNo)}
                              style={{
                                color: '#ef4444',
                                padding: '8px',
                                borderRadius: '8px'
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {showCreateModal && (
          <CreateStudentModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onStudentCreated={handleStudentCreated}
            classes={classes}
            preSelectedClass={selectedClass !== 'all' ? selectedClass : null}
          />
        )}

        {showEditModal && selectedStudent && (
          <EditStudentModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStudent(null);
            }}
            onStudentUpdated={handleStudentUpdated}
            student={selectedStudent}
            classes={classes}
          />
        )}

        {showBulkUploadModal && (
          <BulkUploadModal
            isOpen={showBulkUploadModal}
            onClose={() => setShowBulkUploadModal(false)}
            onUploadComplete={handleBulkUploadComplete}
            classes={classes}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default StudentManagement;