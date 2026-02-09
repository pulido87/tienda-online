import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // Check if src is a URL (starts with http, https, /, or data:)
  const isUrl = src && (src.startsWith('http') || src.startsWith('/') || src.startsWith('data:'));

  if (isUrl && !error) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {!loaded && (
           <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
        )}
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // If it's an emoji or other text (or if image failed to load)
  // If it was a URL that failed, we show a fallback emoji
  const displayContent = (isUrl && error) ? '📦' : (src || '📦');

  return (
    <span className={`flex items-center justify-center w-full h-full bg-gray-800/50 ${className}`} role="img" aria-label={alt}>
      {displayContent}
    </span>
  );
}
