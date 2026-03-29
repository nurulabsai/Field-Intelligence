import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '../index';

// Reset store state between tests
beforeEach(() => {
  useUIStore.setState({
    isOnline: true,
    pendingSyncCount: 0,
    sideNavOpen: false,
    theme: 'dark',
    language: 'en',
    toasts: [],
  });
});

describe('useUIStore', () => {
  describe('connectivity', () => {
    it('defaults to online', () => {
      expect(useUIStore.getState().isOnline).toBe(true);
    });

    it('sets offline', () => {
      useUIStore.getState().setOnline(false);
      expect(useUIStore.getState().isOnline).toBe(false);
    });
  });

  describe('pendingSyncCount', () => {
    it('increments', () => {
      useUIStore.getState().incrementPendingSync();
      useUIStore.getState().incrementPendingSync();
      expect(useUIStore.getState().pendingSyncCount).toBe(2);
    });

    it('decrements but never goes below 0', () => {
      useUIStore.getState().decrementPendingSync();
      expect(useUIStore.getState().pendingSyncCount).toBe(0);
    });

    it('sets to specific value', () => {
      useUIStore.getState().setPendingSyncCount(5);
      expect(useUIStore.getState().pendingSyncCount).toBe(5);
    });
  });

  describe('sideNav', () => {
    it('toggles', () => {
      useUIStore.getState().toggleSideNav();
      expect(useUIStore.getState().sideNavOpen).toBe(true);
      useUIStore.getState().toggleSideNav();
      expect(useUIStore.getState().sideNavOpen).toBe(false);
    });

    it('sets directly', () => {
      useUIStore.getState().setSideNavOpen(true);
      expect(useUIStore.getState().sideNavOpen).toBe(true);
    });
  });

  describe('theme', () => {
    it('defaults to dark', () => {
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('switches to light', () => {
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('language', () => {
    it('defaults to English', () => {
      expect(useUIStore.getState().language).toBe('en');
    });

    it('switches to Swahili', () => {
      useUIStore.getState().setLanguage('sw');
      expect(useUIStore.getState().language).toBe('sw');
    });
  });

  describe('toasts', () => {
    it('adds a toast with auto-generated id', () => {
      vi.useFakeTimers();
      useUIStore.getState().addToast({ message: 'Saved', type: 'success' });
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Saved');
      expect(toasts[0]!.type).toBe('success');
      expect(toasts[0]!.id).toBeTruthy();
      vi.useRealTimers();
    });

    it('removes a toast by id', () => {
      vi.useFakeTimers();
      useUIStore.getState().addToast({ message: 'Test', type: 'info', duration: 0 });
      const id = useUIStore.getState().toasts[0]!.id;
      useUIStore.getState().removeToast(id);
      expect(useUIStore.getState().toasts).toHaveLength(0);
      vi.useRealTimers();
    });

    it('clears all toasts', () => {
      vi.useFakeTimers();
      useUIStore.getState().addToast({ message: 'A', type: 'info', duration: 0 });
      useUIStore.getState().addToast({ message: 'B', type: 'error', duration: 0 });
      useUIStore.getState().clearToasts();
      expect(useUIStore.getState().toasts).toHaveLength(0);
      vi.useRealTimers();
    });

    it('auto-dismisses after duration', () => {
      vi.useFakeTimers();
      useUIStore.getState().addToast({ message: 'Bye', type: 'warning', duration: 2000 });
      expect(useUIStore.getState().toasts).toHaveLength(1);
      vi.advanceTimersByTime(2000);
      expect(useUIStore.getState().toasts).toHaveLength(0);
      vi.useRealTimers();
    });
  });
});
