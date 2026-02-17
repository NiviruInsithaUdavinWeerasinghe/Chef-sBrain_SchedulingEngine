import { useState, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import cookAnimation from "./CookFree.json"; // Ensure this matches your file path
import NewOrderForm from "./components/NewOrderForm";
import ActiveQueue from "./components/ActiveQueue";
import OrderHistory from "./components/OrderHistory";
import AdminPortal from "./components/AdminPortal"; // Added this import

function App() {
  // --- Global App State ---
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Loading animation state
  const [currentScreen, setCurrentScreen] = useState(
    () => localStorage.getItem("chefBrain_currentScreen") || "home",
  ); // "home" | "kitchen"
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("chefBrain_isLoggedIn") === "true",
  );
  const [kitchenName, setKitchenName] = useState(
    () => localStorage.getItem("chefBrain_kitchenName") || "",
  );
  const [workspaceId, setWorkspaceId] = useState(
    () => localStorage.getItem("chefBrain_workspaceId") || "",
  );

  // --- Create Space Modal State ---
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [spaceForm, setSpaceForm] = useState({
    name: "",
    adminEmail: "",
    adminPassword: "",
    invites: "",
  });

  // --- Kitchen Dashboard State ---
  const [currentView, setCurrentView] = useState(
    () => localStorage.getItem("chefBrain_currentView") || "active",
  ); // Controls navigation tabs
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });
  const [serverStatus, setServerStatus] = useState("checking");

  // --- Admin Auth State ---
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // --- Workspace Login State ---
  const [showWorkspaceLogin, setShowWorkspaceLogin] = useState(false);
  const [entryPassword, setEntryPassword] = useState(""); // Save section and view states to localStorage

  useEffect(() => {
    localStorage.setItem("chefBrain_currentScreen", currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem("chefBrain_currentView", currentView);
  }, [currentView]); // Handle Initial Loading Screen

  useEffect(() => {
    // Show loading screen for 3 seconds before revealing the app
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Check backend connection
  useEffect(() => {
    const checkServer = async () => {
      try {
        // Passing a dummy workspaceId to fulfill the backend requirement for the health check
        const res = await fetch(
          "http://localhost:8080/api/dishes?workspaceId=0",
        );
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

    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Notification Handler
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type, isExiting: false });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isExiting: true }));
    }, 3000);
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "success",
        isExiting: false,
      });
    }, 3400);
  };

  // Handlers
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:8080/api/workspaces/verify-admin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // Send workspaceId so the backend knows which kitchen to verify
          body: JSON.stringify({
            workspaceId: workspaceId,
            password: adminPassword,
          }),
        },
      );

      // Extract the data body to check if the backend returned true/false
      const isValid = await response.json();

      if (response.ok && isValid === true) {
        setShowAdminLogin(false);
        setAdminPassword("");
        setAdminError("");
        setCurrentView("admin");
      } else {
        setAdminError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying admin:", error);
      setAdminError("Server connection failed.");
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    setIsCreatingSpace(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/workspaces/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spaceForm),
        },
      );

      if (response.ok) {
        const data = await response.json();

        // Admin automatically logged in, save details to session
        localStorage.setItem("chefBrain_isLoggedIn", "true");
        localStorage.setItem("chefBrain_kitchenName", spaceForm.name);
        localStorage.setItem("chefBrain_workspaceId", data.workspaceId);
        localStorage.setItem("chefBrain_pwd", data.password); // Store for future sessions

        setIsLoggedIn(true);
        setKitchenName(spaceForm.name);
        setWorkspaceId(data.workspaceId);
        setShowCreateSpace(false);
        setCurrentScreen("kitchen");

        showNotification(
          `Space created! Invites sent to staff via email.`,
          "success",
        );
      } else {
        showNotification(
          "Failed to create workspace. Is the server running?",
          "error",
        );
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      showNotification("Network error occurred.", "error");
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleWorkspaceUnlock = async () => {
    if (!entryPassword) return;

    try {
      const response = await fetch(
        "http://localhost:8080/api/workspaces/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: entryPassword }),
        },
      );

      if (response.ok) {
        const data = await response.json();

        // Save to session so they don't have to login again
        localStorage.setItem("chefBrain_pwd", entryPassword);
        localStorage.setItem("chefBrain_isLoggedIn", "true");
        localStorage.setItem("chefBrain_kitchenName", data.kitchenName);
        localStorage.setItem("chefBrain_workspaceId", data.workspaceId);

        setIsLoggedIn(true);
        setKitchenName(data.kitchenName);
        setWorkspaceId(data.workspaceId);
        setCurrentScreen("kitchen");
        setShowWorkspaceLogin(false);
        setEntryPassword("");
        showNotification(`Welcome to ${data.kitchenName}!`, "success");
      } else {
        showNotification("Invalid Entry Password", "error");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      showNotification("Server connection failed.", "error");
    }
  };

  // --- Render Loading Screen ---
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden animate-fade-in z-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-72 h-72 md:w-96 md:h-96 flex items-center justify-center drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">
          <Player
            autoplay
            loop
            src={cookAnimation}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        <div className="relative z-10 -mt-8 flex flex-col items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 tracking-widest animate-pulse drop-shadow-lg">
            Chef's Brain
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
            Igniting the Kitchen
            <span className="flex gap-1">
              <span
                className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </p>
        </div>
      </div>
    );
  }

  // --- Render Main App ---
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-slate-950 p-3 md:p-5 font-sans text-slate-200 selection:bg-orange-500/30 animate-fade-in">
      {/* --- Fixed Edge-of-Screen Notification --- */}
      <div className="fixed top-4 right-4 z-[200]">
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
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                notification.type === "success"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {notification.type === "success" ? "✓" : "✕"}
            </span>
            {notification.message}
          </div>
        )}
      </div>

      {/* --- Workspace Password Entry Modal --- */}
      {showWorkspaceLogin && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🔐</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Access Kitchen
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter the 6-character password sent to your email to access the
              workspace.
            </p>

            <input
              type="text"
              maxLength="6"
              autoFocus
              value={entryPassword}
              onChange={(e) => setEntryPassword(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border-2 border-slate-800 focus:border-orange-500 rounded-2xl p-4 text-center text-2xl font-black tracking-[10px] text-orange-500 outline-none transition-all"
              placeholder="******"
            />

            <button
              onClick={handleWorkspaceUnlock}
              className="w-full mt-6 py-4 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:bg-orange-400 transition-all"
            >
              Unlock Workspace
            </button>
            <button
              onClick={() => setShowWorkspaceLogin(false)}
              className="mt-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest hover:text-slate-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* --- Create Space Modal --- */}
      {showCreateSpace && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-orange-500">🚀</span> Create Kitchen Space
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Set up your workspace and invite your kitchen staff.
            </p>
            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Kitchen/Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={spaceForm.name}
                  onChange={(e) =>
                    setSpaceForm({ ...spaceForm, name: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-orange-500 text-sm transition-colors"
                  placeholder="e.g. The Rustic Spoon"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={spaceForm.adminEmail}
                  onChange={(e) =>
                    setSpaceForm({ ...spaceForm, adminEmail: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-orange-500 text-sm transition-colors"
                  placeholder="admin@restaurant.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={spaceForm.adminPassword}
                  onChange={(e) =>
                    setSpaceForm({
                      ...spaceForm,
                      adminPassword: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-orange-500 text-sm transition-colors"
                  placeholder="Create admin password"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Invite Staff (Comma Separated Emails)
                </label>
                <textarea
                  rows="2"
                  value={spaceForm.invites}
                  onChange={(e) =>
                    setSpaceForm({ ...spaceForm, invites: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-orange-500 text-sm transition-colors resize-none"
                  placeholder="chef@restaurant.com, waiter@restaurant.com"
                ></textarea>
                <p className="text-[9px] text-slate-500 mt-1">
                  We will send them a secure link to join this workspace.
                </p>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateSpace(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSpace}
                  className={`flex-[2] py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20 ${isCreatingSpace ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                >
                  {isCreatingSpace
                    ? "Sending Emails..."
                    : "Create & Send Invites"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Admin Login Modal --- */}
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
                className={`w-full p-3 bg-slate-950 border ${
                  adminError ? "border-rose-500" : "border-slate-800"
                } rounded-xl text-white outline-none focus:border-orange-500 mb-2 text-sm transition-colors`}
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

      {/* =========================================
          SCREEN 1: HOME PAGE
      ========================================= */}
      {currentScreen === "home" && (
        <div className="flex flex-col items-center justify-center h-full w-full relative z-10 animate-fade-in">
          {/* Decorative background element */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-[0.03]">
            <span className="text-[40rem] select-none">👨‍🍳</span>
          </div>

          <div className="relative z-20 text-center flex flex-col items-center max-w-3xl px-6">
            <span className="text-7xl mb-6 animate-bounce drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]">
              🔥
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 mb-6 tracking-tight">
              Chef's Brain
            </h1>
            <p className="text-slate-400 text-base md:text-lg font-medium mb-12 leading-relaxed">
              The ultimate intelligent kitchen scheduling engine. Synchronize
              your waitstaff, prioritize active orders dynamically, and manage
              your entire culinary workflow from a single, blazing-fast command
              center.
            </p>

            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                  Welcome back to {kitchenName}
                </p>
                <button
                  onClick={() => setCurrentScreen("kitchen")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black px-10 py-4 rounded-xl text-sm md:text-base uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
                >
                  Enter Kitchen Space <span>→</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("chefBrain_isLoggedIn");
                    localStorage.removeItem("chefBrain_kitchenName");
                    localStorage.removeItem("chefBrain_workspaceId");
                    localStorage.removeItem("chefBrain_pwd");
                    window.location.reload(); // Clears React's memory to stop old datasets from loading
                  }}
                  className="text-xs text-slate-500 hover:text-rose-400 underline underline-offset-4 mt-2 transition-colors"
                >
                  Log out of workspace{" "}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <button
                  onClick={() => setShowCreateSpace(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-black px-8 py-4 rounded-xl text-sm md:text-base uppercase tracking-widest shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Create Kitchen Space
                </button>
                <button
                  onClick={() => setShowWorkspaceLogin(true)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 font-black px-8 py-4 rounded-xl text-sm md:text-base uppercase tracking-widest hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Join Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          SCREEN 2: KITCHEN SPACE (Dashboard)
      ========================================= */}
      {currentScreen === "kitchen" && (
        <>
          {/* Header */}
          <header className="max-w-7xl w-full mx-auto mb-4 border-b border-slate-800/60 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 animate-fade-in">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-white">
                <span className="text-xl drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                  👨‍🍳
                </span>{" "}
                <span>Chef's Brain</span>
              </h1>
              <p className="text-slate-400 mt-1 font-medium text-sm tracking-wide flex items-center gap-3">
                {kitchenName} Workspace
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

            <div className="flex items-center gap-2">
              {/* Home Button */}{" "}
              <button
                onClick={() => setCurrentScreen("home")}
                className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-sm group"
                title="Back to Home"
              >
                {" "}
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>{" "}
                </svg>{" "}
              </button>
              {/* Dummy Data Button */}{" "}
              <button
                onClick={() => {
                  fetch(
                    "http://localhost:8080/api/dishes/load-dummy?workspaceId=" +
                      workspaceId,
                    { method: "POST" },
                  )
                    .then((res) => {
                      if (res.ok) {
                        showNotification(
                          "Dummy data loaded successfully!",
                          "success",
                        );
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                      } else {
                        showNotification("Dummy menu already exists.", "error");
                      }
                    })
                    .catch(() =>
                      showNotification("Failed to load data.", "error"),
                    );
                }}
                className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-amber-500 hover:border-amber-500/50 transition-all shadow-sm group"
                title="Load Dummy Menu"
              >
                {" "}
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />{" "}
                </svg>{" "}
              </button>
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
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="max-w-7xl w-full mx-auto mb-4 flex gap-2 shrink-0 animate-fade-in">
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

            {/* Only show Admin Tab if authenticated inside workspace */}
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
                {/* Left Column: Active Queue Shell */}{" "}
                <div className="flex-1 flex flex-col relative min-h-0">
                  {" "}
                  <ActiveQueue
                    onNotify={showNotification}
                    workspaceId={workspaceId}
                  />{" "}
                </div>
                {/* Right Column: Waitstaff Form */}{" "}
                <div className="w-full lg:w-[320px] shrink-0 h-full flex flex-col min-h-0">
                  {" "}
                  <NewOrderForm
                    onNotify={showNotification}
                    workspaceId={workspaceId}
                  />{" "}
                </div>
              </div>
            ) : currentView === "history" ? (
              <div
                key="history-view"
                className="h-full flex flex-col relative min-h-0 w-full animate-fade-in"
              >
                <OrderHistory workspaceId={workspaceId} />
              </div>
            ) : (
              <div
                key="admin-view"
                className="h-full flex flex-col relative min-h-0 w-full animate-fade-in"
              >
                {" "}
                <AdminPortal
                  workspaceId={workspaceId}
                  onNotify={showNotification}
                />{" "}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
