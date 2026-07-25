import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { PatientDashboard } from '../components/PatientPortal/PatientDashboard';
import { fetchClaims } from '../services/api';

export const PatientDashboardPage = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeEmail = currentUser?.email || '';

  const activeUser = currentUser || {
    id: 'usr_patient_1',
    name: 'Patient User',
    email: activeEmail,
    role: 'PATIENT',
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const claimsData = await fetchClaims();
      setClaims(claimsData || []);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = () => {
    if (setCurrentUser) setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Header matching screenshots */}
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-900" />
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                ClaimFlow
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {activeEmail && (
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  {activeEmail}
                </span>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientDashboard
          claims={claims}
          loading={loading}
          currentUser={activeUser}
          onRefresh={loadData}
        />
      </main>

    </div>
  );
};
