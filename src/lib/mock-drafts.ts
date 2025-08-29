// Shared mock drafts data for back-and-forth draft process
import { getMockData, saveMockData, initializeMockStorage } from './mock-storage';

// Initialize storage on module load
if (typeof window !== 'undefined') {
  initializeMockStorage();
}

// Type definitions
interface Draft {
  id: string;
  draftNumber: number;
  draftType: "ADMIN_TO_USER" | "USER_TO_ADMIN";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  status: string;
  userId: string;
  templateId: string;
  uploadId: string;
  comments: string;
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
  originalUpload: {
    fileName: string;
    uploadedAt: string;
  };
}

// Get drafts from localStorage or use default
let mockDrafts: Draft[] = getMockData('DRAFTS');

// Function to sync data to localStorage
function syncToStorage() {
  saveMockData('DRAFTS', mockDrafts);
}

// Function to add new draft
export function addMockDraft(draft: Partial<Draft>): Draft {
  const newDraft: Draft = {
    id: (mockDrafts.length + 1).toString(),
    draftNumber: 1,
    draftType: "ADMIN_TO_USER",
    fileName: "",
    fileUrl: "",
    fileSize: 0,
    financialYear: "",
    status: "PENDING_REVIEW",
    userId: "",
    templateId: "",
    uploadId: "",
    comments: "",
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
    originalUpload: {
      fileName: "",
      uploadedAt: new Date().toISOString()
    },
    ...draft
  };
  mockDrafts.push(newDraft);
  syncToStorage();
  return newDraft;
}

// Function to get all drafts
export function getAllDrafts(): Draft[] {
  // Refresh from localStorage in case it was updated elsewhere
  mockDrafts = getMockData('DRAFTS');
  return mockDrafts;
}

// Function to get drafts by user ID
export function getDraftsByUserId(userId: string): Draft[] {
  // Refresh from localStorage
  mockDrafts = getMockData('DRAFTS');
  return mockDrafts.filter((draft: Draft) => draft.userId === userId);
}

// Function to get drafts by upload ID (to see all drafts related to one user upload)
export function getDraftsByUploadId(uploadId: string): Draft[] {
  // Refresh from localStorage
  mockDrafts = getMockData('DRAFTS');
  return mockDrafts.filter((draft: Draft) => draft.uploadId === uploadId);
}

// Function to update draft status
export function updateDraftStatus(id: string, status: string, comments?: string): Draft | null {
  // Refresh from localStorage
  mockDrafts = getMockData('DRAFTS');
  const draftIndex = mockDrafts.findIndex((draft: Draft) => draft.id === id);
  if (draftIndex !== -1) {
    mockDrafts[draftIndex].status = status;
    mockDrafts[draftIndex].updatedAt = new Date().toISOString();
    if (comments) {
      mockDrafts[draftIndex].comments = comments;
    }
    syncToStorage();
    return mockDrafts[draftIndex];
  }
  return null;
}

// Function to mark draft as final
export function markDraftAsFinal(id: string): Draft | null {
  // Refresh from localStorage
  mockDrafts = getMockData('DRAFTS');
  const draftIndex = mockDrafts.findIndex((draft: Draft) => draft.id === id);
  if (draftIndex !== -1) {
    mockDrafts[draftIndex].status = "FINAL";
    mockDrafts[draftIndex].updatedAt = new Date().toISOString();
    syncToStorage();
    return mockDrafts[draftIndex];
  }
  return null;
}

// Function to get next draft number for a user
export function getNextDraftNumber(userId: string): number {
  const userDrafts = getDraftsByUserId(userId);
  if (userDrafts.length === 0) return 1;
  return Math.max(...userDrafts.map((d: Draft) => d.draftNumber)) + 1;
}

// Function to get next draft number for a specific upload (to maintain sequence)
export function getNextDraftNumberForUpload(uploadId: string): number {
  const uploadDrafts = getDraftsByUploadId(uploadId);
  if (uploadDrafts.length === 0) return 1;
  return Math.max(...uploadDrafts.map((d: Draft) => d.draftNumber)) + 1;
}

// Function to check if a draft can be marked as final (only recipient can mark as final)
export function canMarkAsFinal(draft: Draft, currentUserId?: string): boolean {
  // Only recipient can mark as final
  if (draft.draftType === "USER_TO_ADMIN") {
    // User sent to admin - only admin can mark as final
    return draft.status === "PENDING_REVIEW" && currentUserId === "1"; // Admin ID is "1"
  } else if (draft.draftType === "ADMIN_TO_USER") {
    // Admin sent to user - only user can mark as final
    return draft.status === "PENDING_REVIEW" && currentUserId === draft.userId;
  }
  return false;
}
