// Global Variables
let currentUser = null;
const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const tabs = document.getElementById('tabs');
const tabContent = document.getElementById('tabContent');
const signOutBtn = document.getElementById('signOutBtn');
const toast = document.getElementById('toast');

// Check Authentication
function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userData);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = checkAuth();
    if (!currentUser) return;
    
    // Set user info
    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;
    document.getElementById('userRole').textContent = `(${currentUser.role})`;
    
    // Initialize based on user role
    if (currentUser.role === 'ADMIN') {
        initializeAdminInterface();
    } else {
        initializeUserInterface();
    }
    
    // Sign out functionality
    signOutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // Show welcome message
    setTimeout(() => {
        showToast(`Welcome to Dairy Sustainability Hub, ${currentUser.name}!`, 'success');
    }, 500);
});

// Initialize Admin Interface
function initializeAdminInterface() {
    // Create admin tabs
    tabs.innerHTML = `
        <button class="tab-btn active" data-tab="dashboard">
            <i class="fas fa-chart-line"></i>
            Dashboard
        </button>
        <button class="tab-btn" data-tab="users">
            <i class="fas fa-users"></i>
            User Management
        </button>
        <button class="tab-btn" data-tab="templates">
            <i class="fas fa-file-excel"></i>
            Template Management
        </button>
        <button class="tab-btn" data-tab="uploads">
            <i class="fas fa-upload"></i>
            User Uploads
        </button>
        <button class="tab-btn" data-tab="reports">
            <i class="fas fa-file-pdf"></i>
            Reports
        </button>
        <button class="tab-btn" data-tab="activity">
            <i class="fas fa-history"></i>
            Activity Logs
        </button>
    `;
    
    // Create admin content
    tabContent.innerHTML = `
        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-pane active">
            <div class="card">
                <h2><i class="fas fa-chart-line"></i> Admin Dashboard</h2>
                <p>Overview of system activities and key metrics.</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalUsers">0</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalTemplates">0</h3>
                            <p>Active Templates</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-upload"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalUploads">0</h3>
                            <p>User Uploads</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalReports">0</h3>
                            <p>Generated Reports</p>
                        </div>
                    </div>
                </div>
                
                <div class="recent-activities">
                    <h3><i class="fas fa-clock"></i> Recent Activities</h3>
                    <div id="recentActivities" class="activity-list">
                        <p class="text-center text-gray-500">Loading recent activities...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- User Management Tab -->
        <div id="users" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-users"></i> User Management</h2>
                <p>Create, update, and manage user accounts.</p>
                
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="showCreateUserModal()">
                        <i class="fas fa-user-plus"></i>
                        Create New User
                    </button>
                </div>
                
                <div class="users-table-container">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <tr>
                                <td colspan="6" class="text-center text-gray-500">Loading users...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Template Management Tab -->
        <div id="templates" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-file-excel"></i> Template Management</h2>
                <p>Upload and manage sustainability reporting templates.</p>
                
                <div class="template-upload-section">
                    <h3>Upload New Template</h3>
                    <div class="upload-area">
                        <div class="upload-zone" id="templateUploadZone">
                            <i class="fas fa-file-excel"></i>
                            <h4>Drag & Drop Sustainability Template Here</h4>
                            <p>or click to browse (Excel files only)</p>
                            <input type="file" id="templateFileInput" accept=".xlsx,.xls" style="display: none;">
                        </div>
                    </div>
                    
                    <div class="upload-actions">
                        <button class="btn btn-primary" id="uploadTemplateBtn" disabled>
                            <i class="fas fa-upload"></i>
                            Upload Template
                        </button>
                        <button class="btn btn-secondary" id="clearTemplateBtn">
                            <i class="fas fa-trash"></i>
                            Clear
                        </button>
                    </div>
                </div>
                
                <div class="template-list-section">
                    <h3>Current Templates</h3>
                    <div id="templateList" class="template-list">
                        <p class="text-center text-gray-500">Loading templates...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- User Uploads Tab -->
        <div id="uploads" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-upload"></i> User Uploads</h2>
                <p>Review uploaded sustainability data from users.</p>
                
                <div class="uploads-table-container">
                    <table class="uploads-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>File Name</th>
                                <th>Financial Year</th>
                                <th>Upload Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="uploadsTableBody">
                            <tr>
                                <td colspan="6" class="text-center text-gray-500">Loading uploads...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Reports Tab -->
        <div id="reports" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-file-pdf"></i> Reports Management</h2>
                <p>Generate and manage sustainability reports for users.</p>
                
                <div class="reports-table-container">
                    <table class="reports-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Report Name</th>
                                <th>Financial Year</th>
                                <th>Generated Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="reportsTableBody">
                            <tr>
                                <td colspan="6" class="text-center text-gray-500">Loading reports...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Activity Logs Tab -->
        <div id="activity" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-history"></i> Activity Logs</h2>
                <p>Monitor all system activities and user actions.</p>
                
                <div class="activity-list-container">
                    <div id="activityList" class="activity-list">
                        <p class="text-center text-gray-500">Loading activity logs...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Attach tab event listeners
    attachTabListeners();
    
    // Load initial data
    loadAdminDashboard();
}

// Initialize User Interface
function initializeUserInterface() {
    // Create user tabs
    tabs.innerHTML = `
        <button class="tab-btn active" data-tab="dashboard">
            <i class="fas fa-home"></i>
            Dashboard
        </button>
        <button class="tab-btn" data-tab="templates">
            <i class="fas fa-file-excel"></i>
            Download Template
        </button>
        <button class="tab-btn" data-tab="upload">
            <i class="fas fa-upload"></i>
            Upload Data
        </button>
        <button class="tab-btn" data-tab="reports">
            <i class="fas fa-file-pdf"></i>
            My Reports
        </button>
        <button class="tab-btn" data-tab="activity">
            <i class="fas fa-history"></i>
            My Activity
        </button>
    `;
    
    // Create user content
    tabContent.innerHTML = `
        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-pane active">
            <div class="card">
                <h2><i class="fas fa-home"></i> Welcome to Dairy Sustainability Hub</h2>
                <p>Manage your sustainability reporting data and view generated reports.</p>
                
                <div class="user-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-upload"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="userUploads">0</h3>
                            <p>My Uploads</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="userReports">0</h3>
                            <p>My Reports</p>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h3>Quick Actions</h3>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="switchToTab('templates')">
                            <i class="fas fa-download"></i>
                            Download Template
                        </button>
                        <button class="btn btn-primary" onclick="switchToTab('upload')">
                            <i class="fas fa-upload"></i>
                            Upload Data
                        </button>
                        <button class="btn btn-secondary" onclick="switchToTab('reports')">
                            <i class="fas fa-file-pdf"></i>
                            View Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Templates Tab -->
        <div id="templates" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-file-excel"></i> Download Sustainability Template</h2>
                <p>Download the latest sustainability reporting template for your dairy operations.</p>
                
                <div id="templateDownloadSection" class="template-download-section">
                    <p class="text-center text-gray-500">Loading available templates...</p>
                </div>
            </div>
        </div>
        
        <!-- Upload Tab -->
        <div id="upload" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-upload"></i> Upload Sustainability Data</h2>
                <p>Upload your filled sustainability reporting template.</p>
                
                <div class="upload-area">
                    <div class="upload-zone" id="userUploadZone">
                        <i class="fas fa-file-excel"></i>
                        <h4>Drag & Drop Filled Template Here</h4>
                        <p>or click to browse (Excel files only)</p>
                        <input type="file" id="userFileInput" accept=".xlsx,.xls" style="display: none;">
                    </div>
                </div>
                
                <div class="upload-actions">
                    <button class="btn btn-primary" id="userUploadBtn" disabled>
                        <i class="fas fa-upload"></i>
                        Upload Data
                    </button>
                    <button class="btn btn-secondary" id="userClearBtn">
                        <i class="fas fa-trash"></i>
                        Clear
                    </button>
                </div>
                
                <div class="my-uploads-section">
                    <h3>My Uploads</h3>
                    <div id="myUploadsList" class="uploads-list">
                        <p class="text-center text-gray-500">Loading your uploads...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Reports Tab -->
        <div id="reports" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-file-pdf"></i> My Reports</h2>
                <p>View sustainability reports generated by the admin for your data.</p>
                
                <div id="myReportsList" class="reports-list">
                    <p class="text-center text-gray-500">Loading your reports...</p>
                </div>
            </div>
        </div>
        
        <!-- Activity Tab -->
        <div id="activity" class="tab-pane">
            <div class="card">
                <h2><i class="fas fa-history"></i> My Activity</h2>
                <p>Track your recent activities and actions.</p>
                
                <div id="myActivityList" class="activity-list">
                    <p class="text-center text-gray-500">Loading your activities...</p>
                </div>
            </div>
        </div>
    `;
    
    // Attach tab event listeners
    attachTabListeners();
    
    // Load initial data
    loadUserDashboard();
}

// Tab Management
function attachTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Load data for the selected tab
            loadTabData(targetTab);
        });
    });
}

function switchToTab(tabName) {
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabButton) {
        tabButton.click();
    }
}

async function loadTabData(tabName) {
    if (currentUser.role === 'ADMIN') {
        await loadAdminTabData(tabName);
    } else {
        await loadUserTabData(tabName);
    }
}

// Admin Tab Data Loading
async function loadAdminTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            await loadAdminDashboard();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'templates':
            await loadTemplates();
            break;
        case 'uploads':
            await loadAllUploads();
            break;
        case 'reports':
            await loadAllReports();
            break;
        case 'activity':
            await loadActivityLogs();
            break;
    }
}

// User Tab Data Loading
async function loadUserTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            await loadUserDashboard();
            break;
        case 'templates':
            await loadAvailableTemplates();
            break;
        case 'upload':
            await loadUserUploads();
            break;
        case 'reports':
            await loadUserReports();
            break;
        case 'activity':
            await loadUserActivity();
            break;
    }
}

// Admin Functions
async function loadAdminDashboard() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
            document.getElementById('totalTemplates').textContent = stats.totalTemplates || 0;
            document.getElementById('totalUploads').textContent = stats.totalUploads || 0;
            document.getElementById('totalReports').textContent = stats.totalReports || 0;
            
            // Render recent activities
            if (stats.recentActivities) {
                renderRecentActivities(stats.recentActivities);
            }
        } else {
            showToast('Failed to load dashboard data', 'error');
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        if (response.ok) {
            const users = await response.json();
            renderUsersTable(users);
        } else {
            showToast('Failed to load users', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error loading users', 'error');
    }
}

async function loadTemplates() {
    try {
        const response = await fetch(`${API_BASE}/templates`);
        if (response.ok) {
            const templates = await response.json();
            renderTemplateList(templates);
        } else {
            showToast('Failed to load templates', 'error');
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        showToast('Error loading templates', 'error');
    }
}

async function loadAllUploads() {
    try {
        const response = await fetch(`${API_BASE}/admin/uploads`);
        if (response.ok) {
            const uploads = await response.json();
            renderUploadsTable(uploads);
        } else {
            showToast('Failed to load uploads', 'error');
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
        showToast('Error loading uploads', 'error');
    }
}

async function loadAllReports() {
    try {
        const response = await fetch(`${API_BASE}/admin/reports`);
        if (response.ok) {
            const reports = await response.json();
            renderReportsTable(reports);
        } else {
            showToast('Failed to load reports', 'error');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Error loading reports', 'error');
    }
}

async function loadActivityLogs() {
    try {
        const response = await fetch(`${API_BASE}/admin/activities`);
        if (response.ok) {
            const activities = await response.json();
            renderActivityLogs(activities);
        } else {
            showToast('Failed to load activity logs', 'error');
        }
    } catch (error) {
        console.error('Error loading activity logs:', error);
        showToast('Error loading activity logs', 'error');
    }
}

// User Functions
async function loadUserDashboard() {
    try {
        const response = await fetch(`${API_BASE}/user/dashboard?userId=${currentUser.id}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('userUploads').textContent = data.totalUploads || 0;
            document.getElementById('userReports').textContent = data.totalReports || 0;
        }
    } catch (error) {
        console.error('Error loading user dashboard:', error);
    }
}

async function loadAvailableTemplates() {
    try {
        const response = await fetch(`${API_BASE}/templates`);
        if (response.ok) {
            const templates = await response.json();
            renderTemplateDownloadSection(templates);
        } else {
            showToast('Failed to load templates', 'error');
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        showToast('Error loading templates', 'error');
    }
}

async function loadUserUploads() {
    try {
        const response = await fetch(`${API_BASE}/upload?userId=${currentUser.id}`);
        if (response.ok) {
            const uploads = await response.json();
            renderUserUploadsList(uploads);
        } else {
            showToast('Failed to load uploads', 'error');
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
        showToast('Error loading uploads', 'error');
    }
}

async function loadUserReports() {
    try {
        const response = await fetch(`${API_BASE}/user/reports?userId=${currentUser.id}`);
        if (response.ok) {
            const reports = await response.json();
            renderUserReportsList(reports);
        } else {
            showToast('Failed to load reports', 'error');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Error loading reports', 'error');
    }
}

async function loadUserActivity() {
    try {
        const response = await fetch(`${API_BASE}/user/activity?userId=${currentUser.id}`);
        if (response.ok) {
            const activities = await response.json();
            renderUserActivityList(activities);
        } else {
            showToast('Failed to load activities', 'error');
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        showToast('Error loading activities', 'error');
    }
}

// Render Functions
function renderRecentActivities(activities) {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No recent activities</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${getActivityIconClass(activity.action)}">
                <i class="fas ${getActivityIcon(activity.action)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-user">${activity.user?.name || 'System'}</div>
                <div class="activity-action">${activity.details}</div>
                <div class="activity-time">${new Date(activity.createdAt).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td><span class="user-status active">Active</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td class="user-actions">
                <button class="btn btn-small btn-primary" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTemplateList(templates) {
    const container = document.getElementById('templateList');
    if (!container) return;
    
    if (templates.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No templates found</p>';
        return;
    }
    
    container.innerHTML = templates.map(template => `
        <div class="template-item">
            <div class="template-info">
                <h4>${template.name}</h4>
                <p>Financial Year: ${template.financialYear} | Size: ${formatFileSize(template.fileSize)}</p>
            </div>
            <div class="template-actions">
                <button class="btn btn-small btn-secondary" onclick="downloadTemplate('${template.id}', '${template.fileName}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteTemplate('${template.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderUploadsTable(uploads) {
    const tbody = document.getElementById('uploadsTableBody');
    if (!tbody) return;
    
    if (uploads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500">No uploads found</td></tr>';
        return;
    }
    
    tbody.innerHTML = uploads.map(upload => `
        <tr>
            <td>${upload.user?.name || 'Unknown'}</td>
            <td>${upload.fileName}</td>
            <td>${upload.financialYear}</td>
            <td>${new Date(upload.createdAt).toLocaleString()}</td>
            <td><span class="upload-status ${upload.status.toLowerCase()}">${upload.status}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="reviewUpload('${upload.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-small btn-secondary" onclick="downloadUpload('${upload.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-small btn-success" onclick="generateReport('${upload.id}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderReportsTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500">No reports found</td></tr>';
        return;
    }
    
    tbody.innerHTML = reports.map(report => `
        <tr>
            <td>${report.user?.name || 'Unknown'}</td>
            <td>${report.reportName}</td>
            <td>${report.financialYear}</td>
            <td>${new Date(report.createdAt).toLocaleString()}</td>
            <td><span class="report-status ${report.status.toLowerCase()}">${report.status}</span></td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="downloadReport('${report.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteReport('${report.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderActivityLogs(activities) {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No activity logs found</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${getActivityIconClass(activity.action)}">
                <i class="fas ${getActivityIcon(activity.action)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-user">${activity.user?.name || 'System'}</div>
                <div class="activity-action">${activity.details}</div>
                <div class="activity-time">${new Date(activity.createdAt).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

// User Render Functions
function renderTemplateDownloadSection(templates) {
    const container = document.getElementById('templateDownloadSection');
    if (!container) return;
    
    if (templates.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No templates available for download</p>';
        return;
    }
    
    container.innerHTML = templates.map(template => `
        <div class="template-download-card">
            <div class="template-icon">
                <i class="fas fa-file-excel"></i>
            </div>
            <div class="template-info">
                <h3>${template.name}</h3>
                <p>Financial Year: ${template.financialYear}</p>
                <p>File Size: ${formatFileSize(template.fileSize)}</p>
                <p class="template-description">${template.description || 'Sustainability reporting template for dairy operations'}</p>
            </div>
            <button class="btn btn-primary" onclick="downloadTemplate('${template.id}', '${template.fileName}')">
                <i class="fas fa-download"></i>
                Download Template
            </button>
        </div>
    `).join('');
}

function renderUserUploadsList(uploads) {
    const container = document.getElementById('myUploadsList');
    if (!container) return;
    
    if (uploads.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No uploads found</p>';
        return;
    }
    
    container.innerHTML = uploads.map(upload => `
        <div class="upload-item">
            <div class="upload-info">
                <h4>${upload.fileName}</h4>
                <p>Financial Year: ${upload.financialYear}</p>
                <p>Upload Date: ${new Date(upload.createdAt).toLocaleString()}</p>
                <span class="upload-status ${upload.status.toLowerCase()}">${upload.status}</span>
            </div>
            <div class="upload-actions">
                <button class="btn btn-small btn-secondary" onclick="downloadUpload('${upload.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteUpload('${upload.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderUserReportsList(reports) {
    const container = document.getElementById('myReportsList');
    if (!container) return;
    
    if (reports.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No reports available yet</p>';
        return;
    }
    
    container.innerHTML = reports.map(report => `
        <div class="report-item">
            <div class="report-info">
                <h4>${report.reportName}</h4>
                <p>Financial Year: ${report.financialYear}</p>
                <p>Generated Date: ${new Date(report.createdAt).toLocaleString()}</p>
                <span class="report-status ${report.status.toLowerCase()}">${report.status}</span>
            </div>
            <div class="report-actions">
                <button class="btn btn-primary" onclick="downloadReport('${report.id}')">
                    <i class="fas fa-download"></i>
                    Download Report
                </button>
            </div>
        </div>
    `).join('');
}

function renderUserActivityList(activities) {
    const container = document.getElementById('myActivityList');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No activities found</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${getActivityIconClass(activity.action)}">
                <i class="fas ${getActivityIcon(activity.action)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-action">${activity.details}</div>
                <div class="activity-time">${new Date(activity.createdAt).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function getActivityIconClass(action) {
    if (action.includes('UPLOAD')) return 'upload';
    if (action.includes('DOWNLOAD')) return 'download';
    if (action.includes('LOGIN')) return 'login';
    if (action.includes('REPORT')) return 'report';
    return 'default';
}

function getActivityIcon(action) {
    if (action.includes('UPLOAD')) return 'fa-upload';
    if (action.includes('DOWNLOAD')) return 'fa-download';
    if (action.includes('LOGIN')) return 'fa-sign-in-alt';
    if (action.includes('REPORT')) return 'fa-file-pdf';
    return 'fa-info-circle';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Toast Notifications
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Admin action functions
function showCreateUserModal() {
    const name = prompt('Enter user name:');
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    const role = prompt('Enter role (ADMIN/USER):', 'USER');
    
    if (name && username && password) {
        createUser({ name, username, password, role });
    }
}

async function createUser(userData) {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        if (response.ok) {
            showToast('User created successfully', 'success');
            loadUsers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to create user', 'error');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showToast('Error creating user', 'error');
    }
}

async function editUser(userId) {
    const name = prompt('Enter new name:');
    const username = prompt('Enter new username:');
    const password = prompt('Enter new password (leave empty to keep current):');
    const role = prompt('Enter new role (ADMIN/USER):');
    
    if (name || username || password || role) {
        try {
            const updateData = { id: userId };
            if (name) updateData.name = name;
            if (username) updateData.username = username;
            if (password) updateData.password = password;
            if (role) updateData.role = role;
            
            const response = await fetch(`${API_BASE}/admin/users`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            
            if (response.ok) {
                showToast('User updated successfully', 'success');
                loadUsers();
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to update user', 'error');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showToast('Error updating user', 'error');
        }
    }
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`${API_BASE}/admin/users?id=${userId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                showToast('User deleted successfully', 'success');
                loadUsers();
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('Error deleting user', 'error');
        }
    }
}

function downloadTemplate(templateId, fileName) {
    showToast(`Downloading ${fileName}...`, 'info');
    // Implementation for template download
}

async function deleteTemplate(templateId) {
    if (confirm('Are you sure you want to delete this template?')) {
        try {
            const response = await fetch(`${API_BASE}/templates?id=${templateId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                showToast('Template deleted successfully', 'success');
                loadTemplates();
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to delete template', 'error');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            showToast('Error deleting template', 'error');
        }
    }
}

function reviewUpload(uploadId) {
    showToast(`Review upload ${uploadId} functionality coming soon`, 'info');
}

function downloadUpload(uploadId) {
    showToast(`Download upload ${uploadId} functionality coming soon`, 'info');
}

function generateReport(uploadId) {
    showToast(`Generate report for upload ${uploadId} functionality coming soon`, 'info');
}

function downloadReport(reportId) {
    showToast(`Download report ${reportId} functionality coming soon`, 'info');
}

async function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report?')) {
        try {
            const response = await fetch(`${API_BASE}/admin/reports?id=${reportId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                showToast('Report deleted successfully', 'success');
                loadAllReports();
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to delete report', 'error');
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            showToast('Error deleting report', 'error');
        }
    }
}

async function deleteUpload(uploadId) {
    if (confirm('Are you sure you want to delete this upload?')) {
        try {
            const response = await fetch(`${API_BASE}/upload?id=${uploadId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                showToast('Upload deleted successfully', 'success');
                loadUserUploads();
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to delete upload', 'error');
            }
        } catch (error) {
            console.error('Error deleting upload:', error);
            showToast('Error deleting upload', 'error');
        }
    }
}
