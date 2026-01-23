import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAppSettings } from './useAppSettings'
import { DEFAULT_APP_SETTINGS } from '../../config/appSettings'

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {}
}))

// Mock Firestore functions
const mockOnSnapshot = vi.fn()
const mockSetDoc = vi.fn()
const mockDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}))

describe('useAppSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDoc.mockReturnValue({ _path: 'AppConfig/settings' })
  })

  it('returns loading state initially', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useAppSettings())

    expect(result.current.loading).toBe(true)
    expect(result.current.settings).toEqual(DEFAULT_APP_SETTINGS)
  })

  it('loads settings from Firestore', async () => {
    const mockSettings = {
      qualityMappings: { 'TEST-001': 'Test Quality' },
      dimensionAdjustments: { '30.0': 30.5 },
      inventoryCheckPeriodDays: 100,
      collections: {
        beam: 'TestBeams',
        jointer: 'TestJointers',
        slotActions: 'TestActions',
        weeklyReport: 'TestReports',
      },
      version: 5,
      lastUpdated: '2025-06-15T00:00:00Z',
    }

    mockOnSnapshot.mockImplementation((_, callback) => {
      setTimeout(() => {
        callback({
          exists: () => true,
          data: () => mockSettings,
        })
      }, 0)
      return vi.fn()
    })

    const { result } = renderHook(() => useAppSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings.qualityMappings).toEqual(mockSettings.qualityMappings)
    expect(result.current.settings.inventoryCheckPeriodDays).toBe(100)
    expect(result.current.settings.version).toBe(5)
    expect(result.current.error).toBeNull()
  })

  it('uses defaults when Firestore document does not exist', async () => {
    mockOnSnapshot.mockImplementation((_, callback) => {
      setTimeout(() => {
        callback({
          exists: () => false,
          data: () => undefined,
        })
      }, 0)
      return vi.fn()
    })

    const { result } = renderHook(() => useAppSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings).toEqual(DEFAULT_APP_SETTINGS)
  })

  it('handles Firestore errors gracefully', async () => {
    const testError = new Error('Firestore connection failed')

    mockOnSnapshot.mockImplementation((_, _callback, errorCallback) => {
      setTimeout(() => {
        errorCallback(testError)
      }, 0)
      return vi.fn()
    })

    const { result } = renderHook(() => useAppSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(testError)
    expect(result.current.settings).toEqual(DEFAULT_APP_SETTINGS)
  })

  it('provides updateSettings function', async () => {
    mockOnSnapshot.mockImplementation((_, callback) => {
      setTimeout(() => {
        callback({
          exists: () => true,
          data: () => ({
            ...DEFAULT_APP_SETTINGS,
            version: 1,
          }),
        })
      }, 0)
      return vi.fn()
    })

    mockSetDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAppSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.updateSettings).toBe('function')
  })

  it('returns saving state during update', async () => {
    mockOnSnapshot.mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => ({
          ...DEFAULT_APP_SETTINGS,
          version: 1,
        }),
      })
      return vi.fn()
    })

    mockSetDoc.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    const { result } = renderHook(() => useAppSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.saving).toBe(false)
  })
})
