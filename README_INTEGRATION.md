# 📚 AI Documentation Generator - Complete Integration Guide

> Automated documentation generation using AI, with full-stack integration: Frontend (React), Backend API (Node.js/Express), Python analysis engine, and Supabase database.

## ⚡ Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install --prefix Backend-API
npm install --prefix Frontend

# 2. Start Backend (Terminal 1)
cd Backend-API && node server.js

# 3. Start Frontend (Terminal 2)
cd Frontend && npm run dev

# 4. Open in browser
# http://localhost:5173
```

**Or use the automated scripts:**
- Windows: `START.bat`
- PowerShell: `START.ps1`

---

## 📋 What This System Does

### User Flow
```
1. Sign Up / Login → 2. Upload ZIP or Paste Repo Link → 3. Watch AI Analyze
   ↓                    ↓                                    ↓
   JWT Auth          Extract Files                    Generate Docs
   Supabase          Run Python                       Architecture
   Token            Store Results                     API Docs
                                                      Code Analysis
                                                      ↓
4. View & Download Docs ← 5. Store in Supabase ← 6. Beautifully Formatted
   README.md              documentation_files         Markdown Files
   Architecture           projects table              (in Dashboard)
   API Docs              users table
```

---

## 🏗️ System Architecture

### Three Integrated Components

```
┌──────────────────────┐
│   FRONTEND (React)   │
│   - Beautiful UI     │
│   - Auth flow        │
│   - Upload forms     │
│   - View docs        │
│   Port: 5173         │
└──────────┬───────────┘
           │ HTTP API with JWT
           ↓
┌──────────────────────┐
│  BACKEND API (Node)  │
│  - Express server    │
│  - Auth endpoints    │
│  - File upload       │
│  - Process projects  │
│  Port: 5000          │
└──────────┬───────────┘
           │ Subprocess calls
           ↓
┌──────────────────────┐
│  Python Backend      │
│  - Code analysis     │
│  - Doc generation    │
│  - AI integration    │
│  Local directory     │
└──────────┬───────────┘
           │ File I/O
           ↓
┌──────────────────────┐
│ FILE SYSTEM & DB     │
│ - repos/ directory   │
│ - Supabase database  │
│ - Generated files    │
└──────────────────────┘
```

---

## 📁 Project Structure

```
auto-documentation-generator/
├── Frontend/                          # React Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main app interface
│   │   │   └── LandingPage.jsx       # Public landing
│   │   ├── components/
│   │   │   ├── LoginModal.jsx        # User login
│   │   │   └── SignupModal.jsx       # User registration
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state
│   │   ├── services/
│   │   │   └── api.js                # Backend API calls
│   │   ├── App.jsx                   # Root component
│   │   ├── index.css                 # Styling
│   │   └── main.jsx
│   ├── .env                          # Frontend config
│   ├── vite.config.js                # Vite configuration
│   └── package.json
│
├── Backend-API/                       # Node.js Backend
│   ├── controllers/
│   │   ├── authController.js         # Sign up, login
│   │   └── projectController.js      # Upload, process files
│   ├── routes/
│   │   ├── auth.js                   # Auth endpoints
│   │   └── projects.js               # Project endpoints
│   ├── config/
│   │   └── supabase.js               # DB configuration
│   ├── utils/
│   │   └── pythonRunner.js           # Execute Python commands
│   ├── middleware/
│   │   └── auth.js                   # JWT verification
│   ├── .env                          # Backend config
│   ├── server.js                     # Express server
│   └── package.json
│
├── Backend/                          # Python Backend
│   ├── src/
│   │   ├── main.py                   # CLI entry point
│   │   ├── agents/                   # AI agents
│   │   │   ├── analyzer.py           # Code analysis
│   │   │   └── documenter.py         # Doc generation
│   │   ├── handlers/                 # Command handlers
│   │   └── utils/                    # Utilities
│   ├── pyproject.toml                # Python dependencies
│   └── config_example.yaml           # Configuration
│
├── SUPABASE_SETUP.sql                # Database schema
├── INTEGRATION_COMPLETE.md           # Setup instructions (YOU ARE HERE)
├── CHECKLIST.md                      # Implementation checklist
├── START.bat                         # Windows startup script
└── START.ps1                         # PowerShell startup script
```

---

## 🔧 Setup Instructions

### Step 1: Set Up Supabase Database

**Option A: Automated (Recommended)**
1. Open `SUPABASE_SETUP.sql`
2. Copy entire file
3. Go to [Supabase Dashboard](https://app.supabase.com)
4. SQL Editor → New Query
5. Paste and Execute

**Option B: Manual**
- Create tables manually in Supabase UI
- See `SUPABASE_SETUP.sql` for exact schema

### Step 2: Install Dependencies

**Backend API:**
```bash
cd Backend-API
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

**Python (Already set up if using existing backend)**

### Step 3: Configure Environment

**Backend-API/.env:**
```dotenv
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your-secret-key-here
PYTHON_BACKEND_PATH=D:\Projects\auto-documentation-generator\Backend
REPOS_STORAGE_PATH=D:\Projects\auto-documentation-generator\repos
```

**Frontend/.env:**
```
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start Services

**Terminal 1 - Backend API:**
```bash
cd Backend-API
node server.js
```
Expected: `Express server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```
Expected: `Local: http://localhost:5173/`

**Terminal 3 - Monitor Python (Optional):**
```bash
cd Backend
uv run src/main.py --help
```

### Step 5: Test the System

1. Open http://localhost:5173
2. Sign up with test account
3. Upload a test ZIP file
4. Watch documentation generate
5. View results in dashboard

---

## 📚 Key Features

### Authentication ✅
- User signup with email/password
- JWT token-based authentication
- Token persistence across sessions
- Protected dashboard routes
- Logout functionality

### File Upload ✅
- ZIP file drag-and-drop
- File validation
- Progress tracking
- Real-time status updates

### Processing ✅
- Automatic ZIP extraction
- Python analysis execution
- README generation
- Documentation storage

### Dashboard ✅
- View previous projects
- Real-time status monitoring
- Generated documentation display
- Multi-file viewer
- Project organization

### Database ✅
- Supabase PostgreSQL
- User management
- Project tracking
- Documentation storage
- Generation logs

---

## 🔌 API Endpoints

### Authentication

**Sign Up**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "User Name",
  "password": "SecurePass123!"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Verify Token**
```http
POST /api/auth/verify
Authorization: Bearer [token]
```

### Projects

**Create Project (Upload ZIP)**
```http
POST /api/projects
Authorization: Bearer [token]
Content-Type: multipart/form-data

Form Data:
- zipFile: [file]
```

**Get All Projects**
```http
GET /api/projects
Authorization: Bearer [token]
```

**Get Project Details**
```http
GET /api/projects/:projectId
Authorization: Bearer [token]
```

---

## 🗄️ Database Schema

### users
```sql
- id (UUID)
- email (TEXT, unique)
- full_name (TEXT)
- password_hash (TEXT)
- created_at (TIMESTAMP)
```

### projects
```sql
- id (UUID)
- user_id (UUID, FK)
- name (TEXT)
- repo_source (TEXT)
- repo_type (github|gitlab|zip)
- status (pending|analyzing|generating|completed|failed)
- local_path (TEXT)
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)
```

### documentation_files
```sql
- id (UUID)
- project_id (UUID, FK)
- file_name (TEXT)
- file_type (readme|analysis)
- content (TEXT)
- created_at (TIMESTAMP)
```

---

## 🚀 Workflow: ZIP Upload → Docs

### Frontend User Action
1. Select ZIP file
2. Click "Upload & Generate"
3. See progress bar (0% → 100%)
4. Get success message
5. Generation steps animate
6. Project appears in sidebar

### Backend Processing (Behind the Scenes)
```
1. Frontend sends POST /api/projects with ZIP file
   ↓
2. Backend receives and extracts ZIP to repos/[project-id]/
   ↓
3. Create project record in Supabase with status: 'pending'
   ↓
4. Start background job (generateDocumentation)
   ↓
5. Update status: 'analyzing'
   ↓
6. Run: uv run src/main.py analyze --repo-path [repo-path]
   ↓
7. Update status: 'generating'
   ↓
8. Run: uv run src/main.py generate readme --repo-path [repo-path]
   ↓
9. Read generated files from .ai/docs/
   ↓
10. Upload each file to documentation_files table
    ↓
11. Update status: 'completed'
    ↓
12. Frontend polls /api/projects/:id every 10 seconds
    ↓
13. When status = 'completed', show success and display docs
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'adm-zip'"
**Solution:** `npm install adm-zip --save` in Backend-API

### Issue: ZIP extraction fails
**Solution:** 
- Check file is valid ZIP
- Verify REPOS_STORAGE_PATH exists and is writable
- Check permissions on directory

### Issue: Python commands not running
**Solution:**
- Verify Python path in PYTHON_BACKEND_PATH
- Test: `uv run src/main.py analyze --repo-path /some/path`
- Check Python backend is installed correctly

### Issue: No files showing in dashboard
**Solution:**
- Check files exist in repos/[project-id]/.ai/docs/
- Query Supabase: `SELECT * FROM documentation_files;`
- Check backend logs for Python errors
- Verify Supabase connection

### Issue: CORS errors in browser console
**Solution:**
- Verify FRONTEND_URL in Backend-API .env
- Ensure Frontend is on correct port (5173)
- Check CORS configuration in server.js

### Issue: Supabase connection errors
**Solution:**
- Verify SUPABASE_URL and keys in .env
- Check tables exist in Supabase
- Run SUPABASE_SETUP.sql if tables missing

---

## 📊 Monitoring

### Check Backend Status
```bash
# See running processes
tasklist | findstr "node"

# Check logs in console for:
# ✓ Express server running on port 5000
# ✓ Supabase connected successfully
```

### Check Frontend Status
```bash
# In browser DevTools:
# 1. F12 → Console: Check for errors
# 2. F12 → Network: Check API calls
# 3. F12 → Application → localStorage: Check auth token
```

### Check Database Status
```sql
-- Supabase SQL Editor

-- Count users
SELECT COUNT(*) FROM users;

-- Count projects
SELECT COUNT(*) FROM projects;

-- List all projects with status
SELECT id, name, status, created_at FROM projects ORDER BY created_at DESC;

-- Check documentation files
SELECT COUNT(*) FROM documentation_files;
```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to random strong value
- [ ] Use environment variables for sensitive data
- [ ] Enable Row Level Security in Supabase
- [ ] Validate file uploads on server
- [ ] Sanitize file paths to prevent traversal
- [ ] Set file size limits on uploads
- [ ] Use HTTPS in production
- [ ] Add rate limiting to API endpoints
- [ ] Implement request validation
- [ ] Log security events

---

## 📈 Scaling Considerations

### For Production
1. **Database**: Use connection pooling, regular backups
2. **File Storage**: Consider S3 instead of local filesystem
3. **Processing**: Use job queue (Bull, RabbitMQ) for Python jobs
4. **Frontend**: Deploy to Vercel/Netlify with CDN
5. **Backend**: Deploy to AWS/GCP/Azure with auto-scaling
6. **Monitoring**: Add Sentry, New Relic, or Datadog

---

## 📝 Additional Resources

- [Complete Integration Guide](./INTEGRATION_COMPLETE.md)
- [Implementation Checklist](./CHECKLIST.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

---

## 🤝 Contributing

To add new features:
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Update documentation

---

## 📄 License

See LICENSE file in root directory

---

## ✨ Summary

Your AI Documentation Generator is now fully integrated with:
- ✅ Beautiful React Frontend
- ✅ Robust Express Backend
- ✅ Python AI Engine
- ✅ Supabase Database
- ✅ Complete Authentication
- ✅ File Upload & Processing
- ✅ Real-time Status Updates

**Ready to generate amazing documentation!** 🎉

---

**Questions?** Check:
1. [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) - Detailed setup steps
2. [CHECKLIST.md](./CHECKLIST.md) - Verification checklist
3. Console logs - Backend and Frontend errors
4. Supabase dashboard - Database status

**Good luck!** 🚀
