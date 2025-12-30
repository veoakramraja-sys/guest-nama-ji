import React, { useState } from 'react';
import { AuthProvider, useAuth } from './authContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Guests } from './pages/Guests';
import { Finance } from './pages/Finance';
import { Tasks } from './pages/Tasks';
import { AdminStats } from './pages/AdminStats';
import { UserManagement } from './pages/UserManagement';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium tracking-tight">Authenticating Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (view === 'landing') return <Landing onStart={() => setView('signup')} onLogin={() => setView('login')} />;
    if (view === 'signup') return <Signup onSwitch={() => setView('login')} />;
    return <Login onSwitch={() => setView('signup')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigateToGuests={() => setActiveTab('guests')} />;
      case 'guests': return <Guests />;
      case 'finance': return <Finance />;
      case 'tasks': return <Tasks />;
      case 'admin-stats': return <AdminStats />;
      case 'user-management': return <UserManagement />;
      default: return <Dashboard onNavigateToGuests={() => setActiveTab('guests')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;