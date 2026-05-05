"use client";

import { useState } from "react";

export default function Filters({ onSearch }: any) {
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [type, setType] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [direction, setDirection] = useState("DESC");
    const [minRating, setMinRating] = useState("");

    const applySort = (sort: string, dir: string) => {
        setSortBy(sort);
        setDirection(dir);

        onSearch({
            keyword,
            city,
            minPrice,
            maxPrice,
            minRating: minRating ? Number(minRating) : undefined,
            type,
            categoryId: categoryId ? Number(categoryId) : undefined,
            sortBy: sort,        // ✅ DIRECT
            direction: dir,      // ✅ DIRECT
            page: 0,
            size: 12,
        });
    };

    const handleReset = () => {
        setKeyword("");
        setCity("");
        setMinPrice("");
        setMaxPrice("");
        setMinRating("");
        setType("");
        setCategoryId("");
        setSortBy("createdAt");
        setDirection("DESC");

        onSearch({
            page: 0,
            size: 12,
        });
    };
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


    const handleSearch = () => {
        onSearch({
            keyword,
            city,
            minPrice,
            maxPrice,
            minRating: minRating ? Number(minRating) : undefined,
            type,
            categoryId: categoryId ? Number(categoryId) : undefined,
            sortBy,
            direction,
            page: 0,
            size: 12,
        });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">

            {/* Recherche */}
            <input
                placeholder="Recherche..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="input"
            />

            <input
                placeholder="Ville"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="input"
            />

            {/* Prix+ note */}
            <div className="flex gap-2">

                <input
                    placeholder="Prix min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="input flex-1"
                />

                <input
                    placeholder="Prix max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="input flex-1"
                />

                <input
                    placeholder="Note (1-5) ⭐"
                    value={minRating}
                    onChange={e => setMinRating(e.target.value)}
                    className="input flex-1"
                />

            </div>

            {/* Catégorie + Type */}
            <div className="flex gap-3">
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="flex-1 border p-2 rounded"
                >
                    <option value="">Catégorie</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex-1 border p-2 rounded"
                >
                    <option value="">Type</option>
                    <option value="RENTAL">📦 Location</option>
                    <option value="AUCTION">🔥 Enchère</option>
                </select>
            </div>

            {/* TRI + ACTIONS */}
            <div className="flex items-center gap-2 overflow-x-auto">

                <button
                    onClick={() => applySort("createdAt", "DESC")}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
                >
                    🆕 Plus récents
                </button>

                <button
                    onClick={() => applySort("pricePerDay", "ASC")}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
                >
                    💰 Prix ↑
                </button>

                <button
                    onClick={() => applySort("pricePerDay", "DESC")}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
                >
                    💰 Prix ↓
                </button>

                {/* PUSH DROITE */}
                <div className="ml-auto flex gap-2">

                    {/* RECHERCHER */}
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap  cursor-pointer"
                    >
                      🔍 Rechercher
                    </button>

                    {/* RESET */}
                    <button
                        onClick={handleReset}
                        className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm whitespace-nowrap cursor-pointer"
                    >
                        🔄 Effacer
                    </button>

                </div>
            </div>

        </div>
    );
}