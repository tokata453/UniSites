import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar  from '@/components/Navbar'; 
import  Footer  from '@/components/Footer';
import TopHeaderBar from '@/components/TopHeader'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* The Navbar stays permanently at the top */}
      <TopHeaderBar />
      <Navbar />

      <main className="flex-1">
        <Outlet /> 
      </main>

      {/* The Footer stays permanently at the bottom */}
      <Footer />
    </div>
  );
}