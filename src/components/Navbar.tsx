import React from 'react';
import {
  Satellite,
  Activity,
  Code2,
  Cpu,
  BookOpen,
  Download,
  Terminal,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'mission-control' | 'code-explorer' | 'cloud-native' | 'paper';
  setActiveTab: (tab: 'mission-control' | 'code-explorer' | 'cloud-native' | 'paper') => void;
  isStreaming: boolean;
  onExportAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  onExportAll,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30">
              <Satellite className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white">
                  Causal-Spacecraft
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v1.2-PROD
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Predictive Maintenance & Anomaly Detection via Causal Transformers
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('mission-control')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'mission-control'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mission Control & RCA</span>
              <span className="md:hidden">RCA</span>
            </button>

            <button
              onClick={() => setActiveTab('code-explorer')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'code-explorer'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Repository & Model Code</span>
              <span className="md:hidden">Code</span>
            </button>

            <button
              onClick={() => setActiveTab('cloud-native')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'cloud-native'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kubernetes & Pipeline</span>
              <span className="md:hidden">K8s</span>
            </button>

            <button
              onClick={() => setActiveTab('paper')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'paper'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Academic Paper & Benchmarks</span>
              <span className="md:hidden">Paper</span>
            </button>
          </nav>

          {/* Right Status & Export */}
          <div className="flex items-center space-x-3">
            {/* Live Indicator */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isStreaming ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isStreaming ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className="text-slate-300 font-mono">
                {isStreaming ? 'LEO-1: S-BAND 1Hz' : 'STREAM PAUSED'}
              </span>
            </div>

            {/* Export Codebase */}
            <button
              onClick={onExportAll}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
              title="Download full project repository files"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Export Repo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
