import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function AdminIndex() {
  const [_, navigate] = useLocation();
  
  // Redirect to quick-update page which is our main admin dashboard
  useEffect(() => {
    navigate('/admin/quick-update');
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to admin dashboard...</p>
    </div>
  );
}