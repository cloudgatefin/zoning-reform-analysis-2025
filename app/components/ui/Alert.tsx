import React from "react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
}

export function Alert({
  children,
  className = "",
  variant = "info",
  title,
}: AlertProps) {
  const variantStyles = {
    info: "bg-blue-50 border-l-4 border-blue-500 text-blue-800",
    success: "bg-green-50 border-l-4 border-green-500 text-green-800",
    warning: "bg-orange-50 border-l-4 border-orange-500 text-orange-800",
    danger: "bg-red-50 border-l-4 border-red-500 text-red-800",
  };

  return (
    <div className={`p-4 rounded-r-lg ${variantStyles[variant]} ${className}`}>
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default Alert;
