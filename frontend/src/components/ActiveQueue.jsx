import { useState, useEffect } from "react";

export default function ActiveQueue({ onNotify }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch the sorted Min-Heap queue from the backend
  const fetchQueue = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/orders/queue");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll the server every 5 seconds to keep the kitchen updated
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Handle completing an order (Moves it to Sachin's History DLL)
  const handleComplete = async (order) => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/orders/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        },
      );

      if (response.ok) {
        onNotify(`Order Completed: ${order.dishName}`, "success");
        fetchQueue(); // Refresh the list immediately
      } else {
        onNotify("Failed to complete order.", "error");
      }
    } catch (error) {
      console.error("Order completion failed:", error);
      onNotify("Error connecting to server.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="text-slate-500 animate-pulse p-6 text-center text-sm">
        Loading Chef's Queue...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Distinct Header Section */}
      <div className="flex justify-between items-end mb-3 px-1 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="animate-pulse text-orange-500">🔥</span> Active
            Kitchen Queue
          </h2>
          <p className="text-slate-500 text-[11px] font-medium mt-0.5 uppercase tracking-wider">
            Live Priority-Sorted Orders
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            Queue Status
          </span>
          <span className="bg-slate-800 text-orange-400 border border-orange-500/20 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">
            {orders.length} Tasks
          </span>
        </div>
      </div>

      {/* Distinct Card Container Section */}
      <div className="flex-1 bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 overflow-y-auto custom-scrollbar pr-2 shadow-inner relative">
        {/* Fixed Glowing Top Accent Line */}
        <div className="sticky top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50 z-20 mb-3"></div>

        <div className="space-y-2.5">
          {orders.length === 0 ? (
            <div className="h-40 border-2 border-dashed border-slate-800/50 rounded-xl flex flex-col items-center justify-center text-slate-700">
              <p className="text-base font-medium">Kitchen is clear!</p>
              <p className="text-xs">New orders will appear here.</p>
            </div>
          ) : (
            orders.map((order, index) => (
              <div
                key={order.id || index}
                className={`group relative bg-slate-900/40 backdrop-blur-md border ${
                  order.isVip
                    ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : "border-slate-800/80"
                } rounded-lg p-3 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 hover:translate-x-1`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    {/* Integrated minimalist VIP tag */}
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                      {order.dishName}
                      {order.isVip && (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          VIP
                        </span>
                      )}
                    </h3>

                    <div className="flex gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest">
                      <span className="bg-slate-950/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        Table{" "}
                        <span className="text-slate-100">
                          {order.tableNumber}
                        </span>
                      </span>
                      <span className="bg-slate-950/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        Prep{" "}
                        <span className="text-slate-100">
                          {order.prepTimeMinutes}m
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleComplete(order)}
                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-slate-950 p-2 rounded-lg transition-all duration-300 active:scale-90 border border-emerald-500/20 hover:border-emerald-400 shadow-sm group/btn shrink-0 ml-3"
                    title="Mark as Done"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover/btn:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
