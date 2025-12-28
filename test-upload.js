const fs = require('fs');
const http = require('http');
const FormData = require('form-data');

const API_HOST = 'localhost';
const API_PORT = 5000;

// Test with existing token from test-api.js or create new one
let authToken = '';
const testEmail = `upload_test_${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

async function makeRequest(endpoint, method = 'GET', body = null, formData = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: `/api${endpoint}`,
      method,
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : null,
      },
    };

    if (formData) {
      options.headers = { ...options.headers, ...formData.getHeaders() };
    } else if (body) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: { error: data } });
        }
      });
    });

    req.on('error', (e) => resolve({ status: 500, ok: false, data: { error: e.message } }));

    if (formData) {
      formData.pipe(req);
    } else {
      if (body) req.write(JSON.stringify(body));
      req.end();
    }
  });
}

async function testUploadFlow() {
  console.log('\n🚀 Testing ZIP Upload Flow\n');

  // Step 1: Signup
  console.log('📝 Step 1: Creating test account...');
  const signupRes = await makeRequest('/auth/signup', 'POST', {
    email: testEmail,
    password: testPassword
  });
  
  if (!signupRes.ok) {
    console.log(`❌ Signup failed: ${signupRes.data.error}`);
    return;
  }
  
  authToken = signupRes.data.token;
  console.log(`✅ Signup successful`);
  console.log(`   Email: ${testEmail}`);
  console.log(`   Token: ${authToken.substring(0, 20)}...\n`);

  // Step 2: Upload ZIP file
  console.log('📦 Step 2: Uploading ZIP file...');
  const zipPath = 'D:\\Projects\\auto-documentation-generator\\test-repo.zip';
  
  if (!fs.existsSync(zipPath)) {
    console.log(`❌ ZIP file not found: ${zipPath}`);
    return;
  }

  const form = new FormData();
  form.append('zipFile', fs.createReadStream(zipPath), 'test-repo.zip');

  const uploadRes = await makeRequest('/projects', 'POST', null, form);
  
  if (!uploadRes.ok) {
    console.log(`❌ Upload failed: ${uploadRes.data.error}`);
    return;
  }

  const projectId = uploadRes.data.projectId;
  console.log(`✅ Upload successful`);
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Status: ${uploadRes.data.message}\n`);

  // Step 3: Poll for generation status
  console.log('⏳ Step 3: Waiting for documentation generation...');
  let pollCount = 0;
  const maxPolls = 60; // Poll for up to 10 minutes
  
  const pollInterval = setInterval(async () => {
    pollCount++;
    const statusRes = await makeRequest(`/projects/${projectId}`, 'GET');
    
    if (statusRes.ok) {
      const project = statusRes.data.project;
      console.log(`   Poll #${pollCount}: Status = ${project.status}`);
      
      if (project.status === 'completed') {
        clearInterval(pollInterval);
        console.log(`\n✅ Documentation Generation Completed!\n`);
        console.log(`📊 Project Details:`);
        console.log(`   Name: ${project.name}`);
        console.log(`   Files generated: ${project.documentation_files?.length || 0}`);
        console.log(`   Completed at: ${project.completed_at}`);
        if (project.documentation_files) {
          console.log(`\n📄 Generated Files:`);
          project.documentation_files.forEach(file => {
            console.log(`   - ${file.file_name} (${file.file_type})`);
          });
        }
      } else if (project.status === 'failed') {
        clearInterval(pollInterval);
        console.log(`\n❌ Generation Failed: ${project.error_message || 'Unknown error'}\n`);
      }
    }

    if (pollCount >= maxPolls) {
      clearInterval(pollInterval);
      console.log(`\n⏱️  Polling timeout reached\n`);
    }
  }, 5000); // Poll every 5 seconds
}

testUploadFlow().catch(console.error);
