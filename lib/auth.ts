export const saveToken = (token: string) => {
    // ← Supprime d'abord l'ancien
    localStorage.removeItem("token");
    // ← Puis sauvegarde le nouveau
    localStorage.setItem("token", token);
};

export const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
};

export const logout = () => {
    localStorage.removeItem("token");
};