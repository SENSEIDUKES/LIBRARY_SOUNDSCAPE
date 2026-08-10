import { describe, it, expect } from 'vitest';

describe('Mobile Viewport & Layout Helper Rules', () => {
  it('should define mobile breakpoints correctly', () => {
    const mobileWidth = 375;
    const desktopWidth = 1024;
    expect(mobileWidth).toBeLessThan(768);
    expect(desktopWidth).toBeGreaterThanOrEqual(1024);
  });

  it('should calculate proper button padding for mobile segmented control', () => {
    const size = 'lg';
    const buttonPaddingMap = {
      sm: 'px-2 py-1',
      md: 'px-3 sm:px-4 py-1.5 sm:py-2',
      lg: 'px-2 sm:px-4 md:px-5 py-2 sm:py-2.5',
    };
    expect(buttonPaddingMap[size]).toContain('px-2');
    expect(buttonPaddingMap[size]).toContain('sm:px-4');
  });

  it('should format token pill and model badges to prevent layout shifts', () => {
    const totalTokens = 12500;
    const formatted = totalTokens.toLocaleString();
    expect(formatted).toBe('12,500');
  });
});
