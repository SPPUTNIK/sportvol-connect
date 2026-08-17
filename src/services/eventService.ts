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

  async getEventBySlug(
    slug: string,
  ): Promise<Event | null> {
    if (!USE_MOCK_DATA) {
      throw new Error("Supabase event service is not connected yet.");
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const event = demoEvents.find(
      (item) => item.slug === slug,
    );

    return (event as unknown as Event) ?? null;
  },

  async getEventById(
    id: string,
  ): Promise<Event | null> {
    if (!USE_MOCK_DATA) {
      throw new Error(
        "Supabase event service is not connected yet.",
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const event = demoEvents.find(
      (item) => item.id === id,
    );

    return (event as unknown as Event) ?? null;
  },
};