const supabase = require('../config/supabase');
const { runPythonAnalysis, runPythonGenerate } = require('../utils/pythonRunner');
const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const extract = require('extract-zip');

const STORAGE_BUCKET = 'documentation-files';

exports.createProject = async (req, res) => {
  try {
    const { repoLink, repoType } = req.body;
    const userId = req.user.userId;
    const zipFile = req.file;

    let repoName, localPath, repoSource;

    if (zipFile) {
      // Handle ZIP upload
      repoName = zipFile.originalname.replace('.zip', '');
      repoSource = zipFile.originalname;
      
      // Create unique extraction folder
      const extractFolder = `${userId}_${uuidv4()}`;
      localPath = path.join(process.env.REPOS_STORAGE_PATH, extractFolder);
      
      // Create extraction directory
      await fs.mkdir(localPath, { recursive: true });
      
      console.log('Extracting ZIP file:', zipFile.path);
      console.log('Extraction target:', localPath);
      
      // Extract ZIP file
      try {
        await extract(zipFile.path, { dir: path.resolve(localPath) });
        console.log('ZIP extracted successfully');
        
        // Clean up uploaded ZIP file
        await fs.unlink(zipFile.path);
        
        // Check if extraction created a subfolder
        const extractedContents = await fs.readdir(localPath);
        
        if (extractedContents.length === 1) {
          const potentialFolder = path.join(localPath, extractedContents[0]);
          const stat = await fs.stat(potentialFolder);
          
          if (stat.isDirectory()) {
            localPath = potentialFolder;
            console.log('Using subfolder as repo root:', localPath);
          }
        }
        
      } catch (extractError) {
        console.error('ZIP extraction error:', extractError);
        throw new Error('Failed to extract ZIP file');
      }
      
    } else if (repoLink) {
      // Handle Git clone
      repoName = repoLink.split('/').pop().replace('.git', '');
      repoSource = repoLink;
      localPath = path.join(process.env.REPOS_STORAGE_PATH, `${userId}_${uuidv4()}`);

      console.log('Cloning repository:', repoLink);
      console.log('Clone target:', localPath);
      
      // Clone repository
      await fs.mkdir(localPath, { recursive: true });
      const git = simpleGit();
      await git.clone(repoLink, localPath);
      
      console.log('Repository cloned successfully');
    } else {
      return res.status(400).json({ error: 'Repository link or ZIP file required' });
    }

    // Verify the path exists
    try {
      await fs.access(localPath);
      console.log('Verified path exists:', localPath);
    } catch (err) {
      console.error('Path verification failed:', localPath);
      throw new Error('Repository path does not exist after extraction/clone');
    }

    // Create project in database
    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name: repoName,
          repo_source: repoSource,
          repo_type: repoType || 'github',
          local_path: localPath,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('Project created in database:', project.id);

    // Start documentation generation in background
    generateDocumentation(project.id, localPath, userId);

    res.json({ 
      projectId: project.id,
      message: 'Project created successfully. Documentation generation started.'
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
};

async function generateDocumentation(projectId, repoPath, userId) {
  try {
    console.log('Starting documentation generation for project:', projectId);
    console.log('Repository path:', repoPath);
    
    // Update status to analyzing
    await supabase
      .from('projects')
      .update({ status: 'analyzing' })
      .eq('id', projectId);

    console.log('Running Python analysis...');
    await runPythonAnalysis(repoPath);
    console.log('Analysis completed successfully');

    // Update status to generating
    await supabase
      .from('projects')
      .update({ status: 'generating' })
      .eq('id', projectId);

    console.log('Running Python README generation...');
    await runPythonGenerate(repoPath);
    console.log('README generation completed successfully');

    // Upload files to Supabase Storage and store references in database
    await uploadDocumentationToStorage(projectId, repoPath, userId);

    // Update project status to completed
    await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', projectId);

    console.log('Documentation generation completed for project:', projectId);

    // Clean up local repository files
    console.log('Cleaning up local files...');
    await cleanupLocalFiles(repoPath);
    console.log('Local cleanup completed');

  } catch (error) {
    console.error('Documentation generation error:', error);
    await supabase
      .from('projects')
      .update({ status: 'failed' })
      .eq('id', projectId);
    
    // Try to cleanup even on failure
    try {
      await cleanupLocalFiles(repoPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}

async function uploadDocumentationToStorage(projectId, repoPath, userId) {
  try {
    const docsPath = path.join(repoPath, '.ai', 'docs');
    const readmePath = path.join(repoPath, 'README.md');

    console.log('Uploading documentation files to Supabase Storage...');
    
    // Upload analysis files
    try {
      const files = await fs.readdir(docsPath);
      console.log('Found documentation files:', files);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(docsPath, file);
          const fileContent = await fs.readFile(filePath);
          
          // Create unique storage path
          const storagePath = `${userId}/${projectId}/analysis/${file}`;
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, fileContent, {
              contentType: 'text/markdown',
              upsert: true
            });

          if (error) {
            console.error('Upload error for', file, ':', error);
            throw error;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storagePath);

          console.log('Uploaded:', file, '→', publicUrl);

          // Store reference in database
          await supabase
            .from('documentation_files')
            .insert([
              {
                project_id: projectId,
                file_name: file.replace('.md', ''),
                file_path: storagePath,
                file_type: 'analysis',
                storage_url: publicUrl
              }
            ]);
        }
      }
    } catch (err) {
      console.error('Error uploading docs folder:', err);
    }

    // Upload README
    try {
      const readmeContent = await fs.readFile(readmePath);
      const storagePath = `${userId}/${projectId}/README.md`;
      
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, readmeContent, {
          contentType: 'text/markdown',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      console.log('Uploaded: README.md →', publicUrl);

      await supabase
        .from('documentation_files')
        .insert([
          {
            project_id: projectId,
            file_name: 'README',
            file_path: storagePath,
            file_type: 'readme',
            storage_url: publicUrl
          }
        ]);
    } catch (err) {
      console.error('Error uploading README:', err);
    }

    console.log('All files uploaded to Supabase Storage successfully');
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}

async function cleanupLocalFiles(repoPath) {
  try {
    // Get the parent directory (the one with userId_uuid format)
    const parentPath = path.dirname(repoPath);
    
    // Check if this looks like our generated path
    if (parentPath.includes(process.env.REPOS_STORAGE_PATH)) {
      console.log('Deleting local repository:', parentPath);
      await fs.rm(parentPath, { recursive: true, force: true });
      console.log('Local repository deleted successfully');
    } else {
      console.log('Skipping cleanup - path does not match expected pattern');
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    // Don't throw - cleanup failure shouldn't fail the whole process
  }
}

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        documentation_files (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        documentation_files (*)
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};