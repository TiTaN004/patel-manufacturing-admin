import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange,
  label = 'items'
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="p-4 border-t bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-slate-500">
        Showing <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
        <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
        <span className="font-bold text-slate-900">{totalItems}</span> {label}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-xl flex items-center"
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              const distance = Math.abs(page - currentPage);
              return distance === 0 || distance === 1 || page === 1 || page === totalPages;
            })
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="text-slate-400 px-1">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${
                    currentPage === page 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))
          }
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-xl flex items-center"
        >
          Next
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};
