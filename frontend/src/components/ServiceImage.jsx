import { useEffect, useState } from 'react';
import { categoryIcon } from '../utils/constants';

export default function ServiceImage({ src, alt, category, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    const Icon = categoryIcon(category);
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500 ${className}`}
      >
        <Icon size={44} />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)}
         className={`object-cover ${className}`} />
  );
}
