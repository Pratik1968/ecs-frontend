import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, User, Clock, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import { getClasses, getClassDetails, getStudentAttendanceHistory } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Mock attendance records for student view
const mockAttendanceRecords = {
  'CS101': {
    '2024-01-26': [
      { name: 'John Smith', regNumber: '2024CS001', status: 'present', entryTime: '09:11' },
      { name: 'Alice Johnson', regNumber: '2024CS002', status: 'present', entryTime: '09:14' },
      { name: 'Bob Wilson', regNumber: '2024CS003', status: 'present', entryTime: '09:16' },
      { name: 'Emma Davis', regNumber: '2024CS004', status: 'absent', entryTime: '-' },
      { name: 'Michael Brown', regNumber: '2024CS005', status: 'present', entryTime: '09:09' }
    ],
    '2024-01-25': [
      { name: 'John Smith', regNumber: '2024CS001', status: 'present', entryTime: '09:05' },
      { name: 'Alice Johnson', regNumber: '2024CS002', status: 'present', entryTime: '09:12' },
      { name: 'Bob Wilson', regNumber: '2024CS003', status: 'absent', entryTime: '-' },
      { name: 'Emma Davis', regNumber: '2024CS004', status: 'present', entryTime: '09:08' },
      { name: 'Michael Brown', regNumber: '2024CS005', status: 'present', entryTime: '09:15' }
    ]
  },
  'MA102': {
    '2024-01-26': [
      { name: 'Sarah Wilson', regNumber: '2024MA001', status: 'present', entryTime: '10:05' },
      { name: 'David Lee', regNumber: '2024MA002', status: 'present', entryTime: '10:12' },
      { name: 'Lisa Chen', regNumber: '2024MA003', status: 'present', entryTime: '10:08' }
    ]
  },
  'PH201': {
    '2024-01-26': [
      { name: 'Tom Anderson', regNumber: '2024PH001', status: 'present', entryTime: '14:05' },
      { name: 'Rachel Green', regNumber: '2024PH002', status: 'absent', entryTime: '-' },
      { name: 'Chris Martin', regNumber: '2024PH003', status: 'present', entryTime: '14:12' }
    ]
  },
  'CH202': {
    '2024-01-26': [
      { name: 'Alex Turner', regNumber: '2024CH001', status: 'present', entryTime: '15:05' },
      { name: 'Sophie White', regNumber: '2024CH002', status: 'present', entryTime: '15:08' },
      { name: 'James Black', regNumber: '2024CH003', status: 'present', entryTime: '15:12' }
    ]
  },
  'EN301': {
    '2024-01-26': [
      { name: 'Grace Kelly', regNumber: '2024EN001', status: 'present', entryTime: '11:05' },
      { name: 'Henry Ford', regNumber: '2024EN002', status: 'absent', entryTime: '-' },
      { name: 'Ivy Johnson', regNumber: '2024EN003', status: 'present', entryTime: '11:12' }
    ]
  },
  'HI302': {
    '2024-01-26': [
      { name: 'Kate Winslet', regNumber: '2024HI001', status: 'present', entryTime: '13:05' },
      { name: 'Leo DiCaprio', regNumber: '2024HI002', status: 'present', entryTime: '13:08' },
      { name: 'Meryl Streep', regNumber: '2024HI003', status: 'present', entryTime: '13:12' }
    ]
  }
};

function StudentDashboard() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('class-info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load classrooms on component mount
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setLoading(true);
        const classesData = await getClasses();
        
        // Load details for each class to check if student is enrolled
        const studentClassrooms = [];
        for (const classroom of classesData) {
          try {
            const classDetails = await getClassDetails(classroom.id);
            // Check if current student is enrolled in this class
            const isEnrolled = classDetails.students.some(student => 
              student.regNo === user.regNumber
            );
            if (isEnrolled) {
              studentClassrooms.push(classroom);
            }
          } catch (err) {
            console.error(`Error loading details for class ${classroom.id}:`, err);
          }
        }
        
        setClassrooms(studentClassrooms);
        setError(null);
      } catch (err) {
        setError('Failed to load classrooms');
        console.error('Error loading classrooms:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassrooms();
  }, []);

  const handleClassroomClick = async (classroom) => {
    try {
      setLoading(true);
      const classDetails = await getClassDetails(classroom.id);
      // Add attendance records to the class details
      const classroomWithAttendance = {
        ...classDetails,
        attendanceRecords: mockAttendanceRecords[classroom.id] || {}
      };
      setSelectedClassroom(classroomWithAttendance);
      setActiveTab('class-info');
      setError(null);
    } catch (err) {
      setError('Failed to load class details');
      console.error('Error loading class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToClassrooms = () => {
    setSelectedClassroom(null);
    setActiveTab('class-info');
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 80) return '#f59e0b';
    return '#ef4444';
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

  // Calculate student's attendance for a specific classroom
  const getStudentAttendanceForClass = (classroomId) => {
    const attendanceRecords = mockAttendanceRecords[classroomId] || {};
    const dates = Object.keys(attendanceRecords);
    let presentCount = 0;
    let totalClasses = dates.length;

    dates.forEach(date => {
      const dayRecords = attendanceRecords[date];
      const studentRecord = dayRecords.find(record => record.regNumber === user.regNumber);
      if (studentRecord && studentRecord.status === 'present') {
        presentCount++;
      }
    });

    return totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
  };

  // Get student's attendance records for a classroom
  const getStudentAttendanceRecords = async (classroomId) => {
    try {
      const attendanceHistory = await getStudentAttendanceHistory(user.regNumber);
      // Filter attendance records for the specific classroom
      return attendanceHistory
        .filter(record => record.classId === classroomId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(record => ({
          date: record.date,
          status: record.status,
          entryTime: record.entryTime || '-'
        }));
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    }
  };

  // Show loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="dashboard">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Loading...</h2>
            <p>Please wait while we fetch the data</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout>
        <div className="dashboard">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (selectedClassroom) {
    const studentAttendanceRecords = getStudentAttendanceRecords(selectedClassroom.id);
    const studentAttendanceRate = getStudentAttendanceForClass(selectedClassroom.id);

    return (
      <PageLayout>
        <div className="header">
          <Button variant="ghost" className="back-button" onClick={handleBackToClassrooms}>
            <ArrowLeft size={20} />
            Back to Classrooms
          </Button>
          <h1>{selectedClassroom.name}</h1>
          <p className="class-details">
            {selectedClassroom.id} • Floor {selectedClassroom.floor} • Room {selectedClassroom.room}
          </p>
        </div>
          <div className="navigation">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-between">
                <TabsTrigger className="nav-tab" value="class-info">Class Info</TabsTrigger>
                <TabsTrigger className="nav-tab" value="faculty">Faculty</TabsTrigger>
                <TabsTrigger className="nav-tab" value="attendance-info">My Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="class-info">
                <div className="content">
                  <div className="class-info">
                    <div className="info-grid">
                      <Card className="basic-details">
                        <CardHeader>
                          <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="detail-item">
                            <span className="label">Class ID:</span>
                            <span className="value">{selectedClassroom.id}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Floor:</span>
                            <span className="value">{selectedClassroom.floor}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Room Number:</span>
                            <span className="value">{selectedClassroom.room}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Total Students:</span>
                            <span className="value">{selectedClassroom.totalStudents}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="attendance-stats">
                        <CardHeader>
                          <CardTitle>My Attendance Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="attendance-rate">
                            <span className="rate-number" style={{ color: getAttendanceColor(studentAttendanceRate) }}>
                              {studentAttendanceRate}%
                            </span>
                            <span className="rate-label">My Attendance Rate</span>
                            <div className="attendance-details">
                              <div>Classes Attended: {studentAttendanceRecords.filter(record => record.status === 'present').length}</div>
                              <div>Total Classes: {studentAttendanceRecords.length}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faculty">
                <div className="content">
                  <div className="faculty-info">
                    <h3><GraduationCap size={20} /> Faculty Information</h3>
                    <div className="faculty-details">
                      <div className="detail-item">
                        <span className="label">Name:</span>
                        <span className="value">{selectedClassroom.faculty.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">ID Number:</span>
                        <span className="value">{selectedClassroom.faculty.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Cabin Number:</span>
                        <span className="value">{selectedClassroom.faculty.cabinNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Position:</span>
                        <span className="value">{selectedClassroom.faculty.position}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendance-info">
                <div className="content">
                  <div className="attendance-info">
                    <h3><Clock size={20} /> My Attendance History</h3>
                    <p className="attendance-description">View your attendance records for this class</p>
                    
                    <div className="table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Entry Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentAttendanceRecords.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>
                                <Badge className={`status-badge ${record.status}`} variant={record.status === 'present' ? 'default' : 'destructive'}>
                                  {record.status === 'present' ? 'Present' : 'Absent'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {record.entryTime !== '-' ? (
                                  <span className="entry-time">
                                    <Clock size={14} />
                                    {record.entryTime}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="dashboard">
          <div className="dashboard-header">
            <div>
              <h1>Student Dashboard</h1>
              <p className="dashboard-description">
                View your enrolled classes and attendance information
              </p>
            </div>
            <div className="student-info">
              <div className="student-details">
                <span className="student-name">{user.name}</span>
                <span className="student-id">ID: {user.id}</span>
              </div>
            </div>
          </div>
          
          <div className="classrooms-grid">
            {classrooms.map((classroom) => {
              const studentAttendanceRate = getStudentAttendanceForClass(classroom.id);
              const studentAttendanceRecords = getStudentAttendanceRecords(classroom.id);
              const presentClasses = studentAttendanceRecords.filter(record => record.status === 'present').length;
              const totalClasses = studentAttendanceRecords.length;

              return (
                <div
                  key={classroom.id}
                  className="classroom-card"
                  onClick={() => handleClassroomClick(classroom)}
                >
                  <div className="classroom-header">
                    <GraduationCap size={48} className="class-icon" />
                    <h3>{classroom.name}</h3>
                  </div>
                  <div className="classroom-details">
                    <p>Floor {classroom.floor} - Room {classroom.room}</p>
                    <p className="class-id">Class ID: {classroom.id}</p>
                    <p className="students-count">
                      My Attendance: {presentClasses}/{totalClasses} classes
                    </p>
                    <p className="attendance-rate">
                      My Attendance Rate: 
                      <span style={{ color: getAttendanceColor(studentAttendanceRate) }}>
                        {' '}{studentAttendanceRate}%
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </PageLayout>
  );
}

export default StudentDashboard;
