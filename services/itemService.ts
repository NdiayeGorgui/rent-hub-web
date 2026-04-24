import { API } from "./api";

// 🔥 Liste des items
export const fetchItems = async () => {
  const res = await API.get("/items");
  return res.data;
};

// 🔥 Mes items
export const fetchMyItems = async () => {
  const res = await API.get("/items/me");
  return res.data;
};

// 🔥 Détails
export const fetchItemDetails = async (id: number) => {
  const res = await API.get(`/items/${id}/details`);
  return res.data;
};

// 🔥 Création (WEB simple)
export const createItem = async (formData: FormData) => {
  const res = await API.post("/items/with-images", formData);
  return res.data;
};

// 🔥 Activer / désactiver
export const deactivateItem = async (id: number) => {
  return API.put(`/items/${id}`);
};

export const activateItem = async (id: number) => {
  return API.put(`/items/${id}/activate`);
};

// 🔎 Recherche
export const searchItems = async (filters: any) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== null && v !== "")
  );

  const res = await API.get("/items/search", {
    params: cleanFilters,
  });

  return res.data.content;
};

// 📍 Nearby (🔥 IMPORTANT)
export const getNearbyItems = async (
  lat: number,
  lng: number,
  radiusKm = 10
) => {
  const res = await API.get("/items/nearby", {
    params: { lat, lng, radiusKm },
  });

  return res.data || []; // 🔥 protège contre null
};

// 🔥 Modifier un item
export const updateItem = async (id: number, formData: FormData) => {
  const res = await API.put(`/items/item/${id}/with-images`, formData);
  return res.data;
};