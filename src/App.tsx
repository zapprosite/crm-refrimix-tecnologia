import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Schedule } from './pages/Schedule';
import { Quotes } from './pages/Quotes';
import { Maintenance } from './pages/Maintenance';
import { Finance } from './pages/Finance';
import { Tasks } from './pages/Tasks';
import { AdminUsers } from './pages/AdminUsers'; // Import Admin Page
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './components/auth/Login';
import { PendingApproval } from './components/auth/PendingApproval';
import { FullScreenLoading } from './components/ui/LoadingSpinner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard />
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthGuard() {
  const { user, loading, hasFullAccess, isAdmin } = useAuth();

  // Loading auth state
  if (loading) {
    return <FullScreenLoading text="Autenticando..." />;
  }

  // Not logged in
  if (!user) {
    return <Login />;
  }

  // Check if user has full access (Admin or Approved)
  // If NOT full access, show Pending/Rejected screen
  if (!hasFullAccess) {
    return <PendingApproval />;
  }

  // Authorized - show main app
  return (
    <Router>
      <AppProvider key={user.id}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/finance" element={<Finance />} />

            {/* Admin Route - Only accessible by Super Admin */}
            <Route
              path="/admin"
              element={isAdmin ? <AdminUsers /> : <Navigate to="/" />}
            />
          </Routes>
        </Layout>
      </AppProvider>
    </Router>
  );
}

export default App;
