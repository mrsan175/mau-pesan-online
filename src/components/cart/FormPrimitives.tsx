// Shared form primitives for cart/page — uses shadcn

import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-extrabold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ id, label, required, icon, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function inputClass(hasError: boolean) {
  return cn(
    "w-full px-4 py-3 bg-background border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
    hasError
      ? "border-destructive focus:ring-destructive/30"
      : "border-border focus:ring-orange-500/40 focus:border-orange-400"
  );
}
