import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { login as apiLogin } from '@/services/api';
import './LoginPage.css';

// Mock user credentials
const mockUsers = {
  admin: [
    { username: 'admin', password: 'admin123', name: 'Admin User', id: 'ADM001' },
    { username: 'admin2', password: 'admin456', name: 'Admin User 2', id: 'ADM002' }
  ],
  student: [
    { username: 'john', password: 'student123', name: 'John Smith', id: 'STU001', regNumber: '2024CS001' },
    { username: 'alice', password: 'student456', name: 'Alice Johnson', id: 'STU002', regNumber: '2024CS002' },
    { username: 'bob', password: 'student789', name: 'Bob Wilson', id: 'STU003', regNumber: '2024CS003' }
  ]
};

function LoginPage() {
  const { login, userType, switchUserType } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { username, password });
      const response = await apiLogin(username, password);
      console.log('Login response:', response);
      
      // Check if we have access_token and admin data (successful login)
      if (response.access_token && response.admin) {
        console.log('Login successful, creating user object...');
        // Create user object from the admin data
        const user = {
          id: response.admin.id,
          username: response.admin.username,
          email: response.admin.email,
          name: response.admin.full_name,
          accessToken: response.access_token
        };
        
        console.log('User object created:', user);
        // Login as admin
        login(user, 'admin');
        console.log('Login function called');
      } else {
        console.log('Login failed - missing access_token or admin data');
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeToggle = () => {
    setUsername('');
    setPassword('');
    setError('');
    if (userType === 'admin') {
      setError('Student login is not available yet. Please contact your administrator.');
    } else {
      switchUserType('admin');
    }
  };

  return (
    <PageLayout>
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <div className="login-title">
              {userType === 'admin' ? (
                <>
                  <Users size={32} className="login-icon" />
                  <h1>Admin Login</h1>
                </>
              ) : (
                <>
                  <GraduationCap size={32} className="login-icon" />
                  <h1>Student Login</h1>
                </>
              )}
            </div>
            <p className="login-subtitle">
              {userType === 'admin' 
                ? 'Access the admin dashboard to manage attendance' 
                : 'Access your student dashboard to view attendance'
              }
            </p>
          </div>

          <Card className="login-card">
            <CardHeader>
              <CardTitle className="login-card-title">
                {userType === 'admin' ? 'Admin Access' : 'Student Access'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    <User size={16} />
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <Lock size={16} />
                    Password
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="login-footer">
                <div className="user-type-toggle">
                  <span className="toggle-label">
                    {userType === 'admin' ? 'Are you a student?' : 'Are you an admin?'}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleUserTypeToggle}
                    className="toggle-button"
                  >
                    {userType === 'admin' ? 'Student Login' : 'Admin Login'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="demo-credentials">
            <h3>Demo Credentials</h3>
            <div className="credentials-grid">
              <div className="credential-group">
                <h4>Admin Accounts:</h4>
                <div className="credential-item">
                  <span className="credential-username">admin</span>
                  <span className="credential-password">admin123</span>
                </div>
                <div className="credential-item">
                  <span className="credential-username">admin2</span>
                  <span className="credential-password">admin456</span>
                </div>
                {userType === 'student' && (
                  <div className="credential-note">
                    <p>Student login is not available yet. Please contact your administrator.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default LoginPage;
