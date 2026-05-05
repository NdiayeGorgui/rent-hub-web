import { API } from "./api";

export interface PublicStats {
  activeItems: number;
  openAuctions: number;
  totalMembers: number;
  averageRating: number;
}

export const fetchPublicStats = async () => {
  try {
    const res = await API.get("/stats/public");
    return res.data;
  } catch (error: any) {
    console.log("fetchPublicStats error:", error?.response?.data || error.message);

    // fallback propre pour éviter crash UI
    return {
      activeItems: 0,
      openAuctions: 0,
      totalMembers: 0,
      averageRating: 0,
    };
  }
};