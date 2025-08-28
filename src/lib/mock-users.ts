// Shared mock users data
export let mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    password: 'password',
    role: 'ADMIN',
  },
  {
    id: '2',
    name: 'John Doe',
    username: 'john',
    password: 'password',
    role: 'USER',
  },
  {
    id: '3',
    name: 'Jane Smith',
    username: 'jane',
    password: 'password',
    role: 'USER',
  }
];

// Function to add new user
export function addMockUser(user: {
  name: string;
  username: string;
  password: string;
  role: string;
}) {
  const newUser = {
    id: (mockUsers.length + 1).toString(),
    ...user,
    role: user.role.toUpperCase()
  };
  mockUsers.push(newUser);
  return newUser;
}

// Function to find user by credentials
export function findUserByCredentials(username: string, password: string) {
  return mockUsers.find(u => 
    u.username === username && 
    u.password === password
  );
}

// Function to get all users (without passwords)
export function getAllUsers() {
  return mockUsers.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
}
