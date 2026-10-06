import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Database,
  Globe2,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import {
  VSBadge,
  VSButton,
  VSCard,
  VSCardContent,
  VSEmptyState,
  VSErrorState,
  VSInput,
  VSLoadingState,
  VSModal,
  VSModalContent,
  VSModalFooter,
  VSModalHeader,
  VSModalTitle,
  VSPageHeader,
  VSTextarea,
} from "@/components/design-system";
import { supabase } from "@/lib/supabase";

type CatalogKey = "sports" | "skills" | "languages" | "achievements";

type SportRow = { id: string; name: string; created_at?: string | null };
type SkillRow = { id: string; name: string; created_at?: string | null };
type LanguageRow = { id: string; name: string; created_at?: string | null };
type AchievementRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  active: boolean;
  created_at?: string | null;
};

type FormState = {
  name: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: string;
  points: string;
  active: boolean;
};

const defaultForm: FormState = {
  name: "",
  code: "",
  title: "",
  description: "",
  icon: "",
  category: "general",
  requirement_type: "count",
  requirement_value: "1",
  points: "0",
  active: true,
};

const catalogTabs = [
  { value: "sports", label: "Sports", icon: Trophy },
  { value: "skills", label: "Skills", icon: Sparkles },
  { value: "languages", label: "Languages", icon: Globe2 },
  { value: "achievements", label: "Achievements", icon: BadgeCheck },
] as const;

export function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogKey>("sports");
  const [sports, setSports] = useState<SportRow[]>([]);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);

    try {
      const [sportsRes, skillsRes, languagesRes, achievementsRes] = await Promise.all([
        supabase.from("sports").select("*").order("name", { ascending: true }),
        supabase.from("skills").select("*").order("name", { ascending: true }),
        supabase.from("languages").select("*").order("name", { ascending: true }),
        supabase
          .from("achievement_definitions")
          .select("*")
          .order("title", { ascending: true }),
      ]);

      if (sportsRes.error) throw sportsRes.error;
      if (skillsRes.error) throw skillsRes.error;
      if (languagesRes.error) throw languagesRes.error;
      if (achievementsRes.error) throw achievementsRes.error;

      setSports((sportsRes.data ?? []) as SportRow[]);
      setSkills((skillsRes.data ?? []) as SkillRow[]);
      setLanguages((languagesRes.data ?? []) as LanguageRow[]);
      setAchievements((achievementsRes.data ?? []) as AchievementRow[]);
    } catch (err) {
      console.error("Failed to load catalog data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load catalog data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  const sectionSummary = useMemo(
    () => ({
      sports: sports.length,
      skills: skills.length,
      languages: languages.length,
      achievements: achievements.length,
    }),
    [achievements.length, languages.length, skills.length, sports.length],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (item: SportRow | SkillRow | LanguageRow | AchievementRow) => {
    setEditingId(item.id);

    if (activeTab === "achievements") {
      const achievement = item as AchievementRow;
      setForm({
        name: "",
        code: achievement.code ?? "",
        title: achievement.title ?? "",
        description: achievement.description ?? "",
        icon: achievement.icon ?? "",
        category: achievement.category ?? "general",
        requirement_type: achievement.requirement_type ?? "count",
        requirement_value: String(achievement.requirement_value ?? 1),
        points: String(achievement.points ?? 0),
        active: achievement.active ?? true,
      });
    } else {
      setForm({
        ...defaultForm,
        name: (item as { name: string }).name ?? "",
      });
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleDelete = async (table: CatalogKey, id: string) => {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;

    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadCatalog();
  };

  const handleSave = async () => {
    if (activeTab === "achievements") {
      const title = form.title.trim();
      const code = form.code.trim();

      if (!title || !code) {
        setError("Title and code are required.");
        return;
      }

      const payload = {
        code,
        title,
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        category: form.category.trim() || "general",
        requirement_type: form.requirement_type.trim() || "count",
        requirement_value: Number(form.requirement_value || 1),
        points: Number(form.points || 0),
        active: form.active,
      };

      setSubmitting(true);

      try {
        if (editingId) {
          const { error } = await supabase
            .from("achievement_definitions")
            .update(payload)
            .eq("id", editingId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("achievement_definitions")
            .insert(payload);

          if (error) throw error;
        }

        closeModal();
        await loadCatalog();
      } catch (err) {
        console.error("Failed to save achievement:", err);
        setError(err instanceof Error ? err.message : "Failed to save achievement.");
      } finally {
        setSubmitting(false);
      }

      return;
    }

    const name = form.name.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    const payload = { name };
    setSubmitting(true);

    try {
      if (editingId) {
        const { error } = await supabase.from(activeTab).update(payload).eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from(activeTab).insert(payload);

        if (error) throw error;
      }

      closeModal();
      await loadCatalog();
    } catch (err) {
      console.error(`Failed to save ${activeTab}:`, err);
      setError(err instanceof Error ? err.message : `Failed to save ${activeTab}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const visibleRows = (() => {
    switch (activeTab) {
      case "sports":
        return sports;
      case "skills":
        return skills;
      case "languages":
        return languages;
      case "achievements":
        return achievements;
      default:
        return [];
    }
  })();

  return (
    <AdminLayout title="Catalog" eyebrow="Reference data">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Reference data"
          title="Master catalog"
          description="Manage the lookup tables that power volunteer profiles, events, and achievements."
          action={
            <VSButton onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add {catalogTabs.find((tab) => tab.value === activeTab)?.label ?? "item"}
            </VSButton>
          }
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {catalogTabs.map(({ value, label, icon: Icon }) => (
            <VSCard
              key={value}
              className={`rounded-[1.4rem] border transition ${
                activeTab === value ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <VSCardContent className="p-4">
                <button
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </span>
                      <span className="mt-1 block text-xl font-semibold text-foreground">
                        {sectionSummary[value]}
                      </span>
                    </span>
                  </span>
                </button>
              </VSCardContent>
            </VSCard>
          ))}
        </div>

        <div className="mt-8">
          {loading ? (
            <VSLoadingState />
          ) : error ? (
            <VSErrorState description={error} />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {(() => {
                      const current = catalogTabs.find((tab) => tab.value === activeTab);
                      const Icon = current?.icon ?? Database;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Active table
                    </p>
                    <h2 className="text-lg font-semibold">
                      {catalogTabs.find((tab) => tab.value === activeTab)?.label}
                    </h2>
                  </div>
                </div>
              </div>

              {visibleRows.length === 0 ? (
                <VSEmptyState
                  title={`No ${catalogTabs.find((tab) => tab.value === activeTab)?.label.toLowerCase() ?? "items"} yet`}
                  description="Add the first item to make it available in the platform."
                  action={
                    <VSButton onClick={openCreate}>
                      <Plus className="h-4 w-4" />
                      Add item
                    </VSButton>
                  }
                />
              ) : (
                <div className="grid gap-4">
                  {visibleRows.map((item) => {
                    if (activeTab === "achievements") {
                      const achievement = item as AchievementRow;
                      return (
                        <VSCard key={achievement.id} className="rounded-[1.5rem] border-border">
                          <VSCardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {achievement.icon ? (
                                  <span className="text-lg">{achievement.icon}</span>
                                ) : (
                                  <Trophy className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-semibold">{achievement.title}</h3>
                                  <VSBadge variant={achievement.active ? "soft" : "outline"}>
                                    {achievement.active ? "Active" : "Inactive"}
                                  </VSBadge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {achievement.code} · {achievement.category} · {achievement.points} pts
                                </p>
                                {achievement.description && (
                                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                    {achievement.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <VSButton variant="outline" size="sm" onClick={() => openEdit(achievement)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </VSButton>
                              <VSButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete("achievements", achievement.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </VSButton>
                            </div>
                          </VSCardContent>
                        </VSCard>
                      );
                    }

                    const itemName = (item as { name: string }).name;
                    return (
                      <VSCard key={(item as { id: string }).id} className="rounded-[1.5rem] border-border">
                        <VSCardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              {activeTab === "sports" ? (
                                <Trophy className="h-5 w-5" />
                              ) : activeTab === "skills" ? (
                                <Sparkles className="h-5 w-5" />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold">{itemName}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {((item as { created_at?: string | null }).created_at ?? "")
                                  ? new Date((item as { created_at?: string | null }).created_at ?? new Date()).toLocaleDateString()
                                  : "No date recorded"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <VSButton variant="outline" size="sm" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </VSButton>
                            <VSButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(activeTab, (item as { id: string }).id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </VSButton>
                          </div>
                        </VSCardContent>
                      </VSCard>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <VSModal open={modalOpen} onOpenChange={closeModal}>
        <VSModalContent className="max-w-xl">
          <VSModalHeader>
            <VSModalTitle>
              {editingId ? `Edit ${catalogTabs.find((tab) => tab.value === activeTab)?.label}` : `Create ${catalogTabs.find((tab) => tab.value === activeTab)?.label}`}
            </VSModalTitle>
          </VSModalHeader>

          <div className="space-y-4 px-6 py-4">
            {activeTab === "achievements" ? (
              <>
                <label className="block text-sm font-medium">
                  Code
                  <VSInput
                    className="mt-2"
                    value={form.code}
                    onChange={(event) => setForm({ ...form, code: event.target.value })}
                    placeholder="FIRST_EVENT"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Title
                  <VSInput
                    className="mt-2"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    placeholder="First event volunteer"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Description
                  <VSTextarea
                    className="mt-2"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="What this achievement represents"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Icon
                    <VSInput
                      className="mt-2"
                      value={form.icon}
                      onChange={(event) => setForm({ ...form, icon: event.target.value })}
                      placeholder="🏆"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Category
                    <VSInput
                      className="mt-2"
                      value={form.category}
                      onChange={(event) => setForm({ ...form, category: event.target.value })}
                      placeholder="general"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Requirement type
                    <VSInput
                      className="mt-2"
                      value={form.requirement_type}
                      onChange={(event) =>
                        setForm({ ...form, requirement_type: event.target.value })
                      }
                      placeholder="count"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Requirement value
                    <VSInput
                      className="mt-2"
                      type="number"
                      min="1"
                      value={form.requirement_value}
                      onChange={(event) =>
                        setForm({ ...form, requirement_value: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Points
                    <VSInput
                      className="mt-2"
                      type="number"
                      min="0"
                      value={form.points}
                      onChange={(event) => setForm({ ...form, points: event.target.value })}
                    />
                  </label>

                  <label className="flex items-center gap-3 pt-8 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) => setForm({ ...form, active: event.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                    Active
                  </label>
                </div>
              </>
            ) : (
              <label className="block text-sm font-medium">
                Name
                <VSInput
                  className="mt-2"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder={`${catalogTabs.find((tab) => tab.value === activeTab)?.label ?? "Item"} name`}
                />
              </label>
            )}

            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <VSModalFooter>
            <VSButton variant="outline" onClick={closeModal} disabled={submitting}>
              Cancel
            </VSButton>
            <VSButton onClick={handleSave} disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Save changes"
              ) : (
                "Create item"
              )}
            </VSButton>
          </VSModalFooter>
        </VSModalContent>
      </VSModal>
    </AdminLayout>
  );
}
