import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/* export const API = axios.create({
  baseURL: "http://localhost:8080/api",
}); */

export const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});


API.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide — vide et redirige
            localStorage.removeItem("token");
            if (typeof window !== "undefined" &&
                !window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);