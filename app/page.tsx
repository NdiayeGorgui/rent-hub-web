"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { fetchItems, getNearbyItems, searchItems } from "@/services/itemService";
import { getAuctionPublicByItemId } from "@/services/auctionService";
import { useAuth } from "@/components/contexts/AuthContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ItemCard from "@/components/ui/ItemCard";
import Filters from "@/components/ui/Filters";



export default function Home() {

  const categories = [
    { id: 1, name: "Électronique" },
    { id: 2, name: "Électroménager" },
    { id: 3, name: "Événements" },
    { id: 4, name: "Véhicules" },
    { id: 5, name: "Bébé & Enfants" },
    { id: 6, name: "Sport & Loisirs" },
    { id: 7, name: "Maison & Meubles" },
    { id: 8, name: "Mode & Vêtements" },
    { id: 9, name: "Outils & Bricolage" },
    { id: 10, name: "Autres" },
  ];

  const FILTER_LABELS: any = {
    keyword: "Recherche",
    city: "Ville",
    type: "Type",
    categoryId: "Catégorie",
    minPrice: "Prix min",
    maxPrice: "Prix max",
    minRating: "Note min",
  };

  const { user, loading } = useAuth();

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ── Initialise depuis l'URL au montage ────────────────
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? 0));
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "createdAt");
  const [direction, setDirection] = useState(searchParams.get("direction") ?? "DESC");
  const [activeFilters, setActiveFilters] = useState<any>(() => {
    const saved = searchParams.get("filters");
    return saved ? JSON.parse(decodeURIComponent(saved)) : {};
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(() => {
    const saved = searchParams.get("filters");
    return saved ? Object.keys(JSON.parse(decodeURIComponent(saved))).length : 0;
  });

  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [auctionData, setAuctionData] = useState<any>({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);


  const [loadingNearby, setLoadingNearby] = useState(false);

  // ── Sync URL ──────────────────────────────────────────
  const updateUrl = useCallback((p: number, sb: string, dir: string, filters: any) => {
    const params = new URLSearchParams();
    if (p > 0) params.set("page", String(p));
    if (sb !== "createdAt") params.set("sortBy", sb);
    if (dir !== "DESC") params.set("direction", dir);
    if (Object.keys(filters).length > 0) {
      params.set("filters", encodeURIComponent(JSON.stringify(filters)));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);

  // ── Restaure scroll au retour ─────────────────────────
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("home_scroll");
    if (savedScroll) {
      // Attend que les items soient rendus
      const timer = setTimeout(() => {
        window.scrollTo({ top: Number(savedScroll), behavior: "instant" });
      }, 100); // ← augmente à 300ms
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  const loadItems = async (currentPage = page, currentSortBy = sortBy, currentDirection = direction, currentFilters = activeFilters) => {
    setLoadingItems(true);
    try {
      const res = await searchItems({

        ...currentFilters,
        page: currentPage,
        size: 12,
        sortBy: currentSortBy,
        direction: currentDirection,
      });
      console.log("ITEMS:", res.content?.[0]?.imageUrls);

      if (res.content) {
        setItems(res.content);
        setTotalPages(res.totalPages);
        loadAuctions(res.content);
      } else {
        setItems(res);
        setTotalPages(1);
        loadAuctions(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (user) loadItems(page, sortBy, direction, activeFilters);
  }, [page, sortBy, direction]);

  useEffect(() => {
    if (!loading && user) {
      // Restaure les filtres depuis l'URL si présents
      loadItems(page, sortBy, direction, activeFilters);
    }
  }, [user, loading]);

  const formatFilterValue = (key: string, value: any) => {

    if (key === "type") {
      return value === "AUCTION" ? "🔥 Enchère" : "📦 Location";
    }

    if (key === "categoryId") {
      const cat = categories.find(c => c.id === Number(value));
      return cat ? cat.name : value;
    }

    if (key === "minRating") {
      return `${value} ⭐`;
    }

    if (key === "minPrice") {
      return `${value} $ min`;
    }

    if (key === "maxPrice") {
      return `${value} $ max`;
    }

    return value;
  };

  const resetFilters = async () => {
    setActiveFilters({});
    setActiveFiltersCount(0);
    setSortBy("createdAt");
    setDirection("DESC");
    setPage(0);
    setTotalPages(1);
    setNearbyMode(false);
    setUserLocation(null);
    sessionStorage.removeItem("home_scroll");
    router.replace(pathname, { scroll: false }); // ← URL propre
    await loadItems(0, "createdAt", "DESC", {});
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

  const removeFilter = async (key: string) => {
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(updated);
    setActiveFiltersCount(Object.keys(updated).length);
    setPage(0);
    updateUrl(0, sortBy, direction, updated); // ← sync URL
    const res = await searchItems({ ...updated, page: 0, size: 12, sortBy, direction });
    if (res.content) {
      setItems(res.content);
      setTotalPages(res.totalPages);
      loadAuctions(res.content);
    } else {
      setItems(res);
      loadAuctions(res);
    }
  };
  const handleSearch = async (filters: any) => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, v]) =>
        !["sortBy", "direction", "page", "size"].includes(key) &&
        v !== null && v !== "" && v !== undefined
      )
    );
    setActiveFilters(cleanedFilters);
    setActiveFiltersCount(Object.keys(cleanedFilters).length);
    setPage(0);
    setNearbyMode(false);
    setShowFilters(false);
    updateUrl(0, sortBy, direction, cleanedFilters); // ← sync URL
    await loadItems(0, sortBy, direction, cleanedFilters);
  };

  const handleNearby = () => {
    setLoadingNearby(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          setUserLocation({ lat, lng });

          const data = await getNearbyItems(lat, lng, radius);
          console.log("NEARBY:", data[0]?.imageUrls);

          setItems(data);
          setNearbyMode(true);

          // 🔥 IMPORTANT
          setTotalPages(1);
          setPage(0);

          loadAuctions(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingNearby(false);
        }
      },
      (err) => {
        console.error(err);
        setLoadingNearby(false);
        alert("Impossible d'obtenir votre position");
      }
    );
  };

  const exitNearby = async () => {
    setNearbyMode(false);
    setUserLocation(null);
    setPage(0);

    loadItems(0); // recharge normal
  };

  const changeRadius = async (r: number) => {
    setRadius(r);
    if (!userLocation) return;
    setLoadingNearby(true);
    try {
      const effectiveRadius = r === 50 ? 500 : r; // ← 500km pour "50+"
      const data = await getNearbyItems(userLocation.lat, userLocation.lng, effectiveRadius);
      setItems(data);
      setTotalPages(1);
      loadAuctions(data);
    } finally {
      setLoadingNearby(false);
    }
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

      {/* 🔽 HEADER FILTRES */}
      <div
        onClick={() => setShowFilters(!showFilters)}
        className="bg-white rounded-xl shadow p-4 mb-4 cursor-pointer flex justify-between items-center"
      >
        <span className="font-semibold flex items-center gap-2">
          🔍 Filtres

          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </span>

        <span className="text-sm text-gray-500">
          {showFilters ? "▲" : "▼"}
        </span>
      </div>
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">

          {Object.entries(activeFilters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 bg-white border px-3 py-1 rounded-full text-sm shadow"
            >
              <span className="text-gray-600">
                {FILTER_LABELS[key] || key}:
              </span>

              <span className="font-semibold">
                {formatFilterValue(key, value)}
              </span>

              <button
                onClick={() => removeFilter(key)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 font-semibold ml-2"
          >
            Effacer tout
          </button>

        </div>
      )}
      {/* 🔽 PANEL */}
      <div
        className={`transition-all duration-300 overflow-hidden ${showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <Filters onSearch={handleSearch} sortBy={sortBy} direction={direction} />
        </div>
      </div>

      {/* Nearby + Radius */}
      <div className="flex gap-2 items-center mb-6">
        <button
          onClick={nearbyMode ? exitNearby : handleNearby}
          disabled={loadingNearby}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${nearbyMode ? "bg-green-700" : "bg-green-500 hover:bg-green-600"
            } disabled:opacity-60 cursor-pointer`}
        >
          {loadingNearby ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Localisation...
            </>
          ) : (
            <>📍 {nearbyMode ? "Mode proximité ON" : "Près de moi"}</>
          )}
        </button>

        {nearbyMode && (
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => changeRadius(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${radius === r
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {r === 50 ? "50 km +" : `${r} km`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LISTE */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Aucun item trouvé</p>
        </div>
      ) : (
        <>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} >

                <div
                  className="bg-white rounded-xl shadow hover:scale-105 hover:shadow-md transition-all overflow-hidden cursor-pointer"
                  onClick={() => {
                    sessionStorage.setItem("home_scroll", String(window.scrollY));
                    router.push(`/items/${item.id}`);
                  }}
                >
                  <ItemCard item={item} />
                  {item.distanceLabel && (
                    <p className="text-green-600 text-sm font-semibold px-3 pb-2">
                      📍 à ~{item.distanceLabel}
                    </p>
                  )}
                </div>

                {item.type === "AUCTION" && auctionData[item.id] ? (

                  <div className="bg-white px-4 py-3 rounded-b-xl shadow text-sm flex justify-between text-gray-600 border-t border-gray-100">
                    <span>💰 {auctionData[item.id].currentPrice} $</span>
                    <span>👀 {auctionData[item.id].views}</span>
                    <span>⭐ {auctionData[item.id].watchers}</span>
                    <span>⏳ {getTimeLeft(auctionData[item.id].endDate)}</span>
                  </div>

                ) : (

                  <div className="bg-white px-4 py-3 rounded-b-xl shadow text-sm flex justify-between text-gray-600 border-t border-gray-100">

                    <span className="text-red-500 font-semibold">
                      💰 {item.pricePerDay} $ / jr
                    </span>

                    <span>📅 Disponible</span>

                    {item.distanceLabel ? (
                      <span className="text-green-600 font-medium">
                        📍 ~{item.distanceLabel}
                      </span>
                    ) : (
                      <span>📍 {item.city}</span>
                    )}

                  </div>

                )}
              </div>
            ))}
          </div>

          {/* 🔥 PAGINATION */}
          {!nearbyMode && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">

              <button
                onClick={() => {
                  const p = Math.max(page - 1, 0);
                  setPage(p);
                  updateUrl(p, sortBy, direction, activeFilters);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 0}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >←</button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPage(i);
                    updateUrl(i, sortBy, direction, activeFilters);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`px-3 py-1 rounded cursor-pointer ${page === i ? "bg-blue-600 text-white" : "bg-white border"}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => {
                  const p = Math.min(page + 1, totalPages - 1);
                  setPage(p);
                  updateUrl(p, sortBy, direction, activeFilters);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === totalPages - 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >→</button>

            </div>
          )}
        </>
      )}
    </div>
  );
}