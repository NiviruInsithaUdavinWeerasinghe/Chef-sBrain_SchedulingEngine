import { useState, useEffect } from "react";

export default function NewOrderForm({ onNotify }) {
  const [menu, setMenu] = useState([]);

  // Form State
  const [selectedDish, setSelectedDish] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [prepTime, setPrepTime] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls the custom menu

  useEffect(() => {
    fetch("http://localhost:8080/api/dishes")
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  // Custom handler for our new beautiful dropdown
  const handleDishSelect = (dishName) => {
    setSelectedDish(dishName);

    const foundDish = menu.find((dish) => dish.name === dishName);
    if (foundDish) {
      setPrepTime(foundDish.prepTimeMinutes);
    } else {
      setPrepTime(0);
    }

    setIsDropdownOpen(false); // Close menu after picking
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure a dish was picked from our custom menu
    if (!selectedDish) {
      onNotify("Please select a dish from the menu first.", "error");
      return;
    }

    const newOrder = {
      dishName: selectedDish,
      tableNumber: parseInt(tableNumber),
      prepTimeMinutes: prepTime,
      isVip: isVip,
    };

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        onNotify(`Order fired to kitchen: ${selectedDish}`, "success");

        // Reset form
        setSelectedDish("");
        setTableNumber("");
        setPrepTime(0);
        setIsVip(false);
      } else {
        onNotify("Failed to send order to kitchen.", "error");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      onNotify("Network error occurred.", "error");
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-5 w-full h-full relative overflow-hidden transition-all duration-300 hover:shadow-orange-500/5 hover:border-slate-700 group">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 opacity-75"></div>

      <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3 mt-1">
        <span className="text-xl opacity-90 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
          🛎️
        </span>
        <h2 className="text-lg font-bold text-white tracking-wide">
          New Order Entry
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Custom Curved Dish Selection Menu */}
        <div className="flex flex-col gap-1.5 relative group/input">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within/input:text-orange-400">
            Dish Name
          </label>

          {/* Select Box Button */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2.5 bg-slate-950 border ${
              isDropdownOpen
                ? "border-orange-500 ring-2 ring-orange-500/50"
                : "border-slate-800 hover:border-slate-600"
            } rounded-xl text-slate-200 transition-all duration-300 cursor-pointer shadow-inner flex justify-between items-center`}
          >
            <span
              className={`text-sm ${
                selectedDish ? "text-slate-200 font-medium" : "text-slate-500"
              }`}
            >
              {selectedDish || "Select a dish..."}
            </span>
            <span
              className={`text-xs text-slate-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-orange-500" : ""}`}
            >
              ▼
            </span>
          </div>

          {/* Floating Curved Dropdown List */}
          {isDropdownOpen && (
            <div className="absolute z-50 top-[65px] left-0 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 mt-1">
              <div className="max-h-48 overflow-y-auto px-2 custom-scrollbar pr-1">
                {menu.length === 0 ? (
                  <div className="px-4 py-3 text-slate-500 text-sm font-medium">
                    Loading menu...
                  </div>
                ) : (
                  menu.map((dish) => (
                    <div
                      key={dish.id}
                      onClick={() => handleDishSelect(dish.name)}
                      className={`px-4 py-2.5 mb-1 rounded-xl text-sm cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                        selectedDish === dish.name
                          ? "bg-orange-500/15 text-orange-400 font-bold border-l-2 border-orange-500"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                      }`}
                    >
                      {selectedDish === dish.name && (
                        <span className="text-orange-500 text-sm">✓</span>
                      )}
                      {dish.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table Number */}
        <div className="flex flex-col gap-1.5 group/input">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within/input:text-orange-400">
            Table Number
          </label>
          <input
            type="number"
            min="1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 hover:border-slate-600 shadow-inner placeholder-slate-700"
            placeholder="e.g. 12"
          />
        </div>

        {/* Prep Time (Read-Only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Prep Time (Mins)
          </label>
          <input
            type="number"
            value={prepTime}
            disabled
            className="w-full p-2.5 bg-slate-950/50 border border-slate-800/50 rounded-xl text-slate-500 font-bold cursor-not-allowed text-base text-left shadow-inner"
          />
        </div>

        {/* VIP Checkbox - Glows Amber when active */}
        <div className="pt-1">
          <label
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all duration-300 ${
              isVip
                ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "bg-slate-950/50 border-slate-800 hover:bg-slate-800/80"
            }`}
          >
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer transition-colors"
            />
            <span
              className={`text-sm font-bold tracking-wide transition-colors duration-300 ${isVip ? "text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" : "text-slate-400"}`}
            >
              Priority VIP Order 👑
            </span>
          </label>
        </div>

        {/* Send Button - Vibrant Gradient with active press effect */}
        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_auto] hover:bg-[center_right_1rem] text-white font-black py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 active:shadow-none uppercase tracking-widest text-xs flex justify-center items-center gap-2 group/btn"
        >
          <span>Fire Order to Kitchen</span>
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
            →
          </span>
        </button>
      </form>
    </div>
  );
}
