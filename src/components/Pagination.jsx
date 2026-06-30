import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 15, marginTop: 20, color: 'var(--text-secondary)' }}>
      <span style={{ fontSize: 13 }}>Page {currentPage} sur {totalPages}</span>
      <div style={{ display: 'flex', gap: 5 }}>
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{ background: 'var(--bg-card)', border: '1px solid #333', color: currentPage === 1 ? '#555' : '#fff', padding: '6px 10px', borderRadius: 6, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          style={{ background: 'var(--bg-card)', border: '1px solid #333', color: currentPage === totalPages ? '#555' : '#fff', padding: '6px 10px', borderRadius: 6, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
