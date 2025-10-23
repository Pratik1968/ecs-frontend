/**
 * API service backed by the configured backend URL
 */

const BASE_URL = (import.meta?.env?.VITE_BACKEND_URL || '').replace(/\/+$/,'');

const assertBaseUrl = () => {
  if (!BASE_URL) {
    throw new Error('Backend URL is not configured. Set VITE_BACKEND_URL in .env.local');
  }
};

const fetchJson = async (path, notFoundMessage) => {
  assertBaseUrl();
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  let res;
  try {
    res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  } catch (e) {
    throw new Error(`Network error while calling ${url}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const detail = text || res.statusText;
    throw new Error(`Request failed (${res.status}) for ${url}: ${detail}`);
  }
  const data = await res.json().catch(() => null);
  if (data == null) {
    throw new Error(notFoundMessage || `Empty response from ${url}`);
  }
  return data;
};

/**
 * Get classrooms (IDs)
 * Returns an array of classroom objects compatible with the dashboard
 */
export const getClassrooms = async () => {
  const ids = await fetchJson('/classrooms/ids', 'Could not retrieve classroom IDs');
  // Normalize into the shape used by the dashboard with sensible defaults
  return (Array.isArray(ids) ? ids : []).map((id) => ({
    id,
    name: id,
    floor: '-',
    room: '-',
    totalStudents: 0,
    presentStudents: 0,
    avgAttendance: 0
  }));
};

/**
 * Backwards-compatible alias for legacy code
 */
export const getClasses = getClassrooms;

/**
 * Get students for a specific class
 */
export const getStudentsByClass = async (classId) => {
  if (!classId) throw new Error('Class ID is required');
  const students = await fetchJson(`/students/class/${encodeURIComponent(classId)}`, `Students not found for class ${classId}`);
  return Array.isArray(students) ? students : [];
};

/**
 * Attendance for today for a class
 */
export const getAttendanceToday = async (classId) => {
  if (!classId) throw new Error('Class ID is required');
  const data = await fetchJson(`/attendance/today/${encodeURIComponent(classId)}`, `Today's attendance not found for class ${classId}`);
  return Array.isArray(data) ? data : [];
};

/**
 * Attendance for specific date (YYYY-MM-DD) for a class
 */
export const getAttendanceByDate = async (date, classId) => {
  if (!date) throw new Error('Date is required');
  if (!classId) throw new Error('Class ID is required');
  const data = await fetchJson(`/attendance/date/${encodeURIComponent(date)}/${encodeURIComponent(classId)}`, `Attendance not found for ${date} and class ${classId}`);
  return Array.isArray(data) ? data : [];
};

/**
 * Compose minimal class details using available endpoints.
 * Includes students and a rudimentary attendanceRecords with today's date if available.
 */
export const getClassDetails = async (classId) => {
  if (!classId) throw new Error('Class ID is required');
  const [students, todayAttendance] = await Promise.all([
    getStudentsByClass(classId).catch((e) => {
      // Bubble up with clear context
      throw new Error(`Failed to fetch students for ${classId}: ${e.message}`);
    }),
    getAttendanceToday(classId).catch(() => [])
  ]);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const iso = `${yyyy}-${mm}-${dd}`;

  const attendanceRecords = todayAttendance.length > 0 ? { [iso]: todayAttendance } : {};

  return {
    id: classId,
    name: classId,
    floor: '-',
    room: '-',
    totalStudents: students.length || 0,
    presentStudents: Array.isArray(todayAttendance) ? todayAttendance.filter(r => String(r.status).toLowerCase() === 'present').length : 0,
    avgAttendance: 0,
    students,
    faculty: { name: 'N/A', id: '-', cabinNumber: '-', position: '-' },
    attendanceRecords
  };
};

export default {
  getClassrooms,
  getClasses,
  getStudentsByClass,
  getAttendanceToday,
  getAttendanceByDate,
  getClassDetails
};
