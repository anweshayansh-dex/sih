import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  animate?: boolean;
  highContrast?: boolean;
  onCharacterTyped?: () => void;
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  animate = true,
  highContrast = false,
  onCharacterTyped,
  onComplete,
  className = ''
}) => {
  const [displayedLength, setDisplayedLength] = useState<number>(animate ? 0 : text.length);
  const [isTyping, setIsTyping] = useState<boolean>(animate && text.length > 0);

  const onCompleteRef = useRef(onComplete);
  const onCharTypedRef = useRef(onCharacterTyped);
  onCompleteRef.current = onComplete;
  onCharTypedRef.current = onCharacterTyped;

  useEffect(() => {
    if (!animate || !text) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      onCompleteRef.current?.();
      return;
    }

    setDisplayedLength(0);
    setIsTyping(true);

    const totalChars = text.length;
    // Keep typing pleasant and brisk: 600ms for short answers up to 2000ms for long answers
    const tickInterval = 20; // 50 updates/sec
    const targetDurationMs = Math.min(2000, Math.max(600, totalChars * 5.5));
    const totalTicks = Math.max(1, targetDurationMs / tickInterval);
    const charsPerTick = Math.max(1, Math.ceil(totalChars / totalTicks));

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += charsPerTick;
      if (currentIndex >= totalChars) {
        currentIndex = totalChars;
        setDisplayedLength(totalChars);
        setIsTyping(false);
        clearInterval(interval);
        onCompleteRef.current?.();
      } else {
        setDisplayedLength(currentIndex);
        onCharTypedRef.current?.();
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [text, animate]);

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayedLength(text.length);
    setIsTyping(false);
    onCompleteRef.current?.();
  };

  const displayedText = text.slice(0, displayedLength);

  return (
    <div className={`relative ${className}`} onClick={isTyping ? handleSkip : undefined}>
      <span className="whitespace-pre-wrap leading-relaxed">
        {displayedText}
      </span>
      {isTyping && (
        <span
          className={`inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse ${
            highContrast ? 'bg-yellow-400' : 'bg-[#0B3D6B]'
          }`}
          aria-hidden="true"
        />
      )}
      {isTyping && (
        <button
          type="button"
          onClick={handleSkip}
          className="ml-2 inline-flex items-center text-[10px] text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-1.5 py-0.2 rounded-xs cursor-pointer transition-colors"
          title="Click to reveal full text immediately"
        >
          Skip
        </button>
      )}
    </div>
  );
};
