import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from './UserManagement';
import { useUserManagement } from '../../hooks/data/useUserManagement';
import { useAuth } from '../../contexts/AuthContext';

// Mock hooks
vi.mock('../../hooks/data/useUserManagement', () => ({
  useUserManagement: vi.fn()
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('UserManagement Component', () => {
  const mockAddUser = vi.fn();
  const mockRemoveUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserManagement).mockReturnValue({
      admins: ['admin1@test.com'],
      allowedUsers: ['user1@test.com'],
      loading: false,
      error: null,
      addUser: mockAddUser,
      removeUser: mockRemoveUser
    });
    vi.mocked(useAuth).mockReturnValue({ user: { email: 'current@test.com' } } as ReturnType<typeof useAuth>);
  });

  it('renders existing users', () => {
    render(<UserManagement />);
    expect(screen.getByText('admin1@test.com')).toBeInTheDocument();
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
  });

  it('calls addUser when form submitted', async () => {
    render(<UserManagement />);

    const adminInput = screen.getByPlaceholderText('Email admina');
    fireEvent.change(adminInput, { target: { value: 'new-admin@test.com' } });

    // Find the submit button for the admin form

    const submitButtons = screen.getAllByRole('button');
    // The first plus button is for admins
    fireEvent.click(submitButtons[1]); // 0 is trash for admin1, 1 is plus for new admin

    await waitFor(() => {
      expect(mockAddUser).toHaveBeenCalledWith('Admins', 'new-admin@test.com');
    });
  });

  it('shows loading state', () => {
    vi.mocked(useUserManagement).mockReturnValue({
      admins: [],
      allowedUsers: [],
      loading: true,
      error: null,
      addUser: vi.fn(),
      removeUser: vi.fn()
    });

    render(<UserManagement />);
    expect(screen.queryByText('Administrátoři')).not.toBeInTheDocument();
    // Check for spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
