import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  getClasses,
  getAllStudents,
  getUpcomingExams,
  getExamsByClass,
  getExamSeating,
  getCurrentTemperature,
  getCoolingStatus
} from '@/services/api';
import { handleApiError } from '@/utils/apiHelpers';

function ApiTestPanel() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testApi = async (apiName, apiFunction, ...args) => {
    setLoading(prev => ({ ...prev, [apiName]: true }));
    try {
      const result = await apiFunction(...args);
      setResults(prev => ({
        ...prev,
        [apiName]: {
          success: true,
          data: result,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [apiName]: {
          success: false,
          error: handleApiError(error, apiName),
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [apiName]: false }));
    }
  };

  const apiTests = [
    {
      name: 'getClasses',
      label: 'Get All Classes',
      function: getClasses,
      args: []
    },
    {
      name: 'getAllStudents',
      label: 'Get All Students',
      function: getAllStudents,
      args: []
    },
    {
      name: 'getUpcomingExams',
      label: 'Get Upcoming Exams',
      function: getUpcomingExams,
      args: []
    },
    {
      name: 'getExamsByClass',
      label: 'Get Exams by Class (AP2025260000001)',
      function: getExamsByClass,
      args: ['AP2025260000001']
    },
    {
      name: 'getExamSeating',
      label: 'Get Exam Seating (ID: 1234)',
      function: getExamSeating,
      args: [1234]
    },
    {
      name: 'getCurrentTemperature',
      label: 'Get Temperature (CS101)',
      function: getCurrentTemperature,
      args: ['CS101']
    },
    {
      name: 'getCoolingStatus',
      label: 'Get Cooling Status (CS101)',
      function: getCoolingStatus,
      args: ['CS101']
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card style={{
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <CardHeader style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          padding: '24px'
        }}>
          <CardTitle style={{
            fontSize: '24px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Zap size={28} />
            API Test Panel
          </CardTitle>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: '8px 0 0 0' }}>
            Test various API endpoints to verify backend connectivity and functionality
          </p>
        </CardHeader>
        <CardContent>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {apiTests.map(test => (
              <Card key={test.name} style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>
                    {test.label}
                  </h4>
                  {results[test.name] && (
                    results[test.name].success ?
                      <CheckCircle size={20} style={{ color: '#10b981' }} /> :
                      <XCircle size={20} style={{ color: '#ef4444' }} />
                  )}
                </div>

                <Button
                  onClick={() => testApi(test.name, test.function, ...test.args)}
                  disabled={loading[test.name]}
                  style={{
                    width: '100%',
                    background: loading[test.name] ? '#f3f4f6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: loading[test.name] ? '#6b7280' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading[test.name] ? (
                    <>
                      <Clock size={16} />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Run Test
                    </>
                  )}
                </Button>

                {results[test.name] && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge
                      style={{
                        background: results[test.name].success ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      {results[test.name].success ? 'Success' : 'Error'}
                    </Badge>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {results[test.name].timestamp}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {Object.keys(results).length > 0 && (
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#1f2937'
              }}>
                Test Results
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '500px',
                overflow: 'auto',
                padding: '4px'
              }}>
                {Object.entries(results).map(([apiName, result]) => (
                  <Card key={apiName} style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${result.success ? '#10b981' : '#ef4444'}20`,
                    background: `${result.success ? '#10b981' : '#ef4444'}05`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {result.success ?
                          <CheckCircle size={20} style={{ color: '#10b981' }} /> :
                          <XCircle size={20} style={{ color: '#ef4444' }} />
                        }
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>
                          {apiName}
                        </h4>
                      </div>
                      <Badge style={{
                        background: result.success ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}>
                        {result.success ? 'Success' : 'Error'}
                      </Badge>
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <pre style={{
                        fontSize: '13px',
                        fontFamily: 'Monaco, Consolas, monospace',
                        margin: '0',
                        overflow: 'auto',
                        maxHeight: '300px',
                        lineHeight: '1.5',
                        color: '#374151'
                      }}>
                        {result.success
                          ? JSON.stringify(result.data, null, 2)
                          : result.error
                        }
                      </pre>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ApiTestPanel;