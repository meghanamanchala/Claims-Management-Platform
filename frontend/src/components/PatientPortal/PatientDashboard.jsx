import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../StatusBadge';
import { createClaim } from '../../services/api';

export const PatientDashboard = ({ claims, loading, currentUser, onRefresh }) => {
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientEmail, setPatientEmail] = useState(currentUser?.email || '');
  const [claimAmount, setClaimAmount] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser?.email) {
      const emailVal = currentUser.email.includes('@') ? currentUser.email : `${currentUser.email}@example.com`;
      setPatientEmail(emailVal);
    }
    if (currentUser?.name) {
      setPatientName(currentUser.name);
    }
  }, [currentUser]);

  const activeEmail = (patientEmail || currentUser?.email || '').trim().toLowerCase();

  const filteredClaims = claims.filter(c => {
    if (!activeEmail) return true;
    const cEmail = (c.patientEmail || '').trim().toLowerCase();
    const cName = (c.patientName || '').trim().toLowerCase();

    if (cEmail === activeEmail) return true;
    if (cEmail && activeEmail && (cEmail.startsWith(activeEmail) || activeEmail.startsWith(cEmail.split('@')[0]))) return true;
    if (cName && activeEmail && (cName.toLowerCase() === activeEmail || activeEmail.includes(cName.toLowerCase()))) return true;
    return false;
  });

  const myClaims = filteredClaims.length > 0 ? filteredClaims : claims;

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const rawEmail = activeEmail || 'patient@example.com';
    const submitEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@example.com`;
    const submitName = patientName || submitEmail.split('@')[0] || 'Patient';

    if (!claimAmount || Number(claimAmount) <= 0) {
      setErrorMsg('Please enter a valid claim amount greater than 0.');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('patientName', submitName);
      formData.append('patientEmail', submitEmail);
      formData.append('claimAmount', String(claimAmount));
      formData.append('description', description);
      if (file) {
        formData.append('document', file);
      }

      await createClaim(formData);
      setSuccessMsg('Claim submitted successfully!');
      setClaimAmount('');
      setDescription('');
      setFile(null);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to submit claim:', err);
      const msg = err.response?.data?.message;
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Patient Dashboard
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Submit a claim Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Submit a claim</h3>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                readOnly={Boolean(currentUser?.email)}
                value={activeEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="email@example.com"
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono ${
                  currentUser?.email ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 focus:outline-none focus:border-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Claim amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="1000.00"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows="3"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Medical treatment or prescription details..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-400"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document (receipt / prescription)
              </label>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              {submitting ? 'Submitting...' : 'Submit claim'}
            </button>
          </form>
        </div>

        {/* Right Column: My claims Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">My claims</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-3 px-2">Submitted</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Approved</th>
                  <th className="py-3 px-2">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myClaims.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No claims submitted yet.
                    </td>
                  </tr>
                ) : (
                  myClaims.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-slate-700">
                        {new Date(c.submissionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-900">
                        ${Number(c.claimAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-700">
                        {c.status === 'APPROVED' ? `$${Number(c.approvedAmount ?? c.claimAmount).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-600 truncate max-w-[150px]">
                        {c.insurerComments || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
