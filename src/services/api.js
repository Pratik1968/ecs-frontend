/**
 * API service for ECS Attendance System
 * Connects to backend API at http://localhost:3000
 */

const API_BASE_URL = 'http://localhost:3000';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
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
 * Get all classroom IDs
 * @returns {Promise<Array>} Array of classroom objects
 */
export const getClasses = async () => {
  return await apiCall('/classrooms/ids');
};

/**
 * Get students for a specific class
 * @param {string} classId - The class ID
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByClass = async (classId) => {
  return await apiCall(`/students/class/${classId}`);
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
 * Get attendance statistics for a class
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Attendance statistics
 */
export const getAttendanceStats = async (classId) => {
  return await apiCall(`/attendance/stats/${classId}`);
};

/**
 * Get complete class information including students and attendance data
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Complete class object with students and attendance
 */
export const getClassDetails = async (classId) => {
  // Get students and attendance data for this class
  const [students, attendanceStats, todayAttendance] = await Promise.all([
    getStudentsByClass(classId),
    getAttendanceStats(classId),
    getTodayAttendance(classId)
  ]);
  
  return {
    id: classId,
    students,
    attendanceStats,
    todayAttendance
  };
};

/**
 * Exam Management API functions
 */

/**
 * Get all exams
 * @returns {Promise<Array>} Array of exam objects
 */
export const getExams = async () => {
  return await apiCall('/exams');
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
  return await apiCall('/exams/upcoming');
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
  return await apiCall('/exams', {
    method: 'POST',
    body: JSON.stringify(examData),
  });
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
  return await apiCall(`/exams/${examId}/seating/bulk`, {
    method: 'POST',
    body: JSON.stringify(assignments),
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

// Export all functions as default object for easier importing
export default {
  login,
  getClasses,
  getStudentsByClass,
  getStudentByRegNo,
  getStudentAttendanceHistory,
  getTodayAttendance,
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
  removeSeatingAssignment
};
