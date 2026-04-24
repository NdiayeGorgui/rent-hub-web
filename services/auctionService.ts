import { API } from "./api";

// 🔥 CREATE AUCTION
export const createAuction = async (data: {
  itemId: number;
  startPrice: number;
  reservePrice: number;
  endDate: string;
}) => {
  try {
    const res = await API.post("/auctions", data);
    return res.data;
  } catch (err: any) {
    console.error("createAuction error", err);
    throw err?.response?.data || err;
  }
};

// 🔥 BID
export const placeBid = async (auctionId: number, amount: number) => {
  try {
    const res = await API.post(`/auctions/${auctionId}/bid`, { amount });
    return res.data;
  } catch (err: any) {
    console.error("placeBid error", err);
    throw err?.response?.data || err;
  }
};

// 🔥 PRIVATE AUCTION
export const getAuctionByItemId = async (itemId: number) => {
  try {
    const res = await API.get(`/auctions/by-item/${itemId}`);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

// 🔥 PUBLIC AUCTION (IMPORTANT POUR HOME)
export const getAuctionPublicByItemId = async (itemId: number) => {
  try {
    const res = await API.get(`/auctions/public/by-item/${itemId}`);
    return res.data;
  } catch (err: any) {
    // 👉 éviter crash page home
    return null;
  }
};

// 👀 WATCH
export const watchAuction = async (auctionId: number) => {
  try {
    const res = await API.post(`/auctions/${auctionId}/watch`);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || err;
  }
};

export const isWatchingAuction = async (auctionId: number) => {
  try {
    const res = await API.get(`/auctions/${auctionId}/is-watching`);
    return res.data;
  } catch {
    return false;
  }
};

// 🔥 ADMIN / OWNER ACTIONS
export const closeAuction = async (auctionId: number) => {
  const res = await API.post(`/auctions/${auctionId}/close`);
  return res.data;
};

export const updateAuction = async (id: number, data: any) => {
  const res = await API.put(`/auctions/${id}`, data);
  return res.data;
};

export const cancelAuction = async (auctionId: number) => {
  const res = await API.patch(`/auctions/${auctionId}/cancel`);
  return res.data;
};

// 🔥 USER DATA
export const getMyWonAuctions = async () => {
  const res = await API.get("/auctions/my/won");
  return res.data;
};

export const getMyClosedAuctionsAsOwner = async () => {
  const res = await API.get("/auctions/my/closed-as-owner");
  return res.data;
};