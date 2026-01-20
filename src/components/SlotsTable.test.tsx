import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SlotsTable from './SlotsTable'
import { SlotFiltersClass } from '../model/SlotFilter'
import { SortingBy, SortingOrder } from '../model/Sorting'
import { mockHranolkySlots, mockEmptySlots } from '../test/mocks/mockSlots'
import { SlotType } from 'hranolky-firestore-common'

// Mock the useFetchSlotActions hook
vi.mock('../hooks/useFetchSlotActions', () => ({
  useFetchSlotActions: vi.fn().mockReturnValue({
    slotActions: [],
    loading: false
  })
}))

describe('SlotsTable', () => {
  const defaultProps = {
    warehouseSlots: mockHranolkySlots,
    activeFilters: SlotFiltersClass.EMPTY,
    sortingBy: SortingBy.quality,
    sortingOrder: SortingOrder.asc,
    setSortingByAndOrder: vi.fn(),
    devices: new Map<string, string | null>(),
    slotType: SlotType.Beam
  }

  describe('rendering', () => {
    it('renders table headers correctly', () => {
      render(<SlotsTable {...defaultProps} />)

      expect(screen.getByText('Kvalita')).toBeInTheDocument()
      expect(screen.getByText('Tloušť')).toBeInTheDocument()
      expect(screen.getByText('Šířka')).toBeInTheDocument()
      expect(screen.getByText('Délka')).toBeInTheDocument()
      expect(screen.getByText('Množst')).toBeInTheDocument()
      expect(screen.getByText('Objem m³')).toBeInTheDocument()
      expect(screen.getByText('Změněno')).toBeInTheDocument()
      expect(screen.getByText('Akce')).toBeInTheDocument()
      expect(screen.getByText('Změna')).toBeInTheDocument()
    })

    it('renders slot rows', () => {
      render(<SlotsTable {...defaultProps} />)

      // Check that some slot data is rendered
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Check row count text
      expect(screen.getByText(/řádků/)).toBeInTheDocument()
    })

    it('shows summary row with totals', () => {
      render(<SlotsTable {...defaultProps} />)

      // Check for "Součet:" text
      expect(screen.getByText('Součet:')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no slots and no filters', () => {
      render(
        <SlotsTable
          {...defaultProps}
          warehouseSlots={mockEmptySlots}
        />
      )

      expect(screen.getByText('Žádné sloty nenalezeny')).toBeInTheDocument()
    })

    it('shows filter message when no slots match filters', () => {
      const activeFilters = new SlotFiltersClass(
        new Set(),
        new Set(['NonExistent']),
        new Set(),
        new Set(),
        new Set(),
        new Set()
      )

      render(
        <SlotsTable
          {...defaultProps}
          warehouseSlots={mockEmptySlots}
          activeFilters={activeFilters}
        />
      )

      expect(screen.getByText('Žádné sloty nevyhovují zadaným filtrům')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('calls setSortingByAndOrder when header is clicked', async () => {
      const setSortingByAndOrder = vi.fn()
      const user = userEvent.setup()

      render(
        <SlotsTable
          {...defaultProps}
          setSortingByAndOrder={setSortingByAndOrder}
        />
      )

      // Click on a sortable header
      const qualityHeader = screen.getByText('Kvalita')
      await user.click(qualityHeader)

      expect(setSortingByAndOrder).toHaveBeenCalledWith(SortingBy.quality)
    })
  })
})
