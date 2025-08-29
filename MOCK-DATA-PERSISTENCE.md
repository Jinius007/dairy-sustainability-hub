# Mock Data Persistence Implementation

## Overview
This document explains the changes made to implement persistent mock data storage using localStorage to solve the data loss issues when logging out and back in, and to implement template versioning where old versions become inactive when replaced.

## Problems Solved

### 1. Jane's Draft Issue
- **Problem**: Jane (user ID "3") had no drafts in the mock data, so she couldn't see or respond to drafts
- **Solution**: Added a draft for Jane in the default mock data with:
  - Draft ID: "3"
  - User ID: "3" (Jane's ID)
  - Upload ID: "2" (Jane's upload)
  - Status: "PENDING_REVIEW"

### 2. Data Persistence Issue
- **Problem**: Mock data was stored in memory variables that got reset when the server restarted or when users logged out
- **Solution**: Implemented localStorage-based persistence system

### 3. Template Versioning Issue
- **Problem**: When admin updated a template, the old version remained visible to users
- **Solution**: Implemented template versioning system where:
  - Old templates become inactive when replaced
  - Only active templates are visible to users
  - Admin can view template history
  - Template replacement creates new versions

## Implementation Details

### New Files Created

#### 1. `src/lib/mock-storage.ts`
- Handles localStorage operations for mock data
- Provides functions to initialize, get, save, and clear mock data
- Includes default data for drafts, uploads, and users
- **NEW**: Templates start with empty array (no pre-existing templates)

#### 2. `src/components/providers/StorageInitializer.tsx`
- Client component that initializes mock storage on app load
- Added to the main layout to ensure storage is initialized

#### 3. `src/app/test-storage/page.tsx`
- Test page to verify storage functionality
- Shows current data in localStorage
- Provides buttons to refresh and clear data
- **NEW**: Includes templates display

### Updated Files

#### 1. `src/lib/mock-drafts.ts`
- Now uses localStorage for persistence
- Added TypeScript interfaces for better type safety
- All functions now sync data to localStorage

#### 2. `src/lib/mock-uploads.ts`
- Updated to use localStorage persistence
- Added TypeScript interfaces
- Maintains data between sessions

#### 3. `src/lib/mock-users.ts`
- Updated to use localStorage persistence
- Added TypeScript interfaces
- Maintains user data between sessions

#### 4. `src/lib/mock-templates.ts` - **MAJOR UPDATE**
- **NEW**: Uses localStorage for persistence
- **NEW**: Implements template versioning system
- **NEW**: Added version tracking and previous version references
- **NEW**: Soft delete (sets as inactive instead of removing)
- **NEW**: Functions for template replacement and history
- **NEW**: Only active templates are returned to users

#### 5. `src/app/api/templates/route.ts` - **MAJOR UPDATE**
- **NEW**: Supports template replacement (creates new version, deactivates old)
- **NEW**: Template history endpoint for admin view
- **NEW**: Soft delete functionality
- **NEW**: Version tracking in responses

#### 6. `src/components/admin/TemplateManagement.tsx` - **MAJOR UPDATE**
- **NEW**: Template replacement functionality
- **NEW**: Template history view
- **NEW**: Version display in table
- **NEW**: Status indicators (Active/Inactive)
- **NEW**: Replace button for active templates
- **NEW**: Enhanced form with description field

#### 7. `src/app/layout.tsx`
- Added StorageInitializer component to ensure storage is initialized

## How It Works

### Data Persistence
1. **Initialization**: When the app loads, `StorageInitializer` calls `initializeMockStorage()`
2. **Default Data**: If localStorage is empty, default data is populated (including Jane's draft)
3. **Persistence**: All CRUD operations on mock data now save to localStorage
4. **Retrieval**: Data is loaded from localStorage on each operation to ensure consistency

### Template Versioning
1. **Upload**: Admin uploads new template → creates version 1
2. **Replace**: Admin replaces template → old version becomes inactive, new version becomes active
3. **User View**: Users only see active templates
4. **Admin View**: Admin can see all versions (active and inactive)
5. **History**: Template history shows all versions for a financial year

## Template Management Features

### For Admin
- **Upload New Template**: Creates version 1
- **Replace Template**: Creates new version, deactivates old
- **View History**: See all versions (active and inactive)
- **Delete Template**: Soft delete (sets as inactive)
- **Version Tracking**: Each template has version number

### For Users
- **Download Active Templates**: Only see active templates
- **No Access to Old Versions**: Inactive templates are hidden
- **Always Latest Version**: Users always get the most recent active template

## Testing

1. Visit `/test-storage` to see current mock data
2. Log in as different users to verify they see their data
3. Log out and back in to verify data persists
4. Use the "Clear All Data" button to reset to defaults
5. **NEW**: Test template versioning:
   - Upload template as admin
   - Replace template → verify old version becomes inactive
   - Check user view → only active template visible
   - Check admin history → all versions visible

## Benefits

- **Data Persistence**: Data now survives logout/login cycles
- **Jane's Access**: Jane can now see and respond to drafts
- **Template Versioning**: Old templates become inactive when replaced
- **User Experience**: Users only see current active templates
- **Admin Control**: Admin can manage template versions and history
- **Type Safety**: Added TypeScript interfaces for better development experience
- **Testing**: Easy way to verify and reset mock data
- **Consistency**: All mock data operations are now consistent

## Default Data

The system now includes default data for:
- **Users**: Admin, John, Jane
- **Uploads**: John's and Jane's approved uploads
- **Drafts**: 
  - John's draft #1 (admin → user)
  - John's draft #2 (user → admin response)
  - Jane's draft #1 (admin → user)
- **Templates**: Empty array (no pre-existing templates)

## Template Versioning Example

1. **Initial Upload**: Admin uploads "Template 2024 v1" → Active
2. **User Downloads**: User sees and downloads "Template 2024 v1"
3. **Admin Replaces**: Admin uploads "Template 2024 v2" → v1 becomes inactive, v2 becomes active
4. **User Downloads Again**: User now sees and downloads "Template 2024 v2" (v1 is hidden)
5. **Admin History**: Admin can see both v1 (inactive) and v2 (active)

## Usage

The persistence system works automatically. No changes needed to existing components or API routes. The mock data functions now handle persistence transparently.

### Template Management
- **Upload**: Use the upload form in admin dashboard
- **Replace**: Click the replace button on any active template
- **History**: Toggle "Show History" to see all versions
- **Delete**: Click delete to soft delete (set as inactive)
