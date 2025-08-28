// Shared mock templates data
export let mockTemplates = [
  {
    id: "1",
    name: "ESG Sustainability Report Template 2024",
    fileName: "esg-sustainability-template-2024.xlsx",
    fileUrl: "https://hub-qfqjta6xl-sinjinis-projects.vercel.app/templates/esg-sustainability-template-2024.xlsx",
    fileSize: 1024000,
    financialYear: "2024",
    description: "Comprehensive ESG (Environmental, Social, Governance) sustainability reporting template for 2024",
    isActive: true,
    uploadedBy: "1", // Admin's ID
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
];

// Function to add new template
export function addMockTemplate(template: any) {
  const newTemplate = {
    id: (mockTemplates.length + 1).toString(),
    ...template,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockTemplates.push(newTemplate);
  return newTemplate;
}

// Function to get all active templates
export function getAllTemplates() {
  return mockTemplates.filter(template => template.isActive);
}

// Function to get template by ID
export function getTemplateById(id: string) {
  return mockTemplates.find(template => template.id === id);
}

// Function to update template
export function updateMockTemplate(id: string, updates: any) {
  const templateIndex = mockTemplates.findIndex(template => template.id === id);
  if (templateIndex !== -1) {
    mockTemplates[templateIndex] = {
      ...mockTemplates[templateIndex],
      ...updates,
      updatedAt: new Date()
    };
    return mockTemplates[templateIndex];
  }
  return null;
}

// Function to delete template
export function deleteMockTemplate(id: string) {
  const templateIndex = mockTemplates.findIndex(template => template.id === id);
  if (templateIndex !== -1) {
    const deletedTemplate = mockTemplates.splice(templateIndex, 1)[0];
    return deletedTemplate;
  }
  return null;
}
