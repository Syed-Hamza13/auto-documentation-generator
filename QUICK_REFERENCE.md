# ⚡ Quick Reference Card

## 🚀 30-Second Startup

```bash
# Terminal 1
cd Backend-API && npm install && node server.js

# Terminal 2  
cd Frontend && npm install && npm run dev

# Then open: http://localhost:5173
```

---

## 📋 Pre-Flight Checklist (Do This First!)

- [ ] Run SUPABASE_SETUP.sql in Supabase SQL Editor
- [ ] Update .env files (Backend-API and Frontend)
- [ ] Create repos/ directory
- [ ] Run `npm install adm-zip` in Backend-API
- [ ] Verify Python backend is installed

---

## 🔑 Environment Variables Needed

### Backend-API/.env
```
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
JWT_SECRET=your-secret-key
PYTHON_BACKEND_PATH=D:\Projects\auto-documentation-generator\Backend
REPOS_STORAGE_PATH=D:\Projects\auto-documentation-generator\repos
```

### Frontend/.env
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🔗 API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/signup` | POST | ❌ | Create account |
| `/api/auth/login` | POST | ❌ | Login |
| `/api/auth/verify` | POST | ✅ | Check token |
| `/api/projects` | POST | ✅ | Upload ZIP |
| `/api/projects` | GET | ✅ | Get projects |
| `/api/projects/:id` | GET | ✅ | Get project + docs |

---

## 📊 Database Quick Check

```sql
-- Users
SELECT COUNT(*) FROM users;

-- Projects
SELECT name, status, created_at FROM projects;

-- Documentation files
SELECT COUNT(*) FROM documentation_files;
```

---

## 🧪 Test Workflow

### 1. Sign Up
- Email: test@example.com
- Name: Test User
- Password: TestPass123!

### 2. Upload ZIP
- Create folder with Python files
- Zip it
- Upload via Dashboard

### 3. Monitor
- Watch generation steps
- Project status changes:
  - pending → analyzing → generating → completed

### 4. Verify
- Files appear in Supabase documentation_files table
- Dashboard shows generated documentation
- Click tabs to view different files

---

## ⚠️ Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Cannot find module 'adm-zip' | `npm install adm-zip` in Backend-API |
| ZIP extraction fails | Verify repos/ dir exists and is writable |
| Python commands error | Check PYTHON_BACKEND_PATH in .env |
| No files in dashboard | Query: `SELECT * FROM documentation_files;` |
| CORS errors | Verify FRONTEND_URL in Backend .env |
| Cannot connect to Supabase | Verify keys in .env and table creation |

---

## 📁 Key File Locations

| What | Where |
|------|-------|
| Frontend app | Frontend/src/pages/Dashboard.jsx |
| Backend API | Backend-API/controllers/projectController.js |
| Database config | Backend-API/config/supabase.js |
| Auth logic | Backend-API/controllers/authController.js |
| API calls | Frontend/src/services/api.js |
| Auth state | Frontend/src/context/AuthContext.jsx |
| SQL schema | SUPABASE_SETUP.sql |

---

## 🔄 Data Flow

```
User Sign-Up/Login
        ↓
Frontend → Backend Auth API
        ↓
JWT Token in localStorage
        ↓
User can access Dashboard
        ↓
Upload ZIP
        ↓
Frontend → Backend createProject
        ↓
ZIP extracted to repos/
        ↓
Python analysis runs
        ↓
Files stored in Supabase
        ↓
Frontend polls status
        ↓
User views generated docs
```

---

## 🎯 Success Indicators

- ✅ Backend starts: "Express server running on port 5000"
- ✅ Frontend starts: "Local: http://localhost:5173/"
- ✅ Can sign up: New user in Supabase users table
- ✅ Can upload: Project appears in projects table
- ✅ Can generate: Files in documentation_files table
- ✅ Can view: Dashboard displays generated content

---

## 🆘 Debug Steps

1. **Check Browser Console** (F12)
   - Look for API errors
   - Check if token is in localStorage

2. **Check Backend Console**
   - Look for Python execution errors
   - Check if files extracted successfully
   - Look for database errors

3. **Check Supabase Dashboard**
   - Verify tables exist
   - Check if records are being created
   - Look for any error messages

4. **Check File System**
   - Verify repos/ directory exists
   - Check if ZIP was extracted
   - Verify generated files exist

---

## 💾 Quick Database Queries

```sql
-- See all projects
SELECT id, name, status, created_at FROM projects ORDER BY created_at DESC;

-- See all docs for a project
SELECT file_name, file_type FROM documentation_files WHERE project_id = 'xxx';

-- See project details
SELECT * FROM projects WHERE id = 'xxx';

-- Delete a project (cascades to docs)
DELETE FROM projects WHERE id = 'xxx';
```

---

## 🚀 Performance Tips

- Max ZIP size: 100MB (adjust timeout if larger)
- Max projects to keep: Set based on storage quota
- Python timeout: 5 minutes (adjustable in pythonRunner.js)
- Poll interval: 10 seconds (adjustable in Dashboard.jsx)

---

## 🔐 Security Quick Check

- [ ] JWT_SECRET is long and random
- [ ] Supabase keys are in .env (not in code)
- [ ] CORS only allows your frontend
- [ ] File size limits are set
- [ ] No sensitive data in logs

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| INTEGRATION_COMPLETE.md | Complete setup guide |
| README_INTEGRATION.md | Project overview |
| CHECKLIST.md | Implementation checklist |
| CODE_CHANGES_REFERENCE.md | Detailed code changes |
| IMPLEMENTATION_SUMMARY.md | Full summary |
| START.bat / START.ps1 | Automated startup |

---

## ✨ Next Steps After Setup

1. ✅ Complete pre-flight checklist
2. ✅ Start all services
3. ✅ Test sign-up/login
4. ✅ Test file upload
5. ✅ Verify database records
6. 🔲 View generated documentation
7. 🔲 Test with different projects
8. 🔲 Deploy to production

---

## 💬 Quick Help

**Everything not working?**
1. Check INTEGRATION_COMPLETE.md Troubleshooting section
2. Verify all items in CHECKLIST.md
3. Review error messages in console

**Specific feature not working?**
1. See CODE_CHANGES_REFERENCE.md for code location
2. Check DATABASE schema in README_INTEGRATION.md
3. Verify API endpoint in quick reference table above

**Need to modify something?**
1. See IMPLEMENTATION_SUMMARY.md for system overview
2. Check code locations in table above
3. Test changes with CHECKLIST.md

---

## 📞 Support Hierarchy

```
Problem? 
  ↓
Check Browser Console (F12)
  ↓ Still broken?
Check Backend Terminal
  ↓ Still broken?
Check Supabase Dashboard
  ↓ Still broken?
Read INTEGRATION_COMPLETE.md Troubleshooting
  ↓ Still broken?
Review CHECKLIST.md
  ↓ Still broken?
Check CODE_CHANGES_REFERENCE.md for code location
  ↓ Still broken?
Verify SUPABASE_SETUP.sql ran successfully
```

---

## 🎉 You're All Set!

- Services running? ✅
- Database set up? ✅
- Code integrated? ✅
- Documentation complete? ✅

**Now go generate some amazing documentation!** 🚀

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready
