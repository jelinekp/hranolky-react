import { vi } from 'vitest'

/**
 * Mock Firestore data store for testing
 */
type MockDocData = Record<string, unknown>
type MockCollection = Map<string, MockDocData>

const mockCollections: Map<string, MockCollection> = new Map()

/**
 * Set up mock data for a collection
 */
export function setMockCollection(collectionName: string, docs: Array<{ id: string; data: MockDocData }>) {
  const collection = new Map<string, MockDocData>()
  docs.forEach(doc => collection.set(doc.id, doc.data))
  mockCollections.set(collectionName, collection)
}

/**
 * Clear all mock collections
 */
export function clearMockCollections() {
  mockCollections.clear()
}

/**
 * Mock document snapshot
 */
export function createMockDocSnapshot(id: string, data: MockDocData | undefined) {
  return {
    id,
    exists: () => data !== undefined,
    data: () => data,
    get: (field: string) => data?.[field]
  }
}

/**
 * Mock query snapshot
 */
export function createMockQuerySnapshot(docs: Array<{ id: string; data: MockDocData }>) {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs: docs.map(doc => createMockDocSnapshot(doc.id, doc.data)),
    forEach: (callback: (doc: ReturnType<typeof createMockDocSnapshot>) => void) => {
      docs.forEach(doc => callback(createMockDocSnapshot(doc.id, doc.data)))
    }
  }
}

/**
 * Mock Firestore functions
 */
export const mockCollection = vi.fn().mockImplementation((_db, collectionName: string, ...path: string[]) => {
  const fullPath = [collectionName, ...path].join('/')
  return { _path: fullPath }
})

export const mockQuery = vi.fn().mockImplementation((ref) => ref)

export const mockGetDocs = vi.fn().mockImplementation((ref) => {
  const collectionName = ref._path?.split('/')[0] || ''
  const collection = mockCollections.get(collectionName)

  if (!collection) {
    return Promise.resolve(createMockQuerySnapshot([]))
  }

  const docs = Array.from(collection.entries()).map(([id, data]) => ({ id, data }))
  return Promise.resolve(createMockQuerySnapshot(docs))
})

export const mockOnSnapshot = vi.fn().mockImplementation((ref, callback) => {
  const collectionName = ref._path?.split('/')[0] || ''
  const collection = mockCollections.get(collectionName)

  const docs = collection
    ? Array.from(collection.entries()).map(([id, data]) => ({ id, data }))
    : []

  // Call callback immediately with current data
  setTimeout(() => callback(createMockQuerySnapshot(docs)), 0)

  // Return unsubscribe function
  return vi.fn()
})

export const mockOrderBy = vi.fn().mockImplementation(() => ({}))
export const mockLimit = vi.fn().mockImplementation(() => ({}))
export const mockWhere = vi.fn().mockImplementation(() => ({}))

/**
 * Setup Firebase mock module
 */
export function setupFirebaseMock() {
  vi.mock('firebase/firestore', () => ({
    collection: mockCollection,
    query: mockQuery,
    getDocs: mockGetDocs,
    onSnapshot: mockOnSnapshot,
    orderBy: mockOrderBy,
    limit: mockLimit,
    where: mockWhere,
    Timestamp: {
      fromDate: (date: Date) => ({
        toDate: () => date,
        toMillis: () => date.getTime()
      }),
      now: () => ({
        toDate: () => new Date(),
        toMillis: () => Date.now()
      })
    }
  }))
}
