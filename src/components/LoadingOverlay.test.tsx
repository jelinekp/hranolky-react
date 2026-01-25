import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingOverlay from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('renders when visible', () => {
    render(<LoadingOverlay isVisible={true} />)
    expect(screen.getByText('Načítání...')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} />)
    expect(screen.queryByText('Načítání...')).not.toBeInTheDocument()
  })

  it('displays custom message', () => {
    render(<LoadingOverlay isVisible={true} message="Custom loading..." />)
    expect(screen.getByText('Custom loading...')).toBeInTheDocument()
  })
})
