import { getAllEvents, getEventBySlug } from "@/services/mockService";
import type { Sport } from "@/types";
import type { EventFilters, EventService } from "@/services/contracts";

const sports: Sport[] = [
  { id: "running", name: "Running", slug: "running", eventCount: 8 },
  { id: "football", name: "Football", slug: "football", eventCount: 5 },
  { id: "beach", name: "Beach sports", slug: "beach-sports", eventCount: 4 },
  { id: "trail", name: "Trail running", slug: "trail-running", eventCount: 3 },
];

export const eventService: EventService = {
  async getEvents(filters: EventFilters = {}) {
    const events = await getAllEvents();
    return events.filter((event) => {
      const query = filters.search?.trim().toLowerCase();
      return (
        (!query || `${event.title} ${event.city} ${event.sport}`.toLowerCase().includes(query)) &&
        (!filters.sport || event.sport === filters.sport) &&
        (!filters.city || event.city === filters.city) &&
        (filters.featured === undefined || event.featured === filters.featured)
      );
    });
  },
  getEventBySlug,
  async getSports() {
    return sports;
  },
};
