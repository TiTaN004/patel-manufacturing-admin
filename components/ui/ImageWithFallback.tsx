import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  className,
  fallbackText = "No Image",
  fallbackClassName,
  ...props 
}) => {
  const [error, setError] = useState(false);
  
  // Reset error state if src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className} ${fallbackClassName || ''}`}>
        <ImageIcon size={20} className="mb-1 opacity-50" />
        {fallbackText && <span className="text-[10px] font-medium uppercase tracking-wider">{fallbackText}</span>}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt || ''} 
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};
