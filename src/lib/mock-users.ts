// Shared mock users data
import { getMockData, saveMockData, initializeMockStorage } from './mock-storage';

// Initialize storage on module load
if (typeof window !== 'undefined') {
  initializeMockStorage();
}

// Type definitions
interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Get users from localStorage or use default
let mockUsers: User[] = getMockData('USERS');

// Function to sync data to localStorage
function syncToStorage() {
  saveMockData('USERS', mockUsers);
}

// Function to add new user
export function addMockUser(user: {
  name: string;
  username: string;
  password: string;
  role: string;
}): User {
  // Check if username already exists
  const existingUser = mockUsers.find(u => u.username === user.username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    ...user,
    role: user.role.toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockUsers.push(newUser);
  syncToStorage();
  return newUser;
}

// Function to find user by credentials
export function findUserByCredentials(username: string, password: string): User | undefined {
  // Refresh from localStorage
  mockUsers = getMockData('USERS');
  return mockUsers.find(u => 
    u.username === username && 
    u.password === password
  );
}

// Function to get all users (without passwords)
export function getAllUsers(): Omit<User, 'password'>[] {
  // Refresh from localStorage
  mockUsers = getMockData('USERS');
  return mockUsers.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}

// Function to get user by ID
export function getUserById(id: string): Omit<User, 'password'> | undefined {
  // Refresh from localStorage
  mockUsers = getMockData('USERS');
  const user = mockUsers.find(u => u.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return undefined;
}

// Function to update user
export function updateMockUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  // Refresh from localStorage
  mockUsers = getMockData('USERS');
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    syncToStorage();
    return mockUsers[userIndex];
  }
  return null;
}

// Function to delete user
export function deleteMockUser(id: string): User | null {
  // Refresh from localStorage
  mockUsers = getMockData('USERS');
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    const deletedUser = mockUsers.splice(userIndex, 1)[0];
    syncToStorage();
    return deletedUser;
  }
  return null;
}
