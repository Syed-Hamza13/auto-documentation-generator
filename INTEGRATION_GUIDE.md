# 🎯 Frontend-Backend Integration Guide

## **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                   Port 5173 (Vite Dev Server)                    │
├─────────────────────────────────────────────────────────────────┤
│  
│  Components:
│  ├── LoginModal.jsx     → /api/auth/login
│  ├── SignupModal.jsx    → /api/auth/signup
│  └── Dashboard.jsx      → /api/projects/*
│
│  Services:
│  └── services/api.js    (All API calls)
│
│  Context:
│  └── context/AuthContext.jsx (Global Auth State)
│
└─────────────────────────────────────────────────────────────────┘
                              ⬇ HTTP/REST
                        (CORS Enabled)
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API (Node.js)                      │
│                   Port 5000 (Express Server)                     │
├─────────────────────────────────────────────────────────────────┤
│
│  Routes:
│  ├── /api/auth
│  │   ├── POST /signup
│  │   ├── POST /login
│  │   └── GET /verify
│  │
│  └── /api/projects
│      ├── POST / (create with zip)
│      ├── GET / (list all)
│      └── GET /:projectId (get one)
│
│  Controllers:
│  ├── authController.js
│  └── projectController.js
│
│  Database:
│  └── Supabase (PostgreSQL)
│
└─────────────────────────────────────────────────────────────────┘
```

---

## **Data Flow Explanation**

### **1. User Signup Flow**
```
User enters name, email, password
        ⬇
SignupModal.jsx (handleSubmit)
        ⬇
import { signup } from services/api.js
        ⬇
signup() → POST /api/auth/signup
        ⬇
Backend: authController.signup()
        ⬇
Hash password with bcryptjs
        ⬇
Store in Supabase (users table)
        ⬇
Generate JWT token
        ⬇
Return { token, user }
        ⬇
Frontend: setAuthToken(token) in localStorage
        ⬇
Update AuthContext: setUser(user)
        ⬇
Navigate to /dashboard
```

### **2. User Login Flow**
```
User enters email, password
        ⬇
LoginModal.jsx (handleSubmit)
        ⬇
login() → POST /api/auth/login
        ⬇
Backend: authController.login()
        ⬇
Find user in Supabase
        ⬇
Compare password with bcryptjs.compare()
        ⬇
Generate JWT token
        ⬇
Return { token, user }
        ⬇
Frontend: setAuthToken(token)
        ⬇
Update AuthContext
        ⬇
Navigate to /dashboard
```

### **3. Protected Routes Flow**
```
User tries to access /dashboard
        ⬇
ProtectedRoute component (App.jsx)
        ⬇
Check: const { user, isLoading } = useAuth()
        ⬇
If user exists → Render Dashboard
If user null → Redirect to "/"
If isLoading → Show spinner
```

### **4. Create Project Flow**
```
User selects ZIP file in Dashboard
        ⬇
Dashboard.jsx: handleUpload()
        ⬇
Create FormData with zipFile
        ⬇
createProject(formData) → POST /api/projects
        ⬇
Backend Auth: Verify JWT token from headers
        ⬇
Backend: projectController.createProject()
        ⬇
Store ZIP file using multer
        ⬇
Extract and analyze code
        ⬇
Call Python backend (AI Documentation)
        ⬇
Generate documentation
        ⬇
Store in Supabase
        ⬇
Return project data
        ⬇
Frontend: Add to projects list
        ⬇
Start generation animation
```

---

## **Setup & Running**

### **Backend Setup**
```bash
cd Backend-API

# Install dependencies
npm install

# Check .env file has:
# PORT=5000
# FRONTEND_URL=http://localhost:5173
# JWT_SECRET=your-secret
# SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

# Start server
npm start
# or nodemon for auto-reload
npx nodemon server.js
```

### **Frontend Setup**
```bash
cd Frontend

# Install dependencies
npm install

# Check .env file has:
# VITE_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
# Port: http://localhost:5173
```

---

## **Testing the Connection**

### **Step 1: Test Health Check**
```bash
# In terminal or Postman
curl http://localhost:5000/health
# Expected: { "status": "ok" }
```

### **Step 2: Test Signup**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Expected response:
# {
#   "token": "eyJhbGci...",
#   "user": {
#     "id": "...",
#     "email": "john@example.com",
#     "fullName": "John Doe"
#   }
# }
```

### **Step 3: Test Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### **Step 4: Test Protected Route**
```bash
# Get token from login, then:
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Step 5: Test in Frontend**
1. Open http://localhost:5173
2. Click "Get Started"
3. Fill signup form and submit
4. Should see success and navigate to dashboard
5. Open DevTools → Network tab → See API calls

---

## **Key Files Modified/Created**

### **Frontend**
- ✅ `src/services/api.js` - API service layer
- ✅ `src/context/AuthContext.jsx` - Global auth state
- ✅ `src/App.jsx` - Added AuthProvider & ProtectedRoute
- ✅ `src/components/LoginModal.jsx` - API integration
- ✅ `src/components/SignupModal.jsx` - API integration
- ✅ `src/pages/Dashboard.jsx` - Project management
- ✅ `.env` - VITE_API_URL

### **Backend**
- ✅ `server.js` - CORS configuration
- ✅ `.env` - FRONTEND_URL added

---

## **Environment Variables Needed**

### **Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

### **Backend (.env)**
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key
SUPABASE_URL=<your-url>
SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_KEY=<your-key>
```

---

## **Common Issues & Fixes**

### **CORS Error**
❌ Problem: "Access to XMLHttpRequest blocked by CORS policy"
✅ Fix: 
- Check FRONTEND_URL in Backend .env
- Backend must have `cors()` enabled
- VITE_API_URL must match backend URL

### **401 Unauthorized**
❌ Problem: "Invalid credentials"
✅ Fix:
- Check JWT_SECRET is same in backend
- Token is being stored in localStorage
- Token is being sent in Authorization header

### **404 Routes Not Found**
❌ Problem: "Cannot POST /api/auth/signup"
✅ Fix:
- Backend routes must be in place
- Check server.js has all routes imported
- Restart backend after changes

### **Frontend not connecting**
❌ Problem: Network calls failing
✅ Fix:
- Ensure backend is running on port 5000
- Check VITE_API_URL in Frontend .env
- Frontend must be on localhost:5173

---

## **Next Steps**

1. **Install Dependencies**
   - `cd Backend-API && npm install`
   - `cd Frontend && npm install`

2. **Start Servers**
   - Terminal 1: `cd Backend-API && npm start`
   - Terminal 2: `cd Frontend && npm run dev`

3. **Test Connection**
   - Open http://localhost:5173
   - Try signup with test data
   - Check Network tab in DevTools

4. **Implement Documentation Routes**
   - Create `/api/documentation` endpoints
   - Connect to Python backend for analysis
   - Display results in Dashboard

5. **Add Error Handling**
   - Implement retry logic
   - Add loading states
   - Better error messages

---

## **Summary**

✅ Frontend (React) → 5173
✅ Backend API (Node.js) → 5000
✅ Database (Supabase) → PostgreSQL
✅ CORS Configured
✅ JWT Authentication
✅ Protected Routes
✅ API Service Layer
✅ Global Auth State

Ab tum aaram se test kar sakte ho! 🚀
