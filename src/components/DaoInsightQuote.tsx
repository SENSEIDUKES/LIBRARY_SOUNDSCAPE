import React, { useState, useRef, useEffect } from 'react';

interface DaoInsightQuoteProps {
  quote: string;
  className?: string;
}

export const DaoInsightQuote: React.FC<DaoInsightQuoteProps> = ({ quote, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(() => quote.length > 40);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        // Measure text length or container width
        const containerWidth = containerRef.current.clientWidth;
        if (textRef.current) {
          const textWidth = textRef.current.scrollWidth;
          setIsOverflowing(textWidth > containerWidth || quote.length > 40);
        } else {
          setIsOverflowing(quote.length > 40);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [quote]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex-1 min-w-0 max-w-full flex items-center group ${
        isOverflowing
          ? '[mask-image:linear-gradient(to_right,transparent_0%,black_14px,black_calc(100%-14px),transparent_100%)]'
          : ''
      } ${className}`}
      title={quote}
    >
      {isOverflowing ? (
        <div className="animate-marquee-rotate flex gap-8 whitespace-nowrap shrink-0">
          <span ref={textRef} className="text-xs font-serif italic text-slate-100 font-medium">
            "{quote}"
          </span>
          <span aria-hidden="true" className="text-xs font-serif italic text-slate-100 font-medium">
            "{quote}"
          </span>
        </div>
      ) : (
        <span
          ref={textRef}
          className="text-xs font-serif italic text-slate-100 font-medium whitespace-nowrap truncate"
        >
          "{quote}"
        </span>
      )}
    </div>
  );
};

export default DaoInsightQuote;
