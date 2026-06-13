import { API } from "./api";

export const generateDescription = async (data: {
  title: string;
  category_id: number;
  item_type: string;
  price_per_day?: number;
  city?: string;
}): Promise<string> => {
  const res = await API.post("/ai/generate-description", data);
  return res.data.description;
};

export const suggestPrice = async (data: {
  title: string;
  category_id: number;
  item_type: string;
}): Promise<{
  min_price: number;
  max_price: number;
  recommended_price: number;
  reasoning: string;
}> => {
  const res = await API.post("/ai/suggest-price", data);
  return res.data;
};