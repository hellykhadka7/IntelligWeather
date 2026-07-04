import { CloudSun } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-lg bg-slate-900/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <CloudSun className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">
                Weather Intelligence
              </h1>
              <p className="text-xs text-slate-500 -mt-0.5">Powered by ML</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Data
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
