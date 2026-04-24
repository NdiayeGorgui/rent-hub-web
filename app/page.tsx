"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchItems, getNearbyItems, searchItems } from "@/services/itemService";
import { getAuctionPublicByItemId } from "@/services/auctionService";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import ItemCard from "@/components/ui/ItemCard";
import Filters from "@/components/ui/Filters";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [auctionData, setAuctionData] = useState<any>({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("DESC");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  const loadItems = async () => {
    const data = await searchItems({
      page: 0,
      size: 10,
      sortBy,
      direction,
    });
    setItems(data);
    loadAuctions(data);
    setLoadingItems(false);
  };

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [sortBy, direction]);

  useEffect(() => {
    if (!loading && user) {
      loadItems();
    }
  }, [user, loading]);

  const resetFilters = async () => {
    try {
      setLoadingItems(true);

      // reset tri
      setSortBy("createdAt");
      setDirection("DESC");

      // reset mode proximité
      setNearbyMode(false);
      setUserLocation(null);

      // reset liste
      const data = await fetchItems();
      setItems(data);
      loadAuctions(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadAuctions = async (items: any[]) => {
    const map: any = {};
    for (const item of items) {
      if (item.type === "AUCTION") {
        const auction = await getAuctionPublicByItemId(item.id);
        map[item.id] = auction;
      }
    }
    setAuctionData(map);
  };

  const handleSearch = async (filters: any) => {
    const data = await searchItems({
      ...filters,
      sortBy,
      direction,
    });
    setItems(data);
    loadAuctions(data);
  };

  const handleNearby = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        const data = await getNearbyItems(lat, lng, radius);
        setItems(data);
        setNearbyMode(true);
        loadAuctions(data);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const changeRadius = async (r: number) => {
    setRadius(r);
    if (!userLocation) return;
    const data = await getNearbyItems(userLocation.lat, userLocation.lng, r);
    setItems(data);
    loadAuctions(data);
  };

const getTimeLeft = (endDate: string) => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "terminée";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return `${days}j ${hours}h`; // clean
  if (hours > 0) return `${hours}h ${minutes}m`; // précis
  if (minutes > 0) return `${minutes}m`;

  return "< 1 min";
};

  if (loading || loadingItems) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <Filters onSearch={handleSearch} />

      <div className="flex gap-2 mb-4 flex-wrap">

        <button
          onClick={() => {
            setSortBy("createdAt");
            setDirection("DESC");
            loadItems();
          }}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          🆕 Plus récents
        </button>

        <button
          onClick={() => {
            setSortBy("pricePerDay");
            setDirection("ASC");
            loadItems();
          }}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          💰 Prix ↑
        </button>

        <button
          onClick={() => {
            setSortBy("pricePerDay");
            setDirection("DESC");
            loadItems();
          }}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          💰 Prix ↓
        </button>
        <button
          onClick={resetFilters}
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
        >
          🔄 Reset
        </button>
      </div>

      {/* Nearby + Radius */}
      <div className="flex gap-2 items-center mb-6">
        <button
          onClick={nearbyMode ? () => { setNearbyMode(false); loadItems(); } : handleNearby}
          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${nearbyMode ? "bg-green-700" : "bg-green-500 hover:bg-green-600"
            }`}
        >
          📍 {nearbyMode ? "Mode proximité ON" : "Près de moi"}
        </button>

        {nearbyMode && (
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => changeRadius(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${radius === r ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {r} km
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Liste items */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Aucun item trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id}>

              {/* Card cliquable */}
              <Link href={`/items/${item.id}`}>
                <div className="bg-white rounded-xl shadow hover:scale-105 hover:shadow-md transition-all overflow-hidden cursor-pointer">
                  <ItemCard item={item} />
                  {item.distanceLabel && (
                    <p className="text-green-600 text-sm font-semibold px-3 pb-2">
                      📍 à ~{item.distanceLabel}
                    </p>
                  )}
                </div>
              </Link>

              {/* Auction info */}
              {item.type === "AUCTION" && auctionData[item.id] && (
                <div className="bg-white px-4 py-3 rounded-b-xl shadow text-sm flex justify-between text-gray-600 border-t border-gray-100">
                  <span>💰 {auctionData[item.id].currentPrice} $</span>
                  <span>👀 {auctionData[item.id].views}</span>
                  <span>⭐ {auctionData[item.id].watchers}</span>
                  <span>⏳ {getTimeLeft(auctionData[item.id].endDate)}</span>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}