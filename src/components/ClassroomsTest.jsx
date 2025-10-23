import React, { useState, useEffect } from 'react';
import { getClassrooms } from '@/services/api';

const ClassroomsTest = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const data = await getClassrooms();
        setClassrooms(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching classrooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  if (loading) return <div>Loading classrooms...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Classrooms from Supabase</h2>
      <p>Total classrooms: {classrooms.length}</p>
      <ul>
        {classrooms.map((classroom) => (
          <li key={classroom.id}>
            Classroom ID: {classroom.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomsTest;
