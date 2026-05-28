"use client";

import { useState, useEffect } from "react";

export default function Filters({
    onSearch,
    sortBy: currentSort,
    direction: currentDirection,
}: any) {

    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [type, setType] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [direction, setDirection] = useState("DESC");
    const [minRating, setMinRating] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

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

    const applySort = (sort: string, dir: string) => {
        setSortBy(sort);
        setDirection(dir);
    };

    const handleSearch = () => {
        onSearch({
            keyword,
            city,
            minPrice,
            maxPrice,
            minRating: minRating ? Number(minRating) : undefined,
            type,
            categoryId: categoryId ? Number(categoryId) : undefined,
            ...(sortBy ? { sortBy } : {}),
            ...(direction ? { direction } : {}),
        });
    };

    const handleReset = () => {
        setKeyword(""); setCity(""); setMinPrice(""); setMaxPrice("");
        setMinRating(""); setType(""); setCategoryId("");
        setSortBy("createdAt"); setDirection("DESC");
        onSearch({ page: 0, size: 12 });
    };

    // ── Classes conditionnelles ───────────────────────────
    const inputClass = isMobile
        ? "w-full border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        : "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    const selectClass = isMobile
        ? "w-full border border-gray-200 rounded-xl px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        : "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-visible">

            <div className={`${isMobile ? "p-3" : "p-4"} space-y-${isMobile ? "2" : "4"}`}>

                {/* ── Recherche + Ville ── */}
                <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-3"} md:grid-cols-2`}>
                    <input
                        placeholder="🔍 Recherche..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className={inputClass}
                    />
                    <input
                        placeholder="📍 Ville"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* ── MOBILE ── */}
                {isMobile ? (
                    <div className="space-y-2">

                        {/* Prix min / max */}
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                placeholder="💰 Prix min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={inputClass}
                            />
                            <input
                                placeholder="💰 Prix max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Récents + Note min */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => applySort("createdAt", "DESC")}
                                className={`w-full px-2 py-2 rounded-xl text-sm font-medium transition-colors ${currentSort === "createdAt"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                            >
                                🆕 Récents
                            </button>
                            <input
                                placeholder="⭐ Note min"
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Prix croissant / décroissant */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => applySort("pricePerDay", "ASC")}
                                className={`w-full px-2 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === "pricePerDay" && direction === "ASC"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                            >
                                💰 Prix ↑
                            </button>
                            <button
                                onClick={() => applySort("pricePerDay", "DESC")}
                                className={`w-full px-2 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === "pricePerDay" && direction === "DESC"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                            >
                                💰 Prix ↓
                            </button>

                        </div>

                    </div>

                ) : (
                    <>
                        {/* ── WEB ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                placeholder="💰 Prix min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={inputClass}
                            />
                            <input
                                placeholder="💰 Prix max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={inputClass}
                            />
                            <input
                                placeholder="⭐ Note min"
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Tri web */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => applySort("createdAt", "DESC")}
                                className={`min-w-[160px] px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentSort === "createdAt"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                            >
                                🆕 Plus récents
                            </button>
                            <button
                                onClick={() => applySort("pricePerDay", "ASC")}
                                className={`min-w-[160px] px-4 py-3 rounded-xl text-sm font-medium transition-colors ${sortBy === "pricePerDay" && direction === "ASC"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                            >
                                💰 Prix croissant
                            </button>
                            <button
                                onClick={() => applySort("pricePerDay", "DESC")}
                                className={`min-w-[170px] px-4 py-3 rounded-xl text-sm font-medium transition-colors ${sortBy === "pricePerDay" && direction === "DESC"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                            >
                                💰 Prix décroissant
                            </button>
                        </div>
                    </>
                )}

                {/* ── Catégorie + Type ── */}
                <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-3"}`}>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">📦 Catégorie</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={selectClass}
                    >
                        <option value="">📂 Type</option>
                        <option value="RENTAL">📦 Location</option>
                        <option value="AUCTION">🔥 Enchère</option>
                    </select>
                </div>

            </div>

            {/* ── Actions ── */}
            <div className={`border-t border-gray-100 bg-white ${isMobile ? "p-2 sticky bottom-0 z-20" : "p-4"
                }`}>
                <div className={`flex gap-${isMobile ? "2" : "3"} flex-row`}>
                    <button
                        onClick={handleSearch}
                        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors ${isMobile ? "py-2" : "py-3"
                            }`}
                    >
                        🔍 Rechercher
                    </button>
                    <button
                        onClick={handleReset}
                        className={`bg-red-500 hover:bg-red-600 text-white px-4 rounded-xl text-sm font-semibold transition-colors ${isMobile ? "py-2" : "py-3"
                            }`}
                    >
                        🔄 Effacer
                    </button>
                </div>
            </div>

        </div >
    );
}
