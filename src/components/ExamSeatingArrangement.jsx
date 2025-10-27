import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/layout/PageLayout';
import { getExams, getExamSeating } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

function ExamSeatingArrangement() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [seatingArrangement, setSeatingArrangement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const renderClassroomLayout = () => {
    if (!seatingArrangement) return null;

    const { rows, columns, studentSeat } = seatingArrangement;
    const totalSeats = rows * columns;
    const seats = [];

    // Create seat grid
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        const seatNumber = (row - 1) * columns + col;
        const isStudentSeat = studentSeat && studentSeat.seatNumber === seatNumber;
        
        seats.push({
          seatNumber,
          row,
          col,
          isStudentSeat,
          isOccupied: isStudentSeat
        });
      }
    }

    return (
      <div className="classroom-layout">
        <div className="classroom-header">
          <h3>Classroom Layout</h3>
          <p>{rows} rows × {columns} columns ({totalSeats} total seats)</p>
        </div>
        
        <div className="classroom-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {seats.map((seat) => (
            <div
              key={seat.seatNumber}
              className={`seat ${seat.isStudentSeat ? 'student-seat' : seat.isOccupied ? 'occupied' : 'empty'}`}
              title={`Seat ${seat.seatNumber} (Row ${seat.row}, Column ${seat.col})`}
            >
              <span className="seat-number">{seat.seatNumber}</span>
              {seat.isStudentSeat && (
                <div className="student-indicator">YOU</div>
              )}
            </div>
          ))}
        </div>
        
        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-color student-seat"></div>
            <span>Your Seat</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <div className="legend-color empty"></div>
            <span>Available</span>
          </div>
        </div>
      </div>
    );
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
            <h1>Exam Seating Arrangement</h1>
            <p className="class-details">
              {selectedExam.name} • {selectedExam.subject}
            </p>
          </div>

          <div className="exam-seating-content">
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

              {seatingArrangement.studentSeat && (
                <Card className="student-seat-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin size={20} />
                      Your Seat Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="seat-assignment">
                      <div className="seat-info">
                        <div className="seat-number-large">
                          Seat {seatingArrangement.studentSeat.seatNumber}
                        </div>
                        <div className="seat-position">
                          Row {seatingArrangement.studentSeat.row}, Column {seatingArrangement.studentSeat.column}
                        </div>
                      </div>
                      <Badge variant="default" className="seat-status">
                        Assigned
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="classroom-section">
              {renderClassroomLayout()}
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
              <h1>Exam Seating Arrangement</h1>
              <p className="dashboard-description">
                View your seat assignment for upcoming exams
              </p>
            </div>
            <div className="student-info">
              <div className="student-details">
                <span className="student-name">{user.name}</span>
                <span className="student-id">ID: {user.regNumber}</span>
              </div>
            </div>
          </div>

          <div className="exams-grid">
            {exams.length === 0 ? (
              <div className="no-exams">
                <Calendar size={48} className="no-exams-icon" />
                <h3>No Exams Available</h3>
                <p>There are currently no exams with seating arrangements.</p>
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

export default ExamSeatingArrangement;
