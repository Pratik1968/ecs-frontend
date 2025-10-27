import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, X, Home, Calendar, Users, User, Settings, Zap, ChevronRight } from 'lucide-react';

function DebugNavigation({ currentPage, onPageChange, userType, onUserTypeChange }) {
  const [isOpen, setIsOpen] = useState(false);

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
    // Handle page navigation
    onPageChange(pageId, requiredUserType);
    setIsOpen(false);
  };

  const toggleDebugPanel = () => {
    setIsOpen(!isOpen);
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
                        
                        return (
                          <div
                            key={`${page.userType}-${page.id}`}
                            onClick={() => handlePageNavigation(page.id, page.userType)}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              border: isCurrentPage ? `2px solid ${category.color}` : '2px solid #e5e7eb',
                              background: isCurrentPage ? `${category.color}08` : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrentPage) {
                                e.target.style.borderColor = category.color;
                                e.target.style.background = `${category.color}04`;
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 8px 25px ${category.color}20`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrentPage) {
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
                                    color: '#1f2937',
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
                                </div>
                                <p style={{
                                  fontSize: '13px',
                                  color: '#6b7280',
                                  margin: '4px 0 0 0',
                                  lineHeight: '1.4'
                                }}>
                                  {page.description}
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