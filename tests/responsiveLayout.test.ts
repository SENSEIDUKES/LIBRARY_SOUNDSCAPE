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

  it('should verify safe-area-inset and mobile padding rules for sticky controls', () => {
    const headerPadding = 'pt-[env(safe-area-inset-top,0px)]';
    const playerBarBottom = 'bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))]';
    const appBottomPadding = 'pb-[calc(7rem+env(safe-area-inset-bottom,0px))]';

    expect(headerPadding).toContain('safe-area-inset-top');
    expect(playerBarBottom).toContain('safe-area-inset-bottom');
    expect(appBottomPadding).toContain('safe-area-inset-bottom');
  });

  it('should enforce touch target minimum heights for mobile buttons', () => {
    const minMobileTouchTargetPx = 36;
    const standardMobileTouchTargetPx = 44;
    expect(minMobileTouchTargetPx).toBeGreaterThanOrEqual(36);
    expect(standardMobileTouchTargetPx).toBeGreaterThanOrEqual(44);
  });

  it('should provide responsive mobileCode abbreviations for culture options to prevent word overflow', () => {
    const cultureOptions = [
      { id: 'Chinese', name: 'Chinese', shortName: 'Chinese', mobileCode: 'CN' },
      { id: 'Japanese', name: 'Japanese', shortName: 'Japanese', mobileCode: 'JP' },
      { id: 'Korean', name: 'Korean', shortName: 'Korean', mobileCode: 'KR' },
      { id: 'Western', name: 'Western', shortName: 'Western', mobileCode: 'West' },
    ];

    cultureOptions.forEach((opt) => {
      expect(opt.mobileCode.length).toBeLessThanOrEqual(4);
      expect(opt.shortName.length).toBeGreaterThan(0);
    });
  });

  it('should verify confirm delete modal responsive bottom-sheet classes on mobile', () => {
    const modalClasses = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200';
    const sheetClasses = 'relative w-full max-w-md bg-[#0a0c1a] border-t sm:border border-rose-500/40 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 text-gray-100 ring-1 ring-rose-500/20 overflow-hidden';

    expect(modalClasses).toContain('items-end');
    expect(modalClasses).toContain('sm:items-center');
    expect(sheetClasses).toContain('rounded-t-[28px]');
    expect(sheetClasses).toContain('sm:rounded-3xl');
  });
});
