import { useState, useEffect } from "react";
import NewOrderForm from "./components/NewOrderForm";

function App() {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });

  const [serverStatus, setServerStatus] = useState("checking");

  // Ping backend every 10 seconds to check connection status
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/dishes");
        if (res.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      } catch (error) {
        console.error("Backend connection check failed:", error);
        setServerStatus("offline");
      }
    };

    checkServer(); // Initial check
    const interval = setInterval(checkServer, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const showNotification = (message, type = "success") => {
    // Show the notification and reset exit state
    setNotification({ show: true, message, type, isExiting: false });

    // Trigger the slide-out animation after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isExiting: true }));
    }, 3000);

    // Completely remove from DOM after the animation finishes (3.4s)
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
      });
    }, 3400);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200 selection:bg-orange-500/30">
      {/* Fixed Edge-of-Screen Notification */}
      <div className="fixed top-6 right-6 z-50">
        {notification.show && (
          <div
            className={`px-5 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border backdrop-blur-md text-sm font-bold flex items-center gap-3 ${
              notification.isExiting
                ? "animate-slide-out-right"
                : "animate-slide-in-right"
            } ${
              notification.type === "success"
                ? "bg-slate-900/90 border-orange-500/50 text-orange-300 shadow-orange-500/10"
                : "bg-slate-900/90 border-rose-500/50 text-rose-300 shadow-rose-500/10"
            }`}
          >
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full ${notification.type === "success" ? "bg-orange-500/20 text-orange-400" : "bg-rose-500/20 text-rose-400"}`}
            >
              {notification.type === "success" ? "✓" : "✕"}
            </span>
            {notification.message}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 border-b border-slate-800/60 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-white">
            <span className="text-3xl drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              👨‍🍳
            </span>{" "}
            <span>Chef's Brain</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium text-lg tracking-wide flex items-center gap-3">
            Kitchen Scheduling Engine
            {/* Dynamic Server Status Indicator */}
            <span
              className={`flex items-center gap-2 font-bold uppercase text-xs tracking-widest px-2.5 py-1 rounded-md border ${
                serverStatus === "online"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : serverStatus === "offline"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                    : "bg-slate-800/50 text-slate-400 border-slate-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus === "online"
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,113,0.8)]"
                    : serverStatus === "offline"
                      ? "bg-rose-500 animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.8)]"
                      : "bg-slate-500 animate-pulse"
                }`}
              ></span>
              {serverStatus === "online"
                ? "System Online"
                : serverStatus === "offline"
                  ? "System Offline"
                  : "Connecting..."}
            </span>
          </p>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Column: Active Queue (Placeholder) */}
        <div className="flex-1 bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-800 p-6 flex flex-col relative overflow-hidden backdrop-blur-sm transition-all duration-500 hover:border-slate-700">
          {/* Decorative glowing top accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 opacity-75"></div>

          <div className="flex justify-between items-center mb-6 mt-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="animate-pulse">🔥</span> Active Kitchen Queue
            </h2>
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(249,115,22,0.2)]">
              Coming Soon
            </span>
          </div>

          <div className="flex-1 border-2 border-dashed border-slate-700/50 bg-slate-950/30 rounded-xl flex flex-col items-center justify-center text-slate-500 min-h-[400px] transition-colors hover:border-slate-600/50 hover:bg-slate-900/50">
            <svg
              className="w-16 h-16 mb-4 text-slate-700 transition-transform duration-500 hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            <p className="text-lg font-semibold text-slate-400">
              The Min-Heap Queue goes here!
            </p>
            <p className="text-sm mt-1 text-slate-500">
              We will build the ActiveQueue component to fill this space.
            </p>
          </div>
        </div>

        {/* Right Column: Waitstaff Form */}
        <div className="w-full lg:w-[420px] shrink-0">
          <NewOrderForm onNotify={showNotification} />
        </div>
      </main>
    </div>
  );
}

export default App;
