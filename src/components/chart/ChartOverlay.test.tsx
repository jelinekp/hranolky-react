import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoMatchOverlay, ManualLoadOverlay } from './ChartOverlay'

describe('ChartOverlay', () => {
  describe('NoMatchOverlay', () => {
    it('renders default message', () => {
      render(<NoMatchOverlay />)

      expect(screen.getByText('Pro zobrazení dat zvolte jinou kombinaci filtrů')).toBeInTheDocument()
    })

    it('renders custom message', () => {
      render(<NoMatchOverlay message="Custom no match message" />)

      expect(screen.getByText('Custom no match message')).toBeInTheDocument()
    })
  })

  describe('ManualLoadOverlay', () => {
    it('renders item count', () => {
      render(<ManualLoadOverlay itemCount={42} onLoad={() => { }} />)

      expect(screen.getByText(/42/)).toBeInTheDocument()
    })

    it('renders load button', () => {
      render(<ManualLoadOverlay itemCount={10} onLoad={() => { }} />)

      expect(screen.getByRole('button', { name: 'Načíst data pro vyfiltrované položky' })).toBeInTheDocument()
    })

    it('calls onLoad when button clicked', async () => {
      const user = userEvent.setup()
      const onLoad = vi.fn()

      render(<ManualLoadOverlay itemCount={10} onLoad={onLoad} />)

      await user.click(screen.getByRole('button'))
      expect(onLoad).toHaveBeenCalledTimes(1)
    })

    it('uses custom button label', () => {
      render(<ManualLoadOverlay itemCount={10} onLoad={() => { }} buttonLabel="Load Data" />)

      expect(screen.getByRole('button', { name: 'Load Data' })).toBeInTheDocument()
    })
  })
})
