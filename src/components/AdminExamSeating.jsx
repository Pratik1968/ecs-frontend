import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Trash2, Plus, X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import PageLayout from '@/components/layout/PageLayout';
import { getExams, getExamSeating, getExamsByClass, assignSeating, removeSeatingAssignment, getStudentsByClass } from '@/services/api';

function AdminExamSeating() {
  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [seatingArrangement, setSeatingArrangement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [newSeatNumber, setNewSeatNumber] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const examsData = await getExams();
      setExams(examsData);
      setError(null);
    } catch (err) {
      setError('Failed to load exams');
      console.error('Error loading exams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to reload seating data for the selected exam
  const reloadSeatingData = async (exam) => {
    const classExams = await getExamsByClass(exam.classId);
    const selectedExamData = classExams.find(e => e.examID === exam.examID);
    return selectedExamData?.examSeatings || [];
  };

  // Parse seat position from "R4C2" format
  const parseSeatPosition = (seatNo) => {
    const match = seatNo.match(/R(\d+)C(\d+)/);
    if (match) {
      return {
        row: parseInt(match[1]),
        col: parseInt(match[2])
      };
    }
    return { row: 0, col: 0 };
  };

  // Convert "R1C2" format to numeric seat number
  const convertSeatToNumber = (seatString) => {
    const match = seatString.match(/R(\d+)C(\d+)/);
    if (!match) return null;

    const row = parseInt(match[1]);
    const col = parseInt(match[2]);

    // Assuming max 10 columns per row (adjust if needed)
    // R1C1 = 1, R1C2 = 2, R2C1 = 11, R2C2 = 12, etc.
    return (row - 1) * 10 + col;
  };

  // Convert numeric seat number back to "R1C2" format
  const convertNumberToSeat = (seatNumber) => {
    const row = Math.floor((seatNumber - 1) / 10) + 1;
    const col = ((seatNumber - 1) % 10) + 1;
    return `R${row}C${col}`;
  };

  // Get classroom dimensions from seating data
  const getClassroomDimensions = () => {
    if (!seatingArrangement || seatingArrangement.length === 0) return { maxRow: 0, maxCol: 0 };

    const positions = seatingArrangement.map(seat => parseSeatPosition(seat.seatNo));
    const maxRow = Math.max(...positions.map(p => p.row));
    const maxCol = Math.max(...positions.map(p => p.col));

    return { maxRow, maxCol };
  };

  const handleExamSelect = async (exam) => {
    try {
      setLoading(true);
      const seatingData = await reloadSeatingData(exam);

      setSelectedExam(exam);
      setSeatingArrangement(seatingData);

      // Load available students for this exam's class (pass seatingData to filter correctly)
      await loadAvailableStudents(exam.classId, seatingData);

      setError(null);
    } catch (err) {
      setError('Failed to load seating arrangement');
      console.error('Error loading seating arrangement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToExams = () => {
    setSelectedExam(null);
    setSeatingArrangement(null);
    setShowAddModal(false);
    setSelectedStudent('');
    setNewSeatNumber('');
  };

  const loadAvailableStudents = async (classId, currentSeatingData = null) => {
    try {
      const students = await getStudentsByClass(classId);
      // Use provided seating data or current state
      const seatingData = currentSeatingData || seatingArrangement || [];
      // Filter out students who already have seat assignments
      const assignedRegNos = seatingData.map(seat => seat.student.regNo);
      const unassignedStudents = students.filter(student => !assignedRegNos.includes(student.regNo));
      setAvailableStudents(unassignedStudents);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
    }
  };

  const handleAddSeat = async () => {
    if (!selectedStudent || !newSeatNumber) {
      setError('Please select a student and enter a seat number');
      return;
    }

    // Validate seat number format
    if (!newSeatNumber.match(/^R\d+C\d+$/)) {
      setError('Invalid seat format. Please use format like R4C2');
      return;
    }

    // Check if seat is already taken
    const existingSeat = seatingArrangement.find(seat => seat.seatNo === newSeatNumber);
    if (existingSeat) {
      setError(`Seat ${newSeatNumber} is already assigned to ${existingSeat.student.name}`);
      return;
    }

    // Check if student already has a seat assigned
    const studentAlreadyAssigned = seatingArrangement.find(seat => seat.student.regNo === selectedStudent);
    if (studentAlreadyAssigned) {
      setError(`Student is already assigned to seat ${studentAlreadyAssigned.seatNo}`);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      await assignSeating(selectedExam.examID, {
        regNo: selectedStudent,
        seatNo: newSeatNumber
      });

      // Reload seating arrangement
      const updatedSeating = await reloadSeatingData(selectedExam);
      setSeatingArrangement(updatedSeating);

      // Reload available students
      await loadAvailableStudents(selectedExam.classId, updatedSeating);

      // Reset form
      setSelectedStudent('');
      setNewSeatNumber('');
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to assign seat: ' + (err.message || 'Unknown error'));
      console.error('Error assigning seat:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteSeat = async (regNo) => {
    if (!window.confirm('Are you sure you want to remove this student\'s seat assignment?')) {
      return;
    }

    try {
      setLoading(true);
      await removeSeatingAssignment(selectedExam.examID, regNo);

      // Reload seating arrangement
      const updatedSeating = await reloadSeatingData(selectedExam);
      setSeatingArrangement(updatedSeating);
      setError(null);
    } catch (err) {
      setError('Failed to remove seat assignment');
      console.error('Error removing seat assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';

    try {
      // Handle different time formats
      let timeToFormat = timeString;

      // If it's already in HH:MM format, use it directly
      if (timeString.match(/^\d{1,2}:\d{2}$/)) {
        timeToFormat = timeString;
      }
      // If it's in HH:MM:SS format, remove seconds
      else if (timeString.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
        timeToFormat = timeString.substring(0, 5);
      }

      const date = new Date(`2000-01-01T${timeToFormat}`);

      if (isNaN(date.getTime())) {
        return timeString; // Return original if parsing fails
      }

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString || 'Time TBD';
    }
  };

  const getTotalStudents = () => {
    // Total students in the class (available + assigned)
    return availableStudents.length + getAssignedStudents();
  };

  const getAssignedStudents = () => {
    if (!seatingArrangement) return 0;
    return seatingArrangement.length;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="app">
          <div className="dashboard">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Loading...</h2>
              <p>Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="app">
          <div className="dashboard">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Error</h2>
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (selectedExam && seatingArrangement !== null) {
    const { maxRow, maxCol } = getClassroomDimensions();

    return (
      <PageLayout>
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Button
                onClick={handleBackToExams}
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
                  background: 'white'
                }}
              >
                <ArrowLeft size={20} />
              </Button>
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
                  Exam Seating Management
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0' }}>
                  {selectedExam.name} • {selectedExam.subject}
                </p>
                <p style={{
                  color: '#667eea',
                  fontSize: '0.95rem',
                  margin: '4px 0 0 0',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Users size={16} />
                  Class: {selectedExam.classId}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
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
                  <Settings size={24} style={{ color: '#667eea' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#1f2937' }}>
                    {getTotalStudents()}
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
                  <Users size={24} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#1f2937' }}>
                    {getAssignedStudents()}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Assigned Seats
                  </p>
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f59e0b15, #d9770615)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={24} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#1f2937' }}>
                    {getTotalStudents() - getAssignedStudents()}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Unassigned
                  </p>
                </div>
              </div>
            </Card>

            <Card style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf615, #7c3aed15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar size={24} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#1f2937' }}>
                    {getTotalStudents() > 0 ? Math.round((getAssignedStudents() / getTotalStudents()) * 100) : 0}%
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Assignment Rate
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={20} style={{ color: '#ef4444' }} />
                <span style={{ color: '#dc2626', fontWeight: '500' }}>{error}</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Student Assignments Table */}
            <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <CardHeader style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CardTitle style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    <Users size={20} style={{ color: '#667eea' }} />
                    Student Seating Assignments ({getAssignedStudents()})
                  </CardTitle>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Plus size={16} />
                      Add Student Seat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent style={{ padding: '0' }}>
                {seatingArrangement.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: '#6b7280'
                  }}>
                    <Users size={64} style={{
                      margin: '0 auto 24px',
                      opacity: 0.5
                    }} />
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      margin: '0 0 12px 0',
                      color: '#374151'
                    }}>
                      No Seating Assignments Found
                    </h3>
                    <p style={{
                      margin: '0 0 24px 0',
                      fontSize: '16px'
                    }}>
                      Students will need to be assigned seats for this exam.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        onClick={() => setShowAddModal(true)}
                        style={{
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Plus size={16} />
                        Add First Student
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ background: '#f8fafc' }}>
                          <TableHead style={{ fontWeight: '600', color: '#374151' }}>Student Name</TableHead>
                          <TableHead style={{ fontWeight: '600', color: '#374151' }}>Registration Number</TableHead>
                          <TableHead style={{ fontWeight: '600', color: '#374151' }}>Seat Number</TableHead>
                          <TableHead style={{ fontWeight: '600', color: '#374151' }}>Position</TableHead>
                          <TableHead style={{ fontWeight: '600', color: '#374151', textAlign: 'center' }}>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seatingArrangement.map((seatData, index) => {
                          const position = parseSeatPosition(seatData.seatNo);
                          return (
                            <TableRow key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <TableCell style={{ fontWeight: '500' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <User size={16} style={{ color: '#667eea' }} />
                                  {seatData.student.name}
                                </div>
                              </TableCell>
                              <TableCell style={{ fontWeight: '600', color: '#667eea' }}>
                                {seatData.student.regNo}
                              </TableCell>
                              <TableCell>
                                <Badge style={{
                                  background: '#667eea15',
                                  color: '#667eea',
                                  border: '1px solid #667eea30',
                                  fontFamily: 'monospace'
                                }}>
                                  {seatData.seatNo}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ color: '#6b7280' }}>
                                Row {position.row}, Column {position.col}
                              </TableCell>
                              <TableCell>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSeat(seatData.student.regNo)}
                                    style={{
                                      color: '#ef4444',
                                      padding: '8px',
                                      borderRadius: '8px'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Student Seat Modal */}
          {showAddModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <Card style={{
                width: '520px',
                maxWidth: '95vw',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                background: 'white',
                transform: 'scale(1)',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <CardHeader style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px 20px 0 0',
                  padding: '24px',
                  border: 'none'
                }}>
                  <CardTitle style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'white',
                    margin: 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Plus size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>Add Student Seat</div>
                        <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '400' }}>
                          Assign a seat to a student
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedStudent('');
                        setNewSeatNumber('');
                        setError(null);
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        color: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <X size={20} />
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* Student Selection */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '15px'
                      }}>
                        <User size={16} style={{ display: 'inline', marginRight: '8px', color: '#667eea' }} />
                        Select Student
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '15px',
                            background: '#fafafa',
                            color: '#374151',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        >
                          <option value="" style={{ color: '#9ca3af' }}>Choose a student...</option>
                          {availableStudents.map(student => (
                            <option key={student.regNo} value={student.regNo}>
                              {student.name} • {student.regNo}
                            </option>
                          ))}
                        </select>
                        {availableStudents.length === 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '8px',
                            padding: '12px 16px',
                            background: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#92400e'
                          }}>
                            All students in this class have been assigned seats
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seat Number Input */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '15px'
                      }}>
                        <MapPin size={16} style={{ display: 'inline', marginRight: '8px', color: '#667eea' }} />
                        Seat Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={newSeatNumber}
                          onChange={(e) => setNewSeatNumber(e.target.value.toUpperCase())}
                          placeholder="R4C2"
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            border: `2px solid ${!newSeatNumber ? '#e5e7eb' :
                              newSeatNumber.match(/^R\d+C\d+$/) ? '#10b981' : '#ef4444'
                              }`,
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
                            fontWeight: '600',
                            background: '#fafafa',
                            color: '#374151',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            if (!newSeatNumber || newSeatNumber.match(/^R\d+C\d+$/)) {
                              e.target.style.borderColor = '#667eea';
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = !newSeatNumber ? '#e5e7eb' :
                              newSeatNumber.match(/^R\d+C\d+$/) ? '#10b981' : '#ef4444';
                          }}
                        />
                        {newSeatNumber && (
                          <div style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: newSeatNumber.match(/^R\d+C\d+$/) ? '#10b981' : '#ef4444'
                          }}>
                            {newSeatNumber.match(/^R\d+C\d+$/) ?
                              <span style={{ color: 'white', fontSize: '12px' }}>✓</span> :
                              <span style={{ color: 'white', fontSize: '12px' }}>✗</span>
                            }
                          </div>
                        )}
                      </div>

                      {/* Format Helper */}
                      <div style={{
                        marginTop: '12px',
                        padding: '12px 16px',
                        background: newSeatNumber && !newSeatNumber.match(/^R\d+C\d+$/) ? '#fef2f2' : '#f0f9ff',
                        border: `1px solid ${newSeatNumber && !newSeatNumber.match(/^R\d+C\d+$/) ? '#fecaca' : '#bae6fd'}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: newSeatNumber && !newSeatNumber.match(/^R\d+C\d+$/) ? '#dc2626' : '#0369a1'
                      }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          Format: R{'{'}Row{'}'}C{'{'}Column{'}'}
                        </div>
                        <div style={{ opacity: 0.8 }}>
                          Examples: R1C1, R2C5, R10C3
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      justifyContent: 'flex-end',
                      paddingTop: '8px'
                    }}>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddModal(false);
                          setSelectedStudent('');
                          setNewSeatNumber('');
                          setError(null);
                        }}
                        style={{
                          borderRadius: '12px',
                          padding: '12px 24px',
                          fontWeight: '600',
                          border: '2px solid #e5e7eb',
                          color: '#6b7280',
                          background: 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddSeat}
                        disabled={!selectedStudent || !newSeatNumber || !newSeatNumber.match(/^R\d+C\d+$/)}
                        style={{
                          background: !selectedStudent || !newSeatNumber || !newSeatNumber.match(/^R\d+C\d+$/) ?
                            '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 32px',
                          fontWeight: '600',
                          fontSize: '15px',
                          cursor: !selectedStudent || !newSeatNumber || !newSeatNumber.match(/^R\d+C\d+$/) ?
                            'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: !selectedStudent || !newSeatNumber || !newSeatNumber.match(/^R\d+C\d+$/) ?
                            'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
                        }}
                      >
                        <Plus size={16} style={{ marginRight: '8px' }} />
                        Add Seat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}



        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="app">
        <div className="dashboard">
          <div className="dashboard-header">
            <div>
              <h1>Exam Seating Management</h1>
              <p className="dashboard-description">
                Manage seating arrangements for exams
              </p>
            </div>
          </div>

          <div className="exams-grid">
            {exams.length === 0 ? (
              <div className="no-exams">
                <Calendar size={48} className="no-exams-icon" />
                <h3>No Exams Available</h3>
                <p>There are currently no exams to manage.</p>
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className="exam-card"
                  onClick={() => handleExamSelect(exam)}
                >
                  <div className="exam-header">
                    <Calendar size={32} className="exam-icon" />
                    <h3>{exam.name}</h3>
                  </div>
                  <div className="exam-details">
                    <p className="exam-subject">{exam.subject}</p>
                    <p className="exam-date">
                      <Calendar size={14} />
                      {formatDate(exam.date)}
                    </p>
                    <p className="exam-time">
                      <Clock size={14} />
                      {exam.startTime ? formatTime(exam.startTime) : 'Time TBD'} • {exam.duration ? `${exam.duration} min` : 'Duration TBD'}
                    </p>
                    <p className="exam-classroom">
                      <MapPin size={14} />
                      {exam.classroom}
                    </p>
                    <p className="exam-class" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      color: '#667eea',
                      fontWeight: '500',
                      margin: '4px 0'
                    }}>
                      <Users size={14} />
                      Class: {exam.classId}
                    </p>
                    <Badge variant="outline" className="exam-type">
                      {exam.type}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default AdminExamSeating;
