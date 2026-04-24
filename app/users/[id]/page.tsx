"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserProfile } from "@/services/profileService";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserProfile(String(id));
        setUser(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Utilisateur introuvable
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 pb-16">

      {/* Header profil */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="bg-gray-50 px-3 py-1 rounded-full text-gray-600">
            📍 {user.city}
          </span>
          <span className="bg-gray-50 px-3 py-1 rounded-full text-gray-600">
            ⭐ {user.averageRating?.toFixed(1)} ({user.reviewsCount} avis)
          </span>
          {user.premium && (
            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-medium">
              💎 Premium
            </span>
          )}
          {user.badge && (
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
              🏅 {user.badge}
            </span>
          )}
        </div>
      </div>

      {/* Articles publiés */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">📦 Articles publiés</h2>
        {user.publishedItems?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {user.publishedItems.map((item: any) => (
              <div key={item.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-gray-800">
                  {item.title}
                  {item.pricePerDay && (
                    <span className="text-blue-600 ml-2">{item.pricePerDay} $/jour</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  📅 Publié le {new Date(item.createdAt).toLocaleDateString("fr-CA")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucun article publié</p>
        )}
      </div>

      {/* Historique location */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">🔁 Historique de location</h2>
        {user.rentedItems?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {user.rentedItems.map((item: any) => (
              <div key={item.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-gray-800">
                  {item.title}
                  {item.pricePerDay && (
                    <span className="text-blue-600 ml-2">{item.pricePerDay} $/jour</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  📅 Du {new Date(item.startDate).toLocaleDateString("fr-CA")} au {new Date(item.endDate).toLocaleDateString("fr-CA")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucun article loué</p>
        )}
      </div>

    </div>
  );
}