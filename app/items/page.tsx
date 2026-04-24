"use client";

import { useEffect, useState } from "react";
import { getAllItemsAdmin, activateItemAdmin, deactivateItemAdmin } from "@/services/adminItemService";

interface Item {
  itemId: number;
  title: string;
  city: string;
  pricePerDay: number;
  active: boolean;
  type: "RENTAL" | "AUCTION";
  username?: string;
  premium?: boolean;
  gracePeriod?: boolean;
  currentPrice?: number | null;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await getAllItemsAdmin();
      setItems(data);
    } catch { alert("Impossible de charger les items"); }
    finally { setLoading(false); }
  };

  const toggleItem = async (item: Item, newValue: boolean) => {
    if (!confirm(`${newValue ? "Activer" : "Désactiver"} "${item.title}" ?`)) return;
    try {
      if (newValue) { await activateItemAdmin(item.itemId); }
      else { await deactivateItemAdmin(item.itemId); }
      setItems(prev => prev.map(i => i.itemId === item.itemId ? { ...i, active: newValue } : i));
    } catch { alert("Erreur lors de la mise à jour"); }
  };

  const filtered = items.filter(i => {
    const s = search.toLowerCase();
    return (
      i.title?.toLowerCase().includes(s) ||
      i.username?.toLowerCase().includes(s) ||
      i.city?.toLowerCase().includes(s)
    );
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des items</h1>
          <p className="text-gray-400 mt-1">{items.length} item(s) au total</p>
        </div>

        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Rechercher par titre, owner, ville..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <div key={item.itemId} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">

              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  item.type === "AUCTION" ? "bg-red-50" : "bg-blue-50"
                }`}>
                  {item.type === "AUCTION" ? "🔥" : "📦"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">#{item.itemId} — {item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">@{item.username ?? "..."}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">📍 {item.city}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs font-semibold text-blue-600">
                      {item.type === "AUCTION"
                        ? `🔥 ${item.currentPrice ?? "—"} $`
                        : `${item.pricePerDay} $/j`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.premium && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">★ Premium</span>
                    )}
                    {item.gracePeriod && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Grace Period</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.active ? "Actif" : "Désactivé"}
                    </span>
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={Boolean(item.active)}
                  onChange={e => toggleItem(item, e.target.checked)}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:bg-violet-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}