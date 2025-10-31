import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, X, Home, Calendar, Users, User, Settings, Zap, ChevronRight, UserCheck } from 'lucide-react';
import { getAllStudents } from '@/services/api';

function DebugNavigation({ currentPage, onPageChange, userType, onUserTypeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Load students when debug panel opens
  const loadStudents = async () => {
    if (allStudents.length > 0) return; // Already loaded

    setStudentsLoading(true);
    try {
      console.log('Loading students from API...');
      const studentsData = await getAllStudents();
      console.log('Students loaded from API:', studentsData);
      setAllStudents(studentsData);
    } catch (error) {
      console.error('Error loading students from API:', error);
      // Fallback to mock data if API fails (for debugging purposes)
      const fallbackStudents = [
        { regNo: '2024CS001', name: 'John Smith', classID: 'CS101', barcode: 'CS001123456', attendanceRate: 90 },
        { regNo: '2024CS002', name: 'Alice Johnson', classID: 'CS101', barcode: 'CS002123456', attendanceRate: 85.5 },
        { regNo: '2024CS003', name: 'Bob Wilson', classID: 'CS101', barcode: 'CS003123456', attendanceRate: 78.3 },
        { regNo: '2024MA001', name: 'Sarah Wilson', classID: 'MA102', barcode: 'MA001123456', attendanceRate: 95.2 },
        { regNo: '2024MA002', name: 'David Lee', classID: 'MA102', barcode: 'MA002123456', attendanceRate: 89.1 },
        { regNo: '2024PH001', name: 'Tom Anderson', classID: 'PH201', barcode: 'PH001123456', attendanceRate: 82.5 }
      ];
      console.log('Using fallback students for debugging:', fallbackStudents);
      setAllStudents(fallbackStudents);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Restore selected student from localStorage on mount
  useEffect(() => {
    const savedSelectedStudent = localStorage.getItem('debugSelectedStudent');
    if (savedSelectedStudent) {
      setSelectedStudentId(savedSelectedStudent);
    }
  }, []);

  const allPages = [
    {
      category: 'Admin Pages',
      color: '#3b82f6',
      description: 'Administrative functions and management',
      pages: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: Home, userType: 'admin', description: 'Main admin interface' },
        { id: 'students', label: 'Student Management', icon: User, userType: 'admin', description: 'Manage student records and enrollment' },
        { id: 'exam-seating', label: 'Exam Seating Management', icon: Calendar, userType: 'admin', description: 'Manage exam seating arrangements' }
      ]
    },
    {
      category: 'Student Pages',
      color: '#10b981',
      description: 'Student portal and services',
      pages: [
        { id: 'dashboard', label: 'Student Dashboard', icon: User, userType: 'student', description: 'Student main interface' },
        { id: 'exam-seating', label: 'Exam Seating View', icon: Calendar, userType: 'student', description: 'View assigned exam seats' }
      ]
    },
    {
      category: 'Developer Tools',
      color: '#f59e0b',
      description: 'Development and debugging utilities',
      pages: [
        { id: 'api-test', label: 'API Test Panel', icon: Zap, userType: 'admin', description: 'Test backend API endpoints' }
      ]
    },
    {
      category: 'Authentication',
      color: '#6b7280',
      description: 'Login and authentication',
      pages: [
        { id: 'login', label: 'Login Page', icon: Users, userType: 'none', description: 'User authentication portal' }
      ]
    }
  ];

  const handlePageNavigation = (pageId, requiredUserType) => {
    // For student pages, pass the selected student ID
    const studentId = requiredUserType === 'student' ? selectedStudentId : null;
    onPageChange(pageId, requiredUserType, studentId);
    setIsOpen(false);
  };

  const handleStudentSelection = (studentRegNo) => {
    console.log('Student selected for debugging:', studentRegNo);
    setSelectedStudentId(studentRegNo);
    // Persist selection
    if (studentRegNo) {
      localStorage.setItem('debugSelectedStudent', studentRegNo);
    } else {
      localStorage.removeItem('debugSelectedStudent');
    }
  };

  const toggleDebugPanel = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Load students when panel opens
    if (newIsOpen) {
      loadStudents();
    }
  };

  return (
    <>
      {/* Enhanced Debug Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
        }}
      >
        <Button
          onClick={toggleDebugPanel}
          className="debug-nav-button"
          size="lg"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            width: '60px',
            height: '60px',
            padding: '0',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1) rotate(5deg)';
            e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) rotate(0deg)';
            e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
          }}
        >
          <Bug size={24} />
        </Button>

        {/* Tooltip */}
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'translateY(10px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
            pointerEvents: 'none'
          }}
        >
          Debug Navigation
        </div>
      </div>

      {/* Enhanced Debug Panel Overlay */}
      {isOpen && (
        <div
          className="debug-panel-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setIsOpen(false)}
        >
          <Card
            className="debug-panel-card"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              borderRadius: '20px',
              border: 'none',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <CardHeader
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '20px 20px 0 0',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <CardTitle style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '24px',
                    fontWeight: '700'
                  }}>
                    <Bug size={28} />
                    Debug Navigation
                  </CardTitle>
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Badge
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {userType === 'none' ? 'Not Authenticated' :
                        userType === 'admin' ? 'Admin Mode' : 'Student Mode'}
                    </Badge>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>
                      Current: {currentPage === 'login' ? 'Login Page' : currentPage}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    width: '40px',
                    height: '40px',
                    padding: '0'
                  }}
                >
                  <X size={20} />
                </Button>
              </div>
              <p style={{
                fontSize: '14px',
                opacity: 0.9,
                margin: '12px 0 0 0',
                lineHeight: '1.5'
              }}>
                Navigate between different pages and user modes. Authentication will be handled automatically.
              </p>
            </CardHeader>

            {/* Content */}
            <CardContent style={{ padding: '0', maxHeight: 'calc(85vh - 140px)', overflow: 'auto' }}>
              <div style={{ padding: '24px' }}>
                {/* Student Selector for Student Mode */}
                <div style={{
                  marginBottom: '32px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #10b98108, #05966908)',
                  border: '2px solid #10b98120',
                  borderRadius: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#10b98115',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                      }}
                    >
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0'
                      }}>
                        Select Student for Testing
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '2px 0 0 0'
                      }}>
                        Choose a student to simulate their experience in student pages
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                    Debug: {studentsLoading ? 'Loading...' : `${allStudents.length} students loaded`}, userType: {userType}
                  </div>
                  <select
                    value={selectedStudentId || ''}
                    onChange={(e) => {
                      console.log('Student selected:', e.target.value);
                      handleStudentSelection(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      outline: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      color: '#1f2937',
                      minHeight: '48px'
                    }}
                  >
                    <option value="">
                      {studentsLoading ? 'Loading students...' : `Select a student... (${allStudents.length} available)`}
                    </option>
                    {!studentsLoading && allStudents.map((student) => (
                      <option key={student.regNo} value={student.regNo}>
                        {student.name} ({student.regNo}) - {student.classID}
                      </option>
                    ))}
                  </select>

                  {selectedStudentId && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#10b98108',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#065f46'
                    }}>
                      ✓ Selected: {allStudents.find(s => s.regNo === selectedStudentId)?.name} -
                      Student pages will show data for this student
                    </div>
                  )}
                </div>

                {allPages.map((category, categoryIndex) => (
                  <div
                    key={category.category}
                    style={{
                      marginBottom: categoryIndex === allPages.length - 1 ? '0' : '32px'
                    }}
                  >
                    {/* Category Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: `2px solid ${category.color}20`
                    }}>
                      <div
                        style={{
                          width: '4px',
                          height: '24px',
                          background: category.color,
                          borderRadius: '2px'
                        }}
                      />
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0'
                        }}>
                          {category.category}
                        </h3>
                        <p style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          margin: '2px 0 0 0'
                        }}>
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* Pages Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '12px'
                    }}>
                      {category.pages.map((page) => {
                        const Icon = page.icon;
                        const isCurrentPage = (page.id === currentPage && page.userType === userType) ||
                          (page.id === 'login' && currentPage === 'login');
                        const isStudentPageWithoutSelection = page.userType === 'student' && !selectedStudentId;

                        return (
                          <div
                            key={`${page.userType}-${page.id}`}
                            onClick={() => {
                              if (isStudentPageWithoutSelection) {
                                alert('Please select a student first to access student pages');
                                return;
                              }
                              handlePageNavigation(page.id, page.userType);
                            }}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              border: isCurrentPage ? `2px solid ${category.color}` :
                                isStudentPageWithoutSelection ? '2px solid #fca5a5' : '2px solid #e5e7eb',
                              background: isCurrentPage ? `${category.color}08` :
                                isStudentPageWithoutSelection ? '#fef2f2' : 'white',
                              cursor: isStudentPageWithoutSelection ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              opacity: isStudentPageWithoutSelection ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrentPage && !isStudentPageWithoutSelection) {
                                e.target.style.borderColor = category.color;
                                e.target.style.background = `${category.color}04`;
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 8px 25px ${category.color}20`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrentPage && !isStudentPageWithoutSelection) {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.background = 'white';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  background: `${category.color}15`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: category.color
                                }}
                              >
                                <Icon size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: isStudentPageWithoutSelection ? '#6b7280' : '#1f2937',
                                    margin: '0'
                                  }}>
                                    {page.label}
                                  </h4>
                                  {isCurrentPage && (
                                    <Badge
                                      style={{
                                        background: category.color,
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '2px 8px'
                                      }}
                                    >
                                      ACTIVE
                                    </Badge>
                                  )}
                                  {isStudentPageWithoutSelection && (
                                    <Badge
                                      style={{
                                        background: '#fca5a5',
                                        color: '#7f1d1d',
                                        fontSize: '10px',
                                        padding: '2px 8px'
                                      }}
                                    >
                                      SELECT STUDENT
                                    </Badge>
                                  )}
                                </div>
                                <p style={{
                                  fontSize: '13px',
                                  color: '#6b7280',
                                  margin: '4px 0 0 0',
                                  lineHeight: '1.4'
                                }}>
                                  {isStudentPageWithoutSelection
                                    ? 'Select a student above to access this page'
                                    : page.description
                                  }
                                </p>
                              </div>
                              <ChevronRight
                                size={16}
                                style={{
                                  color: '#9ca3af',
                                  opacity: isCurrentPage ? 1 : 0.5
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default DebugNavigation;