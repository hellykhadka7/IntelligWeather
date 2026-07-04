import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Dashboard />
      </main>
      <footer className="text-center py-6 text-xs text-slate-600 border-t border-white/5 mt-10">
        Weather Intelligence Platform · Built with React, Express, MongoDB & FastAPI
      </footer>
    </div>
  );
}
