import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";

const useAuthStore = create(persist((set) => ({
  user:  null,
  token: null,
  login: async (email, password) => {
    const res = await api.post("/login", { email, password });
    // Store token in a single place — Zustand persist handles localStorage
    set({ user: res.data.user, token: res.data.token });
    return res.data;
  },
  register: async (data) => {
    const res = await api.post("/register", data);
    set({ user: res.data.user, token: res.data.token });
    return res.data;
  },
  logout: async () => {
    try { await api.post("/logout"); } catch {}
    set({ user: null, token: null });
  },
  setUser:  (user)  => set({ user }),
  setToken: (token) => set({ token }),
}), { name: "ekta_auth" }));

export default useAuthStore;
