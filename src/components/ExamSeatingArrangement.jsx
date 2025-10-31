import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/layout/PageLayout';
import { getExams, getExamSeating, getExamsByClass } from '@/services/api';
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
      // Use classID to get exams for that class, then find seating for this specific exam
      const classExams = await getExamsByClass(exam.classId);
      const selectedExamData = classExams.find(e => e.examID === exam.examID);

      setSelectedExam(exam);
      setSeatingArrangement(selectedExamData?.examSeatings || []);
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

  // Find current user's seat
  const findUserSeat = () => {
    if (!seatingArrangement || !user) return null;
    return seatingArrangement.find(seat =>
      seat.student && seat.student.regNo === user.id
    );
  };

  const renderClassroomLayout = () => {
    if (!seatingArrangement || seatingArrangement.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            No Seating Arrangement
          </h3>
          <p style={{ margin: '0' }}>
            Seating arrangement has not been assigned for this exam yet.
          </p>
        </div>
      );
    }

    // Calculate grid dimensions
    const positions = seatingArrangement.map(seat => parseSeatPosition(seat.seatNo));
    const maxRow = Math.max(...positions.map(p => p.row));
    const maxCol = Math.max(...positions.map(p => p.col));

    const userSeat = findUserSeat();

    // Create seat grid
    const seatGrid = [];
    for (let row = 1; row <= maxRow; row++) {
      for (let col = 1; col <= maxCol; col++) {
        const seatData = seatingArrangement.find(seat => {
          const pos = parseSeatPosition(seat.seatNo);
          return pos.row === row && pos.col === col;
        });

        const isUserSeat = userSeat && seatData && seatData.id === userSeat.id;

        seatGrid.push({
          row,
          col,
          seatNo: seatData ? seatData.seatNo : `R${row}C${col}`,
          student: seatData ? seatData.student : null,
          isOccupied: !!seatData,
          isUserSeat
        });
      }
    }

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            color: '#1f2937'
          }}>
            Classroom Seating Layout
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>
            {maxRow} rows × {maxCol} columns • {seatingArrangement.length} students assigned
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
          gap: '8px',
          maxWidth: '800px',
          margin: '0 auto 24px auto',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '2px solid #e2e8f0'
        }}>
          {seatGrid.map((seat) => (
            <div
              key={`${seat.row}-${seat.col}`}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                cursor: seat.isOccupied ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                background: seat.isUserSeat ?
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                  seat.isOccupied ?
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                    '#ffffff',
                color: seat.isOccupied ? 'white' : '#9ca3af',
                border: seat.isOccupied ? 'none' : '2px dashed #d1d5db',
                boxShadow: seat.isOccupied ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
              }}
              title={seat.isOccupied ?
                `${seat.seatNo} - ${seat.student.name} (${seat.student.regNo})` :
                `${seat.seatNo} - Empty`
              }
              onMouseEnter={(e) => {
                if (seat.isOccupied && !seat.isUserSeat) {
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (seat.isOccupied && !seat.isUserSeat) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {seat.seatNo}
              </div>
              {seat.isUserSeat && (
                <div style={{ fontSize: '8px', fontWeight: '700' }}>
                  YOU
                </div>
              )}
              {seat.isOccupied && !seat.isUserSeat && (
                <User size={12} />
              )}
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>Your Seat</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>Occupied</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#ffffff',
              border: '2px dashed #d1d5db',
              borderRadius: '4px'
            }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>Available</span>
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

  if (selectedExam && seatingArrangement !== null) {
    const userSeat = findUserSeat();

    return (
      <PageLayout>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
                  Exam Seating Arrangement
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0' }}>
                  {selectedExam.name} • {selectedExam.subject}
                </p>
              </div>
            </div>
          </div>

          {/* Exam Info Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: userSeat ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Exam Details Card */}
            <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <CardHeader style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderBottom: '1px solid #e2e8f0',
                borderRadius: '16px 16px 0 0'
              }}>
                <CardTitle style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  <BookOpen size={20} style={{ color: '#667eea' }} />
                  Exam Details
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Exam Name:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedExam.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Subject:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedExam.subject}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Date:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{formatDate(selectedExam.date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Duration:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedExam.duration} minutes</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontWeight: '500' }}>Class ID:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedExam.classId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Seat Card */}
            {userSeat && (
              <Card style={{
                borderRadius: '16px',
                border: '2px solid #10b981',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
              }}>
                <CardHeader style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '14px 14px 0 0'
                }}>
                  <CardTitle style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    <MapPin size={20} />
                    Your Seat Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '800',
                      color: '#10b981',
                      marginBottom: '8px'
                    }}>
                      {userSeat.seatNo}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#059669',
                      fontWeight: '600'
                    }}>
                      {(() => {
                        const pos = parseSeatPosition(userSeat.seatNo);
                        return `Row ${pos.row}, Column ${pos.col}`;
                      })()}
                    </div>
                    <Badge style={{
                      marginTop: '12px',
                      background: '#10b981',
                      color: 'white'
                    }}>
                      Confirmed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Seat Assigned Card */}
            {!userSeat && (
              <Card style={{
                borderRadius: '16px',
                border: '2px solid #f59e0b',
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
              }}>
                <CardHeader style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  borderRadius: '14px 14px 0 0'
                }}>
                  <CardTitle style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    <MapPin size={20} />
                    Seat Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ color: '#d97706', marginBottom: '8px' }}>
                    <MapPin size={32} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '4px'
                  }}>
                    No Seat Assigned
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#a16207'
                  }}>
                    Please contact your instructor
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Classroom Layout */}
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
                <Users size={20} style={{ color: '#667eea' }} />
                Classroom Layout
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0' }}>
              {renderClassroomLayout()}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
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
                Exam Seating Arrangements
              </h1>
              <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0' }}>
                View your seat assignments for upcoming exams
              </p>
            </div>

            {user && (
              <Card style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={20} style={{ color: '#667eea' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '0', color: '#1f2937' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                      ID: {user.id}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <Card style={{
            padding: '4rem',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <Calendar size={64} style={{
              margin: '0 auto 24px',
              color: '#9ca3af'
            }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#374151'
            }}>
              No Exams Available
            </h3>
            <p style={{
              color: '#6b7280',
              margin: '0',
              fontSize: '16px'
            }}>
              There are currently no exams with seating arrangements available.
            </p>
          </Card>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {exams.map((exam) => (
              <Card
                key={exam.id}
                style={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
                onClick={() => handleExamSelect(exam)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <CardHeader style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderBottom: '1px solid #e2e8f0'
                }}>
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
                      <BookOpen size={24} style={{ color: '#667eea' }} />
                    </div>
                    <div>
                      <CardTitle style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: '0 0 4px 0'
                      }}>
                        {exam.name}
                      </CardTitle>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '0'
                      }}>
                        {exam.subject}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} style={{ color: '#667eea' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {formatDate(exam.date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: '#667eea' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {exam.duration} minutes
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} style={{ color: '#667eea' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        Class {exam.classId}
                      </span>
                    </div>
                    <Badge style={{
                      alignSelf: 'flex-start',
                      marginTop: '8px',
                      background: exam.status === 'upcoming' ? '#10b981' : '#6b7280',
                      color: 'white'
                    }}>
                      {exam.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default ExamSeatingArrangement;
