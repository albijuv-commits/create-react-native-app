import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl text-center font-bold select-none " +
  "transition-[color,background-color,border-color,transform,filter] duration-150 ease-out active:scale-[0.97] " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110 active:brightness-95",
  secondary: "border-2 border-primary text-primary bg-surface hover:bg-primary-soft",
  ghost: "text-primary hover:bg-primary-soft",
  danger: "bg-red text-on-red hover:brightness-110 active:brightness-95",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-2 text-body",
  lg: "min-h-14 px-6 py-3 text-heading",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: StyleProps & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

/** Link interno con l'aspetto di un pulsante. */
export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...rest
}: StyleProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

/** Ancora esterna (tel:, mailto:, siti) con l'aspetto di un pulsante. */
export function ButtonAnchor({
  variant,
  size,
  icon,
  className,
  children,
  ...rest
}: StyleProps & ComponentProps<"a">) {
  return (
    <a className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </a>
  );
}
