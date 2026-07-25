import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { reviewClaim } from '../../services/api';
import { StatusBadge } from '../StatusBadge';

export const ReviewClaimModal = ({ isOpen, onClose, claim, onReviewSubmitted }) => {
  const [approvedAmount, setApprovedAmount] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (claim) {
      setApprovedAmount(
        claim.approvedAmount !== null && claim.approvedAmount !== undefined
          ? claim.approvedAmount
          : claim.claimAmount
      );
      setComments(claim.insurerComments || '');
    }
  }, [claim]);

  if (!isOpen || !claim) return null;

  const handleAction = async (status) => {
    setLoading(true);
    try {
      await reviewClaim(claim._id || claim.id, {
        status: status,
        approvedAmount: status === 'APPROVED' ? Number(approvedAmount) : 0,
        insurerComments: comments,
      });
      onReviewSubmitted(status);
      onClose();
    } catch (err) {
      console.error('Error updating review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Review claim</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claim Details */}
        <div className="space-y-2 text-xs text-slate-700">
          <p><span className="font-semibold text-slate-900">Patient:</span> {claim.patientName} ({claim.patientEmail})</p>
          <p><span className="font-semibold text-slate-900">Submitted:</span> {new Date(claim.submissionDate).toLocaleString()}</p>
          <p><span className="font-semibold text-slate-900">Amount:</span> ${Number(claim.claimAmount).toFixed(2)}</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Status:</span>
            <StatusBadge status={claim.status} />
          </div>
          <p><span className="font-semibold text-slate-900">Description:</span> {claim.description}</p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Document:</span>
            {claim.documentUrl ? (
              <a
                href={claim.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 underline font-medium hover:text-slate-700"
              >
                Open
              </a>
            ) : (
              <span className="text-slate-400">None</span>
            )}
          </p>
        </div>

        {/* Action Form */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approved amount</label>
            <input
              type="number"
              step="0.01"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Comments</label>
            <textarea
              rows="3"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-400"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('REJECTED')}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Reject
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('APPROVED')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Approve
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
