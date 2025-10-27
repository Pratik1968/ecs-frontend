import React from 'react';

const PageLayout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {children}
    </div>
  );
};

export default PageLayout;