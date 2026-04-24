"use client";

import { useEffect, useState } from "react";
import { getAllUsers, suspendUser, activateUser, strikeUser } from "@/services/adminService";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  enabled: boolean;
  roles: string[];
  subscription: string;
  auctionStrikes?: number;
  auctionRestricted?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch { alert("Impossible de charger les utilisateurs"); }
    finally { setLoading(false); }
  };

  const toggleUser = async (user: User, newValue: boolean) => {
    if (!confirm(`${newValue ? "Activer" : "Suspendre"} "${user.username}" ?`)) return;
    try {
      if (newValue) { await activateUser(user.id); }
      else { await suspendUser(user.id); }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: newValue } : u));
    } catch { alert("Erreur lors de la mise à jour"); }
  };

  const handleStrike = async (user: User) => {
    if (!confirm(`Ajouter un strike à ${user.username} ?\n3 strikes = interdiction aux enchères.`)) return;
    try {
      const res = await strikeUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, auctionStrikes: res.auctionStrikes, auctionRestricted: res.auctionRestricted }
        : u
      ));
    } catch { alert("Erreur lors du strike"); }
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(s) ||
      u.fullName?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.subscription?.toLowerCase().includes(s) ||
      (s === "admin" && u.roles.includes("ROLE_ADMIN")) ||
      (s === "actif" && u.enabled) ||
      (s === "suspendu" && !u.enabled)
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-400 mt-1">{users.length} utilisateur(s) au total</p>
        </div>

        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Rechercher par nom, email, subscription..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">

              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm flex-shrink-0">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
                    <span>@{user.username}</span>
                    <span className="text-gray-200">·</span>
                    <span>{user.email}</span>
                    {user.phone && <><span className="text-gray-200">·</span><span>📞 {user.phone}</span></>}
                    {user.city && <><span className="text-gray-200">·</span><span>📍 {user.city}</span></>}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.enabled ? "Actif" : "Suspendu"}
                    </span>
                    {user.roles.includes("ROLE_ADMIN") && (
                      <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full font-medium">ADMIN</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.subscription === "PREMIUM" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {user.subscription}
                    </span>
                    {user.auctionStrikes !== undefined && user.auctionStrikes > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        ⚠ {user.auctionStrikes}/3 strikes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {user.subscription === "PREMIUM" && (
                  <button onClick={() => handleStrike(user)}
                    className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200 transition-colors"
                  >
                    ⚠ Strike
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={Boolean(user.enabled)}
                    onChange={e => toggleUser(user, e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:bg-violet-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}