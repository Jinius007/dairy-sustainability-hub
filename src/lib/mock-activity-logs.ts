// Shared mock activity logs data
import { getMockData, saveMockData, initializeMockStorage } from './mock-storage';

// Initialize storage on module load
if (typeof window !== 'undefined') {
  initializeMockStorage();
}

// Type definitions
interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  action: string;
  description: string;
  resourceType: 'TEMPLATE' | 'UPLOAD' | 'DRAFT' | 'USER' | 'LOGIN' | 'LOGOUT';
  resourceId?: string;
  resourceName?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Get activity logs from localStorage or use default
let mockActivityLogs: ActivityLog[] = getMockData('ACTIVITY_LOGS');

// Function to sync data to localStorage
function syncToStorage() {
  saveMockData('ACTIVITY_LOGS', mockActivityLogs);
}

// Function to add new activity log
export function addActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): ActivityLog {
  const newLog: ActivityLog = {
    id: (mockActivityLogs.length + 1).toString(),
    ...log,
    createdAt: new Date().toISOString()
  };
  mockActivityLogs.push(newLog);
  syncToStorage();
  return newLog;
}

// Function to get all activity logs
export function getAllActivityLogs(): ActivityLog[] {
  // Refresh from localStorage
  mockActivityLogs = getMockData('ACTIVITY_LOGS');
  return mockActivityLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Function to get activity logs by user ID
export function getActivityLogsByUserId(userId: string): ActivityLog[] {
  // Refresh from localStorage
  mockActivityLogs = getMockData('ACTIVITY_LOGS');
  return mockActivityLogs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Function to get activity logs with filters
export function getFilteredActivityLogs(filters: {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  username?: string;
}): ActivityLog[] {
  // Refresh from localStorage
  mockActivityLogs = getMockData('ACTIVITY_LOGS');
  
  let filteredLogs = mockActivityLogs;

  if (filters.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
  }

  if (filters.username) {
    filteredLogs = filteredLogs.filter(log => 
      log.username.toLowerCase().includes(filters.username!.toLowerCase())
    );
  }

  if (filters.action) {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action);
  }

  if (filters.resourceType) {
    filteredLogs = filteredLogs.filter(log => log.resourceType === filters.resourceType);
  }

  if (filters.startDate) {
    filteredLogs = filteredLogs.filter(log => 
      new Date(log.createdAt) >= new Date(filters.startDate!)
    );
  }

  if (filters.endDate) {
    filteredLogs = filteredLogs.filter(log => 
      new Date(log.createdAt) <= new Date(filters.endDate!)
    );
  }

  return filteredLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Function to log user login
export function logUserLogin(userId: string, username: string, userRole: string, ipAddress?: string, userAgent?: string): ActivityLog {
  return addActivityLog({
    userId,
    username,
    userRole,
    action: 'LOGIN',
    description: `User ${username} logged in successfully`,
    resourceType: 'LOGIN',
    ipAddress,
    userAgent
  });
}

// Function to log user logout
export function logUserLogout(userId: string, username: string, userRole: string): ActivityLog {
  return addActivityLog({
    userId,
    username,
    userRole,
    action: 'LOGOUT',
    description: `User ${username} logged out`,
    resourceType: 'LOGOUT'
  });
}

// Function to log template actions
export function logTemplateAction(
  userId: string, 
  username: string, 
  userRole: string, 
  action: string, 
  templateId: string, 
  templateName: string,
  description?: string
): ActivityLog {
  return addActivityLog({
    userId,
    username,
    userRole,
    action,
    description: description || `${action} template: ${templateName}`,
    resourceType: 'TEMPLATE',
    resourceId: templateId,
    resourceName: templateName
  });
}

// Function to log upload actions
export function logUploadAction(
  userId: string, 
  username: string, 
  userRole: string, 
  action: string, 
  uploadId: string, 
  fileName: string,
  description?: string
): ActivityLog {
  return addActivityLog({
    userId,
    username,
    userRole,
    action,
    description: description || `${action} upload: ${fileName}`,
    resourceType: 'UPLOAD',
    resourceId: uploadId,
    resourceName: fileName
  });
}

// Function to log draft actions
export function logDraftAction(
  userId: string, 
  username: string, 
  userRole: string, 
  action: string, 
  draftId: string, 
  draftName: string,
  description?: string
): ActivityLog {
  return addActivityLog({
    userId,
    username,
    userRole,
    action,
    description: description || `${action} draft: ${draftName}`,
    resourceType: 'DRAFT',
    resourceId: draftId,
    resourceName: draftName
  });
}

// Function to log user management actions
export function logUserAction(
  userId: string, 
  username: string, 
  userRole: string, 
  action: string, 
  targetUserId: string, 
  targetUsername: string,
  description?: string
): ActivityLog {
  return addActivityLog({
    userId,
    username,
    userRole,
    action,
    description: description || `${action} user: ${targetUsername}`,
    resourceType: 'USER',
    resourceId: targetUserId,
    resourceName: targetUsername
  });
}

// Function to get activity statistics
export function getActivityStats(userId?: string) {
  // Refresh from localStorage
  mockActivityLogs = getMockData('ACTIVITY_LOGS');
  
  let logs = mockActivityLogs;
  if (userId) {
    logs = logs.filter(log => log.userId === userId);
  }

  const stats = {
    totalActions: logs.length,
    actionsByType: {} as Record<string, number>,
    actionsByResource: {} as Record<string, number>,
    recentActivity: logs.slice(0, 10)
  };

  logs.forEach(log => {
    // Count by action type
    stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
    
    // Count by resource type
    stats.actionsByResource[log.resourceType] = (stats.actionsByResource[log.resourceType] || 0) + 1;
  });

  return stats;
}
