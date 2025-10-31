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

import { getAttendanceByDate, getClassDays } from '@/services/api';

function StudentDashboard() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('class-info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRates, setAttendanceRates] = useState({});

  // Load classrooms on component mount
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setLoading(true);
        const classesData = await getClasses();
        
        // Load details for each class to check if student is enrolled
        const studentClassrooms = [];
        const rates = {};
        
        for (const classroom of classesData) {
          try {
            const classDetails = await getClassDetails(classroom.id);
            // Check if current student is enrolled in this class
            const isEnrolled = classDetails.students.some(student => 
              student.regNo === user.regNumber
            );
            if (isEnrolled) {
              studentClassrooms.push(classroom);
              // Calculate attendance rate for this classroom
              const rate = await getStudentAttendanceForClass(classroom.id);
              rates[classroom.id] = rate;
            }
          } catch (err) {
            console.error(`Error loading details for class ${classroom.id}:`, err);
          }
        }
        
        setClassrooms(studentClassrooms);
        setAttendanceRates(rates);
        setError(null);
      } catch (err) {
        setError('Failed to load classrooms');
        console.error('Error loading classrooms:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassrooms();
  }, [user.regNumber]);

  const handleClassroomClick = async (classroom) => {
    try {
      setLoading(true);
      const classDetails = await getClassDetails(classroom.id);
      
      // Get all class days (days when any student marked attendance)
      const classDays = await getClassDays(classroom.id);
      
      // Load attendance records for each class day
      const attendanceRecords = {};
      
      for (const classDay of classDays) {
        try {
          const dayAttendance = await getAttendanceByDate(classDay, classroom.id);
          
          if (dayAttendance && dayAttendance.length > 0) {
            // Get all students in the class for name lookup
            const allStudents = classDetails.students || [];
            
            // Create a map of regNo to student name for quick lookup
            const studentNameMap = {};
            allStudents.forEach(student => {
              studentNameMap[student.regNo] = student.name;
            });
            
            // Remove duplicates - keep only the first attendance record per student per day
            const uniqueAttendance = {};
            dayAttendance.forEach(record => {
              const regNo = record.regNo || record.regNumber;
              if (!uniqueAttendance[regNo]) {
                uniqueAttendance[regNo] = record;
              }
            });
            
            attendanceRecords[classDay] = Object.values(uniqueAttendance).map(record => {
              const regNo = record.regNo || record.regNumber;
              return {
                name: studentNameMap[regNo] || record.studentName || record.name || 'Unknown Student',
                regNumber: regNo,
                status: record.arrival_time ? 'present' : 'absent',
                entryTime: record.arrival_time ? 
                  new Date(record.arrival_time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) : '-'
              };
            });
          }
        } catch (attendanceError) {
          console.log(`No attendance data for ${classDay}:`, attendanceError);
        }
      }
      
      const classroomWithAttendance = {
        ...classDetails,
        attendanceRecords,
        classDays
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

  // Calculate student's attendance for a specific classroom using class days logic
  const getStudentAttendanceForClass = async (classroomId) => {
    try {
      // Get all class days for this class
      const classDays = await getClassDays(classroomId);
      
      if (classDays.length === 0) {
        return 0;
      }
      
      // Get student's attendance history
      const attendanceHistory = await getStudentAttendanceHistory(user.regNumber);
      
      if (!attendanceHistory || attendanceHistory.length === 0) {
        return 0; // Student has no attendance records, so 0%
      }
      
      // Create a set of dates when this student was present
      const presentDates = new Set();
      attendanceHistory.forEach(record => {
        if (record.arrival_time && record.classID === classroomId) {
          presentDates.add(record.date);
        }
      });
      
      // Calculate attendance rate based on class days
      const totalClassDays = classDays.length;
      const presentDays = classDays.filter(date => presentDates.has(date)).length;
      
      return totalClassDays > 0 ? Math.round((presentDays / totalClassDays) * 100) : 0;
    } catch (error) {
      console.error('Error calculating attendance:', error);
      return 0;
    }
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
    const studentAttendanceRate = attendanceRates[selectedClassroom.id] || 0;

    return (
      <PageLayout>
        <div className="header">
          <Button 
            variant="ghost" 
            className="back-button" 
            onClick={handleBackToClassrooms}
            style={{ color: 'white' }}
          >
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

              <TabsContent value="class-info" style={{ minHeight: '500px' }}>
                <div className="content" style={{ minHeight: '450px' }}>
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

              <TabsContent value="faculty" style={{ minHeight: '500px' }}>
                <div className="content" style={{ minHeight: '450px' }}>
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

              <TabsContent value="attendance-info" style={{ minHeight: '500px' }}>
                <div className="content" style={{ minHeight: '450px' }}>
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
              const studentAttendanceRate = attendanceRates[classroom.id] || 0;
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
