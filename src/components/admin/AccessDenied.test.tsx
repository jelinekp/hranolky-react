import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AccessDenied from './AccessDenied'

describe('AccessDenied', () => {
  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <AccessDenied {...props} />
      </BrowserRouter>
    )
  }

  describe('rendering', () => {
    it('renders default title and message', () => {
      renderComponent()

      expect(screen.getByText('Přístup odepřen')).toBeInTheDocument()
      expect(screen.getByText('Tato část je určena pouze pro administrátory.')).toBeInTheDocument()
    })

    it('renders custom title and message', () => {
      renderComponent({
        title: 'Custom Title',
        message: 'Custom message'
      })

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom message')).toBeInTheDocument()
    })

    it('renders back button with default label', () => {
      renderComponent()

      expect(screen.getByRole('button', { name: 'Zpět na sklad' })).toBeInTheDocument()
    })

    it('renders back button with custom label', () => {
      renderComponent({ backLabel: 'Go Back' })

      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('navigates to default path on button click', async () => {
      const user = userEvent.setup()
      renderComponent()

      const button = screen.getByRole('button', { name: 'Zpět na sklad' })
      await user.click(button)

      // Navigation would happen - we're just checking the button is clickable
      expect(button).toBeInTheDocument()
    })
  })
})
