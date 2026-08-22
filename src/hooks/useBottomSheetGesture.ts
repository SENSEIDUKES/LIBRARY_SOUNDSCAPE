import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface UseBottomSheetGestureOptions {
  isOpen: boolean;
  onClose: () => void;
  threshold?: number; // Dismiss threshold in pixels (default: 80)
  velocityThreshold?: number; // Dismiss flick velocity in px/ms (default: 0.4)
}

/**
 * Custom hook providing touch-drag swipe-down to dismiss gesture for mobile bottom sheets.
 */
export function useBottomSheetGesture({
  isOpen,
  onClose,
  threshold = 80,
  velocityThreshold = 0.4,
}: UseBottomSheetGestureOptions) {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const currentOffsetRef = useRef<number>(0);

  // Reset state when modal opens or closes
  useEffect(() => {
    setDragOffset(0);
    setIsDragging(false);
    currentOffsetRef.current = 0;
    startYRef.current = 0;
    startTimeRef.current = 0;
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    currentOffsetRef.current = 0;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startYRef.current === 0) return;
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startYRef.current;

    if (deltaY > 0) {
      currentOffsetRef.current = deltaY;
      setDragOffset(deltaY);
    } else {
      // Mild rubber band resistance when pulled upwards
      const resistance = deltaY * 0.15;
      currentOffsetRef.current = resistance;
      setDragOffset(resistance);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (startYRef.current === 0) return;
    const elapsed = Date.now() - startTimeRef.current;
    const finalOffset = currentOffsetRef.current;
    const velocity = elapsed > 0 ? finalOffset / elapsed : 0;

    setIsDragging(false);
    startYRef.current = 0;
    startTimeRef.current = 0;

    if (finalOffset > threshold || (finalOffset > 25 && velocity > velocityThreshold)) {
      onClose();
    } else {
      // Snap back smoothly
      setDragOffset(0);
      currentOffsetRef.current = 0;
    }
  }, [threshold, velocityThreshold, onClose]);

  const dragStyle: React.CSSProperties = {
    transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return {
    dragOffset,
    isDragging,
    dragStyle,
    dragHandleProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
