import React from 'react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          Rejected
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          Pending
        </span>
      );
  }
};
