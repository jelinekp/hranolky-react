import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ContentLayoutContainer from '../../components/ContentLayoutContainer'
import { mockHranolkySlots } from '../mocks/mockSlots'
import { SlotType } from 'hranolky-firestore-common'

// Mock the volume history hook
vi.mock('../../hooks/useFetchFilteredVolumeHistory', () => ({
  useFetchFilteredVolumeHistory: vi.fn().mockReturnValue({
    volumeData: [
      { week: '25_27', volume: 45.5 },
      { week: '25_28', volume: 48.2 },
    ],
    loading: false
  })
}))

// Mock the slot actions hook  
vi.mock('../../hooks/useFetchSlotActions', () => ({
  useFetchSlotActions: vi.fn().mockReturnValue({
    slotActions: [],
    loading: false
  })
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  )
}

describe('Filtering Flow Integration', () => {
  const defaultProps = {
    warehouseSlots: mockHranolkySlots,
    loading: false,
    slotType: SlotType.Beam,
    devices: new Map<string, string | null>()
  }

  describe('filter interactions', () => {
    it('renders filters and table together', () => {
      renderWithRouter(<ContentLayoutContainer {...defaultProps} />)

      // Check filters section exists
      expect(screen.getByText('Filtry')).toBeInTheDocument()

      // Check table exists
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('shows reset filters button', () => {
      renderWithRouter(<ContentLayoutContainer {...defaultProps} />)

      expect(screen.getByText('Resetovat všechny filtry')).toBeInTheDocument()
    })

    it('shows export button', () => {
      renderWithRouter(<ContentLayoutContainer {...defaultProps} />)

      const exportButton = screen.getByText(/Exportovat historii stavů/)
      expect(exportButton).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      renderWithRouter(
        <ContentLayoutContainer
          {...defaultProps}
          loading={true}
        />
      )

      // Should show loading skeleton instead of table
      // The skeleton has animate-pulse class
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('chart integration', () => {
    it('displays volume chart with current volume', () => {
      renderWithRouter(<ContentLayoutContainer {...defaultProps} />)

      expect(screen.getByText('Objem v čase po týdnech (m³)')).toBeInTheDocument()
      expect(screen.getByText('Aktuální objem na skladě:')).toBeInTheDocument()
    })
  })
})
