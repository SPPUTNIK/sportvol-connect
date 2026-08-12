import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventCard } from "@/components/ui/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { getAllEvents } from "@/services/mockService";
import type { Event } from "@/lib/types";

export const Route = createFileRoute("/events")({
  component: Events,
  head: () => ({
    meta: [{ title: "Events | VolunSport Morocco" }],
  }),
});

function Events() {
  const { t } = useI18n();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("upcoming");

  useEffect(() => {
    getAllEvents()
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const result = events.filter((event) => {
      const matchesSearch = [event.title, event.sport, event.city, event.venue]
        .some((value) => value.toLowerCase().includes(search.toLowerCase()));
      const matchesSport = sport ? event.sport === sport : true;
      const matchesCity = city ? event.city === city : true;
      return matchesSearch && matchesSport && matchesCity;
    });

    setFilteredEvents(
      [...result].sort((a, b) => {
        if (sort === "newest") {
          return b.start_date.localeCompare(a.start_date);
        }
        if (sort === "most-available") {
          const aFree = (a.total_volunteers_needed - (a.event_roles?.reduce((sum, role) => sum + role.filled_positions, 0) ?? 0));
          const bFree = (b.total_volunteers_needed - (b.event_roles?.reduce((sum, role) => sum + role.filled_positions, 0) ?? 0));
          return bFree - aFree;
        }
        return a.start_date.localeCompare(b.start_date);
      }),
    );
  }, [events, search, sport, city, sort]);

  const sportOptions = useMemo(() => [...new Set(events.map((event) => event.sport))], [events]);
  const cityOptions = useMemo(() => [...new Set(events.map((event) => event.city))], [events]);

  if (loading) return <LoadingState message="Loading events…" />;
  if (error) return <EmptyState title="Error loading events" description={error} />;

  return (
    <I18nProvider>
      <div className="shell min-h-screen py-24">
        <div className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-hairline-invert bg-card p-8 shadow-[var(--shadow-lift)]">
          <div>
            <p className="eyebrow">Browse events</p>
            <h1 className="display-md mt-3 text-ink-foreground">All upcoming volunteer opportunities</h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Search by event name, sport, city or venue, then filter to find the role that fits your availability.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2 text-sm text-foreground">
                Search
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Search events, city or venue"
                />
              </label>
              <label className="space-y-2 text-sm text-foreground">
                Sport
                <select
                  value={sport}
                  onChange={(event) => setSport(event.target.value)}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">All sports</option>
                  {sportOptions.map((sportOption) => (
                    <option key={sportOption} value={sportOption}>
                      {sportOption}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-foreground">
                City
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">All cities</option>
                  {cityOptions.map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-foreground">
                Sort by
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="newest">Newest</option>
                  <option value="most-available">Most available positions</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState title="No events found" description="Try another city, sport, or remove your search filter." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
