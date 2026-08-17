import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import {
  LoaderCircle,
  MapPin,
  Search,
  Users,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Inbox,
  Bell,
  Clock3,
} from "lucide-react";
import type { ReactNode } from "react";

export {
  Button as VSButton,
  Input as VSInput,
  Select as VSSelect,
  Textarea as VSTextarea,
  Card as VSCard,
  CardHeader as VSCardHeader,
  CardContent as VSCardContent,
  CardFooter as VSCardFooter,
  CardTitle as VSCardTitle,
  CardDescription as VSCardDescription,
  Badge as VSPrimitiveBadge,
  Avatar as VSPrimitiveAvatar,
  AvatarImage as VSAvatarImage,
  AvatarFallback as VSAvatarFallback,
  Dialog as VSModal,
  DialogContent as VSModalContent,
  DialogDescription as VSModalDescription,
  DialogFooter as VSModalFooter,
  DialogHeader as VSModalHeader,
  DialogTitle as VSModalTitle,
  DialogTrigger as VSModalTrigger,
  Drawer as VSDrawer,
  DrawerContent as VSDrawerContent,
  DrawerDescription as VSDrawerDescription,
  DrawerFooter as VSDrawerFooter,
  DrawerHeader as VSDrawerHeader,
  DrawerTitle as VSDrawerTitle,
  DrawerTrigger as VSDrawerTrigger,
  DropdownMenu as VSDropdown,
  DropdownMenuContent as VSDropdownContent,
  DropdownMenuItem as VSDropdownItem,
  DropdownMenuLabel as VSDropdownLabel,
  DropdownMenuSeparator as VSDropdownSeparator,
  DropdownMenuTrigger as VSDropdownTrigger,
  Tabs as VSPrimitiveTabs,
  TabsContent as VSTabsContent,
  TabsList as VSTabsList,
  TabsTrigger as VSTabsTrigger,
  Progress as VSProgress,
};

export function VSStatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const normalized = String(status ?? "unknown").toLowerCase().replace(/\s+/g, "-");
  const tone =
    {
      accepted: "border-emerald-200 bg-emerald-50 text-emerald-800",
      approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
      completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
      pending: "border-amber-200 bg-amber-50 text-amber-800",
      waitlisted: "border-violet-200 bg-violet-50 text-violet-800",
      rejected: "border-destructive/20 bg-destructive/10 text-destructive",
      withdrawn: "border-border bg-muted text-muted-foreground",
      draft: "border-border bg-muted text-muted-foreground",
      published: "border-primary/20 bg-primary/10 text-primary",
    }[normalized] ?? "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status.replace(/-/g, " ")}
    </span>
  );
}

export function VSSearchInput({
  value,
  onChange,
  placeholder = "Search events, cities or roles…",
  className,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-border bg-card pl-11 pr-4 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-label={placeholder}
      />
    </label>
  );
}

export function VSFilterControls({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function VSEmptyState({
  icon = <Inbox className="h-5 w-5" />,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function VSLoadingState({
  message = "Loading your VOLUNSPORT experience…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-44 flex-col items-center justify-center rounded-[1.75rem] border border-border bg-card p-8 text-center",
        className,
      )}
    >
      <LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <p className="mt-4 text-sm text-muted-foreground" role="status">
        {message}
      </p>
    </div>
  );
}

export function VSErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-destructive/20 bg-destructive/5 p-8",
        className,
      )}
    >
      <CircleAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function VSSuccessState({
  title = "All set",
  description,
  action,
  className,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-8", className)}>
      <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function VSPageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex flex-col justify-between gap-5 md:flex-row md:items-end", className)}
    >
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function VSSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function VSStatCard({
  label,
  value,
  description,
  icon,
  accent = false,
  className,
}: {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group rounded-[1.75rem] border-border bg-card shadow-[var(--shadow-float)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl",
              accent ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary",
            )}
          >
            {icon}
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20 transition group-hover:bg-primary" />
        </div>
        <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function VSAvatar({
  name,
  src,
  size = "default",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-[0.65rem]",
    default: "h-10 w-10 text-xs",
    lg: "h-16 w-16 text-base",
  };
  return (
    <Avatar className={cn(sizes[size], "ring-2 ring-background", className)}>
      <AvatarImage src={src ?? undefined} alt={name} />
      <AvatarFallback className="bg-ink text-ink-foreground">
        {name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function VSEventCard({
  title,
  sport,
  date,
  location,
  cover,
  filled,
  capacity,
  href = "#",
  className,
}: {
  title: string;
  sport: string;
  date: string;
  location: string;
  cover?: string;
  filled?: number;
  capacity?: number;
  href?: string;
  className?: string;
}) {
  const progress = capacity ? Math.min(100, Math.round(((filled ?? 0) / capacity) * 100)) : 0;
  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-[1.75rem] border-border bg-card shadow-[var(--shadow-float)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-[url('/moroccan-pattern.png')] bg-cover opacity-10" />
        {cover && (
          <img
            src={cover}
            alt=""
            className="relative h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <VSBadge variant="dark" className="absolute left-4 top-4">
          {sport}
        </VSBadge>
        <span className="absolute bottom-4 right-4 rounded-xl bg-card px-3 py-2 text-center text-xs font-semibold text-foreground">
          <CalendarDays className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
          {date}
        </span>
      </div>
      <CardContent className="p-5">
        <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          {location}
        </p>
        {typeof capacity === "number" && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filled ?? 0} registered</span>
              <span>{capacity} needed</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <a
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          View opportunity <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </a>
      </CardContent>
    </Card>
  );
}

export function VSRoleCard({
  name,
  description,
  available,
  capacity,
  requirements,
  action,
  className,
}: {
  name: string;
  description?: string;
  available?: number;
  capacity?: number;
  requirements?: string[];
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-[1.5rem] border-border bg-card shadow-none", className)}>
      <CardHeader className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            {description && (
              <CardDescription className="mt-2 leading-6">{description}</CardDescription>
            )}
          </div>
          {typeof available === "number" && (
            <VSStatusBadge status={available > 0 ? `${available} spots left` : "Full"} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-0">
        {requirements && requirements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {requirements.map((item) => (
              <VSBadge key={item} variant="soft">
                {item}
              </VSBadge>
            ))}
          </div>
        )}
        {typeof capacity === "number" && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {available ?? 0} of {capacity} positions available
          </p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}

export function VSNotificationItem({
  title,
  description,
  timestamp,
  unread = false,
  icon = <Bell className="h-4 w-4" />,
  href = "#",
  className,
}: {
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
  icon?: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "flex gap-3 rounded-2xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/50",
        unread && "border-primary/20 bg-primary/5",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {unread && (
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-label="Unread"
            />
          )}
        </span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
        <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 className="h-3 w-3" />
          {timestamp}
        </span>
      </span>
    </a>
  );
}

export function VSBadge({
  children,
  variant = "soft",
  className,
}: {
  children: ReactNode;
  variant?: "soft" | "dark" | "outline" | "accent";
  className?: string;
}) {
  const variants = {
    soft: "border-primary/15 bg-primary/10 text-primary",
    dark: "border-white/15 bg-ink/75 text-white backdrop-blur-sm",
    outline: "border-border bg-transparent text-muted-foreground",
    accent: "border-accent/20 bg-accent/10 text-accent",
  };
  return (
    <Badge
      className={cn(
        "rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </Badge>
  );
}

export function VSBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`} className="contents">
            {index > 0 && <BreadcrumbSeparator />}
            {item.href ? (
              <BreadcrumbItem>
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function VSTabs({
  tabs,
  defaultValue,
  children,
}: {
  tabs: { value: string; label: string }[];
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value} className="w-full">
      <TabsList className="h-auto rounded-2xl border border-border bg-card p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-ink data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
