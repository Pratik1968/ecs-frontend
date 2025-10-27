import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import PageLayout from '@/components/layout/PageLayout';
import { getExams, getExamSeating, bulkAssignSeating, removeSeatingAssignment } from '@/services/api';

function AdminExamSeating() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [seatingArrangement, setSeatingArrangement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
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

  const handleExamSelect = async (exam) => {
    try {
      setLoading(true);
      const seating = await getExamSeating(exam.id);
      setSelectedExam(exam);
      setSeatingArrangement(seating);
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
    setEditingStudent(null);
    setNewSeatNumber('');
  };

  const handleEditSeat = (student) => {
    setEditingStudent(student);
    setNewSeatNumber(student.seatNumber.toString());
  };

  const handleSaveSeat = async () => {
    if (!editingStudent || !newSeatNumber) return;

    try {
      setLoading(true);
      
      // Remove old assignment
      await removeSeatingAssignment(selectedExam.id, editingStudent.regNo);
      
      // Add new assignment
      await bulkAssignSeating(selectedExam.id, [{
        regNo: editingStudent.regNo,
        seatNumber: parseInt(newSeatNumber)
      }]);

      // Reload seating arrangement
      const updatedSeating = await getExamSeating(selectedExam.id);
      setSeatingArrangement(updatedSeating);
      setEditingStudent(null);
      setNewSeatNumber('');
      setError(null);
    } catch (err) {
      setError('Failed to update seat assignment');
      console.error('Error updating seat assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setNewSeatNumber('');
  };

  const handleDeleteSeat = async (regNo) => {
    if (!window.confirm('Are you sure you want to remove this student\'s seat assignment?')) {
      return;
    }

    try {
      setLoading(true);
      await removeSeatingAssignment(selectedExam.id, regNo);
      
      // Reload seating arrangement
      const updatedSeating = await getExamSeating(selectedExam.id);
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
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalSeats = () => {
    if (!seatingArrangement) return 0;
    return seatingArrangement.rows * seatingArrangement.columns;
  };

  const getAssignedSeats = () => {
    if (!seatingArrangement || !seatingArrangement.students) return 0;
    return seatingArrangement.students.length;
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

  if (selectedExam && seatingArrangement) {
    return (
      <PageLayout>
        <div className="app">
          <div className="header">
            <Button variant="ghost" className="back-button" onClick={handleBackToExams}>
              <ArrowLeft size={20} />
              Back to Exams
            </Button>
            <h1>Exam Seating Management</h1>
            <p className="class-details">
              {selectedExam.name} • {selectedExam.subject}
            </p>
          </div>

          <div className="admin-seating-content">
            <div className="exam-info-section">
              <Card className="exam-details-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} />
                    Exam Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="exam-details-grid">
                    <div className="detail-item">
                      <span className="label">Exam Name:</span>
                      <span className="value">{selectedExam.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Subject:</span>
                      <span className="value">{selectedExam.subject}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(selectedExam.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Time:</span>
                      <span className="value">{formatTime(selectedExam.startTime)} - {formatTime(selectedExam.endTime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{selectedExam.duration} minutes</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Classroom:</span>
                      <span className="value">{selectedExam.classroom}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="seating-stats-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Seating Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{getTotalSeats()}</span>
                      <span className="stat-label">Total Seats</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{getAssignedSeats()}</span>
                      <span className="stat-label">Assigned Seats</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{getTotalSeats() - getAssignedSeats()}</span>
                      <span className="stat-label">Available Seats</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        {getTotalSeats() > 0 ? Math.round((getAssignedSeats() / getTotalSeats()) * 100) : 0}%
                      </span>
                      <span className="stat-label">Occupancy Rate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="students-section">
              <Card className="students-list-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Student Seating Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="table-container">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Registration Number</TableHead>
                          <TableHead>Seat Number</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seatingArrangement.students && seatingArrangement.students.length > 0 ? (
                          seatingArrangement.students.map((student, index) => (
                            <TableRow key={index}>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.regNo}</TableCell>
                              <TableCell>
                                {editingStudent && editingStudent.regNo === student.regNo ? (
                                  <input
                                    type="number"
                                    value={newSeatNumber}
                                    onChange={(e) => setNewSeatNumber(e.target.value)}
                                    className="seat-input"
                                    min="1"
                                    max={getTotalSeats()}
                                  />
                                ) : (
                                  <Badge variant="outline">Seat {student.seatNumber}</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                Row {student.row}, Column {student.column}
                              </TableCell>
                              <TableCell>
                                <div className="action-buttons">
                                  {editingStudent && editingStudent.regNo === student.regNo ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={handleSaveSeat}
                                        className="action-btn save-btn"
                                      >
                                        <Save size={14} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        className="action-btn cancel-btn"
                                      >
                                        <X size={14} />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditSeat(student)}
                                        className="action-btn edit-btn"
                                        disabled={editingStudent !== null}
                                      >
                                        <Edit size={14} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteSeat(student.regNo)}
                                        className="action-btn delete-btn"
                                        disabled={editingStudent !== null}
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              <div className="no-assignments">
                                <Users size={32} className="no-assignments-icon" />
                                <p>No seating assignments found</p>
                                <p className="text-muted">Students will need to be assigned seats for this exam.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
                      {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                    </p>
                    <p className="exam-classroom">
                      <MapPin size={14} />
                      {exam.classroom}
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
