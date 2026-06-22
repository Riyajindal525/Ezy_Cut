import { create } from "zustand";
import { getAllSalons } from "../api/salon.api";

const CACHE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes cache limit

const useSalonStore = create((set, get) => ({
  salons: [],
  lastFetched: null,
  loading: false,
  activeSalonId: localStorage.getItem("activeSalonId") || null,

  setActiveSalonId: (id) => {
    if (id) {
      localStorage.setItem("activeSalonId", id);
    } else {
      localStorage.removeItem("activeSalonId");
    }
    set({ activeSalonId: id });
  },

  fetchSalons: async (force = false) => {
    const { salons, lastFetched } = get();
    const now = Date.now();

    // Check if cache is valid and not forced
    if (!force && salons.length > 0 && lastFetched && (now - lastFetched < CACHE_LIMIT_MS)) {
      return salons;
    }

    set({ loading: true });
    try {
      const data = await getAllSalons();
      const fetchedSalons = data.salons || [];
      set({
        salons: fetchedSalons,
        lastFetched: now,
      });
      return fetchedSalons;
    } catch (err) {
      console.error("Failed to fetch salons in store:", err);
      // Return local cache as fallback if query fails
      return salons;
    } finally {
      set({ loading: false });
    }
  },

  removeSalon: (salonId) => {
    const { salons, activeSalonId } = get();
    const newSalons = salons.filter((s) => s._id !== salonId);
    set({
      salons: newSalons,
    });
    if (activeSalonId === salonId) {
      const newActive = newSalons[0]?._id || null;
      get().setActiveSalonId(newActive);
    }
  },

  updateSalonInCache: (updatedSalon) => {
    const { salons } = get();
    set({
      salons: salons.map((s) => (s._id === updatedSalon._id ? updatedSalon : s)),
    });
  },

  clearCache: () => {
    set({
      salons: [],
      lastFetched: null,
      activeSalonId: null,
    });
    localStorage.removeItem("activeSalonId");
  },
}));

export default useSalonStore;
