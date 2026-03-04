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
    (useUserManagement as any).mockReturnValue({
      admins: ['admin1@test.com'],
      allowedUsers: ['user1@test.com'],
      loading: false,
      addUser: mockAddUser,
      removeUser: mockRemoveUser
    });
    (useAuth as any).mockReturnValue({ user: { email: 'current@test.com' } });
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

    const addButton = screen.getAllByRole('button').find(b => b.querySelector('svg[data-icon="plus"]'));
    // Since plus icon might be harder to find by role, let's use the first form submit
    const forms = screen.getAllByRole('form', { hidden: true }); // We added role="form" implicitly or via onSubmit
    // Actually our implementation doesn't have role="form" explicitly, but we can find the button

    const submitButtons = screen.getAllByRole('button');
    // The first plus button is for admins
    fireEvent.click(submitButtons[1]); // 0 is trash for admin1, 1 is plus for new admin

    await waitFor(() => {
      expect(mockAddUser).toHaveBeenCalledWith('Admins', 'new-admin@test.com');
    });
  });

  it('shows loading state', () => {
    (useUserManagement as any).mockReturnValue({
      admins: [],
      allowedUsers: [],
      loading: true,
      addUser: vi.fn(),
      removeUser: vi.fn()
    });

    render(<UserManagement />);
    expect(screen.queryByText('Administrátoři')).not.toBeInTheDocument();
    // Check for spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
