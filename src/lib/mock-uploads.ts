// Shared mock uploads data
import { getMockData, saveMockData, initializeMockStorage } from './mock-storage';

// Initialize storage on module load
if (typeof window !== 'undefined') {
  initializeMockStorage();
}

// Type definitions
interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
  template: {
    name: string;
    financialYear: string;
  };
}

// Get uploads from localStorage or use default
let mockUploads: Upload[] = getMockData('UPLOADS');

// Function to sync data to localStorage
function syncToStorage() {
  saveMockData('UPLOADS', mockUploads);
}

// Function to add new upload
export function addMockUpload(upload: Partial<Upload>): Upload {
  const newUpload: Upload = {
    id: (mockUploads.length + 1).toString(),
    fileName: "",
    fileUrl: "",
    fileSize: 0,
    financialYear: "",
    status: "PENDING",
    userId: "",
    templateId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: "",
      name: "",
      username: ""
    },
    template: {
      name: "",
      financialYear: ""
    },
    ...upload
  };
  mockUploads.push(newUpload);
  syncToStorage();
  return newUpload;
}

// Function to get all uploads
export function getAllUploads(): Upload[] {
  // Refresh from localStorage in case it was updated elsewhere
  mockUploads = getMockData('UPLOADS');
  return mockUploads;
}

// Function to get uploads by user ID
export function getUploadsByUserId(userId: string): Upload[] {
  // Refresh from localStorage
  mockUploads = getMockData('UPLOADS');
  return mockUploads.filter((upload: Upload) => upload.userId === userId);
}

// Function to update upload status
export function updateUploadStatus(id: string, status: string): Upload | null {
  // Refresh from localStorage
  mockUploads = getMockData('UPLOADS');
  const uploadIndex = mockUploads.findIndex((upload: Upload) => upload.id === id);
  if (uploadIndex !== -1) {
    mockUploads[uploadIndex].status = status;
    mockUploads[uploadIndex].updatedAt = new Date().toISOString();
    syncToStorage();
    return mockUploads[uploadIndex];
  }
  return null;
}
