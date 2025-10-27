/**
 * API Helper utilities for data transformation and error handling
 */

/**
 * Transform API date format to display format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatApiDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Transform API time format to display format
 * @param {string} timeString - ISO time string
 * @returns {string} Formatted time string
 */
export const formatApiTime = (timeString) => {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, context = 'API call') => {
  console.error(`${context} failed:`, error);
  
  if (error.message.includes('401')) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.message.includes('403')) {
    return 'Access denied. You do not have permission for this action.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Validate required fields for API requests
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid and errors
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Transform attendance data from API format to UI format
 * @param {Array} attendanceData - Raw attendance data from API
 * @returns {Array} Transformed attendance data
 */
export const transformAttendanceData = (attendanceData) => {
  return attendanceData.map(record => ({
    name: record.student?.name || 'Unknown Student',
    regNumber: record.student?.regNo || record.regNo,
    status: record.status || 'absent',
    entryTime: record.time ? formatApiTime(record.time) : '-',
    date: record.date ? formatApiDate(record.date) : new Date().toISOString().split('T')[0]
  }));
};

/**
 * Calculate attendance statistics
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Calculated statistics
 */
export const calculateAttendanceStats = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return {
      totalStudents: 0,
      presentStudents: 0,
      absentStudents: 0,
      attendanceRate: 0
    };
  }
  
  const presentStudents = attendanceRecords.filter(record => record.status === 'present').length;
  const totalStudents = attendanceRecords.length;
  const absentStudents = totalStudents - presentStudents;
  const attendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
  
  return {
    totalStudents,
    presentStudents,
    absentStudents,
    attendanceRate
  };
};

export default {
  formatApiDate,
  formatApiTime,
  handleApiError,
  validateRequiredFields,
  transformAttendanceData,
  calculateAttendanceStats
};