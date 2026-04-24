"use client";

import { useState } from "react";

export default function Filters({ onSearch }: any) {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [type, setType] = useState("");

  const handleSearch = () => {
    onSearch({
      keyword,
      city,
      minPrice,
      maxPrice,
      type,
      page: 0,
      size: 10,
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
      
      <input placeholder="Recherche..." value={keyword} onChange={e => setKeyword(e.target.value)} className="input" />
      <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} className="input" />

      <div className="flex gap-2">
        <input placeholder="Prix min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="input" />
        <input placeholder="Prix max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input" />
      </div>

      <select value={type} onChange={e => setType(e.target.value)} className="input">
        <option value="">Type</option>
        <option value="RENTAL">📦 Location</option>
        <option value="AUCTION">🔥 Enchère</option>
      </select>

      <button onClick={handleSearch} className="bg-[#FF385C] text-white px-4 py-2 rounded-lg">
        Rechercher
      </button>
    </div>
  );
}