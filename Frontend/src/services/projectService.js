import api from './api';

const projectService = {
  // Create project with repo link
  createProjectWithLink: async (repoLink, repoType = 'github') => {
    const response = await api.post('/projects', {
      repoLink,
      repoType,
    });
    return response.data;
  },

  // Create project with ZIP file
  createProjectWithZip: async (zipFile) => {
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    formData.append('repoType', 'zip');

    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all projects for current user
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data.projects;
  },

  // Get single project by ID
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data.project;
  },

  // Poll project status (for real-time updates)
  pollProjectStatus: async (projectId, callback, interval = 3000) => {
    const pollInterval = setInterval(async () => {
      try {
        const project = await projectService.getProjectById(projectId);
        callback(project);
        
        // Stop polling if completed or failed
        if (project.status === 'completed' || project.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
      }
    }, interval);

    return pollInterval;
  },
};

export default projectService;