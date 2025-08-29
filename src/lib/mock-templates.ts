// Shared mock templates data
import { getMockData, saveMockData, initializeMockStorage } from './mock-storage';

// Initialize storage on module load
if (typeof window !== 'undefined') {
  initializeMockStorage();
}

// Type definitions
interface Template {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  financialYear: string;
  description: string;
  isActive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  previousVersionId?: string; // Reference to the previous version that was deactivated
}

// Get templates from localStorage or use default
let mockTemplates: Template[] = getMockData('TEMPLATES');

// Function to sync data to localStorage
function syncToStorage() {
  saveMockData('TEMPLATES', mockTemplates);
}

// Function to add new template
export function addMockTemplate(template: Partial<Template>): Template {
  const newTemplate: Template = {
    id: (mockTemplates.length + 1).toString(),
    name: "",
    fileName: "",
    fileUrl: "",
    fileSize: 0,
    financialYear: "",
    description: "",
    isActive: true,
    uploadedBy: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    ...template
  };
  mockTemplates.push(newTemplate);
  syncToStorage();
  return newTemplate;
}

// Function to get all active templates
export function getAllTemplates(): Template[] {
  // Refresh from localStorage in case it was updated elsewhere
  mockTemplates = getMockData('TEMPLATES');
  return mockTemplates.filter(template => template.isActive);
}

// Function to get template by ID
export function getTemplateById(id: string): Template | undefined {
  // Refresh from localStorage
  mockTemplates = getMockData('TEMPLATES');
  return mockTemplates.find(template => template.id === id);
}

// Function to update template (creates new version and deactivates old one)
export function updateMockTemplate(id: string, updates: Partial<Template>): Template | null {
  // Refresh from localStorage
  mockTemplates = getMockData('TEMPLATES');
  const templateIndex = mockTemplates.findIndex(template => template.id === id);
  
  if (templateIndex !== -1) {
    const oldTemplate = mockTemplates[templateIndex];
    
    // Deactivate the old template
    mockTemplates[templateIndex].isActive = false;
    mockTemplates[templateIndex].updatedAt = new Date().toISOString();
    
    // Create new version of the template
    const newTemplate: Template = {
      ...oldTemplate,
      id: (mockTemplates.length + 1).toString(),
      version: oldTemplate.version + 1,
      previousVersionId: oldTemplate.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates
    };
    
    mockTemplates.push(newTemplate);
    syncToStorage();
    return newTemplate;
  }
  return null;
}

// Function to replace template (for file updates)
export function replaceMockTemplate(id: string, newFileData: Partial<Template>): Template | null {
  // Refresh from localStorage
  mockTemplates = getMockData('TEMPLATES');
  const templateIndex = mockTemplates.findIndex(template => template.id === id);
  
  if (templateIndex !== -1) {
    const oldTemplate = mockTemplates[templateIndex];
    
    // Deactivate the old template
    mockTemplates[templateIndex].isActive = false;
    mockTemplates[templateIndex].updatedAt = new Date().toISOString();
    
    // Create new version with updated file data
    const newTemplate: Template = {
      ...oldTemplate,
      id: (mockTemplates.length + 1).toString(),
      version: oldTemplate.version + 1,
      previousVersionId: oldTemplate.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newFileData
    };
    
    mockTemplates.push(newTemplate);
    syncToStorage();
    return newTemplate;
  }
  return null;
}

// Function to delete template (soft delete - sets as inactive)
export function deleteMockTemplate(id: string): Template | null {
  // Refresh from localStorage
  mockTemplates = getMockData('TEMPLATES');
  const templateIndex = mockTemplates.findIndex(template => template.id === id);
  if (templateIndex !== -1) {
    mockTemplates[templateIndex].isActive = false;
    mockTemplates[templateIndex].updatedAt = new Date().toISOString();
    syncToStorage();
    return mockTemplates[templateIndex];
  }
  return null;
}

// Function to get template history (all versions including inactive)
export function getTemplateHistory(financialYear: string): Template[] {
  // Refresh from localStorage
  mockTemplates = getMockData('TEMPLATES');
  return mockTemplates
    .filter(template => template.financialYear === financialYear)
    .sort((a, b) => b.version - a.version);
}

// Function to get latest active template for a financial year
export function getLatestActiveTemplate(financialYear: string): Template | undefined {
  // Refresh from localStorage
  mockTemplates = getMockData('TEMPLATES');
  return mockTemplates
    .filter(template => template.financialYear === financialYear && template.isActive)
    .sort((a, b) => b.version - a.version)[0];
}
