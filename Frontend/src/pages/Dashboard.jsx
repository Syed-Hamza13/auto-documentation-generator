import React, { useState, useRef } from 'react';
import { 
  Upload, Link2, FileText, Code2, Loader2, CheckCircle2, 
  X, ChevronRight, GitBranch, Clock, Sparkles, 
  FileCode, Boxes, Network, Database, LogOut, Menu,
  Download, Copy, ChevronLeft, FolderOpen, Calendar
} from 'lucide-react';

export default function Dashboard() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [repoLink, setRepoLink] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showProjectsMenu, setShowProjectsMenu] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const fileInputRef = useRef(null);

  const generationSteps = [
    { icon: <GitBranch className="w-5 h-5" />, text: "Analyzing repository structure..." },
    { icon: <Database className="w-5 h-5" />, text: "Extracting dependencies..." },
    { icon: <Network className="w-5 h-5" />, text: "Mapping data flows..." },
    { icon: <FileCode className="w-5 h-5" />, text: "Generating API documentation..." },
    { icon: <Boxes className="w-5 h-5" />, text: "Creating architecture diagrams..." }
  ];

  const documentationFiles = [
    { id: 1, name: 'README.md', icon: <FileText className="w-4 h-4" />, ready: true },
    { id: 2, name: 'Architecture Overview', icon: <Boxes className="w-4 h-4" />, ready: true },
    { id: 3, name: 'API Documentation', icon: <Code2 className="w-4 h-4" />, ready: true },
    { id: 4, name: 'Data Flow Analysis', icon: <Network className="w-4 h-4" />, ready: false },
    { id: 5, name: 'Dependency Analysis', icon: <Database className="w-4 h-4" />, ready: false }
  ];

  const previousProjects = [
    { 
      id: 1, 
      name: 'E-commerce Platform', 
      date: '2 days ago',
      repo: 'github.com/user/ecommerce',
      files: 5
    },
    { 
      id: 2, 
      name: 'Social Media App', 
      date: '1 week ago',
      repo: 'github.com/user/social-app',
      files: 4
    },
    { 
      id: 3, 
      name: 'AI Chatbot System', 
      date: '2 weeks ago',
      repo: 'github.com/user/chatbot',
      files: 6
    },
    { 
      id: 4, 
      name: 'Payment Gateway', 
      date: '1 month ago',
      repo: 'payment-system.zip',
      files: 3
    }
  ];

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
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file) => {
    setZipFile(file);
    setRepoLink('');
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          showToastMessage('ZIP file uploaded successfully');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleLetsGo = () => {
    if (!repoLink && !zipFile) return;
    
    const projectName = zipFile ? zipFile.name : repoLink.split('/').pop() || 'My Repository';
    setCurrentProject({ name: projectName, source: zipFile ? zipFile.name : repoLink });
    setShowOverlay(false);
    setIsGenerating(true);
    
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      setGenerationStep(step);
      if (step >= generationSteps.length) {
        clearInterval(stepInterval);
        setTimeout(() => {
          setIsGenerating(false);
          setSelectedDoc(documentationFiles[0]);
        }, 1000);
      }
    }, 2000);
  };

  const loadPreviousProject = (project) => {
    setCurrentProject({ name: project.name, source: project.repo });
    setShowProjectsMenu(false);
    setSelectedDoc(documentationFiles[0]);
    showToastMessage(`Loaded project: ${project.name}`);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isSubmitDisabled = !repoLink && !zipFile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-purple-500/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Doc Gen
            </span>
          </div>
          
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="pt-20 flex h-screen">
        {/* Left Sidebar - Documentation Files */}
        {!showOverlay && (
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
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {currentProject?.name || 'New Project'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {currentProject?.source || 'No source'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generated Docs */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">GENERATED DOCS</h3>
                <div className="space-y-2">
                  {documentationFiles.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => !isGenerating && doc.ready && setSelectedDoc(doc)}
                      disabled={isGenerating || !doc.ready}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                        selectedDoc?.id === doc.id
                          ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30'
                          : 'hover:bg-slate-800/50 border border-transparent'
                      } ${!doc.ready ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        doc.ready 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-slate-700 text-slate-500'
                      }`}>
                        {doc.icon}
                      </div>
                      <span className="flex-1 text-sm">{doc.name}</span>
                      {doc.ready && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Projects Sidebar Menu - Animated */}
        {showProjectsMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setShowProjectsMenu(false)}
            ></div>
            
            {/* Sliding Panel */}
            <div className="fixed left-0 top-20 bottom-0 w-80 bg-slate-900 border-r border-purple-500/20 z-50 shadow-2xl animate-slide-in-left overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Header */}
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

                {/* Projects List */}
                <div className="space-y-3">
                  {previousProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => loadPreviousProject(project)}
                      className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <GitBranch className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1 truncate">{project.name}</h3>
                          <p className="text-xs text-slate-400 truncate mb-2">{project.repo}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {project.files} docs
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {isGenerating ? (
            <GeneratingView step={generationStep} steps={generationSteps} />
          ) : selectedDoc ? (
            <DocumentViewer doc={selectedDoc} onToast={showToastMessage} />
          ) : !showOverlay ? (
            <EmptyState />
          ) : null}
        </main>
      </div>

      {/* Initial Overlay Modal */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
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
                {/* Repository Link Input */}
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

                {/* ZIP Upload */}
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
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      disabled={repoLink !== ''}
                    />
                    {isUploading ? (
                      <div className="space-y-2">
                        <Loader2 className="w-8 h-8 mx-auto text-purple-400 animate-spin" />
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-slate-400">Uploading... {uploadProgress}%</p>
                      </div>
                    ) : zipFile ? (
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
                        <p className="text-sm text-slate-400">
                          Drag & drop or click to upload
                        </p>
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

      {/* Toast Notification */}
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

function GeneratingView({ step, steps }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Generating your documentation</h2>
          <p className="text-slate-400">This usually takes 2-3 minutes. Please wait...</p>
        </div>

        <div className="space-y-4">
          {steps.map((s, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                index < step
                  ? 'bg-green-500/10 border-green-500/30'
                  : index === step
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-slate-800/30 border-slate-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                index < step
                  ? 'bg-green-500/20 text-green-400'
                  : index === step
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-slate-700 text-slate-500'
              }`}>
                {index < step ? <CheckCircle2 className="w-5 h-5" /> : 
                 index === step ? <Loader2 className="w-5 h-5 animate-spin" /> : s.icon}
              </div>
              <span className={`flex-1 ${
                index <= step ? 'text-white' : 'text-slate-500'
              }`}>{s.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Progress</span>
            <span className="font-medium">{Math.round((step / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(step / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentViewer({ doc, onToast }) {
  const contentRef = useRef(null);

  const sampleContent = {
    'README.md': `# AI Doc Gen Project

## Overview
This project demonstrates an AI-powered documentation generation system.

## Features
- Automatic README generation
- Architecture diagram creation
- API documentation extraction
- Dependency analysis

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Usage
Simply upload your repository and let AI handle the rest.`,
    'Architecture Overview': `# System Architecture

## High-Level Design
The system follows a microservices architecture with the following components:

### Frontend Layer
- React-based user interface
- Real-time WebSocket connections
- State management with Context API

### Backend Layer
- Node.js API server
- Python ML processing service
- Redis caching layer

### Data Layer
- PostgreSQL for structured data
- MongoDB for document storage
- S3 for file storage`,
    'API Documentation': `# API Reference

## Authentication
\`\`\`
POST /api/auth/login
POST /api/auth/register
\`\`\`

## Repository Management
\`\`\`
POST /api/repositories
GET /api/repositories/:id
DELETE /api/repositories/:id
\`\`\`

## Documentation Generation
\`\`\`
POST /api/generate
GET /api/generate/:id/status
GET /api/generate/:id/result
\`\`\``
  };

  const handleCopy = () => {
    const content = sampleContent[doc.name] || 'Content not available';
    navigator.clipboard.writeText(content);
    onToast('Content copied to clipboard!');
  };

  const handleDownload = () => {
    const content = sampleContent[doc.name] || 'Content not available';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(`${doc.name} downloaded successfully!`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              {doc.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{doc.name}</h1>
              <p className="text-sm text-slate-400">Generated by AI Doc Gen</p>
            </div>
          </div>

          {/* Action Buttons */}
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

        {/* Content */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/10 rounded-2xl p-8">
          <div className="prose prose-invert max-w-none">
            <pre ref={contentRef} className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
              {sampleContent[doc.name] || 'Content loading...'}
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