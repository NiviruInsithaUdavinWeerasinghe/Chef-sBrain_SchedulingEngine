import { useState, useEffect } from "react";

export default function NewOrderForm({ onNotify, workspaceId }) {
  const [menu, setMenu] = useState([]);

  // Form State
  const [selectedDish, setSelectedDish] = useState("");
  const [selectedDishId, setSelectedDishId] = useState(null);
  const [dishImage, setDishImage] = useState("");
  const [ingredients, setIngredients] = useState([]); // array of strings
  const [quantity, setQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Derive prep time dynamically from the current menu data
  const prepTime =
    menu.find((d) => d.id === selectedDishId)?.prepTimeMinutes || 0;

  // Allergy selection state (kept — user can still mark allergies)
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!workspaceId) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/dishes?workspaceId=${workspaceId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setMenu(data);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();
    // Poll the menu every 5 seconds to catch updated adaptive prep times
    const interval = setInterval(fetchMenu, 5000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const handleDishSelect = (dishName) => {
    setSelectedDish(dishName);
    setSelectedAllergies([]); // reset allergies when dish changes

    const foundDish = menu.find((dish) => dish.name === dishName);
    if (foundDish) {
      setSelectedDishId(foundDish.id);

      let ingArray = [];
      if (Array.isArray(foundDish.ingredients)) {
        ingArray = foundDish.ingredients;
      } else if (
        typeof foundDish.ingredients === "string" &&
        foundDish.ingredients.trim() !== ""
      ) {
        ingArray = foundDish.ingredients.split(",").map((i) => i.trim());
      }
      setIngredients(ingArray);
      setDishImage(foundDish.imageUrl || "");
    } else {
      setSelectedDishId(null);
      setIngredients([]);
      setDishImage("");
    }

    setIsDropdownOpen(false);
  };

  const toggleAllergy = (ingredient) => {
    setSelectedAllergies((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDish) {
      onNotify("Please select a dish from the menu first.", "error");
      return;
    }

    const newOrder = {
      dishId: selectedDishId,
      dishName: selectedDish,
      quantity: parseInt(quantity),
      tableNumber: parseInt(tableNumber),
      prepTimeMinutes: prepTime,
      isVip: isVip,
      workspaceId: parseInt(workspaceId),
      // Allergies are sent as part of the order payload
      customerAllergies: selectedAllergies,
    };

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        onNotify(
          `Order fired to kitchen: ${quantity}x ${selectedDish}${
            selectedAllergies.length > 0
              ? ` (Allergies: ${selectedAllergies.join(", ")})`
              : ""
          }`,
          "success",
        );

        // Reset form
        setSelectedDish("");
        setSelectedDishId(null);
        setDishImage("");
        setIngredients([]);
        setQuantity(1);
        setTableNumber("");
        setIsVip(false);
        setSelectedAllergies([]);
      } else {
        onNotify("Failed to send order to kitchen.", "error");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      onNotify("Network error occurred.", "error");
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4 w-full h-full relative overflow-y-auto custom-scrollbar transition-all duration-300 hover:shadow-orange-500/5 hover:border-slate-700 group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 opacity-75"></div>

      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2 mt-1">
        <span className="text-lg opacity-90 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
          🛎️
        </span>
        <h2 className="text-base font-bold text-white tracking-wide">
          New Order Entry
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Dish selection */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within/input:text-orange-400">
            Dish Name
          </label>

          {dishImage && (
            <div className="w-full h-28 mt-1 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
              <img
                src={dishImage}
                alt={selectedDish}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 bg-slate-950 border ${
              isDropdownOpen
                ? "border-orange-500 ring-2 ring-orange-500/50"
                : "border-slate-800 hover:border-slate-600"
            } rounded-xl text-slate-200 transition-all duration-300 cursor-pointer shadow-inner flex justify-between items-center`}
          >
            <span
              className={`text-xs ${
                selectedDish ? "text-slate-200 font-medium" : "text-slate-500"
              }`}
            >
              {selectedDish || "Select a dish..."}
            </span>
            <span
              className={`text-[10px] text-slate-500 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180 text-orange-500" : ""
              }`}
            >
              ▼
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-50 top-full left-0 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-1.5 mt-1">
              <div className="max-h-40 overflow-y-auto px-1.5 custom-scrollbar pr-1">
                {menu.length === 0 ? (
                  <div className="px-3 py-2 text-slate-500 text-xs font-medium">
                    Loading menu...
                  </div>
                ) : (
                  menu.map((dish) => (
                    <div
                      key={dish.id}
                      onClick={() => handleDishSelect(dish.name)}
                      className={`px-3 py-2 mb-1 rounded-xl text-xs cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                        selectedDish === dish.name
                          ? "bg-orange-500/15 text-orange-400 font-bold border-l-2 border-orange-500"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                      }`}
                    >
                      {selectedDish === dish.name && (
                        <span className="text-orange-500 text-xs shrink-0">
                          ✓
                        </span>
                      )}
                      {dish.imageUrl && (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="w-5 h-5 rounded object-cover border border-slate-700 shrink-0"
                        />
                      )}
                      <span className="truncate">{dish.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Allergy selection block (kept — now part of normal order flow) */}
        {ingredients.length > 0 && (
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Allergies / Restrictions
            </label>

            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing) => (
                <label
                  key={ing}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all ${
                    selectedAllergies.includes(ing)
                      ? "bg-red-900/40 border-red-600/60 text-red-300"
                      : "bg-slate-800/60 border-slate-700 hover:bg-slate-700 text-slate-300"
                  } border`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAllergies.includes(ing)}
                    onChange={() => toggleAllergy(ing)}
                    className="w-3.5 h-3.5 accent-red-500"
                  />
                  {ing}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex flex-col gap-1 group/input">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within/input:text-orange-400">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 hover:border-slate-600 shadow-inner placeholder-slate-700"
            placeholder="e.g. 1"
          />
        </div>

        {/* Table Number */}
        <div className="flex flex-col gap-1 group/input">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within/input:text-orange-400">
            Table Number
          </label>
          <input
            type="number"
            min="1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 hover:border-slate-600 shadow-inner placeholder-slate-700"
            placeholder="e.g. 12"
          />
        </div>

        {/* Prep Time */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Prep Time (Mins)
          </label>
          <input
            type="number"
            value={prepTime}
            disabled
            className="w-full p-2 bg-slate-950/50 border border-slate-800/50 rounded-xl text-slate-500 font-bold cursor-not-allowed text-sm text-left shadow-inner"
          />
        </div>

        {/* Ingredients Tags */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Ingredients
          </label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ingredients.length === 0 ? (
              <span className="text-slate-600 text-[10px] italic">
                No ingredients listed
              </span>
            ) : (
              ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[9px] font-medium border border-slate-700 uppercase tracking-wider"
                >
                  {ing}
                </span>
              ))
            )}
          </div>
        </div>

        {/* VIP Checkbox */}
        <div className="pt-0.5">
          <label
            className={`flex items-center gap-2 cursor-pointer p-2 rounded-xl border transition-all duration-300 ${
              isVip
                ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "bg-slate-950/50 border-slate-800 hover:bg-slate-800/80"
            }`}
          >
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer transition-colors"
            />
            <span
              className={`text-xs font-bold tracking-wide transition-colors duration-300 ${
                isVip
                  ? "text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                  : "text-slate-400"
              }`}
            >
              Priority VIP Order 👑
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_auto] hover:bg-[center_right_1rem] text-white font-black py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 active:shadow-none uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 group/btn"
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
