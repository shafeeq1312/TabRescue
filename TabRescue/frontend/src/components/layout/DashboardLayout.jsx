import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CreateSessionModal from '../dashboard/CreateSessionModal';

const DashboardLayout = ({ children, onSessionCreated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSessionSaved = (newSession) => {
    if (onSessionCreated) onSessionCreated(newSession);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreateModal={() => setCreateModalOpen(true)}
      />

      {/* Main Body Area: Sidebar + Content */}
      <div className="flex flex-1 w-full max-w-[1700px] mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Create Session Modal */}
      <CreateSessionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleSessionSaved}
      />
    </div>
  );
};

export default DashboardLayout;
