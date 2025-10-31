
import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, User, Clock, ArrowLeft, Calendar as CalendarIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import './App.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import MainNavigation from '@/components/layout/MainNavigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getClasses, getClassDetails, getTodayAttendance } from '@/services/api';
import StudentDashboard from '@/components/StudentDashboard';
import ExamSeatingArrangement from '@/components/ExamSeatingArrangement';
import AdminExamSeating from '@/components/AdminExamSeating';
import LoginPage from '@/components/LoginPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import DebugNavigation from '@/components/DebugNavigation';
import ApiTestPanel from '@/components/ApiTestPanel';
import StudentManagement from '@/components/StudentManagement';

// Import attendance API functions
import { getAttendanceByDate, getClassDays } from '@/services/api';

// Admin Dashboard Component
function AdminDashboard({ navigateWithParams }) {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('class-info');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load classrooms on component mount
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setLoading(true);
        const classesData = await getClasses();
        setClassrooms(classesData);
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
      
      console.log(`Loading attendance for class ${classroom.id}`);
      
      // Get all class days (days when any student marked attendance)
      const classDays = await getClassDays(classroom.id);
      console.log(`Class days for ${classroom.id}:`, classDays);
      
      // Load attendance records for each class day
      const attendanceRecords = {};
      
      for (const classDay of classDays) {
        try {
          const dayAttendance = await getAttendanceByDate(classDay, classroom.id);
          console.log(`Attendance for ${classDay}:`, dayAttendance);
          
          if (dayAttendance && dayAttendance.length > 0) {
            // Get all students in the class to show who was absent
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
            
            const presentStudents = new Set(Object.keys(uniqueAttendance));
            
            // Create attendance records for all students
            const dayRecords = [];
            
            // Add present students (using unique attendance records)
            Object.values(uniqueAttendance).forEach(record => {
              const regNo = record.regNo || record.regNumber;
              dayRecords.push({
                name: studentNameMap[regNo] || record.studentName || record.name || 'Unknown Student',
                regNumber: regNo,
                status: 'present',
                entryTime: record.arrival_time ? 
                  new Date(record.arrival_time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  }) : '-'
              });
            });
            
            // Add absent students (students in class but not in attendance records)
            allStudents.forEach(student => {
              if (!presentStudents.has(student.regNo)) {
                dayRecords.push({
                  name: student.name,
                  regNumber: student.regNo,
                  status: 'absent',
                  entryTime: '-'
                });
              }
            });
            
            attendanceRecords[classDay] = dayRecords;
          }
        } catch (attendanceError) {
          console.log(`No attendance data for ${classDay}:`, attendanceError);
        }
      }
      
      console.log('Final attendance records:', attendanceRecords);
      
      const classroomWithAttendance = {
        ...classDetails,
        attendanceRecords,
        classDays // Add class days for reference
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

  const getAvailableDates = (classroom) => {
    // Use class days if available, otherwise fall back to attendance records
    if (classroom.classDays && classroom.classDays.length > 0) {
      return classroom.classDays.sort().reverse();
    }
    return Object.keys(classroom.attendanceRecords).sort().reverse();
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
    const availableDates = getAvailableDates(selectedClassroom);
    const availableDatesSet = new Set(availableDates);
    const formatToISO = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const currentAttendance = selectedClassroom.attendanceRecords[selectedDate] || [];

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
              <TabsTrigger className="nav-tab" value="students">Students</TabsTrigger>
              <TabsTrigger className="nav-tab" value="faculty">Faculty</TabsTrigger>
              <TabsTrigger className="nav-tab" value="attendance-info">Attendance Info</TabsTrigger>
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
                          <span className="label">Capacity:</span>
                          <span className="value">{selectedClassroom.totalStudents}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="attendance-stats">
                      <CardHeader>
                        <CardTitle>Attendance Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="attendance-rate">
                          <span className="rate-number" style={{ color: getAttendanceColor(selectedClassroom.avgAttendance) }}>
                            {selectedClassroom.avgAttendance}%
                          </span>
                          <span className="rate-label">Average Attendance Rate</span>
                          <div className="attendance-details">
                            <div>Present Students: {selectedClassroom.presentStudents}</div>
                            <div>Total Capacity: {selectedClassroom.totalStudents}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students" style={{ minHeight: '500px' }}>
              <div className="content" style={{ minHeight: '450px' }}>
                <div className="student-list">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0' }}>
                      <Users size={20} /> Student List ({selectedClassroom.students.length})
                    </h3>
                    <Button
                      onClick={() => {
                        // Navigate to student management with this class pre-selected
                        navigateWithParams('students', { 
                          selectedClass: selectedClassroom.id,
                          classContext: selectedClassroom.name 
                        });
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <User size={16} />
                      Add Student
                    </Button>
                  </div>
                  <div className="table-container">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Registration Number</TableHead>
                          <TableHead>Attendance Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClassroom.students.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                              <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                              <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>No students enrolled</p>
                              <p style={{ margin: '0', fontSize: '14px' }}>Use the "Add Student" button to enroll students in this class</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedClassroom.students.map((student, index) => (
                            <TableRow key={index}>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.regNo}</TableCell>
                              <TableCell>
                                <span style={{ color: getAttendanceColor(student.attendanceRate) }}>
                                  {student.attendanceRate}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
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
                  <h3><Clock size={20} /> Attendance Information</h3>
                  <p className="attendance-description">View attendance records for specific class dates</p>
                  
                  <div className="date-selection">
                    <label>Select Date:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="date-input-container">
                          <CalendarIcon size={16} />
                          {formatDate(selectedDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 calendar-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(`${selectedDate}T00:00:00`)}
                          month={new Date(`${selectedDate}T00:00:00`)}
                          onSelect={(day) => {
                            if (!day) return;
                            const iso = formatToISO(day);
                            if (availableDatesSet.has(iso)) {
                              setSelectedDate(iso);
                            }
                          }}
                          disabled={(day) => !availableDatesSet.has(formatToISO(day))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button 
                      className="latest-class-btn"
                      onClick={() => {
                        if (availableDates.length > 0) {
                          setSelectedDate(availableDates[0]);
                        } else {
                          // If no attendance data, set to today's date
                          const today = new Date();
                          setSelectedDate(today.toISOString().split('T')[0]);
                        }
                      }}
                    >
                      Latest Class ({availableDates.length > 0 ? availableDates.length : 0} days available)
                    </Button>
                  </div>

                  <h4>Attendance for {formatDate(selectedDate)}</h4>
                  
                  <div className="table-container">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Registration Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Entry Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAttendance.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>{record.regNumber}</TableCell>
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
            <h1>Admin Dashboard</h1>
            <p className="dashboard-description">
              Select a classroom to view detailed attendance information
            </p>
          </div>
        </div>
        
        <div className="classrooms-grid">
          {classrooms.map((classroom) => (
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
                <p className="classroom-location">Floor {classroom.floor} - Room {classroom.room}</p>
                <p className="class-id">Class ID: {classroom.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

// Main App Component with Authentication
function App({ currentPage, setCurrentPage, pageParams, navigateWithParams }) {
  const { isAuthenticated, userType, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="app">
        <div className="dashboard">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Loading...</h2>
            <p>Please wait while we check your authentication</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentPage = () => {
    if (userType === 'student') {
      switch (currentPage) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'exam-seating':
          return <ExamSeatingArrangement />;
        default:
          return <StudentDashboard />;
      }
    } else {
      // Admin user
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard navigateWithParams={navigateWithParams} />;
        case 'students':
          return <StudentManagement 
            pageParams={pageParams} 
            onNavigateBack={() => setCurrentPage('dashboard')}
          />;
        case 'exam-seating':
          return <AdminExamSeating />;
        case 'api-test':
          return <ApiTestPanel />;
        default:
          return <AdminDashboard />;
      }
    }
  };

  return (
    <div className="app">
      <MainNavigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        userType={userType}
      />
      {renderCurrentPage()}
    </div>
  );
}

// App with Auth Provider
function AppWithAuth() {
  return (
    <AuthProvider>
      <AppWithDebug />
    </AuthProvider>
  );
}

// Wrapper component to provide debug navigation at all times
function AppWithDebug() {
  const { isAuthenticated, userType, isLoading, switchUserType, logout, login, selectStudent, selectedStudent } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});

  const handlePageNavigation = async (pageId, requiredUserType, selectedStudentId = null) => {
    console.log('Debug Navigation:', { pageId, requiredUserType, selectedStudentId, isAuthenticated, userType });
    
    if (requiredUserType === 'none') {
      // For login page, trigger logout
      if (pageId === 'login') {
        console.log('Logging out...');
        logout();
        return;
      }
    }
    
    // Handle student mode authentication only when navigating to student pages
    if (requiredUserType === 'student') {
      if (!selectedStudentId) {
        console.log('No student selected for student mode');
        alert('Please select a student first to access student pages');
        return;
      }

      // Only authenticate when actually navigating to a student page
      try {
        const { getAllStudents } = await import('@/services/api');
        const studentsData = await getAllStudents();
        const selectedStudentData = studentsData.find(s => s.regNo === selectedStudentId);
        
        if (selectedStudentData) {
          console.log('Authenticating as student:', selectedStudentData);
          
          // Create and authenticate the student user
          const studentUser = {
            id: selectedStudentData.regNo,
            name: selectedStudentData.name,
            email: `${selectedStudentData.regNo.toLowerCase()}@student.edu`,
            regNumber: selectedStudentData.regNo,
            classID: selectedStudentData.classID,
            barcode: selectedStudentData.barcode,
            attendanceRate: selectedStudentData.attendanceRate
          };
          
          // Switch to student mode and authenticate
          switchUserType('student');
          selectStudent(selectedStudentData);
          login(studentUser, 'student');
        } else {
          console.error('Student not found:', selectedStudentId);
          alert('Selected student not found. Please select a different student.');
          return;
        }
      } catch (error) {
        console.error('Error loading student data:', error);
        alert('Error loading student data. Please try again.');
        return;
      }
    }
    
    // If not authenticated and trying to access admin/student pages, auto-authenticate
    if (!isAuthenticated && (requiredUserType === 'admin' || requiredUserType === 'student')) {
      console.log('Auto-authenticating as:', requiredUserType);
      
      if (requiredUserType === 'admin') {
        const mockUser = {
          id: 'admin001',
          name: 'Debug Admin',
          email: 'admin@debug.com'
        };
        login(mockUser, requiredUserType);
      }
      // Student authentication is handled above in the student selection section
    }
    
    // Switch user type if needed (for already authenticated users)
    if (isAuthenticated && requiredUserType !== userType && requiredUserType !== 'none') {
      console.log('Switching user type from', userType, 'to', requiredUserType);
      switchUserType(requiredUserType);
    }
    
    // Navigate to page
    console.log('Navigating to page:', pageId);
    setCurrentPage(pageId);
    setPageParams({}); // Clear params when navigating normally
  };

  // Function to navigate with parameters
  const navigateWithParams = (pageId, params = {}) => {
    setCurrentPage(pageId);
    setPageParams(params);
  };

  return (
    <>
      <App 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        pageParams={pageParams}
        navigateWithParams={navigateWithParams}
      />
      <DebugNavigation
        currentPage={isAuthenticated ? currentPage : 'login'}
        onPageChange={handlePageNavigation}
        userType={isAuthenticated ? userType : 'none'}
        onUserTypeChange={switchUserType}
      />
    </>
  );
}

export default AppWithAuth;
