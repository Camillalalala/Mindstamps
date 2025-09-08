import { useState, useEffect } from 'react';

const MobileNavigation = ({ currentPage, totalPages, onPrevPage, onNextPage, onPageSelect }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="mobile-nav">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={onPrevPage}
          disabled={currentPage === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
            currentPage === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'btn-warm'
          }`}
        >
          <span>←</span>
          <span>Prev</span>
        </button>

        {/* Page Indicators */}
        <div className="flex space-x-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageIndex;
            if (totalPages <= 5) {
              pageIndex = i;
            } else if (currentPage <= 2) {
              pageIndex = i;
            } else if (currentPage >= totalPages - 3) {
              pageIndex = totalPages - 5 + i;
            } else {
              pageIndex = currentPage - 2 + i;
            }

            return (
              <button
                key={pageIndex}
                onClick={() => onPageSelect(pageIndex)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-300 ${
                  pageIndex === currentPage 
                    ? 'bg-gradient-to-r from-orange-300 to-yellow-300 text-white shadow-md' 
                    : 'bg-gradient-to-r from-orange-100 to-yellow-100 text-gray-700 hover:from-orange-200 hover:to-yellow-200'
                }`}
              >
                {pageIndex + 1}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages - 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
            currentPage >= totalPages - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'btn-warm'
          }`}
        >
          <span>Next</span>
          <span>→</span>
        </button>
      </div>

      {/* Swipe Hint */}
      <div className="text-center mt-2">
        <p className="text-xs" style={{ color: 'var(--warm-brown)' }}>
          Swipe left/right to navigate pages
        </p>
      </div>
    </div>
  );
};

export default MobileNavigation;