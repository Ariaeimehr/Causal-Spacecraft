import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  FolderGit2,
  Cpu,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { REPOSITORY_FILES } from '../data/repositoryFiles';
import { RepositoryFile } from '../types';

interface CodeExplorerViewProps {
  onExportAll: () => void;
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ onExportAll }) => {
  const [activeFilename, setActiveFilename] = useState<string>('model.py');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activeFile =
    REPOSITORY_FILES.find((f) => f.filename === activeFilename) || REPOSITORY_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: RepositoryFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredFiles = REPOSITORY_FILES.filter(
    (f) =>
      f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <FolderGit2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              Causal-Spacecraft: Modular Architecture & Infrastructure
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
              MIT / Apache-2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Production-ready PyTorch deep learning modules, synthetic physical spacecraft simulator,
            container specifications, and Kubernetes ground station manifests designed for immediate local
            testing and academic publication.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onExportAll}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-sky-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Repository</span>
          </button>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar File Browser (3 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search repository files..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* File List */}
            <div className="space-y-1">
              {filteredFiles.map((file) => {
                const isActive = file.filename === activeFilename;
                return (
                  <button
                    key={file.filename}
                    onClick={() => setActiveFilename(file.filename)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-sky-500/15 border border-sky-500/40 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileCode
                        className={`w-4 h-4 flex-shrink-0 ${
                          file.language === 'python'
                            ? 'text-yellow-400'
                            : file.language === 'yaml'
                            ? 'text-red-400'
                            : file.language === 'dockerfile'
                            ? 'text-sky-400'
                            : 'text-emerald-400'
                        }`}
                      />
                      <div className="truncate">
                        <span className="font-mono font-medium block truncate">
                          {file.filename}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {file.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick CLI Execution Box */}
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold block mb-2 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Quick Terminal Test:</span>
              </span>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-sky-300 border border-slate-800 space-y-1 select-all">
                <p>python data_generator.py</p>
                <p>python train_and_evaluate.py</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Code Editor & Preview (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
            {/* Editor Top Bar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileCode className="w-4 h-4 text-sky-400" />
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">
                    {activeFile.filename}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeFile.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                  title="Copy full file content"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadFile(activeFile)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                  title="Download this file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="relative flex-1 bg-slate-950 p-4 font-mono text-xs overflow-auto max-h-[640px]">
              <div className="flex space-x-4">
                {/* Line Numbers */}
                <div className="select-none text-slate-600 text-right pr-2 border-r border-slate-800 font-mono text-[11px] leading-relaxed">
                  {activeFile.content.split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>

                {/* Content */}
                <pre className="text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto flex-1 whitespace-pre">
                  <code>{activeFile.content}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
