// import { getAllEvents, getEventBySlug } from "@/services/mockService";
// import type { Sport } from "@/types";
// import type { EventFilters, EventService } from "@/services/contracts";

// const sports: Sport[] = [
//   { id: "running", name: "Running", slug: "running", eventCount: 8 },
//   { id: "football", name: "Football", slug: "football", eventCount: 5 },
//   { id: "beach", name: "Beach sports", slug: "beach-sports", eventCount: 4 },
//   { id: "trail", name: "Trail running", slug: "trail-running", eventCount: 3 },
// ];

// export const eventService: EventService = {
//   async getEvents(filters: EventFilters = {}) {
//     const events = await getAllEvents();
//     return events.filter((event) => {
//       const query = filters.search?.trim().toLowerCase();
//       return (
//         (!query || `${event.title} ${event.city} ${event.sport}`.toLowerCase().includes(query)) &&
//         (!filters.sport || event.sport === filters.sport) &&
//         (!filters.city || event.city === filters.city) &&
//         (filters.featured === undefined || event.featured === filters.featured)
//       );
//     });
//   },
//   getEventBySlug,
//   async getSports() {
//     return sports;
//   },
// };
import { demoEvents } from "@/mocks/frontendDemo";
import type { Event } from "@/lib/types";

const USE_MOCK_DATA = true;

export const eventService = {
  async getEvents(): Promise<Event[]> {
    if (!USE_MOCK_DATA) {
      throw new Error("Supabase event service is not connected yet.");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    return demoEvents as unknown as Event[];
  },

  async getEventBySlug(slug: string): Promise<Event | null> {
    if (!USE_MOCK_DATA) {
      throw new Error("Supabase event service is not connected yet.");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const event = demoEvents.find(
      (item) => item.slug === slug,
    );

    return (event as unknown as Event) ?? null;
  },
};