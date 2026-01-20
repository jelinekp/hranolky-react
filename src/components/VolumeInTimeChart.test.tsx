import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import VolumeInTimeChart from './VolumeInTimeChart'
import { SlotType } from 'hranolky-firestore-common'
import { mockHranolkySlots, mockEmptySlots } from '../test/mocks/mockSlots'

// Mock the useFetchFilteredVolumeHistory hook
vi.mock('../hooks/useFetchFilteredVolumeHistory', () => ({
  useFetchFilteredVolumeHistory: vi.fn().mockReturnValue({
    volumeData: [
      { week: '25_27', volume: 45.5 },
      { week: '25_28', volume: 48.2 },
      { week: '25_29', volume: 46.8 },
    ],
    loading: false
  })
}))

describe('VolumeInTimeChart', () => {
  const defaultProps = {
    currentVolume: 52.35,
    slotType: SlotType.Beam,
    filteredSlots: mockHranolkySlots,
    hasActiveFilters: false
  }

  describe('rendering', () => {
    it('renders chart container', () => {
      render(<VolumeInTimeChart {...defaultProps} />)

      // Check for the chart title
      expect(screen.getByText('Objem v čase po týdnech (m³)')).toBeInTheDocument()
    })

    it('displays current volume in footer', () => {
      render(<VolumeInTimeChart {...defaultProps} />)

      expect(screen.getByText('Aktuální objem na skladě:')).toBeInTheDocument()
      expect(screen.getByText('52.35 m³')).toBeInTheDocument()
    })

    it('shows inventory check legend', () => {
      render(<VolumeInTimeChart {...defaultProps} />)

      expect(screen.getByText('Červené čáry značí provedené inventury')).toBeInTheDocument()
    })
  })

  describe('expand functionality', () => {
    it('has expand button', () => {
      render(<VolumeInTimeChart {...defaultProps} />)

      const expandButton = screen.getByTitle(/Rozbalit graf/)
      expect(expandButton).toBeInTheDocument()
    })
  })

  describe('filter states', () => {
    it('shows message when no slots match filters', () => {
      render(
        <VolumeInTimeChart
          {...defaultProps}
          filteredSlots={mockEmptySlots}
          hasActiveFilters={true}
        />
      )

      expect(screen.getByText('Pro zobrazení dat zvolte jinou kombinaci filtrů')).toBeInTheDocument()
    })

    it('shows manual load button for large filtered sets', () => {
      // Create a large set of mock slots (>10)
      const largeSlotSet = [...mockHranolkySlots, ...mockHranolkySlots, ...mockHranolkySlots]

      render(
        <VolumeInTimeChart
          {...defaultProps}
          filteredSlots={largeSlotSet}
          hasActiveFilters={true}
        />
      )

      // Should show manual load button when > 10 filtered slots with active filters
      expect(screen.getByText(/Zobrazeno/)).toBeInTheDocument()
      expect(screen.getByText('Načíst graf')).toBeInTheDocument()
    })
  })
})
