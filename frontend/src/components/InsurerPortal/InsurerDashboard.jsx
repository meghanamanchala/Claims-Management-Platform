import React, { useState } from 'react';
import { StatusBadge } from '../StatusBadge';
import { ReviewClaimModal } from './ReviewClaimModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const InsurerDashboard = ({ claims, stats, loading, onRefresh, onReviewUpdated }) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const filteredClaims = claims.filter((claim) => {
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    const matchesMin = !minAmount || claim.claimAmount >= Number(minAmount);
    const matchesMax = !maxAmount || claim.claimAmount <= Number(maxAmount);

    const submissionTime = new Date(claim.submissionDate).getTime();
    const matchesFrom = !fromDate || submissionTime >= new Date(fromDate).getTime();
    const matchesTo = !toDate || submissionTime <= new Date(toDate).getTime() + 86400000;

    return matchesStatus && matchesMin && matchesMax && matchesFrom && matchesTo;
  });

  const handleReviewSubmitted = (status) => {
    onReviewUpdated();
    setToastMessage(`Claim ${status.toLowerCase()}`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Notification matching Screenshot 4 */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Insurer Dashboard
        </h1>
      </div>

      {/* Top Filter Card matching Screenshot 2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          
          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Min amount */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Min amount</label>
            <input
              type="number"
              placeholder=""
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Max amount */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Max amount</label>
            <input
              type="number"
              placeholder=""
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* From Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

        </div>
      </div>

      {/* Main Table Card matching Screenshot 2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Approved</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No claims found.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 text-slate-700">
                      {new Date(c.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-900">
                      {c.patientName}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-mono">
                      {c.patientEmail}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      ${Number(c.claimAmount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {c.status === 'APPROVED' ? `$${Number(c.approvedAmount ?? c.claimAmount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedClaim(c)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-xs font-medium transition-colors shadow-2xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedClaim && (
        <ReviewClaimModal
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          claim={selectedClaim}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

    </div>
  );
};
