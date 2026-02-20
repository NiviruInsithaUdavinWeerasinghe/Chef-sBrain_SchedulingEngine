import React, { useEffect, useState } from 'react';

export default function OrderHistory({ workspaceId, refreshTrigger, onUndoSuccess }) {
  const [history, setHistory] = useState([]);
  const [menu, setMenu] = useState([]); // - Added to store dish details like images

  // 1. Fetch the menu to get images
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

  // 2. Fetch completed orders from the Custom DLL
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

  // 3. Handle moving order back to Active Queue
  const handleUndo = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/orders/undo?workspaceId=${workspaceId}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchHistory();
        if (onUndoSuccess) onUndoSuccess(); // Refresh ActiveQueue component
      }
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchHistory();
  }, [workspaceId, refreshTrigger]); // - Re-run if workspace changes or a new order is completed

  return (
    <div className="h-full w-full flex flex-col p-4 bg-slate-900/20 border border-slate-800 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-500">Order History</h2>
        {history.length > 0 && (
          <button
            onClick={handleUndo}
            className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-md hover:bg-orange-500 hover:text-white transition text-xs font-bold"
          >
            ↺ Undo Last
          </button>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-slate-600 text-center italic py-10">No completed orders yet.</p>
        ) : (
          [...history].reverse().map((order) => {
            // Find the dish in the menu to get the imageUrl
            const dish = menu.find((d) => d.name === order.dishName);

            return (
              <div key={order.id} className="p-3 bg-slate-800/40 border border-slate-700 rounded-lg flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  {/* Display the Image */}
                  {dish?.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={order.dishName}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700 opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-[10px] text-slate-500">No Img</div>
                  )}

                  <div>
                    <h3 className="text-slate-200 font-bold text-sm">{order.dishName}</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
                      Table {order.tableNumber} • Qty {order.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-emerald-500/30 text-[10px] font-black uppercase">Done</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}