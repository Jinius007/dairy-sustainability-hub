// Shared mock drafts data for back-and-forth draft process
export let mockDrafts = [
  // Example draft from admin to user
  {
    id: "1",
    draftNumber: 1,
    draftType: "ADMIN_TO_USER", // or "USER_TO_ADMIN"
    fileName: "john-draft-report-v1.xlsx",
    fileUrl: "https://hub-hk1bvewws-sinjinis-projects.vercel.app/drafts/john-draft-report-v1.xlsx",
    fileSize: 2048000,
    financialYear: "2024",
    status: "PENDING_REVIEW", // PENDING_REVIEW, APPROVED, REJECTED, FINAL
    userId: "2", // John's ID
    templateId: "1",
    uploadId: "1", // Reference to original user upload
    comments: "Initial draft based on your sustainability data. Please review and provide feedback.",
    createdAt: new Date("2024-08-22"),
    updatedAt: new Date("2024-08-22"),
    user: {
      id: "2",
      name: "John Doe",
      username: "john"
    },
    template: {
      name: "ESG Sustainability Report Template 2024",
      financialYear: "2024"
    },
    originalUpload: {
      fileName: "john-sustainability-2024.xlsx",
      uploadedAt: new Date("2024-08-20")
    }
  },
  // Example user response to admin draft
  {
    id: "2",
    draftNumber: 2,
    draftType: "USER_TO_ADMIN",
    fileName: "john-draft-response-v2.xlsx",
    fileUrl: "https://hub-hk1bvewws-sinjinis-projects.vercel.app/drafts/john-draft-response-v2.xlsx",
    fileSize: 2150400,
    financialYear: "2024",
    status: "PENDING_REVIEW",
    userId: "2", // John's ID
    templateId: "1",
    uploadId: "1", // Reference to original user upload
    comments: "Updated sections 3 and 5 as requested. Please review the changes.",
    createdAt: new Date("2024-08-23"),
    updatedAt: new Date("2024-08-23"),
    user: {
      id: "2",
      name: "John Doe",
      username: "john"
    },
    template: {
      name: "ESG Sustainability Report Template 2024",
      financialYear: "2024"
    },
    originalUpload: {
      fileName: "john-sustainability-2024.xlsx",
      uploadedAt: new Date("2024-08-20")
    }
  }
];

// Function to add new draft
export function addMockDraft(draft: any) {
  const newDraft = {
    id: (mockDrafts.length + 1).toString(),
    ...draft,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockDrafts.push(newDraft);
  return newDraft;
}

// Function to get all drafts
export function getAllDrafts() {
  return mockDrafts;
}

// Function to get drafts by user ID
export function getDraftsByUserId(userId: string) {
  return mockDrafts.filter(draft => draft.userId === userId);
}

// Function to get drafts by upload ID (to see all drafts related to one user upload)
export function getDraftsByUploadId(uploadId: string) {
  return mockDrafts.filter(draft => draft.uploadId === uploadId);
}

// Function to update draft status
export function updateDraftStatus(id: string, status: string, comments?: string) {
  const draftIndex = mockDrafts.findIndex(draft => draft.id === id);
  if (draftIndex !== -1) {
    mockDrafts[draftIndex].status = status;
    mockDrafts[draftIndex].updatedAt = new Date();
    if (comments) {
      mockDrafts[draftIndex].comments = comments;
    }
    return mockDrafts[draftIndex];
  }
  return null;
}

// Function to get next draft number for a user
export function getNextDraftNumber(userId: string) {
  const userDrafts = getDraftsByUserId(userId);
  if (userDrafts.length === 0) return 1;
  return Math.max(...userDrafts.map(d => d.draftNumber)) + 1;
}
