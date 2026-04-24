"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMyItems } from "@/services/itemService";

export default function MyItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    try {
      const data = await fetchMyItems();
      setItems(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  if (loading) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mes objets</h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Vous n'avez encore publié aucun objet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/my-items/${item.id}`)}
              className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition"
            >
              {item.imageUrls?.length > 0 && (
                <img
                 src={`http://localhost:8080${item.imageUrls[0]}`}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}

              <h2 className="font-bold text-lg">{item.title}</h2>
              <p className="text-gray-500 text-sm">{item.city}</p>

              {item.type === "RENTAL" && (
                <p className="text-blue-600 font-semibold mt-1">
                  {item.pricePerDay} $ / jour
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded text-white ${
                    item.type === "AUCTION" ? "bg-red-500" : "bg-blue-600"
                  }`}
                >
                  {item.type === "AUCTION" ? "🔥 ENCHÈRE" : "📦 LOCATION"}
                </span>

                <span
                  className={`text-xs font-bold px-2 py-1 rounded text-white ${
                    item.status === "CANCELLED_AUCTION"
                      ? "bg-yellow-400"
                      : item.active
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {item.status === "CANCELLED_AUCTION"
                    ? "Annulée"
                    : item.active
                    ? "Actif"
                    : "Désactivé"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}