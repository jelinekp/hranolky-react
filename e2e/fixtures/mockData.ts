/**
 * E2E Test Fixtures
 * 
 * Mock data and authentication for Playwright tests.
 * Uses mock Google OAuth and sample Firestore data.
 */

// Mock authenticated user
export const mockUser = {
  email: 'jelinekp6@gmail.com',
  displayName: 'Pavel Jelínek',
  uid: 'test-user-123',
  photoURL: null,
};

// Mock admin user
export const mockAdminUser = {
  email: 'jelinekp6@gmail.com',
  displayName: 'Admin User',
  uid: 'admin-user-123',
  photoURL: null,
};

// Mock non-admin user
export const mockRegularUser = {
  email: 'user@example.com',
  displayName: 'Regular User',
  uid: 'regular-user-456',
  photoURL: null,
};

// Sample warehouse slots data
export const mockSlots = [
  {
    id: 'DUB-A-40x100x2000-001',
    productId: 'DUB-A-40x100x2000-001',
    quality: 'DUB-A',
    thickness: 40,
    width: 100,
    length: 2000,
    quantity: 15,
    lastSlotAction: 'NASKLADNENI',
    lastSlotQuantityChange: 5,
  },
  {
    id: 'DUB-R-50x120x1800-002',
    productId: 'DUB-R-50x120x1800-002',
    quality: 'DUB-R',
    thickness: 50,
    width: 120,
    length: 1800,
    quantity: 8,
    lastSlotAction: 'VYSKLADNENI',
    lastSlotQuantityChange: -3,
  },
  {
    id: 'ZIR-ZIR-27x80x2400-003',
    productId: 'ZIR-ZIR-27x80x2400-003',
    quality: 'ZIR-ZIR',
    thickness: 27,
    width: 80,
    length: 2400,
    quantity: 22,
    lastSlotAction: 'NASKLADNENI',
    lastSlotQuantityChange: 10,
  },
];

// Sample devices data for admin panel
export const mockDevices = [
  {
    id: 'device-abc123',
    shortId: 'abc',
    deviceName: 'Sklad Scanner 1',
    appVersion: '2.1.0',
    isInventoryCheckPermitted: true,
    lastSeen: new Date('2026-01-20T14:30:00Z'),
  },
  {
    id: 'device-def456',
    shortId: 'def',
    deviceName: 'Office Tablet',
    appVersion: '2.0.5',
    isInventoryCheckPermitted: false,
    lastSeen: new Date('2026-01-19T09:15:00Z'),
  },
];

// Sample volume history data
export const mockVolumeHistory = [
  { week: '2026_01', volume: 45.2 },
  { week: '2026_02', volume: 52.8 },
  { week: '2026_03', volume: 48.1 },
];
