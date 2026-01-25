import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChartLoadingState, MANUAL_LOAD_THRESHOLD } from './useChartLoadingState'

describe('useChartLoadingState', () => {
  describe('shouldFetchData', () => {
    it('returns true when no filters active', () => {
      const { result } = renderHook(() =>
        useChartLoadingState(false, 100)
      );

      expect(result.current.shouldFetchData).toBe(true);
    });

    it('returns true when filters active but few slots', () => {
      const { result } = renderHook(() =>
        useChartLoadingState(true, MANUAL_LOAD_THRESHOLD - 1)
      );

      expect(result.current.shouldFetchData).toBe(true);
    });

    it('returns false when filters active and many slots (requires manual load)', () => {
      const { result } = renderHook(() =>
        useChartLoadingState(true, MANUAL_LOAD_THRESHOLD + 10)
      );

      expect(result.current.shouldFetchData).toBe(false);
      expect(result.current.shouldWaitForManualLoad).toBe(true);
    });
  });

  describe('manualLoadRequested', () => {
    it('enables fetch when manual load requested', () => {
      const { result } = renderHook(() =>
        useChartLoadingState(true, MANUAL_LOAD_THRESHOLD + 10)
      );

      expect(result.current.shouldFetchData).toBe(false);

      act(() => {
        result.current.setManualLoadRequested(true);
      });

      expect(result.current.shouldFetchData).toBe(true);
    });

    it('resets when filter conditions change', () => {
      const { result, rerender } = renderHook(
        ({ hasFilters, count }) => useChartLoadingState(hasFilters, count),
        { initialProps: { hasFilters: true, count: MANUAL_LOAD_THRESHOLD + 10 } }
      );

      // Request manual load
      act(() => {
        result.current.setManualLoadRequested(true);
      });
      expect(result.current.manualLoadRequested).toBe(true);

      // Change filter count - should reset
      rerender({ hasFilters: true, count: MANUAL_LOAD_THRESHOLD + 20 });
      expect(result.current.manualLoadRequested).toBe(false);
    });
  });

  describe('threshold constant', () => {
    it('exports MANUAL_LOAD_THRESHOLD', () => {
      expect(MANUAL_LOAD_THRESHOLD).toBe(10);
    });
  });
});
