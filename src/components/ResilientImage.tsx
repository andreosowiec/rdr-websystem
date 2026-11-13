import { useState } from 'react';
import { Wrench } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClassName = 'aspect-video',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${aspectClassName} w-full bg-gradient-to-br from-[#181D24] via-[#12161C] to-[#0B0D10] border border-white/10 flex flex-col items-center justify-center p-6 text-center`}
        role="img"
        aria-label={alt}
      >
        <Wrench className="w-8 h-8 text-amber-500/80 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-200 max-w-xs">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
