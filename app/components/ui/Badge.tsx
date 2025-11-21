import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className = "",
  variant = "default",
  size = "sm",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-orange-100 text-orange-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-xs font-semibold rounded",
    md: "px-3 py-1.5 text-sm font-semibold rounded-md",
  };

  return (
    <span className={`inline-block ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
