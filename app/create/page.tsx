"use client";

import { useState, useEffect } from "react";
import { createItem } from "@/services/itemService";
import { useRouter } from "next/navigation";
import { fetchPremiumStatus } from "@/services/subscriptionService";
import { generateDescription } from "@/services/aiService";

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
  const [creating, setCreating] = useState(false);
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [auctionEndDate, setAuctionEndDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [generatingDesc, setGeneratingDesc] = useState(false);

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


  const handleGenerateDescription = async () => {
    if (!title || !categoryId) {
      alert("Entrez d'abord le titre et la catégorie");
      return;
    }
    try {
      setGeneratingDesc(true);
      const desc = await generateDescription({
        title,
        category_id: Number(categoryId),
        item_type: type,
        price_per_day: pricePerDay ? Number(pricePerDay) : undefined,
        city: city || undefined,
      });
      setDescription(desc);
    } catch {
      alert("Impossible de générer la description");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleImages = (e: any) => {
    setImages([...e.target.files]);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Le titre est requis";
    if (!description.trim()) newErrors.description = "La description est requise";
    if (!categoryId) newErrors.categoryId = "La catégorie est requise";
    if (!city.trim()) newErrors.city = "La ville est requise";
    if (!address.trim()) newErrors.address = "L'adresse est requise";
    if (type === "RENTAL" && !pricePerDay) newErrors.pricePerDay = "Le prix est requis";
    if (type === "AUCTION" && !startPrice) newErrors.startPrice = "Le prix de départ est requis";
    if (type === "AUCTION" && !auctionEndDate) newErrors.auctionEndDate = "La date de fin est requise";
    if (images.length === 0) newErrors.images = "Au moins une image est requise";
    return newErrors;
  };

  const handleCreate = async () => {
    try {
      const newErrors = validate();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});

      setCreating(true);

      const pos = await new Promise<any>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = pos.coords;

      const start = Number(startPrice);

      const reserve =
        !reservePrice || Number(reservePrice) <= 0
          ? start
          : Number(reservePrice);

      if (reserve < start) {
        alert(
          "Le prix de réserve doit être supérieur ou égal au prix de départ"
        );
        return;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify({
        title,
        description,
        categoryId: Number(categoryId),
        type,

        pricePerDay:
          type === "RENTAL"
            ? Number(pricePerDay)
            : null,

        startPrice:
          type === "AUCTION"
            ? start
            : null,

        reservePrice:
          type === "AUCTION"
            ? reserve
            : null,

        auctionEndDate:
          type === "AUCTION"
            ? auctionEndDate
            : null,

        city,
        address,
        latitude,
        longitude,
      }));
      images.forEach(img => formData.append("images", img));

      const createdItem = await createItem(formData);

      if (type === "AUCTION") {
        // ← Passe les params auction dans l'URL pour les récupérer après paiement
        const params = new URLSearchParams({
          itemId: createdItem.id.toString(),
          startPrice,
          reservePrice: reservePrice || startPrice,
          auctionEndDate,
        });
        router.push(`/auction-fee?${params.toString()}`);
        return;
      }

      alert("Item créé !");
      router.push("/my-items");
    } catch (err) {
      console.error(err);
      alert("Erreur création");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-xl shadow mb-10">
      <h1 className="text-2xl font-bold mb-6">Poster un item</h1>

      {/* Toggle RENTAL / AUCTION */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6">
        <button
          onClick={() => { setType("RENTAL"); setErrors({}); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${type === "RENTAL"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-500 hover:bg-white hover:shadow"
            }`}
        >
          📦 Location
        </button>
        <button
          disabled={!isPremium}
          onClick={() => { if (isPremium) { setType("AUCTION"); setErrors({}); } }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isPremium ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            } ${type === "AUCTION" ? "bg-red-500 text-white shadow" : "text-gray-500 hover:bg-white hover:shadow"}`}
        >
          🔥 Enchère
          {!isPremium && (
            <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded ml-1">
              Premium
            </span>
          )}
        </button>
      </div>

      <div className="space-y-4">

        {/* Titre */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Titre de l'annonce"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: "" })); }}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.title
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-gray-200 focus:ring-blue-500"
              }`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">⚠ {errors.title}</p>}
        </div>

        {/* Description */}
        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDesc || !title || !categoryId}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {generatingDesc ? (
                <>
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>✨ Générer avec l'IA</>
              )}
            </button>
          </div>
          <textarea
            placeholder="Décrivez votre article en détail... ou utilisez l'IA ✨"
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }}
            rows={4}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none ${errors.description
                ? "border-red-400 focus:ring-red-400 bg-red-50"
                : "border-gray-200 focus:ring-blue-500"
              }`}
          />
          {generatingDesc && (
            <p className="text-xs text-violet-500 mt-1 animate-pulse">
              ✨ L'IA rédige votre description...
            </p>
          )}
          {errors.description && <p className="text-red-500 text-xs mt-1">⚠ {errors.description}</p>}
        </div>

        {/* Catégorie */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Catégorie <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={e => { setCategoryId(e.target.value); setErrors(p => ({ ...p, categoryId: "" })); }}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 ${errors.categoryId
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-gray-200 focus:ring-blue-500"
              }`}
          >
            <option value="">Choisir une catégorie</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">⚠ {errors.categoryId}</p>}
        </div>

        {/* Prix location */}
        {type === "RENTAL" && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Prix / jour ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Ex: 25"
              value={pricePerDay}
              onChange={e => { setPricePerDay(e.target.value); setErrors(p => ({ ...p, pricePerDay: "" })); }}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.pricePerDay
                ? "border-red-400 focus:ring-red-400 bg-red-50"
                : "border-gray-200 focus:ring-blue-500"
                }`}
            />
            {errors.pricePerDay && <p className="text-red-500 text-xs mt-1">⚠ {errors.pricePerDay}</p>}
          </div>
        )}

        {/* Champs enchère */}
        {type === "AUCTION" && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-orange-800">🔥 Paramètres enchère</h3>

            {/* Prix de départ */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Prix de départ ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={startPrice}
                onChange={e => { setStartPrice(e.target.value); setErrors(p => ({ ...p, startPrice: "" })); }}
                placeholder="Ex: 50"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.startPrice
                  ? "border-red-400 focus:ring-red-400 bg-red-50"
                  : "border-gray-200 focus:ring-orange-400"
                  }`}
              />
              {errors.startPrice && <p className="text-red-500 text-xs mt-1">⚠ {errors.startPrice}</p>}
            </div>

            {/* Prix de réserve */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Prix de réserve ($) <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="number"
                value={reservePrice}
                onChange={e => setReservePrice(e.target.value)}
                placeholder="Laissez vide si aucun"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={auctionEndDate}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                onChange={e => { setAuctionEndDate(e.target.value); setErrors(p => ({ ...p, auctionEndDate: "" })); }}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.auctionEndDate
                  ? "border-red-400 focus:ring-red-400 bg-red-50"
                  : "border-gray-200 focus:ring-orange-400"
                  }`}
              />
              {errors.auctionEndDate && <p className="text-red-500 text-xs mt-1">⚠ {errors.auctionEndDate}</p>}
              <p className="text-xs text-gray-400 mt-1">Minimum 24h à partir de maintenant</p>
            </div>
          </div>
        )}

        {/* Ville */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Ville <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Ex: Montréal"
            value={city}
            onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: "" })); }}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.city
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-gray-200 focus:ring-blue-500"
              }`}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">⚠ {errors.city}</p>}
        </div>

        {/* Adresse */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Adresse <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Ex: 123 rue Sainte-Catherine"
            value={address}
            onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: "" })); }}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${errors.address
              ? "border-red-400 focus:ring-red-400 bg-red-50"
              : "border-gray-200 focus:ring-blue-500"
              }`}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">⚠ {errors.address}</p>}
        </div>

        {/* Images */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Images <span className="text-red-500">*</span>
          </label>
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${errors.images
            ? "border-red-400 bg-red-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}>
            <svg className="w-8 h-8 text-gray-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095" />
            </svg>
            <span className="text-sm text-gray-500">Cliquez pour ajouter des images</span>
            <span className="text-xs text-gray-400 mt-1">
              {images.length > 0 ? `${images.length} fichier(s) sélectionné(s)` : "PNG, JPG acceptés"}
            </span>
            <input
              type="file" multiple accept="image/*"
              onChange={e => { handleImages(e); setErrors(p => ({ ...p, images: "" })); }}
              className="hidden"
            />
          </label>
          {errors.images && <p className="text-red-500 text-xs mt-1">⚠ {errors.images}</p>}

          {/* Prévisualisation */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    alt=""
                  />
                  <button
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Bouton publier */}
      <button
        onClick={handleCreate}
        disabled={creating}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-6 mb-6 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {creating ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Publication en cours...
          </>
        ) : "Publier"}
      </button>
    </div>
  );
}