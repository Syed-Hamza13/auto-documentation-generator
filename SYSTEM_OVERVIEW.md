# 🎨 Complete System Overview & Visual Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Frontend Application (React + Vite)                            │   │
│  │  http://localhost:5173                                          │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │ Landing Page (Public)                                    │ │   │
│  │  │ ├─ Sign Up Button → SignupModal                          │ │   │
│  │  │ └─ Sign In Button → LoginModal                           │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │ Dashboard (Protected - Requires JWT Token)               │ │   │
│  │  │ ├─ Previous Projects List                                │ │   │
│  │  │ ├─ Upload ZIP File Section                               │ │   │
│  │  │ ├─ Repository Link Section                               │ │   │
│  │  │ ├─ Generation Progress Animation                         │ │   │
│  │  │ └─ Generated Documentation Viewer                        │ │   │
│  │  │    ├─ README.md                                          │ │   │
│  │  │    ├─ Architecture Overview                              │ │   │
│  │  │    ├─ API Documentation                                  │ │   │
│  │  │    ├─ Data Flow Analysis                                 │ │   │
│  │  │    └─ Dependency Analysis                                │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                                                                 │   │
│  │  State Management: AuthContext (Global)                       │   │
│  │  └─ User: {email, fullName, userId}                           │   │
│  │  └─ Token: JWT (stored in localStorage)                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  API Calls (HTTP with JWT Authorization)                               │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │ HTTPS/HTTP
                       │ Bearer Token
                       │
┌──────────────────────▼───────────────────────────────────────────────────┐
│              Backend API Server (Express.js + Node.js)                   │
│              http://localhost:5000/api                                   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Routes & Controllers                                               │ │
│  │ ├─ /api/auth/signup       → authController.signup()               │ │
│  │ ├─ /api/auth/login        → authController.login()                │ │
│  │ ├─ /api/auth/verify       → authController.verify()               │ │
│  │ ├─ /api/projects          → projectController.createProject()     │ │
│  │ ├─ /api/projects          → projectController.getProjects()       │ │
│  │ └─ /api/projects/:id      → projectController.getProjectById()    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Middleware                                                         │ │
│  │ ├─ CORS (allows localhost:5173)                                   │ │
│  │ ├─ JWT Authentication Middleware                                  │ │
│  │ └─ Body Parser (JSON & multipart/form-data)                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Key Operations                                                     │ │
│  │ ├─ Receive ZIP file from Frontend                                 │ │
│  │ ├─ Extract ZIP to repos/ directory                                │ │
│  │ ├─ Create project record in Supabase                              │ │
│  │ └─ Trigger Python backend in background                           │ │
│  │    (while sending immediate response to Frontend)                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Dependencies                                                       │ │
│  │ ├─ Express.js (HTTP server)                                       │ │
│  │ ├─ Multer (file upload handling)                                  │ │
│  │ ├─ adm-zip (ZIP extraction)                                       │ │
│  │ ├─ bcryptjs (password hashing)                                    │ │
│  │ ├─ jsonwebtoken (JWT generation)                                  │ │
│  │ ├─ simple-git (Git clone)                                         │ │
│  │ └─ @supabase/supabase-js (DB client)                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ Subprocess Calls
                       │ (execAsync)
                       │
┌──────────────────────▼──────────────────────────────────────────────────┐
│            Python Backend (AI Analysis & Generation)                    │
│         D:\Projects\auto-documentation-generator\Backend                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Commands Executed                                                  │ │
│  │                                                                    │ │
│  │ 1. Analysis Phase:                                                 │ │
│  │    uv run src/main.py analyze --repo-path [extracted-zip-path]   │ │
│  │    ↓                                                               │ │
│  │    Creates: [path]/.ai/docs/                                      │ │
│  │    Generates:                                                      │ │
│  │    - architecture.md     (code structure analysis)                │ │
│  │    - api_endpoints.md    (API documentation)                      │ │
│  │    - data_flow.md        (data flow diagram)                      │ │
│  │    - dependencies.md     (dependency analysis)                    │ │
│  │    - performance.md      (performance analysis)                   │ │
│  │                                                                    │ │
│  │ 2. Generation Phase:                                               │ │
│  │    uv run src/main.py generate readme --repo-path [path]         │ │
│  │    ↓                                                               │ │
│  │    Creates/Updates: [path]/README.md                              │ │
│  │    (Comprehensive project documentation)                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Components:                                                            │
│  ├─ src/main.py (CLI entry point)                                      │ │
│  ├─ agents/analyzer.py (code analysis)                                 │ │
│  ├─ agents/documenter.py (doc generation)                              │ │
│  ├─ handlers/ (command handlers)                                       │ │
│  └─ utils/ (helper functions)                                          │ │
│                                                                          │
│  AI Engine: Ollama (Local LLM)                                         │ │
│  └─ Uses local AI models (no external API calls)                       │ │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ File I/O
                       │
┌──────────────────────▼──────────────────────────────────────────────────┐
│                      File System Storage                                │
│                                                                          │
│  Directory Structure:                                                   │
│  ├─ repos/                                                              │ │
│  │  ├─ [userId]_[projectId1]/      (Extracted ZIP 1)                  │ │
│  │  │  ├─ src/                      (Source files)                     │ │
│  │  │  ├─ .ai/docs/                (Generated analysis)                │ │
│  │  │  │  ├─ architecture.md                                          │ │
│  │  │  │  ├─ api_endpoints.md                                         │ │
│  │  │  │  ├─ data_flow.md                                             │ │
│  │  │  │  ├─ dependencies.md                                          │ │
│  │  │  │  └─ performance.md                                           │ │
│  │  │  └─ README.md                 (Generated)                       │ │
│  │  │                                                                  │ │
│  │  └─ [userId]_[projectId2]/      (Extracted ZIP 2)                  │ │
│  │     └─ ... (same structure)                                        │ │
│  │                                                                     │ │
│  └─ uploads/                                                            │ │
│     └─ [temporary-zip-files]        (Temporary, cleaned up)            │ │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ Write Operations
                       │
┌──────────────────────▼──────────────────────────────────────────────────┐
│          Supabase Database (PostgreSQL)                                 │
│      https://ifsbyxeimgkkjyxgzsod.supabase.co                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ users Table                                                        │ │
│  │ ┌─────────────────────────────────────────────────────────────┐  │ │
│  │ │ id (UUID) │ email │ full_name │ password_hash │ created_at │  │ │
│  │ ├─────────────────────────────────────────────────────────────┤  │ │
│  │ │ uuid-1    │test@  │Test User  │ bcrypt-hash   │ 2024-01-01 │  │ │
│  │ │ uuid-2    │user@  │Other User │ bcrypt-hash   │ 2024-01-02 │  │ │
│  │ └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ projects Table                                                     │ │
│  │ ┌──────────────┬──────────┬────────┬────────────┬────────────┐   │ │
│  │ │ id           │ user_id  │ name   │ status     │ created_at │   │ │
│  │ ├──────────────┼──────────┼────────┼────────────┼────────────┤   │ │
│  │ │ proj-uuid-1  │ uuid-1   │ myapp  │ completed  │ 2024-01-01 │   │ │
│  │ │ proj-uuid-2  │ uuid-1   │ api    │ analyzing  │ 2024-01-02 │   │ │
│  │ └──────────────┴──────────┴────────┴────────────┴────────────┘   │ │
│  │ Statuses: pending → analyzing → generating → completed | failed   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ documentation_files Table                                          │ │
│  │ ┌────────────┬────────────┬────────────┬──────────┬──────────┐    │ │
│  │ │ id         │ project_id │ file_name  │ file_    │ content  │    │ │
│  │ │            │            │            │ type     │          │    │ │
│  │ ├────────────┼────────────┼────────────┼──────────┼──────────┤    │ │
│  │ │ file-1     │ proj-1     │ README     │ readme   │ # myapp  │    │ │
│  │ │ file-2     │ proj-1     │ arch-      │ analysis │ ##       │    │ │
│  │ │            │            │ itecture   │          │ Arch...  │    │ │
│  │ │ file-3     │ proj-1     │ api-docs   │ analysis │ ## APIs  │    │ │
│  │ └────────────┴────────────┴────────────┴──────────┴──────────┘    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ generation_logs Table                                              │ │
│  │ └─ Tracks each step: started → in_progress → completed | failed   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Features:                                                              │ │
│  ├─ Row Level Security (RLS) - Users see only their own data          │ │
│  ├─ Automated backups                                                 │ │
│  ├─ Real-time subscriptions (optional)                                │ │
│  └─ Connection pooling enabled                                        │ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Journey

### Journey 1: Sign Up & Login

```
┌─ User opens http://localhost:5173
│
├─ See Landing Page with "Get Started" button
│
├─ Click "Get Started" → See SignupModal
│  │
│  ├─ Enter: email, fullName, password, confirmPassword
│  │
│  └─ Click "Sign Up"
│     │
│     ├─ Frontend: Validate inputs
│     │
│     ├─ POST /api/auth/signup → Backend
│     │  │
│     │  ├─ Backend: Validate email uniqueness
│     │  │
│     │  ├─ Backend: Hash password with bcryptjs
│     │  │
│     │  ├─ Backend: INSERT into users table
│     │  │
│     │  ├─ Backend: Generate JWT token
│     │  │
│     │  └─ Response: { user, token }
│     │
│     ├─ Frontend: Save token to localStorage
│     │
│     ├─ Frontend: Update AuthContext with user
│     │
│     └─ Frontend: Redirect to /dashboard
│
└─ Dashboard loads with user's name displayed
```

### Journey 2: File Upload & Processing

```
┌─ User logged in on Dashboard
│
├─ Click "Upload ZIP File" button or drag-drop
│
├─ Select test_project.zip from computer
│  │
│  ├─ Frontend: Validate ZIP file format
│  │
│  └─ File appears in upload area
│
├─ Click "Upload & Generate"
│  │
│  ├─ Frontend: Create FormData with zipFile
│  │
│  ├─ Frontend: Include JWT token in Authorization header
│  │
│  ├─ POST /api/projects → Backend
│  │  │
│  │  ├─ Backend: Verify JWT token
│  │  │
│  │  ├─ Backend: Extract ZIP to repos/[userId]_[projectId]/
│  │  │  │
│  │  │  └─ adm-zip extracts all files
│  │  │
│  │  ├─ Backend: Create project in Supabase
│  │  │  │
│  │  │  └─ INSERT into projects table with status='pending'
│  │  │
│  │  ├─ Backend: Start background job (generateDocumentation)
│  │  │  │
│  │  │  ├─ Update status: 'analyzing'
│  │  │  │
│  │  │  ├─ Execute: uv run src/main.py analyze --repo-path [path]
│  │  │  │  │
│  │  │  │  └─ Creates: .ai/docs/ with 5 analysis files
│  │  │  │
│  │  │  ├─ Update status: 'generating'
│  │  │  │
│  │  │  ├─ Execute: uv run src/main.py generate readme --repo-path [path]
│  │  │  │  │
│  │  │  │  └─ Creates/Updates: README.md
│  │  │  │
│  │  │  ├─ Read all generated files from disk
│  │  │  │
│  │  │  ├─ For each file:
│  │  │  │  └─ INSERT into documentation_files table
│  │  │  │
│  │  │  └─ Update status: 'completed'
│  │  │
│  │  └─ Response: { projectId }
│  │
│  ├─ Frontend: Receive response immediately
│  │
│  ├─ Frontend: Create project in local state
│  │
│  ├─ Frontend: Show success message
│  │
│  ├─ Frontend: Start generation animation
│  │
│  └─ Frontend: Start polling /api/projects/[projectId]
│     │
│     ├─ Every 10 seconds:
│     │  │
│     │  ├─ GET /api/projects/[projectId] → Backend
│     │  │  │
│     │  │  ├─ Backend: Query Supabase for project status
│     │  │  │
│     │  │  └─ Response: { project with status, documentation_files[] }
│     │  │
│     │  ├─ Frontend: Check status
│     │  │
│     │  ├─ If status='completed':
│     │  │  └─ Show success message, stop polling
│     │  │
│     │  └─ If status='failed':
│     │     └─ Show error, stop polling
│     │
│     └─ Stop after 10 minutes (if still pending)
│
└─ User can now view generated documentation
```

### Journey 3: View Documentation

```
┌─ Project appears in left sidebar under "Your Projects"
│
├─ Click on project name
│
├─ Frontend: GET /api/projects/[projectId]
│  │
│  ├─ Backend: Query Supabase
│  │  │
│  │  ├─ Fetch project details
│  │  │
│  │  └─ Fetch all documentation_files for this project
│  │
│  └─ Response: { project, documentation_files[] }
│
├─ Frontend: Display documentation tabs
│  │
│  ├─ Tab: "README.md"
│  ├─ Tab: "Architecture"
│  ├─ Tab: "API Documentation"
│  ├─ Tab: "Data Flow"
│  └─ Tab: "Dependencies"
│
├─ User clicks each tab
│
└─ Content loads from Supabase and displays as formatted Markdown
```

---

## 📊 Data Flow Diagram

```
                    ┌─────────────┐
                    │   Browser   │
                    │   (React)   │
                    └──────┬──────┘
                           │
                    HTTP with JWT
                           │
                    ┌──────▼──────┐
                    │  Express    │
                    │  API Server │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    File I/O          Subprocess         DB Query
        │                  │                  │
    ┌───▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ File System│  │   Python    │  │  Supabase   │
    │            │  │  Backend    │  │  Database   │
    │  repos/    │  │             │  │             │
    │  uploads/  │  │ analyzer.py │  │  users      │
    └────────────┘  │ documenter  │  │  projects   │
                    │             │  │  doc_files  │
                    │ (Ollama AI) │  │  gen_logs   │
                    └─────────────┘  └─────────────┘
```

---

## 🔐 Security Flow

```
┌─ User submits credentials
│
├─ Frontend validates format
│
├─ POST to Backend with plaintext password
│  │ (HTTPS in production)
│  │
│  ├─ Backend: Hash password with bcryptjs
│  │
│  ├─ Backend: Store hash in database (never plaintext)
│  │
│  ├─ Backend: Generate JWT with user ID + secret key
│  │  │
│  │  └─ Token includes: { userId, iat, exp }
│  │
│  └─ Backend: Send token back
│
├─ Frontend: Store token in localStorage
│
├─ For every API request:
│  │
│  ├─ Frontend: Include in Authorization header
│  │
│  ├─ Backend middleware: Extract token
│  │
│  ├─ Backend: Verify signature using secret key
│  │
│  ├─ Backend: Extract userId from token
│  │
│  └─ Backend: Proceed with request or reject if invalid
│
├─ Supabase RLS: Even if backend is compromised:
│  │
│  └─ Database ensures users only see their own data
│
└─ Token expires after configured time (optional logout)
```

---

## 📈 Scaling Considerations

### Current Setup (Development)
- Single server running Express
- Files stored locally
- Synchronous processing
- Small database

### For Production
- Multiple server instances (load balancer)
- Files in S3/Cloud Storage
- Job queue (Bull/RabbitMQ) for async processing
- Database connection pooling
- Caching layer (Redis)
- CDN for frontend assets
- Monitoring & alerting

---

## 🎯 Key Metrics to Monitor

1. **Performance**
   - API response time
   - File upload speed
   - Python analysis time
   - Database query speed

2. **Reliability**
   - Uptime percentage
   - Error rates
   - Failed uploads
   - Failed processing

3. **Usage**
   - Total users
   - Daily active users
   - Projects per user
   - Files generated

4. **Resources**
   - CPU usage
   - Memory usage
   - Disk space used
   - Database size

---

## ✨ Summary

This is a **complete, integrated system** with:

```
Frontend          Backend          Python           Database
─────────────────────────────────────────────────────────────
React Vite    →   Express API   →  AI Analysis  →  Supabase
5173              5000               Local            PostgreSQL
                                    
JWT Auth     ←    Verify JWT    ←  (background)  ←  Store/Retrieve
```

**Everything works together seamlessly to deliver amazing documentation!** 🎉
