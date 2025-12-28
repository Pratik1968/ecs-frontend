import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('admin'); // 'admin' or 'student'
  const [selectedStudent, setSelectedStudent] = useState(null); // For debug mode student selection
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    const savedSelectedStudent = localStorage.getItem('selectedStudent');
    
    if (savedUser && savedUserType) {
      try {
        setUser(JSON.parse(savedUser));
        setUserType(savedUserType);
        if (savedSelectedStudent) {
          setSelectedStudent(JSON.parse(savedSelectedStudent));
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('selectedStudent');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  };

  const logout = () => {
    setUser(null);
    setUserType('admin');
    setSelectedStudent(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('selectedStudent');
  };

  const switchUserType = (type) => {
    setUserType(type);
    localStorage.setItem('userType', type);
    
    // If switching to student mode and no student is selected, clear user
    if (type === 'student' && !selectedStudent) {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const selectStudent = (studentData) => {
    setSelectedStudent(studentData);
    localStorage.setItem('selectedStudent', JSON.stringify(studentData));
  };

  const value = {
    user,
    userType,
    selectedStudent,
    isAuthenticated: !!user,
    login,
    logout,
    switchUserType,
    selectStudent,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
