
import React, { useState } from 'react';
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

// Sample data
const classrooms = [
  {
    id: 'CS101',
    name: 'Computer Science A',
    floor: 1,
    room: 101,
    presentStudents: 35,
    totalStudents: 40,
    avgAttendance: 85.5,
    students: [
      { name: 'John Smith', regNumber: '2024CS001', attendanceRate: 90 },
      { name: 'Alice Johnson', regNumber: '2024CS002', attendanceRate: 85.5 },
      { name: 'Bob Wilson', regNumber: '2024CS003', attendanceRate: 78.3 },
      { name: 'Emma Davis', regNumber: '2024CS004', attendanceRate: 92.1 },
      { name: 'Michael Brown', regNumber: '2024CS005', attendanceRate: 88.7 }
    ],
    faculty: {
      name: 'Dr. Alan Turing',
      id: 'FAC001',
      cabinNumber: 'A-15',
      position: 'Professor'
    },
    attendanceRecords: {
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
    }
  },
  {
    id: 'MA102',
    name: 'Mathematics B',
    floor: 1,
    room: 102,
    presentStudents: 32,
    totalStudents: 35,
    avgAttendance: 92.3,
    students: [
      { name: 'Sarah Wilson', regNumber: '2024MA001', attendanceRate: 95.2 },
      { name: 'David Lee', regNumber: '2024MA002', attendanceRate: 89.1 },
      { name: 'Lisa Chen', regNumber: '2024MA003', attendanceRate: 91.8 }
    ],
    faculty: {
      name: 'Dr. Maria Rodriguez',
      id: 'FAC002',
      cabinNumber: 'B-22',
      position: 'Associate Professor'
    },
    attendanceRecords: {
      '2024-01-26': [
        { name: 'Sarah Wilson', regNumber: '2024MA001', status: 'present', entryTime: '10:05' },
        { name: 'David Lee', regNumber: '2024MA002', status: 'present', entryTime: '10:12' },
        { name: 'Lisa Chen', regNumber: '2024MA003', status: 'present', entryTime: '10:08' }
      ]
    }
  },
  {
    id: 'PH201',
    name: 'Physics Lab',
    floor: 2,
    room: 201,
    presentStudents: 28,
    totalStudents: 30,
    avgAttendance: 78.9,
    students: [
      { name: 'Tom Anderson', regNumber: '2024PH001', attendanceRate: 82.5 },
      { name: 'Rachel Green', regNumber: '2024PH002', attendanceRate: 75.2 },
      { name: 'Chris Martin', regNumber: '2024PH003', attendanceRate: 79.8 }
    ],
    faculty: {
      name: 'Dr. Robert Einstein',
      id: 'FAC003',
      cabinNumber: 'C-08',
      position: 'Senior Professor'
    },
    attendanceRecords: {
      '2024-01-26': [
        { name: 'Tom Anderson', regNumber: '2024PH001', status: 'present', entryTime: '14:05' },
        { name: 'Rachel Green', regNumber: '2024PH002', status: 'absent', entryTime: '-' },
        { name: 'Chris Martin', regNumber: '2024PH003', status: 'present', entryTime: '14:12' }
      ]
    }
  },
  {
    id: 'CH202',
    name: 'Chemistry Lab',
    floor: 2,
    room: 202,
    presentStudents: 24,
    totalStudents: 25,
    avgAttendance: 88.7,
    students: [
      { name: 'Alex Turner', regNumber: '2024CH001', attendanceRate: 91.3 },
      { name: 'Sophie White', regNumber: '2024CH002', attendanceRate: 86.7 },
      { name: 'James Black', regNumber: '2024CH003', attendanceRate: 88.2 }
    ],
    faculty: {
      name: 'Dr. Emily Watson',
      id: 'FAC004',
      cabinNumber: 'D-12',
      position: 'Assistant Professor'
    },
    attendanceRecords: {
      '2024-01-26': [
        { name: 'Alex Turner', regNumber: '2024CH001', status: 'present', entryTime: '15:05' },
        { name: 'Sophie White', regNumber: '2024CH002', status: 'present', entryTime: '15:08' },
        { name: 'James Black', regNumber: '2024CH003', status: 'present', entryTime: '15:12' }
      ]
    }
  },
  {
    id: 'EN301',
    name: 'English Literature',
    floor: 3,
    room: 301,
    presentStudents: 42,
    totalStudents: 45,
    avgAttendance: 81.2,
    students: [
      { name: 'Grace Kelly', regNumber: '2024EN001', attendanceRate: 84.5 },
      { name: 'Henry Ford', regNumber: '2024EN002', attendanceRate: 78.9 },
      { name: 'Ivy Johnson', regNumber: '2024EN003', attendanceRate: 82.1 }
    ],
    faculty: {
      name: 'Dr. William Shakespeare',
      id: 'FAC005',
      cabinNumber: 'E-05',
      position: 'Professor'
    },
    attendanceRecords: {
      '2024-01-26': [
        { name: 'Grace Kelly', regNumber: '2024EN001', status: 'present', entryTime: '11:05' },
        { name: 'Henry Ford', regNumber: '2024EN002', status: 'absent', entryTime: '-' },
        { name: 'Ivy Johnson', regNumber: '2024EN003', status: 'present', entryTime: '11:12' }
      ]
    }
  },
  {
    id: 'HI302',
    name: 'History Seminar',
    floor: 3,
    room: 302,
    presentStudents: 18,
    totalStudents: 20,
    avgAttendance: 94.1,
    students: [
      { name: 'Kate Winslet', regNumber: '2024HI001', attendanceRate: 96.8 },
      { name: 'Leo DiCaprio', regNumber: '2024HI002', attendanceRate: 91.4 },
      { name: 'Meryl Streep', regNumber: '2024HI003', attendanceRate: 94.2 }
    ],
    faculty: {
      name: 'Dr. Elizabeth Tudor',
      id: 'FAC006',
      cabinNumber: 'F-18',
      position: 'Professor'
    },
    attendanceRecords: {
      '2024-01-26': [
        { name: 'Kate Winslet', regNumber: '2024HI001', status: 'present', entryTime: '13:05' },
        { name: 'Leo DiCaprio', regNumber: '2024HI002', status: 'present', entryTime: '13:08' },
        { name: 'Meryl Streep', regNumber: '2024HI003', status: 'present', entryTime: '13:12' }
      ]
    }
  }
];

function App() {
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('class-info');
  const [selectedDate, setSelectedDate] = useState('2024-01-26');

  const handleClassroomClick = (classroom) => {
    setSelectedClassroom(classroom);
    setActiveTab('class-info');
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
                            <TableCell>{student.regNumber}</TableCell>
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
                <GraduationCap size={24} className="class-icon" />
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
