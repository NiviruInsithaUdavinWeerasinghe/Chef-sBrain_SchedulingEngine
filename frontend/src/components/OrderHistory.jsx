import React, { useEffect, useState } from 'react';

export default function OrderHistory({ workspaceId, refreshTrigger, onUndoSuccess }) {
  const [history, setHistory] = useState([]);
  const [menu, setMenu] = useState([]);

  // Fetch the menu to retrieve dish images
  const fetchMenu = async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/dishes?workspaceId=${workspaceId}`);
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  };

  // Fetch completed orders from the Custom DLL history
  const fetchHistory = async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/orders/history?workspaceId=${workspaceId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // Move order from history back to the active priority queue
  const handleUndo = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/orders/undo?workspaceId=${workspaceId}`, { 
        method: 'POST' 
      });
      if (res.ok) {
        fetchHistory();
        if (onUndoSuccess) onUndoSuccess(); // Notify parent to refresh Active Queue
      }
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchHistory();
  }, [workspaceId, refreshTrigger]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-4 px-1 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
            Order History
          </h2>
          <p className="text-slate-600 text-[10px] font-medium uppercase tracking-widest">
            Recently Completed Tasks
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleUndo}
            className="group flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-orange-500/5"
          >
            <span className="group-hover:rotate-[-45deg] transition-transform duration-300">↺</span> 
            Undo Last
          </button>
        )}
      </div>

      {/* Modern Card List Section */}
      <div className="flex-1 bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 overflow-y-auto custom-scrollbar shadow-inner">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50">
            <div className="text-3xl mb-2">📥</div>
            <p className="text-xs font-medium uppercase tracking-widest">Archive Empty</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[...history].reverse().map((order) => {
              const dish = menu.find((d) => d.name === order.dishName);
              return (
                <div 
                  key={order.id} 
                  className="group relative bg-slate-900/30 border border-slate-800/80 rounded-lg p-3 flex items-center gap-4 transition-all duration-300 hover:bg-slate-900/60 hover:border-slate-700/50 hover:translate-x-1"
                >
                  {/* Dish Image with Status Indicator */}
                  <div className="relative shrink-0">
                    {dish?.imageUrl ? (
                      <img 
                        src={dish.imageUrl} 
                        className="w-12 h-12 rounded-md object-cover border border-slate-700 grayscale group-hover:grayscale-0 transition-all duration-500" 
                        alt={order.dishName} 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded-md border border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                        N/A
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-slate-900 shadow-sm shadow-emerald-500/40"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors truncate uppercase tracking-tight">
                      {order.quantity}x {order.dishName}
                    </h3>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50">
                        TABLE {order.tableNumber}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-500/60 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                        COMPLETED
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}