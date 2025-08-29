// Mock data persistence using localStorage
// This helps maintain data between sessions during development

const STORAGE_KEYS = {
  DRAFTS: 'hub_mock_drafts',
  UPLOADS: 'hub_mock_uploads',
  USERS: 'hub_mock_users',
  TEMPLATES: 'hub_mock_templates',
  ACTIVITY_LOGS: 'hub_mock_activity_logs'
};

// Initialize default data if localStorage is empty
export function initializeMockStorage() {
  if (typeof window === 'undefined') return; // Server-side, skip

  // Only initialize if no data exists
  if (!localStorage.getItem(STORAGE_KEYS.DRAFTS)) {
    const defaultDrafts = [
      {
        id: "1",
        draftNumber: 1,
        draftType: "ADMIN_TO_USER",
        fileName: "john-draft-report-v1.docx",
        fileUrl: "https://hub-hk1bvewws-sinjinis-projects.vercel.app/drafts/john-draft-report-v1.docx",
        fileSize: 2048000,
        financialYear: "2024",
        status: "PENDING_REVIEW",
        userId: "2",
        templateId: "1",
        uploadId: "1",
        comments: "Initial draft based on your sustainability data. Please review and provide feedback.",
        createdAt: new Date("2024-08-22").toISOString(),
        updatedAt: new Date("2024-08-22").toISOString(),
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
          uploadedAt: new Date("2024-08-20").toISOString()
        }
      },
      {
        id: "2",
        draftNumber: 2,
        draftType: "USER_TO_ADMIN",
        fileName: "john-draft-response-v2.docx",
        fileUrl: "https://hub-hk1bvewws-sinjinis-projects.vercel.app/drafts/john-draft-response-v2.docx",
        fileSize: 2150400,
        financialYear: "2024",
        status: "PENDING_REVIEW",
        userId: "2",
        templateId: "1",
        uploadId: "1",
        comments: "Updated sections 3 and 5 as requested. Please review the changes.",
        createdAt: new Date("2024-08-23").toISOString(),
        updatedAt: new Date("2024-08-23").toISOString(),
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
          uploadedAt: new Date("2024-08-20").toISOString()
        }
      },
      {
        id: "3",
        draftNumber: 1,
        draftType: "ADMIN_TO_USER",
        fileName: "jane-draft-report-v1.docx",
        fileUrl: "https://hub-hk1bvewws-sinjinis-projects.vercel.app/drafts/jane-draft-report-v1.docx",
        fileSize: 2252800,
        financialYear: "2024",
        status: "PENDING_REVIEW",
        userId: "3",
        templateId: "1",
        uploadId: "2",
        comments: "Initial draft based on your sustainability data. Please review and provide feedback.",
        createdAt: new Date("2024-08-24").toISOString(),
        updatedAt: new Date("2024-08-24").toISOString(),
        user: {
          id: "3",
          name: "Jane Smith",
          username: "jane"
        },
        template: {
          name: "ESG Sustainability Report Template 2024",
          financialYear: "2024"
        },
        originalUpload: {
          fileName: "jane-sustainability-2024.xlsx",
          uploadedAt: new Date("2024-08-21").toISOString()
        }
      }
    ];
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(defaultDrafts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.UPLOADS)) {
    const defaultUploads = [
      {
        id: "1",
        fileName: "john-sustainability-2024.xlsx",
        fileUrl: "https://hub-qfqjta6xl-sinjinis-projects.vercel.app/uploads/john-sustainability-2024.xlsx",
        fileSize: 1536000,
        financialYear: "2024",
        status: "APPROVED",
        userId: "2",
        templateId: "1",
        createdAt: new Date("2024-08-20").toISOString(),
        updatedAt: new Date("2024-08-20").toISOString(),
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
      {
        id: "2",
        fileName: "jane-sustainability-2024.xlsx",
        fileUrl: "https://hub-qfqjta6xl-sinjinis-projects.vercel.app/uploads/jane-sustainability-2024.xlsx",
        fileSize: 2048000,
        financialYear: "2024",
        status: "APPROVED",
        userId: "3",
        templateId: "1",
        createdAt: new Date("2024-08-21").toISOString(),
        updatedAt: new Date("2024-08-21").toISOString(),
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
    localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(defaultUploads));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: '1',
        name: 'Admin User',
        username: 'admin',
        password: 'password',
        role: 'ADMIN',
        createdAt: new Date("2024-01-01").toISOString(),
        updatedAt: new Date("2024-01-01").toISOString()
      },
      {
        id: '2',
        name: 'John Doe',
        username: 'john',
        password: 'password',
        role: 'USER',
        createdAt: new Date("2024-01-01").toISOString(),
        updatedAt: new Date("2024-01-01").toISOString()
      },
      {
        id: '3',
        name: 'Jane Smith',
        username: 'jane',
        password: 'password',
        role: 'USER',
        createdAt: new Date("2024-01-01").toISOString(),
        updatedAt: new Date("2024-01-01").toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize templates - start with no templates (empty array)
  if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
    const defaultTemplates: any[] = []; // No pre-existing templates
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(defaultTemplates));
  }

  // Initialize activity logs - start with empty array
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
    const defaultActivityLogs: any[] = []; // No pre-existing activity logs
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(defaultActivityLogs));
  }
}

// Get data from localStorage
export function getMockData(key: keyof typeof STORAGE_KEYS) {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
}

// Save data to localStorage
export function saveMockData(key: keyof typeof STORAGE_KEYS, data: any) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Clear all mock data (for testing)
export function clearMockData() {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
