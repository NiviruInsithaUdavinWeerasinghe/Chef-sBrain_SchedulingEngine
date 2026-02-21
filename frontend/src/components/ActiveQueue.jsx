import { useState, useEffect } from "react";

export default function ActiveQueue({ onNotify, workspaceId }) {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`http://localhost:8080/api/dishes?workspaceId=${workspaceId}`)
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Error fetching menu:", err));
  }, [workspaceId]);

  const fetchQueue = async () => {
    if (!workspaceId) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/queue?workspaceId=${workspaceId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.warn("Queue fetch failed:", response.status);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [workspaceId]);

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
        fetchQueue();
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
      {/* Header */}
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

      <div className="flex-1 bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 overflow-y-auto custom-scrollbar pr-2 shadow-inner relative">
        <div className="sticky top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50 z-20 mb-3"></div>

        <div className="space-y-2.5">
          {orders.length === 0 ? (
            <div className="h-40 border-2 border-dashed border-slate-800/50 rounded-xl flex flex-col items-center justify-center text-slate-700">
              <p className="text-base font-medium">Kitchen is clear!</p>
              <p className="text-xs">New orders will appear here.</p>
            </div>
          ) : (
            orders.map((order, index) => {
              const dish = menu.find((d) => d.name === order.dishName);
              const allergies = order.customerAllergies || [];
              const hasAllergies = allergies.length > 0;

              return (
                <div
                  key={order.id || index}
                  className={`group relative bg-slate-900/40 backdrop-blur-md border rounded-lg p-3 transition-all duration-300 hover:bg-slate-900/80 hover:translate-x-1 ${
                    hasAllergies && order.isVip
                      ? "border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5),0_0_8px_rgba(245,158,11,0.5)]"
                      : hasAllergies
                        ? "border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                        : order.isVip
                          ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                          : "border-slate-800/80"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    {dish?.imageUrl && (
                      <img
                        src={dish.imageUrl}
                        alt={order.dishName}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2 truncate">
                        {order.quantity}x {order.dishName}
                        {order.isVip && (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                            VIP
                          </span>
                        )}
                      </h3>

                      {/* Redesigned Noticeable Allergy Warning */}
                      {hasAllergies && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 bg-gradient-to-r from-rose-500/20 to-transparent p-1.5 rounded-r border-l-4 border-rose-500">
                          <div className="flex items-center gap-1 text-rose-400 font-black uppercase tracking-widest text-[10px]">
                            <span className="text-sm animate-pulse">⚠</span>
                            Allergy:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {allergies.map((ing) => (
                              <span
                                key={ing}
                                className="bg-rose-900/50 text-rose-200 border border-rose-700 opacity-75 px-2 py-0.5 rounded-md text-[9px] font-medium uppercase tracking-wider"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ingredients list */}
                      {(() => {
                        const targetIngredients =
                          order.ingredients || (dish ? dish.ingredients : null);
                        if (!targetIngredients) return null;

                        const ingArray = Array.isArray(targetIngredients)
                          ? targetIngredients
                          : targetIngredients
                              .split(",")
                              .map((i) => i.trim())
                              .filter((i) => i !== "");

                        if (ingArray.length === 0) return null;

                        return (
                          <div className="flex flex-wrap gap-1.5 mt-2 pr-4">
                            {ingArray.map((ing, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-medium border uppercase tracking-wider ${
                                  hasAllergies && allergies.includes(ing)
                                    ? "bg-rose-900/50 text-rose-300 border-rose-700 line-through opacity-75"
                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                }`}
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Order details */}
                      <div className="flex gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest flex-wrap">
                        <span className="bg-slate-950/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                          Qty{" "}
                          <span className="text-slate-100">
                            {order.quantity}
                          </span>
                        </span>
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
                        {(() => {
                          if (!order.calculatedStartTime) return null;
                          const targetTime = new Date(
                            order.calculatedStartTime,
                          );
                          const diffMs = targetTime - currentTime;
                          const isOverdue = diffMs < 0;

                          const absDiffMs = Math.abs(diffMs);
                          const mins = Math.floor(absDiffMs / 60000);
                          const secs = Math.floor((absDiffMs % 60000) / 1000);
                          const formattedSecs = secs
                            .toString()
                            .padStart(2, "0");
                          const diffMins = diffMs / 60000;

                          // Orange warning triggers when 25% or less of the prep time is remaining
                          const warningThreshold = order.prepTimeMinutes * 0.25;

                          return (
                            <span
                              className={`group/timer cursor-default px-1.5 py-0.5 rounded border transition-colors duration-300 ${
                                isOverdue
                                  ? "bg-rose-950/80 text-rose-400 border-rose-800/50 animate-pulse"
                                  : diffMins <= warningThreshold
                                    ? "bg-amber-950/80 text-amber-400 border-amber-800/50"
                                    : "bg-emerald-950/80 text-emerald-400 border-emerald-800/50"
                              }`}
                            >
                              Timer{" "}
                              <span
                                className={
                                  isOverdue
                                    ? "text-rose-100"
                                    : diffMins <= warningThreshold
                                      ? "text-amber-100"
                                      : "text-emerald-100"
                                }
                              >
                                <span className="group-hover/timer:hidden">
                                  {isOverdue ? `+${mins}m Late` : `${mins}m`}
                                </span>
                                <span className="hidden group-hover/timer:inline">
                                  {isOverdue
                                    ? `+${mins}:${formattedSecs} Late`
                                    : `${mins}:${formattedSecs}`}
                                </span>
                              </span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleComplete(order)}
                      className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-slate-950 p-2 rounded-lg transition-all duration-300 active:scale-90 border border-emerald-500/20 hover:border-emerald-400 shadow-sm group/btn shrink-0 ml-1"
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
