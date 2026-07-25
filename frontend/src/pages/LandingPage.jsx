import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, FileText, CheckCircle2 } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-900" />
              <span className="text-lg font-bold text-slate-900 tracking-tight">ClaimFlow</span>
            </div>

            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-900 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex flex-col items-center justify-center space-y-16">
        
        {/* Main Hero Header */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Claims management, made simple.
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Patients submit claims with supporting documents. Insurers review, approve, or reject — all in one clean dashboard.
          </p>

          <div className="pt-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              Get started
            </button>
          </div>
        </div>

        {/* 3 Simple Feature Cards matching Screenshot 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 text-left">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Submit claims</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload receipts and prescriptions in seconds.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Track status</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow claims from pending to approved.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Review & manage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Insurers approve or reject with comments.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};
