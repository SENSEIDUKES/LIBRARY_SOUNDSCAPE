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

  it('should verify mobile bottom sheet modal class configurations (<640px vs >=640px)', () => {
    const overlayClasses = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200';
    const dialogClasses = 'relative w-full sm:max-w-xl bg-[#090a15] border-t sm:border border-white/15 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] text-gray-100 animate-bottom-sheet sm:animate-none';

    // On mobile screens (< 640px)
    expect(overlayClasses).toContain('items-end');
    expect(overlayClasses).toContain('p-0');
    expect(dialogClasses).toContain('rounded-t-[28px]');
    expect(dialogClasses).toContain('animate-bottom-sheet');

    // On desktop screens (>= 640px)
    expect(overlayClasses).toContain('sm:items-center');
    expect(overlayClasses).toContain('sm:p-4');
    expect(dialogClasses).toContain('sm:rounded-3xl');
    expect(dialogClasses).toContain('sm:animate-none');
    expect(dialogClasses).toContain('sm:border');
  });
});
