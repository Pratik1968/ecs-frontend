
import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, User, Clock, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import './App.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getClasses, getClassDetails } from '@/services/api';

// Mock attendance records (keeping this for now as requested)
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

function App() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('class-info');
  const [selectedDate, setSelectedDate] = useState('2024-01-26');
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

  const getAvailableDates = (classroom) => {
    return Object.keys(classroom.attendanceRecords).sort().reverse();
  };

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <PageLayout>
        <div className="app">
          <div className="dashboard">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
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
      <div className="app">
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
              <TabsTrigger className="nav-tab" value="students">Students</TabsTrigger>
              <TabsTrigger className="nav-tab" value="faculty">Faculty</TabsTrigger>
              <TabsTrigger className="nav-tab" value="attendance-info">Attendance Info</TabsTrigger>
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

            <TabsContent value="students">
              <div className="content">
                <div className="student-list">
                  <h3><Users size={20} /> Student List</h3>
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
                        {selectedClassroom.students.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.regNo}</TableCell>
                            <TableCell>
                              <span style={{ color: getAttendanceColor(student.attendanceRate) }}>
                                {student.attendanceRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                      onClick={() => setSelectedDate(availableDates[0])}
                    >
                      Latest Class
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
      </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
    <div className="app">
      <div className="dashboard">
        <h1>College Attendance Dashboard</h1>
        <p className="dashboard-description">
          Select a classroom to view detailed attendance information
        </p>
        
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
                <p>Floor {classroom.floor} - Room {classroom.room}</p>
                <p className="class-id">Class ID: {classroom.id}</p>
                <p className="students-count">
                  Students: {classroom.presentStudents}/{classroom.totalStudents}
                </p>
                <p className="attendance-rate">
                  Avg Attendance: 
                  <span style={{ color: getAttendanceColor(classroom.avgAttendance) }}>
                    {' '}{classroom.avgAttendance}%
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageLayout>
  );
}

export default App;
