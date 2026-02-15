import { useState, useEffect } from "react";
import NewOrderForm from "./components/NewOrderForm";
import ActiveQueue from "./components/ActiveQueue";
import OrderHistory from "./components/OrderHistory";

function App() {
  const [currentView, setCurrentView] = useState("active"); // Controls navigation tabs
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });

  const [serverStatus, setServerStatus] = useState("checking");

  // Admin Auth State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setShowAdminLogin(false);
      setAdminPassword("");
      setAdminError("");
      setCurrentView("admin"); // Switches to the new admin view
    } else {
      setAdminError("Invalid credentials. Please try again.");
    }
  };

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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 p-3 md:p-5 font-sans text-slate-200 selection:bg-orange-500/30">
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl w-80">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              Admin Access
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter credentials to manage the menu.
            </p>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                autoFocus
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAdminError("");
                }}
                className={`w-full p-3 bg-slate-950 border ${adminError ? "border-rose-500" : "border-slate-800"} rounded-xl text-white outline-none focus:border-orange-500 mb-2 text-sm transition-colors`}
                placeholder="Password"
              />
              {adminError && (
                <p className="text-rose-500 text-[10px] mb-2 font-bold tracking-wide">
                  {adminError}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                >
                  Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Edge-of-Screen Notification */}
      <div className="fixed top-4 right-4 z-50">
        {notification.show && (
          <div
            className={`px-4 py-2 rounded-lg shadow-lg border backdrop-blur-md text-sm font-bold flex items-center gap-2 ${
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
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${notification.type === "success" ? "bg-orange-500/20 text-orange-400" : "bg-rose-500/20 text-rose-400"}`}
            >
              {notification.type === "success" ? "✓" : "✕"}
            </span>
            {notification.message}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto mb-4 border-b border-slate-800/60 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-white">
            <span className="text-xl drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              👨‍🍳
            </span>{" "}
            <span>Chef's Brain</span>
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm tracking-wide flex items-center gap-3">
            Kitchen Scheduling Engine
            {/* Dynamic Server Status Indicator */}
            <span
              className={`flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest px-2 py-0.5 rounded border ${
                serverStatus === "online"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : serverStatus === "offline"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                    : "bg-slate-800/50 text-slate-400 border-slate-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
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

        {/* Admin Portal Button */}
        <button
          onClick={() => setShowAdminLogin(true)}
          className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-orange-500 hover:border-orange-500/50 transition-all shadow-sm group"
          title="Admin Portal"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl w-full mx-auto mb-4 flex gap-2 shrink-0">
        <button
          onClick={() => setCurrentView("active")}
          className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            currentView === "active"
              ? "bg-orange-500/10 text-orange-500 border border-orange-500/30 shadow-inner"
              : "bg-slate-900/50 text-slate-500 border border-slate-800/50 hover:bg-slate-800 hover:text-slate-400"
          }`}
        >
          Active Orders
        </button>
        <button
          onClick={() => setCurrentView("history")}
          className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            currentView === "history"
              ? "bg-orange-500/10 text-orange-500 border border-orange-500/30 shadow-inner"
              : "bg-slate-900/50 text-slate-500 border border-slate-800/50 hover:bg-slate-800 hover:text-slate-400"
          }`}
        >
          Order History
        </button>

        {/* Only show Admin Tab if authenticated */}
        {currentView === "admin" && (
          <button className="px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-orange-500/10 text-orange-500 border border-orange-500/30 shadow-inner">
            Admin Portal
          </button>
        )}
      </nav>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl w-full mx-auto flex-1 min-h-0 overflow-hidden relative">
        {currentView === "active" ? (
          <div
            key="active-view"
            className="h-full flex flex-col lg:flex-row gap-5 animate-fade-in"
          >
            {/* Left Column: Active Queue Shell */}
            <div className="flex-1 flex flex-col relative min-h-0">
              <ActiveQueue onNotify={showNotification} />
            </div>

            {/* Right Column: Waitstaff Form */}
            <div className="w-full lg:w-[320px] shrink-0 h-full flex flex-col min-h-0">
              <NewOrderForm onNotify={showNotification} />
            </div>
          </div>
        ) : currentView === "history" ? (
          <div
            key="history-view"
            className="h-full flex flex-col relative min-h-0 w-full animate-fade-in"
          >
            <OrderHistory />
          </div>
        ) : (
          <div
            key="admin-view"
            className="h-full flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800 rounded-xl relative min-h-0 w-full animate-fade-in"
          >
            <svg
              className="w-12 h-12 text-slate-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            <p className="text-xl font-bold uppercase tracking-widest text-slate-500">
              Admin Portal
            </p>
            <p className="text-xs text-slate-600 mt-2 uppercase tracking-widest">
              Menu Management Module Goes Here
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
