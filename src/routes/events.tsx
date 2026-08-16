import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";

import {
  VSButton,
  VSDrawer,
  VSDrawerContent,
  VSDrawerFooter,
  VSDrawerHeader,
  VSDrawerTitle,
  VSEmptyState,
  VSEventCard,
  VSErrorState,
  VSFilterControls,
  VSLoadingState,
  VSSearchInput,
} from "@/components/design-system";

import { eventService } from "@/services/eventService";
import type { Event } from "@/lib/types";

export const Route = createFileRoute("/events")({
  component: Events,
  head: () => ({
    meta: [
      {
        title: "Events | VolunSport Morocco",
      },
      {
        name: "description",
        content:
          "Discover upcoming sporting events and volunteer opportunities across Morocco.",
      },
    ],
  }),
});

type DateFilter = "all" | "next-30" | "this-month";

type AvailabilityFilter =
  | "all"
  | "available"
  | "limited";

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("all");

  const [availability, setAvailability] =
    useState<AvailabilityFilter>("all");

  const [sort, setSort] =
    useState("upcoming");

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  useEffect(() => {
    eventService
      .getEvents()
      .then(setEvents)
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load events.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * ============================================================
   * FILTER OPTIONS
   * ============================================================
   */

  const sportOptions = useMemo(
    () =>
      [...new Set(events.map((event) => event.sport))]
        .sort(),
    [events],
  );

  const cityOptions = useMemo(
    () =>
      [...new Set(events.map((event) => event.city))]
        .sort(),
    [events],
  );

  /*
   * ============================================================
   * FILTER + SORT
   * ============================================================
   */

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const nextThirtyDays = new Date(now);

    nextThirtyDays.setDate(
      now.getDate() + 30,
    );

    const month = now.getMonth();
    const year = now.getFullYear();

    const result = events.filter((event) => {
      const query =
        search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        [
          event.title,
          event.sport,
          event.city,
          event.venue,
        ].some((value) =>
          value
            .toLowerCase()
            .includes(query),
        );

      const matchesSport =
        !sport ||
        event.sport === sport;

      const matchesCity =
        !city ||
        event.city === city;

      const eventDate =
        new Date(event.start_date);

      const matchesDate =
        dateFilter === "all" ||
        (
          dateFilter === "next-30" &&
          eventDate >= now &&
          eventDate <= nextThirtyDays
        ) ||
        (
          dateFilter === "this-month" &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );

      const filled =
        event.event_roles?.reduce(
          (sum, role) =>
            sum + role.filled_positions,
          0,
        ) ?? 0;

      const remaining =
        event.total_volunteers_needed -
        filled;

      const matchesAvailability =
        availability === "all" ||
        (
          availability === "available" &&
          remaining > 0
        ) ||
        (
          availability === "limited" &&
          remaining > 0 &&
          remaining <= 10
        );

      return (
        matchesSearch &&
        matchesSport &&
        matchesCity &&
        matchesDate &&
        matchesAvailability
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "newest") {
        return b.start_date.localeCompare(
          a.start_date,
        );
      }

      if (sort === "most-available") {
        const aRemaining =
          a.total_volunteers_needed -
          (
            a.event_roles?.reduce(
              (sum, role) =>
                sum + role.filled_positions,
              0,
            ) ?? 0
          );

        const bRemaining =
          b.total_volunteers_needed -
          (
            b.event_roles?.reduce(
              (sum, role) =>
                sum + role.filled_positions,
              0,
            ) ?? 0
          );

        return bRemaining - aRemaining;
      }

      return a.start_date.localeCompare(
        b.start_date,
      );
    });
  }, [
    availability,
    city,
    dateFilter,
    events,
    search,
    sort,
    sport,
  ]);

  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  const resetFilters = () => {
    setSearch("");
    setSport("");
    setCity("");
    setDateFilter("all");
    setAvailability("all");
    setSort("upcoming");
  };

  /*
   * ============================================================
   * FILTER FORM
   * ============================================================
   */

  const filterForm = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="space-y-2 text-sm font-medium text-foreground">
        Sport

        <select
          value={sport}
          onChange={(event) =>
            setSport(event.target.value)
          }
          className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="">
            All sports
          </option>

          {sportOptions.map((item) => (
            <option key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-foreground">
        City

        <select
          value={city}
          onChange={(event) =>
            setCity(event.target.value)
          }
          className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="">
            All cities
          </option>

          {cityOptions.map((item) => (
            <option key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-foreground">
        Date

        <select
          value={dateFilter}
          onChange={(event) =>
            setDateFilter(
              event.target.value as DateFilter,
            )
          }
          className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">
            Any date
          </option>

          <option value="next-30">
            Next 30 days
          </option>

          <option value="this-month">
            This month
          </option>
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-foreground">
        Availability

        <select
          value={availability}
          onChange={(event) =>
            setAvailability(
              event.target
                .value as AvailabilityFilter,
            )
          }
          className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="all">
            Any availability
          </option>

          <option value="available">
            Open positions
          </option>

          <option value="limited">
            Limited spots
          </option>
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-foreground">
        Sort by

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
          className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
        >
          <option value="upcoming">
            Upcoming
          </option>

          <option value="newest">
            Latest dates
          </option>

          <option value="most-available">
            Most available
          </option>
        </select>
      </label>
    </div>
  );

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <AppShell title="Events">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow">
              Find your next opportunity
            </p>

            <h1 className="display-md mt-3">
              Events worth showing up for.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Explore upcoming sporting events
              across Morocco and find a volunteer
              role that matches your skills,
              energy, and availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {filteredEvents.length}{" "}
              opportunities
            </span>

            <VSButton
              variant="outline"
              className="lg:hidden"
              onClick={() =>
                setFiltersOpen(true)
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </VSButton>
          </div>
        </header>

        {/* ======================================================
            SEARCH + FILTERS
        ====================================================== */}

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-float)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-xl">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Search opportunities
              </label>

              <VSSearchInput
                value={search}
                onChange={setSearch}
              />
            </div>

            <VSFilterControls className="hidden lg:flex">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="mr-1 inline h-3.5 w-3.5" />
                Reset
              </button>
            </VSFilterControls>
          </div>

          <div className="mt-6 hidden lg:block">
            {filterForm}
          </div>
        </section>

        {/* ======================================================
            MOBILE FILTER DRAWER
        ====================================================== */}

        <VSDrawer
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
        >
          <VSDrawerContent>
            <VSDrawerHeader>
              <VSDrawerTitle>
                Filter opportunities
              </VSDrawerTitle>
            </VSDrawerHeader>

            <div className="px-5 pb-4">
              {filterForm}
            </div>

            <VSDrawerFooter>
              <VSButton
                variant="outline"
                onClick={resetFilters}
              >
                Reset filters
              </VSButton>

              <VSButton
                onClick={() =>
                  setFiltersOpen(false)
                }
              >
                <Filter className="h-4 w-4" />
                Show {filteredEvents.length} events
              </VSButton>
            </VSDrawerFooter>
          </VSDrawerContent>
        </VSDrawer>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        {loading ? (
          <VSLoadingState message="Finding upcoming events across Morocco…" />
        ) : error ? (
          <VSErrorState
            title="Events are unavailable"
            description={error}
            action={
              <VSButton
                variant="outline"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try again
              </VSButton>
            }
          />
        ) : filteredEvents.length === 0 ? (
          <VSEmptyState
            title="No opportunities match yet"
            description="Try another city, sport, date, or availability filter to discover more volunteer moments."
            action={
              <VSButton
                variant="outline"
                onClick={resetFilters}
              >
                Clear all filters
              </VSButton>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const filled =
                event.event_roles?.reduce(
                  (sum, role) =>
                    sum +
                    role.filled_positions,
                  0,
                ) ?? 0;

              return (
                <VSEventCard
                  key={event.id}
                  title={event.title}
                  sport={event.sport}
                  date={event.start_date}
                  location={`${event.city} · ${event.venue}`}
                  cover={
                    event.cover_url ??
                    undefined
                  }
                  filled={filled}
                  capacity={
                    event.total_volunteers_needed
                  }
                  href={`/events/${event.slug}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}