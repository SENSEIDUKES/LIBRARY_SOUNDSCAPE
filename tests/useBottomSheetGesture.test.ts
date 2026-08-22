import { describe, it, expect } from 'vitest';

describe('useBottomSheetGesture logic and gesture thresholds', () => {
  const calculateDragResponse = (deltaY: number) => {
    if (deltaY > 0) {
      return deltaY;
    }
    // Rubber band resistance when pulled upwards
    return deltaY * 0.15;
  };

  const evaluateDismiss = (
    finalOffset: number,
    elapsedMs: number,
    threshold = 80,
    velocityThreshold = 0.4
  ) => {
    const velocity = elapsedMs > 0 ? finalOffset / elapsedMs : 0;
    return finalOffset > threshold || (finalOffset > 25 && velocity > velocityThreshold);
  };

  it('should allow downward drag with 1:1 translation ratio', () => {
    const deltaY = 65;
    const offset = calculateDragResponse(deltaY);
    expect(offset).toBe(65);
  });

  it('should apply rubber-band damping resistance for upward pull', () => {
    const deltaY = -50;
    const offset = calculateDragResponse(deltaY);
    expect(offset).toBeCloseTo(-7.5);
  });

  it('should trigger dismiss when offset exceeds pixel threshold (e.g. 80px)', () => {
    const shouldDismiss = evaluateDismiss(95, 300, 80, 0.4);
    expect(shouldDismiss).toBe(true);
  });

  it('should trigger dismiss on quick downward flick velocity (> 0.4 px/ms) even with moderate offset', () => {
    // 40px in 60ms => velocity = 0.66 px/ms > 0.4 px/ms threshold
    const shouldDismiss = evaluateDismiss(40, 60, 80, 0.4);
    expect(shouldDismiss).toBe(true);
  });

  it('should snap back when drag offset and velocity are below dismiss thresholds', () => {
    // 35px in 400ms => velocity = 0.087 px/ms
    const shouldDismiss = evaluateDismiss(35, 400, 80, 0.4);
    expect(shouldDismiss).toBe(false);
  });
});
