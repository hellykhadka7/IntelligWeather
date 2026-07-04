import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="glass-card p-6 text-center animate-fade-in">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-slate-300 text-sm mb-4">{message || "Something went wrong."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
