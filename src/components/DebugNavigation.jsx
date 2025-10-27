import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bug, X, Home, Calendar, Users, GraduationCap, User } from 'lucide-react';

function DebugNavigation({ currentPage, onPageChange, userType, onUserTypeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const allPages = [
    {
      category: 'Admin Pages',
      pages: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: Home, userType: 'admin' },
        { id: 'exam-seating', label: 'Admin Exam Seating', icon: Calendar, userType: 'admin' }
      ]
    },
    {
      category: 'Student Pages', 
      pages: [
        { id: 'dashboard', label: 'Student Dashboard', icon: User, userType: 'student' },
        { id: 'exam-seating', label: 'Student Exam Seating', icon: Calendar, userType: 'student' }
      ]
    },
    {
      category: 'Auth Pages',
      pages: [
        { id: 'login', label: 'Login Page', icon: Users, userType: 'none' }
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
      {/* Debug Button - Fixed position bottom right */}
      <Button
        onClick={toggleDebugPanel}
        className="debug-nav-button"
        variant="outline"
        size="sm"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#f97316',
          color: 'white',
          border: '2px solid #ea580c',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          padding: '0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Bug size={20} />
      </Button>

      {/* Debug Panel Overlay */}
      {isOpen && (
        <div
          className="debug-panel-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <Card
            className="debug-panel-card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bug size={20} />
                  Debug Navigation
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} />
                </Button>
              </div>
              <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
                Current: <strong>
                  {userType === 'none' ? 'Not Authenticated' : 
                   userType === 'admin' ? 'Admin' : 'Student'}
                </strong> viewing <strong>
                  {currentPage === 'login' ? 'Login Page' : currentPage}
                </strong>
              </p>
              <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>
                Click any page below to navigate. User type will switch automatically if needed.
              </p>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {allPages.map((category) => (
                  <div key={category.category}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      marginBottom: '12px',
                      color: '#374151'
                    }}>
                      {category.category}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {category.pages.map((page) => {
                        const Icon = page.icon;
                        const isCurrentPage = (page.id === currentPage && page.userType === userType) || 
                                              (page.id === 'login' && currentPage === 'login');
                        
                        return (
                          <Button
                            key={`${page.userType}-${page.id}`}
                            variant={isCurrentPage ? 'default' : 'outline'}
                            onClick={() => handlePageNavigation(page.id, page.userType)}
                            style={{
                              justifyContent: 'flex-start',
                              gap: '8px',
                              height: '40px',
                              backgroundColor: isCurrentPage ? '#3b82f6' : 'transparent'
                            }}
                          >
                            <Icon size={16} />
                            {page.label}
                            {isCurrentPage && (
                              <span style={{ 
                                marginLeft: 'auto', 
                                fontSize: '12px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                Current
                              </span>
                            )}
                          </Button>
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