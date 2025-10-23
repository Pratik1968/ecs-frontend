import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const PageLayout = ({ children }) => {
  const isMobile = useIsMobile();
  const { user, logout, userType } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* User Info Header */}
        {user && (
          <div className="user-header">
            <div className="user-info">
              <div className="user-details">
                <span className="user-name">
                  <User size={16} />
                  {user.name}
                </span>
                <span className="user-id">
                  {userType === 'admin' ? 'Admin' : 'Student'} ID: {user.id}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="logout-button"
                size="sm"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        )}
        
        <div className={`container mx-auto px-3 py-4 md:px-6 ${isMobile ? 'max-w-full' : 'max-w-7xl'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;