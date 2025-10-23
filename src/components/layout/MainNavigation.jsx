import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Users, Calendar, Settings } from 'lucide-react';

function MainNavigation({ currentPage, onPageChange, userType }) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      availableFor: ['admin', 'student']
    },
    {
      id: 'exam-seating',
      label: userType === 'admin' ? 'Exam Seating Management' : 'Exam Seating',
      icon: Calendar,
      availableFor: ['admin', 'student']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.availableFor.includes(userType)
  );

  return (
    <nav className="main-navigation">
      <div className="nav-items">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

export default MainNavigation;
