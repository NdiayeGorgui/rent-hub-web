import { API } from "./api";

export const loginUser = async (data: any) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: any) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

export const getCurrentUser = async () => {
  try {
    const res = await API.get("/profile/me");
    return res.data;
  } catch (error: any) {
    console.log("getCurrentUser error:", error?.response?.data || error.message);
    return null;
  }
};

export const forgotPassword = async (email: string) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await API.post("/auth/reset-password", { token, newPassword });
  return response.data;
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const response = await API.get(`/profile/${userId}`);
    return response.data; // { userId, username, fullName, ... }
  } catch (error: any) {
    console.log("getUser error:", error.response?.data || error.message);
    return null;
  }
};
