import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportDialog from './ExportDialog'

describe('ExportDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onExportExcel: vi.fn(),
    onCopyToClipboard: vi.fn(),
    isExporting: false,
    isCopying: false,
    itemCount: 50,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders when open', () => {
      render(<ExportDialog {...defaultProps} />)

      expect(screen.getByText('Exportovat historii stavů')).toBeInTheDocument()
      expect(screen.getByText('Stáhnout jako Excel')).toBeInTheDocument()
      expect(screen.getByText('Kopírovat pro Excel')).toBeInTheDocument()
      expect(screen.getByText('Zrušit')).toBeInTheDocument()
    })

    it('renders nothing when closed', () => {
      render(<ExportDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Exportovat historii stavů')).not.toBeInTheDocument()
    })

    it('shows warning for large item count', () => {
      render(<ExportDialog {...defaultProps} itemCount={150} />)

      expect(screen.getByText(/Export může trvat déle/)).toBeInTheDocument()
    })

    it('does not show warning for small item count', () => {
      render(<ExportDialog {...defaultProps} itemCount={50} />)

      expect(screen.queryByText(/Export může trvat déle/)).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onExportExcel and onClose when Excel button clicked', async () => {
      const user = userEvent.setup()
      const onExportExcel = vi.fn()
      const onClose = vi.fn()

      render(
        <ExportDialog
          {...defaultProps}
          onExportExcel={onExportExcel}
          onClose={onClose}
        />
      )

      await user.click(screen.getByText('Stáhnout jako Excel'))

      expect(onClose).toHaveBeenCalled()
      expect(onExportExcel).toHaveBeenCalled()
    })

    it('calls onCopyToClipboard and onClose when copy button clicked', async () => {
      const user = userEvent.setup()
      const onCopyToClipboard = vi.fn()
      const onClose = vi.fn()

      render(
        <ExportDialog
          {...defaultProps}
          onCopyToClipboard={onCopyToClipboard}
          onClose={onClose}
        />
      )

      await user.click(screen.getByText('Kopírovat pro Excel'))

      expect(onClose).toHaveBeenCalled()
      expect(onCopyToClipboard).toHaveBeenCalled()
    })

    it('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByText('Zrušit'))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      // Click the backdrop (the outer fixed div)
      const backdrop = document.querySelector('.fixed.inset-0')
      if (backdrop) {
        await user.click(backdrop)
        expect(onClose).toHaveBeenCalled()
      }
    })
  })

  describe('disabled state', () => {
    it('disables buttons when exporting', () => {
      render(<ExportDialog {...defaultProps} isExporting={true} />)

      expect(screen.getByText('Stáhnout jako Excel').closest('button')).toBeDisabled()
      expect(screen.getByText('Kopírovat pro Excel').closest('button')).toBeDisabled()
    })

    it('disables buttons when copying', () => {
      render(<ExportDialog {...defaultProps} isCopying={true} />)

      expect(screen.getByText('Stáhnout jako Excel').closest('button')).toBeDisabled()
      expect(screen.getByText('Kopírovat pro Excel').closest('button')).toBeDisabled()
    })
  })
})
