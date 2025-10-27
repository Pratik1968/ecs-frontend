/**
 * API service for ECS Attendance System
 * Connects to backend API at http://localhost:3000
 */

const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.accessToken;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Authentication
 */
export const login = async (username, password) => {
  return await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    }),
  });
};

/**
 * Register new admin
 * @param {Object} adminData - Admin registration data
 * @returns {Promise<Object>} Registration result
 */
export const registerAdmin = async (adminData) => {
  return await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: adminData.username,
      password: adminData.password,
      email: adminData.email,
      fullName: adminData.fullName
    }),
  });
};

/**
 * Get all classroom IDs
 * @returns {Promise<Array>} Array of classroom objects with id field
 */
export const getClasses = async () => {
  const response = await apiCall('/classrooms/ids');
  // Transform response to match expected format
  return response.map(classroom => ({
    id: classroom.id,
    name: `Class ${classroom.id}`,
    floor: Math.floor(Math.random() * 3) + 1, // Mock data for now
    room: `R${Math.floor(Math.random() * 100) + 1}`, // Mock data for now
    totalStudents: 0, // Will be updated when we get students
    presentStudents: 0, // Will be updated from attendance
    avgAttendance: 0 // Will be calculated from stats
  }));
};

/**
 * Get students for a specific class
 * @param {string} classId - The class ID
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByClass = async (classId) => {
  const students = await apiCall(`/students/class/${classId}`);
  // Transform to match expected format
  return students.map(student => ({
    name: student.name,
    regNo: student.regNo,
    attendanceRate: 85 // Mock data - will be calculated from actual attendance
  }));
};

/**
 * Get student by registration number
 * @param {string} regNo - Student registration number
 * @returns {Promise<Object>} Student object
 */
export const getStudentByRegNo = async (regNo) => {
  return await apiCall(`/students/${regNo}`);
};

/**
 * Create new student (Admin only)
 * @param {Object} studentData - Student data
 * @returns {Promise<Object>} Created student object
 */
export const createStudent = async (studentData) => {
  return await apiCall('/students', {
    method: 'POST',
    body: JSON.stringify({
      regNo: studentData.regNo,
      name: studentData.name,
      classID: studentData.classID,
      barcode: studentData.barcode
    }),
  });
};

/**
 * Update student (Admin only)
 * @param {string} regNo - Student registration number
 * @param {Object} studentData - Updated student data
 * @returns {Promise<Object>} Updated student object
 */
export const updateStudent = async (regNo, studentData) => {
  return await apiCall(`/students/${regNo}`, {
    method: 'PATCH',
    body: JSON.stringify(studentData),
  });
};

/**
 * Delete student (Admin only)
 * @param {string} regNo - Student registration number
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteStudent = async (regNo) => {
  return await apiCall(`/students/${regNo}`, {
    method: 'DELETE',
  });
};

/**
 * Get all students (Admin only)
 * @returns {Promise<Array>} Array of all student objects
 */
export const getAllStudents = async () => {
  return await apiCall('/students');
};

/**
 * Get student attendance history
 * @param {string} regNo - Student registration number
 * @returns {Promise<Array>} Array of attendance records
 */
export const getStudentAttendanceHistory = async (regNo) => {
  return await apiCall(`/attendance/student/${regNo}`);
};

/**
 * Get today's attendance for a class
 * @param {string} classId - The class ID
 * @returns {Promise<Array>} Array of attendance records
 */
export const getTodayAttendance = async (classId) => {
  return await apiCall(`/attendance/today/${classId}`);
};

/**
 * Scan barcode for attendance (no JWT required)
 * @param {string} barcode - Student barcode
 * @param {string} time - Scan time (ISO string)
 * @returns {Promise<Object>} Scan result
 */
export const scanBarcodeForAttendance = async (barcode, time) => {
  return await apiCall('/attendance/scan', {
    method: 'POST',
    body: JSON.stringify({
      barcode,
      time
    }),
  });
};

/**
 * Get attendance by date and class
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} classId - The class ID
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAttendanceByDate = async (date, classId) => {
  return await apiCall(`/attendance/date/${date}/${classId}`);
};

/**
 * Get attendance statistics for a class
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Attendance statistics
 */
export const getAttendanceStats = async (classId) => {
  const stats = await apiCall(`/attendance/stats/${classId}`);
  return {
    totalStudents: stats.totalStudents,
    presentStudents: stats.presentStudents,
    absentStudents: stats.absentStudents,
    avgAttendance: Math.round(stats.attendanceRate),
    attendances: stats.attendances || []
  };
};

/**
 * Get complete class information including students and attendance data
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Complete class object with students and attendance
 */
export const getClassDetails = async (classId) => {
  try {
    // Get students and attendance data for this class
    const [students, attendanceStats, todayAttendance] = await Promise.all([
      getStudentsByClass(classId),
      getAttendanceStats(classId),
      getTodayAttendance(classId)
    ]);

    return {
      id: classId,
      name: `Class ${classId}`,
      floor: Math.floor(Math.random() * 3) + 1, // Mock data
      room: `R${Math.floor(Math.random() * 100) + 1}`, // Mock data
      totalStudents: attendanceStats.totalStudents,
      presentStudents: attendanceStats.presentStudents,
      avgAttendance: attendanceStats.avgAttendance,
      students,
      faculty: {
        name: 'Dr. Faculty Member', // Mock data
        id: 'FAC001',
        cabinNumber: 'C101',
        position: 'Professor'
      }
    };
  } catch (error) {
    console.error(`Error getting class details for ${classId}:`, error);
    // Return mock data if API fails
    return {
      id: classId,
      name: `Class ${classId}`,
      floor: 1,
      room: 'R101',
      totalStudents: 0,
      presentStudents: 0,
      avgAttendance: 0,
      students: [],
      faculty: {
        name: 'Dr. Faculty Member',
        id: 'FAC001',
        cabinNumber: 'C101',
        position: 'Professor'
      }
    };
  }
};

/**
 * Exam Management API functions
 */

/**
 * Get all exams
 * @returns {Promise<Array>} Array of exam objects
 */
export const getExams = async () => {
  const exams = await apiCall('/exams');
  return exams.map(exam => ({
    id: exam.id,
    name: exam.exam_name,
    subject: exam.subject,
    date: exam.exam_date,
    duration: exam.duration,
    classId: exam.classID,
    description: exam.description,
    status: new Date(exam.exam_date) > new Date() ? 'upcoming' : 'completed'
  }));
};

/**
 * Get exam by ID
 * @param {string} examId - The exam ID
 * @returns {Promise<Object>} Exam object
 */
export const getExamById = async (examId) => {
  return await apiCall(`/exams/${examId}`);
};

/**
 * Get upcoming exams (Admin only)
 * @returns {Promise<Array>} Array of upcoming exam objects
 */
export const getUpcomingExams = async () => {
  const exams = await apiCall('/exams/upcoming');
  return exams.map(exam => ({
    id: exam.id,
    name: exam.exam_name,
    subject: exam.subject,
    date: exam.exam_date,
    duration: exam.duration,
    classId: exam.classID,
    description: exam.description,
    status: 'upcoming'
  }));
};

/**
 * Get seating arrangement for an exam
 * @param {string} examId - The exam ID
 * @returns {Promise<Object>} Seating arrangement object
 */
export const getExamSeating = async (examId) => {
  return await apiCall(`/exams/${examId}/seating`);
};

/**
 * Create new exam
 * @param {Object} examData - Exam data
 * @returns {Promise<Object>} Created exam object
 */
export const createExam = async (examData) => {
  const requestBody = {
    exam_name: examData.name,
    subject: examData.subject,
    exam_date: examData.date,
    duration: examData.duration,
    classID: examData.classId,
    description: examData.description
  };

  const exam = await apiCall('/exams', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return {
    id: exam.id,
    name: exam.exam_name,
    subject: exam.subject,
    date: exam.exam_date,
    duration: exam.duration,
    classId: exam.classID,
    description: exam.description
  };
};

/**
 * Update exam
 * @param {string} examId - The exam ID
 * @param {Object} examData - Updated exam data
 * @returns {Promise<Object>} Updated exam object
 */
export const updateExam = async (examId, examData) => {
  return await apiCall(`/exams/${examId}`, {
    method: 'PATCH',
    body: JSON.stringify(examData),
  });
};

/**
 * Delete exam
 * @param {string} examId - The exam ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteExam = async (examId) => {
  return await apiCall(`/exams/${examId}`, {
    method: 'DELETE',
  });
};

/**
 * Assign seating for an exam
 * @param {string} examId - The exam ID
 * @param {Object} seatingData - Seating assignment data
 * @returns {Promise<Object>} Seating assignment result
 */
export const assignSeating = async (examId, seatingData) => {
  return await apiCall(`/exams/${examId}/seating`, {
    method: 'POST',
    body: JSON.stringify(seatingData),
  });
};

/**
 * Bulk assign students to seats for exam (Admin only)
 * @param {string} examId - The exam ID
 * @param {Array} assignments - Array of seating assignments
 * @returns {Promise<Object>} Bulk assignment result
 */
export const bulkAssignSeating = async (examId, assignments) => {
  const requestBody = {
    assignments: assignments.map(assignment => ({
      regNo: assignment.regNo,
      seatNo: assignment.seatNo
    }))
  };

  return await apiCall(`/exams/${examId}/seating/bulk`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
};

/**
 * Remove seating assignment for student (Admin only)
 * @param {string} examId - The exam ID
 * @param {string} regNo - Student registration number
 * @returns {Promise<Object>} Removal confirmation
 */
export const removeSeatingAssignment = async (examId, regNo) => {
  return await apiCall(`/exams/${examId}/seating/${regNo}`, {
    method: 'DELETE',
  });
};

/**
 * Temperature and Sensor APIs
 */

/**
 * Record temperature reading (no JWT required)
 * @param {Object} tempData - Temperature data
 * @returns {Promise<Object>} Temperature log object
 */
export const recordTemperature = async (tempData) => {
  return await apiCall('/sensors/temperature', {
    method: 'POST',
    body: JSON.stringify({
      sensorID: tempData.sensorID,
      classID: tempData.classID,
      temp: tempData.temp,
      additionalData: tempData.additionalData
    }),
  });
};

/**
 * Get current temperature for classroom
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Current temperature log
 */
export const getCurrentTemperature = async (classId) => {
  return await apiCall(`/sensors/temperature/current/${classId}`);
};

/**
 * Get temperature history for classroom
 * @param {string} classId - The class ID
 * @param {string} startDate - Start date (optional)
 * @param {string} endDate - End date (optional)
 * @returns {Promise<Array>} Array of temperature logs
 */
export const getTemperatureHistory = async (classId, startDate, endDate) => {
  let url = `/sensors/temperature/history/${classId}`;
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (params.toString()) url += `?${params.toString()}`;

  return await apiCall(url);
};

/**
 * Manual cooling control (Admin only)
 * @param {string} classId - The class ID
 * @param {boolean} coolingOn - Cooling system state
 * @returns {Promise<Object>} Classroom object
 */
export const controlCooling = async (classId, coolingOn) => {
  return await apiCall('/sensors/cooling/control', {
    method: 'POST',
    body: JSON.stringify({
      classID: classId,
      cooling_on: coolingOn
    }),
  });
};

/**
 * Get cooling status for classroom
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Cooling status
 */
export const getCoolingStatus = async (classId) => {
  return await apiCall(`/sensors/cooling/status/${classId}`);
};

// Export all functions as default object for easier importing
export default {
  login,
  registerAdmin,
  getClasses,
  getStudentsByClass,
  getStudentByRegNo,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllStudents,
  getStudentAttendanceHistory,
  getTodayAttendance,
  scanBarcodeForAttendance,
  getAttendanceByDate,
  getAttendanceStats,
  getClassDetails,
  getExams,
  getExamById,
  getUpcomingExams,
  getExamSeating,
  createExam,
  updateExam,
  deleteExam,
  assignSeating,
  bulkAssignSeating,
  removeSeatingAssignment,
  recordTemperature,
  getCurrentTemperature,
  getTemperatureHistory,
  controlCooling,
  getCoolingStatus
};
