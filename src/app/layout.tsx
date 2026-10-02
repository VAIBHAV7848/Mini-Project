import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Milestone-Based Escrow & Evidence-Based Dispute Resolution',
  description: 'Team 07 (Theme 01) — KLE Technological University',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                07
              </div>
              <div>
                <span className="font-semibold text-white tracking-tight">EscrowProtocol</span>
                <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                  Engine Architecture v1.0
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SQLite WAL Connected
              </span>
              <span className="text-slate-600">|</span>
              <span>Team 07 — Theme 01</span>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
