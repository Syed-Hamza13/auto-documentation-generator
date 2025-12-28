const supabase = require('../config/supabase');
const { runPythonAnalysis, runPythonGenerate } = require('../utils/pythonRunner');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const AdmZip = require('adm-zip');

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
      const projectDir = path.join(process.env.REPOS_STORAGE_PATH, `${userId}_${uuidv4()}`);
      
      // Create project directory
      await fs.mkdir(projectDir, { recursive: true });
      
      // Extract ZIP to project directory
      try {
        const zip = new AdmZip(zipFile.path);
        zip.extractAllTo(projectDir, true);
        console.log(`ZIP extracted successfully to ${projectDir}`);
      } catch (unzipError) {
        console.error('ZIP extraction failed:', unzipError);
        throw new Error(`Failed to extract ZIP file: ${unzipError.message}`);
      }
      
      localPath = projectDir;
    } else if (repoLink) {
      // Handle Git clone
      repoName = repoLink.split('/').pop().replace('.git', '');
      repoSource = repoLink;
      localPath = path.join(process.env.REPOS_STORAGE_PATH, `${userId}_${uuidv4()}`);

      // Clone repository
      await fs.mkdir(localPath, { recursive: true });
      const git = simpleGit();
      await git.clone(repoLink, localPath);
    } else {
      return res.status(400).json({ error: 'Repository link or ZIP file required' });
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

    // Start documentation generation in background
    generateDocumentation(project.id, localPath);

    res.json({ 
      projectId: project.id,
      message: 'Project created successfully. Documentation generation started.'
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

async function generateDocumentation(projectId, repoPath) {
  try {
    // Update status to analyzing
    await supabase
      .from('projects')
      .update({ status: 'analyzing' })
      .eq('id', projectId);

    // Run Python analysis
    await runPythonAnalysis(repoPath);

    // Update status to generating
    await supabase
      .from('projects')
      .update({ status: 'generating' })
      .eq('id', projectId);

    // Run Python README generation
    await runPythonGenerate(repoPath);

    // Read generated files
    const docsPath = path.join(repoPath, '.ai', 'docs');
    const readmePath = path.join(repoPath, 'README.md');

    const files = await fs.readdir(docsPath);
    
    // Store documentation files in database
    for (const file of files) {
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
    }

    // Store README
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

    // Update project status to completed
    await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', projectId);

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