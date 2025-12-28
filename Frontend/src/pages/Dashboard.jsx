import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Link2, FileText, Code2, Loader2, CheckCircle2, 
  X, ChevronRight, GitBranch, Sparkles, 
  FileCode, Boxes, Network, Database, LogOut,
  Download, Copy, ChevronLeft, FolderOpen, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [showOverlay, setShowOverlay] = useState(false);
  const [repoLink, setRepoLink] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showProjectsMenu, setShowProjectsMenu] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollInterval, setPollInterval] = useState(null);
  const fileInputRef = useRef(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
      
      // If no projects, show overlay
      if (projectsData.length === 0) {
        setShowOverlay(true);
      } else {
        // Load first project by default
        await loadProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Load projects error:', error);
      showToastMessage('Failed to load projects');
      setShowOverlay(true);
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (projectId) => {
    try {
      const project = await projectService.getProjectById(projectId);
      setCurrentProject(project);
      
      // Set first available doc
      if (project.documentation_files && project.documentation_files.length > 0) {
        setSelectedDoc(project.documentation_files[0]);
      }

      // Start polling if not completed
      if (project.status !== 'completed' && project.status !== 'failed') {
        startPolling(projectId);
      }
    } catch (error) {
      console.error('Load project error:', error);
      showToastMessage('Failed to load project');
    }
  };

  const startPolling = (projectId) => {
    // Clear existing interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    const interval = projectService.pollProjectStatus(
      projectId,
      (updatedProject) => {
        setCurrentProject(updatedProject);
        
        if (updatedProject.status === 'completed') {
          showToastMessage('Documentation generated successfully!');
          loadProjects(); // Refresh projects list
        } else if (updatedProject.status === 'failed') {
          showToastMessage('Documentation generation failed');
        }
      }
    );

    setPollInterval(interval);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setZipFile(file);
      setRepoLink('');
    }
  };

  const handleLetsGo = async () => {
    if (!repoLink && !zipFile) return;
    
    try {
      setShowOverlay(false);
      setLoading(true);

      let response;
      if (zipFile) {
        response = await projectService.createProjectWithZip(zipFile);
      } else {
        response = await projectService.createProjectWithLink(repoLink);
      }

      showToastMessage('Project created! Documentation generation started.');
      
      // Reload projects and start polling
      await loadProjects();
      if (response.projectId) {
        startPolling(response.projectId);
      }

      // Reset form
      setRepoLink('');
      setZipFile(null);
    } catch (error) {
      console.error('Create project error:', error);
      showToastMessage(error.response?.data?.error || 'Failed to create project');
      setShowOverlay(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isSubmitDisabled = !repoLink && !zipFile;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'analyzing': return 'text-yellow-400';
      case 'generating': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'analyzing': return 'Analyzing...';
      case 'generating': return 'Generating...';
      default: return 'Pending';
    }
  };

  if (loading && !currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="text-slate-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-purple-500/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Doc Gen
              </span>
            </div>
            {user && (
              <span className="text-sm text-slate-400">Welcome, {user.fullName}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOverlay(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              New Project
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="pt-20 flex h-screen">
        {/* Left Sidebar */}
        {!showOverlay && currentProject && (
          <aside className="w-80 border-r border-purple-500/10 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Projects Menu Button */}
              <button
                onClick={() => setShowProjectsMenu(true)}
                className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-purple-500/20 transition-all group"
              >
                <FolderOpen className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left font-medium">My Projects</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Current Project */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">CURRENT PROJECT</h3>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currentProject.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentProject.repo_source}</p>
                      <p className={`text-xs mt-1 ${getStatusColor(currentProject.status)}`}>
                        {getStatusText(currentProject.status)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Docs */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">GENERATED DOCS</h3>
                <div className="space-y-2">
                  {currentProject.documentation_files && currentProject.documentation_files.length > 0 ? (
                    currentProject.documentation_files.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                          selectedDoc?.id === doc.id
                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30'
                            : 'hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 text-purple-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-sm capitalize">
                          {doc.file_name.replace(/_/g, ' ')}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      {currentProject.status === 'completed' ? 'No documents generated' : 'Generating documents...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Projects Sidebar Menu */}
        {showProjectsMenu && (
          <>
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setShowProjectsMenu(false)}
            ></div>
            
            <div className="fixed left-0 top-20 bottom-0 w-80 bg-slate-900 border-r border-purple-500/20 z-50 shadow-2xl animate-slide-in-left overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-bold">My Projects</h2>
                  </div>
                  <button
                    onClick={() => setShowProjectsMenu(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        loadProject(project.id);
                        setShowProjectsMenu(false);
                      }}
                      className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <GitBranch className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1 truncate">{project.name}</h3>
                          <p className="text-xs text-slate-400 truncate mb-2">{project.repo_source}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </span>
                            <span className="text-slate-500">
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {selectedDoc && currentProject?.status === 'completed' ? (
            <DocumentViewer doc={selectedDoc} onToast={showToastMessage} />
          ) : currentProject && (currentProject.status === 'analyzing' || currentProject.status === 'generating') ? (
            <GeneratingView status={currentProject.status} />
          ) : !showOverlay && currentProject ? (
            <EmptyState />
          ) : null}
        </main>
      </div>

      {/* Initial Overlay Modal */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => projects.length > 0 && setShowOverlay(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl mb-4">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold">Start by adding your repository</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  AI Doc Gen will analyze your repository and generate professional documentation automatically
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={`space-y-3 ${zipFile ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Link2 className="w-4 h-4 text-purple-400" />
                    Repository Link
                  </label>
                  <input
                    type="url"
                    value={repoLink}
                    onChange={(e) => setRepoLink(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    disabled={zipFile !== null}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder:text-slate-500 disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500">Paste your GitHub or GitLab repository URL</p>
                </div>

                <div className={`space-y-3 ${repoLink ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="w-4 h-4 text-purple-400" />
                    Upload ZIP File
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !repoLink && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setZipFile(e.target.files[0]);
                          setRepoLink('');
                        }
                      }}
                      className="hidden"
                      disabled={repoLink !== ''}
                    />
                    {zipFile ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-green-400" />
                        <p className="text-sm font-medium">{zipFile.name}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setZipFile(null);
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-sm text-slate-400">Drag & drop or click to upload</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Upload a ZIP file containing your project</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleLetsGo}
                  disabled={isSubmitDisabled}
                  className={`w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    isSubmitDisabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-2xl hover:shadow-purple-500/30'
                  }`}
                >
                  Let's Go
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-slate-900 border border-green-500/30 rounded-lg p-4 shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-sm font-medium">{toastMessage}</p>
            <button onClick={() => setShowToast(false)} className="ml-2">
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneratingView({ status }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl animate-pulse">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold">
          {status === 'analyzing' ? 'Analyzing your repository...' : 'Generating documentation...'}
        </h2>
        <p className="text-slate-400">This usually takes 2-3 minutes. Please wait...</p>
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
      </div>
    </div>
  );
}

function DocumentViewer({ doc, onToast }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content || '');
    onToast('Content copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([doc.content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.file_name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(`${doc.file_name} downloaded successfully!`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold capitalize">{doc.file_name.replace(/_/g, ' ')}</h1>
              <p className="text-sm text-slate-400">Generated by AI Doc Gen</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/30 rounded-lg transition-all group"
            >
              <Copy className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
              <span className="text-sm">Copy</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 rounded-lg transition-all group"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Download</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-8">
          <div className="prose prose-invert max-w-none">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
              {doc.content || 'Content loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
          <FileText className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-400">Select a document to view</h3>
        <p className="text-slate-500">Choose a documentation file from the sidebar to preview its contents</p>
      </div>
    </div>
  );
}