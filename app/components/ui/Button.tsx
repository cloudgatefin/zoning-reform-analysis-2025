import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-60' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
