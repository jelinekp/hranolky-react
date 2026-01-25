import { vi } from 'vitest'
import type { User } from 'firebase/auth'

/**
 * Mock admin user with full permissions
 */
export const mockAdminUser: Partial<User> = {
  uid: 'admin-user-123',
  email: 'jelinekp6@gmail.com',
  displayName: 'Admin User',
  photoURL: 'https://example.com/admin-photo.jpg',
  emailVerified: true,
}

/**
 * Mock regular user without admin permissions
 */
export const mockRegularUser: Partial<User> = {
  uid: 'regular-user-456',
  email: 'regularuser@example.com',
  displayName: 'Regular User',
  photoURL: 'https://example.com/user-photo.jpg',
  emailVerified: true,
}

/**
 * Mock unauthenticated state
 */
export const mockNoUser = null

/**
 * Mock auth state
 */
let currentMockUser: Partial<User> | null = mockAdminUser

export function setMockUser(user: Partial<User> | null) {
  currentMockUser = user
}

export function getMockUser() {
  return currentMockUser
}

/**
 * Mock sign in function
 */
export const mockSignIn = vi.fn().mockImplementation(async () => {
  setMockUser(mockAdminUser)
})

/**
 * Mock sign out function
 */
export const mockSignOut = vi.fn().mockImplementation(async () => {
  setMockUser(null)
})

/**
 * Mock auth context value
 */
export function createMockAuthValue(user: Partial<User> | null = mockAdminUser) {
  return {
    user: user as User | null,
    loading: false,
    error: null,
    signIn: mockSignIn,
    signOut: mockSignOut,
    isAuthenticated: user !== null,
  }
}

/**
 * Mock loading auth context
 */
export const mockLoadingAuthValue = {
  user: null,
  loading: true,
  error: null,
  signIn: mockSignIn,
  signOut: mockSignOut,
  isAuthenticated: false,
}

/**
 * Mock error auth context
 */
export function createMockErrorAuthValue(error: Error) {
  return {
    user: null,
    loading: false,
    error,
    signIn: mockSignIn,
    signOut: mockSignOut,
    isAuthenticated: false,
  }
}
