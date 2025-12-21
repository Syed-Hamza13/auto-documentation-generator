import React, { useState } from 'react';
import { Code2, FileText, GitBranch, Zap, Shield, Clock, Github, Twitter, Linkedin, ChevronRight, Sparkles, CheckCircle2, X } from 'lucide-react';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group p-6 bg-slate-900/50 backdrop-blur-sm border border-purple-500/10 rounded-2xl hover:border-purple-500/30 hover:bg-slate-900/80 transition-all">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <div className="text-purple-400">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

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

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#solution" className="text-slate-300 hover:text-white transition-colors">Documentation</a>
            <a href="#footer" className="text-slate-300 hover:text-white transition-colors">Contact</a>
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">AI-Powered Documentation</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Documentation that
                <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  writes itself
                </span>
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed">
                AI Doc Gen analyzes your code repositories and automatically generates professional documentation—README files, architecture diagrams, API docs, and data flows. Say goodbye to manual documentation forever.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={openSignup}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-lg font-medium hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                  Get Started Free
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={openLogin}
                  className="px-8 py-4 border border-purple-500/30 rounded-xl text-lg hover:bg-purple-500/5 transition-all"
                >
                  Login
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Free trial</span>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-3xl opacity-20 rounded-full"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gradient-to-r from-purple-500/30 to-transparent rounded-full"></div>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                      <GitBranch className="w-8 h-8 text-slate-400" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-purple-400" />
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-purple-400" />
                    <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">README.md generated</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">Architecture diagrams created</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">API documentation complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Powerful Features for
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Modern Development Teams
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to maintain perfect documentation without lifting a finger
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="AI-Powered Code Analysis"
              description="Advanced machine learning models understand your codebase structure, dependencies, and relationships automatically."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Auto-Generated README"
              description="Professional README files with installation steps, usage examples, and feature descriptions created instantly."
            />
            <FeatureCard
              icon={<GitBranch className="w-6 h-6" />}
              title="Architecture Diagrams"
              description="Visual system architecture and component diagrams generated from your code structure and imports."
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6" />}
              title="API Documentation"
              description="Complete API reference with endpoints, parameters, responses, and authentication details extracted automatically."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Your code stays secure. We analyze locally or in isolated environments with enterprise-grade security."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Save Hours Weekly"
              description="Eliminate manual documentation work. Focus on building features while AI handles your docs in seconds."
            />
          </div>
        </div>
      </section>

      {/* Problem → Solution Section */}
      <section id="solution" className="py-20 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative space-y-12">
              {/* Problem */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm">
                  <span className="text-red-300">The Problem</span>
                </div>
                <h3 className="text-3xl font-bold">Documentation is a nightmare</h3>
                <div className="space-y-4 text-slate-400">
                  <p className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <span>Writing documentation is boring, time-consuming, and pulls developers away from actual coding</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <span>Docs become outdated the moment you push new code, creating confusion and technical debt</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <span>Manual documentation is error-prone and inconsistent across team members</span>
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

              {/* Solution */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm">
                  <span className="text-green-300">The Solution</span>
                </div>
                <h3 className="text-3xl font-bold">AI Doc Gen does it all, automatically</h3>
                <div className="space-y-4 text-slate-300">
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span><strong>One command</strong> — Connect your repository and let AI analyze your entire codebase in minutes</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span><strong>Always up-to-date</strong> — Automated regeneration ensures your docs reflect the latest code changes</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span><strong>Professional quality</strong> — Consistent formatting, comprehensive coverage, and developer-friendly structure</span>
                  </p>
                </div>

                <button
                  onClick={openSignup}
                  className="mt-6 group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="py-12 px-6 border-t border-purple-500/10 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Doc Gen
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Automated documentation generation powered by AI. Built for developers who value their time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block text-slate-400 hover:text-white transition-colors">Features</a>
                <a href="#solution" className="block text-slate-400 hover:text-white transition-colors">Documentation</a>
                <a href="#footer" className="block text-slate-400 hover:text-white transition-colors">About</a>
                <a href="#footer" className="block text-slate-400 hover:text-white transition-colors">Contact</a>
                <a href="#footer" className="block text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-purple-500/10 text-center text-sm text-slate-400">
            <p>&copy; 2025 AI Doc Gen. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && <LoginModal onClose={closeModals} onSwitchToSignup={openSignup} />}
      {showSignupModal && <SignupModal onClose={closeModals} onSwitchToLogin={openLogin} />}
    </div>
  );
}