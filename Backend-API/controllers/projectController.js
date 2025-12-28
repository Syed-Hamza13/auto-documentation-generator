const supabase = require('../config/supabase');
const { runPythonAnalysis, runPythonGenerate } = require('../utils/pythonRunner');
const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const extract = require('extract-zip');

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
        
        // Check if extraction created a subfolder (common in ZIP files)
        const extractedContents = await fs.readdir(localPath);
        
        // If only one folder exists, use that as the repo root
        if (extractedContents.length === 1) {
          const potentialFolder = path.join(localPath, extractedContents[0]);
          const stat = await fs.stat(potentialFolder);
          
          if (stat.isDirectory()) {
            // Update localPath to the actual project folder
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
    generateDocumentation(project.id, localPath);

    res.json({ 
      projectId: project.id,
      message: 'Project created successfully. Documentation generation started.'
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
};

async function generateDocumentation(projectId, repoPath) {
  try {
    console.log('Starting documentation generation for project:', projectId);
    console.log('Repository path:', repoPath);
    
    // Update status to analyzing
    await supabase
      .from('projects')
      .update({ status: 'analyzing' })
      .eq('id', projectId);

    console.log('Running Python analysis...');
    // Run Python analysis
    await runPythonAnalysis(repoPath);
    console.log('Analysis completed successfully');

    // Update status to generating
    await supabase
      .from('projects')
      .update({ status: 'generating' })
      .eq('id', projectId);

    console.log('Running Python README generation...');
    // Run Python README generation
    await runPythonGenerate(repoPath);
    console.log('README generation completed successfully');

    // Read generated files
    const docsPath = path.join(repoPath, '.ai', 'docs');
    const readmePath = path.join(repoPath, 'README.md');

    console.log('Reading generated documentation files...');
    
    // Check if docs folder exists
    try {
      const files = await fs.readdir(docsPath);
      console.log('Found documentation files:', files);
      
      // Store documentation files in database
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(docsPath, file);
          const content = await fs.readFile(filePath, 'utf-8');

          await supabase
            .from('documentation_files')
            .insert([
              {
                project_id: projectId,
                file_name: file.replace('.md', ''),
                file_path: filePath,
                file_type: 'analysis',
                content
              }
            ]);
          
          console.log('Stored documentation file:', file);
        }
      }
    } catch (err) {
      console.error('Error reading docs folder:', err);
    }

    // Store README if exists
    try {
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      await supabase
        .from('documentation_files')
        .insert([
          {
            project_id: projectId,
            file_name: 'README',
            file_path: readmePath,
            file_type: 'readme',
            content: readmeContent
          }
        ]);
      console.log('Stored README file');
    } catch (err) {
      console.error('Error reading README:', err);
    }

    // Update project status to completed
    await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', projectId);

    console.log('Documentation generation completed for project:', projectId);

  } catch (error) {
    console.error('Documentation generation error:', error);
    await supabase
      .from('projects')
      .update({ status: 'failed' })
      .eq('id', projectId);
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