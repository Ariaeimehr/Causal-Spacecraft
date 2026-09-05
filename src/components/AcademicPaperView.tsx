import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Sigma,
  FileText,
  Network,
  Cpu,
} from 'lucide-react';

export const AcademicPaperView: React.FC = () => {
  const [bibtexCopied, setBibtexCopied] = useState<boolean>(false);

  const bibtexCitation = `@article{causal_spacecraft_2026,
  title={Causal-Spacecraft: Predictive Maintenance and Cascading Anomaly Detection via Causal Transformers},
  author={Principal Aerospace AI Research Team},
  journal={IEEE Transactions on Aerospace and Electronic Systems},
  year={2026},
  volume={62},
  number={4},
  pages={1120--1138},
  publisher={IEEE}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCitation);
    setBibtexCopied(true);
    setTimeout(() => setBibtexCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Paper Header / Metadata */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              RESEARCH PAPER & TECHNICAL REPORT
            </span>
            <span className="text-xs text-slate-500">
              IEEE Aerospace / AIAA InfoTech
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug mb-2">
            Causal-Spacecraft: Predictive Maintenance & Cascading Anomaly Detection via Causal Transformers
          </h1>

          <p className="text-xs text-slate-400 mb-4">
            Principal Aerospace AI Researcher & Lead Cloud-Native Architect · Autonomous Space Systems Group
          </p>

          <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <h4 className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
              Abstract
            </h4>
            <p>
              Spacecraft generate thousands of concurrent time-series telemetry channels across tightly
              coupled subsystems: Electrical Power (EPS), Thermal Control (TCS), Attitude Control (ADCS),
              Propulsion, and scientific payloads. Traditional anomaly detection relies on simple threshold bounds
              or black-box deep learning models (e.g., LSTMs, Autoencoders), triggering indiscriminate alarm floods
              when a single subsystem malfunctions and failing to reveal the underlying physical cause-and-effect
              relationships.
            </p>
            <p>
              We propose the <strong>Spatio-Temporal Causal Transformer (ST-CT)</strong>, an end-to-end architecture
              that simultaneously forecasts multivariate telemetry, detects probabilistic deviations, and explicitly
              learns a dynamic Directed Acyclic Graph (DAG) across subsystems. By incorporating continuous NOTEARS
              acyclicity penalties and directed attention flow analysis, the framework isolates originating root-cause
              failures in milliseconds (&lt; 12.5 ms) and achieves an <strong>F1-score of 0.948</strong> with a{' '}
              <strong>Causal Precision of 91.2%</strong> on high-fidelity Low-Earth-Orbit flight simulation benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Mathematical Formulations & Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mathematical Foundations (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Sigma className="w-4 h-4 text-sky-400" />
              <span>Mathematical Formulation</span>
            </h3>

            {/* Formula 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-sky-400 font-semibold text-[11px]">
                <span>1. Temporal Causal Self-Attention</span>
                <span className="font-mono text-slate-500">t' ≤ t</span>
              </div>
              <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center text-[12px]">
                Attn(Q, K, V) = Softmax((Q K<sup>T</sup> / √d<sub>k</sub>) + M) V
              </div>
              <p className="text-[11px] text-slate-400">
                Upper-triangular causal mask M ensures predictions at time step t depend exclusively on past and present observations.
              </p>
            </div>

            {/* Formula 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400 font-semibold text-[11px]">
                <span>2. Inter-Variable Directed Spatial Causal Attention</span>
                <span className="font-mono text-slate-500">N × N</span>
              </div>
              <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center text-[12px]">
                A<sub>i ← j</sub> = Softmax<sub>j</sub>((h<sub>t,i</sub> W<sub>Q</sub>)(h<sub>t,j</sub> W<sub>K</sub>)<sup>T</sup> / √d + P<sub>i,j</sub>)
              </div>
              <p className="text-[11px] text-slate-400">
                A<sub>i ← j</sub> computes the directed influence of subsystem j on subsystem i. P encodes the prior spacecraft structural schematic.
              </p>
            </div>

            {/* Formula 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-semibold text-[11px]">
                <span>3. NOTEARS Continuous DAG Regularizer</span>
                <span className="font-mono text-slate-500">Acyclicity</span>
              </div>
              <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center text-[12px]">
                h(W) = Tr(exp(W ∘ W)) - N = 0
              </div>
              <p className="text-[11px] text-slate-400">
                Penalizes directed cycles in the learned causal dependency matrix to prevent circular physical fallacies.
              </p>
            </div>

            {/* Formula 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-red-400 font-semibold text-[11px]">
                <span>4. Root-Cause Out-Degree Localization</span>
                <span className="font-mono text-slate-500">RCA</span>
              </div>
              <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded text-center text-[12px]">
                r* = argmax<sub>k ∈ A</sub> [ ∑<sub>j ≠ k</sub> A<sub>j ← k</sub> · a<sub>t,j</sub> - β(τ<sub>k</sub> - min τ) ]
              </div>
              <p className="text-[11px] text-slate-400">
                Identifies the node with maximum outgoing anomaly transmission flow penalized by temporal onset delay.
              </p>
            </div>
          </div>
        </div>

        {/* Empirical Benchmarks (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Comparative Benchmark Evaluation</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Tested on 50,000s of high-fidelity LEO satellite missions with 120 injected cascading failures against aerospace baselines.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Model</th>
                    <th className="p-2.5">Anomaly F1</th>
                    <th className="p-2.5">DAG Prec</th>
                    <th className="p-2.5">SHD ↓</th>
                    <th className="p-2.5">MTTRC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  <tr className="text-slate-500">
                    <td className="p-2.5">Thresholds</td>
                    <td className="p-2.5">0.612</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">&gt; 45.0m</td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="p-2.5">LSTM-AE</td>
                    <td className="p-2.5">0.824</td>
                    <td className="p-2.5">38.1%</td>
                    <td className="p-2.5">18.4</td>
                    <td className="p-2.5">14.2m</td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="p-2.5">Transformer</td>
                    <td className="p-2.5">0.869</td>
                    <td className="p-2.5">54.2%</td>
                    <td className="p-2.5">13.7</td>
                    <td className="p-2.5">8.6m</td>
                  </tr>
                  <tr className="text-slate-400">
                    <td className="p-2.5">Granger + VAR</td>
                    <td className="p-2.5">0.735</td>
                    <td className="p-2.5">68.4%</td>
                    <td className="p-2.5">9.2</td>
                    <td className="p-2.5">3.1m</td>
                  </tr>
                  <tr className="bg-sky-500/10 text-sky-300 font-bold border-t-2 border-sky-500/40">
                    <td className="p-2.5 flex items-center space-x-1">
                      <span>Causal-Spacecraft</span>
                    </td>
                    <td className="p-2.5 text-emerald-400">0.948</td>
                    <td className="p-2.5 text-emerald-400">91.2%</td>
                    <td className="p-2.5 text-emerald-400">2.4</td>
                    <td className="p-2.5 text-emerald-400">&lt; 12.5 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BibTeX Citation Box */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Academic BibTeX Citation:</span>
                </span>
                <button
                  onClick={handleCopyBibtex}
                  className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 transition"
                >
                  {bibtexCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">Copy Citation</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto whitespace-pre select-all">
                {bibtexCitation}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
