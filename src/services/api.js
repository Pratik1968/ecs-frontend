/**
 * Mock API service to simulate Supabase database calls
 * This will be replaced with actual Supabase API calls when the database is ready
 */

// Import mock data
import classesData from '../mock-data/classes.json';
import studentsData from '../mock-data/students.json';
import facultyData from '../mock-data/faculty.json';

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulate API error (for testing error handling)
 */
const simulateError = () => Math.random() < 0.05; // 5% chance of error

/**
 * Get all classes
 * @returns {Promise<Array>} Array of class objects
 */
export const getClasses = async () => {
  await delay(300);
  
  if (simulateError()) {
    throw new Error('Failed to fetch classes');
  }
  
  return classesData;
};

/**
 * Get students for a specific class
 * @param {string} classId - The class ID
 * @returns {Promise<Array>} Array of student objects
 */
export const getStudentsByClass = async (classId) => {
  await delay(400);
  
  if (simulateError()) {
    throw new Error(`Failed to fetch students for class ${classId}`);
  }
  
  const students = studentsData[classId] || [];
  return students;
};

/**
 * Get faculty information by faculty ID
 * @param {string} facultyId - The faculty ID
 * @returns {Promise<Object>} Faculty object
 */
export const getFacultyById = async (facultyId) => {
  await delay(200);
  
  if (simulateError()) {
    throw new Error(`Failed to fetch faculty ${facultyId}`);
  }
  
  const faculty = facultyData[facultyId];
  if (!faculty) {
    throw new Error(`Faculty with ID ${facultyId} not found`);
  }
  
  return faculty;
};

/**
 * Get complete class information including students and faculty
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Complete class object with students and faculty
 */
export const getClassDetails = async (classId) => {
  await delay(600);
  
  if (simulateError()) {
    throw new Error(`Failed to fetch class details for ${classId}`);
  }
  
  // Find the class
  const classInfo = classesData.find(cls => cls.id === classId);
  if (!classInfo) {
    throw new Error(`Class with ID ${classId} not found`);
  }
  
  // Get students and faculty for this class
  const [students, faculty] = await Promise.all([
    getStudentsByClass(classId),
    getFacultyById(classInfo.facultyId)
  ]);
  
  return {
    ...classInfo,
    students,
    faculty
  };
};

/**
 * Get student by registration number
 * @param {string} regNo - Student registration number
 * @returns {Promise<Object>} Student object
 */
export const getStudentByRegNo = async (regNo) => {
  await delay(300);
  
  if (simulateError()) {
    throw new Error(`Failed to fetch student ${regNo}`);
  }
  
  // Search through all students
  for (const classId in studentsData) {
    const student = studentsData[classId].find(s => s.regNo === regNo);
    if (student) {
      return student;
    }
  }
  
  throw new Error(`Student with registration number ${regNo} not found`);
};

/**
 * Get student by barcode
 * @param {string} barcode - Student barcode
 * @returns {Promise<Object>} Student object
 */
export const getStudentByBarcode = async (barcode) => {
  await delay(300);
  
  if (simulateError()) {
    throw new Error(`Failed to fetch student with barcode ${barcode}`);
  }
  
  // Search through all students
  for (const classId in studentsData) {
    const student = studentsData[classId].find(s => s.barcode === barcode);
    if (student) {
      return student;
    }
  }
  
  throw new Error(`Student with barcode ${barcode} not found`);
};

// Export all functions as default object for easier importing
export default {
  getClasses,
  getStudentsByClass,
  getFacultyById,
  getClassDetails,
  getStudentByRegNo,
  getStudentByBarcode
};
