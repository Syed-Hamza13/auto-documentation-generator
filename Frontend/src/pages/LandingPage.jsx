import React, { useState } from 'react';
import { Code2, FileText, GitBranch, Zap, Shield, Clock, ChevronRight, Sparkles, CheckCircle2, X } from 'lucide-react';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { supabase } from '../db/client';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group p-6 bg-slate-900/50 backdrop-blur-sm border border-purple-500/10 rounded-2xl hover:border-purple-500/30 hover:bg-slate-900/80 transition-all">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <div className="text-purple-400">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const openSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  // File select handler
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${selectedFile.name}`;

    const { data, error } = await supabase.storage
      .from('gen-doc')
      .upload(fileName, selectedFile);

    setUploading(false);

    if (error) {
      console.error("Upload error:", error.message);
      alert("File upload failed: " + error.message);
    } else {
      alert("File uploaded successfully!");
      console.log("Uploaded file data:", data);
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-purple-500/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Doc Gen
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openLogin}
              className="px-5 py-2 border border-purple-500/30 rounded-lg text-sm hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
            >
              Login
            </button>
            <button
              onClick={openSignup}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* File Upload Section */}
      <section className="pt-40 px-6 max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold mb-4">Upload Your Document</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-400 file:bg-purple-500 file:text-white file:px-4 file:py-2 file:rounded-lg file:border-none file:cursor-pointer"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            uploading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25'
          }`}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </section>

      {/* Modals */}
      {showLoginModal && <LoginModal onClose={closeModals} onSwitchToSignup={openSignup} />}
      {showSignupModal && <SignupModal onClose={closeModals} onSwitchToLogin={openLogin} />}
    </div>
  );
}
