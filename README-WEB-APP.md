# Dairy Sustainability Reporting Hub - Web App

A modern, responsive web application for dairy sustainability reporting and management.

## 🚀 Quick Start

### Testing the Web App

1. **Open the HTML file directly in your browser:**
   - Simply double-click on `index.html` or right-click and select "Open with" your preferred browser
   - The app will load immediately without any server setup required

2. **Or use a local server (recommended for full functionality):**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Using PHP (if installed)
   php -S localhost:8000
   ```

3. **Access the app:**
   - If using a local server: Open `http://localhost:8000` in your browser
   - If opening directly: The file will open in your browser with a `file://` URL

## ✨ Features

### 📊 Dashboard Overview
- **Download Templates**: Access Excel templates for environmental, social, and economic reporting
- **Upload Data**: Drag & drop or click to upload completed sustainability reports
- **Draft Management**: Manage in-progress reports with edit, download, and delete options
- **Historical Reports**: View and download previous years' sustainability reports

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, smooth animations, and intuitive navigation
- **Toast Notifications**: Real-time feedback for user actions
- **Drag & Drop**: Easy file upload functionality

### 🔧 Interactive Features
- **Tab Navigation**: Switch between different sections seamlessly
- **File Upload**: Support for Excel (.xlsx, .xls) and CSV files
- **Real-time Updates**: Dynamic content updates without page refresh
- **Keyboard Navigation**: Full keyboard accessibility support

## 📁 File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and interactions
└── README-WEB-APP.md   # This file
```

## 🧪 Testing Scenarios

### 1. Template Downloads
- Click on any "Download Excel" button in the Templates tab
- Verify toast notification appears
- Check that download simulation works

### 2. File Upload
- Go to the "Upload Filled Data" tab
- Try dragging and dropping files onto the upload zone
- Click the upload zone to browse for files
- Test with Excel (.xlsx, .xls) and CSV files
- Verify file validation (try uploading non-Excel files)

### 3. Draft Management
- View existing drafts in the "Draft Management" tab
- Test Edit, Download, and Delete buttons
- Verify confirmation dialog for delete actions
- Check smooth animations when deleting items

### 4. Historical Reports
- Browse previous years' reports in the "Previous Years" tab
- Test download functionality for historical reports
- View sustainability metrics and performance indicators

### 5. Responsive Design
- Resize browser window to test mobile responsiveness
- Test on different screen sizes
- Verify tab navigation works on mobile devices

### 6. User Experience
- Test sign out functionality
- Verify all toast notifications appear correctly
- Check keyboard navigation (Tab key on tab buttons)
- Test hover effects on cards and buttons

## 🎯 Key Benefits Over Next.js Version

- **No Build Process**: Instant loading, no compilation required
- **No Dependencies**: Pure HTML/CSS/JavaScript - no npm install needed
- **Easy Testing**: Open directly in browser or use any simple HTTP server
- **Portable**: Can be hosted anywhere, including static hosting services
- **Fast Development**: Immediate feedback when making changes
- **Cross-Platform**: Works on any device with a web browser
- **Real Backend Integration**: Connected to Vercel Blob Storage and Neon PostgreSQL

## 🔧 Customization

### Adding New Templates
Edit the `index.html` file and add new template cards in the templates section:

```html
<div class="template-card">
    <div class="template-icon">
        <i class="fas fa-file-excel"></i>
    </div>
    <h3>Your New Template</h3>
    <p>Description of your template</p>
    <button class="btn btn-primary">
        <i class="fas fa-download"></i>
        Download Excel
    </button>
</div>
```

### Modifying Styles
Edit `styles.css` to customize colors, fonts, and layout:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #f8fafc;
}
```

### Adding Functionality
Extend `script.js` to add new interactive features or integrate with backend APIs.

## 🌐 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Notes

- **Backend Integration**: This app now connects to real Vercel Blob Storage and Neon PostgreSQL
- **File Storage**: All files are stored in Vercel Blob Storage
- **Database**: All data is stored in Neon PostgreSQL database
- **Authentication**: Uses NextAuth.js for user authentication
- **Real Processing**: File uploads, downloads, and data management are fully functional
- **Production Ready**: Can be deployed to Vercel with proper environment variables

## 🚀 Backend Setup

Your app is already integrated with Vercel Blob Storage and Neon PostgreSQL! See `BACKEND-SETUP.md` for complete setup instructions.

### Quick Setup:
1. **Set Environment Variables**: Create `.env.local` with your database and blob storage credentials
2. **Initialize Database**: Run `npm run db:push` to set up your database schema
3. **Deploy to Vercel**: Use `vercel` command to deploy with proper environment variables

### Production Deployment:
1. **Vercel Blob**: Create blob store in Vercel dashboard
2. **Neon PostgreSQL**: Set up production database
3. **Environment Variables**: Configure all secrets in Vercel project settings
4. **Deploy**: Push to production with `vercel --prod`

---

**Enjoy testing your Dairy Sustainability Reporting Hub! 🌱🐄**
