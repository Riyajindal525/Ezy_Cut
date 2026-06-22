import { create } from "zustand";
import { getMyBookings, getAvailableSlots } from "../api/booking.api";

const CACHE_LIMIT_MS = 3 * 60 * 1000; // 3 minutes cache limit for slot lists and bookings

const useBookingStore = create((set, get) => ({
  myBookings: [],
  myBookingsLastFetched: null,
  slotsCache: {}, // Key: `${salonId}_${serviceId}_${date}`, Value: { slots: [], lastFetched: timestamp }
  loading: false,

  fetchMyBookings: async (force = false) => {
    const { myBookings, myBookingsLastFetched } = get();
    const now = Date.now();

    if (!force && myBookings.length > 0 && myBookingsLastFetched && (now - myBookingsLastFetched < CACHE_LIMIT_MS)) {
      return myBookings;
    }

    set({ loading: true });
    try {
      const data = await getMyBookings();
      const fetchedBookings = data.bookings || [];
      set({
        myBookings: fetchedBookings,
        myBookingsLastFetched: now,
      });
      return fetchedBookings;
    } catch (err) {
      console.error("Failed to fetch customer bookings in store:", err);
      return myBookings;
    } finally {
      set({ loading: false });
    }
  },

  fetchSlots: async (salonId, serviceId, date, force = false) => {
    const { slotsCache } = get();
    const key = `${salonId}_${serviceId}_${date}`;
    const now = Date.now();

    if (!force && slotsCache[key] && (now - slotsCache[key].lastFetched < CACHE_LIMIT_MS)) {
      return slotsCache[key].slots;
    }

    try {
      const data = await getAvailableSlots(salonId, serviceId, date);
      const fetchedSlots = data.slots || [];
      
      set((state) => ({
        slotsCache: {
          ...state.slotsCache,
          [key]: {
            slots: fetchedSlots,
            lastFetched: now,
          },
        },
      }));
      return fetchedSlots;
    } catch (err) {
      console.error("Failed to fetch slots in store:", err);
      return slotsCache[key]?.slots || [];
    }
  },

  cancelBookingInCache: (bookingId) => {
    const { myBookings } = get();
    set({
      myBookings: myBookings.map((b) =>
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      ),
    });
  },

  clearBookingCache: () => {
    set({
      myBookings: [],
      myBookingsLastFetched: null,
      slotsCache: {},
    });
  },
}));

export default useBookingStore;
