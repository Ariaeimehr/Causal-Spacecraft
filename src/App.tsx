/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MissionControlView } from './components/MissionControlView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { CloudNativeTopologyView } from './components/CloudNativeTopologyView';
import { AcademicPaperView } from './components/AcademicPaperView';
import { REPOSITORY_FILES } from './data/repositoryFiles';
import { Download, Terminal, Github, Satellite, ShieldCheck, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'mission-control' | 'code-explorer' | 'cloud-native' | 'paper'>('mission-control');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [downloadedAll, setDownloadedAll] = useState<boolean>(false);

  const handleExportAll = () => {
    // Sequentially trigger downloads for all key project files
    REPOSITORY_FILES.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.filename;
        link.click();
        URL.revokeObjectURL(url);
      }, index * 200);
    });

    setDownloadedAll(true);
    setTimeout(() => setDownloadedAll(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={true}
        onExportAll={handleExportAll}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {downloadedAll && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Repository Export Triggered:</strong> Downloading model.py, data_generator.py, train_and_evaluate.py, Dockerfile, and telemetry-pipeline.yaml.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'mission-control' && <MissionControlView />}
        {activeTab === 'code-explorer' && <CodeExplorerView onExportAll={handleExportAll} />}
        {activeTab === 'cloud-native' && <CloudNativeTopologyView />}
        {activeTab === 'paper' && <AcademicPaperView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Satellite className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">
              Causal-Spacecraft Project
            </span>
            <span className="text-slate-600">|</span>
            <span>Autonomous Space Systems & Flight Dynamics Research</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <button
              onClick={() => setActiveTab('code-explorer')}
              className="hover:text-sky-400 transition"
            >
              PyTorch model.py
            </button>
            <button
              onClick={() => setActiveTab('cloud-native')}
              className="hover:text-sky-400 transition"
            >
              Kubernetes Manifests
            </button>
            <button
              onClick={() => setActiveTab('paper')}
              className="hover:text-sky-400 transition"
            >
              Academic Specification
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
