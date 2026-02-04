# AI Doc Gen - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Project Creation Flow](#project-creation-flow)
7. [Documentation Generation Flow](#documentation-generation-flow)
8. [API Endpoints](#api-endpoints)
9. [Frontend Architecture](#frontend-architecture)
10. [Backend Architecture](#backend-architecture)
11. [Data Flow](#data-flow)
12. [File Structure](#file-structure)
13. [Key Functions Reference](#key-functions-reference)
14. [Storage Management](#storage-management)
15. [Error Handling](#error-handling)
16. [Security Considerations](#security-considerations)

---

## 1. Project Overview

### Purpose
AI Doc Gen is a SaaS platform that automatically generates professional documentation for software repositories using AI-powered analysis. It eliminates the manual effort of writing README files, architecture diagrams, API documentation, and data flow analysis.

### Core Features
- **Automated Documentation Generation**: Analyzes code structure and generates comprehensive documentation
- **Multi-Source Support**: Accepts GitHub/GitLab repository links or ZIP file uploads
- **Real-time Processing**: Live status updates during documentation generation
- **Cloud Storage**: Documents stored in Supabase Storage for scalability
- **User Authentication**: JWT-based secure authentication
- **Project History**: Access to all previously generated documentation

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                    (React Frontend - Port 5173)                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS/REST API
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                   Node.js API Server                             │
│                  (Express - Port 5000)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Routes  │  │Project Routes│  │  Middleware  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────┬───────────────────┬──────────────────┬──────────────────┘
        │                   │                  │
        │                   │                  │
┌───────▼───────────┐  ┌────▼─────────────┐  ┌▼──────────────────┐
│  Supabase Cloud   │  │ Python Backend   │  │ Local File System │
│  ┌─────────────┐  │  │  (UV Runner)     │  │   (Temporary)     │
│  │ PostgreSQL  │  │  │                  │  └───────────────────┘
│  │ Database    │  │  │ ┌──────────────┐ │
│  └─────────────┘  │  │ │   Analyzer   │ │
│  ┌─────────────┐  │  │ └──────────────┘ │
│  │   Storage   │  │  │ ┌──────────────┐ │
│  │   Bucket    │  │  │ │  Generator   │ │
│  └─────────────┘  │  │ └──────────────┘ │
└───────────────────┘  └──────────────────┘
```

### Component Responsibilities

1. **Frontend (React)**: User interface, state management, API calls
2. **Backend API (Node.js)**: Request handling, authentication, orchestration
3. **Supabase**: Database operations, file storage, authentication infrastructure
4. **Python Backend**: Code analysis, documentation generation using AI models
5. **Local File System**: Temporary storage during processing

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.5
- **Routing**: React Router DOM 6.x
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 3.4.17
- **Icons**: Lucide React 0.263.1

### Backend API Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Database Client**: @supabase/supabase-js
- **File Operations**: extract-zip, simple-git
- **Process Management**: child_process (for Python execution)

### Python Backend
- **Language**: Python 3.13
- **Package Manager**: UV
- **AI Framework**: Ollama (local LLM)
- **Async Operations**: asyncio
- **Validation**: Pydantic

### Database & Storage
- **Database**: Supabase PostgreSQL
- **Object Storage**: Supabase Storage
- **Authentication**: Supabase Auth (infrastructure only)

### DevOps
- **Version Control**: Git
- **Environment Variables**: dotenv
- **CORS**: cors middleware

---

## 4. Database Schema

### Tables Structure

#### 4.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Stores user account information
**Key Fields**:
- `id`: Unique user identifier (UUID)
- `email`: User's email address (unique constraint)
- `password_hash`: Bcrypt-hashed password (never stored plain text)
- `full_name`: Display name for the user

#### 4.2 Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  repo_source TEXT NOT NULL,
  repo_type TEXT CHECK (repo_type IN ('github', 'gitlab', 'zip')),
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'analyzing', 'generating', 'completed', 'failed')),
  local_path TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
```

**Purpose**: Tracks documentation generation projects
**Key Fields**:
- `user_id`: Foreign key to users table (cascade delete)
- `name`: Project/repository name
- `repo_source`: Original source (URL or filename)
- `repo_type`: Source type (github/gitlab/zip)
- `status`: Current processing state
- `local_path`: Temporary storage path (null after cleanup)

**Status Flow**:
```
pending → analyzing → generating → completed
                                 ↘ failed
```

#### 4.3 Documentation Files Table
```sql
CREATE TABLE documentation_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_url TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_docs_project_id ON documentation_files(project_id);
CREATE INDEX idx_docs_storage_url ON documentation_files(storage_url);
```

**Purpose**: Stores references to generated documentation files
**Key Fields**:
- `project_id`: Links to parent project (cascade delete)
- `file_name`: Display name (without extension)
- `file_path`: Storage path in Supabase
- `file_type`: Document category (analysis/readme)
- `storage_url`: Public URL for file access
- `content`: Optional inline content (deprecated, use storage_url)

### Relationships

```
users (1) ──────< (N) projects (1) ──────< (N) documentation_files
```

- One user can have multiple projects
- One project can have multiple documentation files
- Cascade deletes ensure data consistency

---

## 5. Authentication System

### 5.1 Authentication Flow

```
User Registration/Login
        ↓
Frontend validates input
        ↓
POST /api/auth/signup or /api/auth/login
        ↓
Backend validates credentials
        ↓
Password hashed/verified with bcrypt
        ↓
User record created/retrieved from Supabase
        ↓
JWT token generated (7-day expiry)
        ↓
Token + user data returned to frontend
        ↓
Token stored in localStorage
        ↓
Token included in all subsequent requests
```

### 5.2 JWT Token Structure

**Payload**:
```javascript
{
  userId: "uuid",
  email: "user@example.com",
  iat: 1234567890,  // Issued at
  exp: 1235172690   // Expires at (7 days later)
}
```

**Secret**: Environment variable `JWT_SECRET` (256-bit recommended)

### 5.3 Request Authentication

Every protected API request includes:
```
Authorization: Bearer <jwt_token>
```

**Middleware Flow**:
```javascript
Request → authMiddleware checks header → 
  ├─ No token → 401 Unauthorized
  ├─ Invalid token → 401 Invalid token
  └─ Valid token → Extract userId → Attach to req.user → Next()
```

### 5.4 Token Refresh Strategy

Current implementation: **No automatic refresh**
- Token expires after 7 days
- User must log in again
- Future enhancement: Implement refresh token rotation

---

## 6. Project Creation Flow

### 6.1 Complete Flow Diagram

```
User submits repository (link or ZIP)
        ↓
Frontend validates input
        ↓
[ZIP Path]                           [GitHub/GitLab Path]
     ↓                                       ↓
Upload via FormData                   Send as JSON body
     ↓                                       ↓
Backend receives file                 Backend receives URL
     ↓                                       ↓
Save to uploads/ folder               Create target directory
     ↓                                       ↓
Extract ZIP to repos/                 Git clone to repos/
     ↓                                       ↓
Detect project root folder            Verify clone success
     ↓                                       ↓
Delete original ZIP                   ──────┘
     ↓                                       
Verify extracted path exists
     ↓
Create project record in database (status: pending)
     ↓
Trigger background generation process
     ↓
Return projectId to frontend
     ↓
Frontend starts polling for status updates
```

### 6.2 File Upload Handling

**Configuration** (Backend-API):
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.single('zipFile'), projectController.createProject);
```

**Storage Location**:
- Temporary: `uploads/random-filename`
- Extraction: `repos/userId_uuid/project-name/`

### 6.3 Git Clone Handling

**Process**:
```javascript
const simpleGit = require('simple-git');
const git = simpleGit();

await git.clone(repoLink, localPath);
```

**Example Paths**:
- Input: `https://github.com/user/project.git`
- Output: `repos/userId_abc123/project/`

---

## 7. Documentation Generation Flow

### 7.1 Complete Generation Pipeline

```
Project created with status: pending
        ↓
Background function: generateDocumentation() starts
        ↓
Update status: analyzing
        ↓
Execute Python command: analyze --repo-path
        ↓
Python backend:
  ├─ Scans repository structure
  ├─ Analyzes dependencies
  ├─ Maps data flows
  ├─ Extracts API patterns
  └─ Generates 5 analysis files (.ai/docs/)
        ↓
Update status: generating
        ↓
Execute Python command: generate readme --repo-path
        ↓
Python backend:
  ├─ Synthesizes analysis results
  ├─ Uses Ollama LLM for content generation
  └─ Creates README.md
        ↓
Upload files to Supabase Storage
        ↓
Store file references in database
        ↓
Update status: completed
        ↓
Cleanup local files
        ↓
Frontend polls and detects completion
        ↓
Display documents to user
```

### 7.2 Python Backend Integration

**Command Execution** (pythonRunner.js):
```javascript
const { exec } = require('child_process');

async function runPythonAnalysis(repoPath) {
  const command = `cd ${process.env.PYTHON_BACKEND_PATH} && uv run src/main.py analyze --repo-path "${repoPath}"`;
  await execPromise(command);
}

async function runPythonGenerate(repoPath) {
  const command = `cd ${process.env.PYTHON_BACKEND_PATH} && uv run src/main.py generate readme --repo-path "${repoPath}"`;
  await execPromise(command);
}
```

**Generated Files**:
1. `api_analysis.md` - API endpoint documentation
2. `data_flow_analysis.md` - Data flow diagrams
3. `dependency_analysis.md` - Dependency tree
4. `request_flow_analysis.md` - Request/response flows
5. `structure_analysis.md` - Project structure overview
6. `README.md` - Main project documentation

### 7.3 File Upload to Storage

**Upload Function** (projectController.js):
```javascript
async function uploadDocumentationToStorage(projectId, repoPath, userId) {
  const docsPath = path.join(repoPath, '.ai', 'docs');
  const files = await fs.readdir(docsPath);
  
  for (const file of files) {
    // Read file content
    const fileContent = await fs.readFile(path.join(docsPath, file));
    
    // Upload to Supabase
    const storagePath = `${userId}/${projectId}/analysis/${file}`;
    await supabase.storage
      .from('documentation-files')
      .upload(storagePath, fileContent, {
        contentType: 'text/markdown',
        upsert: true
      });
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documentation-files')
      .getPublicUrl(storagePath);
    
    // Store reference in database
    await supabase
      .from('documentation_files')
      .insert({
        project_id: projectId,
        file_name: file.replace('.md', ''),
        file_path: storagePath,
        file_type: 'analysis',
        storage_url: publicUrl
      });
  }
}
```

### 7.4 Local Cleanup

**Cleanup Function**:
```javascript
async function cleanupLocalFiles(repoPath) {
  const parentPath = path.dirname(repoPath);
  
  if (parentPath.includes(process.env.REPOS_STORAGE_PATH)) {
    await fs.rm(parentPath, { recursive: true, force: true });
  }
}
```

**Cleanup Timing**: After successful upload to Supabase Storage

---

## 8. API Endpoints

### 8.1 Authentication Endpoints

#### POST /api/auth/signup
**Purpose**: Register new user account

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

**Error Responses**:
- 400: User already exists
- 500: Signup failed

#### POST /api/auth/login
**Purpose**: Authenticate existing user

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

**Error Responses**:
- 401: Invalid credentials
- 500: Login failed

#### GET /api/auth/verify
**Purpose**: Verify JWT token validity

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-string",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- 401: Invalid or expired token

---

### 8.2 Project Endpoints

#### POST /api/projects
**Purpose**: Create new documentation project

**Headers**: `Authorization: Bearer <token>`

**Request Body (GitHub/GitLab)**:
```json
{
  "repoLink": "https://github.com/username/repository",
  "repoType": "github"
}
```

**Request Body (ZIP Upload)**:
```
Content-Type: multipart/form-data

zipFile: [binary file data]
repoType: "zip"
```

**Response** (200 OK):
```json
{
  "projectId": "uuid-string",
  "message": "Project created successfully. Documentation generation started."
}
```

**Error Responses**:
- 400: Repository link or ZIP file required
- 401: Authentication required
- 500: Failed to create project

#### GET /api/projects
**Purpose**: Retrieve all user projects

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "projects": [
    {
      "id": "uuid-1",
      "user_id": "user-uuid",
      "name": "my-project",
      "repo_source": "https://github.com/user/project",
      "repo_type": "github",
      "status": "completed",
      "created_at": "2025-02-04T10:00:00Z",
      "completed_at": "2025-02-04T10:05:00Z",
      "documentation_files": [
        { "count": 6 }
      ]
    }
  ]
}
```

**Error Responses**:
- 401: Authentication required
- 500: Failed to fetch projects

#### GET /api/projects/:projectId
**Purpose**: Retrieve single project with all documentation files

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "project": {
    "id": "uuid-1",
    "user_id": "user-uuid",
    "name": "my-project",
    "repo_source": "https://github.com/user/project",
    "status": "completed",
    "documentation_files": [
      {
        "id": "doc-uuid-1",
        "file_name": "api_analysis",
        "file_type": "analysis",
        "storage_url": "https://supabase.co/storage/.../api_analysis.md",
        "created_at": "2025-02-04T10:05:00Z"
      },
      {
        "id": "doc-uuid-2",
        "file_name": "README",
        "file_type": "readme",
        "storage_url": "https://supabase.co/storage/.../README.md",
        "created_at": "2025-02-04T10:05:00Z"
      }
    ]
  }
}
```

**Error Responses**:
- 401: Authentication required
- 404: Project not found
- 500: Failed to fetch project

---

## 9. Frontend Architecture

### 9.1 Component Hierarchy

```
App.jsx
├─ AuthProvider (Context)
│  └─ BrowserRouter
│     └─ Routes
│        ├─ LandingPage
│        │  ├─ LoginModal
│        │  └─ SignupModal
│        │
│        └─ ProtectedRoute
│           └─ Dashboard
│              ├─ ProjectsMenu (Sidebar)
│              ├─ DocumentViewer
│              ├─ GeneratingView
│              └─ EmptyState
```

### 9.2 State Management

#### Global State (AuthContext)
```javascript
{
  user: {
    id: "uuid",
    email: "user@example.com",
    fullName: "John Doe"
  },
  isAuthenticated: true,
  loading: false
}
```

**Methods**:
- `login(email, password)`: Authenticate user
- `signup(fullName, email, password)`: Register user
- `logout()`: Clear session
- `checkAuth()`: Verify token on mount

#### Local State (Dashboard)
```javascript
{
  currentProject: { /* project object */ },
  projects: [ /* array of projects */ ],
  selectedDoc: { /* documentation file */ },
  showOverlay: false,
  showProjectsMenu: false,
  loading: false,
  pollInterval: null
}
```

### 9.3 Service Layer

#### API Configuration (api.js)
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

#### Auth Service (authService.js)
**Methods**:
- `signup(fullName, email, password)`: POST /api/auth/signup
- `login(email, password)`: POST /api/auth/login
- `logout()`: Clear localStorage
- `verifyToken()`: GET /api/auth/verify
- `getCurrentUser()`: Get user from localStorage
- `isAuthenticated()`: Check token existence

#### Project Service (projectService.js)
**Methods**:
- `createProjectWithLink(repoLink, repoType)`: POST /api/projects
- `createProjectWithZip(zipFile)`: POST /api/projects (multipart)
- `getProjects()`: GET /api/projects
- `getProjectById(projectId)`: GET /api/projects/:id
- `pollProjectStatus(projectId, callback, interval)`: Real-time updates

### 9.4 Routing Protection

**ProtectedRoute Component**:
```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" />;
  return children;
}
```

**Usage**:
```javascript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 10. Backend Architecture

### 10.1 Server Structure

**Entry Point** (server.js):
```javascript
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.listen(5000);
```

### 10.2 Middleware Layer

#### Authentication Middleware (auth.js)
```javascript
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { userId, email }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 10.3 Controller Layer

**Responsibilities**:
1. Request validation
2. Business logic orchestration
3. Database operations
4. Response formatting

**Example** (authController.js):
```javascript
exports.signup = async (req, res) => {
  // 1. Extract and validate input
  const { fullName, email, password } = req.body;
  
  // 2. Check if user exists
  const existingUser = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // 4. Create user
  const { data: newUser } = await supabase
    .from('users')
    .insert([{ email, full_name: fullName, password_hash: passwordHash }])
    .select()
    .single();
  
  // 5. Generate JWT
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // 6. Return response
  res.json({ token, user: { id: newUser.id, email, fullName } });
};
```

### 10.4 Utility Layer

#### Python Runner (pythonRunner.js)
```javascript
async function runPythonAnalysis(repoPath) {
  const command = `cd ${process.env.PYTHON_BACKEND_PATH} && uv run src/main.py analyze --repo-path "${repoPath}"`;
  
  const { stdout, stderr } = await execPromise(command);
  
  if (stderr) console.error('Analysis stderr:', stderr);
  return stdout;
}
```

**Error Handling**: Propagates errors to caller for proper status updates

---

## 11. Data Flow

### 11.1 User Registration Flow

```
┌──────────┐     POST /api/auth/signup      ┌──────────────┐
│ Frontend │ ────────────────────────────▶  │ Auth         │
│          │   {fullName, email, password}  │ Controller   │
└──────────┘                                └──────┬───────┘
                                                   │
                                                   ├─ Check email exists
                                                   │
                                            ┌──────▼───────┐
                                            │   Supabase   │
                                            │   Database   │
                                            └──────┬───────┘
                                                   │
                                                   ├─ Hash password (bcrypt)
                                                   ├─ INSERT user record
                                                   ├─ Generate JWT token
                                                   │
┌──────────┐     { token, user }            ┌──────▼───────┐
│ Frontend │ ◀──────────────────────────────│   Response   │
│          │                                │              │
└──────────┘                                └──────────────┘
     │
     ├─ Store token in localStorage
     ├─ Store user in localStorage
     └─ Navigate to /dashboard
```

### 11.2 Project Creation with ZIP Flow

```
┌──────────┐     ZIP File Upload           ┌──────────────┐
│ Frontend │ ────────────────────────────▶ │   Multer     │
│          │   FormData + Authorization    │   Middleware │
└──────────┘                               └──────┬───────┘
                                                  │
                                                  ├─ Save to uploads/
                                                  │
                                           ┌──────▼───────┐
                                           │   Project    │
                                           │  Controller  │
                                           └──────┬───────┘
                                                  │
                                                  ├─ Extract ZIP
                                                  ├─ Detect project root
                                                  ├─ Delete original ZIP
                                                  │
                                           ┌──────▼───────┐
                                           │   Supabase   │
                                           │   Database   │
                                           └──────┬───────┘
                                                  │
                                                  ├─ INSERT project (status: pending)
                                                  ├─ Return projectId
                                                  │
┌──────────┐     { projectId, message }    ┌──────▼───────┐
│ Frontend │ ◀──────────────────────────────│   Response   │
│          │                                │              │
└────┬─────┘                                └──────────────┘
     │
     ├─ Start polling for status
     │
     └─ Display progress UI

[Background Process Starts]

                                           ┌──────────────┐
                                           │ Background   │
                                           │ Function     │
                                           └──────┬───────┘
                                                  │
                                                  ├─ Update status: analyzing
                                                  │
                                           ┌──────▼───────┐
                                           │   Python     │
                                           │   Backend    │
                                           └──────┬───────┘
                                                  │
                                                  ├─ Analyze repository
                                                  ├─ Generate .ai/docs/*.md
                                                  │
                                           ┌──────▼───────┐
                                           │ Background   │
                                           │ Function     │
                                           └──────┬───────┘
                                                  │
                                                  ├─ Update status: generating
                                                  │
                                           ┌──────▼───────┐
                                           │   Python     │
                                           │   Backend    │
                                           └──────┬───────┘
                                                  │
                                                  ├─ Generate README.md
                                                  │
                                           ┌──────▼───────┐
                                           │   Upload     │
                                           │   Function   │
                                           └──────┬───────┘
                                                  │
                                                  ├─ For each file:
                                                  │   ├─ Read content
                                                  │   ├─ Upload to Supabase Storage
                                                  │   ├─ Get public URL
                                                  │   └─ INSERT documentation_files
                                                  │
                                                  ├─ Update status: completed
                                                  │
                                           ┌──────▼───────┐
                                           │   Cleanup    │
                                           │   Function   │
                                           └──────┬───────┘
                                                  │
                                                  └─ Delete local repository
```

### 11.3 Document Viewing Flow

```
┌──────────┐     Click document            ┌──────────────┐
│ Frontend │ ────────────────────────────▶ │   Select     │
│          │                                │   Document   │
└──────────┘                                └──────┬───────┘
                                                   │
                                                   ├─ Get storage_url from state
                                                   │
┌──────────┐     GET storage_url           ┌──────▼───────┐
│ Frontend │ ────────────────────────────▶ │   Supabase   │
│          │                                │   Storage    │
└──────────┘                                │   (CDN)      │
     │                                      └──────┬───────┘
     │                                             │
     │           Markdown content                  │
     ◀─────────────────────────────────────────────┘
     │
     ├─ Parse and display content
     │
     └─ Enable copy/download actions
```

### 11.4 Real-time Status Polling

```
┌──────────┐                               ┌──────────────┐
│ Frontend │                               │   Polling    │
│          │ ──────────────────────────────│   Timer      │
└──────────┘   Every 3 seconds             └──────┬───────┘
     ▲                                            │
     │                                            │
     │         GET /api/projects/:id       ┌──────▼───────┐
     └─────────────────────────────────────│   Backend    │
                                           │   API        │
                                           └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │   Supabase   │
                                           │   Database   │
                                           └──────┬───────┘
                                                  │
                                                  ├─ SELECT project with docs
                                                  │
         { project with status }            ┌────▼─────┐
┌──────────┐                               │ Response │
│ Frontend │ ◀─────────────────────────────│          │
│          │                               └──────────┘
└────┬─────┘
     │
     ├─ Update UI based on status
     │
     └─ Stop polling if completed/failed
```

---

## 12. File Structure

### 12.1 Frontend Structure

```
Frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Root component with routing
│   ├── index.css                   # Global styles + Tailwind
│   │
│   ├── components/
│   │   ├── LoginModal.jsx          # Login form modal
│   │   └── SignupModal.jsx         # Signup form modal
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx         # Public landing page
│   │   └── Dashboard.jsx           # Protected dashboard
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Global auth state
│   │
│   ├── services/
│   │   ├── api.js                  # Axios configuration
│   │   ├── authService.js          # Auth API calls
│   │   └── projectService.js       # Project API calls
│   │
│   └── utils/
│       └── ProtectedRoute.jsx      # Route guard component
│
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### 12.2 Backend API Structure

```
Backend-API/
├── .env                            # Environment variables
├── server.js                       # Express server entry
├── package.json
│
├── config/
│   └── supabase.js                 # Supabase client config
│
├── middleware/
│   └── auth.js                     # JWT verification
│
├── routes/
│   ├── auth.js                     # Auth route definitions
│   └── projects.js                 # Project route definitions
│
├── controllers/
│   ├── authController.js           # Auth business logic
│   └── projectController.js        # Project business logic
│
├── utils/
│   ├── pythonRunner.js             # Python subprocess execution
│   └── cleanup.js                  # Optional cleanup script
│
└── uploads/                        # Temporary ZIP storage
    └── .gitkeep
```

### 12.3 Python Backend Structure

```
Backend/
├── src/
│   ├── main.py                     # CLI entry point
│   ├── config.py                   # Configuration management
│   ├── analyzer/                   # Code analysis modules
│   └── generator/                  # Documentation generation
│
├── .venv/                          # Virtual environment
├── pyproject.toml                  # Python dependencies
└── uv.lock
```

---

## 13. Key Functions Reference

### 13.1 Frontend Functions

#### AuthContext Functions

**login(email, password)**
- **Purpose**: Authenticate user and store session
- **Flow**: Call authService.login → Store token → Update context state
- **Side Effects**: Navigate to dashboard on success

**signup(fullName, email, password)**
- **Purpose**: Register new user account
- **Flow**: Call authService.signup → Store token → Update context state
- **Side Effects**: Navigate to dashboard on success

**logout()**
- **Purpose**: Clear user session
- **Flow**: Clear localStorage → Reset context state
- **Side Effects**: User redirected to landing page

#### Dashboard Functions

**loadProjects()**
- **Purpose**: Fetch all user projects from API
- **Flow**: GET /api/projects → Set projects state → Load first project
- **Error Handling**: Show toast on failure, display overlay

**loadProject(projectId)**
- **Purpose**: Load specific project with documentation files
- **Flow**: GET /api/projects/:id → Set currentProject → Start polling if needed
- **Side Effects**: Select first available document

**startPolling(projectId)**
- **Purpose**: Real-time status updates for generating projects
- **Flow**: Interval every 3s → GET /api/projects/:id → Update state
- **Stop Condition**: Status is 'completed' or 'failed'

**handleLetsGo()**
- **Purpose**: Submit new project for documentation generation
- **Flow**: 
  - If ZIP: POST multipart/form-data
  - If link: POST JSON
  - Close overlay → Reload projects → Start polling
- **Error Handling**: Show toast, re-open overlay

### 13.2 Backend Functions

#### authController Functions

**signup(req, res)**
- **Inputs**: req.body = { fullName, email, password }
- **Process**:
  1. Validate input
  2. Check if email exists
  3. Hash password (bcrypt, salt rounds: 10)
  4. INSERT user into database
  5. Generate JWT token
  6. Return { token, user }
- **Errors**: 400 (exists), 500 (server error)

**login(req, res)**
- **Inputs**: req.body = { email, password }
- **Process**:
  1. Validate input
  2. SELECT user by email
  3. Verify password hash
  4. Generate JWT token
  5. Return { token, user }
- **Errors**: 401 (invalid credentials), 500 (server error)

**verifyToken(req, res)**
- **Inputs**: req.user (from middleware)
- **Process**: Return user data from decoded token
- **Errors**: 401 (handled by middleware)

#### projectController Functions

**createProject(req, res)**
- **Inputs**: req.body = { repoLink, repoType } OR req.file (ZIP)
- **Process**:
  1. Determine source type (link/ZIP)
  2. If ZIP: Extract to repos/ folder
  3. If link: Git clone to repos/ folder
  4. Verify path exists
  5. INSERT project into database
  6. Trigger generateDocumentation() in background
  7. Return { projectId, message }
- **Errors**: 400 (no source), 500 (processing failed)

**generateDocumentation(projectId, repoPath, userId)** [Background]
- **Inputs**: Project ID, local path, user ID
- **Process**:
  1. Update status: analyzing
  2. Execute: uv run main.py analyze
  3. Update status: generating
  4. Execute: uv run main.py generate
  5. Call uploadDocumentationToStorage()
  6. Update status: completed
  7. Call cleanupLocalFiles()
- **Error Handling**: Update status to 'failed', attempt cleanup

**uploadDocumentationToStorage(projectId, repoPath, userId)**
- **Inputs**: Project ID, local path, user ID
- **Process**:
  1. Read files from .ai/docs/
  2. For each file:
     - Upload to Supabase Storage
     - Get public URL
     - INSERT documentation_files record
  3. Repeat for README.md
- **Storage Path**: `userId/projectId/analysis/filename.md`

**cleanupLocalFiles(repoPath)**
- **Inputs**: Repository local path
- **Process**:
  1. Get parent directory
  2. Verify path is in REPOS_STORAGE_PATH
  3. Delete entire directory tree
- **Safety**: Only deletes if path matches expected pattern

**getProjects(req, res)**
- **Inputs**: req.user.userId (from JWT)
- **Process**: SELECT projects with file counts, ORDER BY created_at DESC
- **Returns**: Array of project objects

**getProjectById(req, res)**
- **Inputs**: req.params.projectId, req.user.userId
- **Process**: SELECT project with all documentation_files
- **Returns**: Complete project object with nested files array
- **Authorization**: Ensures user owns the project

### 13.3 Utility Functions

**runPythonAnalysis(repoPath)**
- **Purpose**: Execute Python analysis command
- **Command**: `cd ${BACKEND_PATH} && uv run src/main.py analyze --repo-path "${repoPath}"`
- **Returns**: stdout string
- **Errors**: Throws if command fails

**runPythonGenerate(repoPath)**
- **Purpose**: Execute Python README generation
- **Command**: `cd ${BACKEND_PATH} && uv run src/main.py generate readme --repo-path "${repoPath}"`
- **Returns**: stdout string
- **Errors**: Throws if command fails

---

## 14. Storage Management

### 14.1 Supabase Storage Structure

```
Storage Bucket: documentation-files
├── userId1/
│   ├── projectId1/
│   │   ├── analysis/
│   │   │   ├── api_analysis.md
│   │   │   ├── data_flow_analysis.md
│   │   │   ├── dependency_analysis.md
│   │   │   ├── request_flow_analysis.md
│   │   │   └── structure_analysis.md
│   │   └── README.md
│   │
│   └── projectId2/
│       └── ...
│
└── userId2/
    └── ...
```

### 14.2 Storage Policies

**Policy 1: Allow Authenticated Uploads**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentation-files');
```

**Policy 2: Allow Public Downloads**
```sql
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentation-files');
```

**Policy 3: Allow Users to Delete Own Files**
```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentation-files');
```

### 14.3 Storage Lifecycle

**Upload Process**:
1. File read from local filesystem
2. Convert to Buffer/Blob
3. Upload to Supabase with metadata:
   - contentType: 'text/markdown'
   - upsert: true (overwrite if exists)
4. Retrieve public URL
5. Store URL in database

**Download Process** (Frontend):
1. Retrieve storage_url from database
2. Fetch URL directly (CDN-cached)
3. Parse markdown content
4. Display in DocumentViewer

**Deletion** (Future Enhancement):
- When project is deleted, cascade deletes all documentation_files
- Storage files remain (orphaned)
- Manual cleanup script needed OR implement ON DELETE trigger

---

## 15. Error Handling

### 15.1 Frontend Error Handling

**Network Errors**:
```javascript
try {
  await api.post('/projects', data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    showToast(error.response.data.error);
  } else if (error.request) {
    // No response received
    showToast('Network error. Please check connection.');
  } else {
    // Request setup error
    showToast('Failed to create project');
  }
}
```

**Authentication Errors**:
```javascript
// Handled globally in axios interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### 15.2 Backend Error Handling

**Controller-Level**:
```javascript
exports.createProject = async (req, res) => {
  try {
    // Main logic
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create project' 
    });
  }
};
```

**Background Process**:
```javascript
async function generateDocumentation(projectId, repoPath, userId) {
  try {
    // Generation logic
  } catch (error) {
    console.error('Documentation generation error:', error);
    
    // Update project status
    await supabase
      .from('projects')
      .update({ status: 'failed' })
      .eq('id', projectId);
    
    // Attempt cleanup
    try {
      await cleanupLocalFiles(repoPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}
```

**Python Execution Errors**:
```javascript
async function runPythonAnalysis(repoPath) {
  try {
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Analysis stderr:', stderr);
      // Log but don't fail - stderr might contain warnings
    }
    
    return stdout;
  } catch (error) {
    console.error('Python execution error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}
```

### 15.3 Error Response Format

**Standard Error Response**:
```json
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes**:
- 400: Bad Request (invalid input)
- 401: Unauthorized (auth required/failed)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (unexpected failure)

---

## 16. Security Considerations

### 16.1 Authentication Security

**Password Storage**:
- Never store plain text passwords
- Use bcrypt with salt rounds ≥ 10
- Hash verification is constant-time (timing attack resistant)

**JWT Tokens**:
- Signed with secret key (256-bit recommended)
- 7-day expiration
- Stored in localStorage (XSS vulnerable - consider httpOnly cookies)
- No refresh token (future enhancement needed)

**Token Transmission**:
- Always sent in Authorization header
- Never in URL parameters or body
- HTTPS required in production

### 16.2 Input Validation

**Frontend Validation**:
- Email format check
- Password length (6+ characters)
- Required field validation
- File type validation (.zip only)

**Backend Validation**:
- Re-validate all inputs (never trust client)
- SQL injection protection (Supabase SDK handles this)
- Path traversal prevention in file operations
- URL validation for Git clones

### 16.3 Authorization

**Resource Access Control**:
```javascript
// Verify user owns the project
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .eq('user_id', userId)  // Critical: filter by owner
  .single();
```

**Database-Level Security**:
- Foreign key constraints prevent orphaned records
- Cascade deletes ensure data consistency
- Row-level security (RLS) can be added to Supabase tables

### 16.4 File Upload Security

**Validation**:
- File type check (only .zip allowed)
- File size limit (enforced by multer config)
- Sanitize filenames
- Isolated extraction directories

**Path Safety**:
```javascript
// Only delete paths within REPOS_STORAGE_PATH
if (parentPath.includes(process.env.REPOS_STORAGE_PATH)) {
  await fs.rm(parentPath, { recursive: true });
}
```

### 16.5 Environment Variables

**Sensitive Data** (Never commit to Git):
- JWT_SECRET
- SUPABASE_SERVICE_KEY
- Database credentials

**Security Best Practices**:
- Use .env files
- Add .env to .gitignore
- Use different secrets per environment
- Rotate secrets periodically

### 16.6 CORS Configuration

**Current Setup**:
```javascript
app.use(cors());  // Allows all origins (development)
```

**Production Recommendation**:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### 16.7 Rate Limiting (Future Enhancement)

**Recommended**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Limit each IP to 100 requests per window
});

app.use('/api/', limiter);
```

---

## Appendix: Environment Configuration

### Frontend (.env) - Not currently used
```env
# Add if needed for API base URL configuration
VITE_API_BASE_URL=http://localhost:5000
```

### Backend API (.env) - Required
```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Authentication
JWT_SECRET=your-secret-at-least-32-characters-long

# Python Backend
PYTHON_BACKEND_PATH=D:/Projects/auto-documentation-generator/Backend

# Storage
REPOS_STORAGE_PATH=D:/Projects/auto-documentation-generator/repos
```

### Python Backend
- Uses UV for dependency management
- Configuration in pyproject.toml
- Environment-specific settings in config files

---

## Document Version
- **Version**: 1.0
- **Last Updated**: February 4, 2025
