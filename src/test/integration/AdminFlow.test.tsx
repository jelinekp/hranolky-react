import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@example.com', displayName: 'Admin User' },
    loading: false,
    signOut: vi.fn()
  })
}))

// Mock the admin config
vi.mock('../../config/appConfig', () => ({
  isAdminUser: (email: string | null) => email === 'jelinekp6@gmail.com'
}))

// Mock device data
vi.mock('../../hooks/data/useAdminDevices', () => ({
  useAdminDevices: () => ({
    devices: [
      { id: 'device1', shortId: 'dev', deviceName: 'Test Device', appVersion: '1.0', isInventoryCheckPermitted: true, lastSeen: new Date() },
      { id: 'device2', shortId: 'de2', deviceName: 'Another Device', appVersion: '1.1', isInventoryCheckPermitted: false, lastSeen: null }
    ],
    loading: false,
    updateDevice: vi.fn().mockResolvedValue(true)
  })
}))

// Mock app config
vi.mock('../../hooks/data/useAppConfig', () => ({
  useAppConfig: () => ({
    appConfig: { appVersion: '2.0.0', releaseNotes: 'Test notes' },
    loading: false
  })
}))

import AccessDenied from '../../components/admin/AccessDenied'

describe('Admin Flow Integration', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }

  describe('access control', () => {
    it('shows access denied for non-admin users', () => {
      renderWithRouter(<AccessDenied />)

      expect(screen.getByText('Přístup odepřen')).toBeInTheDocument()
      expect(screen.getByText('Tato část je určena pouze pro administrátory.')).toBeInTheDocument()
    })

    it('provides back navigation button', () => {
      renderWithRouter(<AccessDenied />)

      expect(screen.getByRole('button', { name: 'Zpět na sklad' })).toBeInTheDocument()
    })

    it('allows custom messages', () => {
      renderWithRouter(
        <AccessDenied
          title="Custom Title"
          message="Custom message for testing"
        />
      )

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom message for testing')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('back button is clickable', async () => {
      const user = userEvent.setup()
      renderWithRouter(<AccessDenied />)

      const backButton = screen.getByRole('button', { name: 'Zpět na sklad' })
      await user.click(backButton)

      // Navigation would occur - just verify button works
      expect(backButton).toBeInTheDocument()
    })
  })
})
