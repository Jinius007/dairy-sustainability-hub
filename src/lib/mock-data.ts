// Mock data to replace Prisma database operations
export const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    username: "admin",
    role: "ADMIN",
    password: "hashed_password_here"
  },
  {
    id: "2", 
    name: "John Doe",
    username: "john",
    role: "USER",
    password: "hashed_password_here"
  },
  {
    id: "3",
    name: "Jane Smith", 
    username: "jane",
    role: "USER",
    password: "hashed_password_here"
  }
];

export const mockTemplates = [
  {
    id: "1",
    name: "Sustainability Report Template 2024",
    fileName: "sustainability-template-2024.xlsx",
    fileUrl: "/templates/sustainability-template-2024.xlsx",
    fileSize: 1024000,
    financialYear: "2024",
    description: "Template for 2024 sustainability reporting",
    isActive: true,
    uploadedBy: "1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "2",
    name: "Environmental Impact Assessment",
    fileName: "environmental-assessment-2024.xlsx", 
    fileUrl: "/templates/environmental-assessment-2024.xlsx",
    fileSize: 2048000,
    financialYear: "2024",
    description: "Environmental impact assessment template",
    isActive: true,
    uploadedBy: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  }
];

export const mockUploads = [
  {
    id: "1",
    fileName: "john-sustainability-2024.xlsx",
    fileUrl: "/uploads/john-sustainability-2024.xlsx",
    fileSize: 1536000,
    financialYear: "2024",
    status: "PENDING",
    userId: "2",
    templateId: "1",
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-08-20"),
    user: mockUsers[1],
    template: mockTemplates[0]
  }
];

export const mockReports = [
  {
    id: "1",
    reportName: "John Doe Sustainability Report 2024",
    fileUrl: "/reports/john-doe-report-2024.pdf",
    fileSize: 512000,
    financialYear: "2024",
    status: "DRAFT",
    userId: "2",
    uploadId: "1",
    generatedBy: "1",
    createdAt: new Date("2024-08-25"),
    updatedAt: new Date("2024-08-25"),
    user: mockUsers[1]
  }
];

export const mockDrafts = [
  {
    id: "1",
    userId: "2",
    uploadedTemplateId: "1",
    draftNumber: 1,
    draftType: "USER",
    fileName: "draft-1-user.xlsx",
    fileUrl: "/drafts/draft-1-user.xlsx",
    fileSize: 1024000,
    financialYear: "2024",
    isFinal: false,
    status: "DRAFT",
    createdAt: new Date("2024-08-26"),
    updatedAt: new Date("2024-08-26"),
    user: mockUsers[1]
  }
];

export const mockActivityLogs = [
  {
    id: "1",
    action: "LOGIN",
    details: "User logged in",
    userId: "2",
    createdAt: new Date("2024-08-26T10:00:00Z"),
    user: mockUsers[1]
  },
  {
    id: "2", 
    action: "UPLOAD_TEMPLATE",
    details: "Uploaded sustainability template",
    userId: "1",
    createdAt: new Date("2024-08-26T09:30:00Z"),
    user: mockUsers[0]
  },
  {
    id: "3",
    action: "UPLOAD_DATA", 
    details: "Uploaded filled template data",
    userId: "2",
    createdAt: new Date("2024-08-26T09:00:00Z"),
    user: mockUsers[1]
  }
];

// Mock authentication function
export const authenticateUser = (username: string, password: string) => {
  console.log("Authenticating user:", username);
  const user = mockUsers.find(u => u.username === username);
  if (user && password === "password") { // Simple password check for demo
    console.log("Authentication successful for:", username);
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    };
  }
  console.log("Authentication failed for:", username);
  return null;
};

// Mock data access functions
export const getUsers = () => mockUsers.map(({ password, ...user }) => user);
export const getTemplates = () => mockTemplates;
export const getUploads = (userId?: string) => {
  if (userId) {
    return mockUploads.filter(upload => upload.userId === userId);
  }
  return mockUploads;
};
export const getReports = (userId?: string) => {
  if (userId) {
    return mockReports.filter(report => report.userId === userId);
  }
  return mockReports;
};
export const getDrafts = (userId?: string) => {
  if (userId) {
    return mockDrafts.filter(draft => draft.userId === userId);
  }
  return mockDrafts;
};
export const getActivityLogs = (userId?: string) => {
  if (userId) {
    return mockActivityLogs.filter(log => log.userId === userId);
  }
  return mockActivityLogs;
};

