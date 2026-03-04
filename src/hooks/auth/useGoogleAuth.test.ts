import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGoogleAuth } from './useGoogleAuth';
import { signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('../../firebase', () => ({
  auth: { currentUser: null }
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({
    setCustomParameters: vi.fn()
  })),
  browserLocalPersistence: 'local',
  setPersistence: vi.fn().mockResolvedValue({})
}));

describe('useGoogleAuth', () => {
  let mockProviderInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockProviderInstance = new GoogleAuthProvider();
    (GoogleAuthProvider as any).mockImplementation(() => mockProviderInstance);
  });

  it('should sign out and set forceSelectAccount flag', async () => {
    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(firebaseSignOut).toHaveBeenCalled();
    expect(sessionStorage.getItem('forceSelectAccount')).toBe('true');
  });

  it('should prompt for account selection if flag is set', async () => {
    sessionStorage.setItem('forceSelectAccount', 'true');
    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(mockProviderInstance.setCustomParameters).toHaveBeenCalledWith({
      prompt: 'select_account'
    });
    expect(sessionStorage.getItem('forceSelectAccount')).toBeNull();
  });

  it('should NOT prompt for account selection if flag is NOT set', async () => {
    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(mockProviderInstance.setCustomParameters).toHaveBeenCalledWith({});
  });

  it('should reset flag if popup is closed', async () => {
    sessionStorage.setItem('forceSelectAccount', 'true');
    (signInWithPopup as any).mockRejectedValueOnce({
      code: 'auth/popup-closed-by-user'
    });

    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(sessionStorage.getItem('forceSelectAccount')).toBe('true');
    expect(result.current.error).toBeNull();
  });
});
