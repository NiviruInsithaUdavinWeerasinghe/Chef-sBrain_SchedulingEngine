import { useState, useEffect, useCallback } from "react";

export default function AdminPortal({ workspaceId, onNotify }) {
  const [menu, setMenu] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDishId, setCurrentDishId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState("");
  // --- NEW: State for substitutions mapping ---
  const [substitutions, setSubstitutions] = useState({});

  const fetchMenu = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/dishes?workspaceId=${workspaceId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
      }
    } catch (error) {
      console.error("Failed to fetch menu", error);
    }
  }, [workspaceId]);

  useEffect(() => {
    const loadMenu = async () => {
      await fetchMenu();
    };
    loadMenu();
  }, [fetchMenu]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean ingredients array
    const activeIngredients = ingredients
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i !== "");

    // Clean substitutions (only save keys that exist in ingredients and aren't empty)
    const cleanSubstitutions = {};
    activeIngredients.forEach((ing) => {
      if (substitutions[ing] && substitutions[ing].trim() !== "") {
        cleanSubstitutions[ing] = substitutions[ing].trim();
      }
    });

    const dishData = {
      name,
      prepTimeMinutes: parseInt(prepTimeMinutes),
      imageUrl,
      ingredients: activeIngredients,
      substitutions: cleanSubstitutions,
      workspaceId: parseInt(workspaceId),
    };

    try {
      const url = isEditing
        ? `http://localhost:8080/api/dishes/${currentDishId}`
        : `http://localhost:8080/api/dishes`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData),
      });

      if (res.ok) {
        onNotify(
          `Dish ${isEditing ? "updated" : "added"} successfully!`,
          "success",
        );
        resetForm();
        fetchMenu();
      } else {
        onNotify("Failed to save dish", "error");
      }
    } catch (error) {
      console.error("Error saving dish:", error);
      onNotify("Server error.", "error");
    }
  };

  const handleEdit = (dish) => {
    setIsEditing(true);
    setCurrentDishId(dish.id);
    setName(dish.name);
    setPrepTimeMinutes(dish.prepTimeMinutes);
    setImageUrl(dish.imageUrl || "");
    setIngredients(dish.ingredients ? dish.ingredients.join(", ") : "");
    setSubstitutions(dish.substitutions || {}); // --- NEW: Load subs on edit ---
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/dishes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onNotify("Dish deleted.", "success");
        fetchMenu();
      } else {
        onNotify("Failed to delete dish.", "error");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      onNotify("Failed to connect to server.", "error");
    }
  };

  const handleUnloadMenu = async () => {
    if (
      !window.confirm(
        "WARNING: This will delete ALL dishes in your menu. Proceed?",
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/dishes/unload?workspaceId=${workspaceId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        onNotify("Menu unloaded successfully.", "success");
        fetchMenu();
      } else {
        onNotify("Failed to unload menu.", "error");
      }
    } catch (error) {
      console.error("Unload Error:", error);
      onNotify("Failed to connect to server.", "error");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentDishId(null);
    setName("");
    setPrepTimeMinutes("");
    setImageUrl("");
    setIngredients("");
    setSubstitutions({}); // Reset subs
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-5 p-2 animate-fade-in">
      {/* Left Column: Menu List */}
      <div className="flex-[2] flex flex-col min-h-0 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 relative shadow-inner">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-500">📋</span> Manage Menu
          </h2>
          <button
            onClick={handleUnloadMenu}
            className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            Unload Menu (Delete All)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {menu.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
              Menu is empty. Add some dishes!
            </div>
          ) : (
            menu.map((dish) => (
              <div
                key={dish.id}
                className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  {dish.imageUrl && (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">
                      {dish.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                      Prep: {dish.prepTimeMinutes}m | INGREDIENTS:{" "}
                      {dish.ingredients?.length || 0} | Subs:{" "}
                      {Object.keys(dish.substitutions || {}).length}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(dish)}
                    className="p-2 bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    className="p-2 bg-slate-800 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Add/Edit Form */}
      <div className="flex-1 lg:max-w-[350px] flex flex-col min-h-0 bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 shrink-0">
          <span className="text-orange-500">{isEditing ? "✏️" : "➕"}</span>{" "}
          {isEditing ? "Edit Dish" : "Add New Dish"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 h-full">
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Dish Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-orange-500 outline-none"
                placeholder="e.g. Spicy Tacos"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Prep Time (Mins)
              </label>
              <input
                type="number"
                required
                min="1"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-orange-500 outline-none"
                placeholder="15"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-orange-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Ingredients / Tags
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-orange-500 outline-none resize-none h-20 shrink-0"
                placeholder="Beef, Dairy, Spicy... (Comma separated)"
              />
            </div>

            {/* --- Dynamic Substitution Fields --- */}
            {ingredients.split(",").filter((i) => i.trim() !== "").length >
              0 && (
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                  Suggested Substitutes
                </label>
                {ingredients
                  .split(",")
                  .map((i) => i.trim())
                  .filter((i) => i !== "")
                  .map((ing) => (
                    <div key={ing} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-20 truncate">
                        {ing}:
                      </span>
                      <input
                        type="text"
                        value={substitutions[ing] || ""}
                        onChange={(e) =>
                          setSubstitutions({
                            ...substitutions,
                            [ing]: e.target.value,
                          })
                        }
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs text-white outline-none focus:border-orange-500"
                        placeholder="Substitute..."
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Fixed Footer Buttons */}
          <div className="pt-2 flex gap-2 shrink-0 border-t border-slate-800">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-[2] py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-orange-500/20"
            >
              {isEditing ? "Update Dish" : "Add Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
