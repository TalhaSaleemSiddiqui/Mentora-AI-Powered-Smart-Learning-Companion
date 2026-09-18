import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import { useApp } from '../context/AppContext';

export default function AuthLayout() {
  const { user } = useApp();

  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <PageBackground style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Outlet />
    </PageBackground>
  );
}
