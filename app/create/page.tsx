"use client";

import { useState, useEffect } from "react";
import { createItem } from "@/services/itemService";
import { useRouter } from "next/navigation";
import { fetchPremiumStatus } from "@/services/subscriptionService";

export default function CreatePage() {
  const router = useRouter();

  const [isPremium, setIsPremium] = useState(false);

  const [type, setType] = useState<"RENTAL" | "AUCTION">("RENTAL");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);

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

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const res = await fetchPremiumStatus();
        setIsPremium(res.premium);
      } catch {
        console.log("Premium check failed");
      }
    };

    checkPremium();
  }, []);

  const handleImages = (e: any) => {
    setImages([...e.target.files]);
  };

  const handleCreate = async () => {
    try {
      if (!title || !description || !categoryId || !city) {
        alert("Champs obligatoires manquants");
        return;
      }

      if (images.length === 0) {
        alert("Ajoute au moins une image");
        return;
      }

      // 📍 géolocalisation
      const pos = await new Promise<any>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      const formData = new FormData();

      const itemData = {
        title,
        description,
        categoryId: Number(categoryId),
        type,
        pricePerDay: type === "RENTAL" ? Number(pricePerDay) : null,
        city,
        address,
        latitude,
        longitude,
      };

      formData.append("data", JSON.stringify(itemData));

      images.forEach((img) => {
        formData.append("images", img);
      });

      const createdItem = await createItem(formData);

      if (type === "AUCTION") {
        router.push(`/auction-fee/${createdItem.id}`);
        return;
      }

      alert("Item créé !");
      router.push("/");

    } catch (err) {
      console.error(err);
      alert("Erreur création");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Poster un item</h1>

      <input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="input" />

   <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-4">

  {/* LOCATION */}
  <button
    onClick={() => setType("RENTAL")}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
      cursor-pointer
      ${type === "RENTAL"
        ? "bg-white shadow text-blue-600"
        : "text-gray-500 hover:bg-white hover:shadow"}
    `}
  >
    📦 Location
  </button>

  {/* ENCHÈRE */}
  <button
    disabled={!isPremium}
    onClick={() => isPremium && setType("AUCTION")}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${!isPremium
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer"}
      ${type === "AUCTION"
        ? "bg-white shadow text-red-500"
        : "text-gray-500 hover:bg-white hover:shadow"}
    `}
  >
    🔥 Enchère
    {!isPremium && (
      <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded ml-1">
        Premium
      </span>
    )}
  </button>

</div>

      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="input" />

      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
        <option value="">Choisir catégorie</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {type === "RENTAL" && (
        <input
          placeholder="Prix / jour"
          value={pricePerDay}
          onChange={e => setPricePerDay(e.target.value)}
          className="input"
        />
      )}

      <input placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} className="input" />
      <input placeholder="Adresse" value={address} onChange={e => setAddress(e.target.value)} className="input" />

      {/* Remplace <input type="file" multiple onChange={handleImages} /> par : */}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <svg className="w-8 h-8 text-gray-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095"/>
          </svg>
          <span className="text-sm text-gray-500">Cliquez pour ajouter des images</span>
          <span className="text-xs text-gray-400 mt-1">{images.length > 0 ? `${images.length} fichier(s) sélectionné(s)` : "PNG, JPG acceptés"}</span>
          <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        </label>

        {/* Prévisualisation */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleCreate}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-6 mb-6"
      >
        Publier
      </button>
    </div>
  );
}