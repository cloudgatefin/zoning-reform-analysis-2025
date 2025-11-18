import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-[var(--radius-md)] text-base font-medium transition-colors cursor-pointer";

  const variantStyles = {
    primary: "bg-[var(--accent-blue)] text-white hover:bg-blue-700",
    secondary: "bg-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--border-hover)]",
    ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--border-default)]",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
