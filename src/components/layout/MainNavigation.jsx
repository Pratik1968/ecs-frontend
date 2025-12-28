import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Calendar, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function MainNavigation({ currentPage, onPageChange, userType }) {
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      availableFor: ['admin', 'student']
    },
    {
      id: 'students',
      label: 'Student Management',
      icon: User,
      availableFor: ['admin']
    },
    {
      id: 'exam-seating',
      label: userType === 'admin' ? 'Exam Management' : 'Exam Seating',
      icon: Calendar,
      availableFor: ['admin', 'student']
    }
  ];

  const filteredItems = navigationItems.filter(item =>
    item.availableFor.includes(userType)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Left side - Logo and Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Logo/Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Home size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '700',
              margin: '0',
              lineHeight: '1'
            }}>
              ECS System
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              margin: '2px 0 0 0'
            }}>
              Attendance Management
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onPageChange(item.id)}
                style={{
                  color: isActive ? '#667eea' : 'rgba(255, 255, 255, 0.9)',
                  background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  height: 'auto',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Right side - User info and logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {userType === 'admin' ?
              <Shield size={18} style={{ color: 'white' }} /> :
              <User size={18} style={{ color: 'white' }} />
            }
          </div>
          <div>
            <p style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0',
              lineHeight: '1'
            }}>
              {user?.name || 'User'}
            </p>
            <Badge style={{
              background: userType === 'admin' ? '#10b981' : '#3b82f6',
              color: 'white',
              fontSize: '10px',
              padding: '2px 8px',
              marginTop: '2px'
            }}>
              {userType === 'admin' ? 'Administrator' : 'Student'}
            </Badge>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '10px 16px',
            height: 'auto',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </nav>
  );
}

export default MainNavigation;
