import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserManagement } from './useUserManagement';
import { onSnapshot, setDoc, deleteDoc, collection } from 'firebase/firestore';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: { databaseName: 'test-db' }
}));

const mockCallbacks: Record<string, any> = {};

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ name })),
  onSnapshot: vi.fn((coll, callback) => {
    mockCallbacks[coll.name] = callback;
    return vi.fn(); // unsubscribe
  }),
  doc: vi.fn((_db, coll, id) => ({ coll, id })),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('useUserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and load users', async () => {
    const { result } = renderHook(() => useUserManagement());

    expect(result.current.loading).toBe(true);
    expect(onSnapshot).toHaveBeenCalledTimes(2);

    // Simulate Admin snapshot
    act(() => {
      mockCallbacks['Admins']({
        docs: [{ id: 'admin@test.com' }]
      });
    });

    // Simulate AllowedUsers snapshot
    act(() => {
      mockCallbacks['AllowedUsers']({
        docs: [{ id: 'user@test.com' }]
      });
    });

    expect(result.current.admins).toEqual(['admin@test.com']);
    expect(result.current.allowedUsers).toEqual(['user@test.com']);
    expect(result.current.loading).toBe(false);
  });

  it('should add user correctly', async () => {
    (setDoc as any).mockResolvedValueOnce({});
    const { result } = renderHook(() => useUserManagement());

    let success;
    await act(async () => {
      success = await result.current.addUser('Admins', 'new@test.com');
    });

    expect(success).toBe(true);
    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'new@test.com' }),
      expect.objectContaining({ createdAt: 'mock-timestamp' })
    );
  });

  it('should remove user correctly', async () => {
    (deleteDoc as any).mockResolvedValueOnce({});
    const { result } = renderHook(() => useUserManagement());

    let success;
    await act(async () => {
      success = await result.current.removeUser('AllowedUsers', 'old@test.com');
    });

    expect(success).toBe(true);
    expect(deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'old@test.com' })
    );
  });
});
