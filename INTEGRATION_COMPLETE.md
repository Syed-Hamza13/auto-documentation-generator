# Complete Frontend-Backend-Python Integration Guide

## Overview
This document provides step-by-step instructions to get your documentation generator fully operational with file uploads, backend processing, and Supabase storage.

---

## **STEP 1: Set Up Supabase Database** ✅

### 1.1 Run the SQL Schema
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy all content from `SUPABASE_SETUP.sql` in the root directory
5. Paste and **RUN** the query
6. Verify all tables are created: `users`, `projects`, `documentation_files`, `generation_logs`

### 1.2 Verify Table Creation
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
Should return:
- documentation_files
- generation_logs
- projects
- users

---

## **STEP 2: Install Dependencies**

### 2.1 Backend API Dependencies
```bash
cd Backend-API
npm install
```

**Newly added packages:**
- `adm-zip` - For ZIP file extraction

### 2.2 Frontend Dependencies (Already Installed)
```bash
cd Frontend
npm install
```

### 2.3 Python Backend (Already Installed)
Python backend should already be set up. Verify by running:
```bash
cd Backend
uv --version
```

---

## **STEP 3: Environment Variables**

### 3.1 Backend-API .env File (Already Configured)
Your `Backend-API/.env` should contain:
```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://ifsbyxeimgkkjyxgzsod.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Python Backend
PYTHON_BACKEND_PATH=D:\Projects\auto-documentation-generator\Backend

# Repos Storage
REPOS_STORAGE_PATH=D:\Projects\auto-documentation-generator\repos
```

⚠️ **Important**: Replace paths with your actual paths if different.

### 3.2 Frontend .env File (Already Configured)
```
VITE_API_URL=http://localhost:5000/api
```

---

## **STEP 4: Start All Services**

### 4.1 Start Backend-API (Terminal 1)
```bash
cd Backend-API
npm install  # If not done yet
node server.js
```
**Expected Output:**
```
Express server running on port 5000
Supabase connected successfully
```

### 4.2 Start Frontend (Terminal 2)
```bash
cd Frontend
npm run dev
```
**Expected Output:**
```
  VITE v7.3.0  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 4.3 Verify Python Backend is Ready
```bash
cd Backend
uv run src/main.py --help
```
Should show help output without errors.

---

## **STEP 5: Test Authentication Flow**

### 5.1 Navigate to Frontend
- Open browser: `http://localhost:5173`
- You should see **Landing Page** with "Get Started" button

### 5.2 Sign Up New User
1. Click "Get Started" or click "Sign Up" in login modal
2. Fill in:
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
3. Click "Sign Up"

**Expected Results:**
- ✅ User created in Supabase `users` table
- ✅ JWT token stored in localStorage
- ✅ Redirected to Dashboard
- ✅ Dashboard shows "Hello, Test User!"

### 5.3 Test Login (Logout first if needed)
1. Click **Logout** button (top right)
2. Should be redirected to Landing Page
3. Click "Sign In"
4. Enter email and password
5. Click "Sign In"

**Expected Results:**
- ✅ Authenticated with JWT token
- ✅ Dashboard accessible

---

## **STEP 6: Test File Upload Flow**

### 6.1 Create a Test ZIP File
1. Create a folder with some Python files:
   ```
   test_project/
   ├── main.py
   ├── utils.py
   ├── config.py
   └── README.md
   ```
2. Zip this folder as `test_project.zip`
3. Save to desktop or known location

### 6.2 Upload ZIP in Dashboard
1. Make sure you're logged in and on Dashboard
2. Click **"Upload ZIP File"** button (or drag-and-drop area)
3. Select your `test_project.zip`
4. Click **"Upload & Generate"**

**Expected Results:**
- ✅ Upload progress bar shows 0% → 100%
- ✅ File upload success toast message
- ✅ Generation steps animation starts
- ✅ New project appears in left sidebar

**What's Happening Behind the Scenes:**
1. Frontend sends ZIP to Backend API at `POST /api/projects`
2. Backend extracts ZIP to `repos/` directory
3. Backend calls Python analyzer: `uv run src/main.py analyze --repo-path [path]`
4. Python creates `.ai/docs/` folder with analysis files
5. Backend calls Python generator: `uv run src/main.py generate readme --repo-path [path]`
6. Python creates/updates `README.md`
7. Backend stores all files in Supabase `documentation_files` table
8. Backend updates project status: `pending` → `analyzing` → `generating` → `completed`
9. Frontend polls every 10 seconds for status updates
10. When status is `completed`, displays success message

---

## **STEP 7: View Generated Documentation**

### 7.1 Check Generation Status
1. Project should appear in left sidebar under "Your Projects"
2. Status indicator shows:
   - 🟡 Yellow: `analyzing` or `generating`
   - 🟢 Green: `completed`
   - 🔴 Red: `failed`

### 7.2 View Generated Files
1. Click on project name in sidebar or in projects list
2. Should see tabs for:
   - README.md
   - Architecture Overview
   - API Documentation
   - Data Flow Analysis
   - Dependency Analysis

3. Files should display the actual content from Supabase

**If Files Not Showing:**
- Check browser console for errors
- Check Backend logs for Python execution errors
- Verify files are in `repos/[project-id]/` directory
- Verify files are in Supabase `documentation_files` table

---

## **STEP 8: Verify Database Data**

### 8.1 Check Users Table
```sql
SELECT id, email, full_name, created_at FROM users;
```

### 8.2 Check Projects Table
```sql
SELECT id, user_id, name, status, created_at FROM projects;
```

### 8.3 Check Documentation Files
```sql
SELECT id, project_id, file_name, file_type FROM documentation_files LIMIT 10;
```

---

## **STEP 9: Add Repository Link Support** (Optional)

If you want to support GitHub/GitLab links later:

### 9.1 In Frontend Dashboard.jsx, add:
```jsx
const handleRepoLinkSubmit = async () => {
  if (!repoLink) {
    showToastMessage('Please enter a repository link', 'error');
    return;
  }

  setIsUploading(true);
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repoLink,
        repoType: 'github'
      })
    });

    if (response.ok) {
      const result = await response.json();
      showToastMessage('Repository cloning started...', 'success');
      pollProjectStatus(result.projectId);
    }
  } catch (error) {
    showToastMessage('Failed to process repository', 'error');
  } finally {
    setIsUploading(false);
  }
};
```

---

## **STEP 10: Troubleshooting**

### Issue: "handleFileUpload is not defined"
**Solution:** Already fixed! Function is now defined in Dashboard.jsx

### Issue: ZIP extraction fails
**Check:**
1. Is `adm-zip` installed? Run `npm install adm-zip`
2. Is `REPOS_STORAGE_PATH` directory writable?
3. Does the ZIP file exist and is not corrupted?

### Issue: Python commands not running
**Check:**
1. Is Python backend at correct path? Update `PYTHON_BACKEND_PATH` in `.env`
2. Can you run directly? `uv run src/main.py analyze --repo-path /some/path`
3. Check error logs in console

### Issue: No files showing in dashboard
**Check:**
1. Are files in `repos/[project-id]/.ai/docs/`?
2. Run SQL: `SELECT * FROM documentation_files WHERE project_id = '[your-project-id]';`
3. Check backend logs for Python errors
4. Verify Supabase connection in `config/supabase.js`

### Issue: File uploads not reaching backend
**Check:**
1. Is Backend API running on port 5000?
2. Check browser Network tab in DevTools
3. Look for CORS errors
4. Verify `FRONTEND_URL` in Backend `.env` matches actual frontend URL

### Issue: Supabase connection errors
**Check:**
1. Are credentials in `.env` correct?
2. Have you created the SQL tables?
3. Try connecting with Supabase CLI: `supabase projects list`

---

## **STEP 11: Performance Tips**

### 6.1 For Large Repositories
- Increase Python timeout in `pythonRunner.js` from `300000` to `600000` (10 minutes)
- Check system RAM is sufficient

### 6.2 For Production
- Change `JWT_SECRET` to a strong random string
- Move Supabase keys to secure secret manager
- Add rate limiting to backend
- Enable Supabase Row Level Security (RLS) policies

---

## **Architecture Diagram**

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │  Port 5173
│  ├─ Dashboard   │
│  ├─ LoginModal  │
│  └─ AuthContext │
└────────┬────────┘
         │ HTTP/JSON
         │ (JWT Auth)
         ↓
┌─────────────────────┐
│  Backend API        │
│  (Express/Node.js)  │  Port 5000
│  ├─ auth.js         │
│  ├─ projects.js     │
│  └─ pythonRunner.js │
└────────┬────────────┘
         │ File I/O
         │ subprocess
         ↓
    ┌─────────────────────┐
    │ Python Backend      │
    │ (Local Installation)│
    │ ├─ analyzer.py      │
    │ ├─ documenter.py    │
    │ └─ agents/          │
    └─────────┬───────────┘
              │ .ai/docs/
              │ README.md
              ↓
    ┌─────────────────────┐
    │ File System         │
    │ repos/[project-id]/ │
    └─────────┬───────────┘
              │ Read & Upload
              ↓
    ┌─────────────────────┐
    │ Supabase            │
    │ ├─ users            │
    │ ├─ projects         │
    │ └─ doc_files        │
    └─────────────────────┘
```

---

## **API Endpoints Summary**

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | ❌ | Create user account |
| POST | `/api/auth/login` | ❌ | User login |
| POST | `/api/auth/verify` | ✅ | Verify token validity |
| POST | `/api/projects` | ✅ | Create project (ZIP or link) |
| GET | `/api/projects` | ✅ | Get user's projects |
| GET | `/api/projects/:projectId` | ✅ | Get project details + docs |

---

## **Next Steps**

1. ✅ Run SUPABASE_SETUP.sql
2. ✅ Install dependencies
3. ✅ Start Backend API, Frontend, Python backend
4. ✅ Test authentication
5. ✅ Test file upload
6. ✅ View generated documentation
7. 🔲 Deploy to production (when ready)

---

## **Support**

If you encounter issues:
1. Check the Troubleshooting section above
2. Check backend console logs for Python errors
3. Check browser console (F12) for frontend errors
4. Check Supabase dashboard for data

Good luck! 🚀
