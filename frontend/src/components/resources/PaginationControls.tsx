'use client';

import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7, // Default to 7 visible page items (e.g., 1 ... 3 4 5 ... 10)
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    const M = maxVisiblePages;

    if (totalPages <= M) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Always show the first page, current page, and last page.
    const pagesToShow = new Set<number>();
    pagesToShow.add(1);
    pagesToShow.add(totalPages);
    pagesToShow.add(currentPage);

    // Add pages around the current page
    // Calculate how many pages to show on each side of the current page,
    // trying to fill up to maxVisiblePages.
    // We have 3 fixed points (1, currentPage, totalPages) which could be 1, 2 or 3 distinct numbers.
    // The remaining slots (M - pagesToShow.size) should be filled around currentPage.

    let remainingSlots = M - pagesToShow.size;
    let i = 1;
    while (remainingSlots > 0) {
      let added = false;
      if (currentPage - i >= 1) {
        if (pagesToShow.size < M) {
            pagesToShow.add(currentPage - i);
            remainingSlots = M - pagesToShow.size;
            added = true;
        }
      }
      if (currentPage + i <= totalPages) {
        if (pagesToShow.size < M) {
            pagesToShow.add(currentPage + i);
            remainingSlots = M - pagesToShow.size;
            added = true;
        }
      }
      if (!added && pagesToShow.size >= M) break; // Break if no more can be added or slots filled
      i++;
      if (i > totalPages) break; // Safety break
    }
    
    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

    // Add ellipses
    const finalPageNumbers: (number | string)[] = [];
    let lastPushedPage: number | null = null;
    for (const page of sortedPages) {
      if (lastPushedPage !== null && page - lastPushedPage > 1) {
        finalPageNumbers.push('...');
      }
      finalPageNumbers.push(page);
      lastPushedPage = page;
    }
    return finalPageNumbers;
  };

  const pageItems = getPageNumbers();

  const buttonClass = (isActive = false, isDisabled = false) => 
    `px-3 py-1 text-sm font-medium border border-gray-300 rounded-md ` +
    `${isDisabled ? 'opacity-50 cursor-not-allowed ' : 'hover:bg-gray-50 '}` +
    `${isActive ? 'bg-indigo-600 text-white border-indigo-600 Z-10' : 'bg-white text-gray-700'}`;

  return (
    <div className="flex justify-center items-center space-x-1 mt-8">
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        className={buttonClass(false, currentPage <= 1)}
        aria-label="Go to first page"
      >
        &laquo;
      </button>
      
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={buttonClass(false, currentPage <= 1)}
        aria-label="Go to previous page"
      >
        &lsaquo;
      </button>

      {/* Page Numbers */}
      {pageItems.map((item, index) => (
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm font-medium text-gray-700">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item as number)}
            disabled={currentPage === item}
            className={buttonClass(currentPage === item, currentPage === item)}
          >
            {item}
          </button>
        )
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={buttonClass(false, currentPage >= totalPages)}
        aria-label="Go to next page"
      >
        &rsaquo;
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        className={buttonClass(false, currentPage >= totalPages)}
        aria-label="Go to last page"
      >
        &raquo;
      </button>
    </div>
  );
};

export default PaginationControls; 