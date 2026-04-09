"use client";

import Link from "next/link";
import { ReactNode } from "react";

/**
 * Interface representing the props for the Button component.
 */
type ButtonProps = {
  /** Content to be displayed inside the button */
  children: ReactNode;

  /** Optional URL. If provided, the component renders a Next.js Link */
  href?: string;

  /** Click event handler (only applies when rendering a button) */
  onClick?: () => void;

  /** Optional element displayed to the left of the content (e.g., icon) */
  iconLeft?: ReactNode;

  /** Visual style variant of the button */
  variant?: "primary" | "outline" | "ghost";

  /** Size of the button */
  size?: "sm" | "md" | "lg";

  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";

  /** Additional CSS classes for custom styling */
  className?: string;
};

/**
 * Reusable Button component.
 *
 * This component conditionally renders either a native <button> element
 * or a Next.js <Link> component based on the presence of the `href` prop.
 * It supports multiple visual variants, sizes, and optional icons.
 *
 * @example
 * // Default button
 * <Button onClick={() => console.log("Clicked")}>
 *   Click me
 * </Button>
 *
 * @example
 * // Link button
 * <Button href="/about" variant="outline">
 *   Go to About
 * </Button>
 *
 * @example
 * // Button with icon
 * <Button iconLeft={<Icon />} size="lg">
 *   With icon
 * </Button>
 */
export default function Button({
  children,
  href,
  onClick,
  iconLeft,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
}: ButtonProps) {
  /**
   * Base styles applied to all button variants.
   */
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200";

  /**
   * Style definitions for each variant.
   */
  const variants = {
    primary: `
      bg-[var(--color-bg-brand-primary)] 
      text-[var(--color-text-neutral-inverse-primary)] 
      hover:bg-[var(--color-azul-700)]
    `,
    outline: `
      border border-[var(--color-border-neutral-primary, var(--color-gray-400))] 
      bg-transparent 
      text-[var(--color-text-neutral-primary)] 
      hover:bg-[var(--color-bg-neutral-tertiary)]
    `,
    ghost: `
      bg-transparent 
      text-[var(--color-text-neutral-primary)] 
      hover:bg-[var(--color-bg-neutral-tertiary)]
    `,
  };

  /**
   * Style definitions for each size.
   */
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  /**
   * Computed class string combining base, variant, size, and custom styles.
   */
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  /**
   * If `href` is provided, render as a Next.js Link.
   */
  if (href) {
    return (
      <Link href={href} className={classes}>
        {iconLeft}
        <span>{children}</span>
      </Link>
    );
  }

  /**
   * Otherwise, render as a standard HTML button.
   */
  return (
    <button type={type} onClick={onClick} className={classes}>
      {iconLeft}
      <span>{children}</span>
    </button>
  );
}