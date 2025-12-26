// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Generic API request handler
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add body for POST/PUT requests
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Handle unauthorized access
    if (response.status === 401) {
      setAuthToken(null);
      window.location.href = '/';
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'API Error');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ===== AUTH ENDPOINTS =====

/**
 * User Signup
 * @param {string} fullName - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} { token, user }
 */
export const signup = async (fullName, email, password) => {
  const result = await apiRequest('/auth/signup', 'POST', {
    fullName,
    email,
    password,
  });
  
  if (result.token) {
    setAuthToken(result.token);
  }
  
  return result;
};

/**
 * User Login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} { token, user }
 */
export const login = async (email, password) => {
  const result = await apiRequest('/auth/login', 'POST', {
    email,
    password,
  });
  
  if (result.token) {
    setAuthToken(result.token);
  }
  
  return result;
};

/**
 * Verify Token
 * @returns {Object} Verified user data
 */
export const verifyToken = async () => {
  return apiRequest('/auth/verify', 'GET');
};

// ===== PROJECT ENDPOINTS =====

/**
 * Create New Project
 * @param {FormData} formData - Contains zipFile and other project data
 * @returns {Object} Created project data
 */
export const createProject = async (formData) => {
  const token = getAuthToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // FormData automatically sets correct headers
    });

    if (response.status === 401) {
      setAuthToken(null);
      window.location.href = '/';
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create project');
    }

    return result;
  } catch (error) {
    console.error('Create Project Error:', error);
    throw error;
  }
};

/**
 * Get All Projects
 * @returns {Array} List of user's projects
 */
export const getProjects = async () => {
  return apiRequest('/projects', 'GET');
};

/**
 * Get Single Project
 * @param {string} projectId - Project ID
 * @returns {Object} Project data with documentation
 */
export const getProjectById = async (projectId) => {
  return apiRequest(`/projects/${projectId}`, 'GET');
};

/**
 * Logout
 */
export const logout = () => {
  setAuthToken(null);
};
