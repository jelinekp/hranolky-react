import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportDialog from '../../components/export/ExportDialog'

describe('Export Flow Integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onExportCsv: vi.fn(),
    onCopyToClipboard: vi.fn(),
    isExporting: false,
    isCopying: false,
    itemCount: 42
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('dialog visibility', () => {
    it('renders when isOpen is true', () => {
      render(<ExportDialog {...defaultProps} />)

      expect(screen.getByText(/Exportovat historii/)).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ExportDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText(/Exportovat/)).not.toBeInTheDocument()
    })
  })

  describe('export actions', () => {
    it('calls onExportCsv when export button clicked', async () => {
      const user = userEvent.setup()
      const onExportCsv = vi.fn()

      render(<ExportDialog {...defaultProps} onExportCsv={onExportCsv} />)

      const exportButton = screen.getByRole('button', { name: /Stáhnout jako CSV/ })
      await user.click(exportButton)

      expect(onExportCsv).toHaveBeenCalledTimes(1)
    })

    it('calls onCopyToClipboard when copy button clicked', async () => {
      const user = userEvent.setup()
      const onCopyToClipboard = vi.fn()

      render(<ExportDialog {...defaultProps} onCopyToClipboard={onCopyToClipboard} />)

      const copyButton = screen.getByRole('button', { name: /Kopírovat pro Excel/ })
      await user.click(copyButton)

      expect(onCopyToClipboard).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<ExportDialog {...defaultProps} onClose={onClose} />)

      const cancelButton = screen.getByRole('button', { name: /Zrušit/ })
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('large dataset warning', () => {
    it('shows warning for large item counts', () => {
      render(<ExportDialog {...defaultProps} itemCount={150} />)

      expect(screen.getByText(/Export může trvat déle/)).toBeInTheDocument()
    })

    it('does not show warning for small item counts', () => {
      render(<ExportDialog {...defaultProps} itemCount={50} />)

      expect(screen.queryByText(/Export může trvat déle/)).not.toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables buttons when exporting', () => {
      render(<ExportDialog {...defaultProps} isExporting={true} />)

      const csvButton = screen.getByRole('button', { name: /Stáhnout jako CSV/ })
      expect(csvButton).toBeDisabled()
    })

    it('disables buttons when copying', () => {
      render(<ExportDialog {...defaultProps} isCopying={true} />)

      const copyButton = screen.getByRole('button', { name: /Kopírovat pro Excel/ })
      expect(copyButton).toBeDisabled()
    })
  })
})
