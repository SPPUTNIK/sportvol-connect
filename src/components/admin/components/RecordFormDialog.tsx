import { useEffect, useState, type ReactNode } from "react";

import {
  VSButton,
  VSInput,
  VSModal,
  VSModalContent,
  VSModalDescription,
  VSModalFooter,
  VSModalHeader,
  VSModalTitle,
  VSTextarea,
} from "@/components/design-system";

export type FieldType = "text" | "textarea" | "number" | "date" | "time" | "select";

export type FormField = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  half?: boolean;
};

export type FormValues = Record<string, string>;

type RecordFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  fields: FormField[];
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  footerExtra?: ReactNode;
};

export function RecordFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = "Save",
  fields,
  initialValues,
  onSubmit,
  footerExtra,
}: RecordFormDialogProps) {
  const [values, setValues] = useState<FormValues>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const next: FormValues = {};
    fields.forEach((field) => {
      next[field.name] = initialValues?.[field.name] ?? "";
    });

    setValues(next);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (name: string, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setError(null);
  };

  const handleSubmit = () => {
    const missing = fields.find(
      (field) => field.required && !(values[field.name] ?? "").trim(),
    );

    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }

    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <VSModal open={open} onOpenChange={onOpenChange}>
      <VSModalContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <VSModalHeader>
          <VSModalTitle>{title}</VSModalTitle>
          {description ? <VSModalDescription>{description}</VSModalDescription> : null}
        </VSModalHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const value = values[field.name] ?? "";

            return (
              <label
                key={field.name}
                className={`block text-sm font-medium ${field.half ? "" : "sm:col-span-2"}`}
              >
                {field.label}

                {field.type === "textarea" ? (
                  <VSTextarea
                    className="mt-2"
                    rows={4}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={value}
                    onChange={(event) => set(field.name, event.target.value)}
                  >
                    <option value="">Select…</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <VSInput
                    className="mt-2"
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                )}
              </label>
            );
          })}
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <VSModalFooter className="gap-2">
          {footerExtra}

          <VSButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </VSButton>

          <VSButton onClick={handleSubmit}>{submitLabel}</VSButton>
        </VSModalFooter>
      </VSModalContent>
    </VSModal>
  );
}
