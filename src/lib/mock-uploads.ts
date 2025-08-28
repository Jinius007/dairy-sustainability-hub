// Shared mock uploads data
export let mockUploads = [
  // John's upload
  {
    id: "1",
    fileName: "john-sustainability-2024.xlsx",
    fileUrl: "https://hub-qfqjta6xl-sinjinis-projects.vercel.app/uploads/john-sustainability-2024.xlsx",
    fileSize: 1536000,
    financialYear: "2024",
    status: "PENDING",
    userId: "2", // John's ID
    templateId: "1",
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-08-20"),
    user: {
      id: "2",
      name: "John Doe",
      username: "john"
    },
    template: {
      name: "ESG Sustainability Report Template 2024",
      financialYear: "2024"
    }
  },
  // Jane's upload
  {
    id: "2",
    fileName: "jane-sustainability-2024.xlsx",
    fileUrl: "https://hub-qfqjta6xl-sinjinis-projects.vercel.app/uploads/jane-sustainability-2024.xlsx",
    fileSize: 2048000,
    financialYear: "2024",
    status: "APPROVED",
    userId: "3", // Jane's ID
    templateId: "1",
    createdAt: new Date("2024-08-21"),
    updatedAt: new Date("2024-08-21"),
    user: {
      id: "3",
      name: "Jane Smith",
      username: "jane"
    },
    template: {
      name: "ESG Sustainability Report Template 2024",
      financialYear: "2024"
    }
  }
];

// Function to add new upload
export function addMockUpload(upload: any) {
  const newUpload = {
    id: (mockUploads.length + 1).toString(),
    ...upload,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockUploads.push(newUpload);
  return newUpload;
}

// Function to get all uploads
export function getAllUploads() {
  return mockUploads;
}

// Function to update upload status
export function updateUploadStatus(id: string, status: string) {
  const uploadIndex = mockUploads.findIndex(upload => upload.id === id);
  if (uploadIndex !== -1) {
    mockUploads[uploadIndex].status = status;
    mockUploads[uploadIndex].updatedAt = new Date();
    return mockUploads[uploadIndex];
  }
  return null;
}
