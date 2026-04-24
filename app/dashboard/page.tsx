"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/services/adminService";

function StatCard({ title, value, color, icon }: { title: string; value: any; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg`} style={{ background: color + "20" }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const sections = [
    {
      title: "Utilisateurs",
      cards: [
        { title: "Total utilisateurs", value: stats.totalUsers,  icon: "👥", color: "#2563eb" },
        { title: "Utilisateurs actifs", value: stats.activeUsers, icon: "✅", color: "#16a34a" },
      ]
    },
    {
      title: "Items",
      cards: [
        { title: "Total items",    value: stats.totalItems,     icon: "📦", color: "#7c3aed" },
        { title: "Items publiés",  value: stats.publishedItems, icon: "🟢", color: "#22c55e" },
      ]
    },
    {
      title: "Locations",
      cards: [
        { title: "Total locations",  value: stats.totalRentals,  icon: "🔁", color: "#f59e0b" },
        { title: "Locations actives", value: stats.activeRentals, icon: "⏳", color: "#ef4444" },
      ]
    },
    {
      title: "Paiements",
      cards: [
        { title: "Total paiements",    value: stats.paymentStats.totalPayments,   icon: "💳", color: "#2563eb" },
        { title: "Paiements réussis",  value: stats.paymentStats.successPayments, icon: "✅", color: "#16a34a" },
        { title: "En attente",         value: stats.paymentStats.pendingPayments, icon: "⏳", color: "#f59e0b" },
        { title: "Échoués",            value: stats.paymentStats.failedPayments,  icon: "❌", color: "#ef4444" },
      ]
    },
    {
      title: "Revenus & Notation",
      cards: [
        { title: "Revenus totaux",      value: `${stats.totalRevenue} $`,                      icon: "💰", color: "#10b981" },
        { title: "Note moyenne",        value: stats.averagePlatformRating?.toFixed(2),         icon: "⭐", color: "#facc15" },
      ]
    },
    {
      title: "Litiges",
      cards: [
        { title: "Total litiges",    value: stats.disputeStats.totalDisputes,    icon: "⚖️", color: "#f59e0b" },
        { title: "Ouverts",          value: stats.disputeStats.openDisputes,     icon: "🔓", color: "#eab308" },
        { title: "Résolus",          value: stats.disputeStats.resolvedDisputes, icon: "✅", color: "#22c55e" },
        { title: "Rejetés",          value: stats.disputeStats.rejectedDisputes, icon: "❌", color: "#ef4444" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        <div className="flex flex-col gap-8">
          {sections.map(({ title, cards }) => (
            <div key={title}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">{title}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card) => (
                  <StatCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}